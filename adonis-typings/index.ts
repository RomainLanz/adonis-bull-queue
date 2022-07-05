/**
 * @setten/bull-queue
 *
 * @license MIT
 * @copyright Setten - Romain Lanz <romain.lanz@setten.io>
 */

declare module '@ioc:Setten/Queue' {
	import type { ConnectionOptions, WorkerOptions, QueueOptions, JobsOptions } from 'bullmq';

	export type QueueConfig = {
		connection: ConnectionOptions;
		queue: QueueOptions;
		worker: WorkerOptions;
		jobs: JobsOptions;
	};

	interface QueueContract {
		dispatch(job: string, payload: Record<string, unknown>, options: JobsOptions): Promise<string>;
		process(): Promise<void>;
	}

	export const Queue: QueueContract;
}
