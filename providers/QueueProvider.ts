/**
 * @setten/bull-queue
 *
 * @license MIT
 * @copyright Setten - Romain Lanz <romain.lanz@setten.io>
 */

import { BullManager } from '../src/Queue';
import type { ApplicationContract } from '@ioc:Adonis/Core/Application';

export default class QueueProvider {
	constructor(protected app: ApplicationContract) {}

	public boot() {
		this.app.container.bind('Setten/Queue', () => {
			const config = this.app.container.resolveBinding('Adonis/Core/Config').get('queue');
			const logger = this.app.container.resolveBinding('Adonis/Core/Logger');
			const application = this.app.container.resolveBinding('Adonis/Core/Application');

			return {
				Queue: new BullManager(config, logger, application),
			};
		});
	}
}
