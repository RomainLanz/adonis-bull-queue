import Env from '@ioc:Adonis/Core/Env'
import type { QueueConfig } from '@ioc:Setten/Queue'

const queueConfig: QueueConfig = {
  connection: {
    host: Env.get('QUEUE_REDIS_HOST'),
    port: Env.get('QUEUE_REDIS_PORT'),
    password: Env.get('QUEUE_REDIS_PASSWORD'),
  },

  queue: {},

  worker: {},

  jobs: {
    attempts: 3,
    removeOnComplete: 100,
    removeOnFail: 100
  }
}

const queueNames:['default'] = ['default']

export { queueConfig as config, queueNames}
