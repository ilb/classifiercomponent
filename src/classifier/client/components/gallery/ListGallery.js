import ListItem from './GalleryItem/ListItem';

const ListGallery = ({ srcSet }) => {
  return (
    <>
      <div className="classifier-list-gallery">
        {srcSet.map((item) => {
          return <ListItem key={item.id} src={item.path} rotation={0} scale={1} />;
        })}
      </div>
    </>
  );
};

export default ListGallery;
