import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const users = JSON.parse(readFileSync(new URL('./_users.json', import.meta.url), 'utf8'))

export function hashEmail(email) {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex')
}

export function findUser(email) {
  if (typeof email !== 'string') {
    return undefined
  }
  const emailHash = hashEmail(email)

  return users.find(user => user.emailHash === emailHash)
}
