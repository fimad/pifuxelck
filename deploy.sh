#!/bin/bash
set -e
. deploy-vars.sh

cd $DEPLOY_DIR

gcloud beta functions deploy $FUNCTION_NAME \
  --project $PROJECT \
  --region $REGION \
  --stage-bucket $BUCKET \
  --trigger-http
