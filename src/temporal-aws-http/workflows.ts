import {
  OpenTelemetryInboundInterceptor,
  OpenTelemetryOutboundInterceptor,
} from '@temporalio/interceptors-opentelemetry/lib/workflow';
import { proxyActivities, WorkflowInterceptorsFactory } from '@temporalio/workflow';
import type * as activities from './activities';

const { greet, greet2 } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

// A workflow that simply calls an activity
export async function example(name: string): Promise<string> {
  await greet(name);
  return await greet2(name);
}

// Export the interceptors
export const interceptors: WorkflowInterceptorsFactory = () => ({
  inbound: [new OpenTelemetryInboundInterceptor()],
  outbound: [new OpenTelemetryOutboundInterceptor()],
});
