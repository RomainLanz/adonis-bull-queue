/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import { configProvider } from '@adonisjs/core'
import type { ApplicationService } from '@adonisjs/core/types'
import { BullManager } from '../src/queue.js'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    'Rlanz/Queue': {
      Queue: BullManager
    }
  }
}

export default class QueueProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('Rlanz/Queue', async (resolver) => {
      const queueConfigProvider = this.app.config.get('queue')
      const config = await configProvider.resolve<any>(this.app, queueConfigProvider)
      const logger = await resolver.make('logger')
      const application = await resolver.make('app')

      return {
        Queue: new BullManager(config, logger, application),
      }
    })
  }
}
