import SignatureVerificationHandler from '../handlers/SignatureVerificationHandler.mjs';

export default class EventFactory {
  #handlers = [
    SignatureVerificationHandler,
  ]

  constructor(scope) {
    this.scope = scope;
  }

  build() {
    for (let handler of this.#handlers) {
      new handler(this.scope);
    }
  }
}