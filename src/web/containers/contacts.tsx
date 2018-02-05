import * as cx from 'classnames';
import AddIcon from 'material-ui-icons/Add';
import RemoveIcon from 'material-ui-icons/Delete';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import { CircularProgress } from 'material-ui/Progress';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import Progress from '../components/progress';
import { State } from '../state';

import {
  addContact,
  changeContactLookup,
  removeContact,
  userLookup,
} from '../actions';

import List, {
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from 'material-ui/List';

const styles = require('./contacts.css');

interface SlimContact {
  name: string;
  id: string;
  pendingDelete: boolean;
}

interface Props {
  addContactEnabled: boolean;
  contacts: SlimContact[];
  loading: boolean;
  lookup: string;
  lookupId?: string;
  onAddContact: (lookupId: string) => void;
  onRemoveContact: (lookupId: string) => void;
  onLookupChange: (lookup: string) => void;
}

const ContactsComponent = ({
    addContactEnabled, contacts, lookup, lookupId, onAddContact, onLookupChange,
    onRemoveContact, loading,
  }: Props) => {
  const contactListItem = ({name, id, pendingDelete}: SlimContact) => {
    const action = pendingDelete ? (<CircularProgress color='accent' />) : (
      <IconButton onClick={() => onRemoveContact(id)}>
        <RemoveIcon />
      </IconButton>
    );
    return (
      <ListItem key={id}>
        <ListItemText primary={name} />
        <ListItemSecondaryAction>
          {action}
        </ListItemSecondaryAction>
      </ListItem>
    );
  };
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
    <div>
      <Progress visible={loading} />
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
    </div>
  );
};

const compareByDisplayName =
    (a: SlimContact, b: SlimContact) => a.name.localeCompare(b.name);

const mapStateToProps = (state: State) => ({
  addContactEnabled: !!state.entities.users[state.ui.contacts.lookup],
  contacts: Object.keys(state.entities.contacts)
      .map((i) => ({
        id: i,
        name: state.entities.contacts[i].display_name,
        pendingDelete: state.apiStatus.pendingContactDeletes[i],
      }))
      .sort(compareByDisplayName),
  loading: state.apiStatus.inProgress.GET_CONTACTS,
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
  onRemoveContact: (lookupId: string) => {
    dispatch(removeContact(lookupId));
  },
});

const Contacts =
    connect(mapStateToProps, mapDispatchToProps)(ContactsComponent);

export default Contacts;
