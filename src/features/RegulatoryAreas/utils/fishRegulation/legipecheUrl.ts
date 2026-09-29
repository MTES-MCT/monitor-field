// Legipêche links are published with the intranet host, unreachable outside the ministry network.
const INTRANET_HOST = 'legipeche.metier.e2.rie.gouv.fr'
const EXTRANET_HOST = 'extranet.legipeche.metier.developpement-durable.gouv.fr'

export function toPublicLegipecheUrl(url: string): string {
  return url.replace(INTRANET_HOST, EXTRANET_HOST)
}
