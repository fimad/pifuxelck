import * as React from 'react';
import { connect } from 'react-redux';
import * as models from '../../common/models/turn';
import { compareStringsAsInts } from '../../common/utils';
import InboxDrawingCard from '../components/inbox-drawing-card';
import InboxLabelCard from '../components/inbox-label-card';
import Progress from '../components/progress';
import { State } from '../state';
import InboxEntry from './inbox-entry';

const styles = require('./inbox.css');

interface Props {
  entries: string[];
  loading: boolean;
}

const InboxComponent = ({entries, loading}: Props) => (
  <div>
    <Progress visible={loading} />
    <div className={styles.container}>
      {entries.map((gameId) => (<InboxEntry key={gameId} gameId={gameId} />))}
    </div>
  </div>
);

const compareByGameId = (a: models.InboxEntry, b: models.InboxEntry) =>
    compareStringsAsInts(a.game_id, b.game_id);

const mapStateToProps = ({entities: {inbox}, apiStatus}: State) => ({
  entries: Object.values(inbox)
      .sort(compareByGameId)
      .map((entry) => entry.game_id),
  loading: apiStatus.inProgress.GET_INBOX,
});

const Inbox = connect(mapStateToProps)(InboxComponent);

export default Inbox;
