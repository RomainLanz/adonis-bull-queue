import { assert } from '@japa/assert'
import { configure, processCLIArgs, run } from '@japa/runner'
import { fileSystem } from '@japa/file-system'

processCLIArgs(process.argv.splice(2))

configure({
  files: ['tests/**/*.spec.(t|j)s'],
  plugins: [fileSystem(), assert()],
})

run()
