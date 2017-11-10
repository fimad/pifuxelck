import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as actions from './actions';
import * as storage from 'redux-storage'
import App from './containers/app';
import Login from './containers/login';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import stopPullToRefresh from './pull-to-refresh';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { Router, Route, Switch } from 'react-router';
import { createBrowserHistory } from 'history';
import { logger } from 'redux-logger';
import { reducers } from './reducers';

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

import filter from 'redux-storage-decorator-filter';

// Create a history of your choosing (we're using a browser history in this case)
const history = createBrowserHistory();

const middlewares = [thunk, routerMiddleware(history)];
// TODO(will): Disable the logger in production...
middlewares.push(logger);

const reducer = storage.reducer(combineReducers({
  ...reducers,
  routing: routerReducer as Reducer<any>,
}));
const engine = filter(
    require('redux-storage-engine-indexed-db').default('my-save-key'),
    [], [['entities', 'history']]);
middlewares.push(storage.createMiddleware(engine));
const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
const store = createStoreWithMiddleware(reducer);
// TODO(will): Need to handle errors here...
// TODO(will): Add migration that wipes all data except the auth token...
storage.createLoader(engine)(store)
  .then(() => {
    store.dispatch(actions.getInbox());
    store.dispatch(actions.getHistory());
  })
  .then(() => {
    ReactDOM.render(
      <MuiThemeProvider>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <div>
              <Switch>
                <Route path='/login' component={Login} />
                <Route path='/' component={App} />
              </Switch>
            </div>
          </ConnectedRouter>
        </Provider>
      </MuiThemeProvider>,
      document.getElementById('content')
    );
  });

stopPullToRefresh();

(window as any)['store'] = store;
(window as any)['actions'] = actions;
// It is important not to attach this component until after the storage layer
// has loaded, otherwise it is possible to save any empty state, thus blowing
// away all prior state.
      //      <Route path='/' component={App}>
      //        <Route path='foo' component={Foo}/>
      //        <Route path='bar' component={Bar}/>
      //      </Route>
