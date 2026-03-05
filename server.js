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