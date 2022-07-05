The package has been configured successfully. The queue configuration stored inside `config/queue.ts` file relies on the following environment variables and hence we recommend validating them.

**Open the `env.ts` file and paste the following code inside the `Env.rules` object.**

```ts
QUEUE_REDIS_HOST = Env.schema.string({ format: 'host' }),
QUEUE_REDIS_PORT = Env.schema.number(),
QUEUE_REDIS_PASSWORD = Env.schema.string(),
```
