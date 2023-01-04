/**
 * @setten/bull-queue
 *
 * @license MIT
 * @copyright Setten
 */

import { join } from 'node:path';
import { BaseCommand, args } from '@adonisjs/core/build/standalone';

export default class MakeJob extends BaseCommand {
	public static commandName = 'make:job';
	public static description = 'Make a new dispatch-able job';

	@args.string({ description: 'Name of the job class' })
	public name!: string;

	public static settings = {
		loadApp: true,
		stayAlive: false,
	};

	public async run() {
		const stub = join(__dirname, '..', '/templates/make_job.txt');
		const path = this.application.resolveNamespaceDirectory('jobs');

		this.generator
			.addFile(this.name, { pattern: 'pascalcase', form: 'singular' })
			.stub(stub)
			.destinationDir(path || 'app/Jobs')
			.useMustache()
			.appRoot(this.application.cliCwd || this.application.appRoot)
			.apply({ name: this.name });

		await this.generator.run();
	}
}
