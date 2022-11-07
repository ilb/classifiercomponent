import styles from './Popup.module.css';

const Popup = ({ content, trigger }) => {
  return (
    <div className={styles.tooltip}>
      {trigger}
      <span className={styles.tooltiptext}>{content}</span>
    </div>
  );
};

export default Popup;
