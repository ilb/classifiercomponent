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
    selectedTab.type !== 'classifier'
      ? documents[selectedTab.type]
        ? documents[selectedTab.type]
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

      return { type: 'classifier' };
    }

    return documentsTabs.find((tab) => tab.type === defaultTab);
  }

  /**
   * ???????????????????? ???????????????????? ?? ??????????
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

  useEffect(async () => {
    setCountStartedTasks(processTasks.length);
    const documents = await revalidateDocuments();
    if (Object.entries(documents).length) {
      if (!prev && !['unknown', 'classifier'].includes(selectedTab.type)) {
        const tab = documentsTabs.find((tab) => tab.type === selectedTab.type);
        tab.count = documents[tab.type].length;
        tab.count && onUpdate && onUpdate(tab, documents);
      }

      if (prev && onUpdate) {
        for (const type in documents) {
          if (prev[type].length !== documents[type].length) {
            const tab = documentsTabs.find((tab) => tab.type === type);
            tab.count = documents[type].length;

            !['unknown', 'classifier'].includes(tab.type) && onUpdate(tab, documents);
          }
        }
      }

      setPrev(documents);
    }
  }, [processTasks.length, Object.entries(documents).length > 0]);

  function updateSelectedTab() {
    const updated = documentsTabs.find((tab) => tab.type === selectedTab.type);

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
    return registerTwain((file) => file && handleDocumentsDrop([file]), selectedTab.type);
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
      return showError('???????? ???????????????????? ???????? ???? ???????????????? ?????? ????????????????.');
    }

    if (selectedTab.type === 'classifier') {
      !countStartedTasks && setCountStartedTasks(-1);
      const availableClasses = documentsTabs.filter((tab) => !tab.readonly).map((tab) => tab.type);
      classifyDocument(uuid, acceptedFiles, availableClasses).then(revalidateDocuments);
    } else {
      setLoading(true);
      uploadPages(uuid, selectedTab.type, acceptedFiles)
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
        acc[documents[selectedTab.type][number - 1].uuid] = { count, description };

        return acc;
      }, [])
    });
  };

  const handlePageDelete = async (pageSrc) => {
    const activeContainer = findContainer(pageSrc);
    const newDocumentsList = {
      ...documents,
      [activeContainer]: documents[activeContainer].filter((item) => item !== pageSrc)
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

    // revalidateDocuments();
    setActiveDraggable(null);
    setDraggableOrigin(null);
    onDrag &&
      onDrag(
        documentsTabs.find((tab) => tab.type === dragFrom.type),
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
          ...documents[overContainer].slice(newIndex, documents[overContainer].length)
        ]
      };

      mutateDocuments(newDocuments, false);
    }
  };

  const changeTab = (_, { name }) => {
    if (name === 'classifier') {
      selectTab({ type: 'classifier', name: '??????????????????????????' });
      return;
    }
    const tab = documentsTabs.find((tab) => tab.type === name);
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
            selected={selectedTab.type}
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
              ????????????????...
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
            {!!countStartedTasks && selectedTab.type === 'classifier' && (
              <Dimmer active inverted>
                <Loader size="large" active>
                  {countStartedTasks === -1 && '?????????????????? ?? ??????????????????'}
                  {countStartedTasks > 0 && '???????????????????? ?? ??????????????????: ' + countStartedTasks}
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
