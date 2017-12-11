import CloseIcon from 'material-ui-icons/Close';
import IconButton from 'material-ui/IconButton';
import Snackbar from 'material-ui/Snackbar';
import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import { Redirect } from 'react-router';
import { Dispatch } from 'redux';
import { Color, Drawing, Point} from '../../common/models/drawing';
import { removeErrorSnak } from '../actions';
import BrushSizePicker from '../components/brush-size-picker';
import ColorPicker from '../components/color-picker';
import Draw from '../components/draw';
import { State } from '../state';

interface ErrorSnak {
  id: string;
  message: string;
}

interface Props {
  errors: ErrorSnak[];
  dismiss: (errorId: string) => void;
}

const toErrorSnak =
    (dismiss: (errorId: string) => void) =>
    ({id, message}: ErrorSnak) => {
  const actions = (
    <IconButton key='close' color='inherit' onClick={() => dismiss(id)}>
      <CloseIcon />
    </IconButton>
  );
  return (
    <Snackbar
      key={id}
      anchorOrigin={{vertical: 'bottom', horizontal: 'center' }}
      open={true}
      autoHideDuration={6000}
      onRequestClose={() => dismiss(id)}
      message={(<span>{message}</span>)}
      action={actions}
    />
  );
};

const ErrorSnaksComponent = ({errors, dismiss}: Props) => (
  <div>
    {errors.map(toErrorSnak(dismiss))}
  </div>
);

const mapStateToProps = ({ui}: State) => ({
  errors: Object.keys(ui.errors.messages).sort().map((id) => ({
    id,
    message: ui.errors.messages[id],
  })),
});

const mapDispatchToProps = (dispatch: Dispatch<State>) => ({
  dismiss: (errorId: string) => dispatch(removeErrorSnak(errorId)),
});

const ErrorSnaks =
    connect(mapStateToProps, mapDispatchToProps)(ErrorSnaksComponent);

export default ErrorSnaks;
