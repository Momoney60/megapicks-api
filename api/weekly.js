// api/weekly.js
// Proxy for Weekly Rankings / "The Chase" leaderboard

export default async function handler(req, res) {
  // ⬇️ PASTE your Weekly Rankings Apps Script web-app URL here (the /exec URL)
  const BACKEND_URL =
    "https://script.google.com/macros/s/AKfycbwz0dcABUQvWSnKq5voIAH4pgzBttHxsH55ViBJAefa2YPOQfVSneUkC3RB6gb22-ptxg/exec";

  // Basic CORS support
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    // Forward any query params (?foo=bar) to Apps Script just in case
    const query = new URLSearchParams(req.query || {}).toString();
    const url = query ? `${BACKEND_URL}?${query}` : BACKEND_URL;

    const upstream = await fetch(url, {
      // disable any caching on Vercel side for live data
      cache: "no-store",
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      res
        .status(upstream.status)
        .json({ ok: false, error: `Upstream HTTP ${upstream.status}`, body: text });
      return;
    }

    const data = await upstream.json();
    res.status(200).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ ok: false, error: err?.message || "Proxy error calling weekly backend" });
  }
}
