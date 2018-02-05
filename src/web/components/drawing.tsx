import * as React from 'react';
import * as models from '../../common/models/drawing';

interface Props {
  style?: any;
  className?: string;
  drawing: models.Drawing;
}

const toColor = ({red, green, blue, alpha}: models.Color) =>
    `rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${alpha})`;

const drawLine = ({color, points, size}: models.Line, i: number) => {
  const svgPoints = [points[0], ...points]
      .map(({x, y}: models.Point) => `${x},${y}`)
      .join(' ');
  return (
    <polyline
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
        stroke={toColor(color)}
        strokeWidth={size}
        key={i}
        points={svgPoints}
    />
  );
};

const Drawing = ({
    className,
    drawing: {background_color, lines},
    style}: Props) => (
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
      {lines.map(drawLine)}
    </g>
  </svg>
);

export default Drawing;
