import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router';
import { applyMiddleware, createStore, combineReducers, Reducer } from 'redux';
import { createBrowserHistory } from 'history';
import { reducers } from './state';

const {
  ConnectedRouter,
  routerReducer,
  routerMiddleware,
} = require('react-router-redux');

// Create a history of your choosing (we're using a browser history in this case)
const history = createBrowserHistory();

// Add the reducer to your store on the `routing` key
const store = createStore(
  combineReducers({
    ...reducers,
    routing: routerReducer as Reducer<any>,
  }),
  applyMiddleware(routerMiddleware(history)),
);

(window as any)['store'] = store;

ReactDOM.render(
  <Provider store={store}>
    { /* Tell the Router to use our enhanced history */ }
    <ConnectedRouter history={history}>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('content')
);
      //      <Route path="/" component={App}>
      //        <Route path="foo" component={Foo}/>
      //        <Route path="bar" component={Bar}/>
      //      </Route>
