/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import { stubsRoot } from './stubs/index.js'
import type Configure from '@adonisjs/core/commands/configure'

export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  // Publish config file
  await codemods.makeUsingStub(stubsRoot, 'config/queue.stub', {})

  // Add environment variables
  await codemods.defineEnvVariables({
    QUEUE_REDIS_HOST: '127.0.0.1',
    QUEUE_REDIS_PORT: '6379',
    QUEUE_REDIS_PASSWORD: '',
  })

  // Add provider to rc file
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@rlanz/bull-queue/queue_provider').addCommand('@rlanz/bull-queue/commands')
  })
}
