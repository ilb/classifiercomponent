import { createContext } from 'react';

/**
 * Context for sharing classifier state between components
 */
export const ClassifierContext = createContext(null);

/**
 * Provider component for classifier state
 * @param {Object} props Component props
 * @returns {JSX.Element} Provider component
 */
export const ClassifierProvider = ({ children, uuid, settings = {} }) => {
  const value = {
    uuid,
    settings
  };

  return <ClassifierContext.Provider value={value}>{children}</ClassifierContext.Provider>;
};
