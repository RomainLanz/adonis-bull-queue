import { fileURLToPath } from 'node:url'
import { Job } from './src/job.js'

export default class MyJob extends Job {
  static get $$filepath() {
    return fileURLToPath(import.meta.url)
  }

  async handle(payload: { foo: string }) {
    console.log(payload.foo)
  }

  async failed() {
    console.log('failed')
  }
}
