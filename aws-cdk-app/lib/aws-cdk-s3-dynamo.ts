import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as events from "aws-cdk-lib/aws-events";
import * as eventTargets from "aws-cdk-lib/aws-events-targets";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";

export class AwsCdkS3Dynamo extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // S3 Bucket
        const bucket = new s3.Bucket(this, `${id}-s3-bucket`, {
            bucketName:`${id}-s3-bucket`,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // DynamoDB Table
        const table = new dynamodb.Table(this, `${id}-table`, {
            tableName: `${id}-table`,
            partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // SQS Queue
        const queue = new sqs.Queue(this,`${id}-queue`, {
            queueName: `${id}-queue`,
            visibilityTimeout: cdk.Duration.seconds(60),
        });

        // Lambda Function
        const handler = new lambda.Function(this, `${id}-function`, {
            functionName: `${id}-function`,
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "aws-cdk-s3-dynamo.handler",
            code: lambda.Code.fromAsset("lambda"),
            timeout: cdk.Duration.seconds(60),
            memorySize: 256,
            environment: {
                BUCKET_NAME: bucket.bucketName,
                TABLE_NAME: table.tableName,
            },
        });

        // Grant Permissions
        bucket.grantReadWrite(handler);
        table.grantReadWriteData(handler);

        // Add SQS as Lambda Event Source
        handler.addEventSource(new lambdaEventSources.SqsEventSource(queue));

        // EventBridge Scheduler (runs every minute)
        new events.Rule(this, "SchedulerRule", {
            schedule: events.Schedule.rate(cdk.Duration.days(1)),
            // targets: [new eventTargets.LambdaFunction(handler, {
            //     event: events.RuleTargetInput.fromObject({
            //         source: "scheduler",
            //         name: "prem",
            //         email: "premprakash2033@gmail.com"
            //     })
            // })],
            targets : [new eventTargets.LambdaFunction(handler)]
        });
    }
}
