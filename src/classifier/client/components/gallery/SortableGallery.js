import { DragOverlay } from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import GalleryItem from './GalleryItem/GalleryItem';
import SortableGalleryItem from './SortableGalleryItem';
import SegmentItem from './GalleryItem/SegmentItem';
import React, { useEffect, useState } from 'react';
import ControlsMenu from '../gallery/GalleryItem/ControlsMenu';

const SortableGallery = ({ srcSet, active, onRemove, tab, pageErrors }) => {
  const [state, setState] = useState({
    scale: 1,
    rotation: 0,
    src: '',
    previewOpen: false
  });

  useEffect(() => {
    setState({ ...state, previewOpen: false });
  }, [tab?.type]);

  const rotateImage = async (event, { angle }) => {
    let newAngle = state.rotation + angle;
    if (newAngle < 0) {
      newAngle = 270;
    }
    if (newAngle > 270) {
      newAngle = 0;
    }
    const rotate = newAngle;
    setState({ ...state, rotation: rotate });
  };

  const zoomImageIn = async (event, { scaleNum }) => {
    let newScale = (scaleNum * 1.1).toFixed(2);
    newScale = Math.ceil(newScale * 10) / 10;
    newScale = Math.min(10, newScale);
    const newWidth = state.width * newScale;
    const newHeight = state.height * newScale;
    setState({ ...state, scale: newScale, width: newWidth, height: newHeight });
  };

  const zoomImageOut = async (event, { scaleNum }) => {
    let newScale = (scaleNum / 1.1).toFixed(2);
    newScale = Math.ceil(newScale * 10) / 10;
    newScale = Math.max(0.1, newScale);
    const newWidth = state.width / newScale;
    const newHeight = state.height / newScale;
    setState({ ...state, scale: newScale, width: newWidth, height: newHeight });
  };

  const zoomImageWithDropdown = async (value) => {
    const newWidth = 460 * value;
    const newHeight = 600 * value;
    setState({ ...state, scale: value, width: newWidth, height: newHeight });
  };

  return (
    <>
      <SortableContext items={srcSet} strategy={rectSortingStrategy}>
        {state.previewOpen && (
          <ControlsMenu
            attached="top"
            rotateImage={rotateImage}
            zoomImageIn={zoomImageIn}
            zoomImageOut={zoomImageOut}
            closePreview={() =>
              setState({ ...state, rotation: 0, scale: 1, previewOpen: false, src: null })
            }
            zoomImageWithDropdown={zoomImageWithDropdown}
            scale={state.scale}
          />
        )}
        <div className="pagePreviewer">
          {!state.previewOpen && (
            <div className="grid">
              {srcSet.map((src) => {
                return (
                  <div key={src.id} className="column">
                    <SortableGalleryItem
                      src={src}
                      errors={pageErrors[src.uuid]}
                      disabled={tab.readonly}
                      width={3}
                      height={4}
                      onRemove={onRemove}
                      onClick={() => {
                        setState({ ...state, previewOpen: true, src: src.id });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
          {state.previewOpen && (
            <SegmentItem
              src={state.src}
              rotation={state.rotation}
              scale={state.scale}
              width={state.width}
              height={state.height}
            />
          )}
        </div>
      </SortableContext>
      <DragOverlay>
        {active ? (
          <GalleryItem
            src={active.id}
            width={3}
            height={4}
            style={{ backgroundColor: '#ffffff', opacity: 0.6 }}
            dragOverlay
          />
        ) : null}
      </DragOverlay>
    </>
  );
};

export default SortableGallery;
