import { useDroppable } from '@dnd-kit/core';
import { useDocuments } from '../../hooks';
import classNames from 'classnames';
import Popup from '../elements/Popup';
import { Alert, CheckSuccess, Question } from '../../icons/CustomIcons';

const MenuTab = ({
  uuid,
  document,
  selected,
  disabled,
  onDocumentSelect,
  error,
  hidden,
  validationErrorMessage,
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="icons" style={{ position: 'absolute', left: 8, display: 'flex' }}>
                {!!validationErrorMessage && (
                  <Popup content={validationErrorMessage} trigger={<Alert />} />
                )}
                {documents[document.type]?.verificationResult &&
                  (documents[document.type]?.verificationResult === 'error' ? (
                    <Popup content={documents[document.type]?.errors} trigger={<Alert />} />
                  ) : (
                    <Popup content={'Все проверки завершены успешно'} trigger={<CheckSuccess />} />
                  ))}
                {document.tooltip && <Popup content={document.tooltip} trigger={<Question />} />}
              </div>

              <div>
                <span>
                  {document.name} {countPages ? '(' + countPages + ')' : ''}
                </span>
              </div>
              {isRequired && (
                <div>
                  <span style={{ color: 'red' }}>*</span>{' '}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuTab;
