import { useContext, useState, useEffect } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { ClassifierContext } from '../context/ClassifierContext';

const VersionSelector = ({ selectedVersion, onVersionChange, versions = [] }) => {
  const { settings } = useContext(ClassifierContext);
  const [versionOptions, setVersionOptions] = useState([]);

  useEffect(() => {
    if (versions && versions.length > 0) {
      const options = versions.map((version, index) => ({
        key: version.id,
        text: version.name || `Версия ${index + 1}`,
        value: version.id
      }));
      setVersionOptions(options);
    }
  }, [versions]);

  if (!settings?.versions?.enabled || !versions || versions.length <= 1) {
    return null;
  }

  return (
    <div style={{ marginBottom: '10px', textAlign: 'left' }}>
      <label
        htmlFor="version-selector"
        style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
        Версия документа:
      </label>
      <Dropdown
        selection
        fluid
        placeholder="Выберите версию"
        value={selectedVersion}
        options={versionOptions}
        onChange={(e, { value }) => onVersionChange(value)}
        id="version-selector"
      />
    </div>
  );
};

export default VersionSelector;
