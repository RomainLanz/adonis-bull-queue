/**
 * @setten/bull-queue
 *
 * @license MIT
 * @copyright Setten
 */

import { BaseCommand, args, Exception } from '@adonisjs/core/build/standalone';
import { join } from 'path'

export default class MakeJob extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'make:job'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Make a dispatchable job'

  @args.string()
	public job!: string;

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
		if (!this.job) throw new Exception("Must supply a job name")

    const stub = join(__dirname, '..', '/templates/make_job.txt')
    const path = this.application.resolveNamespaceDirectory('jobs')
    this.generator
        .addFile(this.job, { pattern: 'pascalcase', form: 'singular' })
        .stub(stub)
        .destinationDir(path || 'app/Jobs')
        .useMustache()
        .appRoot(this.application.cliCwd || this.application.appRoot);
    await this.generator.run();
  }
}
