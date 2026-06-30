import { StyleSpecification } from "@maplibre/maplibre-react-native";

export type BoundingBox = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

export type Geometry =
  | {
      type: "Polygon";
      coordinates: number[][][];
    }
  | {
      type: "MultiPolygon";
      coordinates: number[][][][];
    };

export type GeoJSONFeature = {
  type: "Feature";
  geometry: Geometry;
  properties: Record<string, unknown>;
};

export type GeoJSONCollection = {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
};

export type MapLayer = NonNullable<StyleSpecification["layers"]>[number];
