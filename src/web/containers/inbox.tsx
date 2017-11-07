import * as React from 'react';
import InboxDrawingCard from '../components/inbox-drawing-card';
import InboxLabelCard from '../components/inbox-label-card';
import { InboxEntry } from '../../common/models/turn';
import { State } from '../state';
import { Turn } from '../../common/models/turn';
import { compareStringsAsInts } from '../../common/utils';
import { connect } from 'react-redux';

type Props = {
  inbox: InboxEntry[],
};

const toCard = ({previous_turn}: InboxEntry) =>
  previous_turn.is_drawing == true ?
      (<InboxDrawingCard drawing={previous_turn.drawing} />) :
      (<InboxLabelCard label={previous_turn.label} />);

const InboxComponent = ({inbox}: Props) => (
  <div style={{maxWidth: '75vh', margin: 'auto'}}>
    {inbox.map(toCard)}
  </div>
);

const compareByGameId = (a: InboxEntry, b: InboxEntry) =>
    compareStringsAsInts(a.game_id, b.game_id);

const mapStateToProps = ({entities: {inbox}}: State) => ({
  inbox: Object.values(inbox).sort(compareByGameId),
});

const Inbox = connect(mapStateToProps)(InboxComponent);

export default Inbox;
