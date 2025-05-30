import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import im from 'imagemagick';
import { promisify } from "util";
import Sharp from 'sharp';
const convert = promisify(im.convert);
const resize = promisify(im.resize);

export default class DocumentMerger {
  /**
   * @param {string} dossierPath
   */
  constructor(dossierPath) {
    this.dossierPath = dossierPath;
  }

  /**
   * files может быть массовом путей к файлам, которые нужно смерджить,
   * либо строкой вида /path/to/folder/*.{jpg,jpeg,png}
   *
   * mergePath должен передаваться только в том случае если смердженный файл должен остаться в файловой системе.
   * Если mergePath не передан, смердженный файл будет удален.
   *
   * Функция должна возвращать буффер смердженного файла
   *
   * @param files {string|array}
   * @param mergePath {string|null}
   * @returns {Buffer}
   */
  /**
   * Конвертирование одной или нескольких картинок в один pdf файл
   *
   * @param files {string|array[string]} - путь к файлу (или массив путей)
   * @param mergePath {string|null} - куда будет сохранен pdf
   * @returns {Buffer}
   */
  async merge(files, mergePath = null) {
    let tempPath = mergePath || this.generateTempPath();

    if (typeof files === 'string') {
        files = [files]
    }
    await this.resizePage(files)
    await convert([...files, '-density', '72', tempPath]);
    const mergedFile = fs.readFileSync(tempPath);
  
    if (!mergePath) {
      this.removeResultFile(tempPath);
    }
    return mergedFile;

  }

  async resizePage (files) {
    const objectToResize = await  this.getImageSize(files);
    for (const file of objectToResize.arrToResize) {
      await resize({
        srcPath: file.path,
        dstPath: file.path,
        width: objectToResize.width,
        height: objectToResize.height,
      });
    }
  };
  

  async getImageSize (files){
    const objectToResize = {
      width: 0,
      height: 9999,
      arrToResize: []
    };
    for (const file of files) {
      const infoPage = await  Sharp(file).metadata();
      objectToResize.arrToResize.push({
        width: infoPage.width,
        height: infoPage.height,
        path: file
      });
      if (objectToResize.height > infoPage.height) {
        objectToResize.height = infoPage.height;
        objectToResize.width = infoPage.width;
      }
    }
    objectToResize.arrToResize = objectToResize.arrToResize.filter(
      (pageInfo) =>
        !(objectToResize.width === pageInfo.width && objectToResize.height === pageInfo.height)
    );
    return objectToResize;
  };

  generateTempPath() {
    const tempDir = this.dossierPath + '/temp/';

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    return tempDir + uuidv4() + '.pdf'
  }

  removeResultFile(path) {
     fs.unlinkSync(path);
  }
}
