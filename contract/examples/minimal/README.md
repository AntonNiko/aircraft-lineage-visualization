# Minimal dataset

The smallest valid dataset: the baseline that every schema ticket extends.

- **C3:** `manifest.json`, `sources.json`
- **C4–C5:** `airlines.json` with two airlines, and `fleets/` with four aircraft between them. `manifest.counts` matches.
- **C6:** add `search-docs.json`

What it covers:

- A mixed fleet (two families) and a single-family fleet
- Slot order within a fleet, including an aircraft with an unknown `built` date, which sorts last in its family
- Aircraft with and without a photo, with known and unknown history (`previous_operator_count` of 0, 1, 2 and `null`)
- An airline with and without a logo

The sources are real services, so the attribution fields show realistic values. The airlines, codes, registrations and serial numbers are made up and may coincide with real ones; the photo and logo files don't exist.
