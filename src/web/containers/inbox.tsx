import * as React from 'react';
import { connect } from 'react-redux';
import { SuggestedContact } from '../../common/models/contacts';
import * as models from '../../common/models/turn';
import { compareStringsAsInts } from '../../common/utils';
import InboxDrawingCard from '../components/inbox-drawing-card';
import InboxLabelCard from '../components/inbox-label-card';
import Progress from '../components/progress';
import { State } from '../state';
import InboxContactEntry from './inbox-contact-entry';
import InboxEntry from './inbox-entry';

const styles = require('./inbox.css');

interface Props {
  entries: string[];
  loading: boolean;
  suggestedContacts: SuggestedContact[];
}

const InboxComponent = ({entries, loading, suggestedContacts}: Props) => (
  <div>
    <Progress visible={loading} />
    <div className={styles.container}>
      {suggestedContacts.map((c) => (<InboxContactEntry key={c.id} {...c} />))}
      {entries.map((gameId) => (<InboxEntry key={gameId} gameId={gameId} />))}
    </div>
  </div>
);

const compareByGameId = (a: models.InboxEntry, b: models.InboxEntry) =>
    compareStringsAsInts(a.game_id, b.game_id);

const mapStateToProps = (
    {entities: {inbox, suggestedContacts}, apiStatus}: State) => ({
  entries: Object.values(inbox)
      .sort(compareByGameId)
      .map((entry) => entry.game_id),
  loading: apiStatus.inProgress.GET_INBOX,
  suggestedContacts: Object.values(suggestedContacts)
      .filter((x) => x.added_current_user && !x.no_thanks)
      .sort((a, b) => a.display_name.localeCompare(b.display_name)),
});

const Inbox = connect(mapStateToProps)(InboxComponent);

export default Inbox;
