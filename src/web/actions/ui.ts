import { Color, Point } from '../../common/models/drawing';
import { Turn } from '../../common/models/turn';
import { Action } from '../actions';

export function updateOutbox(gameId: string, turn: Turn): Action {
  return { type: 'UI_UPDATE_OUTBOX', gameId, turn };
}

export function chooseBrushSize(size: number): Action {
  return { type: 'UI_CHOOSE_BRUSH_SIZE', size };
}

export function chooseBrushColor(color: Color): Action {
  return { type: 'UI_CHOOSE_BRUSH_COLOR', color };
}

export function updateBackgroundColor(gameId: string, color: Color): Action {
  return { type: 'UI_UPDATE_BACKGROUND_COLOR', gameId, color };
}

export function appendDrawingLine(gameId: string, point: Point): Action {
  return { type: 'UI_APPEND_DRAWING_LINE', gameId, point };
}

export function startDrawingLine(gameId: string, point: Point): Action {
  return { type: 'UI_START_DRAWING_LINE', gameId, point };
}

export function stopDrawingLine(): Action {
  return { type: 'UI_STOP_DRAWING_LINE' };
}

export function undoDrawingLine(gameId: string): Action {
  return { type: 'UI_UNDO_DRAWING_LINE', gameId };
}

export function redoDrawingLine(gameId: string): Action {
  return { type: 'UI_REDO_DRAWING_LINE', gameId };
}

export function changeContactLookup(lookup: string): Action {
  return { type: 'UI_CHANGE_CONTACT_LOOKUP', lookup };
}

export function newGameChangeTopic(topic: string): Action {
  return { type: 'UI_NEW_GAME_CHANGE_TOPIC', topic };
}

export function newGameAddPlayer(playerId: string): Action {
  return { type: 'UI_NEW_GAME_ADD_PLAYER', playerId };
}

export function newGameRemovePlayer(playerId: string): Action {
  return { type: 'UI_NEW_GAME_REMOVE_PLAYER', playerId };
}

export function updateEmail(email: string): Action {
  return { type: 'UI_UPDATE_EMAIL', email };
}

export function updatePassword(password: string): Action {
  return { type: 'UI_UPDATE_PASSWORD', password };
}

export function updatePasswordConfirmation(
  passwordConfirmation: string
): Action {
  return { type: 'UI_UPDATE_PASSWORD_CONFIRMATION', passwordConfirmation };
}

export function setAccountPasswordError(error: string): Action {
  return { type: 'UI_SET_ACCOUNT_PASSWORD_ERROR', error };
}

export function addErrorSnak(error: string): Action {
  return { type: 'UI_ADD_ERROR_SNAK', error };
}

export function removeErrorSnak(errorId: string): Action {
  return { type: 'UI_REMOVE_ERROR_SNAK', errorId };
}

export function filterHistory(query: string): Action {
  return { type: 'UI_FILTER_HISTORY', query };
}

export function showNewGroupDialog(): Action {
  return { type: 'UI_NEW_GROUP_SHOW'};
}

export function hideNewGroupDialog(): Action {
  return { type: 'UI_NEW_GROUP_HIDE'};
}

export function changeNewGroupName(name: string): Action {
  return { type: 'UI_NEW_GROUP_CHANGE_NAME', name};
}

export function changeNewGroupDescription(description: string): Action {
  return { type: 'UI_NEW_GROUP_CHANGE_DESCRIPTION', description };
}

export function addNewGroupContact(contact: string): Action {
  return { type: 'UI_NEW_GROUP_ADD_CONTACT', contact };
}

export function removeNewGroupContact(contact: string): Action {
  return { type: 'UI_NEW_GROUP_REMOVE_CONTACT', contact };
}
