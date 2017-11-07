import * as React from 'react';
import * as models from '../../common/models/drawing';

const VisibilitySensor = require('react-visibility-sensor');

type Props = {
  drawing: models.Drawing,
};

const toColor = ({red, green, blue, alpha}: models.Color) =>
    `rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${alpha})`;

const drawLine = ({color, points, size}: models.Line, i: number) => {
  const children = [];
  const dot = ({x, y}: models.Point, key: string) =>
      (<ellipse
        fill={toColor(color)}
        key={key} cx={x} cy={y} rx={size / 2} ry={size / 2} />);
  if (points.length >= 0) {
    children.push(dot(points[0], `dot-start-${i}`));
  }
  if (points.length >= 1) {
    children.push(dot(points[points.length - 1], `dot-end-${i}`));
  }
  children.push((
    <polyline
        fill='none'
        stroke={toColor(color)}
        strokeWidth={size}
        key={i}
        points={points.map(({x, y}: models.Point) => `${x},${y}`).join(' ')}/>
  ));
  return children;
};

const Drawing = ({drawing: {background_color, lines}}: Props) => (
  <VisibilitySensor partialVisibility={true}>
  {
    ({isVisible}: {isVisible: boolean}) => (
      <svg viewBox="0 0 1 1">
        <rect width='1' height='1' fill={toColor(background_color)} />
          {isVisible ?  lines.map(drawLine) : null}
      </svg>
    )
  }
  </VisibilitySensor>
);

export default Drawing;
