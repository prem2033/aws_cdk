export const handler = async (event: any, context: any) => {
    console.log('invoked API Gateway', { event, context });
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello From APi Gateway",
        }),
    }
}

