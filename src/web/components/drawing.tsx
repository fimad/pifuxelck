import * as React from 'react';
import * as models from '../../common/models/drawing';

const VisibilitySensor = require('react-visibility-sensor');

type Props = {
  style?: any,
  drawing: models.Drawing,
  hideInivisible?: boolean,
};

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
      points={[points[0], ...points].map(({x, y}: models.Point) => `${x},${y}`).join(' ')}/>
);

const Drawing = ({style, drawing: {background_color, lines}, hideInivisible}: Props) => (
  <VisibilitySensor
      delayedCall={true}
      scrollCheck={true}
      scrollDelay={0}
      intervalDelay={500}
      partialVisibility={true}>
  {
    ({isVisible}: {isVisible: boolean}) => (
      <svg style={style} viewBox="0 0 1 1">
        <rect width='1' height='1' fill={toColor(background_color)} />
          {!hideInivisible || isVisible ?  lines.map(drawLine) : null}
      </svg>
    )
  }
  </VisibilitySensor>
);

export default Drawing;
