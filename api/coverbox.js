// api/coverbox.js
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz8x7Q-UIviJtrpF9_NYdcJnXGakCJRSX9f4FZbLxUxsfgaQBspLK0tFHh12lBGpOY/exec";

module.exports = async (req, res) => {
  try {
    const upstream = await fetch(APPS_SCRIPT_URL, {
      // don’t let *browser* cache interfere – we control caching at Vercel level
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    const text = await upstream.text();

    res.setHeader("Content-Type", "application/json");
    // 🔴 KEY PART: let Vercel cache this for 60s and serve stale for 120s
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120"
    );

    res.status(upstream.ok ? 200 : upstream.status).send(text);
  } catch (err) {
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=50"
    );
    res.status(500).json({
      ok: false,
      error: String(err),
    });
  }
};
