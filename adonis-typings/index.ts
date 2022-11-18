/**
 * @setten/bull-queue
 *
 * @license MIT
 * @copyright Setten - Romain Lanz <romain.lanz@setten.io>
 */

declare module '@ioc:Setten/Queue' {
	import type { ConnectionOptions, WorkerOptions, QueueOptions, JobsOptions } from 'bullmq';
	import type Config from '@ioc:Adonis/Core/Config';

	export type DataForJob<K extends string> = K extends keyof JobsList
		? JobsList[K]
		: Record<string, unknown>;

	export type DispatchOptions = JobsOptions & {
		queueName?: 'default' | string
	}

	export type QueueConfig = {
		connection: ConnectionOptions;
		queue: QueueOptions;
		worker: WorkerOptions;
		jobs: JobsOptions;
	};

	interface QueueContract {
		dispatch<K extends keyof JobsList>(
			job: K,
			payload: DataForJob<K>,
			options?: DispatchOptions
		): Promise<string>;
		dispatch<K extends string>(
			job: K,
			payload: DataForJob<K>,
			options?: JobsOptions
		): Promise<string>;
		process(): Promise<void>;
	}

	/**
	 * An interface to define typed queues/jobs
	 */
	export interface JobsList {}

	export const Queue: QueueContract;
}
