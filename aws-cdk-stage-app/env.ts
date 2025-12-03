export type Stage = "dev" | "prod";

export type Env = Record<
  Stage,
  { account: string; region: string; bucketName: string }
>;

export const environments: Env = {
  dev: {
    account: "141991823339",
    region: "us-east-south-1",
    bucketName: "sqs-to-s3-dev-bucket",
  },
  prod: {
    account: "141991823339",
    region: "ap-east-1",
    bucketName: "sqs-to-s3-prod-bucket",
  },
};
