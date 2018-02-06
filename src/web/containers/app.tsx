import * as FileSaver from 'file-saver';
import AddIcon from 'material-ui-icons/Add';
import ArchiveIcon from 'material-ui-icons/Archive';
import ContactsIcon from 'material-ui-icons/Contacts';
import LogoutIcon from 'material-ui-icons/Eject';
import DownloadIcon from 'material-ui-icons/FileDownload';
import HistoryIcon from 'material-ui-icons/History';
import InboxIcon from 'material-ui-icons/Inbox';
import ChartIcon from 'material-ui-icons/InsertChart';
import MenuIcon from 'material-ui-icons/Menu';
import PersonIcon from 'material-ui-icons/Person';
import SearchIcon from 'material-ui-icons/Search';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import { CircularProgress } from 'material-ui/Progress';
import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';
import NewGameDialog from '../containers/new-game-dialog';
import { State } from '../state';
import Account from './account';
import Contacts from './contacts';
import DrawReply from './draw-reply';
import Game from './game';
import History from './history';
import Inbox from './inbox';
import LoginRedirect from './login-redirect';

import {
  filterHistory,
  gotoAccount,
  gotoContacts,
  gotoHistory,
  gotoInbox,
  login,
  logout,
} from '../actions';

import {
  AppBar,
  Button,
  Drawer,
  IconButton,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
} from 'material-ui';

const domtoimage = require('dom-to-image');
const styles = require('./app.css');
const ResizeAware = require('react-resize-aware').default;
const { push } = require('react-router-redux');

interface Props {
  dispatch: Dispatch<State>;
  historyQuery: string;
  isLoggedIn: boolean;
  newGameInProgress: boolean;
}

class AppComponent extends React.Component<Props, any> {
  public gameRef: HTMLElement;

  constructor(props: any) {
    super(props);
    this.state = {
      showDrawer: false,
    };
  }

  public handleToggleDrawer = () => this.setState({
    showDrawer: !this.state.showDrawer,
  })

  public handleShowDrawer =
      (showDrawer: boolean) => this.setState({showDrawer})

  public handleClickAccount = () => {
    this.props.dispatch(gotoAccount());
    this.handleShowDrawer(false);
  }

  public handleClickInbox = () => {
    this.props.dispatch(gotoInbox());
    this.handleShowDrawer(false);
  }

  public handleClickHistory = () => {
    this.props.dispatch(filterHistory(''));
    this.props.dispatch(gotoHistory());
    this.handleShowDrawer(false);
  }

  public handleClickContacts = () => {
    this.props.dispatch(gotoContacts());
    this.handleShowDrawer(false);
  }

  public handleShowNewGame = () => {
    this.props.dispatch(push('/new'));
    this.handleShowDrawer(false);
  }

  public handleStats = () => {
    window.location.href = '/stats';
  }

  public handleLogout = () => {
    this.props.dispatch(logout());
  }

  public handleHistoryQuery = (query: string) => {
    this.props.dispatch(filterHistory(query));
  }

  public handleExportGame = (gameId: string) => {
    domtoimage
        .toBlob(this.gameRef)
        .then((blob: Blob) => FileSaver.saveAs(blob, `${gameId}.png`));
  }

  public render() {
    if (!this.props.isLoggedIn) {
      return (<LoginRedirect />);
    }
    const fabStyle: any = {
      bottom: '32px',
      position: 'fixed',
      right: '32px',
    };
    const rootStyle: any = {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      left: '0px',
      position: 'absolute',
      top: '0px',
      width: '100%',
    };
    const appBar = (title: string, button?: JSX.Element) => (
      <div>
      <AppBar position='fixed'>
        <Toolbar>
          <IconButton
              onClick={this.handleToggleDrawer}
              color='contrast'
              aria-label='Menu'
          >
            <MenuIcon />
          </IconButton>
          <Typography type='title' style={{flex: '1 1 auto'}} color='inherit'>
            {title}
          </Typography>
          {button}
        </Toolbar>
      </AppBar>
      <AppBar style={{visibility: 'hidden'}} position='static'>
        <Toolbar />
      </AppBar>
      </div>
    );
    const gameExport = (gameId: string) => (
      <IconButton
          onClick={() => this.handleExportGame(gameId)}
          color='contrast'
          aria-label='Menu'
      >
        <DownloadIcon />
      </IconButton>
    );
    const gameView = ({match}: any) => (
      <div>
        {appBar('Game', gameExport(match.params.id))}
        <div ref={(gameRef: HTMLElement) => {this.gameRef = gameRef; }}>
          <Game gameId={match.params.id} />
        </div>
      </div>
    );
    const drawView = ({match}: any) => (
      <div style={{display: 'flex', flex: '1 0 auto', flexDirection: 'column'}}>
        {appBar('Inbox')}
        <DrawReply gameId={match.params.gameId} />
      </div>
    );
    const newGameButton = this.props.newGameInProgress ?
      (<CircularProgress color='accent' />) : (
      <Button color='contrast' onClick={this.handleShowNewGame}>
        New Game
      </Button>
    );
    const historySearch = (
      <div className={styles.historySearchContainer}>
        <div className={styles.historySearch}>
          <SearchIcon />
          <TextField
              onChange={(event) => this.handleHistoryQuery(event.target.value)}
              value={this.props.historyQuery}
              margin='normal'
          />
        </div>
      </div>
    );
    return (
      <div style={rootStyle}>
        <Switch>
          <Route path='/account'>
            <div>
              {appBar('Account')}
              <Account />
            </div>
          </Route>
          <Route path='/history'>
            <div>
              {appBar('History', historySearch)}
              <ResizeAware>
                <History />
              </ResizeAware>
            </div>
          </Route>
          <Route path='/game/:id'>
            {gameView}
          </Route>
          <Route path='/draw/:gameId'>
            {drawView}
          </Route>
          <Route path='/contacts'>
            <div>
              {appBar('Contacts')}
              <Contacts />
            </div>
          </Route>
          <Route path='/'>
            <div>
              {appBar('Inbox', newGameButton)}
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
            type='temporary'
            anchor='left'
            open={this.state.showDrawer}
            onRequestClose={this.handleToggleDrawer}
        >
          <div style={{width: '240px'}} />
          <List style={{display: 'flex', flexDirection: 'column'}}>
            <ListItem button={true} onClick={this.handleClickAccount}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary='Account' />
            </ListItem>
            <ListItem button={true} onClick={this.handleClickInbox}>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary='Inbox' />
            </ListItem>
            <ListItem button={true} onClick={this.handleClickContacts}>
              <ListItemIcon>
                <ContactsIcon />
              </ListItemIcon>
              <ListItemText primary='Contacts' />
            </ListItem>
            <ListItem button={true} onClick={this.handleClickHistory}>
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary='History' />
            </ListItem>
            <ListItem button={true} onClick={this.handleStats}>
              <ListItemIcon>
                <ChartIcon />
              </ListItemIcon>
              <ListItemText primary='Stats' />
            </ListItem>
            <ListItem
                style={{marginTop: 'auto'}}
                button={true}
                onClick={this.handleLogout}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary='Logout' />
            </ListItem>
          </List>
        </Drawer>
      </div>
    );
  }
}

const mapStateToProps = ({ui, auth, apiStatus}: State) => ({
  historyQuery: ui.history.query,
  isLoggedIn: !!auth,
  newGameInProgress: apiStatus.inProgress.NEW_GAME,
});

const App = connect(mapStateToProps)(AppComponent as any);

export default App;
