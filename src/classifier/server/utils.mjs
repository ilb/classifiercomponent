/**
 * Разбиение одного массива на несколько по length элементов
 *
 * @param arr
 * @param length
 * @return {[]}
 */
export const chunkArray = (arr, length) => {
  let chunks = [];
  let i = 0;
  let n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, (i += length)));
  }

  return chunks;
};

/**
 * Перебирает classifies и заменяет на other все классы не содержащиеся в availableClasses
 *
 * @param classifies
 * @param availableClasses
 * @return {*}
 */
export const prepareClassifies = (classifies, availableClasses) => {
  return classifies.map((code) => (availableClasses.includes(code) ? code : 'otherDocuments'));
};

export const timeoutPromise = async (promise, err, timeout) => {
  return new Promise(function (resolve, reject) {
    promise.then(resolve, reject);
    setTimeout(reject.bind(null, err), timeout * 1000);
  });
};

/**
 * @param {string|null|undefined|boolean} value
 * @returns {boolean|undefined}
 */
export const parseBool = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === 'undefined' ||
    value === 'null' ||
    value === ''
  ) {
    return undefined;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  throw new Error('Incorrect bool value: ' + value);
};
