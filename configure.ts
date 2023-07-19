/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import type Configure from '@adonisjs/core/commands/configure'

export async function configure(command: Configure) {
  // Publish config file
  await command.publishStub('config/queue.stub')

  // Add environment variables
  await command.defineEnvVariables({
    QUEUE_REDIS_HOST: 'local',
    QUEUE_REDIS_PORT: '127.0.0.1',
    QUEUE_REDIS_PASSWORD: '6379',
  })

  // Add provider to rc file
  await command.updateRcFile((rcFile) => {
    rcFile
      .addProvider('@rlanz/bull-queue/providers/queue_provider')
      .addCommand('@rlanz/bull-queue/commands')
  })
}
