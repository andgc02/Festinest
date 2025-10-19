Artist Studio — Search, APIs, and Caching

Overview

- Primary search uses Wikidata to find the artist and pull:
  - P18 image (as the canonical photo)
  - P1902 Spotify artist ID → https://open.spotify.com/artist/{id}
  - P2003 Instagram username → https://instagram.com/{username}
  - P136 genres (resolved to English labels)
- We filter results to musicians/bands only via P31 (instance of) and P106 (occupation).
- For each P18 file, we fetch Commons extmetadata to get author/credit and license.
- As a fallback, we search Commons directly and prefer newer files.

APIs used (public, no key required)

- Wikidata
  - Search: wbsearchentities
  - Entities: wbgetentities (claims|labels|descriptions)
- Wikimedia Commons
  - Image metadata: action=query, prop=imageinfo, iiprop=extmetadata|url
  - Thumbnails: Special:FilePath with ?width=64|128|256

Search bias to musicians/bands

- Filter passes when either is true:
  - Instance of (P31) is a musical group/ensemble variant (e.g., Q215380, Q2088357, Q5741069, Q3551672, Q1059984, Q2188189)
  - Occupation (P106) includes a music role (e.g., musician Q639669, singer Q177220, DJ Q483501, rapper Q1028181, singer‑songwriter Q488205, composer Q36834)

Commons fallback sort

- Direct Commons search uses gsrsort=create_timestamp_desc to bias newer uploads.

Caching (client-side, localStorage)

- Wikidata search results: 24h TTL
- Commons search results: 24h TTL
- Commons file extmetadata: 7d TTL

Estimated call volume (per search)

- Wikidata search (1) + getentities (1) + genre label batch (0–1)
- Commons extmetadata for each result (up to the result limit, default 8)
- Typical total per new search: ~5–11 requests
- “Use” action does not add calls (metadata already fetched). Pasting a Commons URL performs one extmetadata call.
- Validate thumbnails loads 3 images (64/128/256) via CDN.

Team usage example

- 5 users × 20 searches/day ≈ 100 searches
- ~11 requests/search worst-case → ~1,100 requests/day total, far below Wikimedia’s soft limits (~200 req/sec). This is safe usage.

Legal and practical notes

- Commons/Wikidata APIs are open and free to use; no license restrictions beyond the image licenses themselves.
- Attribution/credit is required for the image when displayed; the API metadata itself does not require attribution.
- Commercial use is allowed if you follow each image’s license.
- Browsers can’t set a custom User‑Agent. If you later proxy requests via a backend, set something like: Festinest/1.0 (https://festinest.app)

Workflow (recommended)

1. Search for the artist and click “Use” on the best result.
2. If offline, type artist name, paste a Commons File page URL, and click “Validate thumbnails.”
3. Adjust fields if needed; Generate/Save.

