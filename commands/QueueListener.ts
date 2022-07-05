import { BaseCommand } from '@adonisjs/core/build/standalone';
import { Queue } from '@ioc:Setten/Queue';

export default class QueueListener extends BaseCommand {
	public static commandName = 'queue:listen';
	public static description = '';

	public static settings = {
		loadApp: true,
		stayAlive: true,
	};

	public async run() {
		await Queue.process();
	}
}
