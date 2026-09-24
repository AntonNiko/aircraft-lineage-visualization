# GENERATED from contract/schemas. Do not edit; run `npm run codegen` in contract/.

from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, constr
from typing_extensions import TypeAliasType

FamilyCountsAdditionalProperty = TypeAliasType(
    "FamilyCountsAdditionalProperty", Annotated[int, Field(ge=1)]
)


type PartialDate = Annotated[
    str,
    Field(
        pattern="^(19|20)[0-9]{2}(-((0[13578]|1[02])(-(0[1-9]|[12][0-9]|3[01]))?|(0[469]|11)(-(0[1-9]|[12][0-9]|30))?|02(-(0[1-9]|1[0-9]|2[0-9]))?))?$",
        title="PartialDate",
    ),
]
"""
Calendar date with variable precision: YYYY, YYYY-MM or YYYY-MM-DD, years 1900-2099. Day ranges follow the month (Feb allows up to 29); leap years are not checked.
"""


type Month = Annotated[
    str, Field(pattern="^(19|20)[0-9]{2}-(0[1-9]|1[0-2])$", title="Month")
]
"""
Calendar month as YYYY-MM, years 1900-2099.
"""


type Timestamp = Annotated[
    str,
    Field(
        pattern="^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\\.[0-9]{1,6})?Z$",
        title="Timestamp",
    ),
]
"""
RFC 3339 date-time in UTC, always with a Z suffix and optional fractional seconds up to microseconds.
"""


type AirlineId = Annotated[
    str, Field(max_length=64, pattern="^al-[a-z0-9]+(-[a-z0-9]+)*$", title="AirlineId")
]
"""
Pipeline-assigned stable airline ID: 'al-' followed by a lowercase slug. Never an ICAO code, because ICAO codes get reused by different airlines over time.
"""


type AirframeId = Annotated[
    str,
    Field(max_length=64, pattern="^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$", title="AirframeId"),
]
"""
Stable airframe ID: {manufacturer}-{programme}-{msn}, three lowercase alphanumeric segments. Hyphens and other punctuation are removed inside each segment so the ID always splits into exactly three parts. Never starts with 'al-', so it can't be confused with an airline ID.
"""


type TypeFamily = Annotated[
    str, Field(max_length=32, pattern="^[a-z0-9]+$", title="TypeFamily")
]
"""
Aircraft type family slug used to group aircraft in the circle pack, lowercase alphanumeric.
"""


type CountryCode = Annotated[str, Field(pattern="^[A-Z]{2}$", title="CountryCode")]
"""
ISO 3166-1 alpha-2 country code, uppercase. The pattern checks shape only, not membership in the ISO list.
"""


type WikidataQid = Annotated[
    str, Field(max_length=16, pattern="^Q[1-9][0-9]*$", title="WikidataQid")
]
"""
Wikidata item ID: Q followed by a number with no leading zero.
"""


type IcaoAirlineCode = Annotated[
    str, Field(pattern="^[A-Z]{3}$", title="IcaoAirlineCode")
]
"""
ICAO airline designator: three uppercase letters. Codes get reused over time, so this is never an airline's identity.
"""


type IataAirlineCode = Annotated[
    str, Field(pattern="^[A-Z0-9]{2}$", title="IataAirlineCode")
]
"""
IATA airline designator: two uppercase letters or digits. Codes get reused over time, so this is never an airline's identity.
"""


type Registration = Annotated[
    str, Field(max_length=16, pattern="^[A-Z0-9]+(-[A-Z0-9]+)*$", title="Registration")
]
"""
Aircraft registration (tail number) as painted, uppercase: letters and digits in groups separated by single hyphens.
"""


type IcaoTypeCode = Annotated[
    str, Field(pattern="^[A-Z][A-Z0-9]{1,3}$", title="IcaoTypeCode")
]
"""
ICAO Doc 8643 aircraft type designator: 2 to 4 uppercase letters or digits, starting with a letter.
"""


type Msn = Annotated[
    str, Field(max_length=32, pattern="^[A-Za-z0-9][A-Za-z0-9./-]*$", title="Msn")
]
"""
Manufacturer serial number as published, keeping its original case and punctuation. The airframe ID contains a lowercased copy with punctuation removed.
"""


type Region = Annotated[
    Literal["af", "as", "eu", "me", "na", "oc", "sa"], Field(title="Region")
]
"""
Top level of the circle-pack hierarchy. af: Africa; as: Asia (excluding the Middle East); eu: Europe, including Russia and Turkey; me: Middle East; na: North America, Central America and the Caribbean; oc: Oceania; sa: South America.
"""


