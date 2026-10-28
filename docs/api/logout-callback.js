export default function handler(req, res) {
  res.redirect(302, 'monitorfield://authentication/callback?loggedOut=1')
}
