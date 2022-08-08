<p align="center">
  <img src="https://user-images.githubusercontent.com/2793951/179391203-e56db661-cc73-4932-aa77-b63be650c131.png" alt="@setten/bull-queue">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@setten/bull-queue"><img src="https://img.shields.io/npm/dm/@setten/bull-queue.svg?style=flat-square" alt="Download"></a>
  <a href="https://www.npmjs.com/package/@setten/bull-queue"><img src="https://img.shields.io/npm/v/@setten/bull-queue.svg?style=flat-square" alt="Version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/npm/l/@setten/bull-queue.svg?style=flat-square" alt="License"></a>
</p>

`@setten/bull-queue` is a queue system based on [BullMQ](https://github.com/taskforcesh/bullmq)
for [AdonisJS](https://adonisjs.com/).

> **Note**
>
> You must have a Redis server running on your machine.

---

## Getting Started

This package is available in the npm registry.

```bash
npm install @setten/bull-queue
```

Next, configure the package by running the following command.

```bash
node ace configure @setten/bull-queue
```

and... Voilà!

## Usage

The `Queue` provider gives you access to the `dispatch` method.
It will dispatch the linked job to the queue with the given payload.

```ts
import { Queue } from '@ioc:Setten/Queue';

Queue.dispatch('App/Jobs/RegisterStripeCustomer', {...});


Queue.dispatch('App/Jobs/RegisterStripeCustomer', {...}, {
  queueName: 'stripe',
});
```

Your `Job` can be stored anywhere in your application and is dispatched using its full path.
It must have a `handle` method that will be executed by the queue worker.

```ts
// app/Jobs/RegisterStripeCustomer.ts

export type RegisterStripeCustomerPayload = {
  userId: string
}

export default class RegisterStripeCustomer {
  public async handle(payload: RegisterStripeCustomerPayload) {
    // ...
  }
}
```

Run the queue worker with the following ace command:

```bash
node ace queue:listen

# or

node ace queue:listen --queue=stripe
```

Once done, you will see the message `Queue processing started`.

## Typings

You can define the payload's type for a given job inside the `contracts/queue.ts` file.

```ts
import type { RegisterStripeCustomerPayload } from 'App/Jobs/RegisterStripeCustomer'

declare module '@ioc:Setten/Queue' {
  interface JobsList {
    'App/Jobs/RegisterStripeCustomer': RegisterStripeCustomerPayload;
  }
}
```