import { History } from 'history';
import { createBrowserHistory } from 'history';
import { logger } from 'redux-logger';
import * as storage from 'redux-storage';
import filter from 'redux-storage-decorator-filter';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { Action as ReduxAction } from 'redux';
import { reducers } from './reducers';
import { State } from './state';
import { ActionType } from './actions';

import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore,
  Reducer,
} from 'redux';

const {
  routerReducer,
  routerMiddleware,
} = require('react-router-redux');

const debounce = require('redux-storage-decorator-debounce').default;
const migrate = require('redux-storage-decorator-migrate').default;

// Create a history of your choosing (we're using a browser history in this
// case).
const history = createBrowserHistory();
const middlewares = [thunk, routerMiddleware(history)];
// TODO(will): Disable the logger in production...
middlewares.push(logger);

const reducer = storage.reducer(combineReducers({
  ...reducers,
  routing: routerReducer as Reducer<any>,
}));
const idbEngine =
    require('redux-storage-engine-indexed-db').default('my-save-key');
const debouncedEngine = debounce(
    filter(
        decorateEngineWithMigrations({
          load: () => idbEngine.load().then((state: any) => state || {}),
          save: (state) => idbEngine.save(state),
        }),
        [], [
          // Blacklisted state.
          ['apiStatus'],
          ['entities', 'gameCache'],
          ['ui', 'errors'],
        ]),
    1500);
middlewares.push(storage.createMiddleware(debouncedEngine));
const createStoreWithMiddleware =
    applyMiddleware(...middlewares)(createStore);
const store = createStoreWithMiddleware(reducer, {});

export type WebDispatch = ThunkDispatch<
    State,
    unknown,
    ReduxAction<ActionType>
>;

export function createPifuxelckStore() {
  return storage.createLoader(debouncedEngine)(store).then(() => store);
}

function decorateEngineWithMigrations(
    engine: storage.StorageEngine) {
  const decoratedEngine = migrate(engine, 1);
  decoratedEngine.addMigration(1, (state: any) => ({}));
  return decoratedEngine;
}
