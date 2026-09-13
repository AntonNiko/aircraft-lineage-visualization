# Data contract

The contract defines every JSON file the web app reads. The pipeline exporter and the mock generator must both produce files that validate against these schemas. The app's TypeScript types and the pipeline's Pydantic models are generated from them.

If this README and a schema disagree, the schema wins. Fix the README.

## Layout

```
contract/
├─ VERSION        # current contract version (single source of truth)
├─ CHANGELOG.md   # every contract change, newest first
├─ schemas/       # JSON Schema files
├─ examples/      # hand-written edge-case datasets, one folder per scenario
├─ tests/         # valid/invalid cases for schema definitions
└─ mock/          # seeded mock data generator
```

## Published files

The app loads these files from `PUBLIC_DATA_URL`, under a `v0/` prefix while the contract is at `0.x`.

| Published path | Schema | Status |
|---|---|---|
| `manifest.json` | `manifest.schema.json` | stable |
| `sources.json` | `sources.schema.json` | stable |
| `airlines.json` | `airlines.schema.json` | stable |
| `fleets/{airline_id}.json` | `fleet.schema.json` | stable |
| `search-docs.json` | `search-docs.schema.json` | stable |
| `aircraft/{airframe_id}.json` | `aircraft.schema.json` | draft |
| `fleet-months.json` | `fleet-months.schema.json` | draft |

Shared building blocks live in `defs.schema.json`. It is not a published file.

## Schema conventions

### Files and headers

- One schema per published file, named `<name>.schema.json` in kebab-case. Per-entity shards use the singular: `fleets/{airline_id}.json` → `fleet.schema.json`.
- Reference shared definitions with relative refs: `"$ref": "defs.schema.json#/$defs/partialDate"`.
- Every schema starts with this header:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://aircraft-lineage.example/contract/airlines.schema.json",
  "title": "Airlines",
  "description": "Every airline in the dataset, with enough data to lay out the world-level circle pack.",
  "x-contract-status": "stable",
  "type": "object",
  "additionalProperties": false,
  "required": ["airlines"],
  "properties": {}
}
```

- `$id` is an identifier only; validators load schemas from this folder and never fetch it. The domain uses the reserved `.example` TLD, so it can't point at someone else's site. The version is not in `$id`; `VERSION` tracks it.
- `x-contract-status` is `stable` or `draft`. Draft schemas can change without a version bump and are excluded from compatibility checks. Validators must register the keyword (e.g. `ajv.addKeyword("x-contract-status")`), because ajv's strict mode rejects unknown keywords.

### Fields

- Property names are `snake_case`.
- **Every property is listed in `required`.** Missing data is `null`, never an omitted key. Nullable fields declare `"type": ["string", "null"]`, or `"oneOf": [{ "$ref": "…" }, { "type": "null" }]` for refs.
- **Assume nullable.** Make a field non-null only when the pipeline can always fill it. Making a field nullable later is a breaking change (see [Versioning](#versioning)).
- Every object sets `"additionalProperties": false`, so typos and unannounced fields fail validation.
- Every property has a `description`. It becomes a doc comment in the generated TypeScript and Pydantic code.
- Strings are never empty: use `null` and set `"minLength": 1`.
- Arrays are never `null`: use `[]`.
- Maps (e.g. `family_counts`) are objects with a `propertyNames` pattern and a typed `additionalProperties`.
- Enum values are lowercase `snake_case`. Consumers must handle unknown values, e.g. by rendering "other", so adding a value is not breaking.

### Value formats

The exact patterns live in `defs.schema.json`.

| Kind | Format | Example |
|---|---|---|
| Partial date | `YYYY`, `YYYY-MM` or `YYYY-MM-DD` | `"2009-04"` |
| Month | `YYYY-MM` | `"2026-08"` |
| Timestamp | RFC 3339, UTC with `Z` | `"2026-09-12T10:00:00Z"` |
| Airline ID | `al-` + lowercase slug; pipeline-assigned, never an ICAO code | `"al-lufthansa"` |
| Airframe ID | `{manufacturer}-{programme}-{msn}`, lowercase | `"airbus-a320fam-4101"` |
| Type family | lowercase slug | `"a320fam"` |
| Country | ISO 3166-1 alpha-2 | `"DE"` |
| Region | fixed enum | `"eu"` |
| Confidence | number from 0 to 1 | `0.8` |
| Count | integer ≥ 0 | `279` |

Patterns must not use lookarounds, so they behave the same in ajv (ECMAScript), `jsonschema` (Python `re`) and pydantic (Rust regex).

### Test cases

Every schema has test cases in `tests/`:

- **`defs.cases.json`:** valid and invalid values for each definition in `defs.schema.json`, keyed by definition name.
- **`<name>.cases.json`:** whole documents for `<name>.schema.json`. `valid` is a list of documents; `invalid` is a list of `{ "why", "value" }` entries, where each value should break exactly the rule its `why` describes.

Add cases whenever you add or change a schema. Some rules can't be expressed in JSON Schema, such as unique `id`s or sort order; those are checked by producers and tests, and each schema's `description` says which.

### Ordering and formatting

- Every array has a deterministic sort order, stated in its `description`, so exports can be diffed and snapshot tests stay stable. For example: airlines by `id`; aircraft by `family`, then `built`, then `reg`.
- Published JSON is UTF-8 and minified.
- Example files use 2-space indentation and end with a newline.

## Examples

Each scenario gets its own folder under `examples/`, laid out like the published files:

```
examples/
└─ ceased-airline-with-successor/
   ├─ README.md       # what the case covers and why it matters
   ├─ manifest.json
   ├─ airlines.json
   └─ fleets/
      └─ al-example-air.json
