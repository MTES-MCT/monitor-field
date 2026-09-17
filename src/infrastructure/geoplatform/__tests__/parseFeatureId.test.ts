import { parseFeatureId } from '../parseFeatureId'

describe('parseFeatureId', () => {
  it('extracts the numeric suffix of a WFS feature id', () => {
    expect(parseFeatureId('reglementation_des_peches.123')).toBe(123)
  })

  it('splits on the last dot when the layer name contains dots and colons', () => {
    expect(parseFeatureId('LIMITES_ADMINISTRATIVES_EXPRESS.LATEST:departement.79')).toBe(79)
  })

  it('takes the suffix after the last dot even when earlier segments are numeric', () => {
    expect(parseFeatureId('layer.1.5')).toBe(5)
  })

  it('accepts a bare numeric id', () => {
    expect(parseFeatureId('42')).toBe(42)
  })

  it('accepts an id already given as a number', () => {
    expect(parseFeatureId(7)).toBe(7)
  })

  it.each([
    ['undefined', undefined],
    ['an empty string', ''],
    ['a non-numeric suffix', 'layer.abc'],
    ['a trailing dot', 'layer.'],
    ['a negative suffix', 'layer.-1'],
    ['a non-integer number', 1.5]
  ])('returns undefined for %s rather than guessing', (_label, featureId) => {
    expect(parseFeatureId(featureId as string | number | undefined)).toBeUndefined()
  })
})
