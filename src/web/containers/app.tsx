import * as React from 'react';
import AddIcon from 'material-ui-icons/Add';
import ArchiveIcon from 'material-ui-icons/Archive';
import Contacts from './contacts';
import ContactsIcon from 'material-ui-icons/Contacts';
import DrawReply from './draw-reply';
import Game from './game';
import History from './history';
import HistoryIcon from 'material-ui-icons/History';
import Inbox from './inbox';
import InboxIcon from 'material-ui-icons/Inbox';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import LoginRedirect from './login-redirect';
import LogoutIcon from 'material-ui-icons/Eject';
import NewGameDialog from '../containers/new-game-dialog';
import { Dispatch } from 'redux';
import { Link } from 'react-router-dom';
import { Route, Switch } from 'react-router';
import { State } from '../state';
import { connect } from 'react-redux';
import { gotoContacts, gotoInbox, gotoHistory, login, logout } from '../actions';

import MenuIcon from 'material-ui-icons/Menu';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  MenuItem,
  Typography,
} from 'material-ui';

const { push } = require('react-router-redux');

type Props = {
  dispatch: Dispatch<State>,
  isLoggedIn: boolean,
};

class AppComponent extends React.Component<Props, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      showDrawer: false,
    };
  }

  handleToggleDrawer = () => this.setState({
    showDrawer: !this.state.showDrawer
  });

  handleShowDrawer = (showDrawer: boolean) => this.setState({showDrawer});

  handleClickInbox = () => {
    this.props.dispatch(gotoInbox());
    this.handleShowDrawer(false);
  }

  handleClickHistory = () => {
    this.props.dispatch(gotoHistory());
    this.handleShowDrawer(false);
  };

  handleClickContacts = () => {
    this.props.dispatch(gotoContacts());
    this.handleShowDrawer(false);
  };

  handleShowNewGame = () => {
    this.props.dispatch(push('/new'));
    this.handleShowDrawer(false);
  };

  handleLogout = () => {
    this.props.dispatch(logout());
  };

  render() {
    if (!this.props.isLoggedIn) {
      return (<LoginRedirect />);
    }
    const fabStyle: any = {
      position: 'fixed',
      bottom: '32px',
      right: '32px',
    };
    const rootStyle: any = {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    };
    const appBar = (title: string, button?: JSX.Element) => (
      <div>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton onClick={this.handleToggleDrawer} color="contrast" aria-label="Menu">
            <MenuIcon />
          </IconButton>
          <Typography type="title" style={{flex: '1 1 auto'}} color="inherit">
            {title}
          </Typography>
          {button}
        </Toolbar>
      </AppBar>
      <AppBar position="static"><Toolbar /></AppBar>
      </div>
    );
    return (
      <div style={rootStyle}>
        <Switch>
          <Route path='/history'>
            <div>
              {appBar('History')}
              <History />
            </div>
          </Route>
          <Route path='/game/:id'>
            {({match}) => (
              <div>
                {appBar('Game')}
                <Game gameId={match.params.id} />
              </div>
            )}
          </Route>
          <Route path='/draw/:gameId'>
            {({match}) => (
              <div style={{flex: "1 0 auto", display: 'flex', flexDirection: 'column'}}>
                {appBar('Inbox')}
                <DrawReply gameId={match.params.gameId} />
              </div>
            )}
          </Route>
          <Route path='/contacts'>
            <div>
              {appBar('Contacts')}
              <Contacts />
            </div>
          </Route>
          <Route path='/'>
            <div>
              {appBar('Inbox', (
                <Button color="contrast" onClick={this.handleShowNewGame}>
                  New Game
                </Button>)
              )}
              <Inbox />
              <Switch>
                <Route path='/new'>
                  <NewGameDialog />
                </Route>
              </Switch>
            </div>
          </Route>
        </Switch>

        <Drawer
            type="temporary"
            anchor="left"
            open={this.state.showDrawer}
            onRequestClose={this.handleToggleDrawer} >
          <div style={{width: '240px'}} />
          <List style={{display: 'flex', flexDirection: 'column'}}>
            <ListItem button onClick={this.handleClickInbox}>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Inbox" />
            </ListItem>
            <ListItem button onClick={this.handleClickContacts}>
              <ListItemIcon>
                <ContactsIcon />
              </ListItemIcon>
              <ListItemText primary="Contacts" />
            </ListItem>
            <ListItem button onClick={this.handleClickHistory}>
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary="History" />
            </ListItem>
            <ListItem
                style={{marginTop: 'auto'}}
                button
                onClick={this.handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Drawer>
      </div>
    );
  }
}

const mapStateToProps = ({auth}: State) => ({
  isLoggedIn: !!auth,
});

const App = connect(mapStateToProps)(AppComponent as any);

export default App;
