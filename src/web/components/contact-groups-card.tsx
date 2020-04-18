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

import { ContactGroup } from '../../common/models/contacts';
import { State } from '../state';

const styles = require('./contact-groups-card.css');

interface Props {
  groups: ContactGroup[];
  onCreateGroup: () => void;
  onEditGroup: () => void;
  onAddContactToGroup: (group: string, contact: string) => void;
  onRemoveContactFromGroup: (group: string, contact: string) => void;
  onLeaveContactGroup: (group: string) => void;
}

export default ({
  groups,
  onCreateGroup,
  onEditGroup,
  onAddContactToGroup,
  onRemoveContactFromGroup,
  onLeaveContactGroup,
}: Props) => {
  const groupListItem = ({ id, name, description, members }: ContactGroup) => {
    const menuId = `contacts/group/${id}`;
    return (
      <ListItem key={id}>
        <ListItemText
          primary={name}
          secondary={members.map(({ display_name }) => display_name).join(', ')}
        />
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
                      popupState.close();
                    }}
                  >
                    Edit
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      onLeaveContactGroup(id);
                      popupState.close();
                    }}
                  >
                    Leave
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
        <div style={{ display: 'flex' }}>
          <Typography variant="h6" classes={{ root: styles.title }}>
            Groups
          </Typography>
          <PopupState variant="popover" popupId={'contacts/groups'}>
            {(popupState) => (
              <React.Fragment>
                <IconButton
                  style={{ marginLeft: 'auto' }}
                  {...bindTrigger(popupState)}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu {...bindMenu(popupState)}>
                  <MenuItem
                    onClick={() => {
                      onCreateGroup();
                      popupState.close();
                    }}
                  >
                    New Group
                  </MenuItem>
                </Menu>
              </React.Fragment>
            )}
          </PopupState>
        </div>
        <List>{groups.map(groupListItem)}</List>
      </Paper>
    </div>
  );
};
