#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PocStack } from '../stacks/poc-stack';


// This creates a CDK Application.
// Think of App() as the “container” for all your AWS resources.
const app = new cdk.App({
    context: {
        stage: "dev",
        runtime: "nodejs18.x"
    }
});
// Creates your cloud infrastructure (stack)
// app → the CDK App container
// 'PocStack' → the stack name
// env → AWS Account + Region where resources will be deployed
new PocStack(app, 'PocStack', {
    env: { account: '141991823339', region: 'ap-south-1' }
});