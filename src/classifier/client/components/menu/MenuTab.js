import { Icon, Menu, Popup } from 'semantic-ui-react';
import { useDroppable } from '@dnd-kit/core';
import { useDocuments } from '../../hooks';
import { downloadFile } from '../../utils/fetcher';
import { useContext } from 'react';
import { ClassifierContext } from '../../context/ClassifierContext';

const MenuTab = ({ uuid, document, selected, disabled, onDocumentSelect, error, hidden }) => {
  const { settings } = useContext(ClassifierContext);
  const downloadEnabled = settings?.download?.enabled;

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

  const handleDownloadAll = async (event) => {
    event.stopPropagation();
    try {
      const downloadUrl = `/api/classifications/${uuid}/documents/${document.type}`;
      const filename = `${document.type}.pdf`;
      await downloadFile(downloadUrl, filename);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

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
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%'
              }}>
              <span style={{ flex: 1 }}></span>
              <span
                style={{
                  flex: 'none',
                  textAlign: 'center'
                }}>
                {document.name} {countPages ? '(' + countPages + ')' : ''}
                {isRequired && <span style={{ color: 'red' }}>*</span>}
              </span>
              <span
                style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center'
                }}>
                {document.tooltip && (
                  <Popup
                    content={document.tooltip}
                    trigger={
                      <Icon
                        name="question circle outline"
                        style={{ color: '#414141', opacity: 0.8 }}
                      />
                    }
                  />
                )}
                {countPages > 0 && downloadEnabled && (
                  <Icon
                    name="download"
                    link
                    onClick={handleDownloadAll}
                    style={{
                      marginLeft: '8px',
                      cursor: 'pointer',
                      color: '#414141',
                      opacity: 0.8
                    }}
                    title={`Скачать все страницы ${document.name}`}
                  />
                )}
              </span>
            </span>
          </Menu.Item>
        </div>
      )}
    </>
  );
};

export default MenuTab;
