import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { Dispatch } from 'redux';
import { login, register } from '../actions';
import { State } from '../state';

import {
  Button,
  Paper,
  TextField,
  Typography,
} from 'material-ui';

const { push } = require('react-router-redux');

interface Props {
  auth?: string;
  dispatch: Dispatch<State>;
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
          <Typography type='display1' style={{textAlign: 'center'}}>
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
              type="submit"
              raised={true}
              disabled={this.props.inProgress}
              color='primary'
              onClick={this.dispatchRegister}
              style={buttonStyle}
          >
            Register
          </Button>
          <Typography type='caption'>
            Already have an account?
            <Button
                onClick={this.dispatchLogin}
                disabled={this.props.inProgress}
                color='accent'
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
