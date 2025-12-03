import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Env, environments, Stage } from "../env";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const s3 = new S3Client({});
const secretsClient = new SecretsManagerClient();
const stageName = process.env.STAGE! as Stage;

async function getSecretValue(secretName: string): Promise<string | null> {
  if (!secretName) return null;

  const resp = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );

  return resp.SecretString ?? null;
}

exports.handler = async (event: any) => {
  console.log("Received event:", JSON.stringify(event));

  const props = environments[stageName];

  console.log(`Ruuning at [${stageName}]`);
  for (const record of event.Records) {
    const body = record.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${timestamp}.json`;

    const response = await s3.send(
      new PutObjectCommand({
        Bucket: props.bucketName,
        Key: fileName,
        Body: body,
        ContentType: "application/json",
      })
    );

    console.log(`Saved message to S3: ${fileName}`, { response });
  }

  return { status: "done" };
};