```

- `minimal/` is the baseline dataset that each schema ticket extends; edge-case scenarios sit alongside it.
- Folder names are kebab-case and describe the case.
- Every file must validate. Tests load each folder as a complete dataset, and the mock generator merges them into its output.
- Use fictional airlines and registrations unless the real case is the point, so examples don't read as claims about real aircraft.

## Versioning

`VERSION` holds the contract version. The mock generator and the exporter write it into every `manifest.json` as `contract_version`.

Versions follow semver with the caret rule used by npm and Cargo: **the first non-zero component marks compatibility.**

- In `0.x`: `0.1.2` and `0.1.7` are compatible; `0.2.0` is not.
- From `1.0`: `1.2.0` and `1.7.0` are compatible; `2.0.0` is not.

The app refuses to load data outside its compatibility line. In the implementation plan and in Notion, **Minor** means a compatible change and **Major** means a breaking change.

| Change | Impact | Bump in `0.x` | Bump from `1.0` |
|---|---|---|---|
| Descriptions, examples or docs only | Patch | `0.1.2` → `0.1.3` | `1.2.0` → `1.2.1` |
| Add a nullable field, an enum value or a new published file; promote a draft to stable | Minor | `0.1.2` → `0.1.3` | `1.2.0` → `1.3.0` |
| Tighten a constraint (e.g. make a nullable field non-null) | Minor: CI checks the producers | `0.1.2` → `0.1.3` | `1.2.0` → `1.3.0` |
| Remove or rename a field, change a type, make a field nullable, change an ID format, a file path or a field's meaning | **Major** | `0.1.2` → `0.2.0` | `1.2.0` → `2.0.0` |

- Changes to `draft` schemas need no bump.
- While the site is not public (`0.x`), breaking changes ship together with the app, and the `v0/` path prefix stays the same. From `1.0`, each major version is published under its own prefix (`v1/`, `v2/`), so a deployed app keeps working until it is updated.

## Change process

A PR that changes anything in `schemas/` must:

1. Edit the schema(s).
2. Classify the change using the table above and bump `VERSION` (skip for draft-only changes).
3. Add a `CHANGELOG.md` entry under `[Unreleased]`, starting with **Breaking:** if it is a Major change.
4. Regenerate the TypeScript types and Pydantic models.
5. Add or update examples in `examples/`.
6. Update the mock generator in `mock/`.
7. Update the pipeline exporter. For a Minor change this can follow in a later PR; for a Major change it must be in the same PR.
8. Set **Contract impact** on the Notion ticket and bring the change to the weekly contract review.

CI checks steps 4–6 once the contract workflow is in place.

**Releasing:** move the `[Unreleased]` entries under a heading for the new version with its date, then tag the commit `contract-vX.Y.Z`.
