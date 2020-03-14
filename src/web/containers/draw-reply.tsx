import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { push } from 'connected-react-router';
import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { Route, Switch } from 'react-router';
import { Dispatch } from 'redux';

import { Color, Drawing, Point } from '../../common/models/drawing';
import {
  Turn,
  drawingOrDefault,
  labelOrDefault,
} from '../../common/models/turn';
import {
  appendDrawingLine,
  chooseBrushColor,
  chooseBrushSize,
  gotoInbox,
  playDrawingTurn,
  redoDrawingLine,
  startDrawingLine,
  stopDrawingLine,
  undoDrawingLine,
  updateBackgroundColor,
  updateOutbox,
} from '../actions';
import BrushSizePicker from '../components/brush-size-picker';
import ColorPicker from '../components/color-picker';
import Draw from '../components/draw';
import { OutboxEntry, State } from '../state';
import { WebDispatch } from '../store';

interface ExternalProps {
  gameId: string;
}

type Props = ExternalProps & {
  redirectToInbox: boolean;
  drawing: Drawing;
  label: string;
  onSubmit: (gameId: string, drawing: Drawing) => void;
  onChange: (turn: Turn) => void;
  hideDialog: () => void;
  showBrushSizeDialog: () => void;
  showBrushColorDialog: () => void;
  showBackgroundColorDialog: () => void;
  startLine: (point: Point) => void;
  appendLine: (point: Point) => void;
  stopLine: () => void;
  undoLastLine: () => void;
  redoLastLine: () => void;
  lineInProgress: boolean;
  brushColor: Color;
  onPickBrushSize: (size: number) => void;
  onPickBrushColor: (color: Color) => void;
  onPickBackgroundColor: (color: Color) => void;
};

const DrawComponent = (props: Props) =>
  props.redirectToInbox === true ? (
    <Redirect to="/" />
  ) : (
    <div style={{ flex: '1 1', display: 'flex', flexDirection: 'column' }}>
      <Draw {...props} />
      <Switch>
        <Route exact={true} path="/draw/:id/brush/size">
          <BrushSizePicker
            color={props.brushColor}
            onPickSize={props.onPickBrushSize}
          />
        </Route>
        <Route exact={true} path="/draw/:id/brush/color">
          <ColorPicker onPickColor={props.onPickBrushColor} />
        </Route>
        <Route exact={true} path="/draw/:id/bg/color">
          <ColorPicker onPickColor={props.onPickBackgroundColor} />
        </Route>
      </Switch>
    </div>
  );

function mapStateToProps(
  { entities: { inbox }, ui }: State,
  { gameId }: ExternalProps
) {
  const previous = inbox[gameId].previous_turn;
  if (!previous || previous.is_drawing) {
    return { redirectToInbox: true } as Props;
  }
  const current =
    (ui.outbox[gameId] || ({} as OutboxEntry)).turn || ({} as Turn);
  return {
    brushColor: ui.drawing.brushColor,
    drawing: drawingOrDefault(current),
    label: labelOrDefault(previous),
    lineInProgress: ui.drawing.inProgress,
    redirectToInbox: false,
  } as Props;
}

const mapDispatchToProps = (
  dispatch: WebDispatch,
  { gameId }: ExternalProps
) => ({
  appendLine: (point: Point) => dispatch(appendDrawingLine(gameId, point)),
  hideDialog: () => dispatch(push(`/draw/${gameId}`)),
  onChange: (turn: Turn) => dispatch(updateOutbox(gameId, turn)),
  onPickBackgroundColor: (color: Color) => {
    dispatch(updateBackgroundColor(gameId, color));
    dispatch(push(`/draw/${gameId}`));
  },
  onPickBrushColor: (color: Color) => {
    dispatch(chooseBrushColor(color));
    dispatch(push(`/draw/${gameId}`));
  },
  onPickBrushSize: (size: number) => {
    dispatch(chooseBrushSize(size));
    dispatch(push(`/draw/${gameId}`));
  },
  onSubmit: (id: string, drawing: Drawing) => {
    dispatch(playDrawingTurn(id, drawing));
    dispatch(gotoInbox());
  },
  redoLastLine: () => dispatch(redoDrawingLine(gameId)),
  showBackgroundColorDialog: () => dispatch(push(`/draw/${gameId}/bg/color`)),
  showBrushColorDialog: () => dispatch(push(`/draw/${gameId}/brush/color`)),
  showBrushSizeDialog: () => dispatch(push(`/draw/${gameId}/brush/size`)),
  startLine: (point: Point) => dispatch(startDrawingLine(gameId, point)),
  stopLine: () => dispatch(stopDrawingLine()),
  undoLastLine: () => dispatch(undoDrawingLine(gameId)),
});

const DrawReply = connect(mapStateToProps, mapDispatchToProps, null, {
  pure: false,
})(DrawComponent);

export default DrawReply;
