/*
|--------------------------------------------------------------------------
| Configure hook
|--------------------------------------------------------------------------
|
| The configure hook is called when someone runs "node ace configure <package>"
| command. You are free to perform any operations inside this function to
| configure the package.
|
| To make things easier, you have access to the underlying "ConfigureCommand"
| instance and you can use codemods to modify the source files.
|
*/

import ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'
import { Codemods } from '@adonisjs/core/ace/codemods'
import fs from 'node:fs'

export async function configure(command: ConfigureCommand) {
  const codemods: Codemods = await command.createCodemods()

  await codemods.makeUsingStub(stubsRoot, 'config/queue.stub', {})
  await codemods.makeUsingStub(stubsRoot, 'jobs_provider.stub', {})

  if (!fs.existsSync(command.app.makePath('types/container.ts'))) {
    await codemods.makeUsingStub(stubsRoot, 'types/container.stub', {})
  }

  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@rlanz/bull-queue/queue_provider')
    rcFile.addProvider('#providers/jobs_provider')
    rcFile.addCommand('@rlanz/bull-queue/commands')
  })
}
