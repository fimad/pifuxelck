import * as React from 'react';
import BrushSizePicker from '../components/brush-size-picker';
import ColorPicker from '../components/color-picker';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import Draw from '../components/draw';
import { Dispatch } from 'redux';
import { Drawing, Point, Color} from '../../common/models/drawing';
import { Redirect } from 'react-router';
import { Route, Switch } from 'react-router';
import { State } from '../state';
import { Turn, drawingOrDefault, labelOrDefault } from '../../common/models/turn';
import { connect } from 'react-redux';

import {
  appendDrawingLine,
  chooseBrushColor,
  chooseBrushSize,
  startDrawingLine,
  stopDrawingLine,
  undoDrawingLine,
  updateBackgroundColor,
  updateOutbox,
} from '../actions';

const { push } = require('react-router-redux');

type ExternalProps = {
  gameId: string
}

type Props = ExternalProps & {
  redirectToInbox: boolean
  drawing: Drawing
  label: string
  onSubmit: () => void
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
  onPickBackgroundColor: (color: Color) => void
};

const DrawComponent = (props: Props) =>
  props.redirectToInbox == true ?
      (<Redirect to="/" />) :
      (
        <div style={{flex: '1 1', display: 'flex', flexDirection: 'column'}}>
          <Draw {...props} />
          <Switch>
            <Route exact path='/draw/:id/brush/size'>
              <BrushSizePicker color={props.brushColor} onPickSize={props.onPickBrushSize} />
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
    redirectToInbox: false,
    label: labelOrDefault(previous),
    drawing: drawingOrDefault(current),
    lineInProgress: ui.drawing.inProgress,
    brushColor: ui.drawing.brushColor,
  } as Props;
};

const mapDispatchToProps = (dispatch: Dispatch<State>, {gameId}: ExternalProps) => ({
  onChange: (turn: Turn) => dispatch(updateOutbox(gameId, turn)),
  hideDialog: () => dispatch(push(`/draw/${gameId}`)),
  showBrushSizeDialog: () => dispatch(push(`/draw/${gameId}/brush/size`)),
  showBrushColorDialog: () => dispatch(push(`/draw/${gameId}/brush/color`)),
  showBackgroundColorDialog: () => dispatch(push(`/draw/${gameId}/bg/color`)),
  startLine: (point: Point) => dispatch(startDrawingLine(gameId, point)),
  appendLine: (point: Point) => dispatch(appendDrawingLine(gameId, point)),
  stopLine: () => dispatch(stopDrawingLine()),
  undoLastLine: () => dispatch(undoDrawingLine(gameId)),
  onPickBrushSize: (size: number) => {
    dispatch(chooseBrushSize(size));
    dispatch(push(`/draw/${gameId}`));
  },
  onPickBrushColor: (color: Color) => {
    dispatch(chooseBrushColor(color));
    dispatch(push(`/draw/${gameId}`));
  },
  onPickBackgroundColor: (color: Color) => {
    dispatch(updateBackgroundColor(gameId, color));
    dispatch(push(`/draw/${gameId}`));
  },
});

const DrawReply = connect(mapStateToProps, mapDispatchToProps, null, {pure: false})(DrawComponent);

export default DrawReply;
