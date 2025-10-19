const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;
const artistHtmlPath = path.resolve(__dirname, 'artist-studio.html');
const festivalHtmlPath = path.resolve(__dirname, 'festival-studio.html');

function send(res, code, body, type = 'text/html; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  // Routing for HTML
  if (req.method === 'GET') {
    if (req.url === '/' || req.url === '/index.html' || req.url.startsWith('/artist-studio.html')) {
      try { return send(res, 200, fs.readFileSync(artistHtmlPath, 'utf8')); } catch (e) { return send(res, 500, `<pre>Failed to read artist tool.\n${e.message}</pre>`); }
    }
    if (req.url.startsWith('/festival-studio.html')) {
      try { return send(res, 200, fs.readFileSync(festivalHtmlPath, 'utf8')); } catch (e) { return send(res, 500, `<pre>Failed to read festival tool.\n${e.message}</pre>`); }
    }
  }

  // JSON body helper
  const readJson = (cb) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try { cb(null, JSON.parse(data || '{}')); } catch (e) { cb(e); }
    });
  };

  // Validation helpers (strict)
  const isString = (v) => typeof v === 'string' && v.length > 0;
  const isNullableString = (v) => v === null || isString(v);
  const isStringArray = (a) => Array.isArray(a) && a.every((x) => typeof x === 'string' && x.length > 0);

  const validateArtist = (obj) => {
    if (!obj || typeof obj !== 'object') return 'Root must be an object';
    const { id, name, genres, photoUrl, image, socials, updatedAt } = obj;
    if (!isString(id)) return 'id is required';
    if (!isString(name)) return 'name is required';
    if (!isStringArray(genres)) return 'genres must be non-empty strings';
    if (!isString(photoUrl)) return 'photoUrl is required';
    if (!image || typeof image !== 'object') return 'image is required';
    const { source, sourceUrl, credit, license, licenseUrl, wikidataId, fileName, thumbnails } = image;
    if (!(isString(source) || source === undefined)) return 'image.source must be string';
    if (sourceUrl !== undefined && !isString(sourceUrl)) return 'image.sourceUrl must be string';
    if (!isNullableString(credit)) return 'image.credit must be string or null';
    if (!isNullableString(license)) return 'image.license must be string or null';
    if (!isNullableString(licenseUrl)) return 'image.licenseUrl must be string or null';
    if (wikidataId !== undefined && !isString(wikidataId)) return 'image.wikidataId must be string';
    if (!isString(fileName)) return 'image.fileName is required';
    if (!thumbnails || typeof thumbnails !== 'object') return 'image.thumbnails required';
    if (![ '64','128','256' ].every((k)=> isString(thumbnails[k]))) return 'thumbnails must have 64/128/256 URLs';
    if (!updatedAt || !isString(updatedAt)) return 'updatedAt required';
    if (socials && typeof socials === 'object') {
      const allowed = [ 'spotify', 'instagram' ];
      for (const k of Object.keys(socials)) { if (!allowed.includes(k) || !isString(socials[k])) return 'socials keys invalid'; }
    }
    return null;
  };

  const validateFestival = (obj) => {
    if (!obj || typeof obj !== 'object') return 'Root must be an object';
    if (!isString(obj.id)) return 'id is required';
    if (!isString(obj.name)) return 'name is required';
    if (obj.location !== undefined && !isString(obj.location)) return 'location must be string';
    if (obj.startDate !== undefined && !isString(obj.startDate)) return 'startDate must be string (ISO)';
    if (obj.endDate !== undefined && !isString(obj.endDate)) return 'endDate must be string (ISO)';
    if (obj.genres && !isStringArray(obj.genres)) return 'genres must be string[]';
    const checkEntries = (arr, label) => Array.isArray(arr) && arr.every((e)=> isString(e.artistId) && (e.stage===undefined || isString(e.stage)) && (e.day===undefined || isString(e.day)) && (e.time===undefined || isString(e.time))) || !arr || `Invalid ${label}`;
    const v1 = checkEntries(obj.lineup, 'lineup'); if (typeof v1 === 'string') return v1;
    const v2 = checkEntries(obj.schedule, 'schedule'); if (typeof v2 === 'string') return v2;
    return null;
  };

  // Save endpoints
  if (req.method === 'POST' && req.url === '/api/save-artist') {
    return readJson((err, data) => {
      if (err) return send(res, 400, JSON.stringify({ error: 'Invalid JSON body' }), 'application/json');
      const reason = validateArtist(data);
      if (reason) return send(res, 422, JSON.stringify({ error: reason }), 'application/json');
      const dest = path.resolve(__dirname, '../data/artists', `${data.id}.json`);
      try {
        fs.writeFileSync(dest, JSON.stringify(data, null, 2));
        return send(res, 200, JSON.stringify({ ok: true, path: dest }), 'application/json');
      } catch (e) {
        return send(res, 500, JSON.stringify({ error: e.message }), 'application/json');
      }
    });
  }

  if (req.method === 'POST' && req.url === '/api/save-festival') {
    return readJson((err, data) => {
      if (err) return send(res, 400, JSON.stringify({ error: 'Invalid JSON body' }), 'application/json');
      const reason = validateFestival(data);
      if (reason) return send(res, 422, JSON.stringify({ error: reason }), 'application/json');
      const dest = path.resolve(__dirname, '../data/festivals', `${data.id}.json`);
      try {
        fs.writeFileSync(dest, JSON.stringify(data, null, 2));
        return send(res, 200, JSON.stringify({ ok: true, path: dest }), 'application/json');
      } catch (e) {
        return send(res, 500, JSON.stringify({ error: e.message }), 'application/json');
      }
    });
  }

  send(res, 404, '<h1>Not Found</h1>');
});

server.listen(PORT, () => {
  console.log(`Artist/Festival JSON Studio running at http://localhost:${PORT}`);
  console.log(' - Artist:   /artist-studio.html');
  console.log(' - Festival: /festival-studio.html');
});
