/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

import { Job } from '../job.js'
import type { ConnectionOptions, WorkerOptions, QueueOptions, JobsOptions } from 'bullmq'

export type AllowedJobTypes =
  | JobHandlerConstructor
  | (() => Promise<{ default: JobHandlerConstructor }>)

export type QueueConfig = {
  queueNames?: string[]
  connection: ConnectionOptions
  queue: QueueOptions
  worker: WorkerOptions
  jobs: JobsOptions
}

export type InferJobPayload<T extends JobHandlerConstructor> = Parameters<
  InstanceType<T>['handle']
>[0]

export interface JobHandlerConstructor {
  $$filepath: string
  new (...args: any[]): Job
}
