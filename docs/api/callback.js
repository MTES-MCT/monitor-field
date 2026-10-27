import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose'

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET)

export default async function handler(req, res) {
  try {
    const { code, state } = req.query
    const { payload: statePayload } = await jwtVerify(state, key())

    const config = await (
      await fetch(`${process.env.PROCONNECT_ISSUER}/.well-known/openid-configuration`)
    ).json()

    const tokenRes = await fetch(config.token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.PROCONNECT_CLIENT_ID,
        client_secret: process.env.PROCONNECT_CLIENT_SECRET,
        redirect_uri: `${process.env.APP_BASE_URL}/api/callback`,
        code
      })
    })
    const tokens = await tokenRes.json()
    if (!tokenRes.ok) {
      throw new Error('token_exchange_failed')
    }

    const { payload: idToken } = await jwtVerify(
      tokens.id_token,
      createRemoteJWKSet(new URL(config.jwks_uri)),
      { audience: process.env.PROCONNECT_CLIENT_ID, issuer: config.issuer }
    )
    if (idToken.nonce !== statePayload.nonce) {
      throw new Error('nonce_mismatch')
    }

    const info = await (
      await fetch(config.userinfo_endpoint, {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      })
    ).json()

    const session = await new SignJWT({ email: info.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(idToken.sub)
      .setExpirationTime('12h')
      .sign(key())

    res.redirect(302, `monitorfield://authentication/callback?token=${session}`)
  } catch (error) {
    console.error('[callback]', error)
    res.redirect(302, 'monitorfield://authentication/callback?error=auth_failed')
  }
}
