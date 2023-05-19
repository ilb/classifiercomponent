import { useDroppable } from '@dnd-kit/core';
import { useDocuments } from '../../hooks';
import classNames from 'classnames';
import Popup from '../elements/Popup';

const MenuTab = ({
  uuid,
  document,
  selected,
  disabled,
  onDocumentSelect,
  error,
  hidden,
  dossierUrl,
}) => {
  let className = '';
  let isNotImage = false;
  let isRequired = !document.readonly && document.required;
  const { documents } = useDocuments(uuid, dossierUrl);
  const tabDocuments = documents[document.type]?.pages;
  const countPages = tabDocuments?.length;
  if (countPages && !tabDocuments[0].type.includes('image/')) {
    isNotImage = true;
  }
  const { setNodeRef } = useDroppable({
    id: document.type,
    data: { tab: true },
    disabled: document.readonly || disabled || isNotImage,
  });

  if (error) className += ' error';
  if (document.readonly) className += 'readonly';

  return (
    <>
      {!hidden && (
        <div key={document.type} ref={setNodeRef}>
          <div
            className={classNames(
              className,
              'menuItem',
              'menuItemTab',
              selected && 'menuItemSelected',
              disabled && 'menuItemDisabled',
            )}
            onClick={(e) => {
              if (!disabled) {
                onDocumentSelect(e, { name: document.type });
              }
            }}>
            {document.tooltip && (
              <Popup content={document.tooltip} trigger={<i className="iconQuestion icon" />} />
            )}
            <div style={{ display: 'inline-block' }}>
              <span>
                {document.name} {countPages ? '(' + countPages + ')' : ''}
              </span>
            </div>
            <Popup content={document.tooltip} trigger={<i className="iconExclamation icon" />} />
            {isRequired && <span style={{ color: 'red' }}>*</span>}
          </div>
        </div>
      )}
    </>
  );
};

export default MenuTab;
