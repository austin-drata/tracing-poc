import { getTracerSdk } from './tracer';
const {sdk, tracer} = getTracerSdk();

import { Span, trace } from '@opentelemetry/api';
import { config } from 'dotenv';
import express from 'express';
import http from 'http';

config({ path: './.env' });

const app = express();
app.use(express.json());
app.get('/', async (req, res) => {
  const currentSpan = trace.getActiveSpan();
  console.log({ traceId: currentSpan?.spanContext().traceId });

  await tracer.startActiveSpan('express-span', { kind: 1, attributes: { boo: 'yah' }}, async (span: Span) => {
    span.addEvent('handling axios');

    http.get('http://swapi.dev/api/people/1', function (response) {
      // handle success
      console.log('swapi response');
      console.log(response.statusCode);
      })
        span.end();
        res.end('giggity')
      });
      await sdk.shutdown();
  });

app.listen(3001, async () => {
  await sdk.start();
  console.log('running on 3001')
})
