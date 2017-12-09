import * as cx from 'classnames';
import AddIcon from 'material-ui-icons/Add';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { updateAccount, updateEmail } from '../actions';
import { State } from '../state';

const styles = require('./account-password.css');

interface Props {
  password: string;
  passwordConfirmation: string;
  passwordError: string;
  onPasswordUpdate: (password: string) => void;
  onPasswordConfirmationUpdate: (password: string) => void;
  onPasswordSubmit: (password: string, passwordConfirmation: string) => void;
  sendInProgress: boolean;
}

export default ({
    password, passwordConfirmation, passwordError, onPasswordUpdate,
    onPasswordConfirmationUpdate: onConfirmationUpdate,
    onPasswordSubmit, sendInProgress}: Props) => {
  return (
    <div className={cx(styles.container)}>
      <Paper className={styles.paper}>
          <Typography type='title' className={styles.title}>
            Password
          </Typography>
          <Typography type='caption' className={styles.caption}>
            Passwords must be longer than 8 characters. There are no other
            requirements. There is not yet a mechanism to reset your password.
            Beware.
          </Typography>
          <TextField
              className={styles.text}
              disabled={sendInProgress}
              onChange={(event) => onPasswordUpdate(event.target.value)}
              type='password'
              label='Password'
              value={password}
              fullWidth={true}
          />
          <TextField
              className={styles.text}
              disabled={sendInProgress}
              onChange={(event) => onConfirmationUpdate(event.target.value)}
              type='password'
              label='Confirm Password'
              value={passwordConfirmation}
              fullWidth={true}
          />
          <Typography type='caption' color='accent' className={styles.caption}>
            {passwordError}
          </Typography>
          <div className={styles.buttonContainer}>
            <Button
                disabled={sendInProgress}
                onClick={() => onPasswordSubmit(password, passwordConfirmation)}
                raised={true}
                color='accent'
                className={styles.button}
            >
              Update
            </Button>
          </div>
      </Paper>
    </div>
  );
};
