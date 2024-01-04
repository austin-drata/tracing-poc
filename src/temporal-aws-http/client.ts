import { Connection, Client } from '@temporalio/client';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OpenTelemetryWorkflowClientInterceptor } from '@temporalio/interceptors-opentelemetry';
import { example } from './workflows';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';

import { config } from 'dotenv';
config({ path: './.env' });

async function run() {
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'temporal-client',
  });
  // Export spans to console for simplicity
  // const exporter = new ConsoleSpanExporter();
  const exporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/traces',
    headers: {
      'DD-API-KEY': process.env.DD_API_KEY,
    },
  });

  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const otel = new NodeSDK({
    traceExporter: exporter,
    resource,
    // instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
  });
  await otel.start();
  // Connect to localhost with default ConnectionOptions,
  // pass options to the Connection constructor to configure TLS and other settings.
  const connection = await Connection.connect();
  // Attach the OpenTelemetryClientCallsInterceptor to the client.
  const client = new Client({
    connection,
    interceptors: {
      workflow: [new OpenTelemetryWorkflowClientInterceptor()],
    },
  });
  try {
    const result = await client.workflow.execute(example, {
      taskQueue: 'interceptors-opentelemetry-example',
      workflowId: 'otel-example-0',
      args: ['Temporal'],
    });
    console.log(result); // Hello, Temporal!
  } finally {
    await otel.shutdown();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
