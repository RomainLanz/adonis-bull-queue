/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import { BullManager } from '../src/Queue';
import type { ApplicationContract } from '@ioc:Adonis/Core/Application';

export default class QueueProvider {
	private queue: BullManager | null = null;

	constructor(protected app: ApplicationContract) {}

	public register() {
		this.app.container.singleton('Rlanz/Queue', () => {
			const config = this.app.container.resolveBinding('Adonis/Core/Config').get('queue').config;
			const logger = this.app.container.resolveBinding('Adonis/Core/Logger');
			const application = this.app.container.resolveBinding('Adonis/Core/Application');

			const Queue = new BullManager(config, logger, application);
			this.queue = Queue;
			return {
				Queue,
			};
		});
	}

	/**
	 * Gracefully shutdown connections when app goes down.
	 */
	public async shutdown() {
		if (this.queue) {
			await this.queue.closeAll();
		}
	}
}
