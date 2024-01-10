import { getTracerSdk } from "./tracer";
const { sdk, tracer } = getTracerSdk();

import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { Span } from "@opentelemetry/api";
import axios from 'axios';


const makeRequest = async () => {
    await sdk.start();
    await tracer.startActiveSpan('parent-span', async (parentSpan: Span) => {
        const response = await axios.get('http://localhost:3001');
        
        console.log('response from express app');
        console.log(response.status);

        const client = new S3Client({
            region: 'us-west-2',
        });
        
        const command = new ListBucketsCommand({});
        const awsResponse = await client.send(command);
        console.log('aws response');
        console.log(awsResponse.$metadata);

        parentSpan.end();
    });

    setTimeout(async () => {
        await sdk.shutdown();
        console.log('DONE');
    }, 5000);
};

makeRequest().catch(err => console.log(err));