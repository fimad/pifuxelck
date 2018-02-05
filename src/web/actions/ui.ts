import { Color, Point } from '../../common/models/drawing';
import { Turn } from '../../common/models/turn';

export function updateOutbox(gameId: string, turn: Turn) {
  return {type: 'UI_UPDATE_OUTBOX', gameId, turn};
}

export function chooseBrushSize(size: number) {
  return {type: 'UI_CHOOSE_BRUSH_SIZE', size};
}

export function chooseBrushColor(color: Color) {
  return {type: 'UI_CHOOSE_BRUSH_COLOR', color};
}

export function updateBackgroundColor(gameId: string, color: Color) {
  return {type: 'UI_UPDATE_BACKGROUND_COLOR', gameId, color};
}

export function appendDrawingLine(gameId: string, point: Point) {
  return {type: 'UI_APPEND_DRAWING_LINE', gameId, point};
}

export function startDrawingLine(gameId: string, point: Point) {
  return {type: 'UI_START_DRAWING_LINE', gameId, point};
}

export function stopDrawingLine() {
  return {type: 'UI_STOP_DRAWING_LINE'};
}

export function undoDrawingLine(gameId: string) {
  return {type: 'UI_UNDO_DRAWING_LINE', gameId};
}

export function changeContactLookup(lookup: string) {
  return {type: 'UI_CHANGE_CONTACT_LOOKUP', lookup};
}

export function newGameChangeTopic(topic: string) {
  return {type: 'UI_NEW_GAME_CHANGE_TOPIC', topic};
}

export function newGameAddPlayer(playerId: string) {
  return {type: 'UI_NEW_GAME_ADD_PLAYER', playerId};
}

export function newGameRemovePlayer(playerId: string) {
  return {type: 'UI_NEW_GAME_REMOVE_PLAYER', playerId};
}

export function updateEmail(email: string) {
  return {type: 'UI_UPDATE_EMAIL', email};
}

export function updatePassword(password: string) {
  return {type: 'UI_UPDATE_PASSWORD', password};
}

export function updatePasswordConfirmation(passwordConfirmation: string) {
  return {type: 'UI_UPDATE_PASSWORD_CONFIRMATION', passwordConfirmation};
}

export function setAccountPasswordError(error: string) {
  return {type: 'UI_SET_ACCOUNT_PASSWORD_ERROR', error};
}

export function addErrorSnak(error: string) {
  return {type: 'UI_ADD_ERROR_SNAK', error};
}

export function removeErrorSnak(errorId: string) {
  return {type: 'UI_REMOVE_ERROR_SNAK', errorId};
}

export function filterHistory(query: string) {
  return {type: 'UI_FILTER_HISTORY', query};
}
