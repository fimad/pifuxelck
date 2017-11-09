import * as React from 'react';
import * as models from '../../common/models/drawing';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import Drawing from '../components/drawing';
import IconButton from 'material-ui/IconButton';
import SendIcon from 'material-ui-icons/Send';
import BrushIcon from 'material-ui-icons/Brush';
import UndoIcon from 'material-ui-icons/Undo';
import LayersIcon from 'material-ui-icons/Layers';
import PaletteIcon from 'material-ui-icons/Palette';
import Typography from 'material-ui/Typography';
import Badge from 'material-ui/Badge';
import { Route, Switch } from 'react-router';
import { Turn } from '../../common/models/turn';

type Props = {
  gameId: string,
  drawing: models.Drawing
  label: string
  onChange: (turn: Turn) => void
  onSubmit: () => void
  showBrushSizeDialog: () => void
  showBrushColorDialog: () => void
  showBackgroundColorDialog: () => void
};

const Draw = ({gameId, label, drawing, showBrushColorDialog, showBrushSizeDialog, showBackgroundColorDialog}: Props) => (
  <div style={{
      display: 'flex',
      flex: '1 1',
      flexDirection: 'column',
      minWidth: '65vh',
      margin: 'auto',
      marginTop: '8px',
      marginBottom: '0px',
      placeContent: 'space-between',
  }}>
    <Card style={{flex: '0 0 auto'}}>
      <CardContent>
        <Typography type="headline" component="h2">
          {label}
        </Typography>
      </CardContent>
    </Card>
    <Card style={{flex: '0 1 auto'}}>
      <Drawing drawing={drawing} />
    </Card>
    <Card style={{flex: '0 0 auto'}}>
      <CardActions style={{justifyContent: 'space-evenly'}}>
        <IconButton>
          <UndoIcon />
        </IconButton>
        <IconButton onClick={showBrushSizeDialog}>
          <BrushIcon />
        </IconButton>
        <IconButton onClick={showBrushColorDialog}>
          <PaletteIcon />
        </IconButton>
        <IconButton onClick={showBackgroundColorDialog}>
          <LayersIcon />
        </IconButton>
        <IconButton>
          <SendIcon />
        </IconButton>
      </CardActions>
    </Card>
  </div>
);

export default Draw;
