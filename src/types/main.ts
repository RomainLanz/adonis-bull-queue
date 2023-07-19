/**
 * @rlanz/bull-queue
 *
 * @license MIT
 * @copyright Romain Lanz <romain.lanz@pm.me>
 */

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

export interface JobHandlerConstructor {
  $$filepath: string
  new (...args: any[]): JobHandler
}

export interface JobHandler {
  handle(payload: any): Promise<void>
  failed(): Promise<void>
}
