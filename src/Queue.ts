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
import type { QueueConfig } from '@ioc:Setten/Queue';

export class BullManager {
	private queue: Queue;

	constructor(
		private options: QueueConfig,
		private logger: LoggerContract,
		private app: ApplicationContract
	) {
		this.queue = new Queue('default', {
			connection: this.options.connection,
			...this.options.queue,
		});
	}

	public dispatch(job: string, payload: Record<string, unknown>, options: JobsOptions = {}) {
		return this.queue.add(job, payload, {
			...this.options.jobs,
			...options,
		});
	}

	public process() {
		this.logger.info('Queue processing started...');

		new Worker(
			'default',
			async (job) => {
				let jobHandler;
				try {
					jobHandler = this.app.container.make(job.name);
				} catch (e) {
					this.logger.error(`Job handler for ${job.name} not found`);
					return;
				}

				this.logger.info(`Job ${job.name} started`);

				try {
					await jobHandler.handle(job.data);
					this.logger.info(`Job ${job.name} finished`);
				} catch (error) {
					this.logger.error(`Job ${job.name} failed`);
					this.logger.error(JSON.stringify(error));
				}
			},
			{
				connection: this.options.connection,
				...this.options.worker,
			}
		);

		return this;
	}
}
