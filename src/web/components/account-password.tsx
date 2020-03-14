import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import * as cx from 'classnames';
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
  password,
  passwordConfirmation,
  passwordError,
  onPasswordUpdate,
  onPasswordConfirmationUpdate: onConfirmationUpdate,
  onPasswordSubmit,
  sendInProgress,
}: Props) => {
  const onChange = (event: React.SyntheticEvent) =>
    onPasswordUpdate((event.target as HTMLInputElement).value);
  return (
    <div className={cx(styles.container)}>
      <Paper className={styles.paper}>
        <Typography variant="h6" classes={{ root: styles.title }}>
          Password
        </Typography>
        <Typography variant="caption" classes={{ root: styles.caption }}>
          Passwords must be longer than 8 characters. There are no other
          requirements. There is not yet a mechanism to reset your password.
          Beware.
        </Typography>
        <TextField
          classes={{ root: styles.text }}
          disabled={sendInProgress}
          onChange={onChange}
          type="password"
          label="Password"
          value={password}
          fullWidth={true}
        />
        <TextField
          classes={{ root: styles.text }}
          disabled={sendInProgress}
          onChange={(event) => onConfirmationUpdate(event.target.value)}
          type="password"
          label="Confirm Password"
          value={passwordConfirmation}
          fullWidth={true}
        />
        <Typography
          variant="caption"
          color="secondary"
          className={styles.caption}
        >
          {passwordError}
        </Typography>
        <div className={styles.buttonContainer}>
          <Button
            disabled={sendInProgress}
            onClick={() => onPasswordSubmit(password, passwordConfirmation)}
            variant="contained"
            color="secondary"
            classes={{ root: styles.button }}
          >
            Update
          </Button>
        </div>
      </Paper>
    </div>
  );
};
