import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal } from 'semantic-ui-react';

const DocumentNameModal = ({ open, files, onConfirm, onCancel }) => {
  const [documentName, setDocumentName] = useState('');

  useEffect(() => {
    if (files && files.length > 0) {
      const firstFileName = files[0].name.replace(/\.[^/.]+$/, '');
      setDocumentName(firstFileName);
    }
  }, [files]);

  const handleNameChange = (value) => {
    setDocumentName(value);
  };

  const handleConfirm = () => {
    const finalName = documentName.trim() || files[0]?.name;
    onConfirm(finalName);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      open={open}
      size="small"
      onClose={handleCancel}
      dimmer={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.3)' } }}>
      <Modal.Header>Редактирование названия документа</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Field>
            <label>Название для {files?.length === 1 ? 'документа' : `${files?.length} документов`}:</label>
            <Input
              fluid
              placeholder="Введите название документа"
              value={documentName}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </Form.Field>
          {files?.length > 1 && (
            <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
              Выбранные файлы: {files.map(f => f.name).join(', ')}
            </div>
          )}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={handleCancel}>Отмена</Button>
        <Button primary onClick={handleConfirm}>
          Подтвердить
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default DocumentNameModal;
