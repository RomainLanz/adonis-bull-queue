/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */
import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { QueueConfig } from '../src/types/main.js'

export default class QueueListener extends BaseCommand {
  static commandName = 'queue:listen'
  static description = 'Listen to one or multiple queues'

  @flags.array({ alias: 'q', description: 'The queue(s) to listen on' })
  queue: string[] = []

  static options: CommandOptions = {
    startApp: true,
    staysAlive: true,
  }

  async run() {
    const config = this.app.config.get<QueueConfig>('queue')
    const queue = await this.app.container.make('rlanz/queue')
    const router = await this.app.container.make('router')
    router.commit()

    if (this.queue.length === 0) {
      this.queue = config.queueNames ?? ['default']
    }

    await Promise.all(
      this.queue.map((queueName) =>
        queue.process({
          queueName,
        })
      )
    )
  }
}
