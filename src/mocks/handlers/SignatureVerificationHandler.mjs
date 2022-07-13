import Handler from '../../dossier/core/Handler.mjs';
import UploadedEvent from '../../dossier/events/UploadedEvent.mjs';
import Errors from '../../../src/util/Errors.mjs';
import marks from '../../../src/services/signatureDetector/marks.mjs';

export default class SignatureVerificationHandler extends Handler {
  events() {
    return [UploadedEvent];
  }

  /**
   * @param {UploadedEvent|OutsideMovedEvent} event
   * @param {any} signatureDetectorGate
   * @returns {Promise<void>}
   */
  async init({ document, documentTo }, { signatureDetectorGate }) {
    this.document = document;
    this.signatureDetectorGate = signatureDetectorGate;
  }

  /**
   * @returns {Promise<boolean>}
   */
  async filter() {
    if (this.document.code === 'KREDITNYY_DOGOVOR' && this.document.getCountPages() === 6) {
      return true;
    }

    if (this.document.code === 'ZAYAVLENIYA_BROKER' && this.document.getCountPages() === 4) {
      return true;
    }

    return false;
  }

  /**
   * @returns {Promise<void>}
   */
  async process() {
    const result = await this.signatureDetectorGate.checkSignatures(this.document)
    const missed = this.getMissedInfo(result);
    missed.totalMissed && this.processError(missed.info)
  }

  /**
   * Форматирование ответа сервиса
   *
   * @param {{number: int, signatures: {detected: boolean}[]}[]} data
   * @returns {{totalMissed: number, info: {number:int, count:int}[]}}
   */
  getMissedInfo(data) {
    let totalMissed = 0;

    const info = data.reduce((prev, cur, i) => {
      const missed = {
        number: cur.number,
        count: cur.signatures.filter(signature => !signature.detected).length,
        description: marks[this.document.code]
          .find(doc => doc.number === cur.number).signatures
          .map((signature, i) => !cur.signatures[i].detected ? signature.description : null)
          .filter(signature => signature)
          .join('\n')
      }

      if (missed.count) {
        prev.push(missed)
        totalMissed += missed.count
      }

      return prev;
    }, [])

    return { totalMissed, info }
  }

  /**
   * Составление текста исключения и его генерация.
   *
   * @param {{number:int, count:int}[]} missedInfo
   */
  processError(missedInfo) {
    throw Errors.info(missedInfo, 'signatureError');
  }
}
