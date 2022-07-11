import Image from 'next/image';
import React, { useEffect } from 'react';
import { Card, Icon, Placeholder, Popup } from 'semantic-ui-react';
import { Handle } from '../SortableGalleryItem/Handle';
import { Remove } from '../SortableGalleryItem/Remove';
import { div } from 'carbone/formatters/number';

const GalleryItem = React.memo(
  React.forwardRef(
    (
      {
        src,
        width,
        height,
        dragOverlay,
        style,
        disabled,
        onRemove,
        onClick,
        attributes,
        listeners,
        errors
      },
      ref
    ) => {
      useEffect(() => {
        if (!dragOverlay) {
          return;
        }
        document.body.style.cursor = 'grabbing';
        return () => {
          document.body.style.cursor = '';
        };
      }, [dragOverlay]);
      const handleClick = (event) => {
        event.preventDefault();
        onRemove(src);
      };

      const isImage = () => {
        return src.type ? src.type.includes('image/') : true;
      };

      const getPath = () => src.path || src; // todo как-то избавиться от такого
      return (
        <div ref={ref} style={style}>
          <Card>
            <Card.Content style={{ padding: 4 }}>
              {errors?.count && (
                <Popup trigger={
                  <Icon style={{ display: 'block', position: 'absolute', zIndex: 10, margin: 10 }}
                        size="large"
                        color="red"
                        name="attention"/>
                       }>
                  <div>{errors.description ? 'Отсутствует:' : 'Отсутствует подписей: ' + errors.count}</div>
                  {errors.description.split('\n').map(error => (<div>{error}</div>))}
                </Popup>
              )}
              {!disabled && <Remove onClick={handleClick} />}
              {!disabled && <Handle {...listeners} />}
              <div {...attributes}>
                {isImage() && (
                  <Image
                    src={getPath()}
                    width={width}
                    height={height}
                    layout="responsive"
                    quality={10}
                    onClick={onClick}
                    className="img-ofit"
                    style={{
                      userSelect: 'none',
                      MozUserSelect: 'none',
                      WebkitUserSelect: 'none',
                      WebkitUserDrag: 'none'
                    }}
                  />
                )}
                {!isImage() && (
                  <Placeholder style={{ backgroundImage: 'none' }}>
                    <div style={{ paddingTop: '51.5%', paddingBottom: '51.5%' }}>
                      Невозможно отобразить или переместить. Документ не является картинкой.
                    </div>
                  </Placeholder>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>
      );
    }
  )
);

GalleryItem.displayName = 'GalleryItem';

export default GalleryItem;
