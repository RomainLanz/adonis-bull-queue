/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import app from '@adonisjs/core/services/app'
import { QueueManager } from '../src/queue.js'

let queue: QueueManager
let resolvedQueue: QueueManager | undefined

async function ensureQueue(): Promise<QueueManager> {
  if (resolvedQueue) return resolvedQueue
  if (!app) {
    throw new Error('@rlanz/bull-queue: app service is not yet available.')
  }
  const q = await app.container.make('rlanz/queue')
  resolvedQueue = q
  return q
}

const proxyHandler: ProxyHandler<object> = {
  get(_target, prop) {
    if (prop === 'then' || prop === Symbol.toPrimitive) return undefined

    return (...args: any[]) => {
      return ensureQueue().then((q: any) => {
        const val = q[prop]
        return typeof val === 'function' ? val.apply(q, args) : val
      })
    }
  },
}

queue = new Proxy({}, proxyHandler) as QueueManager

export { queue as default }
