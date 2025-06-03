import { useEffect, useState, useContext } from 'react';
import { Button, Form, Input, Modal, Checkbox } from 'semantic-ui-react';
import { ClassifierContext } from '../context/ClassifierContext';

const DocumentAddModal = ({ open, files, onConfirm, onCancel }) => {
  const [rawName, setRawName] = useState('');
  const [isNewVersion, setIsNewVersion] = useState(false);
  const { settings } = useContext(ClassifierContext);

  useEffect(() => {
    if (files && files.length > 0) {
      const firstFileName = files[0].name.replace(/\.[^/.]+$/, '');
      setRawName(firstFileName);
    }
  }, [files]);

  const handleNameChange = (value) => {
    setRawName(value);
  };

  const handleConfirm = () => {
    const name = rawName.trim() || files[0]?.name;
    onConfirm({ name, isNewVersion });
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
            <label>
              Название для {files?.length === 1 ? 'документа' : `${files?.length} документов`}:
            </label>
            <Input
              fluid
              placeholder="Введите название документа"
              value={rawName}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </Form.Field>
          {settings?.versions?.enabled && (
            <Form.Field>
              <Checkbox
                label="Создать новую версию документа"
                checked={isNewVersion}
                onChange={(e, { checked }) => setIsNewVersion(checked)}
              />
            </Form.Field>
          )}
          {files?.length > 1 && (
            <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
              Выбранные файлы: {files.map((f) => f.name).join(', ')}
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

export default DocumentAddModal;
