import fs from 'fs';

/**
 * Удаление временной папки которая остается после того как все файлы из нее переместили в документы
 *
 * @param files
 * @param basePath
 */
export const removeTempFolder = (files, basePath) => {
  if (Object.keys(files).length) {
    const path = files[0].path;
    const startIndex = path.indexOf('/temp/') + 6;
    const folderUuid = path.substr(startIndex, 36);
    const folderPath = `${basePath}/temp/${folderUuid}`;

    if (fs.existsSync(folderPath)) {
      fs.rmdirSync(folderPath);
    }
  }
};


/**
 * Вернет true если path - валидный URL
 *
 * @param string
 * @returns {boolean}
 */
export const isURL = (string) => {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

/**
 * Вернет true если string - валидный uuidv4
 *
 * @param string
 * @return {*}
 */
export const isUuid = (string) => {
  return string.match(new RegExp(/^[\dA-F]{8}-[\dA-F]{4}-4[\dA-F]{3}-[89AB][\dA-F]{3}-[\dA-F]{12}$/i));
}

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
    chunks.push(arr.slice(i, i += length));
  }

  return chunks;
}

/**
 * Перебирает classifies и заменяет на OTHER все классы не содержащиеся в availableClasses
 *
 * @param classifies
 * @param availableClasses
 * @return {*}
 */
export const prepareClassifies = (classifies, availableClasses) => {
  return classifies.map(pageClass => availableClasses.includes(pageClass) ? pageClass : 'OTHER');
}

/**
 * @param {object} file
 * @param {string} dossierPath
 */
export const getFilePath = (file, dossierPath) => {
  return file.path.replace(dossierPath + '/', '');
}