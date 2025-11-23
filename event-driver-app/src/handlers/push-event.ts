import { SQSHandler } from "aws-lambda";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";

const eb = new EventBridgeClient({});
const BUS_NAME = process.env.EVENT_BUS_NAME!;

export const handler: SQSHandler = async (event: any) => {
    const entries = [];
    console.log('Event Recevied from SQS', JSON.stringify(event))

    for (const record of event.Records) {
        const body = JSON.parse(record.body);

        entries.push({
            DetailType: 'user.crud',
            Source: 'event-driven',
            EventBusName: BUS_NAME,
            Detail: JSON.stringify(body.data ?? body)
        });
    }
    console.log('event to be pusblished', JSON.stringify(entries))

    // while (entries.length > 0) {
    // const chunk = entries.splice(0, 10);
    const response= await eb.send(new PutEventsCommand({ Entries: entries }));
    // }
    console.log('Published to event Bus', JSON.stringify(response));
};
