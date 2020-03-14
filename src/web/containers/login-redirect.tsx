import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { State } from '../state';

interface Props {
  auth?: string;
}

const RedirectComponent = ({ auth }: Props) =>
  !auth ? <Redirect to="/login" /> : null;

const mapStateToProps = ({ auth }: State) => ({
  auth,
});

const LoginRedirect = connect(mapStateToProps)(RedirectComponent);

export default LoginRedirect;
