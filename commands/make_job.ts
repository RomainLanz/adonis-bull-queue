/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import { BaseCommand, args } from '@adonisjs/core/ace'
import { stubsRoot } from '../stubs/index.js'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class MakeJob extends BaseCommand {
  static commandName = 'make:job'
  static description = 'Make a new dispatch-able job'

  @args.string({ description: 'Name of the job class' })
  name!: string

  static options: CommandOptions = {
    allowUnknownFlags: true,
  }

  #stubPath = 'command/main.stub'

  async run() {
    const codemods = await this.createCodemods()

    await codemods.makeUsingStub(stubsRoot, this.#stubPath, {
      entity: this.app.generators.createEntity(this.name),
    })
  }
}
