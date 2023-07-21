/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import { BullManager } from '../src/Queue';
import type { ApplicationContract } from '@ioc:Adonis/Core/Application';

export default class QueueProvider {
	constructor(protected app: ApplicationContract) {}

	public register() {
		this.app.container.singleton('Rlanz/Queue', () => {
			const config = this.app.container.resolveBinding('Adonis/Core/Config').get('queue').config;
			const logger = this.app.container.resolveBinding('Adonis/Core/Logger');
			const application = this.app.container.resolveBinding('Adonis/Core/Application');

			return {
				Queue: new BullManager(config, logger, application),
			};
		});
	}
}
