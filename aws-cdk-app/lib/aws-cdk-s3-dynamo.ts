import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as events from "aws-cdk-lib/aws-events";
import * as eventTargets from "aws-cdk-lib/aws-events-targets";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import { join } from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";

export class AwsCdkS3Dynamo extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const logGroup = new LogGroup(this, `${id}-log-group`, {
            retention: RetentionDays.ONE_DAY,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // S3 Bucket
        const bucket = new s3.Bucket(this, `${id}-s3-bucket`, {
            bucketName: `${id}-s3-bucket`,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,   // <--- Required to delete non-empty bucket
        });

        // DynamoDB Table
        const table = new dynamodb.Table(this, `${id}-table`, {
            tableName: `${id}-table`,
            partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,   // <--- Ensures table deletion
            deletionProtection: false,           // <--- Ensure deletion allowed
        });

        // SQS Queue
        const queue = new sqs.Queue(this, `${id}-queue`, {
            queueName: `${id}-queue`,
            visibilityTimeout: cdk.Duration.seconds(60),
            removalPolicy: cdk.RemovalPolicy.DESTROY,   // <--- Required for SQS
        });

        // Lambda Function
        const handler = new NodejsFunction(this, `${id}-function`, {
            functionName: `${id}-function`,
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.AwsCdkS3DynamoHandler",
            entry: join(__dirname, "../lambda/index.ts"),
            timeout: cdk.Duration.seconds(60),
            memorySize: 256,
            logGroup,
            environment: {
                BUCKET_NAME: bucket.bucketName,
                TABLE_NAME: table.tableName,
            },
        });

        // Permissions
        bucket.grantReadWrite(handler);
        table.grantReadWriteData(handler);

        handler.addEventSource(new lambdaEventSources.SqsEventSource(queue));

        // EventBridge Rule
        const rule = new events.Rule(this, "SchedulerRule", {
            schedule: events.Schedule.rate(cdk.Duration.days(1)),
            targets: [new eventTargets.LambdaFunction(handler)]
            // targets: [new eventTargets.LambdaFunction(handler, {
            //     event: events.RuleTargetInput.fromObject({
            //         source: "scheduler",
            //         name: "prem",
            //         email: "premprakash2033@gmail.com"
            //     })
            // })],
        });

        // Delete EventBridge Rule on stack deletion
        rule.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

        new cdk.CfnOutput(this, `${id}-stack`, {
            value: this.stackName,
        });
    }
}
