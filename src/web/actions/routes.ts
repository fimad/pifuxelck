import { Dispatch } from 'redux';
import { State } from '../state';
import { WebThunkAction } from '../actions';
import { push } from 'connected-react-router';

import {
  getAccount,
  getContactGroups,
  getContacts,
  getHistory,
  getInbox,
} from './api-actions';

export function gotoHistory(): WebThunkAction {
  return (dispatch) => {
    dispatch(push('/history'));
    dispatch(getHistory());
  };
}

export function gotoInbox(): WebThunkAction {
  return (dispatch) => {
    dispatch(push('/inbox'));
    dispatch(getInbox());
    dispatch(getContacts());
  };
}

export function gotoContacts(): WebThunkAction {
  return (dispatch) => {
    dispatch(push('/contacts'));
    dispatch(getContacts());
    dispatch(getContactGroups());
  };
}

export function gotoAccount(): WebThunkAction {
  return (dispatch) => {
    dispatch(push('/account'));
    dispatch(getAccount());
  };
}
