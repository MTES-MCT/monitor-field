// based on https://github.com/mapbox/wellknown

let numberRegexp = /[-+]?([0-9]*\.[0-9]+|[0-9]+)([eE][-+]?[0-9]+)?/;
// Matches sequences like '100 100' or '100 100 100'.
let tuples = new RegExp(
  "^" + numberRegexp.source + "(\\s" + numberRegexp.source + "){1,}",
);

type Position = number[];

type PolygonGeometry = {
  type: "Polygon";
  coordinates: Position[][];
};

type MultiPolygonGeometry = {
  type: "MultiPolygon";
  coordinates: Position[][][];
};

type ParsedGeometry = PolygonGeometry | MultiPolygonGeometry;

export type GeoJSONFeature = {
  type: "Feature";
  geometry: ParsedGeometry;
  properties: Record<string, unknown>;
};

/*
 * Parse WKT and return GeoJSON.
 *
 * @param {string} input A WKT geometry
 * @return {?Object} A GeoJSON geometry object
 */
export function parseWtkToGeojson(
  input: string | undefined,
): GeoJSONFeature | undefined {
  if (!input) return undefined;

  let parts = input.split(";");
  let _ = parts.pop() ?? "";

  let i = 0;

  function $(re: RegExp): string | undefined {
    let match = _?.substring(i).match(re);
    if (!match) return undefined;
    else {
      i += match[0].length;
      return match[0];
    }
  }

  function crs(geom: ParsedGeometry | undefined): GeoJSONFeature | undefined {
    // console.log("crs geom:", geom, "srid:", srid);
    if (geom) {
      return {
        type: "Feature",
        geometry: geom,
        properties: {},
      };
    }

    return undefined;
  }

  function white() {
    $(/^\s*/);
  }

  function multicoords(): unknown[] | undefined {
    white();
    let depth = 0;
    let rings: unknown[] = [];
    let stack: unknown[][] = [rings];
    let pointer: unknown[] = rings;
    let elem: string | undefined;

    while ((elem = $(/^(\()/) || $(/^(\))/) || $(/^(,)/) || $(tuples))) {
      if (elem === "(") {
        stack.push(pointer);
        pointer = [];
        stack[stack.length - 1].push(pointer);
        depth++;
      } else if (elem === ")") {
        // For the case: Polygon(), ...
        if (pointer.length === 0) return undefined;

        const parentPointer = stack.pop();
        // the stack was empty, input was malformed
        if (!parentPointer) return undefined;
        pointer = parentPointer;
        depth--;
        if (depth === 0) break;
      } else if (elem === ",") {
        pointer = [];
        stack[stack.length - 1].push(pointer);
      } else {
        const values = elem
          .trim()
          .split(/\s+/)
          .map((value) => Number(value));
        if (values.some((value) => Number.isNaN(value))) {
          return undefined;
        }
        pointer.push(...values);
      }
      white();
    }

    if (depth !== 0) return undefined;

    return rings;
  }

  function polygon(): PolygonGeometry | undefined {
    if (!$(/^(POLYGON(\sz)?)/i)) return undefined;
    white();
    let c = multicoords();
    if (!c) return undefined;
    return {
      type: "Polygon",
      coordinates: c as Position[][],
    };
  }

  function multipolygon(): MultiPolygonGeometry | undefined {
    if (!$(/^(MULTIPOLYGON)/i)) return undefined;
    white();
    let coordinates = multicoords();
    //  console.log("multipolygon coordinates:", coordinates?.[0]?.[0]?.[0]);
    if (!coordinates) return undefined;
    return {
      type: "MultiPolygon",
      coordinates: coordinates as Position[][][],
    };
  }

  function root(): ParsedGeometry | undefined {
    return polygon() || multipolygon();
  }

  return crs(root());
}
