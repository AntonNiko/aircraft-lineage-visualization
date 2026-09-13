# Aircraft Lineage — Implementation Plan

## 1. Product summary

An interactive site for exploring the life story of individual airliners:

1. **Fleet view**: a zoomable circle pack. Circles are airlines; inside them are the airline's aircraft, shown as photo thumbnails once you zoom in.
2. **Lineage view**: pick an aircraft and the pack animates into a flow layout. The airlines that aircraft served move onto a time axis, and a ribbon traces the aircraft between them. A side panel shows past liveries, owners, registrations and stats.
3. **Time view**: a date slider replays how fleets grow, shrink, merge, appear and disappear.

## 2. Design decisions

| Concern | Decision |
|---|---|
| **Scale.** About 28k airliners are in service, plus historical ones. Thousands of photo circles will not render at 60fps in SVG. | Render the pack on **Canvas 2D**, with an SVG/HTML overlay for labels and focus rings. Use **level of detail**: world zoom shows airline circles only (logo + fleet count); airline zoom shows aircraft as dots coloured by type family; photos load only for visible nodes above ~24px radius. |
| **Hierarchy depth.** Big airlines (700–1000 aircraft) are unreadable as flat packs. | Hierarchy: `Region → Airline → Type family (A320 family, 737, 777…) → Aircraft`. |
| **"Sankey" for one aircraft.** A Sankey shows quantity, and one aircraft has width 1. | Single aircraft: a **lineage path**. x = time, one lane per airline or owner, and a ribbon through the lanes. Storage, lessor and conversion periods show as grey or dashed segments. Keep a real **Sankey** for aggregates such as "where did Airline X's aircraft go" (Phase 5). |
| **Pack → lineage transition** | Treat it as a tween between two layouts. Every node has `{x, y, r, opacity}` in layout A (pack) and layout B (lineage). Interpolate with `d3.interpolate` on a single `d3.timer`. |
| **Time slider stability.** `d3.pack` recomputes from scratch, so circles jump when sizes change. | Time view uses a **force bubble layout** (`forceX/forceY` pulled to region anchors, plus `forceCollide` on radius). Each frame starts from the previous positions. Radii tween between monthly keyframes. |
| **Operator vs owner.** Most airliners are leased. | Model **operator tenures** and **ownership tenures** separately. |
| **Aircraft identity.** Registration and ICAO 24-bit address change when an aircraft moves country, and registrations get reused. | Canonical key = **manufacturer + production programme + MSN**. Registrations and icao24 values are time-bounded attributes. |
| **App and pipeline built in parallel** | A versioned **data contract** (JSON Schema) sits between them. The app reads contract data through a `DataSource` interface, so mock data, static shards, or a future API/DuckDB-WASM source can be swapped without touching the visualization code. |

## 3. Tech stack

| Layer | Choice | Why |
|---|---|---|
| App framework | **SvelteKit** (TypeScript, `adapter-static`) | Small runtime. Svelte stays out of the way of imperative D3/Canvas code, and its stores work well for selection, zoom and date state. |
| Visualization | **D3 modules**: `d3-hierarchy`, `d3-force`, `d3-zoom`, `d3-interpolate`/`d3-timer`, `d3-scale`, `d3-quadtree`, `d3-sankey` | D3 does layout, maths and camera; our own canvas code draws. |
| Rendering | Canvas 2D first; move to **PixiJS** only if profiling shows the need | Circular photo clipping is easy on canvas with cached `ImageBitmap`s. |
| Data contract | **JSON Schema (2020-12)** as the single source of truth, generating TS types (`json-schema-to-typescript`) and Pydantic models (`datamodel-code-generator`), validated with `ajv` (web) and `jsonschema` (pipeline) | Both tracks build against the same definition, and CI catches drift. |
| Data pipeline | **Python 3.12 + DuckDB (+ Polars)** | Joins and diffs over multi-GB CSV snapshots on a laptop. |
| Pipeline database | **DuckDB file** (`lineage.duckdb`) plus Parquet exports | One queryable file holding the canonical tables. The exporter turns it into contract shards. |
| Search | MiniSearch, index built in the browser from contract search docs | Keeps the contract independent of the search library's version. |
| Hosting | Cloudflare Pages (app) + Cloudflare R2 (data shards) | Fully static, so cheap. The data URL is configurable. |
| Automation | GitHub Actions: contract checks on every PR; monthly ingest → build → export → deploy | |

