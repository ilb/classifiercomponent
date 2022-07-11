// import Document from '../Document.mjs';
// import Page from '../Page.mjs';
// import fs from 'fs';
// const shell = require('child_process').execSync;
// const testPath = 'libs/classifier/server/core/__test__';
//
// beforeEach(() => {
//   const src = `${testPath}/documents_example`;
//   const dist = `${testPath}/documents`;
//   //
//   shell(`mkdir -p ${dist}`);
//   shell(`cp -r ${src}/* ${dist}`);
// });
//
// afterEach(async () => {
//   fs.rmSync(`${testPath}/documents`, { recursive: true, force: true });
// });
//
// const uuid = '1c7b79b4-f36c-46ff-83c8-dd1206228543';
// const documentClass = 'PASPORT';
// const basePath = `${testPath}/documents`;
// const pages = [
//   new Page(
//     `1c7b79b4-f36c-46ff-83c8-dd1206228543/PASPORT/1#584d610c-e271-44df-8439-b3b14bc82757.jpg`
//   ),
//   new Page(
//     `1c7b79b4-f36c-46ff-83c8-dd1206228543/PASPORT/2#f6b2a2d0-130b-48dc-be67-ae599f5d7c3d.jpg`
//   ),
//   new Page(
//     `1c7b79b4-f36c-46ff-83c8-dd1206228543/PASPORT/3#01adffe3-1b38-49f0-934d-7e5c173af97b.jpg`
//   )
// ];
//
// test('Document initialization', async () => {
//   const document = new Document({ uuid, documentClass, pages, basePath });
//
//   expect(document.uuid).toEqual(uuid);
//   expect(document.documentClass).toEqual(documentClass);
//   expect(document.basePath).toEqual(basePath);
//   expect(document.path).toEqual('1c7b79b4-f36c-46ff-83c8-dd1206228543/PASPORT');
//   expect(document.fullPath).toEqual(
//     `${testPath}/documents/1c7b79b4-f36c-46ff-83c8-dd1206228543/PASPORT`
//   );
//   expect(document.getPages()).toEqual(pages);
//   expect(document.getMimeType()).toEqual('application/pdf');
//   expect(document.isImages()).toEqual(true);
//   expect(document.getCountPages()).toEqual(3);
//   expect(document.getPage(1)).toEqual(pages[0]);
//   expect(document.getPageByUuid('f6b2a2d0-130b-48dc-be67-ae599f5d7c3d')).toEqual(pages[1]);
//   expect(
//     document.getPagesByUuids([
//       'f6b2a2d0-130b-48dc-be67-ae599f5d7c3d',
//       '01adffe3-1b38-49f0-934d-7e5c173af97b'
//     ])
//   ).toEqual(pages.slice(1));
// });
//
// test('Adding a page', async () => {
//   const document = new Document({ uuid, documentClass, pages, basePath });
//   const addedPage = new Page('pages/1#11adffe3-1b38-49f0-934d-7e5c173af97b.jpg');
//   await document.addPage(addedPage);
//
//   expect(document.getCountPages()).toEqual(4);
//   expect(document.getPage(4)).toEqual(addedPage);
// });
//
// // test('Page move', async () => {
// //   const document = new Document({ uuid, documentClass, pages, basePath });
// //   console.log(document);
// //   await document.movePage(3, 1);
// //   console.log(document);
// //
// //   expect(document.getPage(1)).toEqual(pages[2]);
// //   expect(document.getPage(2)).toEqual(pages[0]);
// //   expect(document.getPage(3)).toEqual(pages[1]);
// // });
