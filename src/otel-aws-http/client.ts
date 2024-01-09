import { getTracerSdk } from "./tracer";
// const tracer = getTracer();
const {sdk, tracer} = getTracerSdk();

import { Span } from "@opentelemetry/api";
import http from 'http';


const makeRequest = async () => {
    await sdk.start();
    await tracer.startActiveSpan('parent-span', async (parentSpan: Span) => {
        const request = http.get('http://localhost:3001', (response: any) => {
            console.log('response');
            console.log(response.statusCode);
        });
        console.log('headers');
        console.log(request.getHeaders())
        parentSpan.end();
    });

    setTimeout(async () => {
        await sdk.shutdown();
        console.log('DONE');
    }, 5000);
};

makeRequest().catch(err => console.log(err));