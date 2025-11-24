// api/coverbox.js

// Your existing Google Apps Script endpoint (the one that already returns
// the big JSON with cover, live, rows, lanes, etc.)
const SOURCE_URL =
  'https://script.google.com/macros/s/AKfycbz8x7Q-UIviJtrpF9_NYdcJnXGakCJRSX9f4FZbLxUxsfgaQBspLK0tFHh12lBGpOY/exec';

export default async function handler(req, res) {
  // ----- CORS so Squarespace can call this from the browser -----
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Fetch from your existing Apps Script endpoint
    const upstreamRes = await fetch(SOURCE_URL, {
      method: 'GET'
      // no extra headers – keeps it a simple request
    });

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text().catch(() => '');
      throw new Error(`Upstream HTTP ${upstreamRes.status} ${text}`);
    }

    const data = await upstreamRes.json();

    // Optional: light caching at the edge (30s) – safe for box scores
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=30');

    // Return the same JSON down to the browser
    res.status(200).json(data);
  } catch (err) {
    console.error('coverbox API error:', err);
    res.status(500).json({
      ok: false,
      error: err.message || 'Internal error in coverbox proxy'
    });
  }
}
