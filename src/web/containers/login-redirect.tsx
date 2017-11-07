import * as React from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import { State } from '../state';

type Props = {
  auth?: string
}

const RedirectComponent = ({auth}: Props) =>
  !auth ? (<Redirect to="/login" />) : null;

const mapStateToProps = ({auth}: State) => ({
  auth,
});

const LoginRedirect = connect(mapStateToProps)(RedirectComponent);

export default LoginRedirect;
