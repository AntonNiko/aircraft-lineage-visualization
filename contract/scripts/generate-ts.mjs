// Generates TypeScript types for the web app from the bundled contract schema.
// Usage: node scripts/generate-ts.mjs <bundle-path> <output-path>

import { compile } from "json-schema-to-typescript";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const [bundlePath, outPath] = process.argv.slice(2);
if (!bundlePath || !outPath) {
  console.error("Usage: node scripts/generate-ts.mjs <bundle-path> <output-path>");
  process.exit(1);
}

// A $ref with sibling keywords (usually a description) makes json-schema-to-typescript mint a
// new alias per use (AirlineId1, AirlineId2, ...). Keep references pure by moving the siblings
// onto a wrapper that references the definition through allOf.
function pureRefs(node) {
  if (Array.isArray(node)) return node.map(pureRefs);
  if (node === null || typeof node !== "object") return node;
  const out = Object.fromEntries(Object.entries(node).map(([key, value]) => [key, pureRefs(value)]));
  if (out.$ref && Object.keys(out).length > 1) {
    const { $ref, ...siblings } = out;
    return { ...siblings, allOf: [{ $ref }] };
  }
  return out;
}

const bundle = JSON.parse(readFileSync(bundlePath, "utf8"));
const ts = await compile(pureRefs(bundle), bundle.title, {
  bannerComment: "/* eslint-disable */\n// GENERATED from contract/schemas. Do not edit; run `npm run codegen` in contract/.",
  additionalProperties: false,
  strictIndexSignatures: true,
  unreachableDefinitions: false,
  $refOptions: { resolve: { file: false, http: false } },
});

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, ts);