## 4. Data sources

### Core (free)

| Source | Provides | License / terms | Notes |
|---|---|---|---|
| **OpenSky Aircraft Database**: `aircraft-database-complete-YYYY-MM.csv` monthly snapshots | icao24, registration, manufacturer, typecode, **serial number**, line number, operator + operator ICAO/IATA, owner, built date | Crowdsourced, "as is". Check OpenSky terms for your use (non-commercial is safest). | Use the **complete** monthly files, not the plain `aircraftDatabase` ones (those are incomplete). **Diff consecutive snapshots to build tenures.** Operator fields are patchy. |
| **FAA Releasable Aircraft Database**: `MASTER.txt`, `DEREG.txt`, `ACFTREF.txt` | US registrations with serial numbers, owners, cert dates; **DEREG gives past US registrations** | Public domain | Best free source for dated ownership history. Owners are often bank trustees. |
| **Other national registers** | Current (sometimes historical) registrations | Varies | Add one at a time by value: Transport Canada CCAR, UK CAA G-INFO, Australia CASA, NZ CAA, Ireland IAA. |
| **Wikidata** (SPARQL) | Airlines: ICAO/IATA codes, country, founded/dissolved dates, parent, **"replaced by"/"merged into"**, logo (P154) | CC0 | Backbone for the airline entity and the time view. |
| **Wikimedia Commons** | Photos of individual airframes, usually in `Category:<REG> (aircraft)`, with date taken and license | CC BY / CC BY-SA, per-image attribution | Main source for **livery history**. |
| **adsb.lol globe_history** (GitHub releases, daily) | Per-aircraft daily ADS-B traces | ODbL 1.0 | Stats: flights observed, callsigns used, first/last seen. Aggregate to monthly per airframe. |
| **ICAO Doc 8643** type designators | Type code → manufacturer/model/family | Public lookup | Normalize type families. |
| **Mictronics / tar1090-db** | icao24 ↔ registration ↔ type | See repo | Cross-check and fill gaps. |

### Supplementary
- **Planespotters.net photo thumbnails**: use to fill image gaps. You must credit "© author" and link back. Hotlink; don't bulk-cache. Read their Terms of Use first.
- **OpenFlights `airlines.dat`** (ODbL): legacy airline code mapping.
- **OpenSky historical (Trino)**: research accounts only.

### Not free — do not scrape
airfleets.net, rzjets.net, ch-aviation, Cirium, Planespotters production lists, JetPhotos/Airliners.net.

### Honest data expectations
- **Now**: good coverage.
- **Since the snapshot era**: decent history, with gaps.
- **Before that**: sparse, except US registrations (FAA DEREG) and well-photographed aircraft (Commons).
- **Flight hours/cycles** are not public.

**Consequence for the contract:** any field the pipeline might fail to fill must be **nullable from day 1**. The mock generator produces nulls at realistic rates so the UI is built to handle gaps.

## 5. Data architecture

```
 ┌──────────── Track B: pipeline ────────────┐          ┌──────── Track A: app ────────┐
 sources → ingest → normalize → build →            contract/            DataSource interface
                         lineage.duckdb → export ──▶ schemas ◀── mock generator
                                           │        (JSON Schema)          │
                                           ▼                               ▼
                                 data/v0/*.json (R2) ──── same shape ──── static/mock-data/v0/*.json
                                           └──────────────▶ web app ◀──────┘
                                              PUBLIC_DATA_URL chooses which
```

### 5a. Canonical database (pipeline-internal, `lineage.duckdb`)

The app never reads this directly, so it can change freely as long as the exporter still produces valid contract shards.

