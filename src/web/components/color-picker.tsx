import * as React from 'react';
import { Color } from '../../common/models/drawing';

type Props = {
  onPickColor: (color: Color) => void
};

type ColorButtonProps = {
  onPickColor: (color: Color) => void
  color: Color
};

const newColor = (red: number, green: number, blue: number) => ({
  red: red / 255,
  green: green / 255,
  blue: blue / 255,
  alpha: 1,
}) as Color;

const colors = [
  // Black, greys, and white:
  newColor(0, 0, 0), newColor(190, 190, 190), newColor(167, 167, 167),
  newColor(220, 220, 220), newColor(248, 248, 255), newColor(255, 255, 255),

  // Blues:
  newColor(25, 25, 112), newColor(0, 0, 255), newColor(64, 105, 255),
  newColor(0, 191, 255), newColor(135, 206, 235), newColor(173, 216, 230),

  // Greens:
  newColor(0, 100, 0), newColor(107, 142, 35), newColor(0, 128, 0),
  newColor(46, 139, 87), newColor(60, 179, 113), newColor(0, 255, 127),

  // Yellows:
  newColor(184, 134, 11), newColor(255, 140, 0), newColor(255, 165, 0),
  newColor(255, 255, 0), newColor(238, 232, 170), newColor(250, 250, 210),

  // Reds:
  newColor(178, 34, 34), newColor(165, 42, 42), newColor(205, 92, 92),
  newColor(250, 128, 114), newColor(255, 160, 122), newColor(255, 228, 181),

  // Oranges:
  newColor(128, 0, 0), newColor(210, 105, 30), newColor(255, 0, 0),
  newColor(255, 99, 71), newColor(244, 164, 96), newColor(245, 222, 179),

  // Purples:
  newColor(139, 0, 139), newColor(208, 32, 144), newColor(255, 20, 147),
  newColor(255, 0, 255), newColor(219, 112, 147), newColor(255, 182, 193)
];

const toColor = ({red, green, blue, alpha}: Color) =>
    `rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${alpha})`;

const ColorButton = ({color, onPickColor}: ColorButtonProps) => (
  <svg key={`color-${toColor(color)}`} style={{
    flex: '0 0 auto',
    margin: '8px',
    width: 'calc(25% - 16px)',
    height: '100%',
    display: 'block',
  }} onClick={() => onPickColor(color)}
  viewBox="-1 -1 2 2">
    <ellipse cx='0' cy='0' rx='1' ry='1' fill={toColor(color)} />
  </svg>
);

const ColorPicker = (props: Props) => (
  <div style={{
    position: 'absolute',
    background: 'rgba(0, 0, 0, .50)',
    placeSelf: 'center',
    top: '0px',
    width: '100%',
    height: '100%',
    overflowY: 'scroll',
    margin: '0px',
    padding: '0px',
  }}>
    <div style={{
      paddingTop: '64px',
      margin: 'auto',
      width: '100%',
      maxWidth: '65vh',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      {colors.map((color: Color) => (<ColorButton color={color} {...props} />))}
    </div>
  </div>
);

export default ColorPicker;
