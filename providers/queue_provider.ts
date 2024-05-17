/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import type { ApplicationService } from '@adonisjs/core/types'
import type { QueueConfig } from '../src/types/main.js'
import type { QueueManager } from '../src/queue.js'

export default class QueueProvider {
  #queue: QueueManager | null = null

  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('rlanz/queue', async () => {
      const { QueueManager } = await import('../src/queue.js')

      const config = this.app.config.get<QueueConfig>('queue')
      const logger = await this.app.container.make('logger')

      this.#queue = new QueueManager(config, logger, this.app)

      return this.#queue
    })
  }

  async shutdown() {
    if (this.#queue) {
      await this.#queue.closeAll()
    }
  }
}
