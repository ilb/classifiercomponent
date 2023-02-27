import { Icon, Menu, Popup } from 'semantic-ui-react';
import { useDroppable } from '@dnd-kit/core';
import { useDocuments } from '../../hooks';

const MenuTab = ({ uuid, document, selected, disabled, onDocumentSelect, error, hidden }) => {
  let className = '';
  let isNotImage = false;
  let isRequired = !document.readonly && document.required;
  const { documents } = useDocuments(uuid);
  const tabDocuments = documents[document.type];
  const countPages = tabDocuments?.length;
  if (countPages && !tabDocuments[0].type.includes('image/')) {
    isNotImage = true;
  }
  const { setNodeRef } = useDroppable({
    id: document.type,
    data: { tab: true },
    disabled: document.readonly || disabled || isNotImage
  });

  if (error) className += ' error';
  if (document.readonly) className += 'readonly';

  return (
    <>
      {!hidden && (
        <div key={document.type} ref={setNodeRef}>
          <Menu.Item
            id={document.type}
            disabled={disabled}
            className={className}
            name={document.type}
            active={selected}
            onClick={onDocumentSelect}>
            <span>
              {document.tooltip && (
                <Popup
                  content={document.tooltip}
                  trigger={<Icon name="question circle outline" />}
                />
              )}
              {document.name} {countPages ? '(' + countPages + ')' : ''}
              {isRequired && <span style={{ color: 'red' }}>*</span>}
            </span>
          </Menu.Item>
        </div>
      )}
    </>
  );
};

export default MenuTab;
