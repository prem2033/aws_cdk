import { Stack, StackProps, CfnOutput, RemovalPolicy, Duration } from "aws-cdk-lib";
import { LambdaIntegration, RestApi, ApiKey, UsagePlan, Period } from "aws-cdk-lib/aws-apigateway";
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from 'path';


export class ApiGateway extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const logGroup = new LogGroup(this, `${id}-log-group`, {
            retention: RetentionDays.ONE_WEEK,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const apiFunction = new NodejsFunction(this, `${id}-function`, {
            functionName: `${id}-function`,
            runtime: Runtime.NODEJS_22_X,
            handler: 'index.ApiGatewayhandler',
            // code: Code.fromAsset('lambda'),
            entry: join(__dirname, "../lambda/index.ts"),
            timeout: Duration.minutes(2),
            logGroup: logGroup,
        })

        const apiGateway = new RestApi(this, `${id}-api-gateway`, {
            restApiName: `${id}-rest-api`,
            description: 'api gatewy for app aws-cdk-app'
        })

        // create resource
        const helloResource = apiGateway.root.addResource("hello");
        // Add GET method
        helloResource.addMethod("GET", new LambdaIntegration(apiFunction), {
            apiKeyRequired: true,
        });
        helloResource.addMethod("POST", new LambdaIntegration(apiFunction));
        helloResource.addMethod("PUT", new LambdaIntegration(apiFunction));
        helloResource.addMethod("DELETE", new LambdaIntegration(apiFunction));

        // Create API Key
        const apiKey = new ApiKey(this, `${id}-api-key`, {
            apiKeyName: "admin",
        });

        // Usage Plan with Rate Limits
        const plan = new UsagePlan(this, `${id}-usage-plan`, {
            name: "rate-limit-plan",
            throttle: {
                rateLimit: 10,   // requests per second
                burstLimit: 2,   // allowed spike
            },
            quota: {
                limit: 1000,      // total requests allowed
                period: Period.DAY,
            },
        });

        // you need to attach plan to use api key which will passed as x-api-key
        plan.addApiKey(apiKey);
        plan.addApiStage({
            stage: apiGateway.deploymentStage,
        });
        new CfnOutput(this, `${id}-stack`, {
            value: this.stackName,
        });

        // Output the API URL for easy access
        new CfnOutput(this, `${id}-url`, {
            value: apiGateway.url,
            description: 'The URL of the API Gateway',
        });
    }
}