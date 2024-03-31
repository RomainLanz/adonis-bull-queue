import { configProvider } from '@adonisjs/core'
import type { ConfigProvider } from '@adonisjs/core/types'
import { QueueConfig } from './types.js'

export const defineConfig = (options: QueueConfig): ConfigProvider<QueueConfig> => {
  return configProvider.create(async () => {
    return options
  })
}
