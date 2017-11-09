import { Action } from '../actions';
import { Ui } from '../state';
import { Turn, drawingOrDefault } from '../../common/models/turn';
import { mapFrom } from '../../common/utils';

const initialState = {
  outbox: {} ,
  drawing: {
    brushSize: .0125,
    brushColor: {
      red: 0,
      blue: 0,
      green: 0,
      alpha: 1,
    },
  },
};
// 0.0125, 0.025, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.6

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
    const turn = state.outbox[action.gameId] || defaultDrawingTurn;
    if (turn.is_drawing != true) {
      return state;
    }
    const lastLine = turn.drawing.lines[turn.drawing.lines.length - 1];
    if (!lastLine) {
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
  return state;
}
