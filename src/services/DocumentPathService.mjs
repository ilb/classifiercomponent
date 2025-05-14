import node_path from 'path';
import fs from 'fs';

export default class DocumentPathService {
  /**
   * @param {DocumentPathRepository} documentPathRepository
   */
  constructor({ documentPathRepository }) {
    this.repository = documentPathRepository;
  }

  async getPath(uuid) {
    let path = await this.repository.getPathByUuid(uuid);

    // Удалить этот кусок после выкладки на прод.
    // Он нужен для того, чтобы корректно загружались файлы в промежутке между
    // выкладкой и запуском скрипта, который спарсит текущую структуру папок в БД
    if (!path) {
      let deprecatedPath = await this.getDeprecatedPath(uuid);

      if (deprecatedPath) {
        path = uuid;
        await this.repository.storePath(uuid, path);
      }
    }
    //

    if (!path) {
      path = this.generatePath(uuid);
      await this.repository.storePath(uuid, path);
    }

    return path;
  }

  generatePath(uuid) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}/${uuid}`;
  }

  async getDeprecatedPath(uuid) {
    const path = node_path.join(`${process.env.DOSSIER_DOCUMENT_PATH}/dossier`, uuid);

    return fs.existsSync(path) ? path : null;
  }
}
