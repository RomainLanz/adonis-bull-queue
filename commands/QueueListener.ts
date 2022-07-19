/**
 * @setten/bull-queue
 *
 * @license MIT
 * @copyright Setten - Romain Lanz <romain.lanz@setten.io>
 */

import { BaseCommand, flags } from '@adonisjs/core/build/standalone';

export default class QueueListener extends BaseCommand {
	public static commandName = 'queue:listen';
	public static description = '';

	@flags.string({ alias: 'q', description: 'The queue to listen on' })
	public queue: string = 'default';

	public static settings = {
		loadApp: true,
		stayAlive: true,
	};

	public async run() {
		const { Queue } = this.application.container.resolveBinding('Setten/Queue');

		await Queue.process({
			queueName: this.queue,
		});
	}
}
