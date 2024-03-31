/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import { Queue, Worker } from 'bullmq'
import type { JobsOptions } from 'bullmq'
import type { ApplicationService, LoggerService } from '@adonisjs/core/types'
import { DataForJob, Job, JobHandlerContract, JobsList, QueueConfig } from './types.js'
import { inject } from '@adonisjs/core'

@inject()
export class BullManager {
  private queues: Map<string, Queue> = new Map()

  constructor(
    private options: QueueConfig,
    private logger: LoggerService,
    private app: ApplicationService
  ) {
    this.queues.set(
      'default',
      new Queue('default', {
        ...this.options.queue,
        // @todo: this was causing a TS error, since this.options.connection contains `connection`, so this would always be overwritten.validate that this doesn't need to be first
        connection: this.options.connection,
      })
    )
  }

  dispatch<K extends keyof JobsList | string>(
    job: K,
    payload: DataForJob<K>,
    options: JobsOptions & { queueName?: string } = {}
  ) {
    const queueName = options.queueName || 'default'

    if (!this.queues.has(queueName)) {
      this.queues.set(
        queueName,
        new Queue(queueName, {
          ...this.options.queue,
          // @todo: this was causing a TS error, since this.options.connection contains `connection`, so this would always be overwritten.validate that this doesn't need to be first
          connection: this.options.connection,
        })
      )
    }

    return this.queues.get(queueName)!.add(job, payload, {
      ...this.options.jobs,
      ...options,
    })
  }

  process({ queueName }: { queueName?: string }) {
    this.logger.info(`Queue [${queueName || 'default'}] processing started...`)

    let worker = new Worker(
      queueName || 'default',
      async (job) => {
        const jobHandler = await this.retrieveJobClass(job)

        if (jobHandler === null) {
          this.logger.error(`Job handler for ${job.name} not found`)
          return
        }

        this.logger.info(`Job ${job.name} started`)
        await jobHandler.handle(job.data)
        this.logger.info(`Job ${job.name} finished`)
      },
      {
        ...this.options.worker,
        // @todo: this was causing a TS error, since this.options.worker contains `connection`, so this would always be overwritten. validate that this doesn't need to be first
        connection: this.options.connection,
      }
    )

    worker.on('failed', async (job, error) => {
      this.logger.error(error.message, [])

      // If removeOnFail is set to true in the job options, job instance may be undefined.
      // This can occur if worker maxStalledCount has been reached and the removeOnFail is set to true.
      if (job && (job.attemptsMade === job.opts.attempts || job.finishedOn)) {
        // Call the failed method of the handler class if there is one
        const jobHandler = await this.retrieveJobClass(job)

        // @todo: fix these typings
        // @ts-ignore
        if (jobHandler !== null && typeof jobHandler.failed === 'function') {
          // @ts-ignore
          await jobHandler.failed()
        }
      }
    })

    return this
  }

  async clear<K extends string>(queueName: K) {
    if (!this.queues.has(queueName)) {
      return this.logger.info(`Queue [${queueName}] doesn't exist`)
    }

    const queue = this.queues.get(queueName || 'default')

    await queue!.obliterate().then(() => {
      return this.logger.info(`Queue [${queueName}] cleared`)
    })
  }

  list() {
    return this.queues
  }

  get<K extends string>(queueName: K) {
    if (!this.queues.has(queueName)) {
      return this.logger.info(`Queue [${queueName}] doesn't exist`)
    }

    return this.queues.get(queueName)
  }

  private async retrieveJobClass(job: Job): Promise<JobHandlerContract | null> {
    try {
      const jobHandlerClass = await this.app.container.make<any>(job.name)
      return new jobHandlerClass(job) as JobHandlerContract
    } catch (e) {
      this.logger.error(`Job handler for ${job.name} not found`)
      return null
    }
  }
}
