import { getTracerSdk } from "./tracer";
const { sdk, tracer } = getTracerSdk();

import { Span } from "@opentelemetry/api";
import axios from 'axios';


const makeRequest = async () => {
    await sdk.start();
    await tracer.startActiveSpan('parent-span', async (parentSpan: Span) => {
        const response = await axios.get('http://localhost:3001');
        
        console.log('response from express app');
        console.log(response.status);

        parentSpan.end();
    });

    setTimeout(async () => {
        await sdk.shutdown();
        console.log('DONE');
    }, 5000);
};

makeRequest().catch(err => console.log(err));