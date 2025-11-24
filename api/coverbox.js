// api/coverbox.js
// Simple Vercel serverless function that proxies to your existing Apps Script JSON

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz8x7Q-UIviJtrpF9_NYdcJnXGakCJRSX9f4FZbLxUxsfgaQBspLK0tFHh12lBGpOY/exec";

module.exports = async (req, res) => {
  try {
    // Forward the request to your Apps Script endpoint
    const upstreamRes = await fetch(APPS_SCRIPT_URL, {
      // Avoid browser/proxy caching between Vercel and Apps Script
      // (we'll control caching from Vercel instead)
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    const text = await upstreamRes.text(); // raw JSON string from Apps Script

    // Set caching for Vercel's edge cache:
    // - s-maxage=15 → serve cached response for 15s
    // - stale-while-revalidate=45 → can serve slightly stale for 45s while refreshing
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=15, stale-while-revalidate=45"
    );

    // Ensure the client sees this as JSON
    res.setHeader("Content-Type", "application/json");

    // Pass through the status code from Apps Script (200, 500, etc.)
    res.status(upstreamRes.status).send(text);
  } catch (err) {
    console.error("Error in /api/coverbox:", err);

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=5, stale-while-revalidate=10"
    );

    res.status(500).send(
      JSON.stringify({
        ok: false,
        error: "Vercel proxy error",
        detail: String(err),
      })
    );
  }
};
