import AddIcon from 'material-ui-icons/Add';
import Button from 'material-ui/Button';
import Checkbox from 'material-ui/Checkbox';
import Chip from 'material-ui/Chip';
import Divider from 'material-ui/Divider';
import { Breakpoint } from 'material-ui/styles/createBreakpoints';
import TextField from 'material-ui/TextField';
import { WithWidthProps } from 'material-ui/utils/withWidth';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { User } from '../../common/models/user';
import { State } from '../state';

import {
  gotoInbox,
  newGame,
  newGameAddPlayer,
  newGameChangeTopic,
  newGameRemovePlayer,
} from '../actions';

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
  players: User[]
  contacts: User[]
  fullScreen: boolean
  topic: string
  onCancel: () => void
  onStart: (topic: string, playerIds: string[]) => void
  onAddPlayer: (playerId: string) => void
  onRemovePlayer: (playerId: string) => void
  onChangeTopic: (topic: string) => void,
};

const NewGameDialog = ({
    contacts, fullScreen, topic, players, onCancel, onStart,
    onAddPlayer, onRemovePlayer, onChangeTopic}: Props) => (
  <Dialog
      fullScreen={fullScreen}
      open={true}
      onRequestClose={onCancel} >
    <DialogTitle>
      <TextField
          value={topic}
          onChange={(event) => onChangeTopic(event.target.value)}
          fullWidth
          label='Topic' />
      <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: '16px',
      }}>
        {
          players.map((player) => (
            <Chip
                key={player.id}
                label={player.display_name}
                onRequestDelete={() => onRemovePlayer(player.id)} />
          ))
        }
      </div>
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        Choose which players you would like to participate in this game.
      </DialogContentText>
      <List>
        {
          contacts.map((c) => (
            <ListItem
                key={`contact-${c.id}`}
                disabled={players.filter(({id}) => c.id === id).length > 0}
                button
                onClick={() => onAddPlayer(c.id)}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary={c.display_name} />
            </ListItem>
          ))
        }
      </List>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} color='primary'>
        Cancel
      </Button>
      <Button
          onClick={() => onStart(topic, players.map((p) => p.id))}
          color='primary'
          autoFocus>
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
  contacts: userMapToList(state.entities.contacts),
  players: state.ui.newGame.users
      .map((id) => state.entities.contacts[id])
      .sort(compareUserByName),
  topic: state.ui.newGame.topic,
});

const mapDispatchToProps = (dispatch: Dispatch<State>) => ({
  onAddPlayer: (playerId: string) => {
    dispatch(newGameAddPlayer(playerId));
  },
  onCancel: () => dispatch(gotoInbox()),
  onChangeTopic: (topic: string) => {
    dispatch(newGameChangeTopic(topic));
  },
  onRemovePlayer: (playerId: string) => {
    dispatch(newGameRemovePlayer(playerId));
  },
  onStart: (topic: string, playerIds: string[]) => {
    dispatch(newGame(playerIds, topic));
    dispatch(gotoInbox());
  },
});

export default withMobileDialog({breakpoint: 'xs'})(
    connect(mapStateToProps, mapDispatchToProps)(NewGameDialog));