```
airframe      (id, manufacturer, programme, type_code, variant, msn, line_no,
               first_flight, built, status)
airline       (id, wikidata_qid, icao, iata, name, country, region, founded, ceased,
               successor_id, parent_id, logo_url)
org           (id, name, kind[lessor|bank_trustee|government|private], wikidata_qid)
registration  (airframe_id, reg, icao24, country, start, end, source_ids[])
op_tenure     (airframe_id, airline_id, start, end, kind[operated|wet_lease|stored|unknown],
               confidence, source_ids[])
own_tenure    (airframe_id, owner_ref, start, end, confidence, source_ids[])
photo         (id, airframe_id, url, thumb_url, width, height, taken_at, author, license,
               source_url, matched_tenure_id)
fleet_month   (airline_id, month, total, by_family)          -- derived
obs_month     (airframe_id, month, flights, callsigns, top_airports) -- derived
source        (id, name, url, license, retrieved_at)
pipeline_run  (id, started_at, git_sha, input_checksums, row_counts, coverage)
```

DDL lives in `pipeline/schema.sql`.

#### Entity resolution rules
1. `airframe.id` = `{manufacturer}-{programme}-{msn}`, e.g. `airbus-a320fam-4101` or `boeing-737-29934`. Use the programme because Airbus MSNs are shared across a family (A319/A320/A321). Sanity check with line number and built year.
2. Operator string → `airline`: exact `operatoricao` match, then exact cleaned name, then fuzzy match against Wikidata labels. Anything left goes to `pipeline/overrides/operators.csv`.
3. `airline.id` is pipeline-assigned and stable (`al-` + slug), **not** the ICAO code, because ICAO codes get reused by different airlines over time.
4. Tenures run from the first to the last snapshot showing an operator. Gaps up to 2 months are bridged; longer gaps become `unknown`.

### 5b. Data contract v0 (what the app reads)

Lives in `contract/schemas/`. Common conventions:
- **Dates** are ISO strings with variable precision: `"2009"`, `"2009-04"` or `"2009-04-17"`.
- **Missing data** is `null`, never an omitted key.
- **Image refs** are `{ url, thumb_url, width, height, author, license, source_url, taken_at }`.
- Every history record carries `confidence` (0–1) and `source_ids` pointing into `sources.json`.
- `manifest.json` carries `contract_version` (semver). The app refuses data outside its compatibility line: the first non-zero version component, so `0.1.x` is incompatible with `0.2.0`. Full conventions are in `contract/README.md`.

| File | Needed by | Status in v0 |
|---|---|---|
| `manifest.json` | all | stable |
| `sources.json` | all | stable |
| `airlines.json` | pack (world level) | **stable**: required for Track A step 1 |
| `fleets/{airline_id}.json` | pack (airline level) | **stable**: required for Track A step 1 |
| `search-docs.json` | search | stable |
| `aircraft/{airframe_id}.json` | lineage view | draft; finalize before Phase 3 |
| `fleet-months.json` | time view | draft; finalize before Phase 4 |

Sketches:

```jsonc
// manifest.json
{ "contract_version": "0.1.0", "source": "mock" /* | "pipeline" */,
  "generated_at": "2026-09-12T10:00:00Z", "data_as_of": "2026-08",
  "counts": { "airlines": 812, "airframes": 31240 } }

// airlines.json: enough to draw the whole world-level pack without loading fleets
{ "airlines": [ {
    "id": "al-lufthansa", "wikidata_qid": "Q9325", "icao": "DLH", "iata": "LH",
    "name": "Lufthansa", "country": "DE", "region": "eu",
    "founded": "1953-01-06", "ceased": null, "successor_id": null,
    "logo": { /* image ref */ } ,
    "fleet_count": 279,
    "family_counts": { "a320fam": 97, "a350": 25, "747": 27 }   // drives family circles
} ] }

// fleets/al-lufthansa.json: loaded lazily when zooming into an airline
{ "airline_id": "al-lufthansa", "as_of": "2026-08",
  "aircraft": [ {
    "id": "airbus-a320fam-4101", "reg": "D-AIZA", "type_code": "A320",
    "family": "a320fam", "msn": "4101", "built": "2009-12",
    "status": "active", "previous_operator_count": 0,
    "thumb": { /* image ref */ } | null
  } ] }

// search-docs.json
{ "docs": [ { "id": "airbus-a320fam-4101", "kind": "aircraft",
              "label": "D-AIZA · A320 · Lufthansa", "terms": ["D-AIZA", "4101", "3C4B21"] } ] }
```

