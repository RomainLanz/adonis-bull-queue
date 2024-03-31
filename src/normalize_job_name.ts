import * as changeCase from 'change-case'

export const normalizeJobName = (jobName: string): { className: string; fileName: string } => {
  const normalized = changeCase.snakeCase(jobName).replace(/_*job$/i, '')

  return {
    className: changeCase.pascalCase(normalized) + 'Job',
    fileName: normalized.toLowerCase() + '_job',
  }
}
