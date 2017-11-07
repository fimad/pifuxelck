import * as React from 'react';
import { Dispatch } from 'redux';
import { Redirect } from 'react-router';
import { State } from '../state';
import { connect } from 'react-redux';
import { login } from '../actions';

import {
  Paper,
  RaisedButton,
  TextField,
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
    return (event: any, value: string) => {
      this.setState({[key]: value});
    };
  }

  render() {
    if (this.props.auth) {
      return (<Redirect to="/" />);
    }
    return (
      <Paper style={style}>
        <TextField
            onChange={this.onChange("user")}
            value={this.state.user}
            floatingLabelText="Username" />
        <TextField
            onChange={this.onChange("password")}
            value={this.state.password}
            floatingLabelText="Password"
            type="password" />
        <RaisedButton
            label="Login"
            primary={true}
            onClick={this.dispatchLogin} />
        <RaisedButton
            label="Register"
            secondary={true} />
      </Paper>
    );
  }
}

const mapStateToProps = ({auth}: State) => ({auth});

const Login = connect(mapStateToProps)(LoginComponent as any);

export default Login;
