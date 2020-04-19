import { ContactGroup } from '../../common/models/contacts';
import { Message } from '../../common/models/message';
import { User } from '../../common/models/user';
import { mapFrom, objectWithoutKeys } from '../../common/utils';
import { Action } from '../actions';
import { Entities } from '../state';

interface ActionMessage {
  message: Message;
}

const initialState = {
  account: {
    email: '',
  },
  contactGroups: {},
  contacts: {},
  gameCache: {},
  history: {},
  inbox: {},
  suggestedContacts: {},
  users: {},
};

function handleOptimisticUpdate(state: Entities, action: Action) {
  switch (action.type) {
    case 'REMOVE_CONTACT_SUCCESS':
      return {
        ...state,
        contacts: objectWithoutKeys(state.contacts, [action.contactId]),
      };
    case 'ADD_CONTACT_SUCCESS':
    case 'IGNORE_SUGGESTION_SUCCESS':
      return {
        ...state,
        suggestedContacts: objectWithoutKeys(state.suggestedContacts, [
          action.contactId,
        ]),
      };
    case 'PLAY_GAME_SUCCESS':
      return {
        ...state,
        inbox: objectWithoutKeys(state.inbox, [action.gameId]),
      };
  }
  return state;
}

function handleApiResult(state: Entities, action: Action) {
  let newState: Entities;
  if (action.type === 'USER_LOOKUP_SUCCESS') {
    if (action.message && action.message.user) {
      newState = {
        ...state,
        ...newState,
        users: {
          ...state.users,
          [action.message.user.display_name]: action.message.user.id,
        },
      };
    }
  }
  if (action.type === 'GET_GAME_SUCCESS') {
    if (action.message && action.message.game) {
      newState = {
        ...state,
        ...newState,
        gameCache: {
          ...state.gameCache,
          [action.message.game.id]: action.message.game,
        },
      };
    }
  }
  if (action.type === 'GET_HISTORY_SUCCESS') {
    if (action.message && action.message.game_summaries) {
      newState = {
        ...state,
        ...newState,
        history: {
          ...mapFrom(action.message.game_summaries, (x) => x.id),
        },
      };
    }
  }
  if (
    action.type === 'GET_INBOX_SUCCESS' ||
    action.type === 'GET_ALL_DATA_SUCCESS'
  ) {
    if (action.message && action.message.inbox_entries) {
      newState = {
        ...state,
        ...newState,
        inbox: {
          ...mapFrom(action.message.inbox_entries, (x) => x.game_id),
        },
      };
    }
  }
  if (
    action.type === 'GET_CONTACTS_SUCCESS' ||
    action.type === 'GET_ALL_DATA_SUCCESS'
  ) {
    if (action.message && action.message.contacts) {
      newState = {
        ...state,
        ...newState,
        contacts: mapFrom(action.message.contacts, (x) => x.id),
      };
    }
    if (action.message && action.message.contacts) {
      newState = {
        ...state,
        ...newState,
        suggestedContacts: mapFrom(
          action.message.suggested_contacts,
          (x) => x.id
        ),
      };
    }
  }
  if (
    action.type === 'GET_ACCOUNT_SUCCESS' ||
    action.type === 'GET_ALL_DATA_SUCCESS'
  ) {
    if (action.message && action.message.user) {
      newState = {
        ...state,
        ...newState,
        account: action.message.user,
      };
    }
  }
  if (action.type === 'LOGOUT' || action.type === 'LOGIN_START') {
    return initialState;
  }
  if (newState === undefined) {
    if (
      (action as ActionMessage).message &&
      (action as ActionMessage).message.errors &&
      (action as ActionMessage).message.errors.auth
    ) {
      return initialState;
    }
  }
  return newState || state;
}

export default function(state: Entities = initialState, action: Action) {
  return handleApiResult(handleOptimisticUpdate(state, action), action);
}
