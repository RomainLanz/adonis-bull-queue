import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { IgnitorFactory } from '@adonisjs/core/factories'
import Configure from '@adonisjs/core/commands/configure'

const BASE_URL = new URL('./tmp/', import.meta.url)

test.group('Configure', (group) => {
  group.each.setup(({ context }) => {
    context.fs.baseUrl = BASE_URL
    context.fs.basePath = fileURLToPath(BASE_URL)
  })

  test('register provider and publish stubs', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreProviders()
      .withCoreConfig()
      .create(BASE_URL, {
        importer: (filePath) => {
          if (filePath.startsWith('./') || filePath.startsWith('../')) {
            return import(new URL(filePath, BASE_URL).href)
          }

          return import(filePath)
        },
      })

    await fs.createJson('tsconfig.json', {})
    await fs.create('start/kernel.ts', `router.use([])`)
    await fs.create('adonisrc.ts', `export default defineConfig({}) {}`)

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    const ace = await app.container.make('ace')
    const command = await ace.create(Configure, ['../../index.js'])
    await command.exec()

    await assert.fileContains('adonisrc.ts', '@rlanz/bull-queue/commands')
    await assert.fileContains('adonisrc.ts', '@rlanz/bull-queue/queue_provider')
    await assert.fileContains('adonisrc.ts', '#providers/jobs_provider')
    await assert.fileExists('types/container.ts')
    await assert.fileContains('types/container.ts', 'interface ContainerBindings {')
  }).disableTimeout()

  test('register provider and publish stubs - types/container.ts already exists', async ({
    fs,
    assert,
  }) => {
    const ignitor = new IgnitorFactory()
      .withCoreProviders()
      .withCoreConfig()
      .create(BASE_URL, {
        importer: (filePath) => {
          if (filePath.startsWith('./') || filePath.startsWith('../')) {
            return import(new URL(filePath, BASE_URL).href)
          }

          return import(filePath)
        },
      })

    await fs.createJson('tsconfig.json', {})
    await fs.create('start/kernel.ts', `router.use([])`)
    await fs.create('adonisrc.ts', `export default defineConfig({}) {}`)
    // already exists - require user to add the interface manually
    await fs.create('types/container.ts', `declare module '@adonisjs/core/types' {}`)

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    const ace = await app.container.make('ace')
    const command = await ace.create(Configure, ['../../index.js'])
    await command.exec()

    await assert.fileContains('adonisrc.ts', '@rlanz/bull-queue/commands')
    await assert.fileContains('adonisrc.ts', '@rlanz/bull-queue/queue_provider')
    await assert.fileContains('adonisrc.ts', '#providers/jobs_provider')
    await assert.fileExists('types/container.ts')
    await assert.fileNotContains('types/container.ts', 'interface ContainerBindings {')
  }).disableTimeout()
})
