import { getBuildNumber, getSystemName, getSystemVersion, getVersion } from 'react-native-device-info'

const GITHUB_DISPATCH_TOKEN = process.env.EXPO_PUBLIC_GITHUB_FEEDBACK_TOKEN!
const REPO_OWNER = 'MTES-MCT'
const REPO_FEEDBACK = 'monitor-field'

export type FeedbackPayload = {
  title: string
  description: string
}

export class FeedbackError extends Error {}

export async function sendFeedback({ title, description }: FeedbackPayload): Promise<void> {
  const os = `${getSystemName()} ${getSystemVersion()}`
  const version = getVersion()
  const build = getBuildNumber()

  const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_FEEDBACK}/dispatches`, {
    body: JSON.stringify({
      client_payload: { description, os, title, version: `${version} (${build})` },
      event_type: 'feedback'
    }),
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${GITHUB_DISPATCH_TOKEN}`,
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
