import {
  Stack,
  StackProps,
  Duration,
  aws_ecs as ecs,
  aws_ec2 as ec2,
  aws_elasticloadbalancingv2 as elbv2,
} from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";

export class ExpressFargateCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPC (public + private subnets)
    const vpc = new ec2.Vpc(this, `${id}-vpc`, {
      maxAzs: 2,
    });

    // Cluster
    const cluster = new ecs.Cluster(this, `${id}-cluster`, {
      vpc,
    });

    // Task Definition
    const taskDef = new ecs.FargateTaskDefinition(this, `${id}-task-difinition`, {
      cpu: 256, // 0.25 vCPU
      memoryLimitMiB: 512,
    });

    // Container
    const container = taskDef.addContainer(`${id}-container`, {
      image: ecs.ContainerImage.fromRegistry(
        "141991823339.dkr.ecr.us-east-1.amazonaws.com/express-fargate-cdk:latest"
      ),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: `${id}-container-logs` }),
    });

    container.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    });

    // Fargate Service
    const service = new ecs.FargateService(this, `${id}-service`, {
      cluster,
      taskDefinition: taskDef,
      assignPublicIp: true,
    });

    // Load Balancer
    const lb = new elbv2.ApplicationLoadBalancer(this, `${id}-alb`, {
      vpc,
      internetFacing: true,
    });

    const listener = lb.addListener(`${id}-listener-lb`, {
      port: 80,
      open: true,
    });

    listener.addTargets(`${id}-listener-tg`, {
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [service],
      healthCheck: {
        path: "/",
        healthyThresholdCount: 2,
        interval: Duration.seconds(10),
      },
    });

    // Output URL
    new CfnOutput(this, `${id}-lb-dns`, {
      value: lb.loadBalancerDnsName,
    });
  }
}
