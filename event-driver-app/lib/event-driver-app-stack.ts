import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events'
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";


export class EventDriverAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //publisherQueue dead letter queue
    const publisherDLQ = new sqs.Queue(this, `${id}-publisher-dlq`, {
      queueName: `${id}-publisher-dlq`,
      retentionPeriod: cdk.Duration.days(14),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    //publisher queue to push message to Event Bridge
    const publisherQueue = new sqs.Queue(this, `${id}-publisher-queue`, {
      queueName: `${id}-publisher-queue`,
      visibilityTimeout: cdk.Duration.minutes(5),
      retentionPeriod: cdk.Duration.minutes(2),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deadLetterQueue: {
        maxReceiveCount: 3,
        queue: publisherDLQ,
      },
    });

    // EventBridge Bus
    const eventBus = new EventBus(this, `${id}-publisher-event-bus`, {
      eventBusName: `${id}-event-bus`,

    });
    eventBus.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // lambda that will get attached to queu to push event to Event Bridge
    const publisherHandler = new NodejsFunction(this, `${id}-publisher-handler`, {
      functionName: `${id}-publisher-handler`,
      entry: "src/handlers/push-event.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      environment: {
        PUBLISHER_QUEUE_URL: publisherQueue.queueUrl,
        EVENT_BUS_NAME: eventBus.eventBusName
      },
    });

    //adding trigger to publisher lambda
    publisherHandler.addEventSource(new lambdaEventSources.SqsEventSource(publisherQueue));

    // EventBridge Rule → processingQueue
    const rule = new Rule(this, `${id}-event-bus-rule`, {
      ruleName : `${id}-event-bus-rule`,
      eventBus: eventBus,
      eventPattern: {
        source: ["event-driven"],
        detailType: ["user.crud"],
        // detail: {
        //   data: {
        //     email: ["abc@gmail.com"]
        //   }
        // }
      },
      targets: [new SqsQueue(publisherQueue)]
    });
    rule.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    publisherQueue.grantSendMessages(publisherHandler);
    publisherQueue.grantConsumeMessages(publisherHandler);
    eventBus.grantPutEventsTo(publisherHandler);

    // end of publisher

    // start of consumers

    // consumer deal letter queue
    const consuemrDlq = new sqs.Queue(this, `${id}-consumer-dlq`, {
      queueName: `${id}-consumer-dlq`,
      retentionPeriod: cdk.Duration.days(14),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    //consuemr queue to recevie event from event bus
    const consumerQueue = new sqs.Queue(this, `${id}-consumer-queue`, {
      queueName: `${id}-consumer-queue`,
      visibilityTimeout: cdk.Duration.minutes(5),
      retentionPeriod: cdk.Duration.minutes(2),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deadLetterQueue: {
        maxReceiveCount: 3,
        queue: consuemrDlq,
      },
    });


    // DynamoDB Table
    const consuemrTable = new Table(this, `${id}-consumer-table`, {
      tableName:`${id}-consumer-table`,
      partitionKey: { name: "email", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // lambda that will get attached to queu to push event to Event Bridge
    const consuemrHandler = new NodejsFunction(this, `${id}-consumer-handler`, {
      functionName: `${id}-consumer-handler`,
      entry: "src/handlers/consumer-event.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      environment: {
        CONSUMER_QUEUE_URL: consumerQueue.queueUrl,
        TABLE_NAME: consuemrTable.tableName
      },
    });

    //adding trigger to consumer lambda
    consuemrHandler.addEventSource(new lambdaEventSources.SqsEventSource(consumerQueue));

    consumerQueue.grantSendMessages(consuemrHandler);
    consumerQueue.grantConsumeMessages(consuemrHandler);
    consuemrTable.grantReadWriteData(consuemrHandler);

    new cdk.CfnOutput(this, `${id}-stack-name:`, {
      value: this.stackName,
    });
  }
}
