import { useEffect, useState } from 'react';
import { Dimmer, Grid, Loader } from 'semantic-ui-react';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';

import SortableGallery from './gallery/SortableGallery';
import UploadDropzone from './UploadDropzone';
import Menu from './menu/Menu';
import { classifyDocument, deletePage, uploadPages, useDocuments, useTasks } from '../hooks';
import { toast } from 'react-semantic-toasts';
import { registerTwain } from '../utils/twain';

const Classifier = ({
  form,
  uuid,
  onUpdate,
  onRemove,
  onChange,
  onDrag,
  name,
  showError,
  schema,
  hiddenTabs = [],
  readonlyClassifier = null,
  defaultTab = 'classifier'
}) => {
  const [classifier, setClassifier] = useState(schema.classifier);
  const { tasks } = useTasks(uuid);
  const { documents, mutateDocuments, correctDocuments, revalidateDocuments } = useDocuments(uuid);
  const [documentsTabs, setDocumentsTabs] = useState(schema.tabs);
  const [selectedTab, selectTab] = useState(getSelectedTab());
  const [clonedItems, setClonedItems] = useState(null);
  const [draggableOrigin, setDraggableOrigin] = useState(null);
  const [activeDraggable, setActiveDraggable] = useState(null);
  const [countStartedTasks, setCountStartedTasks] = useState(0);
  const [dragFrom, setDrugFrom] = useState();
  const [prev, setPrev] = useState(null);
  const [pageErrors, setPageErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setClassifier(schema.classifier);
    setDocumentsTabs(schema.tabs);
  }, [schema]);

  const selectedDocument =
    selectedTab.code !== 'classifier'
      ? documents[selectedTab.code]
        ? documents[selectedTab.code]
        : []
      : [];
  const processTasks = tasks.filter(
    ({ status }) => status.code === 'STARTED' || status.code === 'IN_QUEUE'
  );
  const cancelledTasks = tasks.filter(({ status }) => status.code === 'CANCELLED');
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(MouseSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  if (readonlyClassifier !== null) {
    classifier.readonly = readonlyClassifier;
  }

  function getSelectedTab() {
    if (defaultTab === 'classifier') {
      if (schema.classifier.disabled) {
        return documentsTabs[0];
      }

      return { code: 'classifier' };
    }

    return documentsTabs.find((tab) => tab.code === defaultTab);
  }

  /**
   * Добавление документов в форму
   */
  useEffect(() => {
    const uniformDocuments = {};

    for (const code in documents) {
      if (documents[code].length) {
        uniformDocuments[code] = documents[code];
      }
    }

    Object.keys(documents).length && onChange && onChange(uniformDocuments);
  }, [documents, form]);

  useEffect(async () => {
    setCountStartedTasks(processTasks.length);
    if (Object.entries(documents).length) {
      if (!prev && !['UNKNOWN', 'classifier'].includes(selectedTab.code)) {
        const tab = documentsTabs.find((tab) => tab.code === selectedTab.code);
        tab.count = documents[tab.code].length;
        tab.count && onUpdate && onUpdate(tab, documents);
      }

      if (prev && onUpdate) {
        for (const code in documents) {
          if (prev[code].length !== documents[code].length) {
            const tab = documentsTabs.find((tab) => tab.code === code);
            tab.count = documents[code].length;

            !['UNKNOWN', 'classifier'].includes(tab.code) && onUpdate(tab, documents);
          }
        }
      }

      setPrev(documents);
    }
  }, [processTasks.length, Object.entries(documents).length > 0]);

  function updateSelectedTab() {
    const updated = documentsTabs.find((tab) => tab.code === selectedTab.code);

    selectTab(updated);

    return updated;
  }

  useEffect(async () => {
    setCountStartedTasks(processTasks.length);
  }, [cancelledTasks.length]);

  useEffect(() => {
    const interval = setInterval(() => setTwainHandler() && clearInterval(interval), 1000);
  }, []);

  useEffect(() => setTwainHandler(), [selectedTab]);

  useEffect(() => selectTab(getSelectedTab()), [uuid]);

  useEffect(() => {
    if (classifier.disabled) {
      selectTab(getSelectedTab());
    }
  }, [classifier]);

  const setTwainHandler = () => {
    return registerTwain((file) => file && handleDocumentsDrop([file]), selectedTab.code);
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

    if (selectedTab.code === 'classifier') {
      !countStartedTasks && setCountStartedTasks(-1);
      const availableClasses = documentsTabs.filter((tab) => !tab.readonly).map((tab) => tab.code);
      classifyDocument(uuid, acceptedFiles, availableClasses).then(revalidateDocuments);
    } else {
      setLoading(true);
      uploadPages(uuid, selectedTab.code, acceptedFiles)
        .then(async (result) => {
          const documents = await revalidateDocuments();
          const tab = updateSelectedTab();
          onUpdate && onUpdate(tab, documents);
          setPrev(documents);
          result.error && processError(result.error, documents);
        })
        .finally(() => setLoading(false));
    }
  };

  const processError = (error, documents) => {
    if (error?.description?.type === 'signatureError') {
      addPagesErrors(error.description.info, documents);
      toast({
        type: 'info',
        title: error.description.info
      });
    } else {
      toast({
        type: 'error',
        title: error.description
      });
    }
  };

  const addPagesErrors = (errors, documents) => {
    setPageErrors({
      ...pageErrors,
      ...errors.reduce((acc, { number, count, description }) => {
        acc[documents[selectedTab.code][number - 1].uuid] = { count, description };

        return acc;
      }, [])
    });
  };

  const handlePageDelete = async (pageSrc) => {
    const activeContainer = findContainer(pageSrc);
    mutateDocuments(
      {
        ...documents,
        [activeContainer]: documents[activeContainer].filter((item) => item !== pageSrc)
      },
      false
    );
    deletePage(pageSrc).then(async () => {
      const documents = await revalidateDocuments();
      onRemove && onRemove(selectedTab, documents);
    });
  };

  const onDragStart = ({ active }) => {
    setDrugFrom(selectedTab);
    setActiveDraggable(active);
    setDraggableOrigin({
      container: findContainer(active.id),
      index: active.data.current.sortable.index
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
            [overContainer]: arrayMove(documents[overContainer], activeIndex, overIndex)
          },
          false
        );
      }

      if (draggableOrigin.container !== overContainer) {
        correctDocuments(
          { class: draggableOrigin.container, page: draggableOrigin.index + 1 },
          { class: overContainer, page: overIndex + 1 }
        );
      } else {
        correctDocuments(
          { class: activeContainer, page: activeIndex + 1 },
          { class: overContainer, page: overIndex + 1 }
        );
      }
    }

    revalidateDocuments();
    setActiveDraggable(null);
    setDraggableOrigin(null);
    onDrag &&
      onDrag(
        documentsTabs.find((tab) => tab.code === dragFrom.code),
        selectedTab,
        documents
      );
  };

  const onDragOver = ({ active, over }) => {
    const overId = over?.id;

    if (!overId || overId === 'void' || active.id in documents) {
      return;
    }

    if (over && over.data.current.tab) {
      const tab = documentsTabs.find((tab) => tab.code === overId);
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
          ...documents[overContainer].slice(newIndex, documents[overContainer].length)
        ]
      };

      mutateDocuments(newDocuments, false);
    }
  };

  const changeTab = (_, { name }) => {
    if (name === 'classifier') {
      selectTab({ code: 'classifier', name: 'Автоматически' });
      return;
    }
    const tab = documentsTabs.find((tab) => tab.code === name);
    selectTab(tab);
  };

  return (
    <Grid columns={2} centered className="dossier classifier">
      <DndContext
        sensors={sensors}
        modifiers={[snapCenterToCursor]}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragCancel={onDragCancel}>
        <Grid.Column
          textAlign="center"
          className="dossier__wrap"
          width={4}>
          <Menu
            countStartedTasks={countStartedTasks}
            uuid={uuid}
            blocks={schema.blocks}
            classifier={classifier}
            name={name}
            documents={schema.tabs}
            hiddenTabs={hiddenTabs}
            selected={selectedTab.code}
            onDocumentSelect={changeTab}
          />
        </Grid.Column>
        <Grid.Column
          className="dossier__wrap"
          width={11}
          textAlign="center"
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            minHeight: 700,
            width: '73.75%!important'
          }}>
          <Dimmer active={loading} inverted>
            <Loader style={{ display: 'block' }} size="big">
              Загрузка...
            </Loader>
          </Dimmer>
          {!selectedTab.readonly && (
            <UploadDropzone
              onDrop={handleDocumentsDrop}
              accept={selectedTab.accept}
              fileType={selectedTab.fileType}
            />
          )}
          <Dimmer.Dimmable>
            {!!countStartedTasks && selectedTab.code === 'classifier' && (
              <Dimmer active inverted>
                <Loader size="large" active>
                  {countStartedTasks === -1 && 'Документы в обработке'}
                  {countStartedTasks > 0 && 'Документов в обработке: ' + countStartedTasks}
                </Loader>
              </Dimmer>
            )}
            <SortableGallery
              pageErrors={pageErrors}
              tab={selectedTab}
              srcSet={selectedDocument}
              onRemove={handlePageDelete}
              active={activeDraggable}
            />
          </Dimmer.Dimmable>
        </Grid.Column>
      </DndContext>
    </Grid>
  );
};

export default Classifier;
