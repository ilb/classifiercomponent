export default class Page {
  /**
   * @param {object} file
   */
  constructor(file) {
    this.uri = file.path;
    this.name = file.filename;
    this.originalName = file.originalname;
    this.uuid = file.filename.split('.')[0];
    this.size = file.size;
    this.extension = file.filename.split('.').pop();
    this.mimeType = file.mimetype;
  }
}
