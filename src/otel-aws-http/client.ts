import { getTracer } from "./tracer";
const tracer = getTracer();

import { Span } from "@opentelemetry/api";
import http from 'http';


const makeRequest = () => {
    tracer.startActiveSpan('parent-span', (parentSpan: Span) => {
        const request = http.get('http://localhost:3001', (response: any) => {
            console.log('response');
            console.log(response.statusCode);
        });
        console.log('headers');
        console.log(request.getHeaders())
        parentSpan.end();
    });

    setTimeout(() => console.log('DONE'), 5000);
};

makeRequest();