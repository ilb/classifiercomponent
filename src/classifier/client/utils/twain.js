let listenerRegistered = null;
let callback = null;
let id = null;

export const registerTwain = (onUpload, fileId) => {
  callback = onUpload;
  const frame = document.getElementById('popup_iframe');
  const chain = frame && frame.contentDocument.getElementById('thumbnail_chain');

  if (chain && (!listenerRegistered || id !== fileId)) {
    chain.removeEventListener('DOMNodeInserted', getFile);
    chain.addEventListener('DOMNodeInserted', getFile);
    listenerRegistered = true;
    id = fileId;
    return true;
  }

  return false;
};

const getFile = (event) => {
  let elements = getElements(event);
  let image = elements ? getImage(elements) : null;

  if (image) {
    srcToFile(image).then((file) => {
      callback(file);
      clearChain();
    });
  }
};

const getElements = (event) => {
  const frame = document.getElementById('popup_iframe');
  if (!(frame && event.target.outerHTML)) return;

  return frame.contentDocument.getElementsByTagName('img');
};

const getImage = (elements) => {
  for (let img of elements) {
    const src = img.getAttribute('src');
    if (src) {
      return src;
    }
  }
};

const srcToFile = (src) => {
  return fetch(src)
    .then(function (res) {
      return res.arrayBuffer();
    })
    .then(function (buf) {
      return new File([buf], 'document.png', { type: 'image/png' });
    });
};

const clearChain = () => {
  let frame = document.getElementById('popup_iframe');
  let foo = frame.contentDocument.getElementById('thumbnail_chain');
  while (foo.firstChild) foo.removeChild(foo.firstChild);
};