type Confidence = Annotated[float, Field(ge=0.0, le=1.0, title="Confidence")]
"""
How certain the pipeline is about a record, from 0 (guess) to 1 (confirmed by a primary source).
"""


type Count = Annotated[int, Field(ge=0, title="Count")]
"""
Non-negative integer count.
"""


type HttpsUrl = Annotated[
    str, Field(max_length=2048, pattern="^https://[^\\s]+$", title="HttpsUrl")
]
"""
Absolute https URL with no whitespace.
"""


type AssetUrl = Annotated[
    str,
    Field(
        max_length=2048,
        pattern="^(https://[^\\s]+|[A-Za-z0-9_][^\\s:]*)$",
        title="AssetUrl",
    ),
]
"""
Where to load a file from: an absolute https URL, or a path relative to the data root (e.g. mock placeholder images). Relative paths start with a letter, digit or underscore and contain no whitespace or colon.
"""


type SourceId = Annotated[
    str, Field(max_length=64, pattern="^[a-z0-9]+(-[a-z0-9]+)*$", title="SourceId")
]
"""
ID of an entry in sources.json, as a lowercase slug.
"""


type SourceIds = Annotated[list[SourceId], Field(min_length=1, title="SourceIds")]
"""
Sources backing a record: at least one, no duplicates, sorted ascending.
"""


type LicenseId = Annotated[
    str, Field(max_length=64, pattern="^[A-Za-z0-9][A-Za-z0-9.+-]*$", title="LicenseId")
]
"""
SPDX license identifier where one exists (e.g. CC-BY-SA-4.0, CC0-1.0). Otherwise LicenseRef- followed by the source, following the SPDX convention (e.g. LicenseRef-planespotters).
"""


type Width = Annotated[int, Field(ge=1)]
"""
Width of the full-size image in pixels, or null if unknown.
"""


type Height = Annotated[int, Field(ge=1)]
"""
Height of the full-size image in pixels, or null if unknown.
"""


type Author = Annotated[str, Field(max_length=256, min_length=1)]
"""
Name to credit, exactly as the source requires, or null when the license needs no attribution.
"""


class ImageRef(BaseModel):
    """
    An image plus everything needed to display and credit it.
    """

    model_config = ConfigDict(
        extra="forbid",
    )
    url: AssetUrl
    """
    Full-size image location.
    """
    thumb_url: AssetUrl | None
    """
    Thumbnail location for small circles, or null to use url.
    """
    width: Width | None
    """
    Width of the full-size image in pixels, or null if unknown.
    """
    height: Height | None
    """
    Height of the full-size image in pixels, or null if unknown.
    """
    author: Author | None
    """
    Name to credit, exactly as the source requires, or null when the license needs no attribution.
    """
    license: LicenseId
    """
    License the image is used under.
    """
    source_url: HttpsUrl | None
    """
    Page the image came from, used for the credit link-back, or null for images this project made (e.g. placeholder silhouettes).
    """
    taken_at: PartialDate | None
    """
    When the photo was taken, or null if unknown.
    """


class FleetAircraft(BaseModel):
    """
    One aircraft as shown in the circle pack. Full history lives in aircraft/{id}.json.
    """

    model_config = ConfigDict(
        extra="forbid",
    )
    id: AirframeId
    """
    Stable airframe ID, {manufacturer}-{programme}-{msn}. Stays the same across re-registrations and operator changes.
    """
    reg: Registration | None
    """
    Current registration, or null if unknown.
    """
    type_code: IcaoTypeCode | None
    """
    ICAO type designator for the exact variant, or null if unknown.
    """
    family: TypeFamily
    """
    Type family the aircraft is grouped under. Never null: aircraft whose type can't be mapped use the family 'other'.
    """
    msn: Msn
    """
    Manufacturer serial number as published.
    """
    built: PartialDate | None
    """
    When the aircraft was built (first flight or delivery, whichever is known first), or null if unknown.
    """
    status: Literal["active", "stored"] | None
    """
    Status within this fleet, or null if unknown. active: in service; stored: parked or in long-term storage. Consumers must handle values added later.
    """
    previous_operator_count: Count | None
    """
    Number of operators before the current one. 0 means the aircraft is known to have had no earlier operator; null means its history is unknown.
    """
    thumb: ImageRef | None
    """
    Photo of the aircraft for the circle pack, or null if none is available. The app falls back to a family silhouette.
    """


