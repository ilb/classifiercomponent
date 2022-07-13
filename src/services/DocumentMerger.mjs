import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import im from 'imagemagick';
import { promisify } from "util";

const convert = promisify(im.convert);

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

    await convert([...files, tempPath]);
    const mergedFile = fs.readFileSync(tempPath);

    if (!mergePath) {
      this.removeResultFile(tempPath);
    }

    return mergedFile;
  }

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
