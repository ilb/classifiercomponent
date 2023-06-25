import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Poppler } from 'node-poppler';
import im from 'imagemagick';
import { promisify } from 'util';
import sharp from 'sharp';

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
  const objectToResize = await getImageSize(files);
  for (const file of objectToResize.arrToResize) {
    sharp(file.path)
      .resize({
        width: objectToResize.width,
        height: objectToResize.height
      })
      .toBuffer((err, buffer) => {
        fs.writeFile(file.path, buffer, () => {});
      });
  }
};

export const getImageSize = async (files) => {
  const objectToResize = {
    width: 0,
    height: 0,
    arrToResize: []
  };
  for (const file of files) {
    const infoPage = await sharp(file.path).metadata();
    objectToResize.arrToResize.push({
      width: infoPage.width,
      height: infoPage.height,
      path: file.path
    });
    if (objectToResize.width < infoPage.width) {
      objectToResize.width = infoPage.width;
    }
    if (objectToResize.height < infoPage.height) {
      objectToResize.height = infoPage.height;
    }
  }
  objectToResize.arrToResize = objectToResize.arrToResize.filter(
    (pageInfo) =>
      !(objectToResize.width === pageInfo.width && objectToResize.height === pageInfo.height)
  );
  return objectToResize;
};

//https://github.com/jshttp/mime-db/pull/291 когда выложат , нужно будет обновить библиотеку и убрать данную функию
export const jfifToJpeg = async (req, res, next) => {
  req.files = await req.files?.reduce(async (accumulator, file) => {
    const files = await accumulator;
    if (/\.jfif$/.test(file.originalname)) {
      const jpegOutput = `${file.destination}/${file.filename.split('.')[0]}.jpg`;
      fs.renameSync(file.path, jpegOutput);
      return [
        ...files,
        {
          ...file,
          originalname: file.originalname.replace('.jfif', '.jpg'),
          filename: file.filename.replace('.jfif', '.jpg'),
          path: jpegOutput
        }
      ];
    } else {
      return [...files, file];
    }
  }, []);
  next();
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

//проверка на пустой лист перенести в docier как подключу его новый
export const checkEmptyList = async (req, res, next) => {
  const convert = promisify(im.convert);
  req.files = await req.files?.reduce(async (accumulator, file) => {
    // Задаем параметры для вывода в avr
    const files = await accumulator;
    const colorSpace = 'sRGB';
    const size = '100x100';
    const format = '%[pixel:u]';
    const outputFormat = 'txt';

    const options = [
      file.path,
      '-colorspace',
      colorSpace,
      '-scale',
      size,
      '-depth',
      '8',
      '-format',
      format,
      outputFormat + ':-'
    ];

    const result = await convert(options);

    const lines = result.trim().split('\n').slice(1);
    //разбить текст на объект для удобной работы с ним
    const objectsAvg = lines.map((line) => {
      const [xy, color] = line.split(': ');
      const [x, y] = xy.split(',');
      const [rgb, hex, name] = color.split('  ');

      return {
        x: parseInt(x),
        y: parseInt(y),
        color: {
          r: parseInt(rgb.slice(1, 4)),
          g: parseInt(rgb.slice(5, 8)),
          b: parseInt(rgb.slice(9, 12)),
          name: name,
          hex: hex
        }
      };
    });

    const counters = {};
    let maxCount = 0;
    // получить количество цвета в %
    for (let obj of objectsAvg) {
      const name = obj.color.name;
      counters[name] = (counters[name] || 0) + 1; // увеличиваем счетчик
      if (counters[name] > maxCount) {
        // обновляем максимальное значение
        maxCount = counters[name];
      }
    }

    const maxCountPercent = maxCount / (objectsAvg.length / 100);

    if (maxCountPercent > 99) {
      fs.unlinkSync(file.path);
      return [...files];
    } else {
      return [...files, file];
    }
  }, []);
  next();
};
