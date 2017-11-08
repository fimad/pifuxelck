import auth from './reducers/auth';
import entities from './reducers/entities';
import ui from './reducers/ui';
import { ReducersMapObject } from 'redux';

export const reducers = {
  auth,
  entities,
  ui,
} as ReducersMapObject;
