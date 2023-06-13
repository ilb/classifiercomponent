import MenuTab from './MenuTab';
import { useState } from 'react';

const MenuBlock = ({ uuid, block, selected, hiddenTabs, onDocumentSelect, dossierUrl, errors = {} }) => {
  const [isOpened, setOpen] = useState(block.open);
  return (
    <>
      {!!block?.documents?.length && (
        <>
          {block.collapsed && (
            <div
              className="menuItem"
              onClick={() => setOpen(!isOpened)}
              style={{ cursor: 'pointer' }}>
              <span>
                {isOpened && <i className="iconChevronUp icon" />}
                {!isOpened && <i className="iconChevronDown icon" />}
                {block.name}
              </span>
            </div>
          )}
          {block.documents.map((document) => (
              <MenuTab
                uuid={uuid}
                validationErrorMessage={errors[document.type]}
                disabled={hiddenTabs.includes(document.type)}
                key={document.type}
                document={document}
                selected={document.type === selected}
                onDocumentSelect={onDocumentSelect}
                hidden={!isOpened && block.collapsed}
                dossierUrl={dossierUrl}
              />
            ))}
        </>
      )}
    </>
  );
};

export default MenuBlock;
