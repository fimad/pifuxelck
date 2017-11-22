import * as storage from 'redux-storage'
import filter from 'redux-storage-decorator-filter';
import thunk from 'redux-thunk';
import { History } from 'history';
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
  routerReducer,
  routerMiddleware,
} = require('react-router-redux');

const debounce = require('redux-storage-decorator-debounce').default;
const migrate = require('redux-storage-decorator-migrate').default;

export function createPifuxelckStore(history: History) {
  const middlewares = [thunk, routerMiddleware(history)];
  // TODO(will): Disable the logger in production...
  middlewares.push(logger);

  const reducer = storage.reducer(combineReducers({
    ...reducers,
    routing: routerReducer as Reducer<any>,
  }));
  const idbEngine = require('redux-storage-engine-indexed-db').default('my-save-key');
  let engine = debounce(
      filter(
          {
            load: () => idbEngine.load().then((state: any) => state || {}),
            save: (state) => idbEngine.save(state),
          },
          [], ['_version', ['entities', 'history'], ['ui', 'newGame']]),
      1500);
  engine = decorateEngineWithMigrations(engine);
  middlewares.push(storage.createMiddleware(engine));
  const createStoreWithMiddleware =
      applyMiddleware(...middlewares)(createStore);
  const store = createStoreWithMiddleware(reducer, {});
  return storage.createLoader(engine)(store).then(() => store);
};

function decorateEngineWithMigrations(engine: storage.StorageEngine) {
  let decoratedEngine = migrate(engine, 3, '_version', []);
  decoratedEngine.addMigration(1, (state: any) => {});
  decoratedEngine.addMigration(2, (state: any) => {});
  decoratedEngine.addMigration(3, (state: any) => {});
  return decoratedEngine;
}