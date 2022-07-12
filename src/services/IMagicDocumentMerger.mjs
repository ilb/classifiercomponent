import im from 'imagemagick';
import DocumentMerger from './DocumentMerger.mjs';
import fs from 'fs';
import { promisify } from "util";

const convert = promisify(im.convert);

export default class IMagicDocumentMerger extends DocumentMerger {
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
}
