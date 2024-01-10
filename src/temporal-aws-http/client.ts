import { getTracerSdk } from './tracer';
const { sdk, tracer } = getTracerSdk();

import { Client, Connection } from '@temporalio/client';
import { OpenTelemetryWorkflowClientInterceptor } from '@temporalio/interceptors-opentelemetry';
import { example } from './workflows';

import { config } from 'dotenv';
config({ path: './.env' });

async function run() {
  await sdk.start();

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
    console.log(result);
    // Hello, Temporal!
  } finally {
    await sdk.shutdown();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
