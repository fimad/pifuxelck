import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import BrushIcon from '@material-ui/icons/Brush';
import LayersIcon from '@material-ui/icons/Layers';
import PaletteIcon from '@material-ui/icons/Palette';
import RedoIcon from '@material-ui/icons/Redo';
import SendIcon from '@material-ui/icons/Send';
import UndoIcon from '@material-ui/icons/Undo';
import * as cx from 'classnames';
import * as MobileDetect from 'mobile-detect';
import * as React from 'react';
import { Route, Switch } from 'react-router';

import * as models from '../../common/models/drawing';
import { Turn } from '../../common/models/turn';
import Drawing from '../components/drawing';

const styles = require('./draw.css');

interface Props {
  brushColor: models.Color;
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
  redoLastLine: () => void;
  lineInProgress: boolean;
}

type MouseOrTouch =
  | React.MouseEvent<HTMLDivElement>
  | React.TouchEvent<HTMLDivElement>;

const passPointTo = (
  appendLine: (point: models.Point) => void,
  stopLine: () => void
) => (event: MouseOrTouch) => {
  const boundingBox = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
  const size = Math.min(boundingBox.width, boundingBox.height);
  // The svg element may actually be a rectangle even though only the square in
  // the center of the element is valid for drawing.
  const sizeDifference = boundingBox.width - boundingBox.height;
  const xAdjustment = sizeDifference > 0 ? sizeDifference * 0.5 : 0;
  const yAdjustment = sizeDifference < 0 ? sizeDifference * -0.5 : 0;
  const touches = (event as React.TouchEvent<HTMLDivElement>).touches;
  const mouseEvent = event as React.MouseEvent<HTMLDivElement>;
  const clientX = touches ? touches[0].clientX : mouseEvent.clientX;
  const clientY = touches ? touches[0].clientY : mouseEvent.clientY;
  const x = (clientX - boundingBox.left - xAdjustment) / size;
  const y = (clientY - boundingBox.top - yAdjustment) / size;
  appendLine({ x, y });
};

interface State {
  // On iOS this is used to force a redraw of the drawing SVG with fresh DOM
  // elements.
  drawKey: number;
}

const ColorBadge = ({ color }: { color: models.Color }) => {
  const backgroundColor = `rgb(
      ${color.red * 255},
      ${color.green * 255},
      ${color.blue * 255})`;
  const style = {
    backgroundColor,
    borderColor: 'rgba(0, 0, 0, .25)',
    borderRadius: '50%',
    borderStyle: 'solid',
    borderWidth: '1px',
    height: '8px',
    position: 'absolute',
    right: '8px',
    top: '8px',
    width: '8px',
  } as React.CSSProperties;
  return <div style={style} />;
};

class Draw extends React.Component {
  public divNode: HTMLDivElement;
  public props: Props;
  public state: State;
  private mobileDetect: MobileDetect;

  constructor(props: Props) {
    super(props);
    this.state = { drawKey: 0 };
    this.mobileDetect = new MobileDetect(window.navigator.userAgent);
  }

  public componentDidMount() {
    (this.divNode as any).addEventListener('touchend', this.onTouchEnd, {
      passive: false,
    });
    (this.divNode as any).addEventListener('touchstart', this.onTouchStart, {
      passive: false,
    });
    (this.divNode as any).addEventListener('touchmove', this.onTouchMove, {
      passive: false,
    });
  }

  public onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (this.props.lineInProgress) {
      this.props.stopLine();
      if (this.mobileDetect.os() === 'iOS') {
        this.setState({ drawKey: this.state.drawKey + 1 });
      }
    }
    event.preventDefault();
  };

  public onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (this.props.lineInProgress) {
      this.props.stopLine();
      if (this.mobileDetect.os() === 'iOS') {
        this.setState({ drawKey: this.state.drawKey + 1 });
      }
    } else {
      passPointTo(this.props.startLine, this.props.stopLine)(event);
    }
    event.preventDefault();
  };

  public onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (this.props.lineInProgress) {
      passPointTo(this.props.appendLine, this.props.stopLine)(event);
    }
    event.preventDefault();
  };

  public render() {
    const {
      gameId,
      label,
      drawing,
      showBrushColorDialog,
      showBrushSizeDialog,
      showBackgroundColorDialog,
      startLine,
      appendLine,
      stopLine,
      undoLastLine,
      redoLastLine,
      lineInProgress,
      onSubmit,
      brushColor,
    } = this.props;
    const onMouseUp = lineInProgress ? stopLine : undefined;
    const onMouseLeave = lineInProgress ? stopLine : undefined;
    const onMouseDown = lineInProgress
      ? stopLine
      : passPointTo(startLine, stopLine);
    const onMouseMove = lineInProgress
      ? passPointTo(appendLine, stopLine)
      : undefined;
    const undoLastLineAndIncKey = () => {
      undoLastLine();
      this.setState({ drawKey: this.state.drawKey + 1 });
    };
    const redoLastLineAndIncKey = () => {
      redoLastLine();
      this.setState({ drawKey: this.state.drawKey + 1 });
    };
    return (
      <div className={styles.drawingReplyContainer}>
        <Card className={styles.labelCard}>
          <CardContent>
            <Typography
              className={styles.labelTypography}
              variant="h5"
              component="h2"
            >
              {label}
            </Typography>
          </CardContent>
        </Card>
        <div className={styles.drawingWrapper}>
          <div
            className={styles.drawingContainer}
            ref={(node) => {
              this.divNode = node;
            }}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
          >
            <Drawing
              key={`draw-${this.state.drawKey}`}
              className={styles.drawing}
              drawing={drawing}
            />
          </div>
        </div>
        <Card className={styles.actionsCard}>
          <CardActions className={styles.actions}>
            <IconButton onClick={undoLastLineAndIncKey}>
              <UndoIcon />
            </IconButton>
            <IconButton onClick={redoLastLineAndIncKey}>
              <RedoIcon />
            </IconButton>
            <IconButton onClick={showBrushSizeDialog}>
              <BrushIcon />
            </IconButton>
            <IconButton onClick={showBrushColorDialog}>
              <PaletteIcon />
              <ColorBadge color={brushColor} />
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