**Pack layout note:** `airlines.json` has `family_counts`, so the full pack (including one circle slot per aircraft) can be laid out before any fleet shard loads. When the user zooms into an airline, its shard loads and aircraft fill the slots in a fixed order (`family`, then `built`, then `reg`). That keeps positions stable.

### 5c. Contract change process
- Every contract change is a PR that updates the schema, regenerates types/models, updates the mock generator, and bumps `contract/VERSION`.
  - **Minor** (compatible): add a nullable field, an enum value or a new file; tighten a constraint.
  - **Major** (breaking): remove, rename or retype a field; make an existing field nullable; change an ID format, path or meaning.
  - The full classification table is in `contract/README.md`.
- The exporter may lag behind a *minor* change, since new fields are nullable. It must match before a *major* change merges.
- CI must pass on every PR:
  1. Generated TS/Python code is up to date.
  2. Freshly generated mocks validate against the schemas.
  3. The exporter, run against a small checked-in fixture DB, produces valid shards.
  4. The mocks load through the app's `DataSource` in a smoke test.

## 6. Repository layout

```
aircraft-lineage/
├─ contract/
│  ├─ schemas/               # *.schema.json — single source of truth
│  ├─ examples/              # hand-written edge-case shards (also used in tests)
│  ├─ mock/                  # seeded mock generator (TypeScript, run with tsx)
│  ├─ README.md              # conventions, versioning, change process
│  ├─ VERSION                # current contract version
│  └─ CHANGELOG.md
├─ pipeline/                 # Python + DuckDB
│  ├─ lineage/
│  │  ├─ contract_models.py  # generated from contract/schemas
│  │  ├─ ingest/             # opensky.py, faa.py, wikidata.py, commons.py, adsblol.py
│  │  ├─ normalize/          # types.py, operators.py, airframes.py
│  │  ├─ build/              # tenures.py, fleet_months.py, photos.py, stats.py
│  │  └─ export/             # shards.py, validate.py
│  ├─ schema.sql
│  ├─ overrides/
│  └─ tests/                 # fixtures/mini.duckdb, golden/ airframe histories
├─ web/                      # SvelteKit app
│  ├─ static/mock-data/v0/   # generated, git-ignored
│  └─ src/lib/
│     ├─ data/
│     │  ├─ contract.gen.ts  # generated types
│     │  ├─ source.ts        # DataSource interface
│     │  └─ static-source.ts # fetches shards from PUBLIC_DATA_URL (mock or real)
│     └─ viz/                # camera.ts, renderer.ts, layouts/, morph.ts, hittest.ts
├─ docs/
└─ .github/workflows/        # contract.yml, web.yml, pipeline.yml, data-refresh.yml
```

## 7. Phased plan

### Phase 0: Data contract (≈3–5 days, blocks both tracks)
- Write the stable v0 schemas: `manifest`, `sources`, `airlines`, `fleets`, `search-docs`, and the shared definitions (date, image ref).
- Stub `aircraft` and `fleet-months` as drafts.
- Hand-write `contract/examples/`, covering:
  - a normal airline
  - a ceased airline with a successor
  - an ICAO code reused by two airlines
  - an aircraft with no photo, unknown built date, or reused registration
- Set up the code generators and the `contract.yml` CI workflow.
- Quick sanity check: open one OpenSky complete snapshot and confirm every stable field has a plausible source, or is nullable.

---

### Phase 1: Two parallel tracks

#### Track A: App skeleton + circle pack on mock data (≈5 weeks)

