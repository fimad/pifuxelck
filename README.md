# pifuxelck

A telephone drawing game.

## Development

To develop locally you will need to have a node.js setup along with yarn.

For running tests you will also need a MySQL server running locally. There
should be a password-less user, `pifuxelck_test`, that has read-write permission
to access the database, `pifuxelck_test`.

Once you have the above dependencies installed, to get started with development,
run:

```shell
yarn install
```

There are two sub-projects in this repository. A progressive web app and an API
server.

### Web

To run a webpack dev-server which automatically re-complies as you save run:

```shell
yarn web-local
```

This will bring up a server at [localhost:3000](http://localhost:3000).

By default the web server connects to the production API so you get live data
populating

### API Server

The recommend approach for developing the API server is to use TDD. There are
integration tests in the `tests/server` along with utilities for creating users
and interacting with the server as these users.

The integration tests can be executed by running:

```shell
yarn test
```

It also possible to bring up local server using the test configuration by
running:

```shell
yarn server-local
```

This will not automatically re-compile however.

### Submitting Code

Before submitting code ensure that all tests pass and that there are no style
problems. Running `yarn lint` will list all current issues with style.

Running `yarn fix` will attempt to automatically fix some issues. It is
recommended that you stage or your changes before running fix in case it breaks
things...

## Deployment

There are currently two environments that can be deployed to, `default` (prod)
and `canary`.

The currently selected environment is controlled by the `firebase` utility
method. Running `firebase use` will list the current directory, and passing an
environment as a parameter will select that environment.

To deploy a new version of the API server run `yarn server-deploy`.

To deploy a new version of the web app run `yarn web-deploy`.

Currently, both the canary and prod version of the web app call out to the
production version of the API server.

### Secrets

Secrets such as API keys are passed to the API server via the firebase config
framework. Currently the following keys need to be set:

 * `firebase functions:config:set mailgun.api-key=${MAILGUN_API_KEY}`
