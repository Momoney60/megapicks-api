// api/weekly.js
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwz0dcABUQvWSnKq5voIAH4pgzBttHxsH55ViBJAefa2YPOQfVSneUkC3RB6gb22-ptxg/exec"; // keep whatever you already used

module.exports = async (req, res) => {
  try {
    const upstream = await fetch(APPS_SCRIPT_URL, {
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    const text = await upstream.text();

    res.setHeader("Content-Type", "application/json");
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
