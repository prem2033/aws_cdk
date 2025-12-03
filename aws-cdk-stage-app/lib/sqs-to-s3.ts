import { StackProps, Stack, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambdaEvent from "aws-cdk-lib/aws-lambda-event-sources";

type customStackProps = StackProps & {
  stage: string;
};

export class SqsToS3Stack extends Stack {
  constructor(scope: Construct, id: string, props: customStackProps) {
    super(scope, id, props);

    // S3 Bucket
    const bucket = new s3.Bucket(this, `${id}s3-bucket`, {
      bucketName: `sqs-to-s3-${props.stage}`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // SQS Queue
    const queue = new sqs.Queue(this, "DataQueue", {
      queueName: `data-queue-${props.stage}`,
    });

    // Lambda Function
    const processor = new lambda.Function(this, "ProcessorLambda", {
      functionName: `sqs-to-s3-processor-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "lambda-handler.handler",
      code: lambda.Code.fromAsset("lib"),
      environment: {
        STAGE: props.stage,
      },
    });

    // Grant Lambda permission to write to S3
    bucket.grantWrite(processor);

    // Trigger Lambda from SQS
    processor.addEventSource(new lambdaEvent.SqsEventSource(queue));
  }
}
