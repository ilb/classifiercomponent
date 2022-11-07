import MenuTab from './MenuTab';
import { useState } from 'react';
import styles from '../Global.module.css';
import classNames from 'classnames';

const MenuBlock = ({ uuid, block, selected, hiddenTabs, onDocumentSelect }) => {
  const [isOpened, setOpen] = useState(block.open);
  return (
    <>
      {!!block?.documents?.length && (
        <>
          {block.collapsed && (
            <div
              className={styles.menuItem}
              onClick={() => setOpen(!isOpened)}
              style={{ cursor: 'pointer' }}>
              <span>
                {isOpened && <i className={classNames(styles.iconChevronUp, styles.icon)} />}
                {!isOpened && <i className={classNames(styles.iconChevronDown, styles.icon)} />}
                {block.name}
              </span>
            </div>
          )}
          {block.documents.map((document) => {
            return (
              <MenuTab
                uuid={uuid}
                disabled={hiddenTabs.includes(document.type)}
                key={document.type}
                document={document}
                selected={document.type === selected}
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