class Fleet(BaseModel):
    """
    One airline's current fleet, published as fleets/{airline_id}.json and loaded when the user zooms into that airline. Rules JSON Schema can't check: airline_id matches the file name and an entry in airlines.json; as_of equals manifest.data_as_of; the aircraft count and per-family counts match that airline's fleet_count and family_counts; an airframe appears in at most one fleet file.
    """

    model_config = ConfigDict(
        extra="forbid",
    )
    airline_id: AirlineId
    """
    Airline this fleet belongs to.
    """
    as_of: Month
    """
    Month the fleet reflects.
    """
    aircraft: list[FleetAircraft]
    """
    Aircraft in the fleet, in circle-pack slot order: family ascending, then built ascending, then reg ascending, then id ascending. Null built and reg values sort last. The app fills pre-laid-out slots in this order, so it must be stable.
    """


FillRatesAdditionalProperty = TypeAliasType(
    "FillRatesAdditionalProperty", Annotated[float, Field(ge=0.0, le=1.0)]
)


class Coverage(BaseModel):
    """
    Completeness measures computed by the pipeline.
    """

    model_config = ConfigDict(
        extra="forbid",
    )
    history_since: Month | None
    """
    Earliest month with operator history, or null if the dataset has none.
    """
    fill_rates: dict[constr(pattern=r"^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$", max_length=64), FillRatesAdditionalProperty]
    """
    Share of records that have a value for a field, from 0 to 1, keyed by <entity>.<field> (e.g. airframe.built). Written in ascending key order.
    """


class Counts(BaseModel):
    """
    Totals across the dataset, for loading indicators and sanity checks. Must match the published files.
    """

    model_config = ConfigDict(
        extra="forbid",
    )
    airlines: Count
    """
    Number of entries in airlines.json.
    """
    airframes: Count
    """
    Number of aircraft across all fleets/*.json files.
    """


class Manifest(BaseModel):
    """
    Describes a published dataset: the contract version it follows, what produced it and when, and how complete it is. The app loads this file first and refuses data outside its compatibility line.
    """

    model_config = ConfigDict(
        extra="forbid",
    )
    contract_version: Annotated[
        str,
        Field(
            max_length=32,
            pattern="^(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)$",
        ),
    ]
    """
    Contract version the dataset follows, copied from contract/VERSION. Plain MAJOR.MINOR.PATCH with no pre-release or build suffix.
    """
    producer: Literal["mock", "pipeline"]
    """
    What generated the dataset. mock: the seeded mock generator; pipeline: the data pipeline exporter.
    """
    generated_at: Timestamp
    """
    When the dataset was generated.
    """
    data_as_of: Month
    """
    Latest month the data reflects, e.g. the newest registry snapshot ingested.
    """
    counts: Counts
    """
    Totals across the dataset, for loading indicators and sanity checks. Must match the published files.
    """
    coverage: Coverage | None
    """
    How complete the data is, so the UI can be honest about gaps. Null when coverage was not measured (e.g. mock data).
    """


type SearchLabel = Annotated[
    str, Field(max_length=200, min_length=1, title="SearchLabel")
]
"""
Text shown in the results list, e.g. 'D-AIZA · A320 · Lufthansa' for an aircraft or 'Lufthansa (LH / DLH)' for an airline.
"""


type SearchTerm = Annotated[
    str, Field(max_length=100, min_length=1, pattern="^[^\\s](.*[^\\s])?$")
]


type SearchTerms = Annotated[
    list[SearchTerm], Field(max_length=50, min_length=1, title="SearchTerms")
]
"""
Search terms: at least one, no duplicates, sorted ascending by code point. Each term is 1-100 characters with no leading or trailing whitespace.
"""


class Source(BaseModel):
    """
    One data source, such as a registry snapshot or a photo archive.
    """

    model_config = ConfigDict(
        extra="forbid",
    )
    id: SourceId
    """
    Stable ID referenced by source_ids. Snapshot-based sources include the month (e.g. opensky-2026-08).
    """
    name: Annotated[str, Field(max_length=256, min_length=1)]
    """
    Human-readable name shown in credits.
    """
    url: HttpsUrl | None
    """
    Where the data can be found, or null for sources with no public location (e.g. manual overrides).
    """
    license: LicenseId | None
    """
    License or terms the data is used under, or null when it varies per record (e.g. Wikimedia Commons photos, whose licenses are on each imageRef).
    """
    retrieved_at: Timestamp | None
    """
    When the data was downloaded, or null for sources that aren't downloaded (e.g. manual overrides).
    """


class Sources(BaseModel):
    """
    Every data source that records in the dataset cite through source_ids. Also drives the attribution page.
    """

    model_config = ConfigDict(
        extra="forbid",
    )
    sources: list[Source]
    """
    All sources, sorted by id. IDs must be unique; JSON Schema can't check uniqueness by field, so producers and tests must.
    """


