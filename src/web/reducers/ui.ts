import { Line } from '../../common/models/drawing';
import { drawingOrDefault, Turn } from '../../common/models/turn';
import { objectWithKeys, objectWithoutKeys } from '../../common/utils';
import { Action } from '../actions';
import { OutboxEntry, Ui } from '../state';

const initialState = {
  account: {
    email: null as (string | null),
    password: null as (string | null),
    passwordConfirmation: null as (string | null),
    passwordError: '',
  },
  contacts: {
    lookup: '',
  },
  drawing: {
    brushColor: {
      alpha: 1,
      blue: 0,
      green: 0,
      red: 0,
    },
    brushSize: .0125,
    inProgress: false,
  },
  errors: {
    messages: {},
    nextId: 0,
  },
  history: {
    query: null as (string | null),
  },
  newGame: {
    topic: '',
    users: [] as string[],
  },
  outbox: {},
};

const defaultDrawingTurn: Turn = {
  drawing: drawingOrDefault({} as Turn),
  is_drawing: true,
};

const defaultOutbox = {
  redo: [] as Line[],
  turn: defaultDrawingTurn,
};

export default function(state: Ui = initialState, action: Action) {
  const getRedo = (entry: OutboxEntry) => (entry || defaultOutbox).redo || [];
  const getTurn =
    (entry: OutboxEntry) => (entry || defaultOutbox).turn || defaultDrawingTurn;

  if (action.type === 'LOGOUT' ||
      action.type === 'LOGIN_START' ||
      action.type === 'REGISTER_START') {
    return initialState;
  }
  if (action.type === 'GET_INBOX_SUCCESS' && action.message.inbox_entries) {
    return {
      ...state,
      outbox: objectWithKeys(
        state.outbox,
        action.message.inbox_entries.map(({game_id}) => game_id)),
    };
  }
  if (action.type === 'UI_UPDATE_OUTBOX') {
    const redo = getRedo(state.outbox[action.gameId]);
    return {
      ...state,
      outbox: {
        ...state.outbox,
        [action.gameId]: {
          redo,
          turn: action.turn,
        },
      },
    };
  }
  if (action.type === 'UI_CHOOSE_BRUSH_SIZE') {
    return {
      ...state,
      drawing: {
        ...state.drawing,
        brushSize: action.size,
      },
    };
  }
  if (action.type === 'UI_CHOOSE_BRUSH_COLOR') {
    return {
      ...state,
      drawing: {
        ...state.drawing,
        brushColor: action.color,
      },
    };
  }
  if (action.type === 'UI_UPDATE_BACKGROUND_COLOR') {
    const redo = getRedo(state.outbox[action.gameId]);
    const turn = getTurn(state.outbox[action.gameId]);
    if (turn.is_drawing !== true) {
      return state;
    }
    return {
      ...state,
      outbox: {
        ...state.outbox,
        [action.gameId]: {
          redo,
          turn: {
            ...turn,
            drawing: {
              ...turn.drawing,
              background_color: action.color,
            },
          },
        },
      },
    };
  }
  if (action.type === 'UI_START_DRAWING_LINE') {
    if (!Number.isFinite(action.point.x) || !Number.isFinite(action.point.y)) {
      return state;
    }

    const turn = getTurn(state.outbox[action.gameId]);
    if (turn.is_drawing !== true) {
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
          redo: [],
          turn: {
            ...turn,
            drawing: {
              ...turn.drawing,
              lines: [
                ...turn.drawing.lines,
                {
                  color: state.drawing.brushColor,
                  points: [action.point],
                  size: state.drawing.brushSize,
                },
              ],
            },
          },
        },
      },
    };
  }
  if (action.type === 'UI_APPEND_DRAWING_LINE') {
    if (!Number.isFinite(action.point.x) || !Number.isFinite(action.point.y)) {
      return state;
    }

    const turn = getTurn(state.outbox[action.gameId]);
    if (turn.is_drawing !== true) {
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
    const dX = lastPoint.x - action.point.x;
    const dY = lastPoint.y - action.point.y;
    const sqrDiff = dX * dX + dY * dY;
    const minDiff = 0.01;
    if (sqrDiff < minDiff * minDiff) {
      return state;
    }

    return {
      ...state,
      outbox: {
        ...state.outbox,
        [action.gameId]: {
          redo: [],
          turn: {
            ...turn,
            drawing: {
              ...turn.drawing,
              lines: [
                ...turn.drawing.lines.slice(0, -1),
                {
                  ...lastLine,
                  points: [...lastLine.points, action.point],
                },
              ],
            },
          },
        },
      },
    };
  }
  if (action.type === 'UI_UNDO_DRAWING_LINE') {
    const redo = getRedo(state.outbox[action.gameId]);
    const turn = getTurn(state.outbox[action.gameId]);
    if (turn.is_drawing !== true || turn.drawing.lines.length === 0) {
      return state;
    }
    return {
      ...state,
      outbox: {
        ...state.outbox,
        [action.gameId]: {
          redo: [turn.drawing.lines[turn.drawing.lines.length - 1], ...redo],
          turn: {
            ...turn,
            drawing: {
              ...turn.drawing,
              lines: [...turn.drawing.lines.slice(0, -1)],
            },
          },
        },
      },
    };
  }
  if (action.type === 'UI_REDO_DRAWING_LINE') {
    const redo = getRedo(state.outbox[action.gameId]);
    const turn = getTurn(state.outbox[action.gameId]);
    if (turn.is_drawing !== true || redo.length === 0) {
      return state;
    }
    return {
      ...state,
      outbox: {
        ...state.outbox,
        [action.gameId]: {
          redo: redo.slice(1),
          turn: {
            ...turn,
            drawing: {
              ...turn.drawing,
              lines: [...turn.drawing.lines, redo[0]],
            },
          },
        },
      },
    };
  }
  if (action.type === 'UI_CHANGE_CONTACT_LOOKUP') {
    return {
      ...state,
      contacts: {
        lookup: action.lookup,
      },
    };
  }
  if (action.type === 'UI_NEW_GAME_CHANGE_TOPIC') {
    return {
      ...state,
      newGame: {
        ...state.newGame,
        topic: action.topic,
      },
    };
  }
  if (action.type === 'UI_NEW_GAME_ADD_PLAYER') {
    return {
      ...state,
      newGame: {
        ...state.newGame,
        users: [
          ...(state.newGame.users.filter((x) => x !== action.playerId)),
          action.playerId,
        ],
      },
    };
  }
  if (action.type === 'UI_NEW_GAME_REMOVE_PLAYER') {
    return {
      ...state,
      newGame: {
        ...state.newGame,
        users: state.newGame.users.filter((x: string) => x !== action.playerId),
      },
    };
  }
  if (action.type === 'UI_UPDATE_EMAIL') {
    return {
      ...state,
      account: {
        ...state.account,
        email: action.email,
      },
    };
  }
  if (action.type === 'UI_UPDATE_PASSWORD') {
    return {
      ...state,
      account: {
        ...state.account,
        password: action.password,
      },
    };
  }
  if (action.type === 'UI_UPDATE_PASSWORD_CONFIRMATION') {
    return {
      ...state,
      account: {
        ...state.account,
        passwordConfirmation: action.passwordConfirmation,
      },
    };
  }
  if (action.type === 'UI_SET_ACCOUNT_PASSWORD_ERROR') {
    return {
      ...state,
      account: {
        ...state.account,
        passwordError: action.error,
      },
    };
  }
  if (action.type === 'UI_ADD_ERROR_SNAK') {
    return {
      ...state,
      errors: {
        messages: {
          ...state.errors.messages,
          [state.errors.nextId]: action.error,
        },
        nextId: state.errors.nextId + 1,
      },
    };
  }
  if (action.type === 'UI_REMOVE_ERROR_SNAK') {
    return {
      ...state,
      errors: {
        ...state.errors,
        messages: objectWithoutKeys(state.errors.messages, [action.errorId]),
      },
    };
  }
  if (action.type === 'UI_FILTER_HISTORY') {
    return {
      ...state,
      history: {
        ...state.history,
        query: action.query,
      },
    };
  }
  if (action.type === '@@router/LOCATION_CHANGE' ||
      action.type === 'UI_STOP_DRAWING_LINE') {
    return {
      ...state,
      account: {
        email: null,
        password: null,
        passwordConfirmation: null,
        passwordError: '',
      },
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
