import Panel from './Panel';
import SelectSearch from 'react-select-search';
import 'react-select-search/style.css';

const ListMenu = ({ withViewTypes, view, onChangeView, documents, selected, onDocumentSelect }) => {
  const options = documents.map((document) => ({ name: document.name, value: document.type }));

  return (
    <div className="classifier-menu-list">
      {withViewTypes && <Panel view={view} onChangeView={onChangeView} />}
      <SelectSearch
        options={options}
        value={selected}
        onChange={(value, option) => onDocumentSelect(option, { name: value })}
      />
    </div>
  );
};

export default ListMenu;
