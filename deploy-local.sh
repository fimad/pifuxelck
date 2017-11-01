#!/bin/bash
set -e
. deploy-vars.sh

cd $DEPLOY_DIR

functions-emulator deploy $FUNCTION_NAME \
  --entry-point $ENTRY_POINT \
  --project $PROJECT \
  --trigger-http
