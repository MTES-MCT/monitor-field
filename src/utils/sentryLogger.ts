import * as Sentry from '@sentry/react-native'

const env = process.env.EXPO_PUBLIC_SENTRY_ENV

type SentryLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'

interface SentryLogOptions {
  extra?: Record<string, unknown>
}
export function logToSentry(message: string, level: SentryLevel = 'warning', options?: SentryLogOptions): void {
  if (env === 'dev') {
    // eslint-disable-next-line no-console
    console.log(`[Sentry:${level}] ${message}`, options?.extra ?? '')
  }

  Sentry.captureMessage(message, {
    extra: options?.extra,
    level
  })
}

export function logSentryError(error: unknown, label?: string): void {
  const extra = { label }

  if (env === 'dev') {
    // eslint-disable-next-line no-console
    console.error(`[Sentry:error] ${label ?? ''}`, error, extra)
  }

  if (error instanceof Error) {
    Sentry.captureException(error, {
      extra
    })
  } else {
    logToSentry(label ?? String(error), 'error', { extra })
  }
}
