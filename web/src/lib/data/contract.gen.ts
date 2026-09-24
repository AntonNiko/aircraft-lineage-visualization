/* eslint-disable */
// GENERATED from contract/schemas. Do not edit; run `npm run codegen` in contract/.

/**
 * Pipeline-assigned stable airline ID: 'al-' followed by a lowercase slug. Never an ICAO code, because ICAO codes get reused by different airlines over time.
 */
export type AirlineId = string;
/**
 * Wikidata item ID: Q followed by a number with no leading zero.
 */
export type WikidataQid = string;
/**
 * ICAO airline designator: three uppercase letters. Codes get reused over time, so this is never an airline's identity.
 */
export type IcaoAirlineCode = string;
/**
 * IATA airline designator: two uppercase letters or digits. Codes get reused over time, so this is never an airline's identity.
 */
export type IataAirlineCode = string;
/**
 * ISO 3166-1 alpha-2 country code, uppercase. The pattern checks shape only, not membership in the ISO list.
 */
export type CountryCode = string;
/**
 * Top level of the circle-pack hierarchy. af: Africa; as: Asia (excluding the Middle East); eu: Europe, including Russia and Turkey; me: Middle East; na: North America, Central America and the Caribbean; oc: Oceania; sa: South America.
 */
export type Region = "af" | "as" | "eu" | "me" | "na" | "oc" | "sa";
/**
 * Calendar date with variable precision: YYYY, YYYY-MM or YYYY-MM-DD, years 1900-2099. Day ranges follow the month (Feb allows up to 29); leap years are not checked.
 */
export type PartialDate = string;
/**
 * Where to load a file from: an absolute https URL, or a path relative to the data root (e.g. mock placeholder images). Relative paths start with a letter, digit or underscore and contain no whitespace or colon.
 */
export type AssetUrl = string;
/**
 * SPDX license identifier where one exists (e.g. CC-BY-SA-4.0, CC0-1.0). Otherwise LicenseRef- followed by the source, following the SPDX convention (e.g. LicenseRef-planespotters).
 */
export type LicenseId = string;
/**
 * Absolute https URL with no whitespace.
 */
export type HttpsUrl = string;
/**
 * Non-negative integer count.
 */
export type Count = number;
/**
 * Calendar month as YYYY-MM, years 1900-2099.
 */
export type Month = string;
/**
 * Stable airframe ID: {manufacturer}-{programme}-{msn}, three lowercase alphanumeric segments. Hyphens and other punctuation are removed inside each segment so the ID always splits into exactly three parts. Never starts with 'al-', so it can't be confused with an airline ID.
 */
export type AirframeId = string;
/**
 * Aircraft registration (tail number) as painted, uppercase: letters and digits in groups separated by single hyphens.
 */
export type Registration = string;
/**
 * ICAO Doc 8643 aircraft type designator: 2 to 4 uppercase letters or digits, starting with a letter.
 */
export type IcaoTypeCode = string;
/**
 * Aircraft type family slug used to group aircraft in the circle pack, lowercase alphanumeric.
 */
export type TypeFamily = string;
/**
 * Manufacturer serial number as published, keeping its original case and punctuation. The airframe ID contains a lowercased copy with punctuation removed.
 */
export type Msn = string;
/**
 * RFC 3339 date-time in UTC, always with a Z suffix and optional fractional seconds up to microseconds.
 */
export type Timestamp = string;
/**
 * Text shown in the results list, e.g. 'D-AIZA · A320 · Lufthansa' for an aircraft or 'Lufthansa (LH / DLH)' for an airline.
 */
export type SearchLabel = string;
/**
 * Search terms: at least one, no duplicates, sorted ascending by code point. Each term is 1-100 characters with no leading or trailing whitespace.
 *
 * @minItems 1
 * @maxItems 50
 */
export type SearchTerms = [string, ...string[]];
/**
 * ID of an entry in sources.json, as a lowercase slug.
 */
export type SourceId = string;

/**
 * Generated from contract/schemas by scripts/bundle.mjs. Index of every stable published document type. Skipped drafts: aircraft.schema.json, fleet-months.schema.json.
 */
export interface ContractDocuments {
  "airlines.json": Airlines;
  "fleet.json": Fleet;
  "manifest.json": Manifest;
  "search-docs.json": SearchDocs;
  "sources.json": Sources;
}
/**
 * Every airline in the dataset, including ones that have ceased, with enough data to lay out the world-level circle pack without loading any fleet. Rules JSON Schema can't check: IDs are unique; successor_id references an airline in this file; every airline with fleet_count > 0 has a fleets/{id}.json file whose aircraft match fleet_count and family_counts.
 */
