# Festinest Tools

This guide explains the lightweight internal tools for generating and saving JSON files used by Festinest. Tools run locally, require no external services, and write into the repo only after strict validation.

## Start the Tool Server

From the repo root:

- `npm run tool:artist` → http://localhost:5173/artist-studio.html
- `npm run tool:festival` → http://localhost:5173/festival-studio.html
- `npm run tool:studio` → same server; open either route above

The server provides two HTML apps under `tools/`:

- `artist-studio.html` – Generate `data/artists/*.json`
- `festival-studio.html` – Generate `data/festivals/*.json`

## Artist JSON Studio

Inputs
- Artist name → auto-slugged to `id` (editable). Diacritics are normalized (e.g., RÜFÜS → rufus).
- Genres → comma‑separated list.
- Photo URL (Commons File page) → Example: `https://commons.wikimedia.org/wiki/File:Rufus_Du_Sol_(29357069668).jpg`
  - From this URL, the tool derives:
    - `photoUrl` (Special:FilePath, `?width=256`)
    - Thumbnails at 64/128/256
    - `image.fileName`
    - `image.wikidataId` as the long integer appearing in the file title (e.g., `29357069668`).
  - `image.source` is set to “Wikimedia Commons” and `image.sourceUrl` to the page URL.
- Author (credit) → shown as “Photo by <author>” or null when empty.
- License & License Link → dropdowns of common Creative Commons variants. When “None / Unknown” is selected, both are saved as null.
- Optional: Spotify & Instagram links.

Actions
- Generate → updates the Preview JSON panel.
- Copy JSON → copies the current JSON to clipboard.
- Download .json → downloads `<id>.json`.
- Save to repo (artists) → writes to `data/artists/<id>.json` if and only if the JSON passes strict validation (required keys, types, thumbnails at 64/128/256, etc.). Otherwise an error is shown and you can download + place manually.

Output shape
- Matches the app/seeder expectation, including `image.thumbnails` and `updatedAt` (current ISO timestamp).

## Festival JSON Studio

Inputs
- Name → auto‑slugged to `id` (editable)
- Location (optional)
- Start/End date (ISO, optional)
- Genres (optional, comma‑separated)
- Lineup → repeated entries with `artistId` (required), and optional `day`, `stage`, `time`

Actions
- Generate / Copy JSON / Download .json / Save to repo (festivals)
- Save validates basic shape before writing to `data/festivals/<id>.json`.

## Notes
- No external network calls are made by the tools; all derivation for artist images is string/URL based.
- The “Save” endpoints refuse to write unless the JSON matches the strict schema used by the app and seeder.
- You can always bypass “Save” by downloading the JSON and placing it manually.

