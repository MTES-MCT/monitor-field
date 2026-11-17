// Les liens de retour d'authentification sont traités par openAuthSessionAsync, pas par le routeur
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  if (path.includes('authentication/callback')) {
    return '/'
  }

  return path
}
