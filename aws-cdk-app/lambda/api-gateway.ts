export class ApiGateway {
    protected event: any;
    constructor(event: any) {
        this.event = event;
    }
    public process() {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Hello From APi Gateway",
            }),
        }
    }
}

