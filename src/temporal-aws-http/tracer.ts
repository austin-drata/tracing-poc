import opentelemetry from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import { config } from 'dotenv';
config({ path: './.env' });

export const getTracerSdk = () => {
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.DD_SERVICE,
  });

  // const exporter = new ConsoleSpanExporter();
  const exporter = new OTLPTraceExporter({});

  const sdk = new NodeSDK({
    traceExporter: exporter,
    resource,
    instrumentations: [new AwsInstrumentation({ suppressInternalInstrumentation: true }), new HttpInstrumentation()],
    spanProcessor: new BatchSpanProcessor(exporter),
  });

  return {
    sdk,
    tracer: opentelemetry.trace.getTracer('http-example-sdk'),
    exporter,
    resource,
  };
};
