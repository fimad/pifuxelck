import * as React from 'react';
import * as models from '../../common/models/drawing';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import Drawing from '../components/drawing';
import IconButton from 'material-ui/IconButton';
import SendIcon from 'material-ui-icons/Send';
import BrushIcon from 'material-ui-icons/Brush';
import LayersIcon from 'material-ui-icons/Layers';
import PaletteIcon from 'material-ui-icons/Palette';
import Typography from 'material-ui/Typography';
import { Route, Switch } from 'react-router';
import { Turn } from '../../common/models/turn';

type Props = {
  gameId: string
  drawing: models.Drawing
  label: string
  onShowDrawing: (showDrawing: boolean) => void
  onChange: (turn: Turn) => void
  onSubmit: () => void
};

const InboxLabelCard = ({gameId, label, drawing, onShowDrawing}: Props) => (
  <Card style={{margin: '8px'}}>
    <CardContent>
      <Typography type="headline" component="h2">
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
