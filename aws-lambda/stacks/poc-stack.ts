import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface PocStackProps extends cdk.StackProps { }


export class PocStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: PocStackProps) {
        super(scope, id, props);


        // 1) S3 bucket (name provided by user)
        const bucketName = 'test-infom-prem2033';
        const bucket = new s3.Bucket(this, 'StorageBucket', {
            bucketName: bucketName,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        });


        // 2) DLQ (Dead Letter Queue)
        const dlq = new sqs.Queue(this, 'PocDLQ', {
            retentionPeriod: cdk.Duration.days(14)
        });


        // 3) SQS queue with DLQ
        const queue = new sqs.Queue(this, 'PocQueue', {
            visibilityTimeout: cdk.Duration.seconds(180),
            retentionPeriod: cdk.Duration.days(4),
            deadLetterQueue: {
                maxReceiveCount: 5, // Move to DLQ after 5 failed receives
                queue: dlq
            }
        });


        // 4) Lambda function
        const fn = new lambda.Function(this, 'PocHandler', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromAsset('lambda'),
            timeout: cdk.Duration.minutes(2),
            environment: {
                BUCKET_NAME: bucket.bucketName,
                QUEUE_URL: queue.queueUrl
            }
        });


        // Grant permissions for Lambda to put objects into S3
        bucket.grantPut(fn);


        // 5) Add SQS Event Source with batch size 5
        fn.addEventSource(new sources.SqsEventSource(queue, {
            batchSize: 5
        }));


        // 6) Add CloudWatch logging permissions
        fn.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));


        // Outputs
        new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });
        new cdk.CfnOutput(this, 'QueueUrl', { value: queue.queueUrl });
        new cdk.CfnOutput(this, 'DLQUrl', { value: dlq.queueUrl });
        new cdk.CfnOutput(this, 'LambdaName', { value: fn.functionName }); (this, 'BucketName', { value: bucket.bucketName });
        new cdk.CfnOutput(this, 'QueueUrl', { value: queue.queueUrl });
        new cdk.CfnOutput(this, 'LambdaName', { value: fn.functionName });
    }
}