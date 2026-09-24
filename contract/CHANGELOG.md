# Contract changelog

All notable changes to the data contract, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning rules are in [README.md](README.md#versioning).

Start an entry with **Breaking:** when it is a Major change.

## [Unreleased]

### Added

- Contract folder layout, schema conventions, versioning rules and change process.
- `defs.schema.json` with shared definitions: `partialDate`, `month`, `timestamp`, `airlineId`, `airframeId`, `typeFamily`, `countryCode`, `region`, `confidence`, `count`, `httpsUrl`, `assetUrl`, `sourceId`, `sourceIds`, `licenseId` and `imageRef`.
- `tests/defs.cases.json` with valid and invalid values for every definition.
- `manifest.schema.json`: `contract_version`, `producer` (`mock` or `pipeline`), `generated_at`, `data_as_of`, `counts` and nullable `coverage`.
- `sources.schema.json`: sources cited by `source_ids`, each with `id`, `name`, `url`, `license` and `retrieved_at`.
- `examples/minimal/` baseline dataset with `manifest.json` and `sources.json`, plus whole-document test cases for both schemas.
- Shared definitions `wikidataQid`, `icaoAirlineCode`, `iataAirlineCode`, `registration`, `icaoTypeCode` and `msn`.
- `airlines.schema.json`: every airline, including ceased ones, with codes, dates, successor, logo, `fleet_count` and `family_counts` (values sum to `fleet_count`).
- `fleet.schema.json`: `fleets/{airline_id}.json` with the current aircraft in circle-pack slot order. `family` is never null; unmapped types use `other`.
- `examples/minimal/` now has two airlines and four aircraft, with test cases for both new schemas.
- `search-docs.schema.json`: aircraft and airline search documents with `kind`, `id`, `label` and `terms`. Aircraft docs also carry `airline_id`, so selecting a result loads only that airline's fleet.
- `examples/minimal/search-docs.json` and `tests/search-docs.cases.json`.
- Draft `aircraft.schema.json` (lineage view): registrations, operator and ownership tenures, photos and stats. Finalized in Phase 3.
- Draft `fleet-months.schema.json` (time slider): columnar monthly fleet counts per airline and family. Finalized in Phase 4.
- Edge-case example datasets: `ceased-airline-with-successor/`, `reused-airline-code/`, `reused-registration/` and `aircraft-data-gaps/`.
- Code generation (`npm run codegen`): TypeScript types in `web/src/lib/data/contract.gen.ts` and Pydantic models in `pipeline/lineage/contract_models.py`, generated from the stable schemas.

### Changed

- `airframeId` can no longer start with `al-`, so airframe and airline IDs can't be confused.
