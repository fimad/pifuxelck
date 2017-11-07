import * as React from 'react';
import MediaQuery from 'react-responsive';

export const Desktop = (props: any) =>
    <MediaQuery {...props} minWidth={992} />;

export const Tablet = (props: any) =>
    <MediaQuery {...props} minWidth={768} maxWidth={991} />;

export const Mobile = (props: any) =>
    <MediaQuery {...props} maxWidth={767} />;

export const Default = (props: any) =>
    <MediaQuery {...props} minWidth={768} />;
