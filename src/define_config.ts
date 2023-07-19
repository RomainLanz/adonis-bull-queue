/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import { InvalidArgumentsException } from '@poppinss/utils'
import type { QueueConfig } from './types/main.js'

export function defineConfig<T extends QueueConfig>(config: T): T {
  if (!config) {
    throw new InvalidArgumentsException('Invalid config. It must be a valid object')
  }

  if (!config.connection) {
    throw new InvalidArgumentsException('Invalid config. Missing property "connection" inside it')
  }

  return config
}
