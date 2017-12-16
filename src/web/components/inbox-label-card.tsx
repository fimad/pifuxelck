import BrushIcon from 'material-ui-icons/Brush';
import LayersIcon from 'material-ui-icons/Layers';
import PaletteIcon from 'material-ui-icons/Palette';
import SendIcon from 'material-ui-icons/Send';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import { CircularProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';
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
    gameId, label, drawing, onShowDrawing, sendPending,
    expirationTime}: Props) => {
  const drawButton = (
    <Button onClick={() => onShowDrawing(true)}>
      Draw
    </Button>
  );
  const loading = (
    <CircularProgress color='accent' />
  );
  const action = sendPending ? loading : drawButton;
  return (
    <Card style={{margin: '8px'}}>
      <CardContent>
        <Typography type='caption' align='right'>
          Expires at {new Date(expirationTime * 1000).toLocaleString()}
        </Typography>
        <Typography type='headline' component='h2'>
          {label}
        </Typography>
      </CardContent>
      <CardActions>
        {action}
      </CardActions>
    </Card>
  );
};

export default InboxLabelCard;
