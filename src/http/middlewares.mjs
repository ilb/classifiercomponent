import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Poppler } from 'node-poppler';
import im from 'imagemagick';
import { promisify } from 'util';

export const uploadMiddleware = multer({
  limits: {
    fileSize: process.env['apps.classifier.filesize']
      ? process.env['apps.classifier.filesize'] * 1024 * 1024
      : 30 * 1024 * 1024
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const destination =
        process.env.DOSSIER_DOCUMENT_PATH + '/dossier/' + req.params.uuid + '/pages';

      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
      }

      return cb(null, destination);
    },
    filename: (req, file, cb) => {
      return cb(null, uuidv4() + '.' + file.originalname.split('.').pop());
    }
  })
});

export const splitPdf = async (req, res, next) => {
  req.files = await req.files?.reduce(async (accumulator, file) => {
    const files = await accumulator;
    if (file.mimetype === 'application/pdf') {
      const poppler = new Poppler(process.env.POPPLER_BIN_PATH);
      const splitOutputPath = `${file.destination}/${file.filename.split('.')[0]}`;
      fs.mkdirSync(splitOutputPath);
      await poppler.pdfToCairo(file.path, `${splitOutputPath}/${file.originalname.split('.')[0]}`, {
        jpegFile: true
      });
      let pages = fs.readdirSync(splitOutputPath);

      pages = pages.map((page) => {
        const filename = `${uuidv4()}.jpg`;
        const path = `${file.destination}/${filename}`;
        fs.renameSync(`${splitOutputPath}/${page}`, path);

        return { path, filename, mimetype: 'image/jpeg' };
      });

      fs.unlinkSync(file.path);
      fs.rmdirSync(splitOutputPath);
      await resizePage(pages);
      return [...files, ...pages];
    } else {
      return [...files, file];
    }
  }, []);
  next();
};

export const resizePage = async (files) => {
  const size = await getImageSize(files);
  const resize = promisify(im.resize);
  for (const file of files) {
    await resize({
      srcPath: file.path,
      dstPath: file.path,
      width: size.width,
      height: size.height
    });
  }
};

export const getImageSize = async (files) => {
  let width = 0;
  let height = 0;

  for (const file of files) {
    const identify = promisify(im.identify);
    const infoPage = await identify(file.path);

    if (width < infoPage.width) {
      width = infoPage.width;
    }
    if (height < infoPage.height) {
      height = infoPage.height;
    }
  }
  return { width, height };
};

export const convertToJpeg = async (req, res, next) => {
  const convert = promisify(im.convert);
  req.files = await req.files?.reduce(async (accumulator, file) => {
    const files = await accumulator;
    if (['image/bmp', 'image/tiff', 'image/heic'].includes(file.mimetype)) {
      const jpegOutput = `${file.destination}/${file.filename.split('.')[0]}.jpg`;
      await convert([file.path, '-format', 'jpg', jpegOutput]);
      fs.unlinkSync(file.path);
      return [
        ...files,
        {
          mimetype: 'image/jpeg',
          path: jpegOutput
        }
      ];
    } else {
      return [...files, file];
    }
  }, []);
  next();
};
