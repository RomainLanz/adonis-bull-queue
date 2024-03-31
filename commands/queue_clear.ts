import { BaseCommand, flags } from '@adonisjs/core/ace'
import { configProvider } from '@adonisjs/core'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class QueueClear extends BaseCommand {
  static commandName = 'queue:clear'
  static description = 'Clears a queue of Jobs'

  @flags.array({ alias: 'q', description: 'The queue(s) to clear' })
  queue: string[] = []

  static options: CommandOptions = {
    startApp: true,
    staysAlive: false,
  }

  async run() {
    const { Queue } = await this.app.container.make('Rlanz/Queue')
    const queueConfigProvider = this.app.config.get('queue')
    const config = await configProvider.resolve<any>(this.app, queueConfigProvider)

    if (this.queue.length === 0) this.queue = config.queueNames

    await Promise.all(
      this.queue.map(async (queue) => {
        await Queue.clear(queue)
      })
    )
  }
}
