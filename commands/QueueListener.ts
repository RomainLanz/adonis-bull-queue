/**
 * @setten/bull-queue
 *
 * @license MIT
 * @copyright Setten - Romain Lanz <romain.lanz@setten.io>
 */

import { BaseCommand } from '@adonisjs/core/build/standalone';

export default class QueueListener extends BaseCommand {
	public static commandName = 'queue:listen';
	public static description = '';

	public static settings = {
		loadApp: true,
		stayAlive: true,
	};

	public async run() {
		const Queue = this.application.container.resolveBinding('Setten/Queue');

		await Queue.process();
	}
}
