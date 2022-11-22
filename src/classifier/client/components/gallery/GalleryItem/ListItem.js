import Image from 'next/future/image';

const SegmentItem = ({ src }) => {
  return (
    <div
      className="classifier-list-gallery-item"
      style={{
        position: 'relative',
        overflow: 'auto',
        cursor: 'grab',
        lineHeight: 0
      }}>
      {src && (
        <Image width={1000} height={1} src={src} style={{ maxWidth: '100%', height: 'auto' }} />
      )}
    </div>
  );
};

SegmentItem.displayName = 'SegmentItem';
export default SegmentItem;
