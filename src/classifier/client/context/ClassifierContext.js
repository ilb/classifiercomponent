import React, { createContext, useCallback, useContext, useState } from 'react';
import { useDocuments, useTasks } from '../hooks';

/**
 * Context for sharing classifier state between components
 */
const ClassifierContext = createContext(null);

/**
 * Provider component for classifier state
 * @param {Object} props Component props
 * @returns {JSX.Element} Provider component
 */
export const ClassifierProvider = ({
  children,
  uuid,
  schema,
  onInit,
  onUpdate,
  onRemove,
  onChange,
  onDrag
}) => {
  const [classifier, setClassifier] = useState(schema.classifier);
  const [documentsTabs, setDocumentsTabs] = useState(schema.tabs);
  const [selectedTab, selectTab] = useState(null);
  const [pageErrors, setPageErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [prev, setPrev] = useState(null);

  // Fetch documents and tasks using SWR
  const { documents, mutateDocuments, correctDocuments, revalidateDocuments } = useDocuments(uuid);
  const { tasks } = useTasks(uuid);

  // Initialize the selected tab when schema changes
  React.useEffect(() => {
    if (!selectedTab) {
      selectTab(getSelectedTab(schema, 'classifier'));
    }

    setClassifier(schema.classifier);
    setDocumentsTabs(schema.tabs);
  }, [schema]);

  // Handle initialization when documents are first loaded
  React.useEffect(() => {
    if (!prev && Object.keys(documents).length) {
      onInit && onInit(documents);
      setPrev(documents);
    }
  }, [documents]);

  /**
   * Get the initial selected tab
   * @param {Object} schema Schema configuration
   * @param {string} defaultTab Default tab name
   * @returns {Object} Selected tab object
   */
  const getSelectedTab = useCallback((schema, defaultTab) => {
    if (defaultTab === 'classifier') {
      if (schema.classifier.disabled) {
        return schema.tabs[0];
      }
      return { type: 'classifier' };
    }
    return schema.tabs.find((tab) => tab.type === defaultTab);
  }, []);

  /**
   * Handle tab selection
   * @param {string} tabType Tab type to select
   */
  const changeTab = useCallback(
    (tabType) => {
      if (tabType === 'classifier') {
        selectTab({ type: 'classifier', name: 'Автоматически' });
        return;
      }
      const tab = documentsTabs.find((tab) => tab.type === tabType);
      selectTab(tab);
    },
    [documentsTabs]
  );

  /**
   * Find which container (document type) a file belongs to
   * @param {string|Object} id File ID or object
   * @returns {string} Container name
   */
  const findContainer = useCallback(
    (id) => {
      if (id in documents) {
        return id;
      }

      if (typeof id === 'object') {
        id = id.path;
      }

      return Object.keys(documents).find((key) => documents[key].find((item) => item.path === id));
    },
    [documents]
  );

  /**
   * Process error from API response
   * @param {Object} error Error object
   * @param {Object} documents Current documents state
   */
  const processError = useCallback(
    (error, documents) => {
      if (error?.description?.type === 'signatureError') {
        const errors = error.description.info;
        setPageErrors((prev) => ({
          ...prev,
          ...errors.reduce((acc, { number, count, description }) => {
            acc[documents[selectedTab.type][number - 1].uuid] = { count, description };
            return acc;
          }, [])
        }));
      }
    },
    [selectedTab]
  );

  // Create the context value
  const value = {
    // State
    uuid,
    classifier,
    documentsTabs,
    selectedTab,
    documents,
    tasks,
    loading,
    pageErrors,

    // Actions
    selectTab: changeTab,
    setLoading,
    mutateDocuments,
    correctDocuments,
    revalidateDocuments,
    findContainer,
    processError,

    // Callbacks
    onInit,
    onUpdate,
    onRemove,
    onChange,
    onDrag
  };

  return <ClassifierContext.Provider value={value}>{children}</ClassifierContext.Provider>;
};

/**
 * Hook to access classifier context
 * @returns {Object} Classifier context
 */
export const useClassifier = () => {
  const context = useContext(ClassifierContext);
  if (!context) {
    throw new Error('useClassifier must be used within a ClassifierProvider');
  }
  return context;
};
