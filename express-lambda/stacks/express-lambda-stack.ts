import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as node from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { join } from "path";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";

export class ExpressLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);

    const logGroup = new LogGroup(this, `${id}-log-group`,{
      retention : RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY
    });
    
    const expressLambda = new node.NodejsFunction(this, `${id}-function`, {
      functionName: `${id}-labda`,
      handler: "index.handler",
      entry: join(__dirname, "../lambda/index.ts"),
      runtime: lambda.Runtime.NODEJS_22_X,
      logGroup
    });

    new apigw.LambdaRestApi(this, `${id}-api`, {
      handler: expressLambda,
      proxy: true
    });
  }
}
