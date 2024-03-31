/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import { BaseCommand, args } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { stubsRoot } from '../stubs/main.js'
import { normalizeJobName } from '../src/normalize_job_name.js'

export default class MakeJob extends BaseCommand {
  static commandName = 'make:job'
  static description = 'Make a new dispatch-able job'

  @args.string({ description: 'Name of the job class' })
  declare name: string

  static options: CommandOptions = {
    startApp: true,
    staysAlive: false,
  }

  async run() {
    const codemods = await this.createCodemods()
    await codemods.makeUsingStub(stubsRoot, 'make_job.stub', normalizeJobName(this.name))
  }
}
