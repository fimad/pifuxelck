import * as cx from 'classnames';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { updateAccount, updateEmail } from '../actions';
import { State } from '../state';

const styles = require('./account-email.css');

interface Props {
  email: string;
  onEmailUpdate: (email: string) => void;
  onEmailSubmit: (email: string) => void;
  sendInProgress: boolean;
}

export default (
    {email, onEmailUpdate, onEmailSubmit, sendInProgress}: Props) => {
  const myOnEmailUpdate = (event: React.SyntheticEvent) =>
      onEmailUpdate((event.target as HTMLInputElement).value);
  return (
    <div className={cx(styles.container, styles.email)}>
      <Paper className={styles.paper}>
          <Typography variant='h6' classes={{root: styles.title}}>
            Email Notifications
          </Typography>
          <Typography variant='caption' classes={{root: styles.caption}}>
            Providing an email address is optional and allows pifuxelck to
            notify you when it is your turn a game an when a game you are a
            participant in finishes.
          </Typography>
          <TextField
              classes={{root: styles.text}}
              disabled={sendInProgress}
              onChange={myOnEmailUpdate}
              onSubmit={() => onEmailSubmit(email)}
              label='Email'
              value={email}
              fullWidth={true}
          />
          <div className={styles.buttonContainer}>
            <Button
                disabled={sendInProgress}
                onClick={() => onEmailSubmit(email)}
                variant='contained'
                color='secondary'
                classes={{root: styles.button}}
            >
              Update
            </Button>
          </div>
      </Paper>
    </div>
  );
};
