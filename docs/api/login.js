import { SignJWT } from 'jose'
import { randomUUID } from 'node:crypto'

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET)

export default async function handler(req, res) {
  try {
    const missing = ['SESSION_SECRET', 'PROCONNECT_ISSUER', 'PROCONNECT_CLIENT_ID', 'APP_BASE_URL'].filter(
      name => !process.env[name]
    )
    if (missing.length > 0) {
      throw new Error(`Variables manquantes : ${missing.join(', ')}`)
    }

    const nonce = randomUUID()
    const state = await new SignJWT({ nonce }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('10m').sign(key())

    const configRes = await fetch(`${process.env.PROCONNECT_ISSUER}/.well-known/openid-configuration`)
    if (!configRes.ok) {
      throw new Error(`Discovery ProConnect en échec : HTTP ${configRes.status}`)
    }
    const { authorization_endpoint } = await configRes.json()

    const url = new URL(authorization_endpoint)
    url.search = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.PROCONNECT_CLIENT_ID,
      redirect_uri: `${process.env.APP_BASE_URL}/api/callback`,
      scope: 'openid email given_name usual_name',
      acr_values: 'eidas1',
      state,
      nonce
    }).toString()

    res.redirect(302, url.toString())
  } catch (error) {
    console.error('[login]', error)
    res.status(500).send(`Erreur login : ${error.message}`)
  }
}
