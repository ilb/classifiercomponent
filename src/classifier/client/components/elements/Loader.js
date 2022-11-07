import styles from './Loader.module.css';
import classNames from 'classnames';

const Loader = ({ children, loaderText, active }) => {
  // active = true
  return (
    <>
      <div className={classNames(styles.dimmer, active && styles.dimmerActive)}>
        <div className={styles.loader} />
        {loaderText && <span className={styles.loaderText}>{loaderText}</span>}
        {children}
      </div>
    </>
  );
};

export default Loader;