**A1. Skeleton (week 1)**
- SvelteKit static setup, TypeScript, lint/format, Vitest + Playwright.
- `DataSource` interface (`getManifest`, `getAirlines`, `getFleet(airlineId)`, `getSearchDocs`) and `StaticSource` reading from `PUBLIC_DATA_URL`. Check the manifest's `contract_version` is on the app's compatibility line on load.
- Routes: `/`, `/airline/[id]`, `/aircraft/[id]` (placeholder).
- Stores: `camera`, `focusedAirline`, `selectedAircraft`.

**A2. Mock generator (week 1–2, overlaps A1)**
- Seeded generator (`pnpm mock --seed 42 --scale small|full`) writes contract shards to `web/static/mock-data/v0/`. The output must look like real data:
  - ~800 airlines with log-normal fleet sizes (a few above 700, many under 20), assigned to regions and countries
  - low-cost carriers with one aircraft family; legacy carriers with mixed fleets
  - registration prefixes that match the country (D-, N, G-, VH-…); MSNs that increase with build year per programme
  - ceased airlines with successors; about 15% of airframes with previous operators
  - nulls at realistic rates (photos ~40% missing, `built` ~5% missing, `iata` ~10% missing)
- Photos: a local set of placeholder images (silhouette per family plus a few CC0 photos) so it works offline.
- `small` scale (~40 airlines) for development; `full` scale (~30k airframes) for performance work.
- Merge in the edge cases from `contract/examples/`.
- Validate all output with `ajv` in CI.

**A3. Circle pack view (weeks 2–5)**
- Build the hierarchy from `airlines.json` + `family_counts`; run `d3.pack` once at world level.
- Canvas renderer with a zoom camera modelled on the reference example (`d3.interpolateZoom` on `[x, y, r]`), plus an HTML overlay for labels.
- Level of detail: airline circles with logos → family circles → aircraft dots → photos. Fleet shards load lazily on zoom; images go through an `ImageBitmap` LRU cache with limited concurrent fetches.
- Quadtree hit-testing, hover tooltip, click to zoom, breadcrumb, keyboard navigation, reduced-motion support.
- Search box built on `search-docs.json`; selecting a result zooms to the aircraft.
- Accessible fallback: a table/list view of the same data.
- **Done when:** 60fps pan/zoom on `full` mock scale on a mid-range laptop, and Playwright visual snapshots stable with seed 42.

#### Track B: Pipeline → database (≈7 weeks)

**B1. Feasibility spike + raw ingest (weeks 1–2)** ⚠️ go/no-go
- Ingesters with caching and checksums: OpenSky complete snapshots (start with ~24 spread over the years), FAA database, Wikidata airlines.
- Load raw tables into `lineage.duckdb` (`raw_*` tables).
- Coverage report per snapshot: share of rows with serial number, operator and operatoricao filled.
- Hand-check 20 airframes from 3 pilot airlines. These become the golden test set.
- **Checkpoint:** decide MVP scope (e.g. "jet airliners, US + Europe, since the snapshot era"). Feed any contract changes (more nullable fields, dropped fields) back through the change process.

**B2. Normalize + entity resolution (weeks 3–4)**
- Type-family table (ICAO 8643 → programme/family).
- Airframe resolution (`{manufacturer}-{programme}-{msn}`), registration history.
- Airline matching to Wikidata, the overrides CSV, and region assignment.
- Populate `airframe`, `airline`, `org`, `registration`, `source`.

**B3. Build history (weeks 4–6)**
- Operator tenures from snapshot diffs, with confidence scores; ownership tenures from FAA + OpenSky `owner`.
- `fleet_month` aggregation.
- Commons photo ingest and matching (licenses and authors stored).
- Golden tests: tenure boundaries within ±2 months for the 20 hand-checked airframes.

**B4. Export to contract (weeks 6–7)**
- `lineage export --out dist/data/v0` writes `manifest`, `sources`, `airlines`, `fleets/*`, `search-docs`, validated against the schemas with `jsonschema`.
- Fixture DB (`tests/fixtures/mini.duckdb`) plus exporter test in CI.
- `pipeline_run` provenance and a coverage summary in `manifest.json`.
- Upload to an R2 staging bucket.

