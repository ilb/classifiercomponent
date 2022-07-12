import lowerBound from './lower-bound.mjs';

function shallowEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  // if (keys1.length !== keys2.length) {
  //   return false;
  // }

  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }

  return true;
}

export default class PriorityQueueEx {
  constructor() {
    Object.defineProperty(this, '_queue', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
  }
  enqueue(run, options) {
    var _a;
    options = {
      priority: 0,
      ...options
    };
    const element = {
      run,
      ...options
    };
    // console.log({ element });
    if (
      this.size &&
      ((_a = this._queue[this.size - 1]) === null || _a === void 0 ? void 0 : _a.priority) >=
        options.priority
    ) {
      this._queue.push(element);
      return;
    }
    const index = lowerBound(this._queue, element, (a, b) => b.priority - a.priority);
    this._queue.splice(index, 0, element);
  }
  dequeue() {
    const item = this._queue.shift();
    return item === null || item === void 0 ? void 0 : item.run;
  }
  filter(options) {
    // console.log({ options });
    return this._queue
      .filter((element) => shallowEqual(options, element))
      .map((element) => element.run);
  }
  get size() {
    return this._queue.length;
  }
}
//