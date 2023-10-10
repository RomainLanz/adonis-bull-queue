/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import { Queue, Worker } from 'bullmq';
import type { JobsOptions } from 'bullmq';
import type { LoggerContract } from '@ioc:Adonis/Core/Logger';
import type { ApplicationContract } from '@ioc:Adonis/Core/Application';
import type { DataForJob, JobsList, QueueConfig } from '@ioc:Rlanz/Queue';

export class BullManager {
	private queues: Map<string, Queue> = new Map();

	private maybeAddQueue(queueName: 'default' | string): Queue {
		if (!this.queues.has(queueName)) {
			this.queues.set(
				queueName,
				new Queue(queueName, {
					connection: this.options.connection,
					...this.options.queue,
				})
			);
		}
		return this.queues.get(queueName) as Queue;
	}

	constructor(
		private options: QueueConfig,
		private logger: LoggerContract,
		private app: ApplicationContract
	) {
		this.maybeAddQueue('default');
	}

	public getQueue(queueName?: 'default' | string): Queue {
		return this.maybeAddQueue(queueName || 'default');
	}

	public dispatch<K extends keyof JobsList | string>(
		job: K,
		payload: DataForJob<K>,
		options: JobsOptions & { queueName?: string } = {}
	) {
		const queueName = options.queueName || 'default';

		const queue = this.maybeAddQueue(queueName);
		return queue.add(job, payload, {
			...this.options.jobs,
			...options,
		});
	}

	public process({ queueName }: { queueName?: string }) {
		this.logger.info(`Queue [${queueName || 'default'}] processing started...`);

		let worker = new Worker(
			queueName || 'default',
			async (job) => {
				let jobHandler;

				try {
					jobHandler = this.app.container.make(job.name, [job]);
				} catch (e) {
					this.logger.error(`Job handler for ${job.name} not found`);
					return;
				}

				this.logger.info(`Job ${job.name} started`);

				await jobHandler.handle(job.data);
				this.logger.info(`Job ${job.name} finished`);
			},
			{
				connection: this.options.connection,
				...this.options.worker,
			}
		);

		worker.on('failed', async (job, error) => {
			this.logger.error(error.message, []);

			// If removeOnFail is set to true in the job options, job instance may be undefined.
			// This can occur if worker maxStalledCount has been reached and the removeOnFail is set to true.
			if (job && (job.attemptsMade === job.opts.attempts || job.finishedOn)) {
				// Call the failed method of the handler class if there is one
				let jobHandler = this.app.container.make(job.name, [job]);
				if (typeof jobHandler.failed === 'function') await jobHandler.failed();
			}
		});

		return this;
	}

	public async clear<K extends string>(queueName: K) {
		if (!this.queues.has(queueName)) {
			return this.logger.info(`Queue [${queueName}] doesn't exist`);
		}

		const queue = this.queues.get(queueName || 'default');

		await queue!.obliterate().then(() => {
			return this.logger.info(`Queue [${queueName}] cleared`);
		});
	}

	public list() {
		return this.queues;
	}

	public get<K extends string>(queueName: K) {
		if (!this.queues.has(queueName)) {
			return this.logger.info(`Queue [${queueName}] doesn't exist`);
		}

		return this.queues.get(queueName);
	}
}


