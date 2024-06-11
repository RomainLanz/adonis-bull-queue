import { Job as BullMQJob } from 'bullmq'
import type { LoggerService } from '@adonisjs/core/types'

interface InternalToInject {
  job: BullMQJob
  logger: LoggerService
}

export abstract class Job {
  declare logger: LoggerService
  #bullMqJob!: BullMQJob
  #injected = false

  $injectInternal(internals: InternalToInject) {
    if (this.#injected) {
      return
    }

    this.#bullMqJob = internals.job
    this.logger = internals.logger

    this.#injected = true
  }

  getJob(): BullMQJob {
    return this.#bullMqJob
  }

  getId(): string | undefined {
    return this.#bullMqJob.id
  }

  getDelay(): number | undefined {
    return this.#bullMqJob.delay
  }

  getAttempts(): number {
    return this.#bullMqJob.attemptsMade
  }

  getFailedReason(): string | undefined {
    return this.#bullMqJob.failedReason
  }

  abstract handle(payload: unknown): Promise<void>
  abstract rescue(payload: unknown, error: Error): Promise<void>
}
