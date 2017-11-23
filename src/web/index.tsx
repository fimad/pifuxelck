import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as actions from './actions';
import App from './containers/app';
import Login from './containers/login';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ScrollToTop from './components/scroll-to-top';
import { Provider } from 'react-redux';
import { Router, Route, Switch } from 'react-router';
import { createBrowserHistory } from 'history';
import { createPifuxelckStore } from './store';

import {
  Reducer,
  applyMiddleware,
  combineReducers,
  compose,
  createStore,
} from 'redux';

const {
  ConnectedRouter,
  routerReducer,
  routerMiddleware,
} = require('react-router-redux');

// Hookup offline support.
require('offline-plugin/runtime').install();

// Create a history of your choosing (we're using a browser history in this case)
const history = createBrowserHistory();

// TODO(will): Need to handle errors here...
createPifuxelckStore(history)
  .then((store) => {
    store.dispatch(actions.getAllData());
    return store;
  })
  .then((store) => {
    ReactDOM.render(
      <MuiThemeProvider>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <ScrollToTop>
              <div>
                <Switch>
                  <Route path='/login' component={Login} />
                  <Route path='/' component={App} />
                </Switch>
              </div>
            </ScrollToTop>
          </ConnectedRouter>
        </Provider>
      </MuiThemeProvider>,
      document.getElementById('content')
    );
  });
