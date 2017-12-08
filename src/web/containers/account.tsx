import * as cx from 'classnames';
import AddIcon from 'material-ui-icons/Add';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import AccountEmail from '../components/account-email';
import AccountPassword from '../components/account-password';
import { State } from '../state';

import {
  setAccountPasswordError,
  updateAccount,
  updateEmail,
  updatePassword,
  updatePasswordConfirmation,
} from '../actions';

interface Props {
  email: string;
  password: string;
  passwordConfirmation: string;
  passwordError: string;
  onEmailUpdate: (email: string) => void;
  onEmailSubmit: (email: string) => void;
  onPasswordUpdate: (password: string) => void;
  onPasswordConfirmationUpdate: (passwordConfirmation: string) => void;
  onPasswordSubmit: (password: string, passwordConfirmation: string) => void;
}

const AccountComponent = (props: Props) => {
  return (
    <div>
      <AccountEmail {...props} />
      <AccountPassword {...props} />
    </div>
  );
};

const mapStateToProps = (state: State) => ({
  email: state.ui.account.email || state.entities.account.email || '',
  password: state.ui.account.password || '',
  passwordConfirmation: state.ui.account.passwordConfirmation || '',
  passwordError: state.ui.account.passwordError || '',
});

const mapDispatchToProps = (dispatch: Dispatch<State>) => ({
  onEmailSubmit: (email: string) => dispatch(updateAccount({email})),
  onEmailUpdate: (email: string) => dispatch(updateEmail(email)),
  onPasswordConfirmationUpdate: (passwordConfirmation: string) => {
    dispatch(setAccountPasswordError(''));
    dispatch(updatePasswordConfirmation(passwordConfirmation));
  },
  onPasswordSubmit: (password: string, passwordConfirmation: string) => {
    if (password !== passwordConfirmation) {
      dispatch(setAccountPasswordError('Passwords do not match.'));
    } else {
      dispatch(setAccountPasswordError(''));
      dispatch(updateAccount({password}));
    }
  },
  onPasswordUpdate: (password: string) => {
    dispatch(setAccountPasswordError(''));
    dispatch(updatePassword(password));
  },
});

const Account =
    connect(mapStateToProps, mapDispatchToProps)(AccountComponent);

export default Account;
