import { useRef, useState } from 'react';

const Popup = ({ content, trigger }) => {
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const tooltipRef = useRef(null);

  const handleHideTooltip = () => {
    setTooltipPosition(null);
  };

  const handleShowTooltip = (e) => {
    const targetRect = e.target.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const documentHeight = document?.documentElement?.clientHeight;
    const documentWidth = document?.documentElement?.clientWidth;

    const top = Math.min(targetRect.top, documentHeight - tooltipRect.height);
    const left = Math.min(targetRect.x + 10, documentWidth - tooltipRect.width);

    setTooltipPosition({
      top,
      left,
    });
  };

  return (
    <div className="target" onMouseEnter={handleShowTooltip} onMouseLeave={handleHideTooltip}>
      {trigger}
      <div
        className="tooltip"
        ref={tooltipRef}
        style={
          tooltipPosition
            ? {
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                visability: 'visible',
              }
            : { visibility: 'hidden' }
        }>
        {content}
      </div>
    </div>
  );
};

export default Popup;
