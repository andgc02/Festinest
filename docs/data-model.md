# Festinest Data Model

_Last updated: Oct 2025_

## Collections Overview

### `artists`

```json
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
```

### `festivals`

```json
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
```

Each lineup/schedule entry references an artist by `artistId` and keeps any critical metadata (`stage`, `day`, `time`). Optional denormalised fields such as `artistName` can be stored for fast reads, but the canonical profile lives in `artists`.

## Why split artists from festivals?

| Benefit | Detail |
| --- | --- |
| Global artist updates | Edit a single artist record to refresh every festival lineup. |
| Shorter festival documents | Lineup entries shrink to id + slot metadata, reducing transfer and Firestore document size. |
| Unlock new features | Enables artist search, "which fests feature X", following tours, fav genres, and Spotify/preview integrations. |
| Cost efficiency | De-duplicates repeated artist payloads across the ~100+ 2025-2026 festivals. |

## Trade-offs

- Seeder must ensure referenced artists exist (`artists` first, then `festivals`).
- Client code needs a resolver (e.g., hook or cache) to map `artistId` to artist details.
- Analytics / "people going" features require aggregations keyed by `festivalId` + `artistId`.

## Seeder Workflow

1. Store artist JSON files in `data/artists/*.json`. Each file should include `id`, `name`, and any optional fields.
2. Store festival JSON files in `data/festivals/*.json`, referencing artists via `artistId`.
3. Run `npm run seed:festivals` (see README). The script now:
   - Upserts `artists` before `festivals`.
   - Normalises `id`, `updatedAt`, and derived `genre` fields.
   - Batches writes (<=400 per batch) to stay under Firestore limits.
   - Emits warnings when a lineup/schedule slot is missing `artistId`, `day`, `stage`, or `time`, or if the `artistId` does not match an artist JSON file.
4. Validate Firestore: confirm every `festival.lineup[].artistId` has a matching artist document and review any warnings printed during seeding.

## Product Recommendations

| Scenario | Recommendation |
| --- | --- |
| User favourites, genre recommendations, tour search | ✅ Use the artists collection so user follow lists and recommendations stay consistent. |
| Scaling to 100+ festivals across 2025-2026 | ✅ Use the artists collection to keep document sizes predictable. |
| Reducing Firestore costs via de-duplication | ✅ Artists collection minimises redundant data writes. |

## Next Steps

1. Surface artist metadata (genres, socials) in lineup and schedule UI via the shared `useArtistsCatalog` hook.
2. Persist "I'm going" counts as `festivalAttendees/{festivalId}/{artistId}` documents to support social proof.
3. Add a CLI flag to the seeder for dry-run validation without writing.
