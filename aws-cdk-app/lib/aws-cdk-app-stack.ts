import { Stack, StackProps, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { join } from 'path';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class AwsCdkAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'AwsCdkAppQueue', {
      queueName : 'aws-cdk-app-queue',
      visibilityTimeout: Duration.seconds(300),
      removalPolicy: RemovalPolicy.DESTROY
    });

    const fn = new NodejsFunction(this, 'PocHandler', {
      functionName : 'aws-cdk-app-lambda',
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      // code: Code.fromAsset('lambda'),
      entry: join(__dirname, "../lambda/index.ts"),
      timeout: Duration.minutes(2),
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Allow Lambda to interact with SQS
    queue.grantConsumeMessages(fn);
  }
}
