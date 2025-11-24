#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { ExpressFargateCdkStack } from '../stacks/express-fargate-cdk-stack';

const app = new cdk.App();
new ExpressFargateCdkStack(app, 'exprss-fargate-cdk', {
  env: { account: '141991823339', region: 'us-east-1' }
});
