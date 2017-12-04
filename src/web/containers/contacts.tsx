import * as cx from 'classnames';
import AddIcon from 'material-ui-icons/Add';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { addContact, changeContactLookup, userLookup } from '../actions';
import { State } from '../state';

import List, {
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from 'material-ui/List';

const styles = require('./contacts.css');

interface Props {
  addContactEnabled: boolean;
  contacts: string[];
  lookup: string;
  lookupId?: string;
  onAddContact: (lookupId: string) => void;
  onLookupChange: (lookup: string) => void;
}

const ContactsComponent = ({
    addContactEnabled, contacts, lookup, lookupId, onAddContact, onLookupChange,
  }: Props) => {
  const contactListItem = (contact: string, i: number) => (
    <ListItem key={i}>
      <ListItemText primary={contact} />
    </ListItem>
  );
  const contactList = contacts.length === 0 ?
      (
        <Typography align='center' style={{margin: '16px'}}>
          No buds. Add contacts by searching above.
        </Typography>
      ) :
      (
        <Paper style={{marginTop: '16px'}}>
          <List>
            {contacts.map(contactListItem)}
          </List>
        </Paper>
      );
  return (
    <div className={cx(styles.container, styles.contacts)}>
      <Paper style={{display: 'flex', flexDirection: 'row'}}>
        <TextField
            onChange={(event) => onLookupChange(event.target.value)}
            label='Lookup contact'
            value={lookup}
            fullWidth={true}
        />
        <Button
            onClick={() => lookupId ? onAddContact(lookupId) : null}
            disabled={!addContactEnabled}
            raised={true}
            color='accent'
        >
          <AddIcon />
        </Button>
      </Paper>
      {contactList}
    </div>
  );
};

const mapStateToProps = (state: State) => ({
  addContactEnabled: !!state.entities.users[state.ui.contacts.lookup],
  contacts: Object.keys(state.entities.contacts)
      .map((i) => state.entities.contacts[i].display_name)
      .sort(),
  lookup: state.ui.contacts.lookup,
  lookupId: state.entities.users[state.ui.contacts.lookup],
});

const mapDispatchToProps = (dispatch: Dispatch<State>) => ({
  onAddContact: (lookupId: string) => {
    dispatch(addContact(lookupId));
    dispatch(changeContactLookup(''));
  },
  onLookupChange: (lookup: string) => {
    dispatch(changeContactLookup(lookup));
    dispatch(userLookup(lookup));
  },
});

const Contacts =
    connect(mapStateToProps, mapDispatchToProps)(ContactsComponent);

export default Contacts;
