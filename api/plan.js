// api/plan.js (CommonJS)
//
// Phase 1 improvements (Vercel-safe):
// - JSON extraction + schema validation (Ajv)
// - domain validation (validatePlanSpec)
// - retry once with a correction prompt (min changes)
// - normalization for missing fields
// - hardened for Vercel: short prompt + 2 attempts + 45s per attempt timeout

const { GoogleGenAI } = require("@google/genai");
const { renderPlanSvg } = require("../lib/renderPlanSvg");
const { validatePlanSpec } = require("../lib/validatePlan");
const { validatePlanSpecSchema } = require("../lib/validateSchema");
const { safeJsonParse } = require("../lib/llmJson");

// ---- small helpers ----

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function withTimeout(promise, ms, label = "operation") {
  let t;
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(t);
  }
}

function computeFootprint(surveyData) {
  const totalArea = Number(surveyData?.totalArea) || 2000;
  const stories = String(surveyData?.stories || "1 Story").includes("2") ? 2 : 1;
  const areaPerLevel = Math.floor(totalArea / stories);

  const shape = String(surveyData?.shape || "Rectangle");
  const w =
    shape === "Square"
      ? Math.floor(Math.sqrt(areaPerLevel))
      : Math.floor(Math.sqrt(areaPerLevel * 1.8));
  const h = Math.floor(areaPerLevel / w);

  return { totalArea, stories, areaPerLevel, width: w, height: h };
}

function normalizePlanSpec(planSpec, footprint) {
  const out = planSpec && typeof planSpec === "object" ? planSpec : {};

  out.stories = Number.isFinite(out.stories) ? out.stories : footprint.stories;
  if (!Number.isFinite(out.totalAreaSqFt)) out.totalAreaSqFt = footprint.totalArea;

  if (!Array.isArray(out.levels)) out.levels = [];
  out.levels.forEach((lvl, idx) => {
    if (!lvl || typeof lvl !== "object") return;

    if (!Number.isFinite(lvl.level)) lvl.level = idx + 1;
    if (!Number.isFinite(lvl.width)) lvl.width = footprint.width;
    if (!Number.isFinite(lvl.height)) lvl.height = footprint.height;

    if (!Array.isArray(lvl.rooms)) lvl.rooms = [];
    if (!Array.isArray(lvl.doors)) lvl.doors = [];
    if (!Array.isArray(lvl.windows)) lvl.windows = [];

    lvl.rooms.forEach((r, rIdx) => {
      if (!r || typeof r !== "object") return;
      if (!r.id) r.id = `r${idx + 1}_${rIdx + 1}`;
      if (!r.type) r.type = "room";
      if (!Number.isFinite(r.x)) r.x = 0;
      if (!Number.isFinite(r.y)) r.y = 0;
      if (!Number.isFinite(r.w)) r.w = 1;
      if (!Number.isFinite(r.h)) r.h = 1;
      r.level = lvl.level; // keep validator happy
    });
  });

  return out;
}

// Short, speed-focused prompt.
// (Long prompts + "thinking=high" are what usually causes Vercel timeouts.)
function buildPrompt(surveyData, footprint) {
  const openConcept = String(surveyData?.openConcept || "").includes("Open");
  const masterOnL1 = String(surveyData?.masterLocation || "").includes("Level 1");
  const kitchenRear = String(surveyData?.kitchenPlacement || "").includes("Rear");
  const garage = surveyData?.garage && surveyData.garage !== "None" ? String(surveyData.garage) : "None";

  return `
Return JSON ONLY (no markdown, no extra text).

Top-level keys ONLY: stories, totalAreaSqFt, levels
- stories = ${footprint.stories}
- totalAreaSqFt = ${footprint.totalArea}
- levels length = ${footprint.stories}

Each level:
- level (1..stories)
- width=${footprint.width}, height=${footprint.height}
- rooms: array of rectangles that EXACTLY tile the footprint (no overlaps, no gaps)
- doors: []
- windows: []

Each room:
- id, type, x, y, w, h (numbers)
- in bounds: x>=0,y>=0,x+w<=width,y+h<=height

Constraints:
- Area fill: For EACH level, sum(w*h) MUST equal EXACTLY ${footprint.width * footprint.height}.
- If stories=2: include a "stairs" room on BOTH levels at same x,y,w,h.
- Use a "hallway" room if needed so rooms are accessible.
- Group bathrooms near kitchen (wet core).

Preferences:
- openConcept=${openConcept} (if true: living+dining+kitchen should share walls and be adjacent)
- masterOnLevel=${masterOnL1 ? 1 : 2}
- kitchenRear=${kitchenRear}
- garage=${garage}
- features="${(surveyData?.features || "").slice(0, 200)}"

JSON only.
  `.trim();
}

