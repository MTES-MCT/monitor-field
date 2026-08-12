import { normalizeText } from '../normalizeText'

describe('normalizeText', () => {
  it('lowercases text', () => {
    expect(normalizeText('BONJOUR')).toBe('bonjour')
  })

  it('removes diacritics', () => {
    expect(normalizeText('Élève déjà prêt')).toBe('eleve deja pret')
  })

  it('keeps non-diacritic characters unchanged', () => {
    expect(normalizeText('Mer-12 / Zone_A')).toBe('mer-12 / zone_a')
  })

  it('returns an empty string when input is empty', () => {
    expect(normalizeText('')).toBe('')
  })
})
