import grid_icon from '../../icons/view_grid_icon_181217.svg';
import horizontal_icon from '../../icons/view_agenda_outline_icon_139089.svg';
import Image from 'next/image';
import classNames from 'classnames';

const Panel = ({ onChangeView, view }) => {
  const onClick = (view) => {
    onChangeView(view);
  };

  return (
    <div className="classifier-panel">
      <span
        className={classNames('classifier-panel-btn', view === 'grid' && 'selected')}
        onClick={() => onClick('grid')}>
        <Image src={grid_icon.src} alt="Picture of the author" width={30} height={30} />
      </span>
      <span
        className={classNames('classifier-panel-btn', view === 'list' && 'selected')}
        onClick={() => onClick('list')}>
        <Image src={horizontal_icon.src} alt="Picture of the author" width={30} height={30} />
      </span>
    </div>
  );
};

export default Panel;
