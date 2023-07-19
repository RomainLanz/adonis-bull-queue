/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import is from '@sindresorhus/is'
import { Queue, Worker } from 'bullmq'
import { RuntimeException } from '@poppinss/utils'
import { Job } from './job.js'
import type { JobsOptions } from 'bullmq'
import type { ApplicationService, LoggerService } from '@adonisjs/core/types'
import type {
  AllowedJobTypes,
  InferJobPayload,
  JobHandlerConstructor,
  QueueConfig,
} from './types/main.js'

export class QueueManager {
  #app: ApplicationService
  #logger: LoggerService
  #options: QueueConfig

  #queues: Map<string, Queue> = new Map()

  constructor(options: QueueConfig, logger: LoggerService, app: ApplicationService) {
    this.#options = options
    this.#logger = logger
    this.#app = app

    // Define the default queue
    this.#queues.set(
      'default',
      new Queue('default', {
        connection: this.#options.connection,
        ...this.#options.queue,
      })
    )
  }

  /**
   *
   */
  async #resolveJob(job: AllowedJobTypes): Promise<JobHandlerConstructor> {
    if (is.class_(job)) {
      return job
    }

    const jobClass = await job()
    return jobClass['default']
  }

  #getJobPath(job: JobHandlerConstructor): string {
    if (!job['$$filepath'] || typeof job['$$filepath'] !== 'string') {
      throw new RuntimeException('Job handler is missing the $$filepath property')
    }

    return job['$$filepath']
  }

  async dispatch<Job extends AllowedJobTypes>(
    job: Job,
    payload: Job extends JobHandlerConstructor
      ? InferJobPayload<Job>
      : Job extends Promise<infer A>
      ? A extends { default: JobHandlerConstructor }
        ? InferJobPayload<A['default']>
        : never
      : never,
    options: JobsOptions & { queueName?: string } = {}
  ): Promise<void> {
    const queueName = options.queueName || 'default'

    if (!this.#queues.has(queueName)) {
      this.#queues.set(
        queueName,
        new Queue(queueName, {
          connection: this.#options.connection,
          ...this.#options.queue,
        })
      )
    }

    const jobClass = await this.#resolveJob(job)
    const jobPath = this.#getJobPath(jobClass)

    await this.#queues.get(queueName)!.add(jobPath, payload, {
      ...this.#options.jobs,
      ...options,
    })
  }

  process({ queueName }: { queueName?: string }) {
    this.#logger.info(`Queue [${queueName || 'default'}] processing started...`)

    let worker = new Worker(
      queueName || 'default',
      async (job) => {
        let jobClassInstance: Job

        try {
          const { default: jobClass } = await import(job.name)
          jobClassInstance = await this.#app.container.make(jobClass)
          jobClassInstance.$setBullMQJob(job)
        } catch (e) {
          this.#logger.error(`Job handler for ${job.name} not found`)
          return
        }

        this.#logger.info(`Job ${job.name} started`)
        await jobClassInstance.handle(job.data)
        this.#logger.info(`Job ${job.name} finished`)
      },
      {
        connection: this.#options.connection,
        ...this.#options.worker,
      }
    )

    worker.on('failed', async (job, error) => {
      this.#logger.error(error.message, [])

      // If removeOnFail is set to true in the job options, job instance may be undefined.
      // This can occur if worker maxStalledCount has been reached and the removeOnFail is set to true.
      if (job && (job.attemptsMade === job.opts.attempts || job.finishedOn)) {
        // Call the failed method of the handler class if there is one
        const { default: jobClass } = await import(job.name)
        const jobClassInstance = (await this.#app.container.make(jobClass)) as Job

        jobClassInstance.$setBullMQJob(job)

        await jobClassInstance.failed()
      }
    })

    return this
  }
}
