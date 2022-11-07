import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown } from 'semantic-ui-react';
import styles from '../../Global.module.css';
import classNames from 'classnames';

function ControlsMenu({
  rotateImage,
  zoomImageIn,
  zoomImageOut,
  closePreview,
  zoomImageWithDropdown,
  scale
}) {
  return (
    // <div className={classNames('file-dossier-file-controls', styles.controlsMenu)}>
    <Menu inverted className="file-dossier-file-controls">
      <Menu.Menu style={{ display: 'flex', margin: 'auto', width: 380 }}>
        <div
          className={classNames(styles.menuItem, styles.menuItemHorizontal)}
          onClick={(e) => {
            zoomImageOut(e, { scaleNum: scale });
          }}>
          <i className={classNames(styles.icon, styles.iconMinus)} />
        </div>
        <div
          className={classNames(styles.menuItem, styles.menuItemHorizontal)}
          onClick={(e) => {
            zoomImageIn(e, { scaleNum: scale });
          }}>
          <i className={classNames(styles.icon, styles.iconPlus)} />
        </div>
        <div
          className={classNames(
            'file-dossier-no-padding',
            styles.menuItem,
            styles.menuItemDropdown
          )}>
          <Dropdown
            item
            text={scale ? `${Math.round(scale * 100)}%` : ''}
            onChange={(e, { value }) => {
              zoomImageWithDropdown(value);
            }}
            options={[
              { key: '0.5', value: 0.5, text: '50%' },
              { key: '0.75', value: 0.75, text: '75%' },
              { key: '1', value: 1, text: '100%' },
              { key: '1.25', value: 1.25, text: '125%' },
              { key: '1.5', value: 1.5, text: '150%' },
              { key: '2', value: 2, text: '200%' },
              { key: '3', value: 3, text: '300%' },
              { key: '4', value: 4, text: '400%' }
            ]}
            selectOnNavigation={false}
            selectOnBlur={false}
          />
        </div>
      </Menu.Menu>
      <Menu.Menu position="center">
        <Menu.Item link icon="undo" angle={-90} onClick={rotateImage} />
        <Menu.Item link icon="redo" angle={90} onClick={rotateImage} />
        <Menu.Item link icon="close" onClick={closePreview} />
      </Menu.Menu>
    </Menu>
    // </div>
  );
}

ControlsMenu.propTypes = {
  src: PropTypes.string,
  scaleNum: PropTypes.number
};

export default ControlsMenu;
