import { AppBar, Toolbar } from 'material-ui';
import * as React from 'react';
import { Color } from '../../common/models/drawing';

const styles = require('./brush-size-picker.css');

interface Props {
  color: Color;
  onPickSize: (size: number) => void;
}

type SizeButtonProps = Props & {
  size: number,
};

const toColor = ({red, green, blue, alpha}: Color) =>
    `rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${alpha})`;

const SizeButton = ({size, onPickSize, color}: SizeButtonProps) => {
  const style = {
    paddingBottom: '5%',
    paddingLeft: `${(1 - size) * 50}%`,
    paddingRight: `${(1 - size) * 50}%`,
    paddingTop: '5%',
  };
  return (
    <div
        key={`size-${size}`}
        style={style}
        onClick={() => onPickSize(size)}
    >
      <svg viewBox='-1 -1 2 2'>
        <ellipse cx='0' cy='0' rx='1' ry='1' fill={toColor(color)} />
      </svg>
    </div>
  );
};

const sizes: number[] = [
  0.0125, 0.025, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.6,
];

const BrushSizePicker = (props: Props) => (
  <div className={styles.brushSizePickerContainer}>
    <div className={styles.brushSizePicker}>
      {sizes.map((size: number) => (<SizeButton size={size} {...props} />))}
    </div>
  </div>
);

export default BrushSizePicker;
