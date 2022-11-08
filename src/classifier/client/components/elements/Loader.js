import classNames from 'classnames';

const Loader = ({ children, loaderText, active }) => {
  return (
    <>
      <div className={classNames('dimmer', active && 'dimmerActive')}>
        <div className="loader" />
        {loaderText && <span className="loaderText">{loaderText}</span>}
        {children}
      </div>
    </>
  );
};

export default Loader;
