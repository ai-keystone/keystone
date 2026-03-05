const express = require("express");

// Your existing Vercel handler:
const planHandler = require("./api/plan.js");

const app = express();

app.use(express.json({ limit: "1mb" }));

// CORS for your Vercel frontend
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

app.get("/health", (req, res) => res.status(200).send("ok"));
app.post("/api/plan", (req, res) => planHandler(req, res));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Cloud Run listening on ${port}`));
app.post("/api/verify", (req, res) => {
  // Your frontend might send { passkey: "..."} or { key: "..."}.
  const passkey = String(req.body?.passkey ?? req.body?.key ?? "").trim();

  // You said your env var name is VALID_PASSKEYS and value is like "KEYSTONE-DEMO"
  const raw = String(process.env.VALID_PASSKEYS || "").trim();
  const valid = raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  if (!raw) {
    return res.status(500).json({
      success: false,
      message: "VALID_PASSKEYS env var is not set on server"
    });
  }

  const ok = valid.includes(passkey);

  return res.status(ok ? 200 : 401).json({
    success: ok,
    message: ok ? "Verified" : "Invalid passkey"
  });
});