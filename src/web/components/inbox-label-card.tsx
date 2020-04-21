import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import BrushIcon from '@material-ui/icons/Brush';
import LayersIcon from '@material-ui/icons/Layers';
import PaletteIcon from '@material-ui/icons/Palette';
import SendIcon from '@material-ui/icons/Send';
import * as React from 'react';
import { Route, Switch } from 'react-router';

import * as models from '../../common/models/drawing';
import { Turn } from '../../common/models/turn';
import Drawing from '../components/drawing';

interface Props {
  gameId: string;
  drawing: models.Drawing;
  expirationTime: number;
  label: string;
  onShowDrawing: (showDrawing: boolean) => void;
  onChange: (turn: Turn) => void;
  onSubmit: (gameId: string, turn: Turn) => void;
  sendPending: boolean;
}

const InboxLabelCard = ({
  gameId,
  label,
  drawing,
  onShowDrawing,
  sendPending,
  expirationTime,
}: Props) => {
  const drawButton = <Button onClick={() => onShowDrawing(true)}>Draw</Button>;
  const loading = <CircularProgress color="secondary" />;
  const action = sendPending ? loading : drawButton;
  return (
    <Card style={{ margin: '8px' }}>
      <CardContent>
        <Typography variant="caption" align="right">
          Expires at {new Date(expirationTime * 1000).toLocaleString()}
        </Typography>
        <Typography variant="h5" component="h2">
          {label}
        </Typography>
      </CardContent>
      <CardActions>{action}</CardActions>
    </Card>
  );
};

export default InboxLabelCard;
