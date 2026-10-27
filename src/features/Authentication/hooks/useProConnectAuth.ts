import * as Linking from 'expo-linking'
import * as SecureStore from 'expo-secure-store'
import * as WebBrowser from 'expo-web-browser'
import { useState } from 'react'
import { useMMKVBoolean } from 'react-native-mmkv'

import { storage } from '@storage'

const AUTH_API_URL = process.env.EXPO_PUBLIC_AUTH_API_URL as string

export type AuthError = 'auth_failed' | 'unauthorized'

// Lecture sans vérification de signature : la valeur ne sert qu'à l'affichage
function readIsSuperUser(token: string): boolean {
  try {
    const payload = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/') ?? ''

    return JSON.parse(atob(payload)).isSuperUser === true
  } catch {
    return false
  }
}

export function useProConnectAuth() {
  const [, setIsAuthenticated] = useMMKVBoolean('isAuthenticated', storage)
  const [, setIsSuperUser] = useMMKVBoolean('isSuperUser', storage)
  const [error, setError] = useState<AuthError>()

  async function signIn() {
    setError(undefined)
    const redirectUrl = Linking.createURL('authentication/callback')
    const result = await WebBrowser.openAuthSessionAsync(`${AUTH_API_URL}/api/login`, redirectUrl)
    if (result.type !== 'success') {
      return
    }

    const { error: errorParam, token } = Linking.parse(result.url).queryParams ?? {}
    if (errorParam === 'unauthorized') {
      setError('unauthorized')

      return
    }
    if (typeof token !== 'string') {
      setError('auth_failed')

      return
    }

    await SecureStore.setItemAsync('session_token', token)
    setIsSuperUser(readIsSuperUser(token))
    setIsAuthenticated(true)
  }

  async function signOut() {
    const redirectUrl = Linking.createURL('authentication/callback')
    await WebBrowser.openAuthSessionAsync(`${AUTH_API_URL}/api/logout`, redirectUrl)
    await SecureStore.deleteItemAsync('session_token')
    setIsSuperUser(false)
    setIsAuthenticated(false)
  }

  return { error, isReady: true, signIn, signOut }
}

export function useIsSuperUser() {
  const [isSuperUser] = useMMKVBoolean('isSuperUser', storage)

  return isSuperUser === true
}
