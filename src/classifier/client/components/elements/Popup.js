const Popup = ({ content, trigger }) => {
  return (
    <div className="tooltip">
      {trigger}
      <span className="tooltiptext">{content}</span>
    </div>
  );
};

export default Popup;
