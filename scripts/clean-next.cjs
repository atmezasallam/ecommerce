/**
 * Remove `.next` so `next dev` is not mixed with stale `next build` output.
 * Fixes 404s on /_next/static/chunks/main-app.js and similar in development.
 */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", ".next");
try {
  fs.rmSync(dir, { recursive: true, force: true });
  console.log("[clean-next] Removed .next");
} catch {
  // ignore if missing or locked
}
