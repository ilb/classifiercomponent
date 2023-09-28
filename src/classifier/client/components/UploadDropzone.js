import { useDropzone } from 'react-dropzone';

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
    <div className="segment dropzone_wrapper">
      <div className="dossier__uploads" style={{ cursor: 'pointer' }}>
        <div
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
          <input id={'dropzone_input'} {...dropzone.getInputProps()} />
        </div>
      </div>
    </div>
  );
};

export default UploadDropzone;
