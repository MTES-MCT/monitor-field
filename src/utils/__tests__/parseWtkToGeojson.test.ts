/// <reference types="jest" />

import {
  parseWktToGeojson,
  parseWktToGeometry,
} from "@utils/parseWktToGeojson";

describe("parseWktToGeojson", () => {
  it("parses a polygon into a GeoJSON Feature", () => {
    const input = "SRID=4326;POLYGON((0 0, 10 0, 10 10, 0 0))";

    const feature = parseWktToGeojson(input);

    expect(feature).toBeDefined();
    expect(feature?.type).toBe("Feature");
    expect(feature?.geometry.type).toBe("Polygon");
  });

  it("returns undefined on invalid WKT", () => {
    const input = "SRID=4326;POLYGON((0 0, 10))";

    expect(parseWktToGeojson(input)).toBeUndefined();
  });
});

describe("parseWktToGeometry", () => {
  it("returns geometry only", () => {
    const input = "MULTIPOLYGON(((0 0, 1 0, 1 1, 0 0)))";

    const geometry = parseWktToGeometry(input);

    expect(geometry).toEqual({
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
      ],
    });
  });
});
