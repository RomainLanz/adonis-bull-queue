import { Job as BullMQJob } from 'bullmq'

export abstract class Job {
  #bullMqJob!: BullMQJob

  $setBullMQJob(job: BullMQJob) {
    this.#bullMqJob = job
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
  abstract rescue(payload: unknown): Promise<void>
}
