import { StyleSpecification } from "@maplibre/maplibre-react-native";

export type BoundingBox = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

export type Position = number[];

export type PolygonGeometry = {
  type: "Polygon";
  coordinates: Position[][];
};

export type MultiPolygonGeometry = {
  type: "MultiPolygon";
  coordinates: Position[][][];
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
  properties: Record<string, string | number | boolean | null | undefined>;
};

export type GeoJSONCollection = {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
};

export type MapLayer = NonNullable<StyleSpecification["layers"]>[number];
