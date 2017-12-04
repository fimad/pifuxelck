import * as React from 'react';
import * as models from '../../common/models/drawing';

const VisibilitySensor = require('react-visibility-sensor');

interface Props {
  style?: any;
  className?: string;
  drawing: models.Drawing;
  hideInivisible?: boolean;
}

const toColor = ({red, green, blue, alpha}: models.Color) =>
    `rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${alpha})`;

const drawLine = ({color, points, size}: models.Line, i: number) => (
  <polyline
      strokeLinecap='round'
      strokeLinejoin='round'
      fill='none'
      stroke={toColor(color)}
      strokeWidth={size}
      key={i}
      points={[points[0], ...points]
          .map(({x, y}: models.Point) => `${x},${y}`)
          .join(' ')}/>
);

const Drawing = ({
    className,
    drawing: {background_color, lines},
    hideInivisible,
    style}: Props) => (
  <VisibilitySensor
      delayedCall={true}
      scrollCheck={true}
      scrollDelay={0}
      intervalDelay={500}
      partialVisibility={true}>
  {
    ({isVisible}: {isVisible: boolean}) => (
      <svg className={className} style={style} viewBox='0 0 1 1'>
        <defs>
          <rect id='bg' width='1' height='1' fill={toColor(background_color)} />
          <clipPath id='clip'>
              <use xlinkHref='#bg' />
          </clipPath>
        </defs>
        <use xlinkHref='#rect'/>
        <g clipPath='url(#clip)'>
          <rect id='bg' width='1' height='1' fill={toColor(background_color)} />
          {!hideInivisible || isVisible ?  lines.map(drawLine) : null}
        </g>
      </svg>
    )
  }
  </VisibilitySensor>
);

export default Drawing;
