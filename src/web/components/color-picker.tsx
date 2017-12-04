import * as React from 'react';
import { Color } from '../../common/models/drawing';

interface Props {
  onPickColor: (color: Color) => void;
}

interface ColorButtonProps {
  color: Color;
  onPickColor: (color: Color) => void;
}

const newColor = (red: number, green: number, blue: number) => ({
  alpha: 1,
  blue: blue / 255,
  green: green / 255,
  red: red / 255,
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
  newColor(255, 0, 255), newColor(219, 112, 147), newColor(255, 182, 193),
];

const toColor = ({red, green, blue, alpha}: Color) =>
    `rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${alpha})`;

const ColorButton = ({color, onPickColor}: ColorButtonProps) => (
  <svg key={`color-${toColor(color)}`} style={{
    display: 'block',
    flex: '0 0 auto',
    height: '100%',
    margin: '8px',
    width: 'calc(25% - 16px)',
  }} onClick={() => onPickColor(color)}
  viewBox='-1 -1 2 2'>
    <ellipse cx='0' cy='0' rx='1' ry='1' fill={toColor(color)} />
  </svg>
);

const ColorPicker = (props: Props) => (
  <div style={{
    background: 'rgba(0, 0, 0, .50)',
    height: '100%',
    margin: '0px',
    overflowY: 'scroll',
    padding: '0px',
    placeSelf: 'center',
    position: 'absolute',
    top: '0px',
    width: '100%',
  }}>
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      margin: 'auto',
      maxWidth: '65vh',
      paddingTop: '64px',
      width: '100%',
    }}>
      {colors.map((color: Color) => (<ColorButton color={color} {...props} />))}
    </div>
  </div>
);

export default ColorPicker;
