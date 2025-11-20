import { ApiGateway } from "./api-gateway";
import { AwsCdkS3Dynamo } from "./aws-cdk-s3-dynamo";

export const handler = async (event: any, context: any) => {
    console.log('invoked');
    console.log(event, context)
}



export const ApiGatewayhandler = async (event: any, context: any) => {
    console.log('invoked API Gateway', { event, context });
    const apiGateway = new ApiGateway(event);
    return apiGateway.process();
}



export const AwsCdkS3DynamoHandler = async (event: any, context: any) => {
    console.log('invoked API Gateway', { event, context });
    const awsCdkS3Dynamo = new AwsCdkS3Dynamo(event);
    return await awsCdkS3Dynamo.process();
}