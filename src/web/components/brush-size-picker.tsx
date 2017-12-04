import { AppBar, Toolbar } from 'material-ui';
import * as React from 'react';
import { Color } from '../../common/models/drawing';

interface Props {
  color: Color;
  onPickSize: (size: number) => void;
}

type SizeButtonProps = Props & {
  size: number,
};

const toColor = ({red, green, blue, alpha}: Color) =>
    `rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${alpha})`;

const SizeButton = ({size, onPickSize, color}: SizeButtonProps) => (
  <div key={`size-${size}`} style={{
      paddingBottom: '5%',
      paddingLeft: `${(1 - size) * 50}%`,
      paddingRight: `${(1 - size) * 50}%`,
      paddingTop: '5%',
  }} onClick={() => onPickSize(size)}>
    <svg viewBox='-1 -1 2 2'>
      <ellipse cx='0' cy='0' rx='1' ry='1' fill={toColor(color)} />
    </svg>
  </div>
);

const sizes: number[] = [
  0.0125, 0.025, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.6,
];

const BrushSizePicker = (props: Props) => (
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
      margin: 'auto',
      maxWidth: '65vh',
      paddingBottom: '23vh',
      paddingTop: '50vh',
      width: '100%',
    }}>
      {sizes.map((size: number) => (<SizeButton size={size} {...props} />))}
    </div>
  </div>
);

export default BrushSizePicker;
