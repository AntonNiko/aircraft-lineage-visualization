# Aircraft data gaps

Everything that can be unknown, being unknown.

- `al-unmatched-operator` couldn't be matched to Wikidata: no QID, codes, country, region (grouped under Unknown), dates or logo.
- Aircraft cover each nullable field on its own and all at once:
  - no photo (all of them)
  - unknown `built` date, which sorts last in its family
  - unknown registration and type code, with family `other` and a serial number containing punctuation (`340A-123` → ID `saab-340-340a123`)
  - unknown `status` and unknown history (`previous_operator_count: null`)
- The search doc for an aircraft with no registration falls back to its serial number in the label.

The airlines, codes, registrations and serial numbers are made up and may coincide with real ones.
