import * as React from 'react';
import InboxDrawingCard from '../components/inbox-drawing-card';
import InboxLabelCard from '../components/inbox-label-card';
import { Dispatch } from 'redux';
import { Drawing } from '../../common/models/drawing';
import { State } from '../state';
import { Turn, drawingOrDefault, labelOrDefault } from '../../common/models/turn';
import { compareStringsAsInts } from '../../common/utils';
import { connect } from 'react-redux';
import { updateOutbox } from '../actions';

type ExternalProps = {
  gameId: string;
}

type Props = ExternalProps & {
  drawing: Drawing,
  label: string,
  onSubmit: () => void,
  previousIsDrawing: boolean,
  onChange: (turn: Turn) => void,
};

const EntryComponent = (props: Props) =>
  props.previousIsDrawing == true ?
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
};

const mapDispatchToProps = (dispatch: Dispatch<State>, {gameId}: ExternalProps) => ({
  onChange: (turn: Turn) => dispatch(updateOutbox(gameId, turn)),
  onSubmit: () => {},
});

const InboxEntry = connect(mapStateToProps, mapDispatchToProps)(EntryComponent);

export default InboxEntry;
