import { BaseCommand, flags } from '@adonisjs/core/build/standalone';

export default class QueueListener extends BaseCommand {
	public static commandName = 'queue:clear';
	public static description = 'Clears a queue of Jobs';

	@flags.array({ alias: 'q', description: 'The queue(s) to clear' })
	public queue: string[] = [];

	public static settings = {
		loadApp: true,
		stayAlive: false,
	};

	public async run() {
		const { Queue } = this.application.container.resolveBinding('Rlanz/Queue');
		const Config = this.application.container.resolveBinding('Adonis/Core/Config');

		if (this.queue.length === 0) this.queue = Config.get('queue').queueNames;

		await Promise.all(
			this.queue.map(async (queue) => {
				await Queue.clear(queue);
			})
		);
	}
}
