import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Delete';
import * as cx from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { ContactGroup, SuggestedContact } from '../../common/models/contacts';
import { User } from '../../common/models/user';
import {
  addContact,
  addContactToGroup,
  addNewGroupContact,
  changeContactLookup,
  changeNewGroupDescription,
  changeNewGroupName,
  createContactGroup,
  editContactGroup,
  hideNewGroupDialog,
  leaveContactGroup,
  removeContact,
  removeContactFromGroup,
  removeNewGroupContact,
  showNewGroupDialog,
  userLookup,
} from '../actions';
import ContactGroupsCard from '../components/contact-groups-card';
import ContactListCard from '../components/contact-list-card';
import ContactLookupCard from '../components/contact-lookup-card';
import NewContactGroupDialog from '../components/new-contact-group-dialog';
import Progress from '../components/progress';
import { State } from '../state';
import { WebDispatch } from '../store';

const styles = require('./contacts.css');

interface SuggestedContactWithApi extends SuggestedContact {
  pendingAdd: boolean;
}

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
  suggestedContacts: SuggestedContact[];
  groups: ContactGroup[];
  onCreateGroup: (name: string, description: string) => void;
  onEditGroup: (group: string, name: string, description: string) => void;
  onAddContactToGroup: (group: string, contact: string) => void;
  onRemoveContactFromGroup: (group: string, contact: string) => void;
  onLeaveContactGroup: (group: string) => void;
  newGroupName: string;
  newGroupDescription: string;
  newGroupContactsInGroup: SlimContact[];
  onNewGroupUpdateName: (name: string) => void;
  onNewGroupUpdateDescription: (description: string) => void;
  onNewGroupCancel: () => void;
  onNewGroupOpen: () => void;
  onNewGroupAddContact: (contact: string) => void;
  onNewGroupRemoveContact: (contact: string) => void;
  newGroupOpen: boolean;
}

const ContactsComponent = ({
  addContactEnabled,
  contacts,
  lookup,
  lookupId,
  onAddContact,
  onLookupChange,
  onRemoveContact,
  loading,
  suggestedContacts,
  groups,
  onCreateGroup,
  onEditGroup,
  onAddContactToGroup,
  onRemoveContactFromGroup,
  onLeaveContactGroup,
  newGroupName,
  newGroupDescription,
  newGroupContactsInGroup,
  onNewGroupUpdateName,
  onNewGroupUpdateDescription,
  onNewGroupCancel,
  onNewGroupOpen,
  onNewGroupAddContact,
  onNewGroupRemoveContact,
  newGroupOpen,
}: Props) => {
  const contactListItem = ({ name, id, pendingDelete }: SlimContact) => {
    const action = pendingDelete ? (
      <CircularProgress color="secondary" />
    ) : (
      <IconButton onClick={() => onRemoveContact(id)}>
        <RemoveIcon />
      </IconButton>
    );
    return (
      <ListItem key={id}>
        <ListItemText primary={name} />
        <ListItemSecondaryAction>{action}</ListItemSecondaryAction>
      </ListItem>
    );
  };
  const suggestedContactListItem = ({
    id,
    display_name,
    added_current_user,
    common_contacts,
    pendingAdd,
  }: SuggestedContactWithApi) => {
    const addedYou = (
      <div>
        <Typography color="secondary">Added you!</Typography>
      </div>
    );
    const commonContacts = <div>{common_contacts} friends in common</div>;
    const subText = (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {added_current_user ? addedYou : undefined}
        {common_contacts ? commonContacts : undefined}
      </div>
    );
    const action = pendingAdd ? (
      <CircularProgress color="secondary" />
    ) : (
      <IconButton onClick={() => onAddContact(id)}>
        <AddIcon />
      </IconButton>
    );
    return (
      <ListItem key={id}>
        <ListItemText primary={display_name} secondary={subText} />
        <ListItemSecondaryAction>{action}</ListItemSecondaryAction>
      </ListItem>
    );
  };
  const contactList =
    contacts.length === 0 ? (
      <Typography align="center" style={{ margin: '16px' }}>
        No buds. Add contacts by searching above.
      </Typography>
    ) : (
      <Paper style={{ marginTop: '16px' }}>
        <List>{contacts.map(contactListItem)}</List>
      </Paper>
    );
  const suggestedList = (
    <Paper style={{ marginTop: '16px' }}>
      <List>{suggestedContacts.map(suggestedContactListItem)}</List>
    </Paper>
  );
  return (
    <div>
      <Progress visible={loading} />
      <ContactLookupCard
        lookup={lookup}
        lookupId={lookupId}
        onAddContact={onAddContact}
        onLookupChange={onLookupChange}
      />
      <ContactGroupsCard
        groups={groups}
        onCreateGroup={onNewGroupOpen}
        onEditGroup={() => {}}
        onAddContactToGroup={onAddContactToGroup}
        onRemoveContactFromGroup={onRemoveContactFromGroup}
        onLeaveContactGroup={onLeaveContactGroup}
      />
      <ContactListCard contacts={contacts} onRemoveContact={onRemoveContact} />
      <NewContactGroupDialog
        name={newGroupName}
        description={newGroupDescription}
        allContacts={contacts}
        contactsInGroup={newGroupContactsInGroup}
        onUpdateName={onNewGroupUpdateName}
        onUpdateDescription={onNewGroupUpdateDescription}
        onCancel={onNewGroupCancel}
        onCreate={onCreateGroup}
        onAddContact={onNewGroupAddContact}
        onRemoveContact={onNewGroupRemoveContact}
        open={newGroupOpen}
      />
    </div>
  );
};

