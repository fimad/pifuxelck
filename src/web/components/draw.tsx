import * as cx from 'classnames';
import BrushIcon from 'material-ui-icons/Brush';
import LayersIcon from 'material-ui-icons/Layers';
import PaletteIcon from 'material-ui-icons/Palette';
import SendIcon from 'material-ui-icons/Send';
import UndoIcon from 'material-ui-icons/Undo';
import Badge from 'material-ui/Badge';
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

const styles = require('./draw.css');

interface Props {
  gameId: string;
  drawing: models.Drawing;
  label: string;
  onChange: (turn: Turn) => void;
  onSubmit: (gameId: string, drawing: models.Drawing) => void;
  showBrushSizeDialog: () => void;
  showBrushColorDialog: () => void;
  showBackgroundColorDialog: () => void;
  startLine: (point: models.Point) => void;
  appendLine: (point: models.Point) => void;
  stopLine: () => void;
  undoLastLine: () => void;
  lineInProgress: boolean;
}

type MouseOrTouch =
    React.MouseEvent<HTMLDivElement> |
    React.TouchEvent<HTMLDivElement>;

const passPointTo =
    (appendLine: (point: models.Point) => void, stopLine: () => void) =>
    (event: MouseOrTouch) => {
  const boundingBox =
      (event.currentTarget as HTMLDivElement).getBoundingClientRect();
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

class Draw extends React.Component {

  public divNode: HTMLDivElement;
  public props: Props;

  public componentDidMount() {
    (this.divNode as any).addEventListener(
        'touchend', this.onTouchEnd, {passive: false});
    (this.divNode as any).addEventListener(
        'touchstart', this.onTouchStart, {passive: false});
    (this.divNode as any).addEventListener(
        'touchmove', this.onTouchMove, {passive: false});
  }

  public onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (this.props.lineInProgress) {
      this.props.stopLine();
    }
    event.preventDefault();
  }

  public onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (this.props.lineInProgress) {
      this.props.stopLine();
    } else {
      passPointTo(this.props.startLine, this.props.stopLine)(event);
    }
    event.preventDefault();
  }

  public onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (this.props.lineInProgress) {
      passPointTo(this.props.appendLine, this.props.stopLine)(event);
    }
    event.preventDefault();
  }

  public render() {
    const {
      gameId, label, drawing, showBrushColorDialog, showBrushSizeDialog,
      showBackgroundColorDialog, startLine, appendLine, stopLine, undoLastLine,
      lineInProgress, onSubmit,
    } = this.props;
    return (
      <div className={styles.drawingReplyContainer}>
        <Card className={styles.labelCard}>
          <CardContent>
            <Typography
                className={styles.labelTypography}
                type='headline'
                component='h2'>
              {label}
            </Typography>
          </CardContent>
        </Card>
        <div className={styles.drawingWrapper}>
          <div className={styles.drawingContainer}
              ref={(node) => { this.divNode = node; }}
              onMouseUp={lineInProgress ? stopLine : undefined}
              onMouseLeave={lineInProgress ? stopLine : undefined}
              onMouseDown={lineInProgress ?
                  stopLine :
                  passPointTo(startLine, stopLine)}
              onMouseMove={lineInProgress ?
                  passPointTo(appendLine, stopLine)
                  : undefined}>
            <Drawing className={styles.drawing} drawing={drawing} />
          </div>
        </div>
        <Card className={styles.actionsCard}>
          <CardActions className={styles.actions}>
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
            <IconButton onClick={() => onSubmit(gameId, drawing)}>
              <SendIcon />
            </IconButton>
          </CardActions>
        </Card>
      </div>
    );
  }
}

export default Draw;
