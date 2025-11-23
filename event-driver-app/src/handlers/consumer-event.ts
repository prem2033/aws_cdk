import { SQSHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const ddb = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler: SQSHandler = async (event) => {
    for (const record of event.Records) {
        const msg = JSON.parse(record.body);
        const payload = msg.detail ?? msg;

        const email = payload.email ?? payload.data?.email;
        if (!email) continue;

        const item = {
            email,
            name: payload.name ?? payload.data?.name ?? null,
            createdDate: payload.createdDate ?? new Date().toISOString()
        };

        await ddb.send(
            new PutItemCommand({
                TableName: TABLE_NAME,
                Item: marshall(item),
                ConditionExpression: "attribute_not_exists(email)"
            })
        );
    }
};
