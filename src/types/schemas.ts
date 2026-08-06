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

const FishFeaturePropertiesSchema = z.object({
  fillColor: z.string(),
  id: z.number(),
  theme: z.string(),
  type: z.string(),
  zone: z.string()
})

export const FishRegulatoryAreaFeatureSchema = RawGeoJSONFeatureSchema.extend({
  properties: FishFeaturePropertiesSchema
})

export type FishRegulatoryAreaFeature = z.infer<typeof FishRegulatoryAreaFeatureSchema>

const EnvFeaturePropertiesSchema = z.object({
  additionalRefReg: z.string().nullable(),
  authorizationPeriods: z.string().nullable(),
  date: z.string().nullable(),
  dateFin: z.string().nullable(),
  facade: z.string().nullable(),
  fillColor: z.string(),
  id: z.number(),
  plan: z.string(),
  polyName: z.string().nullable(),
  prohibitionPeriods: z.string().nullable(),
  refReg: z.string().nullable(),
  resume: z.string().nullable(),
  tags: z.string().nullable(),
  themes: z.string().nullable(),
  type: z.string().nullable(),
  url: z.string().nullable()
})

export const EnvRegulatoryAreaFeatureSchema = RawGeoJSONFeatureSchema.extend({
  properties: EnvFeaturePropertiesSchema
})

export type EnvRegulatoryAreaFeature = z.infer<typeof EnvRegulatoryAreaFeatureSchema>
