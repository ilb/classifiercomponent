import { Page } from 'dossierjs';
import { chunkArray, prepareClassifies } from '../utils.mjs';
import queue from '../../../pqueue/pqueue.mjs';
import DocumentService from '../core/DocumentService.mjs';
import ClassifierGate from '../gates/ClassifierGate.mjs';

export default class ClassifyPages {
  /**
   * @param queue
   * @param {DossierBuilder} dossierBuilder
   * @param {any} verificationService
   * @param {VerificationRepository} verificationRepository
   * @param classifierQuantity
   */
  constructor({
    dossierBuilder,
    verificationService,
    verificationRepository,
    classifierQuantity
  }) {
    this.dossierBuilder = dossierBuilder;
    this.verificationService = verificationService;
    this.classifierGate = new ClassifierGate();
    this.documentService = new DocumentService(dossierBuilder);
    this.verificationRepository = verificationRepository;
    this.classifierQuantity = classifierQuantity;
    // concurrency = 1 чтобы страницы отправлялись на распознавание последовательно,
    // так как для распознавания требуется класс предыдущей распознанной страницы
    this.queue = queue;
    this.queue.concurrency = 1;
  }

  /**
   *
   * @param uuid
   * @param availableClasses
   * @param files
   * @return {Promise<*>}
   */
  async process({ uuid, availableClasses = [], ...files }) {
    const dossier = await this.dossierBuilder.build(uuid);
    const pages = Object.values(files).map((file) => new Page(file));
    let unknownDocument = dossier.getDocument('unknown');
    // сначала переместить все в нераспознанные
    for (const page of pages) {
      await unknownDocument.addPage(page);
    }

    const path = `${uuid}.classification`;
    let verification;
    let currentClassificationResult = [];
    verification = await this.verificationService.add('CLASSIFICATION', path);

    this.queue
      .add(
        async () => {
          const chunks = chunkArray(pages, this.classifierQuantity);
          for (const chunk of chunks) {
            let previousClass;
            await this.verificationService.start(verification);

            if (currentClassificationResult.length) {
              previousClass = currentClassificationResult.pop().code;
            } else {
              const lastFinishedTask = await this.verificationRepository.findLastFinishedByPath(path);
              previousClass = lastFinishedTask?.data?.classifiedPages?.pop().code || null;
            }

            unknownDocument.structure.refresh();
            const unknownPages = unknownDocument.getPagesByUuids(chunk.map(page => page.uuid));
            let classifies = await this.classifierGate.classify(unknownPages, previousClass);

            classifies = prepareClassifies(classifies, availableClasses);
            const classifiedPages = classifies.reduce((acc, current, index) => {
              acc[index] = { code: current, page: chunk[index] };
              return acc;
            }, []);
            unknownDocument.structure.refresh();
            for (const { code, page } of classifiedPages) {
              const unknownPage = unknownDocument.getPageByUuid(page.uuid);
              if (unknownPage) { // страница может быть перемещена пользователем
                const document = dossier.getDocument(code);
                document.structure.refresh();
                await this.documentService.movePage(unknownDocument, unknownPage, document);
              }
            }
            currentClassificationResult = [...currentClassificationResult, ...classifiedPages];
          }
          await this.verificationService.finish(verification, { classifiedPages: currentClassificationResult });
        },
        { path }
      )
      .catch(async (error) => {
        console.error(error);
        this.verificationService.cancel(verification);
      });

    return { path };
  }
}
