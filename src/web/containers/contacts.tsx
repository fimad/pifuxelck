import * as React from 'react';
import AddIcon from 'material-ui-icons/Add';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import * as cx from 'classnames';
import { Dispatch } from 'redux';
import { State } from '../state';
import { addContact, changeContactLookup, userLookup } from '../actions';
import { connect } from 'react-redux';

const styles = require('./contacts.css');

type Props = {
  addContactEnabled: boolean
  contacts: string[]
  lookup: string
  lookupId?: string
  onAddContact: (lookupId: string) => void
  onLookupChange: (lookup: string) => void
};

const ContactsComponent = ({
    addContactEnabled, contacts, lookup, lookupId, onAddContact, onLookupChange
  }: Props) => {
  return (
    <div className={cx(styles.container, styles.contacts)}>
      <Paper style={{display: 'flex', flexDirection: 'row'}}>
        <TextField
            onChange={(event) => onLookupChange(event.target.value)}
            label="Lookup contact"
            value={lookup}
            fullWidth />
        <Button
            onClick={() => lookupId ? onAddContact(lookupId) : null}
            disabled={!addContactEnabled}
            raised
            color="accent">
          <AddIcon />
        </Button>
      </Paper>

      {
        contacts.length == 0 ?
        (
          <Typography align="center" style={{margin: '16px'}}>
            No buds. Add contacts by searching above.
          </Typography>
        ) :
        (
          <Paper style={{marginTop: '16px'}}>
            <List>
              {
                contacts.map((contact, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={contact} />
                  </ListItem>
                ))
              }
            </List>
          </Paper>
        )
      }
    </div>
  );
};

const mapStateToProps = (state: State) => ({
  lookup: state.ui.contacts.lookup,
  lookupId: state.entities.users[state.ui.contacts.lookup],
  addContactEnabled: !!state.entities.users[state.ui.contacts.lookup],
  contacts: Object.keys(state.entities.contacts)
      .map((i) => state.entities.contacts[i].display_name)
      .sort(),
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
