import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { Dispatch } from 'redux';
import { login } from '../actions';
import { State } from '../state';

import {
  Button,
  Paper,
  TextField,
  Typography,
} from 'material-ui';

interface Props {
  auth?: string;
  dispatch: Dispatch<State>;
}

const style: any = {
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  width: 'fit-content',
};

class LoginComponent extends React.Component<Props, {[key: string]: string}> {

  private dispatchLogin: () => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      password: '',
      user: '',
    };
    this.dispatchLogin = () => {
      this.props.dispatch(login(this.state.user, this.state.password));
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
    const buttonStyle = {
      marginTop: '8px',
    };
    return (
      <Paper style={style}>
        <Typography type='display1' style={{textAlign: 'center'}}>
          pifuxelck
        </Typography>
        <TextField
            onChange={this.onChange('user')}
            value={this.state.user}
            label='Username'
        />
        <TextField
            onChange={this.onChange('password')}
            value={this.state.password}
            label='Password'
            type='password'
        />
        <Button
            raised={true}
            color='primary'
            onClick={this.dispatchLogin}
            style={buttonStyle}
        >
          Login
        </Button>
        <Button
            raised={true}
            color='accent'
            style={buttonStyle}
        >
          Register
        </Button>
      </Paper>
    );
  }
}

const mapStateToProps = ({auth}: State) => ({auth});

const Login = connect(mapStateToProps)(LoginComponent as any);

export default Login;
