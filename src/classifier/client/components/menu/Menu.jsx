import { Checkbox, Divider, Menu as SemanticMenu } from 'semantic-ui-react';
import { useEffect, useState } from 'react';
import MenuBlock from './MenuBlock';
const Menu = ({ uuid, classifier, documents, blocks, selected, onDocumentSelect, hiddenTabs }) => {
  const [docBlocks, setDocBlocks] = useState([]);

  useEffect(() => {
    setDocBlocks(
      blocks.map((block) => {
        const blockDocs = documents.filter((document) => document.block === block.code);

        return {
          documents: blockDocs,
          collapsed: block.collapsed,
          name: block.name,
          code: block.code,
          open: block.open
        };
      })
    );
  }, [blocks]);

  return (
    <SemanticMenu fluid vertical stackable>
      {!classifier.disabled && (
        <>
          <SemanticMenu.Item
            disabled={classifier.readonly}
            name="classifier"
            className="classifier-tab"
            active={selected === 'classifier'}
            onClick={onDocumentSelect}>
            <div style={{ marginTop: -5 }}>
              <span style={{ padding: 10 }}>Автомат</span>
              <Checkbox
                style={{ top: 5 }}
                className="native-checkbox"
                checked={selected === 'classifier'}
                toggle
              />
            </div>
          </SemanticMenu.Item>
          <Divider style={{ margin: 0 }} />
        </>
      )}
      {docBlocks.map((block) => {
        return (
          <MenuBlock
            uuid={uuid}
            key={block.code}
            hiddenTabs={hiddenTabs}
            selected={selected}
            onDocumentSelect={onDocumentSelect}
            block={block}
          />
        );
      })}
    </SemanticMenu>
  );
};

export default Menu;
