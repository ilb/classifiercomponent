import { useDropzone } from 'react-dropzone';
import { Segment } from 'semantic-ui-react';
import { useContext, useState } from 'react';
import DocumentNameModal from './DocumentNameModal';
import VersionSelector from './VersionSelector';
import { ClassifierContext } from '../context/ClassifierContext';

const UploadDropzone = ({
  onDrop,
  fileType,
  versions = [],
  selectedVersion,
  onVersionChange,
  accept = [
    'image/jpg',
    'image/bmp',
    'image/jpeg',
    'image/tiff',
    'image/heic',
    'image/png',
    'application/pdf'
  ]
}) => {
  const { settings } = useContext(ClassifierContext);
  const showDocumentNameInput = settings?.naming?.enabled;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const handleFileDrop = async (acceptedFiles) => {
    if (showDocumentNameInput && acceptedFiles.length > 0) {
      setSelectedFiles(acceptedFiles);
      setModalOpen(true);
    } else {
      onDrop(acceptedFiles);
    }
  };

  const handleModalConfirm = (documentName, createNewVersion) => {
    setModalOpen(false);
    onDrop(selectedFiles, documentName, createNewVersion);
    setSelectedFiles([]);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setSelectedFiles([]);
  };

  const dropzone = useDropzone({
    accept,
    onDrop: handleFileDrop
  });
  return (
    <div>
      <VersionSelector
        selectedVersion={selectedVersion}
        onVersionChange={onVersionChange}
        versions={versions}
      />
      <Segment.Group className="dossier__uploads" horizontal style={{ cursor: 'pointer' }}>
        <Segment
          textAlign="center"
          style={{ padding: 10 }}
          {...dropzone.getRootProps({
            className: 'updateDropzone'
          })}>
          <div>
            <span>
              {fileType?.includes('image/') || !fileType ? 'Загрузить файлы' : 'Заменить файл'}
            </span>
          </div>
          <div>Нажмите или перетащите</div>
          <input {...dropzone.getInputProps()} id={'dropzone_input'} />
        </Segment>
      </Segment.Group>
      <DocumentNameModal
        open={modalOpen}
        files={selectedFiles}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default UploadDropzone;
