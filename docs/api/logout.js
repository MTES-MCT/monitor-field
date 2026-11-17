import { randomUUID } from 'node:crypto'

export default async function handler(req, res) {
  try {
    const configRes = await fetch(`${process.env.PROCONNECT_ISSUER}/.well-known/openid-configuration`)
    if (!configRes.ok) {
      throw new Error(`Discovery ProConnect en échec : HTTP ${configRes.status}`)
    }
    const { end_session_endpoint } = await configRes.json()

    const url = new URL(end_session_endpoint)
    url.search = new URLSearchParams({
      client_id: process.env.PROCONNECT_CLIENT_ID,
      post_logout_redirect_uri: `${process.env.APP_BASE_URL}/api/logout-callback`,
      state: randomUUID()
    }).toString()

    res.redirect(302, url.toString())
  } catch (error) {
    console.error('[logout]', error)
    res.status(500).send(`Erreur logout : ${error.message}`)
  }
}
