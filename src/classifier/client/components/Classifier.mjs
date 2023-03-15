import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import SortableGallery from './gallery/SortableGallery';
import UploadDropzone from './UploadDropzone';
import Menu from './menu/Menu';
import { useDocuments, useTasks } from '../hooks';
import { registerTwain } from '../utils/twain';
import { compress } from '../utils/compressor.js';
import Dimmable from './elements/Dimmable.js';
import Loader from './elements/Loader.js';
import ListGallery from './gallery/ListGallery.js';
import ListMenu from './menu/ListMenu.js';

const Classifier = forwardRef(
  (
    {
      form,
      uuid,
      onInit,
      onUpdate,
      onRemove,
      onChange,
      onChangeTab,
      onDrag,
      name,
      showError,
      schema,
      dossierUrl,
      hiddenTabs = [],
      readonlyClassifier = null,
      defaultTab = 'classifier',
      withViewTypes = false,
      defaultViewType = 'grid',
    },
    ref,
  ) => {
    const [classifier, setClassifier] = useState(schema.classifier);
    const { tasks } = useTasks(uuid);
    const {
      documents,
      mutateDocuments,
      correctDocuments,
      revalidateDocuments,
      classifyDocument,
      deletePage,
      uploadPages,
    } = useDocuments(uuid, dossierUrl);
    const [documentsTabs, setDocumentsTabs] = useState(schema.tabs);
    const [selectedTab, selectTab] = useState({});
    const [clonedItems, setClonedItems] = useState(null);
    const [draggableOrigin, setDraggableOrigin] = useState(null);
    const [activeDraggable, setActiveDraggable] = useState(null);
    const [countStartedTasks, setCountStartedTasks] = useState(0);
    const [dragFrom, setDrugFrom] = useState();
    const [prev, setPrev] = useState(null);
    const [pageErrors, setPageErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState(defaultViewType);

    useImperativeHandle(ref, () => ({
      changeSelectedTab(type) {
        const tab = documentsTabs.find((tab) => tab.type === type);
        if (tab) {
          selectTab(tab);
        }
      },
    }));

    useEffect(() => {
      if (!documentsTabs.find((tab) => tab.type === selectedTab?.type)) {
        selectTab(getSelectedTab());
      }
    }, [documentsTabs]);

    useEffect(() => {
      if (!prev && Object.keys(documents).length) {
        onInit && onInit(documents);
        setPrev(documents);
      }
    }, [documents]);

    useEffect(() => {
      onChangeTab && onChangeTab(selectedTab);
    }, [selectedTab.type]);

    useEffect(() => {
      setClassifier(schema.classifier);
      setDocumentsTabs(schema.tabs);
    }, [schema]);

    const selectedDocument =
      selectedTab?.type !== 'classifier'
        ? documents[selectedTab?.type]
          ? documents[selectedTab?.type]
          : []
        : [];
    const finishedTasks = tasks.filter(({ status }) => status.code === 'FINISHED');
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(MouseSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      }),
    );

    if (readonlyClassifier !== null) {
      classifier.readonly = readonlyClassifier;
    }

    function getSelectedTab() {
      if (defaultTab === 'classifier') {
        if (schema.classifier.disabled) {
          return documentsTabs[0];
        }

        return { type: 'classifier' };
      }

      const tab = documentsTabs.find((tab) => tab.type === defaultTab);

      return tab || { type: null };
    }

    /**
     * Добавление документов в форму
     */
    useEffect(() => {
      const uniformDocuments = {};

      for (const type in documents) {
        if (documents[type].length) {
          uniformDocuments[type] = documents[type];
        }
      }

      Object.keys(documents).length && onChange && onChange(uniformDocuments);
    }, [documents, form]);

    useEffect(() => {
      const processTasks = tasks.filter(
        ({ status }) => status.code === 'STARTED' || status.code === 'IN_QUEUE',
      );
      setCountStartedTasks(processTasks.length);
    }, [tasks]);

    useEffect(() => {
      const documents = revalidateDocuments();
      if (Object.entries(documents).length) {
        if (prev && onUpdate) {
          for (const type in documents) {
            if (prev[type].length !== documents[type].length) {
              const tab = documentsTabs.find((tab) => tab.type === type);

              !['unknown', 'classifier'].includes(tab.type) && onUpdate(tab, documents);
            }
          }
        }

        setPrev(documents);
      }
    }, [finishedTasks.length]);

    useEffect(() => {
      const interval = setInterval(() => setTwainHandler() && clearInterval(interval), 1000);
    }, []);

    useEffect(() => {
      setTwainHandler();
    }, [selectedTab]);

    useEffect(() => {
      if (documents[selectedTab.type]?.length === 0) {
        setView('grid');
      }
    }, [selectedTab]);

    useEffect(() => {
      selectTab(getSelectedTab());
    }, [uuid]);

    const setTwainHandler = () => {
      return registerTwain((file) => file && handleDocumentsDrop([file]), selectedTab?.type);
    };

    const findContainer = (id) => {
      if (id in documents) {
        return id;
      }

      if (typeof id === 'object') {
        id = id.path;
      }

      return Object.keys(documents).find((key) => documents[key].find((item) => item.path === id));
    };

    const onDragCancel = () => {
      if (clonedItems) {
        // Reset items to their original state in case items have been
        // dragged across containrs
        mutateDocuments(clonedItems, false);
      }

      setActiveDraggable(null);
      setClonedItems(null);
      setDraggableOrigin(null);
    };

    const handleDocumentsDrop = async (acceptedFiles) => {
      if (!acceptedFiles.length) {
        return showError('Файл выбранного типа не доступен для загрузки.');
      }

      if (!selectedTab) return;

      if (selectedTab.type === 'classifier') {
        !countStartedTasks && setCountStartedTasks(-1);
        const availableClasses = documentsTabs
          .filter((tab) => !tab.readonly)
          .map((tab) => tab.type);
        const compressedFiles = acceptedFiles; //await compressFiles(acceptedFiles);
        classifyDocument(uuid, compressedFiles, availableClasses, dossierUrl).then(
          revalidateDocuments,
        );
      } else {
        setLoading(true);
        const compressedFiles = acceptedFiles; //await compressFiles(acceptedFiles);
        uploadPages(uuid, selectedTab.type, compressedFiles, dossierUrl)
          .then(async (result) => {
            const documents = await revalidateDocuments();
            onUpdate && onUpdate(selectedTab, documents);
            setPrev(documents);
            result.error && processError(result.error, documents);
          })
          .finally(() => setLoading(false));
      }
    };

    const compressFiles = async (files) => {
      return Promise.all(
        files.map(async (file, index) => {
          if (file.type.includes('image/')) {
            return compress(file, 500, Infinity, 1000, 0.9).then((blob) => {
              return new File([blob], file.name, { type: file.type });
            });
          } else {
            return file;
          }
        }),
      );
    };

    const processError = (error, documents) => {
      console.log(error, documents);
      alert('При загрузке документа произошла ошибка');
      // if (error?.description?.type === 'signatureError') {
      //   addPagesErrors(error.description.info, documents);
      //   toast({
      //     type: 'info',
      //     title: error.description.info
      //   });
      // } else {
      //   toast({
      //     type: 'error',
      //     title: error.description
      //   });
      // }
    };

    // const addPagesErrors = (errors, documents) => {
    //   setPageErrors({
    //     ...pageErrors,
    //     ...errors.reduce((acc, { number, count, description }) => {
    //       acc[documents[selectedTab.type][number - 1].uuid] = { count, description };
    //
    //       return acc;
    //     }, [])
    //   });
    // };

    const handlePageDelete = async (pageSrc) => {
      const activeContainer = findContainer(pageSrc);
      const newDocumentsList = {
        ...documents,
        [activeContainer]: documents[activeContainer].filter((item) => item !== pageSrc),
      };
      mutateDocuments(newDocumentsList, false);
      deletePage(pageSrc).then(async () => {
        onRemove && onRemove(selectedTab, newDocumentsList);
      });
    };

    const onDragStart = ({ active }) => {
      setDrugFrom(selectedTab);
      setActiveDraggable(active);
      setDraggableOrigin({
        container: findContainer(active.id),
        index: active.data.current.sortable.index,
      });
    };

    const onDragEnd = ({ active, over }) => {
      const activeContainer = findContainer(active.id);
      if (!activeContainer) {
        setActiveDraggable(null);
        return;
      }

      const overId = over?.id;

      if (!overId) {
        setActiveDraggable(null);
        return;
      }

      const overContainer = findContainer(overId);

      if (overContainer) {
        const activeIndex = documents[activeContainer].map((item) => item.path).indexOf(active.id);
        let overIndex = documents[overContainer].map((item) => item.path).indexOf(overId);
        if (activeIndex === -1) {
          return;
        }

        if (overIndex === -1) {
          overIndex = documents[overContainer].length - 1;
        }

        if (activeIndex !== overIndex) {
          mutateDocuments(
            {
              ...documents,
              [overContainer]: arrayMove(documents[overContainer], activeIndex, overIndex),
            },
            false,
          );
        }

        if (draggableOrigin.container !== overContainer) {
          correctDocuments(
            [
              {
                from: { class: draggableOrigin.container, page: draggableOrigin.index + 1 },
                to: { class: overContainer, page: overIndex + 1 },
              },
            ],
            dossierUrl,
          );
        } else {
          correctDocuments(
            [
              {
                from: { class: activeContainer, page: activeIndex + 1 },
                to: { class: overContainer, page: overIndex + 1 },
              },
            ],
            dossierUrl,
          );
        }
      }

      setActiveDraggable(null);
      setDraggableOrigin(null);
      onDrag &&
        onDrag(
          documentsTabs.find((tab) => tab.type === dragFrom.type),
          selectedTab,
          documents,
        );
    };

    const onDragOver = ({ active, over }) => {
      const overId = over?.id;

      if (!overId || overId === 'void' || active.id in documents) {
        return;
      }

      if (over && over.data.current.tab) {
        const tab = documentsTabs.find((tab) => tab.type === overId);
        selectTab(tab);
      }

      const overContainer = findContainer(overId);
      const activeContainer = findContainer(active.id);

      if (!overContainer || !activeContainer) {
        return;
      }

      if (activeContainer !== overContainer) {
        const activeItems = documents[activeContainer];
        const overItems = documents[overContainer];
        const overIndex = overItems.map((item) => item.path).indexOf(overId);
        const activeIndex = activeItems.map((item) => item.path).indexOf(active.id);

        let newIndex;

        if (overId in documents) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.offsetTop > over.rect.offsetTop + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }
        const newDocuments = {
          ...documents,
          [activeContainer]: documents[activeContainer].filter((item) => item.path !== active.id),
          [overContainer]: [
            ...documents[overContainer].slice(0, newIndex),
            documents[activeContainer][activeIndex],
            ...documents[overContainer].slice(newIndex, documents[overContainer].length),
          ],
        };

        mutateDocuments(newDocuments, false);
      }
    };

    const changeTab = (_, { name }) => {
      let tab;
      if (name === 'classifier') {
        tab = { type: 'classifier', name: 'Автоматически' };
      } else {
        tab = documentsTabs.find((tab) => tab.type === name);
      }
      selectTab(tab);
    };

    return (
      <div className="dossier classifier">
        <div className="grid gridCentered">
          {view === 'grid' && (
            <>
              <DndContext
                sensors={sensors}
                modifiers={[snapCenterToCursor]}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDragCancel={onDragCancel}>
                <div className="dossier__wrap dossier__wrap__menu dossier__wrap__menu__grid">
                  <Menu
                    withViewTypes={withViewTypes}
                    view={view}
                    onChangeView={setView}
                    uuid={uuid}
                    blocks={schema.blocks}
                    classifier={classifier}
                    name={name}
                    documents={schema.tabs}
                    hiddenTabs={hiddenTabs}
                    selected={selectedTab?.type}
                    onDocumentSelect={changeTab}
                    dossierUrl={dossierUrl}
                  />
                </div>
                <div className="dossier__wrap_preview">
                  {selectedTab && !selectedTab.readonly && (
                    <UploadDropzone
                      onDrop={handleDocumentsDrop}
                      accept={selectedTab.accept}
                      fileType={selectedTab.fileType}
                    />
                  )}
                  <Dimmable>
                    <Loader
                      active={
                        (!!countStartedTasks && selectedTab?.type === 'classifier') || loading
                      }
                      loaderText="Загрузка..."
                    />
                    <SortableGallery
                      pageErrors={pageErrors}
                      tab={selectedTab}
                      srcSet={selectedDocument}
                      onRemove={handlePageDelete}
                      active={activeDraggable}
                    />
                  </Dimmable>
                </div>
              </DndContext>
            </>
          )}
          {view === 'list' && (
            <div className="dossier__wrap dossier__wrap__menu dossier__wrap__menu__list">
              <ListMenu
                withViewTypes={withViewTypes}
                view={view}
                documents={schema.tabs}
                hiddenTabs={hiddenTabs}
                selected={selectedTab?.type}
                onDocumentSelect={changeTab}
                onChangeView={setView}
              />
              {selectedTab && !selectedTab.readonly && (
                <UploadDropzone
                  onDrop={handleDocumentsDrop}
                  accept={selectedTab.accept}
                  fileType={selectedTab.fileType}
                />
              )}
              <ListGallery srcSet={selectedDocument} />
            </div>
          )}
        </div>
      </div>
    );
  },
);

Classifier.displayName = 'Classifier';

export default Classifier;
