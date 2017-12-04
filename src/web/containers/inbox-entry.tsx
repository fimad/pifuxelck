import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Drawing } from '../../common/models/drawing';
import { compareStringsAsInts } from '../../common/utils';
import { playDrawingTurn, playLabelTurn, updateOutbox } from '../actions';
import InboxDrawingCard from '../components/inbox-drawing-card';
import InboxLabelCard from '../components/inbox-label-card';
import { State } from '../state';

import {
  drawingOrDefault,
  labelOrDefault,
  Turn,
} from '../../common/models/turn';

const { push } = require('react-router-redux');

interface ExternalProps {
  gameId: string;
}

type Props = ExternalProps & {
  drawing: Drawing
  label: string
  onSubmit: (gameId: string, turn: Turn) => void
  previousIsDrawing: boolean
  onChange: (turn: Turn) => void
  onShowDrawing: (showDrawing: boolean) => void,
};

const EntryComponent = (props: Props) =>
  props.previousIsDrawing === true ?
      (<InboxDrawingCard {...props} />) :
      (<InboxLabelCard {...props} />);

function mapStateToProps(
    {entities: {inbox}, ui: {outbox}}: State, ownProps: ExternalProps) {
  const {gameId} = ownProps;
  const previous = inbox[gameId].previous_turn;
  const previousIsDrawing = previous.is_drawing;
  const current = outbox[gameId] || ({} as Turn);
  const drawing = previousIsDrawing ?
      drawingOrDefault(previous) :
      drawingOrDefault(current);
  const label = !previousIsDrawing ?
      labelOrDefault(previous) :
      labelOrDefault(current);
  return { previousIsDrawing, label, drawing } as Props;
}

const mapDispatchToProps =
    (dispatch: Dispatch<State>, {gameId}: ExternalProps) => ({
  onChange: (turn: Turn) => dispatch(updateOutbox(gameId, turn)),
  onShowDrawing: (showDrawing: boolean) =>
      dispatch(push(showDrawing ? `/draw/${gameId}` : '/')),
  onSubmit: (id: string, turn: Turn) => {
    dispatch(turn.is_drawing === true ?
        playDrawingTurn(id, turn.drawing) :
        playLabelTurn(id, turn.label));
  },
});

const InboxEntry = connect(mapStateToProps, mapDispatchToProps)(EntryComponent);

export default InboxEntry;
