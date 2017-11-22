import { Action } from '../actions';
import { Ui } from '../state';
import { Turn, drawingOrDefault } from '../../common/models/turn';
import { mapFrom } from '../../common/utils';

const initialState = {
  outbox: {} ,
  drawing: {
    inProgress: false,
    brushSize: .0125,
    brushColor: {
      red: 0,
      blue: 0,
      green: 0,
      alpha: 1,
    },
  },
  contacts: {
    lookup: '',
  },
  newGame: {
    topic: '',
    users: [] as string[],
  },
};

const defaultDrawingTurn: Turn = {
  is_drawing: true,
  drawing: drawingOrDefault({} as Turn),
};

export default function(state: Ui = initialState, action: Action) {
  if (action.type == 'LOGOUT' || action.type == 'LOGIN_START') {
    return initialState;
  }
  if (action.type == 'UI_UPDATE_OUTBOX') {
    return {
      ...state,
      outbox: {
        ...state.outbox,
        [action.gameId]: action.turn,
      },
    };
  }
  if (action.type == 'UI_CHOOSE_BRUSH_SIZE') {
    return {
      ...state,
      drawing: {
        ...state.drawing,
        brushSize: action.size,
      },
    };
  }
  if (action.type == 'UI_CHOOSE_BRUSH_COLOR') {
    return {
      ...state,
      drawing: {
        ...state.drawing,
        brushColor: action.color,
      },
    };
  }
  if (action.type == 'UI_UPDATE_BACKGROUND_COLOR') {
    const turn = state.outbox[action.gameId] || defaultDrawingTurn;
    if (turn.is_drawing != true) {
      return state;
    }
    return {
      ...state,
      outbox: {
        ...state.outbox,
        [action.gameId]: {
          ...turn,
          drawing: {
            ...turn.drawing,
            background_color: action.color,
          }
        }
      }
    };
  }
  if (action.type == 'UI_START_DRAWING_LINE') {
    if (!Number.isFinite(action.point.x) || !Number.isFinite(action.point.y)) {
      return state;
    }

    const turn = state.outbox[action.gameId] || defaultDrawingTurn;
    if (turn.is_drawing != true) {
      return state;
    }

    return {
      ...state,
      drawing: {
        ...state.drawing,
        inProgress: true,
      },
      outbox: {
        ...state.outbox,
        [action.gameId]: {
          ...turn,
          drawing: {
            ...turn.drawing,
            lines: [
              ...turn.drawing.lines,
              {
                color: state.drawing.brushColor,
                size: state.drawing.brushSize,
                points: [action.point],
              }
            ],
          }
        }
      }
    };
  }
  if (action.type == 'UI_APPEND_DRAWING_LINE') {
    if (!Number.isFinite(action.point.x) || !Number.isFinite(action.point.y)) {
      return state;
    }

    const turn = state.outbox[action.gameId] || defaultDrawingTurn;
    if (turn.is_drawing != true) {
      return state;
    }

    const lastLine = turn.drawing.lines[turn.drawing.lines.length - 1];
    if (!lastLine) {
      return state;
    }

    const lastPoint = lastLine.points[lastLine.points.length - 1];
    if (!lastPoint) {
      return state;
    }

    // Ensure that the cursor has moved a significant distance from the previous
    // point before appending a new point.
    var dX = lastPoint.x - action.point.x;
    var dY = lastPoint.y - action.point.y;
    var sqrDiff = dX * dX + dY * dY;
    var minDiff = 0.01;
    if (sqrDiff < minDiff * minDiff) {
      return state;
    }

    return {
      ...state,
      outbox: {
        ...state.outbox,
        [action.gameId]: {
          ...turn,
          drawing: {
            ...turn.drawing,
            lines: [
              ...turn.drawing.lines.slice(0, -1),
              {
                ...lastLine,
                points: [...lastLine.points, action.point],
              }
            ],
          }
        }
      }
    };
  }
  if (action.type == 'UI_UNDO_DRAWING_LINE') {
    const turn = state.outbox[action.gameId] || defaultDrawingTurn;
    if (turn.is_drawing != true) {
      return state;
    }
    return {
      ...state,
      outbox: {
        ...state.outbox,
        [action.gameId]: {
          ...turn,
          drawing: {
            ...turn.drawing,
            lines: [...turn.drawing.lines.slice(0, -1)],
          }
        }
      }
    };
  }
  if (action.type == 'UI_CHANGE_CONTACT_LOOKUP') {
    return {
      ...state,
      contacts: {
        lookup: action.lookup,
      }
    };
  }
  if (action.type == 'UI_NEW_GAME_CHANGE_TOPIC') {
    return {
      ...state,
      newGame: {
        ...state.newGame,
        topic: action.topic,
      }
    };
  }
  if (action.type == 'UI_NEW_GAME_ADD_PLAYER') {
    return {
      ...state,
      newGame: {
        ...state.newGame,
        users: [
          ...(state.newGame.users.filter((x) => x != action.playerId)),
          action.playerId,
        ],
      },
    };
  }
  if (action.type == 'UI_NEW_GAME_REMOVE_PLAYER') {
    return {
      ...state,
      newGame: {
        ...state.newGame,
        users: state.newGame.users.filter((x: string) => x != action.playerId),
      },
    };
  }
  if (action.type == '@@router/LOCATION_CHANGE' ||
      action.type == 'UI_STOP_DRAWING_LINE') {
    return {
      ...state,
      drawing: {
        ...state.drawing,
        inProgress: false,
      },
      newGame: {
        topic: '',
        users: [],
      },
    };
  }
  return state;
}
