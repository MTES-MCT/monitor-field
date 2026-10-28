import { Redirect } from 'expo-router'

// Évite une route inconnue quand le lien de retour ouvre l'app
export default function Callback() {
  return <Redirect href="/authentication" />
}
