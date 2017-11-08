import { Turn } from '../../common/models/turn';

export const UI_UPDATE_OUTBOX = 'UI_UPDATE_OUTBOX';

export function updateOutbox(gameId: string, turn: Turn) {
  return {type: UI_UPDATE_OUTBOX, gameId, turn};
}
