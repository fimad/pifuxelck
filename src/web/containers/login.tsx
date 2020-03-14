import * as React from 'react';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { Dispatch } from 'redux';
import { login, register } from '../actions';
import { State } from '../state';
import { WebDispatch } from '../store';

import { Button, Paper, TextField, Typography } from '@material-ui/core';

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

class LoginComponent extends React.Component<Props, { [key: string]: string }> {
  private dispatchLogin: (e: any) => void;
  private dispatchRegister: () => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      password: '',
      user: '',
    };
    this.dispatchLogin = (e: any) => {
      this.props.dispatch(login(this.state.user, this.state.password));
      e.preventDefault();
    };
    this.dispatchRegister = () => {
      this.props.dispatch(push('/register'));
    };
  }

  public onChange(key: string) {
    return (event: any) => {
      this.setState({ [key]: event.target.value });
    };
  }

  public render() {
    if (this.props.auth) {
      return <Redirect to="/" />;
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
      <form onSubmit={this.dispatchLogin}>
        <Paper style={style}>
          <Typography variant="h4" style={{ textAlign: 'center' }}>
            pifuxelck
          </Typography>
          <TextField
            autoFocus={true}
            style={textStyle}
            onChange={this.onChange('user')}
            value={this.state.user}
            label="Username"
          />
          <TextField
            style={textStyle}
            onChange={this.onChange('password')}
            value={this.state.password}
            label="Password"
            type="password"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={this.props.inProgress}
            color="primary"
            onClick={this.dispatchLogin}
            style={buttonStyle}
          >
            Login
          </Button>
          <Typography variant="caption">
            Don't have an account?
            <Button
              onClick={this.dispatchRegister}
              disabled={this.props.inProgress}
              color="secondary"
            >
              Register
            </Button>
          </Typography>
        </Paper>
      </form>
    );
  }
}

const mapStateToProps = ({ auth, apiStatus }: State) => ({
  auth,
  inProgress: apiStatus.inProgress.LOGIN || apiStatus.inProgress.REGISTER,
});

const Login = connect(mapStateToProps)(LoginComponent as any);

export default Login;
