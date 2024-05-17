/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import { isClass } from '@sindresorhus/is'
import { Queue, QueueOptions, Worker, WorkerOptions } from 'bullmq'
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

    const computedConfig = {
      ...this.#options.queue,
    }

    if (typeof computedConfig.connection === 'undefined') {
      computedConfig.connection = this.#options.defaultConnection
    }

    // Define the default queue
    this.#queues.set('default', new Queue('default', computedConfig as QueueOptions))
  }

  /**
   *
   */
  async #resolveJob(job: AllowedJobTypes): Promise<JobHandlerConstructor> {
    if (isClass(job)) {
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

  #maybeAddQueue(queueName = 'default') {
    const computedConfig = {
      ...this.#options.queue,
    }

    if (typeof computedConfig.connection === 'undefined') {
      computedConfig.connection = this.#options.defaultConnection
    }

    if (!this.#queues.has(queueName)) {
      this.#queues.set(queueName, new Queue(queueName, computedConfig as QueueOptions))
    }

    return this.#queues.get(queueName)!
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
  ) {
    const queueName = options.queueName || 'default'
    const queue = this.#maybeAddQueue(queueName)

    const jobClass = await this.#resolveJob(job)
    const jobPath = this.#getJobPath(jobClass)

    return queue.add(jobPath, payload, {
      ...this.#options.jobs,
      ...options,
    })
  }

  process({ queueName }: { queueName?: string }) {
    this.#logger.info(`Queue [${queueName || 'default'}] processing started...`)

    const computedConfig = {
      ...this.#options.worker,
    }

    if (typeof computedConfig.connection === 'undefined') {
      computedConfig.connection = this.#options.defaultConnection
    }

    let worker = new Worker(
      queueName || 'default',
      async (job) => {
        let jobClassInstance: Job

        try {
          const { default: jobClass } = await import(job.name)
          jobClassInstance = await this.#app.container.make(jobClass)
          jobClassInstance.$setBullMQJob(job)
        } catch (e) {
          this.#logger.error(`Job ${job.name} was not able to be created`)
          this.#logger.error(e)
          return
        }

        this.#logger.info(`Job ${job.name} started`)
        await jobClassInstance.handle(job.data)
        this.#logger.info(`Job ${job.name} finished`)
      },
      computedConfig as WorkerOptions
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

        await jobClassInstance.rescue(job.data)
      }
    })

    return this
  }

  get(queueName = 'default') {
    return this.#queues.get(queueName)
  }

  getOrSet(queueName = 'default') {
    return this.#maybeAddQueue(queueName)
  }

  async clear(queueName = 'default') {
    const queue = this.#queues.get(queueName)

    if (!queue) {
      return this.#logger.error(`Queue [${queueName}] not found`)
    }

    await queue.obliterate()

    return this.#logger.info(`Queue [${queueName}] cleared`)
  }

  async closeAll() {
    for (const [queueName, queue] of this.#queues.entries()) {
      await queue.close()
      this.#queues.delete(queueName)
    }
  }
}
