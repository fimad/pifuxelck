import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import * as cx from 'classnames';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { State } from '../state';

const styles = require('./contact-list-card.css');

interface SlimContact {
  name: string;
  id: string;
  pendingDelete: boolean;
}

interface Props {
  contacts: SlimContact[];
  onRemoveContact: (lookupId: string) => void;
}

export default ({ contacts, onRemoveContact }: Props) => {
  const contactListItem = ({ name, id, pendingDelete }: SlimContact) => {
    const menuId = `contacts/list/${id}`;
    return (
      <ListItem key={id}>
        <ListItemText primary={name} />
        <ListItemSecondaryAction>
          <PopupState variant="popover" popupId={menuId}>
            {(popupState) => (
              <React.Fragment>
                <IconButton {...bindTrigger(popupState)}>
                  <MoreVertIcon />
                </IconButton>
                <Menu {...bindMenu(popupState)}>
                  <MenuItem
                    onClick={() => {
                      onRemoveContact(id);
                      popupState.close();
                    }}
                  >
                    Remove
                  </MenuItem>
                </Menu>
              </React.Fragment>
            )}
          </PopupState>
        </ListItemSecondaryAction>
      </ListItem>
    );
  };
  return (
    <div className={cx(styles.container, styles.email)}>
      <Paper className={styles.paper}>
        <Typography variant="h6" classes={{ root: styles.title }}>
          Contacts
        </Typography>
        <List>{contacts.map(contactListItem)}</List>
      </Paper>
    </div>
  );
};
