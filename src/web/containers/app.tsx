import * as React from 'react';
import ContentAdd from 'material-ui/svg-icons/content/add';
import History from './history';
import { Dispatch } from 'redux';
import { Link } from 'react-router-dom';
import { Route, Switch } from 'react-router';
import { State } from '../state';
import { connect } from 'react-redux';
import { getHistory, getInbox, login } from '../actions';

const { push } = require('react-router-redux');

import {
  AppBar,
  FloatingActionButton,
  Drawer,
  MenuItem,
} from 'material-ui';

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
      <AppBar
        title={title}
        onLeftIconButtonTouchTap={this.handleToggleDrawer}
        iconClassNameRight='muidocs-icon-navigation-expand-more' />
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
          <Route path='/'>
            <div>
              {appBar('Inbox')}
              <FloatingActionButton style={fabStyle} secondary={true}>
                <ContentAdd />
              </FloatingActionButton>
            </div>
          </Route>
        </Switch>

        <Drawer
            open={this.state.showDrawer}
            docked={false}
            onRequestChange={this.handleShowDrawer} >
          <MenuItem onClick={this.handleClickInbox}>Inbox</MenuItem>
          <MenuItem onClick={this.handleClickHistory}>History</MenuItem>
        </Drawer>
      </div>
    );
  }
}

const App = connect()(AppComponent as any);

export default App;
