# Festinest Data Model

_Last updated: Oct 2025_

## Collections Overview

### rtists

`json
{
  "id": "fred-again",
  "name": "Fred again..",
  "genres": ["EDM", "House"],
  "photoUrl": "https://...",
  "socials": {
    "spotify": "https://...",
    "instagram": "https://..."
  },
  "updatedAt": "2025-10-17T00:00:00.000Z"
}
`

### estivals

`json
{
  "id": "electric-forest-2025",
  "name": "Electric Forest 2025",
  "lineup": [
    {
      "artistId": "fred-again",
      "stage": "Ranch Arena",
      "day": "Thursday",
      "time": "22:30"
    }
  ],
  "schedule": [
    {
      "day": "Thursday",
      "stage": "Ranch Arena",
      "time": "22:30",
      "artistId": "fred-again"
    }
  ]
}
`

Each lineup/schedule entry references an artist by rtistId and keeps any critical metadata (stage, day, 	ime). Optional denormalised fields such as rtistName can be stored for fast reads, but the canonical profile lives in rtists.

### estivalAttendees

`json
{
  "id": "coachella-2026_sabrina-carpenter",
  "festivalId": "coachella-2026",
  "artistId": "sabrina-carpenter",
  "goingCount": 1243,
  "updatedAt": "2025-10-17T00:00:00.000Z"
}
`

Each document tracks opt-in attendance interest for a festival/artist pairing and can power social proof (e.g., "35 friends are going").

## Why split artists from festivals?

| Benefit | Detail |
| --- | --- |
| Global artist updates | Edit a single artist record to refresh every festival lineup. |
| Shorter festival documents | Lineup entries shrink to id + slot metadata, reducing transfer and Firestore document size. |
| Unlock new features | Enables artist search, "which fests feature X", following tours, fav genres, and Spotify/preview integrations. |
| Cost efficiency | De-duplicates repeated artist payloads across the ~100+ 2025-2026 festivals. |

## Trade-offs

- Seeder must ensure referenced artists exist (rtists first, then estivals).
- Client code needs a resolver (e.g., hook or cache) to map rtistId to artist details.
- Analytics / "people going" features require aggregations keyed by estivalId + rtistId.

## Seeder Workflow

1. Store artist JSON files in data/artists/*.json. Each file should include id, 
ame, and any optional fields.
2. Store festival JSON files in data/festivals/*.json, referencing artists via rtistId.
3. Store attendance JSON files in data/attendance/*.json to seed estivalAttendees rollups.
4. Run 
pm run seed:festivals (see README). The script now:
   - Upserts rtists before estivals.
   - Normalises id, updatedAt, and derived genre fields.
   - Batches writes (<=400 per batch) to stay under Firestore limits.
   - Emits warnings when a lineup/schedule slot is missing rtistId, day, stage, or 	ime, or if the rtistId does not match an artist JSON file.
5. Validate Firestore: confirm every estival.lineup[].artistId has a matching artist document and review any warnings printed during seeding.

## Product Recommendations

| Scenario | Recommendation |
| --- | --- |
| User favourites, genre recommendations, tour search | ✅ Use the artists collection so user follow lists and recommendations stay consistent. |
| Scaling to 100+ festivals across 2025-2026 | ✅ Use the artists collection to keep document sizes predictable. |
| Reducing Firestore costs via de-duplication | ✅ Artists collection minimises redundant data writes. |

## Next Steps

1. Surface artist metadata (genres, socials) in lineup and schedule UI via the shared useArtistsCatalog hook.
2. Persist "I'm going" counts as estivalAttendees/{festivalId}/{artistId} documents to support social proof.
3. Add a CLI flag to the seeder for dry-run validation without writing.