class Airline(BaseModel):
    """
    One airline. Fleet figures describe the fleet as of manifest.data_as_of.
    """

    model_config = ConfigDict(
        extra="forbid",
    )
    id: AirlineId
    """
    Stable pipeline-assigned ID. Use this in URLs and references, never the ICAO or IATA code.
    """
    name: Annotated[str, Field(max_length=256, min_length=1)]
    """
    Display name, e.g. from Wikidata or the cleaned operator name.
    """
    wikidata_qid: WikidataQid | None
    """
    Matching Wikidata item, or null if the airline couldn't be matched.
    """
    icao: IcaoAirlineCode | None
    """
    ICAO designator the airline used, or null if it has none or it is unknown.
    """
    iata: IataAirlineCode | None
    """
    IATA designator the airline used, or null if it has none or it is unknown.
    """
    country: CountryCode | None
    """
    Country the airline is based in, or null if unknown.
    """
    region: Region | None
    """
    Region the airline appears under in the circle pack, or null if unknown. The app groups null regions under 'Unknown'.
    """
    founded: PartialDate | None
    """
    When the airline was founded or started operating, or null if unknown.
    """
    ceased: PartialDate | None
    """
    When the airline stopped operating, or null if it is still operating or the date is unknown.
    """
    successor_id: AirlineId | None
    """
    Airline that took over when this one ceased or merged, or null if there is none or it is unknown.
    """
    logo: ImageRef | None
    """
    Airline logo, or null if none is available.
    """
    fleet_count: Count
    """
    Number of aircraft in the fleet as of manifest.data_as_of. 0 for airlines with no current fleet, such as ceased airlines.
    """
    family_counts: dict[TypeFamily, FamilyCountsAdditionalProperty]
    """
    Fleet size per type family, used to draw family circles before the fleet file loads. Invariant: the values sum to fleet_count. Families with no aircraft are left out, so an airline with fleet_count 0 has {}. Written in ascending key order.
    """


class Airlines(BaseModel):
    """
    Every airline in the dataset, including ones that have ceased, with enough data to lay out the world-level circle pack without loading any fleet. Rules JSON Schema can't check: IDs are unique; successor_id references an airline in this file; every airline with fleet_count > 0 has a fleets/{id}.json file whose aircraft match fleet_count and family_counts.
    """

    model_config = ConfigDict(
        extra="forbid",
    )
    airlines: list[Airline]
    """
    All airlines, sorted by id.
    """


class AircraftSearchDoc(BaseModel):
    """
    An aircraft the user can search for.
    """

    model_config = ConfigDict(
        extra="forbid",
    )
    kind: Literal["aircraft"]
    """
    Document type.
    """
    id: AirframeId
    """
    Airframe the result opens.
    """
    airline_id: AirlineId | None
    """
    Airline whose fleet file lists the aircraft, so selecting the result loads only that fleet. Null if the aircraft isn't in any current fleet.
    """
    label: SearchLabel
    terms: SearchTerms
    """
    Strings the aircraft can be found by: at least its current registration and MSN when known, plus past registrations and ICAO 24-bit addresses (uppercase hex).
    """


class AirlineSearchDoc(BaseModel):
    """
    An airline the user can search for.
    """

    model_config = ConfigDict(
        extra="forbid",
    )
    kind: Literal["airline"]
    """
    Document type.
    """
    id: AirlineId
    """
    Airline the result opens.
    """
    label: SearchLabel
    terms: SearchTerms
    """
    Strings the airline can be found by: at least its name, plus ICAO and IATA codes when known and any former names.
    """


class SearchDocs(BaseModel):
    """
    Raw documents the app indexes for search (label and terms). The app builds the index in the browser, so this file doesn't depend on a search library. Rules JSON Schema can't check: every airline in airlines.json and every aircraft in fleets/*.json has exactly one doc; ids and airline_ids reference existing entries; an aircraft doc's airline_id is the airline whose fleet file lists it.
    """

    model_config = ConfigDict(
        extra="forbid",
    )
    docs: list[AircraftSearchDoc | AirlineSearchDoc]
    """
    All search documents, sorted by kind, then id (ascending). Each (kind, id) pair appears once.
    """


class ContractDocuments(BaseModel):
    """
    Generated from contract/schemas by scripts/bundle.mjs. Index of every stable published document type. Skipped drafts: aircraft.schema.json, fleet-months.schema.json.
    """

    model_config = ConfigDict(
        extra="forbid",
    )
    airlines_json: Annotated[Airlines, Field(alias="airlines.json")]
    fleet_json: Annotated[Fleet, Field(alias="fleet.json")]
    manifest_json: Annotated[Manifest, Field(alias="manifest.json")]
    search_docs_json: Annotated[SearchDocs, Field(alias="search-docs.json")]
    sources_json: Annotated[Sources, Field(alias="sources.json")]
