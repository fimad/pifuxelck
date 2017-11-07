import * as React from 'react';
import AddIcon from 'material-ui-icons/Add';
import ArchiveIcon from 'material-ui-icons/Archive';
import Game from './game';
import History from './history';
import HistoryIcon from 'material-ui-icons/History';
import InboxIcon from 'material-ui-icons/Inbox';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import { Dispatch } from 'redux';
import { Link } from 'react-router-dom';
import { Route, Switch } from 'react-router';
import { State } from '../state';
import { connect } from 'react-redux';
import { getHistory, getInbox, login } from '../actions';

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
    this.props.dispatch(push('/'));
    this.props.dispatch(getInbox());
    this.handleShowDrawer(false);
  }

  handleClickHistory = () => {
    this.props.dispatch(push('/history'));
    this.props.dispatch(getHistory());
    this.handleShowDrawer(false);
  };

  render() {
    const fabStyle: any = {
      position: 'absolute',
      bottom: '32px',
      right: '32px',
    };
    const rootStyle: any = {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
    };
    const appBar = (title: string) => (
      <div>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton onClick={this.handleToggleDrawer} color="contrast" aria-label="Menu">
            <MenuIcon />
          </IconButton>
          <Typography type="title" color="inherit">
            {title}
          </Typography>
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
          <Route path='/'>
            <div>
              {appBar('Inbox')}
              <Button fab style={fabStyle} aria-label="add" color={"accent"}>
                <AddIcon />
              </Button>
            </div>
          </Route>
        </Switch>

        <Drawer
            type="temporary"
            anchor="left"
            open={this.state.showDrawer}
            onRequestClose={this.handleToggleDrawer} >
          <List>
            <ListItem button onClick={this.handleClickInbox}>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Inbox" />
            </ListItem>
            <ListItem button onClick={this.handleClickHistory}>
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary="History" />
            </ListItem>
          </List>
        </Drawer>
      </div>
    );
  }
}

const App = connect()(AppComponent as any);

export default App;
