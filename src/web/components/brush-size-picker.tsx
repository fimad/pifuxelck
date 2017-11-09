import * as React from 'react';
import { Color } from '../../common/models/drawing';
import { AppBar, Toolbar } from 'material-ui';

type Props = {
  color: Color
  onPickSize: (size: number) => void
};

type SizeButtonProps = Props & {
  size: number
};

const toColor = ({red, green, blue, alpha}: Color) =>
    `rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${alpha})`;

const SizeButton = ({size, onPickSize, color}: SizeButtonProps) => (
  <div key={`size-${size}`} style={{
      paddingTop: '5%',
      paddingBottom: '5%',
      paddingLeft: `${(1 - size) * 50}%`,
      paddingRight: `${(1 - size) * 50}%`,
  }} onClick={() => onPickSize(size)}>
    <svg viewBox="-1 -1 2 2">
      <ellipse cx='0' cy='0' rx='1' ry='1' fill={toColor(color)} />
    </svg>
  </div>
);

const sizes: number[] = [
  0.0125, 0.025, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.6
];

const BrushSizePicker = (props: Props) => (
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
      paddingTop: '50vh',
      paddingBottom: '23vh',
      margin: 'auto',
      width: '100%',
      maxWidth: '65vh',
    }}>
      {sizes.map((size: number) => (<SizeButton size={size} {...props} />))}
    </div>
  </div>
);

export default BrushSizePicker;
