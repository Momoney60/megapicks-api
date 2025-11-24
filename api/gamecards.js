// api/gamecards.js

// Your existing Google Apps Script endpoint for Game Cards.
const SOURCE_URL =
  'https://script.google.com/macros/s/AKfycbySbpfrfHlB9blP32XIpNNGFm6VQ8zMLjxFm3Zw3_zWPMccgzD4-8PnOQ0myCb79Taz/exec';

export default async function handler(req, res) {
  // --- CORS so Squarespace can call this from the browser ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Proxy through to your Apps Script
    const upstreamRes = await fetch(SOURCE_URL, {
      method: 'GET'
    });

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text().catch(() => '');
      throw new Error(`Upstream HTTP ${upstreamRes.status} ${text}`);
    }

    const data = await upstreamRes.json();

    // Light edge cache – adjust if you want tighter/looser
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=20');

    res.status(200).json(data);
  } catch (err) {
    console.error('gamecards API error:', err);
    res.status(500).json({
      ok: false,
      error: err.message || 'Internal error in gamecards proxy'
    });
  }
}
