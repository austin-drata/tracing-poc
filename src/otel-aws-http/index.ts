import { getTracer } from './tracer';
const tracer = getTracer();

import { Span, trace } from '@opentelemetry/api';
import { config } from 'dotenv';
import express from 'express';
import http from 'http';

config({ path: './.env' });
// const resource = new Resource({
//   [SemanticResourceAttributes.SERVICE_NAME]: process.env.DD_SERVICE,
// });

// // const exporter = new OTLPTraceExporter({
// //   url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/traces',
// //   headers: {
// //     'DD-API-KEY': process.env.DD_API_KEY,
// //   },
// // });

// const exporter = new ConsoleSpanExporter();

// // const otel = new NodeSDK({
// //   traceExporter: exporter,
// //   resource,
// //   instrumentations: [
// //     new HttpInstrumentation(),
// //     new AwsInstrumentation(),
// //   ],
// //   spanProcessor: new BatchSpanProcessor(exporter),
// // });

// const provider = new NodeTracerProvider();

// provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
// provider.register();

// registerInstrumentations({
//   instrumentations: [new HttpInstrumentation()],
// });

// const tracer = trace.getTracer('example-tracer');



const app = express();
app.use(express.json());
app.get('/', async (req, res) => {
  const currentSpan = trace.getActiveSpan();
  console.log({ traceId: currentSpan?.spanContext().traceId });

  tracer.startActiveSpan('express-span', { kind: 1, attributes: { boo: 'yah' }}, (span: Span) => {
    span.addEvent('handling axios');

    http.get('http://swapi.dev/api/people/1', function (response) {
      // handle success
      console.log('swapi response');
      console.log(response.statusCode);
      })
        span.end();
        res.end('giggity')
      });

  });

// async function main() {
//   // await otel.start();

//   const rootSpan = tracer.startSpan('root-span');

//   rootSpan.addEvent('httpCall');
//   await axios
//     .get('https://swapi.dev/api/people/1')
//     .then(function (response) {
//       // handle success
//       console.log('swapi response');
//     })
//     .catch(function (error) {
//       // handle error
//       console.log(error);
//     })
//     .finally(function () {
//       // always executed
//     });

//   rootSpan.addEvent('awsCall');
//   await awsCall();

//   rootSpan.end();  

//   // await otel.shutdown();
// }

// const sleepTime = 1000;

// async function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// function httpCall() {
//   https.get('https://swapi.dev/api/people/1', (response) => {
//     console.log('swapi');
//     // console.log(response);
//   });
// }

// async function awsCall() {
//   const client = new S3Client({
//     region: 'us-west-2',
//   });
//   const command = new ListBucketsCommand({});
//   const res = await client.send(command);
//   console.log('aws response');
//   // console.log(res);
// }

// function axiosCall() {
//   axios
//     .get('https://swapi.dev/api/people/1')
//     .then(function (response) {
//       // handle success
//       // console.log(response);
//     })
//     .catch(function (error) {
//       // handle error
//       console.log(error);
//     })
//     .finally(function () {
//       // always executed
//     });
// }

// main().catch((err) => console.log(err));

app.listen(3001, () => {

  console.log('running on 3001')
})
