import { Span, context, trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import http from 'http';
import https from 'https';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { config } from 'dotenv';
import axios from 'axios';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';

config({ path: './.env' });
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.DD_SERVICE,
});

// const exporter = new OTLPTraceExporter({
//   url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/traces',
//   headers: {
//     'DD-API-KEY': process.env.DD_API_KEY,
//   },
// });

const exporter = new ConsoleSpanExporter();

// const provider = new NodeTracerProvider({
//   resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: 'fruits' })
// });

// registerInstrumentations({
//   instrumentations: [
//     // Currently to be able to have auto-instrumentation for express
//     // We need the auto-instrumentation for HTTP.
//     new HttpInstrumentation(),
//     new ExpressInstrumentation(),
//     new PgInstrumentation()
//   ]
// });
// provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
// provider.register();

const otel = new NodeSDK({
  traceExporter: exporter,
  resource,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new AwsInstrumentation({
      suppressInternalInstrumentation: true,
    }),
  ],
  spanProcessor: new BatchSpanProcessor(exporter),
});

async function main() {
  await otel.start();
  const tracer = trace.getTracer('example-tracer');

  // const rootSpan = tracer.startSpan('root-span');
  await sleep(5000);

  // await tracer.startActiveSpan('parent-span', async (parentSpan: Span) => {
  // console.log('context with parent span')
  // console.log(context.active())

  await sleep(sleepTime);

  // axiosCall();

  // await tracer.startActiveSpan('child-span', async childSpan => {
  httpCall();
  // console.log('childSpan')
  // // console.log(childSpan);
  // console.log('context after child span')
  // console.log(context.active())
  await sleep(sleepTime);
  //   childSpan.end()
  // })

  // parentSpan.end()
  // });

  const respon = await awsCall();
  console.log(respon);

  // const ctxWithRootSpan = trace.setSpan(context.active(), rootSpan);
  // const childSpan = tracer.startSpan('child-span', {}, ctxWithRootSpan);

  await sleep(5000);

  // childSpan.end();
  // rootSpan.end();

  await otel.shutdown();
}

const sleepTime = 1000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpCall() {
  https.get('https://swapi.dev/api/people/1', (response) => {
    console.log(response);
  });
}

async function awsCall() {
  const client = new S3Client({
    region: 'us-west-2',
  });
  const command = new ListBucketsCommand({});
  const res = await client.send(command);
  console.log('aws response');
  console.log(res);
}

function axiosCall() {
  axios
    .get('https://swapi.dev/api/people/1')
    .then(function (response) {
      // handle success
      // console.log(response);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .finally(function () {
      // always executed
    });
}

main().catch((err) => console.log(err));
