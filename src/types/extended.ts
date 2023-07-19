/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import { QueueManager } from '../queue.js'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    'rlanz/queue': QueueManager
  }
}
