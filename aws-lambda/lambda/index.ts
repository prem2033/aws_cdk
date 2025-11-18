import AWS from 'aws-sdk';
const s3 = new AWS.S3();

export const handler = async (event: { Records: any; }) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const bucket = 'test-infom-prem2033';
    const results = [];

    // SQS messages arrive inside event.Records
    for (const record of event.Records) {
        try {
            const bodyString = record.body;
            console.log('Raw message body:', bodyString);

            // Try to parse JSON
            let payload;
            try {
                payload = JSON.parse(bodyString);
            } catch (e) {
                // Body was not JSON → wrap it
                payload = { raw: bodyString };
            }

            // Expected fields
            const fname = payload.fname || 'unknown';
            const llname = payload.llname || payload.lname || 'unknown';
            const age = payload.age || null;

            // S3 key
            const key = `messages/${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}.json`;

            const s3Obj = {
                Bucket: bucket,
                Key: key,
                Body: JSON.stringify({
                    receivedAt: new Date().toISOString(),
                    payload
                }),
                ContentType: 'application/json'
            };

            await s3.putObject(s3Obj).promise();

            const info = { key, fname, llname, age };
            console.log('Saved message to S3:', info);

            results.push({ status: 'success', info });

        } catch (err: any) {
            console.error('Error processing record:', err);

            results.push({
                status: 'error',
                error: err.message || err.toString()
            });

            // Do NOT rethrow so Lambda continues processing other messages
            // SQS will retry batch or DLQ if retries exceed limit
        }
    }

    console.log('Lambda processing results:', JSON.stringify(results, null, 2));

    // Return is ignored for SQS-triggered Lambdas
    return {
        processed: results.length,
        results
    };
};
