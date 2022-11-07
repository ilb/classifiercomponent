import { useEffect, useState } from 'react';
import MenuBlock from './MenuBlock';
import classNames from 'classnames';
import styles from '../Global.module.css';

const Menu = ({ uuid, classifier, documents, blocks, selected, onDocumentSelect, hiddenTabs }) => {
  const [docBlocks, setDocBlocks] = useState([]);

  useEffect(() => {
    setDocBlocks(
      blocks.map((block) => {
        const blockDocs = documents.filter((document) => document.block === block.type);

        return {
          documents: blockDocs,
          collapsed: block.collapsed,
          name: block.name,
          type: block.type,
          open: block.open
        };
      })
    );
  }, [blocks]);

  return (
    <div className={styles.menu}>
      {!classifier.disabled && (
        <>
          <div
            className={classNames(
              'classifier-tab',
              styles.menuItem,
              styles.menuItemTab,
              classifier.readonly && styles.menuItemDisabled,
              selected === 'classifier' && styles.menuItemSelected
            )}
            onClick={(e) => {
              onDocumentSelect(e, { name: 'classifier' });
            }}>
            <div>
              <span style={{ padding: 10 }}>Автомат</span>
              {/*<Checkbox*/}
              {/*  style={{ top: 5 }}*/}
              {/*  className="native-checkbox"*/}
              {/*  checked={selected === 'classifier'}*/}
              {/*  toggle*/}
              {/*/>*/}
            </div>
          </div>
          <div className={styles.divider} />
        </>
      )}
      {docBlocks.map((block) => {
        return (
          <MenuBlock
            uuid={uuid}
            key={block.type}
            hiddenTabs={hiddenTabs}
            selected={selected}
            onDocumentSelect={onDocumentSelect}
            block={block}
          />
        );
      })}
    </div>
  );
};

export default Menu;
