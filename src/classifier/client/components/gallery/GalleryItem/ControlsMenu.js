import React from 'react';
import PropTypes from 'prop-types';

function ControlsMenu({
  rotateImage,
  zoomImageIn,
  zoomImageOut,
  closePreview,
  zoomImageWithDropdown,
  scale
}) {
  return (
    <>
      <div className="file-dossier-file-controls controlsMenu">
        <div
          className="menuItem menuItemHorizontal"
          onClick={(e) => {
            zoomImageOut(e, { scaleNum: scale });
          }}>
          <i className="icon iconMinus" />
        </div>
        <div
          className="menuItem menuItemHorizontal"
          onClick={(e) => {
            zoomImageIn(e, { scaleNum: scale });
          }}>
          <i className="icon iconPlus" />
        </div>
        <select
          className="zoomDropdown"
          onChange={(e) => {
            zoomImageWithDropdown(e.target.value);
          }}>
          <option value="0.5">50%</option>
          <option value="0.75">75%</option>
          <option value="1">100%</option>
          <option value="1.25">125%</option>
          <option value="1.5">150%</option>
          <option value="2">200%</option>
          <option value="3">300%</option>
          <option value="4">400%</option>
        </select>
        <div
          style={{
            display: 'flex',
            marginLeft: 'auto'
          }}>
          <div
            className="menuItem menuItemHorizontal"
            onClick={(e) => {
              rotateImage(e, { angle: -90 });
            }}>
            <i className="icon iconUndo" />
          </div>
          <div
            className="menuItem menuItemHorizontal"
            onClick={(e) => {
              rotateImage(e, { angle: 90 });
            }}>
            <i className="icon iconRedo" />
          </div>
          <div className="menuItem menuItemHorizontal" onClick={closePreview}>
            <i className="icon iconClose" />
          </div>
        </div>
      </div>
    </>
  );
}

ControlsMenu.propTypes = {
  src: PropTypes.string,
  scaleNum: PropTypes.number
};

export default ControlsMenu;
