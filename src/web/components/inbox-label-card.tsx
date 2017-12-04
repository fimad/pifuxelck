import BrushIcon from 'material-ui-icons/Brush';
import LayersIcon from 'material-ui-icons/Layers';
import PaletteIcon from 'material-ui-icons/Palette';
import SendIcon from 'material-ui-icons/Send';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Dialog from 'material-ui/Dialog';
import { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import * as React from 'react';
import { Route, Switch } from 'react-router';
import * as models from '../../common/models/drawing';
import { Turn } from '../../common/models/turn';
import Drawing from '../components/drawing';

interface Props {
  gameId: string;
  drawing: models.Drawing;
  label: string;
  onShowDrawing: (showDrawing: boolean) => void;
  onChange: (turn: Turn) => void;
  onSubmit: (gameId: string, turn: Turn) => void;
}

const InboxLabelCard = ({gameId, label, drawing, onShowDrawing}: Props) => (
  <Card style={{margin: '8px'}}>
    <CardContent>
      <Typography type='headline' component='h2'>
        {label}
      </Typography>
    </CardContent>
    <CardActions>
      <Button onClick={() => onShowDrawing(true)}>
        Draw
      </Button>
    </CardActions>
  </Card>
);

export default InboxLabelCard;
