import * as React from 'react';
import { connect } from 'react-redux';
import * as models from '../../common/models/turn';
import { compareStringsAsInts } from '../../common/utils';
import InboxDrawingCard from '../components/inbox-drawing-card';
import InboxLabelCard from '../components/inbox-label-card';
import { State } from '../state';
import InboxEntry from './inbox-entry';

const styles = require('./inbox.css');

interface Props {
  entries: string[];
}

const InboxComponent = ({entries}: Props) => (
  <div className={styles.container}>
    {entries.map((gameId) => (<InboxEntry key={gameId} gameId={gameId} />))}
  </div>
);

const compareByGameId = (a: models.InboxEntry, b: models.InboxEntry) =>
    compareStringsAsInts(a.game_id, b.game_id);

const mapStateToProps = ({entities: {inbox}}: State) => ({
  entries: Object.values(inbox)
      .sort(compareByGameId)
      .map((entry) => entry.game_id),
});

const Inbox = connect(mapStateToProps)(InboxComponent);

export default Inbox;
