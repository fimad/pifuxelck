import * as React from 'react';
import { Dispatch } from 'redux';
import { Redirect } from 'react-router';
import { State } from '../state';
import { connect } from 'react-redux';
import { login } from '../actions';

import {
  Paper,
  Button,
  TextField,
  Typography,
} from 'material-ui';

type Props = {
  auth?: string,
  dispatch: Dispatch<State>,
}

const style: any = {
  display: 'flex',
  width: 'fit-content',
  flexDirection: 'column',
  padding: '16px',
};

class LoginComponent extends React.Component<Props, {[key: string]: string}> {

  private dispatchLogin: () => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      user: '',
      password: '',
    };
    this.dispatchLogin = () => {
      this.props.dispatch(login(this.state.user, this.state.password));
    }
  }

  onChange(key: string) {
    return (event: any) => {
      this.setState({[key]: event.target.value});
    };
  }

  render() {
    if (this.props.auth) {
      return (<Redirect to="/" />);
    }
    const buttonStyle = {
      marginTop: '8px',
    };
    return (
      <Paper style={style}>
        <Typography type="display1" style={{textAlign: 'center'}}>
          pifuxelck
        </Typography>
        <TextField
            onChange={this.onChange("user")}
            value={this.state.user}
            label="Username" />
        <TextField
            onChange={this.onChange("password")}
            value={this.state.password}
            label="Password"
            type="password" />
        <Button raised color="primary" onClick={this.dispatchLogin} style={buttonStyle}>
          Login
        </Button>
        <Button raised color="accent" style={buttonStyle}>
          Register
        </Button>
      </Paper>
    );
  }
}

const mapStateToProps = ({auth}: State) => ({auth});

const Login = connect(mapStateToProps)(LoginComponent as any);

export default Login;
