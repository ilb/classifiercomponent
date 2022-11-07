import { useDroppable } from '@dnd-kit/core';
import { useDocuments } from '../../hooks';
import classNames from 'classnames';
import styles from '../Global.module.css';
import Popup from '../elements/Popup';

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
          <div
            className={classNames(
              className,
              styles.menuItem,
              styles.menuItemTab,
              selected && styles.menuItemSelected,
              disabled && styles.menuItemDisabled
            )}
            onClick={(e) => {
              if (!disabled) {
                onDocumentSelect(e, { name: document.type });
              }
            }}>
            <span>
              {document.tooltip && (
                <Popup
                  content={document.tooltip}
                  trigger={<i className={classNames(styles.iconQuestion, styles.icon)} />}
                />
              )}
              {document.name} {countPages ? '(' + countPages + ')' : ''}
              {isRequired && <span style={{ color: 'red' }}>*</span>}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuTab;
