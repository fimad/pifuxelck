import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Redirect } from 'react-router';
import { Dispatch } from 'redux';
import { login, register } from '../actions';
import { State } from '../state';
import { WebDispatch } from '../store';

import {
  Button,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';

interface Props {
  auth?: string;
  dispatch: WebDispatch;
  inProgress: boolean;
}

const style: any = {
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  width: 'fit-content',
};

class RegisterComponent extends
    React.Component<Props, {[key: string]: string}> {

  private dispatchLogin: () => void;
  private dispatchRegister: (e: any) => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      password: '',
      passwordConfirmation: '',
      user: '',
    };
    this.dispatchLogin = () => {
      this.props.dispatch(push('/login'));
    };
    this.dispatchRegister = (e: any) => {
      this.props.dispatch(register(this.state.user, this.state.password));
      e.preventDefault();
    };
  }

  public onChange(key: string) {
    return (event: any) => {
      this.setState({[key]: event.target.value});
    };
  }

  public render() {
    if (this.props.auth) {
      return (<Redirect to='/' />);
    }
    const textStyle = {
      marginBottom: '4px',
      marginTop: '4px',
    };
    const buttonStyle = {
      marginBottom: '8px',
      marginTop: '8px',
    };
    return (
      <form onSubmit={this.dispatchRegister}>
        <Paper style={style}>
          <Typography variant='h4' style={{textAlign: 'center'}}>
            pifuxelck
          </Typography>
          <TextField
              autoFocus={true}
              style={textStyle}
              onChange={this.onChange('user')}
              value={this.state.user}
              label='Username'
          />
          <TextField
              style={textStyle}
              onChange={this.onChange('password')}
              value={this.state.password}
              label='Password'
              type='password'
          />
          <TextField
              style={textStyle}
              onChange={this.onChange('passwordConfirmation')}
              value={this.state.passwordConfirmation}
              label='Confirm Password'
              type='password'
          />
          <Button
              type='submit'
              variant='contained'
              disabled={this.props.inProgress}
              color='primary'
              onClick={this.dispatchRegister}
              style={buttonStyle}
          >
            Register
          </Button>
          <Typography variant='caption'>
            Already have an account?
            <Button
                onClick={this.dispatchLogin}
                disabled={this.props.inProgress}
                color='secondary'
            >
              Sign in
            </Button>
          </Typography>
        </Paper>
      </form>
    );
  }
}

const mapStateToProps = ({auth, apiStatus}: State) => ({
  auth,
  inProgress: apiStatus.inProgress.REGISTER,
});

const Register = connect(mapStateToProps)(RegisterComponent as any);

export default Register;
