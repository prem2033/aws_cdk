#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { ExpressLambdaStack } from '../stacks/express-lambda-stack';

const app = new cdk.App();

new ExpressLambdaStack(app, 'Express-Lambda-Stack', {
  env: { account: '141991823339', region: 'us-east-1' },
});
