import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { Breakpoint } from '@material-ui/core/styles/createBreakpoints';
import TextField from '@material-ui/core/TextField';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import { WithWidthProps } from '@material-ui/core/withWidth';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { User } from '../../common/models/user';
import {
  gotoInbox,
  newGame,
  newGameAddPlayer,
  newGameChangeTopic,
  newGameRemovePlayer,
} from '../actions';
import { State } from '../state';
import { WebDispatch } from '../store';

const styles = require('./new-contact-group-dialog.css');

interface SlimContact {
  name: string;
  id: string;
}

type Props = WithWidthProps & {
  name: string;
  description: string;
  allContacts: SlimContact[];
  contactsInGroup: SlimContact[];
  onUpdateName: (name: string) => void;
  onUpdateDescription: (description: string) => void;
  onCancel: () => void;
  onCreate: (name: string, description: string) => void;
  onAddContact: (contact: string) => void;
  onRemoveContact: (contact: string) => void;
  open: boolean;
  fullScreen: boolean;
};

const NewContactGroupDialog = ({
  name,
  open,
  allContacts,
  contactsInGroup,
  description,
  onUpdateName,
  onUpdateDescription,
  onCancel,
  onCreate,
  onAddContact,
  onRemoveContact,
  fullScreen,
}: Props) => {
  const playerToChip = (player: SlimContact) => (
    <Chip key={player.id} label={player.name} onDelete={() => {}} />
  );
  const contactToRemoveListEntry = (c: SlimContact) => (
    <ListItem
      key={`remove-contact-${c.id}`}
      button={true}
      onClick={() => onRemoveContact(c.id)}
    >
      <ListItemIcon>
        <RemoveIcon />
      </ListItemIcon>
      <ListItemText primary={c.name} />
    </ListItem>
  );
  const contactToAddListEntry = (c: SlimContact) => (
    <ListItem
      key={`add-contact-${c.id}`}
      button={true}
      onClick={() => onAddContact(c.id)}
    >
      <ListItemIcon>
        <AddIcon />
      </ListItemIcon>
      <ListItemText primary={c.name} />
    </ListItem>
  );
  const contactSet = new Set(contactsInGroup.map(({ id }) => id));
  const contactsNotInGroup = allContacts.filter(
    ({ id }) => !contactSet.has(id)
  );
  return (
    <Dialog fullScreen={fullScreen} open={open} onClose={onCancel}>
      <DialogTitle>New Group</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <TextField
            value={name}
            onChange={(event) => onUpdateName(event.target.value)}
            fullWidth={true}
            label="Name"
          />
        </DialogContentText>
        <DialogContentText>
          <TextField
            value={description}
            onChange={(event) => onUpdateDescription(event.target.value)}
            fullWidth={true}
            label="Description"
          />
        </DialogContentText>
        <DialogContentText style={{ marginTop: '32px' }}>
          Add some players to this group?
        </DialogContentText>
        <List>
          {[
            ...contactsInGroup.map(contactToRemoveListEntry),
            <Divider key="divider" />,
            ...contactsNotInGroup.map(contactToAddListEntry),
          ]}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            onCreate(name, description);
            onCancel();
          }}
          color="primary"
          autoFocus={true}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withMobileDialog({ breakpoint: 'xs' })(NewContactGroupDialog);
