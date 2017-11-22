import * as React from 'react';
import AddIcon from 'material-ui-icons/Add';
import Button from 'material-ui/Button';
import Checkbox from 'material-ui/Checkbox';
import Chip from 'material-ui/Chip';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import { Breakpoint } from 'material-ui/styles/createBreakpoints';
import { Dispatch } from 'redux';
import { State } from '../state';
import { User } from '../../common/models/user';
import { WithWidthProps } from 'material-ui/utils/withWidth';
import { connect } from 'react-redux';
import { gotoInbox } from '../actions';

import List, {
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from 'material-ui/List';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  withMobileDialog,
} from 'material-ui/Dialog';

type Props = WithWidthProps & {
  players: User[],
  contacts: User[],
  fullScreen: boolean
  onCancel: () => void
  onStart: (topic: string, playerIds: string[]) => void
};

const NewGameDialog = ({contacts, fullScreen, onCancel, onStart}: Props) => (
  <Dialog
      fullScreen={fullScreen}
      open={true}
      onRequestClose={onCancel} >
    <DialogTitle>
      <TextField fullWidth label="Topic" />
      <div style={{
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap'
      }}>
        <Chip label="jesse" onRequestDelete={() => {}} />
        <Chip label="jess" onRequestDelete={() => {}} />
        <Chip label="SWPhantom" onRequestDelete={() => {}} />
        <Chip label="jesse" onRequestDelete={() => {}} />
        <Chip label="jess" onRequestDelete={() => {}} />
        <Chip label="jess" onRequestDelete={() => {}} />
        <Chip label="jesse" onRequestDelete={() => {}} />
        <Chip label="jess" onRequestDelete={() => {}} />
        <Chip label="SWPhantom" onRequestDelete={() => {}} />
        <Chip label="SWPhantom" onRequestDelete={() => {}} />
        <Chip label="SWPhantom" onRequestDelete={() => {}} />
      </div>
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        Choose which players you would like to participate in this game.
      </DialogContentText>
      <List>
        {
          contacts.map((contact) => (
            <ListItem key={`contact-${contact.id}`} button>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary={contact.display_name} />
            </ListItem>
          ))
        }
      </List>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} color="primary">
        Cancel
      </Button>
      <Button onClick={onCancel} color="primary" autoFocus>
        Start
      </Button>
    </DialogActions>
  </Dialog>
);

const userMapToList = (users: {[id: string]: User}) => Object.keys(users)
    .map((id) => users[id])
    .sort(compareUserByName);

const compareUserByName =
    (a: User, b: User) => a.display_name.localeCompare(b.display_name);

const mapStateToProps = (state: State) => ({
  players: state.ui.newGame.users
      .map((id) => state.entities.contacts[id])
      .sort(compareUserByName),
  contacts: userMapToList(state.entities.contacts),
});

const mapDispatchToProps = (dispatch: Dispatch<State>) => ({
  onCancel: () => dispatch(gotoInbox()),
});

export default withMobileDialog({breakpoint: 'xs'})(
  connect(mapStateToProps, mapDispatchToProps)(NewGameDialog));
