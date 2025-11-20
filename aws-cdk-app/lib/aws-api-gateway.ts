import { Stack, StackProps, CfnOutput, RemovalPolicy, Duration } from "aws-cdk-lib";
import { LambdaIntegration, RestApi, ApiKey, UsagePlan, Period } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "path";

export class ApiGateway extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Log Group
        const logGroup = new LogGroup(this, `${id}-log-group`, {
            retention: RetentionDays.ONE_WEEK,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        // Lambda Function
        const apiFunction = new NodejsFunction(this, `${id}-function`, {
            functionName: `${id}-function`,
            runtime: Runtime.NODEJS_22_X,
            handler: "index.ApiGatewayhandler",
            entry: join(__dirname, "../lambda/index.ts"),
            timeout: Duration.minutes(2),
            logGroup,
        });

        // API Gateway
        const apiGateway = new RestApi(this, `${id}-api-gateway`, {
            restApiName: `${id}-rest-api`,
            description: "api gateway for app aws-cdk-app",
            retainDeployments: false, 
        });

        // Resource /hello
        const helloResource = apiGateway.root.addResource("hello");

        helloResource.addMethod("GET", new LambdaIntegration(apiFunction), {
            apiKeyRequired: true,
        });
        helloResource.addMethod("POST", new LambdaIntegration(apiFunction));
        helloResource.addMethod("PUT", new LambdaIntegration(apiFunction));
        helloResource.addMethod("DELETE", new LambdaIntegration(apiFunction));

        // API Key
        const apiKey = new ApiKey(this, `${id}-api-key`, {
            apiKeyName: "admin",
        });

        // Usage Plan
        const plan = new UsagePlan(this, `${id}-usage-plan`, {
            name: "rate-limit-plan",
            throttle: {
                rateLimit: 10,
                burstLimit: 2,
            },
            quota: {
                limit: 1000,
                period: Period.DAY,
            },
        });

        // Attach API key + stage
        plan.addApiKey(apiKey);
        plan.addApiStage({
            stage: apiGateway.deploymentStage,
        });

        // Outputs
        new CfnOutput(this, `${id}-stack`, {
            value: this.stackName,
        });

        new CfnOutput(this, `${id}-url`, {
            value: apiGateway.url,
            description: "The URL of the API Gateway",
        });
    }
}