export interface Airlines {
  /**
   * All airlines, sorted by id.
   */
  airlines: Airline[];
}
/**
 * One airline. Fleet figures describe the fleet as of manifest.data_as_of.
 */
export interface Airline {
  /**
   * Stable pipeline-assigned ID. Use this in URLs and references, never the ICAO or IATA code.
   */
  id: AirlineId;
  /**
   * Display name, e.g. from Wikidata or the cleaned operator name.
   */
  name: string;
  /**
   * Matching Wikidata item, or null if the airline couldn't be matched.
   */
  wikidata_qid: WikidataQid | null;
  /**
   * ICAO designator the airline used, or null if it has none or it is unknown.
   */
  icao: IcaoAirlineCode | null;
  /**
   * IATA designator the airline used, or null if it has none or it is unknown.
   */
  iata: IataAirlineCode | null;
  /**
   * Country the airline is based in, or null if unknown.
   */
  country: CountryCode | null;
  /**
   * Region the airline appears under in the circle pack, or null if unknown. The app groups null regions under 'Unknown'.
   */
  region: Region | null;
  /**
   * When the airline was founded or started operating, or null if unknown.
   */
  founded: PartialDate | null;
  /**
   * When the airline stopped operating, or null if it is still operating or the date is unknown.
   */
  ceased: PartialDate | null;
  /**
   * Airline that took over when this one ceased or merged, or null if there is none or it is unknown.
   */
  successor_id: AirlineId | null;
  /**
   * Airline logo, or null if none is available.
   */
  logo: ImageRef | null;
  /**
   * Number of aircraft in the fleet as of manifest.data_as_of. 0 for airlines with no current fleet, such as ceased airlines.
   */
  fleet_count: Count;
  /**
   * Fleet size per type family, used to draw family circles before the fleet file loads. Invariant: the values sum to fleet_count. Families with no aircraft are left out, so an airline with fleet_count 0 has {}. Written in ascending key order.
   */
  family_counts: {
    [k: string]: number | undefined;
  };
}
/**
 * An image plus everything needed to display and credit it.
 */
export interface ImageRef {
  /**
   * Full-size image location.
   */
  url: AssetUrl;
  /**
   * Thumbnail location for small circles, or null to use url.
   */
  thumb_url: AssetUrl | null;
  /**
   * Width of the full-size image in pixels, or null if unknown.
   */
  width: number | null;
  /**
   * Height of the full-size image in pixels, or null if unknown.
   */
  height: number | null;
  /**
   * Name to credit, exactly as the source requires, or null when the license needs no attribution.
   */
  author: string | null;
  /**
   * License the image is used under.
   */
  license: LicenseId;
  /**
   * Page the image came from, used for the credit link-back, or null for images this project made (e.g. placeholder silhouettes).
   */
  source_url: HttpsUrl | null;
  /**
   * When the photo was taken, or null if unknown.
   */
  taken_at: PartialDate | null;
}
/**
 * One airline's current fleet, published as fleets/{airline_id}.json and loaded when the user zooms into that airline. Rules JSON Schema can't check: airline_id matches the file name and an entry in airlines.json; as_of equals manifest.data_as_of; the aircraft count and per-family counts match that airline's fleet_count and family_counts; an airframe appears in at most one fleet file.
 */
export interface Fleet {
  /**
   * Airline this fleet belongs to.
   */
  airline_id: AirlineId;
  /**
   * Month the fleet reflects.
   */
  as_of: Month;
  /**
   * Aircraft in the fleet, in circle-pack slot order: family ascending, then built ascending, then reg ascending, then id ascending. Null built and reg values sort last. The app fills pre-laid-out slots in this order, so it must be stable.
   */
  aircraft: FleetAircraft[];
}
/**
 * One aircraft as shown in the circle pack. Full history lives in aircraft/{id}.json.
 */
export interface FleetAircraft {
  /**
   * Stable airframe ID, {manufacturer}-{programme}-{msn}. Stays the same across re-registrations and operator changes.
   */
  id: AirframeId;
  /**
   * Current registration, or null if unknown.
   */
  reg: Registration | null;
  /**
   * ICAO type designator for the exact variant, or null if unknown.
   */
  type_code: IcaoTypeCode | null;
  /**
   * Type family the aircraft is grouped under. Never null: aircraft whose type can't be mapped use the family 'other'.
   */
  family: TypeFamily;
  /**
   * Manufacturer serial number as published.
   */
  msn: Msn;
  /**
   * When the aircraft was built (first flight or delivery, whichever is known first), or null if unknown.
   */
  built: PartialDate | null;
  /**
   * Status within this fleet, or null if unknown. active: in service; stored: parked or in long-term storage. Consumers must handle values added later.
   */
  status: ("active" | "stored") | null;
  /**
   * Number of operators before the current one. 0 means the aircraft is known to have had no earlier operator; null means its history is unknown.
   */
  previous_operator_count: Count | null;
  /**
   * Photo of the aircraft for the circle pack, or null if none is available. The app falls back to a family silhouette.
   */
  thumb: ImageRef | null;
}
/**
 * Describes a published dataset: the contract version it follows, what produced it and when, and how complete it is. The app loads this file first and refuses data outside its compatibility line.
 */
