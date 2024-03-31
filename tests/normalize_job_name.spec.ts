import { test } from '@japa/runner'
import { normalizeJobName } from '../src/normalize_job_name.js'

test.group('normalize_job_name', () => {
  const expected = {
    className: 'TestJob',
    fileName: 'test_job',
  }
  test('test_job', ({ assert }) => {
    const actual = normalizeJobName('test_job')
    assert.equal(actual.className, expected.className)
    assert.equal(actual.fileName, expected.fileName)
  })
  test('testjob', ({ assert }) => {
    const actual = normalizeJobName('testjob')
    assert.equal(actual.className, expected.className)
    assert.equal(actual.fileName, expected.fileName)
  })
  test('testJob', ({ assert }) => {
    const actual = normalizeJobName('testJob')
    assert.equal(actual.className, expected.className)
    assert.equal(actual.fileName, expected.fileName)
  })
  test('test', ({ assert }) => {
    const actual = normalizeJobName('test')
    assert.equal(actual.className, expected.className)
    assert.equal(actual.fileName, expected.fileName)
  })
  test('TestJob', ({ assert }) => {
    const actual = normalizeJobName('TestJob')
    assert.equal(actual.className, expected.className)
    assert.equal(actual.fileName, expected.fileName)
  })
  test('Test_job', ({ assert }) => {
    const actual = normalizeJobName('Test_job')
    assert.equal(actual.className, expected.className)
    assert.equal(actual.fileName, expected.fileName)
  })
  test('Testjob', ({ assert }) => {
    const actual = normalizeJobName('Testjob')
    assert.equal(actual.className, expected.className)
    assert.equal(actual.fileName, expected.fileName)
  })
  test('Test', ({ assert }) => {
    const actual = normalizeJobName('Test')
    assert.equal(actual.className, expected.className)
    assert.equal(actual.fileName, expected.fileName)
  })
})
