#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { AwsCdkAppStack } from '../lib/aws-cdk-app-stack';
import { ApiGateway } from '../lib/aws-api-gateway';
import { AwsCdkS3Dynamo } from '../lib/aws-cdk-s3-dynamo';

const app = new cdk.App();
const env = { account: '141991823339', region: 'us-east-1' }
new AwsCdkAppStack(app, 'aws-cdk-app', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  env: { account: '141991823339', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

new ApiGateway(app, 'aws-cdk-api-gateway', {
  env,
});


new AwsCdkS3Dynamo(app, 'aws-cdk-s3-dynamo', { env })