#### Keeping the tracks in sync
- Weekly 30-minute contract review: what the pipeline can actually fill vs what the UI assumes.
- Update mock null rates to match the latest B1/B3 coverage report, so the UI stays honest about gaps.
- Nobody edits generated types by hand; changes go through `contract/schemas`.

---

### Phase 2: Integration (≈1 week, after A3 + B4)
- Point `PUBLIC_DATA_URL` at the staging bucket; keep mocks as the default for local development and tests.
- Fix mismatches that the schemas can't catch: realistic value ranges, very large airlines, odd names, missing logos.
- Show data coverage in the UI (e.g. "history available since …").
- Deploy a preview of the app on real data.

### Phase 3: Aircraft lineage view (≈3 weeks)
- Finalize the `aircraft/{id}` contract (registrations, operator/ownership tenures, photos, stats) → **minor** version bump.
- **Track A** builds on mocks:
  - lineage layout
  - pack → lineage morph
  - detail panel with livery gallery and stats
  - uncertain periods drawn hatched
- **Track B** extends the exporter to write `aircraft/*.json` and adds ADS-B `obs_month` stats.
- Integrate at the end of the phase.

### Phase 4: Time slider (≈2–3 weeks)
- Finalize the `fleet-months` contract (columnar: `months[]` + counts per airline); the mock generator simulates founding, growth, mergers and closures.
- Force bubble layout with warm start, radius tweening, enter/exit and merger animations, event markers on the slider.
- The pipeline exports `fleet-months.json` from `fleet_month`.

### Phase 5: Aggregate flows (optional, ≈2 weeks)
- Contract: `flows/{airline_id}.json` (fleet transfers in and out by period).
- `d3-sankey` view reached from the airline detail and the time view.

### Phase 6: Hardening and launch (≈2 weeks)
- Monthly `data-refresh.yml`: ingest → build → export → validate → diff report → publish to production R2.
- Attribution and licenses page:
  - **ODbL share-alike** applies to published derived databases built from adsb.lol or OpenFlights data.
  - CC BY-SA photos need a credit on every image.
  - Wikidata is CC0.
  - Follow OpenSky's terms.
- Mobile layout, performance pass, corrections form → overrides CSV.

### Timeline at a glance

| Week | Track A (app) | Track B (pipeline) |
|---|---|---|
| 1 | Phase 0: contract (shared) | Phase 0: contract (shared) |
| 2 | A1 skeleton + A2 mock generator | B1 spike + raw ingest |
| 3 | A2 finish, A3 pack starts | B1 go/no-go → B2 normalize |
| 4–5 | A3 pack view (LOD, zoom) | B2 → B3 tenures |
| 6 | A3 finish; start Phase 3 on mocks | B3 photos, fleet_month |
| 7–8 | Phase 3 lineage on mocks | B4 export + fixture tests |
| 9 | **Phase 2: integration** | **Phase 2: integration** |
| 10+ | Phase 3 wrap-up → 4 → 5 → 6 | Exporter for aircraft / fleet-months / flows |

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Mock data is "too clean" and the UI breaks on real data | Mock nulls and distributions follow the pipeline coverage report; edge-case examples in the contract; integration phase budgeted |
| Contract churn slows both tracks | Only the pack-view shards are stable in v0, and the rest stay draft until needed; semver + nullable-first rule |
| B1 shows the data is too sparse for the planned UI | Go/no-go in week 3, before the app depends on real data; narrow the scope rather than the contract |
| History before the snapshot era is sparse | Show coverage and confidence in the UI; add per-country registers over time; sourced community corrections |
| Operator names are messy or ambiguous | Wikidata matching plus an overrides file plus a coverage report per run |
| Image gaps or licensing mistakes | Commons first with license stored per image; Planespotters hotlinks with the required credit; placeholder silhouette per family |
| Canvas performance with photos | Performance tested on `full` mock scale early; level of detail, bitmap LRU cache; PixiJS as fallback |
| Layout jumps in the time view | Force layout with warm start instead of re-packing |
