import { Action } from '../actions';

export const LOGOUT = 'LOGOUT';

export function logout(): Action {
  return {type: LOGOUT};
}
