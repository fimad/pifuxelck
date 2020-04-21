import LinearProgress from '@material-ui/core/LinearProgress';
import * as React from 'react';

interface Props {
  visible: boolean;
}

const Progress = ({ visible }: Props) =>
  visible ? (
    <LinearProgress
      style={{ zIndex: 100, height: '4px', marginBottom: '-4px' }}
      color="secondary"
    />
  ) : (
    <div />
  );

export default Progress;
