import { useDropzone } from 'react-dropzone';
import { Segment } from 'semantic-ui-react';

const UploadDropzone = ({
  onDrop,
  fileType,
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
  const dropzone = useDropzone({
    accept,
    onDrop: async (acceptedFiles) => onDrop(acceptedFiles)
  });

  return (
    <Segment.Group
      className="dossier__uploads"
      horizontal
      style={{
        cursor: 'pointer',
        margin: 10
      }}>
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
        <input {...dropzone.getInputProps()} />
      </Segment>
    </Segment.Group>
  );
};

export default UploadDropzone;
