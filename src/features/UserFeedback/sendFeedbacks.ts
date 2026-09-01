import { getBuildNumber, getSystemName, getSystemVersion, getVersion } from 'react-native-device-info'

const FEEDBACK_ACCESS_TOKEN = process.env.EXPO_PUBLIC_FEEDBACK_ACCESS_TOKEN!
const REPO_OWNER = 'MTES-MCT'
const REPO_FEEDBACK = 'monitor-field'

export type FeedbackPayload = {
  title: string
  description: string
  type: 'bug' | 'suggestion'
}

export class FeedbackError extends Error {}

export async function sendFeedback({ title, description, type }: FeedbackPayload): Promise<void> {
  const os = `${getSystemName()} ${getSystemVersion()}`
  const version = getVersion()
  const build = getBuildNumber()

  const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_FEEDBACK}/dispatches`, {
    body: JSON.stringify({
      client_payload: { description, os, title, type, version: `${version} (${build})` },
      event_type: 'feedback'
    }),
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${FEEDBACK_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    method: 'POST'
  })
  // eslint-disable-next-line no-console
  console.log('sendFeedback response', response.status, await response.text())
  // repository_dispatch renvoie 204 No Content si accepté
  if (!response.ok) {
    throw new FeedbackError(`Envoi échoué (${response.status})`)
  }
}
