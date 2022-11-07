import styles from './Loader.module.css';

const Dimmable = ({ children }) => {
  return (
    <div className={styles.dimmable}>
      {children}
    </div>
  )
}

export default Dimmable;