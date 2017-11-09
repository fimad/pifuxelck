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
