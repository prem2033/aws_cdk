#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { EventDriverAppStack } from '../lib/event-driver-app-stack';


const app = new cdk.App();

const stage = app.node.tryGetContext("stage") || "dev";

new EventDriverAppStack(app, `event-driven-app-${stage}`, {
  env: { account: '141991823339', region: 'us-east-1' },
});
