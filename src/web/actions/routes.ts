import { Dispatch } from 'redux';
import { State } from '../state';
import { getInbox, getHistory } from './api-actions';

const { push } = require('react-router-redux');

export function gotoHistory() {
  return (dispatch: Dispatch<State>) => {
    dispatch(push('/history'));
    dispatch(getHistory());
  }
}

export function gotoInbox() {
  return (dispatch: Dispatch<State>) => {
    dispatch(push('/inbox'));
    dispatch(getInbox());
  }
}
