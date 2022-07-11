import MenuTab from './MenuTab';
import { Icon, Menu } from 'semantic-ui-react';
import { useState } from 'react';

const MenuBlock = ({ uuid, block, selected, hiddenTabs, onDocumentSelect }) => {
  const [isOpened, setOpen] = useState(block.open);
  return (
    <>
      {!!block?.documents?.length && (
        <>
          {block.collapsed && (
            <Menu.Item onClick={() => setOpen(!isOpened)} style={{ cursor: 'pointer', height: 35 }}>
              <span>
                {isOpened && <Icon color="grey" name="chevron up" />}
                {!isOpened && <Icon color="grey" name="chevron down" />}
                {block.name}
              </span>
            </Menu.Item>
          )}
          {block.documents.map((document) => {
            return (
              <MenuTab
                uuid={uuid}
                disabled={hiddenTabs.includes(document.code)}
                key={document.code}
                document={document}
                selected={document.code === selected}
                onDocumentSelect={onDocumentSelect}
                hidden={!isOpened && block.collapsed}
              />
            );
          })}
        </>
      )}
    </>
  );
};

export default MenuBlock;
