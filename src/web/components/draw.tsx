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
  startLine: (point: models.Point) => void
  appendLine: (point: models.Point) => void
  stopLine: () => void
  undoLastLine: () => void
  lineInProgress: boolean
};

const passPointTo =
    (appendLine: (point: models.Point) => void, stopLine: () => void) =>
    (event: (React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>)) => {
  const boundingBox = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
  const size = Math.min(boundingBox.width, boundingBox.height);
  // The svg element may actually be a rectangle even though only the square in
  // the center of the element is valid for drawing.
  const sizeDifference = boundingBox.width - boundingBox.height;
  const xAdjustment = sizeDifference > 0 ? sizeDifference * 0.5 : 0;
  const yAdjustment = sizeDifference < 0 ? sizeDifference * -0.5 : 0;
  const touches = (event as React.TouchEvent<HTMLDivElement>).touches;
  const mouseEvent = (event as React.MouseEvent<HTMLDivElement>);
  const clientX = touches ? touches[0].clientX : mouseEvent.clientX;
  const clientY = touches ? touches[0].clientY : mouseEvent.clientY;
  const x = (clientX - boundingBox.left - xAdjustment) / size;
  const y = (clientY - boundingBox.top - yAdjustment) / size;
  appendLine({x, y});
};

const Draw = ({
      gameId, label, drawing, showBrushColorDialog, showBrushSizeDialog,
      showBackgroundColorDialog, startLine, appendLine, stopLine, undoLastLine,
      lineInProgress,
    }: Props) => (
  <div style={{
      display: 'flex',
      flex: '1 1',
      flexDirection: 'column',
      width: '100%',
      margin: 'auto',
      marginTop: '8px',
      marginBottom: '0px',
      alignItems: 'center',
      justifyContent: 'space-between',
  }}>
    <Card style={{flex: '0 0 auto'}}>
      <CardContent>
        <Typography style={{textAlign: 'center'}} type="headline" component="h2">
          {label}
        </Typography>
      </CardContent>
    </Card>
    <div style={{flex: '1 1 0%', margin: '8px', paddingLeft: 'calc(100% - 16px)', position: 'relative'}}>
      <div style={{position: 'absolute', top: '0px', bottom: '0px', left: '0px', right: '0px'}}
              onMouseUp={lineInProgress ? stopLine : undefined}
              onMouseLeave={lineInProgress ? stopLine : undefined}
              onMouseDown={lineInProgress ? stopLine : passPointTo(startLine, stopLine)}
              onMouseMove={lineInProgress ? passPointTo(appendLine, stopLine) : undefined}
              onTouchEnd={lineInProgress ? stopLine : undefined}
              onTouchStart={lineInProgress ? stopLine : passPointTo(startLine, stopLine)}
              onTouchMove={lineInProgress ? passPointTo(appendLine, stopLine) : undefined} >
        <Drawing style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
        }} drawing={drawing} />
      </div>
    </div>
    <Card style={{flex: '0 0 auto'}}>
      <CardActions style={{justifyContent: 'space-evenly'}}>
        <IconButton onClick={undoLastLine}>
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
