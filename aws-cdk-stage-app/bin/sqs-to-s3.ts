#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SqsToS3Stack } from "../lib/sqs-to-s3";
import { environments, Stage } from "../env";

const app = new cdk.App();

// const stage = (process.env.STAGE as keyof typeof environments) || "dev";
const stage: Stage = app.node.tryGetContext("stage") || "dev";

if (!environments[stage]) {
  throw new Error(`❌ Invalid stage "${stage}"`);
}

new SqsToS3Stack(app, `sqs-to-S3-stack-${stage}`, {
  env: environments[stage],
  stage,
});
