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
