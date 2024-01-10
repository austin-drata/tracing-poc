import { getTracerSdk } from './tracer';
const { sdk, tracer, exporter, resource } = getTracerSdk();

import {
  OpenTelemetryActivityInboundInterceptor,
  makeWorkflowExporter,
} from '@temporalio/interceptors-opentelemetry/lib/worker';
import { DefaultLogger, Runtime, Worker, defaultSinks } from '@temporalio/worker';
import * as activities from './activities';

import { config } from 'dotenv';
config({ path: './.env' });

async function main() {
  await sdk.start();
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
    await sdk.shutdown();
  }
}

main().then(
  () => void process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
