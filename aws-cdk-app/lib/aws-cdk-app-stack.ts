import { Stack, StackProps, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'

export class AwsCdkAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const logGroup = new LogGroup(this, `${id}-log-group`, {
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const dlq = new sqs.Queue(this, `${id}-dlq`, {
      queueName: `${id}-dlq`,
      retentionPeriod: Duration.days(14),
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const queue = new sqs.Queue(this, `${id}-queue`, {
      queueName: `${id}-queue`,
      visibilityTimeout: Duration.seconds(300),
      removalPolicy: RemovalPolicy.DESTROY,
      // Attach DLQ with 3 retry attempts
      deadLetterQueue: {
        maxReceiveCount: 3,
        queue: dlq,
      },
    });

    const fn = new NodejsFunction(this, `${id}-function`, {
      functionName: `${id}-function`,
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      // code: Code.fromAsset('lambda'),
      entry: join(__dirname, "../lambda/index.ts"),
      timeout: Duration.minutes(2),
      logGroup: logGroup
    });

    // fn.addEventSource(new SqsEventSource(queue, {
    //   batchSize: 10,   // Optional
    // }));

    fn.addEventSource(new SqsEventSource(queue));
    // Allow Lambda to interact with SQS
    queue.grantConsumeMessages(fn);
  }
}