function buildCorrectionPrompt(previousJson, errors, footprint) {
  const errorsText = errors.map((e) => `- ${e}`).join("\n");

  return `
Fix the JSON below with MINIMAL changes and return corrected JSON ONLY.

Rules:
- Top-level keys ONLY: stories, totalAreaSqFt, levels
- stories=${footprint.stories}
- totalAreaSqFt=${footprint.totalArea}
- levels length=${footprint.stories}
- Each level width=${footprint.width} height=${footprint.height}
- Rooms EXACTLY tile the footprint: NO overlaps, NO gaps
- Every room has id,type,x,y,w,h numbers; room.level matches its level

ERRORS:
${errorsText}

JSON TO FIX:
${JSON.stringify(previousJson, null, 2)}

Return JSON only.
  `.trim();
}

function collectAllErrors(planSpec, surveyData) {
  const schema = validatePlanSpecSchema(planSpec);
  const domain = validatePlanSpec(planSpec, surveyData);

  const out = [];
  if (!schema.valid) out.push(...schema.errors.map((e) => `Schema: ${e}`));
  if (Array.isArray(domain) && domain.length) out.push(...domain.map((e) => `Logic: ${e}`));

  if (planSpec?.levels) {
    for (const lvl of planSpec.levels) {
      const sum = Array.isArray(lvl?.rooms)
        ? lvl.rooms.reduce((acc, r) => acc + Number(r.w) * Number(r.h), 0)
        : 0;
      const area = Number(lvl?.width) * Number(lvl?.height);
      if (Number.isFinite(sum) && Number.isFinite(area) && sum !== area) {
        out.push(`Logic: Level ${lvl.level} area mismatch: sumRooms=${sum}, footprint=${area}`);
      }
    }
  }
  return out;
}

// ---- handler ----

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);

    const { surveyData = {}, chatHistory = [] } = body;

    const footprint = computeFootprint(surveyData);
    const prompt = buildPrompt(surveyData, footprint);

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    // Keep history if you want, but don't bloat requests (bloat = slower).
    // We'll keep only the last ~4 messages to reduce latency.
    let contents = Array.isArray(chatHistory) ? [...chatHistory] : [];
    if (contents.length > 4) contents = contents.slice(contents.length - 4);

    contents.push({ role: "user", parts: [{ text: prompt }] });

    const maxAttempts = 2;               // Vercel-safe
    const perAttemptTimeoutMs = 45000;   // 45s per attempt (avoid 20s false timeouts)

    let lastModelText = "";
    let planSpec = null;
    let errors = [];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents,
          config: {} // speed-focused; no thinkingConfig
        }),
        perAttemptTimeoutMs,
        `Gemini generateContent (attempt ${attempt})`
      );

      lastModelText = result?.text || "";

      const parsed = safeJsonParse(lastModelText);
      if (!parsed.ok) {
        errors = [`Parse: ${parsed.error}`];
      } else {
        planSpec = normalizePlanSpec(parsed.value, footprint);
        errors = collectAllErrors(planSpec, surveyData);
      }

      if (!errors.length) break;

      // Retry with correction prompt
      if (attempt < maxAttempts) {
        const prevJson = planSpec || (parsed && parsed.value) || {};
        const correctionPrompt = buildCorrectionPrompt(prevJson, errors, footprint);
        contents.push({ role: "model", parts: [{ text: lastModelText }] });
        contents.push({ role: "user", parts: [{ text: correctionPrompt }] });
      }
    }

    if (!planSpec || errors.length) {
      return res.status(422).json({
        success: false,
        message: "Failed to produce a valid plan within serverless limits",
        errors,
        rawModelText: lastModelText
      });
    }

    const svgString = renderPlanSvg(planSpec);

    // Keep output compact: storing giant contents can slow future requests
    const finalChatHistory = [
      { role: "user", parts: [{ text: prompt }] },
      { role: "model", parts: [{ text: JSON.stringify(planSpec) }] }
    ];

    return res.status(200).json({
      success: true,
      planSpec,
      svg: svgString,
      chatHistory: finalChatHistory
    });
  } catch (err) {
    console.error("PLAN error:", err);
    const msg = String(err?.message || "");
    const isTimeout = msg.includes("timed out after");
    return res.status(isTimeout ? 504 : 500).json({
      success: false,
      message: err.message
    });
  }
};