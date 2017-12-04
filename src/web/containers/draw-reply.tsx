import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { Route, Switch } from 'react-router';
import { Dispatch } from 'redux';
import { Color, Drawing, Point} from '../../common/models/drawing';
import BrushSizePicker from '../components/brush-size-picker';
import ColorPicker from '../components/color-picker';
import Draw from '../components/draw';
import { State } from '../state';

import {
  drawingOrDefault,
  labelOrDefault,
  Turn,
} from '../../common/models/turn';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';

import {
  appendDrawingLine,
  chooseBrushColor,
  chooseBrushSize,
  gotoInbox,
  playDrawingTurn,
  startDrawingLine,
  stopDrawingLine,
  undoDrawingLine,
  updateBackgroundColor,
  updateOutbox,
} from '../actions';

const { push } = require('react-router-redux');

interface ExternalProps {
  gameId: string;
}

type Props = ExternalProps & {
  redirectToInbox: boolean
  drawing: Drawing
  label: string
  onSubmit: (gameId: string, drawing: Drawing) => void
  onChange: (turn: Turn) => void
  hideDialog: () => void
  showBrushSizeDialog: () => void
  showBrushColorDialog: () => void
  showBackgroundColorDialog: () => void
  startLine: (point: Point) => void
  appendLine: (point: Point) => void
  stopLine: () => void
  undoLastLine: () => void
  lineInProgress: boolean
  brushColor: Color
  onPickBrushSize: (size: number) => void
  onPickBrushColor: (color: Color) => void
  onPickBackgroundColor: (color: Color) => void,
};

const DrawComponent = (props: Props) =>
  props.redirectToInbox === true ?
      (<Redirect to='/' />) :
      (
        <div style={{flex: '1 1', display: 'flex', flexDirection: 'column'}}>
          <Draw {...props} />
          <Switch>
            <Route exact path='/draw/:id/brush/size'>
              <BrushSizePicker
                  color={props.brushColor}
                  onPickSize={props.onPickBrushSize} />
            </Route>
            <Route exact path='/draw/:id/brush/color'>
              <ColorPicker onPickColor={props.onPickBrushColor} />
            </Route>
            <Route exact path='/draw/:id/bg/color'>
              <ColorPicker onPickColor={props.onPickBackgroundColor} />
            </Route>
          </Switch>
        </div>
      );

function mapStateToProps(
    {entities: {inbox}, ui}: State, {gameId}: ExternalProps) {
  const previous = inbox[gameId].previous_turn;
  if (!previous || previous.is_drawing) {
    return {redirectToInbox: true} as Props;
  }
  const current = ui.outbox[gameId] || ({} as Turn);
  return {
    brushColor: ui.drawing.brushColor,
    drawing: drawingOrDefault(current),
    label: labelOrDefault(previous),
    lineInProgress: ui.drawing.inProgress,
    redirectToInbox: false,
  } as Props;
}

const mapDispatchToProps =
    (dispatch: Dispatch<State>, {gameId}: ExternalProps) => ({
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
  showBackgroundColorDialog: () => dispatch(push(`/draw/${gameId}/bg/color`)),
  showBrushColorDialog: () => dispatch(push(`/draw/${gameId}/brush/color`)),
  showBrushSizeDialog: () => dispatch(push(`/draw/${gameId}/brush/size`)),
  startLine: (point: Point) => dispatch(startDrawingLine(gameId, point)),
  stopLine: () => dispatch(stopDrawingLine()),
  undoLastLine: () => dispatch(undoDrawingLine(gameId)),
});

const DrawReply = connect(
    mapStateToProps, mapDispatchToProps, null, {pure: false})(DrawComponent);

export default DrawReply;
