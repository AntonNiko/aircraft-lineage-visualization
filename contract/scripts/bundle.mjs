// Bundles every stable schema into one JSON Schema document for the code generators.
//
// Generators handle cross-file $refs poorly (duplicated types, multi-module output), so they
// run on this single document instead:
//   - defs.schema.json definitions keep their names:  defs.schema.json#/$defs/x -> #/$defs/x
//   - each published schema becomes a definition named after its title:  "Search docs" -> SearchDocs
//   - local definitions are prefixed with that name:  #/$defs/coverage -> #/$defs/Manifest_coverage
// Draft schemas are skipped until they are promoted to stable. `format` is dropped because
// generators map it to rich types (datetime, AnyUrl) that ignore our patterns and don't round-trip
// strings exactly; the patterns already enforce the shape.
//
// Usage: node scripts/bundle.mjs [output-path]   (prints to stdout without a path)

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const contractDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemasDir = join(contractDir, "schemas");
const DROP_KEYS = new Set(["$schema", "$id", "x-contract-status", "examples", "format"]);

const pascal = (title) =>
  title
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");

function rewrite(node, localPrefix) {
  if (Array.isArray(node)) return node.map((n) => rewrite(n, localPrefix));
  if (node === null || typeof node !== "object") return node;
  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (DROP_KEYS.has(key)) continue;
    if (key === "$ref") {
      out.$ref = rewriteRef(value, localPrefix);
    } else if (key === "$defs") {
      continue; // hoisted by the caller
    } else {
      out[key] = rewrite(value, localPrefix);
    }
  }
  return out;
}

function rewriteRef(ref, localPrefix) {
  const shared = ref.match(/^defs\.schema\.json#\/\$defs\/([A-Za-z0-9_]+)$/);
  if (shared) return `#/$defs/${shared[1]}`;
  const local = ref.match(/^#\/\$defs\/([A-Za-z0-9_]+)$/);
  if (local && localPrefix) return `#/$defs/${localPrefix}_${local[1]}`;
  if (local) return ref;
  throw new Error(`Unsupported $ref "${ref}". Add a rule to scripts/bundle.mjs.`);
}

const files = readdirSync(schemasDir)
  .filter((f) => f.endsWith(".schema.json"))
  .sort();
const $defs = {};
const titles = new Map();
const documents = {};
const skipped = [];

function addDef(name, schema, source) {
  if (name in $defs) throw new Error(`Duplicate bundled definition "${name}" (${source})`);
  const title = schema.title;
  if (title && titles.has(title)) {
    throw new Error(`Duplicate title "${title}" in ${source} and ${titles.get(title)}; generated type names would collide`);
  }
  if (title) titles.set(title, source);
  $defs[name] = schema;
}

for (const file of files) {
  const schema = JSON.parse(readFileSync(join(schemasDir, file), "utf8"));
  if (schema["x-contract-status"] !== "stable") {
    skipped.push(file);
    continue;
  }
  if (file === "defs.schema.json") {
    for (const [name, def] of Object.entries(schema.$defs)) addDef(name, rewrite(def, null), `${file}#/$defs/${name}`);
    continue;
  }
  const docName = pascal(schema.title);
  for (const [name, def] of Object.entries(schema.$defs ?? {})) {
    addDef(`${docName}_${name}`, rewrite(def, docName), `${file}#/$defs/${name}`);
  }
  addDef(docName, rewrite(schema, docName), file);
  documents[file.replace(".schema.json", ".json")] = docName;
}

const bundle = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "ContractDocuments",
  description: `Generated from contract/schemas by scripts/bundle.mjs. Index of every stable published document type. Skipped drafts: ${skipped.join(", ") || "none"}.`,
  type: "object",
  additionalProperties: false,
  required: Object.keys(documents),
  properties: Object.fromEntries(
    Object.entries(documents).map(([file, name]) => [file, { $ref: `#/$defs/${name}` }]),
  ),
  $defs,
};

const json = JSON.stringify(bundle, null, 2) + "\n";
const outPath = process.argv[2];
if (outPath) {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, json);
} else {
  process.stdout.write(json);
}
