import { ReducersMapObject } from 'redux';
import auth from './reducers/auth';
import entities from './reducers/entities';
import ui from './reducers/ui';

export const reducers = {
  auth,
  entities,
  ui,
} as ReducersMapObject;
