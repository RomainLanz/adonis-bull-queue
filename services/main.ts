/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import app from '@adonisjs/core/services/app'
import { QueueManager } from '../src/queue.js'

let queue: QueueManager

await app.booted(async () => {
  queue = await app.container.make('rlanz/queue')
})

export { queue as default }
