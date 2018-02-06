import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import { CircularProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { SuggestedContact } from '../../common/models/contacts';
import { addContact, ignoreSuggestedContacts } from '../actions';
import { State } from '../state';

type Props = SuggestedContact & {
  actionPending: boolean;
  onAdd: () => void;
  onIgnore: () => void;
};

const EntryComponent = (
    {actionPending, display_name, common_contacts, onAdd, onIgnore}: Props) => {
  const actions = actionPending ? (<CircularProgress color='accent' />) : (
    <div>
      <Button onClick={onAdd}>Add</Button>
      <Button onClick={onIgnore}>Ignore</Button>
    </div>
  );
  let contactsInCommon = '';
  if (common_contacts > 0) {
    const suffix = common_contacts === 1 ? '' : 's';
    contactsInCommon =
        `You have ${common_contacts} contact${suffix} in common.`;
  }
  return (
    <Card style={{margin: '8px'}}>
      <CardContent>
        <Typography type='caption' align='right'>
          Suggested contact
        </Typography>
        <Typography type='headline' component='h2'>
          <span style={{color: '#f50057'}}>{display_name} </span>
          added you! {contactsInCommon}
        </Typography>
      </CardContent>
      <CardActions>
        {actions}
      </CardActions>
    </Card>
  );
};

const mapStateToProps = ({apiStatus}: State, {id}: SuggestedContact) => ({
  actionPending: apiStatus.pendingContactAdds[id] ||
      apiStatus.pendingSuggestionIgnores[id],
}) as Props;

const mapDispatchToProps =
    (dispatch: Dispatch<State>, {id}: SuggestedContact) => ({
  onAdd: () => dispatch(addContact(id)),
  onIgnore: () => dispatch(ignoreSuggestedContacts(id)),
});

const InboxContactEntry = connect(
    mapStateToProps,
    mapDispatchToProps)(EntryComponent);

export default InboxContactEntry;
