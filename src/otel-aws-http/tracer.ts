import opentelemetry from "@opentelemetry/api";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export const getTracer = () => {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.DD_SERVICE,
    }),
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  registerInstrumentations({
    instrumentations: [
        new ExpressInstrumentation(),
        new HttpInstrumentation(),
    ],
  });

  return opentelemetry.trace.getTracer('http-example');
};

export const getTracerSdk = () => {
    const resource = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: process.env.DD_SERVICE,
    });

    const exporter = new ConsoleSpanExporter();

    const sdk = new NodeSDK({
      traceExporter: exporter,
      resource,
      instrumentations: [
        new AwsInstrumentation({ suppressInternalInstrumentation: true }),
        new ExpressInstrumentation(),
        new HttpInstrumentation(),
      ],
      spanProcessor: new SimpleSpanProcessor(exporter),
    });

    return {
        sdk,
        tracer: opentelemetry.trace.getTracer('http-example-sdk')
    }
}