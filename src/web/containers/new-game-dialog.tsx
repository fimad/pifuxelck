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

const styles = require('./new-game-dialog.css');

type Props = WithWidthProps & {
  players: User[];
  contacts: User[];
  fullScreen: boolean;
  topic: string;
  onCancel: () => void;
  onStart: (topic: string, playerIds: string[]) => void;
  onAddPlayer: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onChangeTopic: (topic: string) => void;
};

const NewGameDialog = ({
  contacts,
  fullScreen,
  topic,
  players,
  onCancel,
  onStart,
  onAddPlayer,
  onRemovePlayer,
  onChangeTopic,
}: Props) => {
  const playerToChip = (player: User) => (
    <Chip
      key={player.id}
      label={player.display_name}
      onDelete={() => onRemovePlayer(player.id)}
    />
  );
  const contactToListEntry = (c: User) => (
    <ListItem
      key={`contact-${c.id}`}
      disabled={players.filter(({ id }) => c.id === id).length > 0}
      button={true}
      onClick={() => onAddPlayer(c.id)}
    >
      <ListItemIcon>
        <AddIcon />
      </ListItemIcon>
      <ListItemText primary={c.display_name} />
    </ListItem>
  );
  return (
    <Dialog fullScreen={fullScreen} open={true} onClose={onCancel}>
      <DialogTitle>
        <TextField
          value={topic}
          onChange={(event) => onChangeTopic(event.target.value)}
          fullWidth={true}
          label="Topic"
        />
        <div className={styles.activePlayerList}>
          {players.map(playerToChip)}
        </div>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Choose which players you would like to participate in this game.
        </DialogContentText>
        <List>{contacts.map(contactToListEntry)}</List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() =>
            onStart(
              topic,
              players.map((p) => p.id)
            )
          }
          color="primary"
          autoFocus={true}
        >
          Start
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const userMapToList = (users: { [id: string]: User }) =>
  Object.keys(users)
    .map((id) => users[id])
    .sort(compareUserByName);

const compareUserByName = (a: User, b: User) =>
  a.display_name.localeCompare(b.display_name);

const mapStateToProps = (state: State) => ({
  contacts: userMapToList(state.entities.contacts),
  players: state.ui.newGame.users
    .map((id) => state.entities.contacts[id])
    .sort(compareUserByName),
  topic: state.ui.newGame.topic,
});

const mapDispatchToProps = (dispatch: WebDispatch) => ({
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

export default withMobileDialog({ breakpoint: 'xs' })(
  connect(mapStateToProps, mapDispatchToProps)(NewGameDialog)
);
