import { ReducersMapObject } from 'redux';
import apiStatus from './reducers/api-status';
import auth from './reducers/auth';
import entities from './reducers/entities';
import ui from './reducers/ui';

export const reducers = {
  apiStatus,
  auth,
  entities,
  ui,
} as ReducersMapObject;
