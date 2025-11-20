import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";

// Create AWS SDK v3 clients
const s3 = new S3Client({});
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export class AwsCdkS3Dynamo {
  protected event: any;
  constructor(event: any) {
    this.event = event;
  }
  public async process() {
    console.log("Received event:", { event: this.event });

    // Extract data (SQS or Scheduler)
    let record;

    if (this.event.Records && this.event.Records[0].body) {
      record = JSON.parse(this.event.Records[0].body); // From SQS
    } else {
      record = this.event; // From Scheduler
    }

    // Add current timestamp
    record.processedDate = new Date().toISOString();

    // Upload JSON to S3
    const uploadParams = {
      Bucket: process.env.BUCKET_NAME!,
      Key: `event-${Date.now()}.json`,
      Body: JSON.stringify(record),
      ContentType: "application/json",
    };

    const s3Response = await s3.send(new PutObjectCommand(uploadParams));
    console.log("Response from S3:", s3Response);

    // Query DynamoDB for existing email
    const queryResponse = await dynamo.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME!,
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": record.email,
        },
      })
    );

    console.log("DynamoDB Query Response:", queryResponse);

    // If no record exists → insert
    if (!queryResponse.Count || queryResponse.Count === 0) {
      await dynamo.send(
        new PutCommand({
          TableName: process.env.TABLE_NAME!,
          Item: {
            email: record.email,
            name: record.name,
            savedAt: new Date().toISOString(),
          },
        })
      );

      console.log("Record inserted to DynamoDB");
    } else {
      console.log("Record already exists, skipping insert.");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data processed successfully." }),
    };
  }
}

