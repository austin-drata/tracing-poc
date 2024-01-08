import { DefaultLogger, Worker, Runtime, defaultSinks } from '@temporalio/worker';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  OpenTelemetryActivityInboundInterceptor,
  makeWorkflowExporter,
} from '@temporalio/interceptors-opentelemetry/lib/worker';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import * as activities from './activities';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { AWSXRayPropagator } from '@opentelemetry/propagator-aws-xray';

import { config } from 'dotenv';
config({ path: './.env' });

async function main() {
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'temporal-worker',
  });
  // diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  // Export spans to console for simplicity
  // const exporter = new ConsoleSpanExporter();
  const exporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/traces',
    headers: {
      'DD-API-KEY': process.env.DD_API_KEY,
    },
  });

  const spanProcessor = new BatchSpanProcessor(exporter);

  const otel = new NodeSDK({
    traceExporter: exporter,
    resource,
    textMapPropagator: new AWSXRayPropagator(),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {},
        // new HttpInstrumentation(),
        // new ExpressInstrumentation(),
        '@opentelemetry/instrumentation-aws-sdk': {},
        // new AwsInstrumentation({
        //   suppressInternalInstrumentation: true,
        // }),
      }),
    ],

    spanProcessor,
  });
  await otel.start();

  // Silence the Worker logs to better see the span output in this sample
  Runtime.install({ logger: new DefaultLogger('WARN') });

  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'interceptors-opentelemetry-example',
    sinks: {
      ...defaultSinks,
      exporter: makeWorkflowExporter(exporter, resource),
    },
    // Registers opentelemetry interceptors for Workflow and Activity calls
    interceptors: {
      // example contains both workflow and interceptors
      workflowModules: [require.resolve('./workflows')],
      activityInbound: [(ctx) => new OpenTelemetryActivityInboundInterceptor(ctx)],
    },
    // Set to true to get SDK traces too
    enableSDKTracing: false,
  });
  try {
    await worker.run();
  } finally {
    await otel.shutdown();
  }
}

main().then(
  () => void process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
