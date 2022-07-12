import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

export default class DocumentMerger {
  /**
   * @param {string} dossierPath
   */
  constructor({ dossierPath }) {
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
  merge(files, mergePath = null) {}

  generateTempPath() {
    return this.dossierPath + '/temp/' + uuidv4() + '.pdf'
  }

  removeResultFile(path) {
    fs.unlinkSync(path);
  }
}
