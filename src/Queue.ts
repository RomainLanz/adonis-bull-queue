/**
 * @setten/bull-queue
 *
 * @license MIT
 * @copyright Setten - Romain Lanz <romain.lanz@setten.io>
 */

import { Queue, Worker } from 'bullmq';
import type { JobsOptions } from 'bullmq';
import type { LoggerContract } from '@ioc:Adonis/Core/Logger';
import type { ApplicationContract } from '@ioc:Adonis/Core/Application';
import type { DataForJob, JobsList, QueueConfig } from '@ioc:Setten/Queue';

export class BullManager {
	private queues: Map<string, Queue> = new Map();

	constructor(
		private options: QueueConfig,
		private logger: LoggerContract,
		private app: ApplicationContract
	) {
		this.queues.set("default", new Queue('default', {
			connection: this.options.connection,
			...this.options.queue,
		}))
	}

	public dispatch<K extends keyof JobsList | string>(
		job: K,
		payload: DataForJob<K>,
		options: JobsOptions & { queueName?: string } = {},
	) {
		const queueName = options.queueName || 'default';

		if (!this.queues.has(queueName)) {
			this.queues.set(queueName, new Queue(queueName, {
				connection: this.options.connection,
				...this.options.queue,
			}))
		}

		return this.queues.get(queueName)!.add(job, payload, {
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

		worker.on('failed', async(job, error) => {
			if (!job) return

			this.logger.error(`Job ${job.name} failed`);
			this.logger.error(JSON.stringify(error));

			if (job.attemptsMade === job.opts.attempts) {

        // Call the failed method of the handler class if there is one
        let jobHandler = this.app.container.make(job.name, [job]);
				if (typeof jobHandler.failed === 'function') jobHandler.failed()
      }
		})

		return this;
	}
}
