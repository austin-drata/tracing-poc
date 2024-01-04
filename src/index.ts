import { context, trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { config } from 'dotenv';

config({ path: './.env' });

const otel = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/traces',
    headers: {
      'DD-API-KEY': process.env.DD_API_KEY,
    },
  }),
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.DD_SERVICE,
  }),
});

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    await otel.start();
    const tracer = trace.getTracer('example-tracer');

    const rootSpan = tracer.startSpan('root-span');
    await sleep(5000);

    const ctxWithRootSpan = trace.setSpan(context.active(), rootSpan);
    const childSpan = tracer.startSpan('child-span', {}, ctxWithRootSpan);
    await sleep(5000);

    childSpan.end();
    rootSpan.end();

    await otel.shutdown();
}

main().catch(err => console.log(err));