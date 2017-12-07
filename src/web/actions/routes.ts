import { Dispatch } from 'redux';
import { State } from '../state';

import {
  getAccount,
  getContactGroups,
  getContacts,
  getHistory,
  getInbox,
} from './api-actions';

const { push } = require('react-router-redux');

export function gotoHistory() {
  return (dispatch: Dispatch<State>) => {
    dispatch(push('/history'));
    dispatch(getHistory());
  };
}

export function gotoInbox() {
  return (dispatch: Dispatch<State>) => {
    dispatch(push('/inbox'));
    dispatch(getInbox());
  };
}

export function gotoContacts() {
  return (dispatch: Dispatch<State>) => {
    dispatch(push('/contacts'));
    dispatch(getContacts());
    dispatch(getContactGroups());
  };
}

export function gotoAccount() {
  return (dispatch: Dispatch<State>) => {
    dispatch(push('/account'));
    dispatch(getAccount());
  };
}
