import { toPublicLegipecheUrl } from '../legipecheUrl'

describe('toPublicLegipecheUrl', () => {
  it('replaces the intranet host by the extranet one', () => {
    expect(toPublicLegipecheUrl('https://legipeche.metier.e2.rie.gouv.fr/arrete-a15811.html')).toBe(
      'https://extranet.legipeche.metier.developpement-durable.gouv.fr/arrete-a15811.html'
    )
  })

  it('keeps other urls', () => {
    expect(toPublicLegipecheUrl('https://www.legifrance.gouv.fr/jorf/id/1')).toBe(
      'https://www.legifrance.gouv.fr/jorf/id/1'
    )
  })
})