const compareByDisplayName = (a: SlimContact, b: SlimContact) =>
  a.name.localeCompare(b.name);

const compareByAddedAndCommon = (a: SuggestedContact, b: SuggestedContact) => {
  if (a.added_current_user && !b.added_current_user) {
    return -1;
  }
  if (b.added_current_user && !a.added_current_user) {
    return 1;
  }
  return b.common_contacts === a.common_contacts
    ? a.display_name.localeCompare(b.display_name)
    : b.common_contacts - a.common_contacts;
};

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
  suggestedContacts: Object.keys(state.entities.suggestedContacts)
    .map((i) => ({
      ...state.entities.suggestedContacts[i],
      pendingAdd: state.apiStatus.pendingContactAdds[i],
    }))
    .sort(compareByAddedAndCommon),
  groups: Object.keys(state.entities.contactGroups)
    .sort()
    .map((i) => state.entities.contactGroups[i]),
  newGroupName: state.ui.contactGroups.name,
  newGroupDescription: state.ui.contactGroups.description,
  newGroupContactsInGroup: Object.keys(state.ui.contactGroups.contacts)
    .sort()
    .map((id) => ({
      id,
      name: state.entities.contacts[id]?.display_name,
    })),
  newGroupOpen: state.ui.contactGroups.open,
});

const mapDispatchToProps = (dispatch: WebDispatch) => ({
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
  onCreateGroup: (name: string, description: string) => {
    dispatch(createContactGroup(name, description));
  },
  onEditGroup: (group: string, name: string, description: string) => {
    dispatch(editContactGroup(group, name, description));
  },
  onAddContactToGroup: (group: string, contact: string) => {
    dispatch(addContactToGroup(group, contact));
  },
  onRemoveContactFromGroup: (group: string, contact: string) => {
    dispatch(removeContactFromGroup(group, contact));
  },
  onLeaveContactGroup: (group: string) => {
    dispatch(leaveContactGroup(group));
  },
  onNewGroupUpdateName: (name: string) => {
    dispatch(changeNewGroupName(name));
  },
  onNewGroupUpdateDescription: (description: string) => {
    dispatch(changeNewGroupDescription(description));
  },
  onNewGroupCancel: () => {
    dispatch(hideNewGroupDialog());
  },
  onNewGroupCreate: (name: string, description: string) => {},
  onNewGroupOpen: () => {
    dispatch(showNewGroupDialog());
  },
  onNewGroupAddContact: (contact: string) => {
    dispatch(addNewGroupContact(contact));
  },
  onNewGroupRemoveContact: (contact: string) => {
    dispatch(removeNewGroupContact(contact));
  },
});

const Contacts = connect(
  mapStateToProps,
  mapDispatchToProps
)(ContactsComponent);

export default Contacts;
