import { z } from 'zod'

const PositionSchema = z.tuple([z.number(), z.number()]).rest(z.number())

const MultiPolygonGeometrySchema = z.object({
  coordinates: z.array(z.array(z.array(PositionSchema))),
  type: z.literal('MultiPolygon')
})

const PolygonGeometrySchema = z.object({
  coordinates: z.array(z.array(PositionSchema)),
  type: z.literal('Polygon')
})

export const GeometrySchema = z.discriminatedUnion('type', [PolygonGeometrySchema, MultiPolygonGeometrySchema])

export const RawGeoJSONFeatureSchema = z.object({
  geometry: GeometrySchema,
  properties: z.record(z.string(), z.unknown()).optional(),
  type: z.literal('Feature')
})

export type RawGeoJSONFeature = z.infer<typeof RawGeoJSONFeatureSchema>

export const FeaturePropertiesSchema = z.object({
  fillColor: z.string(),
  id: z.number(),
  theme: z.string(),
  type: z.string(),
  zone: z.string()
})

export const FishRegulatoryAreaFeatureSchema = RawGeoJSONFeatureSchema.extend({
  properties: FeaturePropertiesSchema
})

export type FishRegulatoryAreaFeature = z.infer<typeof FishRegulatoryAreaFeatureSchema>
