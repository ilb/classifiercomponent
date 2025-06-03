import { useContext, useState, useEffect } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { ClassifierContext } from '../context/ClassifierContext';

const VersionSelector = ({ selectedVersion, onVersionChange, versions = [] }) => {
  const { settings } = useContext(ClassifierContext);
  const [versionOptions, setVersionOptions] = useState([]);

  useEffect(() => {
    if (versions && versions.length > 0) {
      const options = versions.map((version, index) => ({
        key: version.uuid,
        text: version.name || `Версия ${index + 1}`,
        value: version.uuid
      }));
      setVersionOptions(options);
    }
  }, [versions]);

  if (!settings?.versions?.enabled || !versions) {
    return null;
  }

  return (
    <div style={{ marginBottom: '10px', textAlign: 'left' }}>
      <label
        htmlFor="version-selector"
        style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
        Актуальная версия документа:
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
