import { getTracerSdk } from './tracer';
const { sdk, tracer } = getTracerSdk();

import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { Span, trace } from '@opentelemetry/api';
import axios from 'axios';
import { config } from 'dotenv';
import express from 'express';

config({ path: './.env' });

const app = express();
app.use(express.json());
app.get('/', async (req, res) => {
  const currentSpan = trace.getActiveSpan();
  console.log({ traceId: currentSpan?.spanContext().traceId });

  await tracer.startActiveSpan('express-span', { kind: 1, attributes: { boo: 'yah' }}, async (span: Span) => {
    span.addEvent('handling axios');

    const response = await axios.get('http://swapi.dev/api/people/1');

    console.log('swapi response');
    console.log(response.status);

    const client = new S3Client({
      region: 'us-west-2',
    });
  
    const command = new ListBucketsCommand({});
    const awsResponse = await client.send(command);
    console.log('aws response server');
    console.log(awsResponse.$metadata);
    span.end();
    res.end('giggity')
  });  
});

process.on('SIGTERM', async () => {
  await sdk.shutdown();
})

app.listen(3001, async () => {
  await sdk.start();
  console.log('running on 3001')
})
