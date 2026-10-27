import * as Linking from 'expo-linking'
import * as SecureStore from 'expo-secure-store'
import * as WebBrowser from 'expo-web-browser'
import { useMMKVBoolean } from 'react-native-mmkv'

import { storage } from '@storage'

const AUTH_API_URL = process.env.EXPO_PUBLIC_AUTH_API_URL as string

export function useProConnectAuth() {
  const [, setIsAuthenticated] = useMMKVBoolean('isAuthenticated', storage)

  async function signIn() {
    const redirectUrl = Linking.createURL('authentication/callback')
    const result = await WebBrowser.openAuthSessionAsync(`${AUTH_API_URL}/api/login`, redirectUrl)
    if (result.type !== 'success') {
      return
    }

    const token = Linking.parse(result.url).queryParams?.token
    if (typeof token !== 'string') {
      return
    }

    await SecureStore.setItemAsync('session_token', token)
    setIsAuthenticated(true)
  }

  async function signOut() {
    const redirectUrl = Linking.createURL('authentication/callback')
    await WebBrowser.openAuthSessionAsync(`${AUTH_API_URL}/api/logout`, redirectUrl)
    await SecureStore.deleteItemAsync('session_token')
    setIsAuthenticated(false)
  }

  return { isReady: true, signIn, signOut }
}
