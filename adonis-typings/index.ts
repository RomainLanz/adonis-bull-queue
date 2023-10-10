/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

declare module '@ioc:Rlanz/Queue' {
	import type {
		ConnectionOptions,
		WorkerOptions,
		QueueOptions,
		Queue as BullQueue,
		JobsOptions,
		Job,
	} from 'bullmq';

	export type DataForJob<K extends string> = K extends keyof JobsList
		? JobsList[K]
		: Record<string, unknown>;

	export type DispatchOptions = JobsOptions & {
		queueName?: 'default' | string;
	};

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
		): Promise<Job>;
		dispatch<K extends string>(
			job: K,
			payload: DataForJob<K>,
			options?: DispatchOptions
		): Promise<Job>;
		process(): Promise<void>;
		clear<K extends string>(queue: K): Promise<void>;
		list(): Promise<Map<string, BullQueue>>;
		get(): Promise<BullQueue>;
    getQueue(queueName?: 'default' | string): BullQueue;
	}

	export interface JobHandlerContract {
		handle(payload: any): Promise<void>;
		failed(): Promise<void>;
	}

	/**
	 * An interface to define typed queues/jobs
	 */
	export interface JobsList {}

	export const Queue: QueueContract;

	export { Job };
}