export interface Manifest {
  /**
   * Contract version the dataset follows, copied from contract/VERSION. Plain MAJOR.MINOR.PATCH with no pre-release or build suffix.
   */
  contract_version: string;
  /**
   * What generated the dataset. mock: the seeded mock generator; pipeline: the data pipeline exporter.
   */
  producer: "mock" | "pipeline";
  /**
   * When the dataset was generated.
   */
  generated_at: Timestamp;
  /**
   * Latest month the data reflects, e.g. the newest registry snapshot ingested.
   */
  data_as_of: Month;
  /**
   * Totals across the dataset, for loading indicators and sanity checks. Must match the published files.
   */
  counts: {
    /**
     * Number of entries in airlines.json.
     */
    airlines: Count;
    /**
     * Number of aircraft across all fleets/*.json files.
     */
    airframes: Count;
  };
  /**
   * How complete the data is, so the UI can be honest about gaps. Null when coverage was not measured (e.g. mock data).
   */
  coverage: Coverage | null;
}
/**
 * Completeness measures computed by the pipeline.
 */
export interface Coverage {
  /**
   * Earliest month with operator history, or null if the dataset has none.
   */
  history_since: Month | null;
  /**
   * Share of records that have a value for a field, from 0 to 1, keyed by <entity>.<field> (e.g. airframe.built). Written in ascending key order.
   */
  fill_rates: {
    [k: string]: number | undefined;
  };
}
/**
 * Raw documents the app indexes for search (label and terms). The app builds the index in the browser, so this file doesn't depend on a search library. Rules JSON Schema can't check: every airline in airlines.json and every aircraft in fleets/*.json has exactly one doc; ids and airline_ids reference existing entries; an aircraft doc's airline_id is the airline whose fleet file lists it.
 */
export interface SearchDocs {
  /**
   * All search documents, sorted by kind, then id (ascending). Each (kind, id) pair appears once.
   */
  docs: (AircraftSearchDoc | AirlineSearchDoc)[];
}
/**
 * An aircraft the user can search for.
 */
export interface AircraftSearchDoc {
  /**
   * Document type.
   */
  kind: "aircraft";
  /**
   * Airframe the result opens.
   */
  id: AirframeId;
  /**
   * Airline whose fleet file lists the aircraft, so selecting the result loads only that fleet. Null if the aircraft isn't in any current fleet.
   */
  airline_id: AirlineId | null;
  label: SearchLabel;
  /**
   * Strings the aircraft can be found by: at least its current registration and MSN when known, plus past registrations and ICAO 24-bit addresses (uppercase hex).
   */
  terms: SearchTerms;
}
/**
 * An airline the user can search for.
 */
export interface AirlineSearchDoc {
  /**
   * Document type.
   */
  kind: "airline";
  /**
   * Airline the result opens.
   */
  id: AirlineId;
  label: SearchLabel;
  /**
   * Strings the airline can be found by: at least its name, plus ICAO and IATA codes when known and any former names.
   */
  terms: SearchTerms;
}
/**
 * Every data source that records in the dataset cite through source_ids. Also drives the attribution page.
 */
export interface Sources {
  /**
   * All sources, sorted by id. IDs must be unique; JSON Schema can't check uniqueness by field, so producers and tests must.
   */
  sources: Source[];
}
/**
 * One data source, such as a registry snapshot or a photo archive.
 */
export interface Source {
  /**
   * Stable ID referenced by source_ids. Snapshot-based sources include the month (e.g. opensky-2026-08).
   */
  id: SourceId;
  /**
   * Human-readable name shown in credits.
   */
  name: string;
  /**
   * Where the data can be found, or null for sources with no public location (e.g. manual overrides).
   */
  url: HttpsUrl | null;
  /**
   * License or terms the data is used under, or null when it varies per record (e.g. Wikimedia Commons photos, whose licenses are on each imageRef).
   */
  license: LicenseId | null;
  /**
   * When the data was downloaded, or null for sources that aren't downloaded (e.g. manual overrides).
   */
  retrieved_at: Timestamp | null;
}
