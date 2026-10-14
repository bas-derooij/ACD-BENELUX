// Usage: npm run build:border [-- <fill distance km> <simplify tolerance degrees>]
// Builds docs/borders.js with the border lines drawn on the map (a GeoJSON FeatureCollection):
// - "outline": one smooth line around the Netherlands, Belgium and Luxembourg together
//   (Dutch mainland incl. Zeeland and Zeeuws-Vlaanderen; the Wadden islands are left out;
//   narrow waterways along the coast such as the Westerschelde and Oosterschelde are filled in)
// - "nl-be" and "be-lu": the borders between the countries, joined to the outline
// All lines are simplified and rounded off so they run smoothly instead of jagged.
const topo = require('world-atlas/countries-10m.json');
const { feature } = require('topojson-client');
const turf = require('@turf/turf');

const D_KM = Number(process.argv[2] || 6);           // inlets narrower than ~2*D are filled
const TOLERANCE = Number(process.argv[3] || 0.01);   // simplification in degrees (~1 km)
const COAST_LAT = 51.15;                             // waterways are only filled north of this latitude
const NL_MAX_LAT = 52.6;                             // Dutch parts north of this (Wadden islands) are left out, except the mainland
const JOIN_KM = 3;                                   // border ends closer than this to the outline are joined to it

const area = (ring) => {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return Math.abs(a / 2);
};
const polygonsOf = (geometry) => (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates);
const largestRing = (geometry) => polygonsOf(geometry).reduce((b, p) => (area(p[0]) > area(b[0]) ? p : b))[0];
const round = (c) => [Math.round(c[0] * 1e4) / 1e4, Math.round(c[1] * 1e4) / 1e4];
const centroidLat = (ring) => ring.reduce((s, c) => s + c[1], 0) / ring.length;

// Chaikin corner cutting for an open line; the end points stay where they are.
function smoothLine(coords, iterations = 2) {
  let pts = coords;
  for (let it = 0; it < iterations; it++) {
    const next = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [a, b] = [pts[i], pts[i + 1]];
      next.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]]);
      next.push([0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
    }
    next.push(pts[pts.length - 1]);
    pts = next;
  }
  return pts;
}

const countries = feature(topo, topo.objects.countries).features;
const byId = (id) => countries.find((f) => f.id === id);
const nl = byId('528'), be = byId('056'), lu = byId('442');

// Netherlands: the mainland and the southern parts (Zeeland, Zeeuws-Vlaanderen), not the Wadden islands.
const nlMainRing = largestRing(nl.geometry);
const nlParts = polygonsOf(nl.geometry).map((p) => p[0])
  .filter((ring) => ring === nlMainRing || (centroidLat(ring) < NL_MAX_LAT && area(ring) > 0.002));
const land = turf.union(turf.featureCollection([
  ...nlParts.map((r) => turf.polygon([r])),
  turf.polygon([largestRing(be.geometry)]),
  turf.polygon([largestRing(lu.geometry)]),
]));

// Fill narrow waterways along the coast (closing = grow, then shrink by the same distance).
const closed = turf.buffer(turf.buffer(land, D_KM, { units: 'kilometers', steps: 16 }), -D_KM, { units: 'kilometers', steps: 16 });
const fill = turf.intersect(turf.featureCollection([closed, turf.bboxPolygon([0, COAST_LAT, 20, 60])]));
const merged = turf.union(turf.featureCollection([land, fill]));

let outline = turf.polygon([largestRing(merged.geometry)]);
outline = turf.simplify(outline, { tolerance: TOLERANCE, highQuality: true });
outline = turf.polygonSmooth(outline, { iterations: 2 }).features[0];
const outlineLine = turf.lineString(outline.geometry.coordinates[0]);

// Runs of border points shared by two countries (both come from the same topology, so shared
// borders have identical coordinates). Runs whose ends are close together are joined.
function sharedBorder(a, b, minPoints = 5) {
  const bVertices = new Set(polygonsOf(b.geometry).flatMap((p) => p[0]).map((c) => c.join(',')));
  const runs = [];
  for (const [ringFull] of polygonsOf(a.geometry)) {
    const ring = ringFull.slice(0, -1);
    const start = ring.findIndex((c) => !bVertices.has(c.join(',')));
    if (start === -1) continue;
    let run = [];
    for (let k = 0; k <= ring.length; k++) {
      const c = ring[(start + k) % ring.length];
      if (bVertices.has(c.join(','))) run.push(c);
      else { if (run.length >= minPoints) runs.push(run); run = []; }
    }
  }
  return runs;
}

function drawLine(run) {
  let pts = turf.simplify(turf.lineString(run), { tolerance: TOLERANCE, highQuality: true }).geometry.coordinates;
  pts = smoothLine(pts);
  for (const i of [0, pts.length - 1]) {
    const near = turf.nearestPointOnLine(outlineLine, turf.point(pts[i]), { units: 'kilometers' });
    if (near.properties.dist < JOIN_KM) pts[i] = near.geometry.coordinates;
  }
  return pts.map(round);
}

const features = [turf.polygon([outline.geometry.coordinates[0].map(round)], { name: 'outline' })];
const report = [];
for (const [name, a, b] of [['nl-be', nl, be], ['be-lu', be, lu]]) {
  const runs = sharedBorder(a, b);
  runs.forEach((run) => features.push(turf.lineString(drawLine(run), { name })));
  report.push(`${name}: ${runs.length} part(s), ${runs.map((r) => r.length).join('+')} points`);
}

const out = `/* Border lines drawn on the map (GeoJSON): a smooth outline around the Netherlands, Belgium and
 * Luxembourg (Wadden islands left out, narrow coastal waterways filled in) and the borders between them.
 * Source: Natural Earth 1:10m admin-0 countries via world-atlas (public domain).
 * Generated by tools/build-border.js. */
window.REGION_BORDERS = ${JSON.stringify(turf.featureCollection(features))};
`;
require('fs').writeFileSync(process.argv[4] || require('path').join(__dirname, '..', 'docs', 'borders.js'), out);
console.log(`fill ${D_KM} km, tolerance ${TOLERANCE}°; outline ${outline.geometry.coordinates[0].length} points; ${report.join('; ')}; ${out.length} bytes`);
