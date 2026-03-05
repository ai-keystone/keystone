// api/plan.js (CommonJS)
//
// Phase 1 improvements (Vercel-safe + architect minimums):
// - JSON extraction + schema validation (Ajv)
// - domain validation (validatePlanSpec)
// - retry loop with correction prompt
// - normalization
// - IMPORTANT: if attempt 1 times out, DO NOT fail; try attempt 2 within the same request
// - Adds architectural minimum dimension checks so outputs like 16'x3' bathrooms get rejected

const { GoogleGenAI } = require("@google/genai");
const { renderPlanSvg } = require("../lib/renderPlanSvg");
const { validatePlanSpec } = require("../lib/validatePlan");
const { validatePlanSpecSchema } = require("../lib/validateSchema");
const { safeJsonParse } = require("../lib/llmJson");

// ---- helpers ----

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
      r.level = lvl.level;
      if (!r.label && typeof r.name === "string") r.label = r.name; // compatibility if model uses name
    });
  });

  return out;
}

// Speed-focused prompt
function buildPrompt(surveyData, footprint) {
  const openConcept = String(surveyData?.openConcept || "").includes("Open");
  const masterOnL1 = String(surveyData?.masterLocation || "").includes("Level 1");
  const kitchenRear = String(surveyData?.kitchenPlacement || "").includes("Rear");
  const garage = surveyData?.garage && surveyData.garage !== "None" ? String(surveyData.garage) : "None";

  return `
Return JSON ONLY (no markdown, no extra text).

Top-level keys ONLY: stories, totalAreaSqFt, levels
- stories=${footprint.stories}
- totalAreaSqFt=${footprint.totalArea}
- levels length=${footprint.stories}

Each level must include:
- level, width=${footprint.width}, height=${footprint.height}, rooms, doors, windows
- doors: [] , windows: []

Rooms are axis-aligned rectangles with fields:
- id, type, x, y, w, h (all numbers)
- in bounds: x>=0,y>=0,x+w<=width,y+h<=height

MANDATORY tiling:
- For EACH level: sum(w*h) MUST equal EXACTLY ${footprint.width * footprint.height}
- No overlaps. No gaps.

Rules:
- If stories=2: include a "stairs" room on BOTH levels at the same x,y,w,h
- Use "hallway" room(s) to connect spaces.
- Wet core: bathrooms near kitchen.

Preferences:
- openConcept=${openConcept}
- masterOnLevel=${masterOnL1 ? 1 : 2}
- kitchenRear=${kitchenRear}
- garage=${garage}
- features="${(surveyData?.features || "").slice(0, 180)}"

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

// Architectural minimums (Phase 1)
// These stop “legal but nonsense” rectangles.
function getMinRulesForRoom(room) {
  const label = String(room?.label || "").toLowerCase();
  const type = String(room?.type || "").toLowerCase();

  // Defaults (very permissive)
  let minW = 4;
  let minH = 4;
  let minArea = 25;

  // Hallways: should not be 3ft wide
  if (type === "hallway" || label.includes("hall")) {
    minW = 4;
    minH = 6;
    minArea = 40;
  }

  // Bathrooms: avoid 16x3 “strip bathroom”
  if (type === "bathroom" || label.includes("bath")) {
    minW = 5;
    minH = 6;
    minArea = 30;
  }

  // Kitchen / Dining / Living: avoid 16x5 living rooms
  if (type === "kitchen" || label.includes("kitchen")) {
    minW = 7;
    minH = 7;
    minArea = 50;
  }
  if (type === "dining_room" || label.includes("dining")) {
    minW = 7;
    minH = 7;
    minArea = 45;
  }
  if (type === "living_room" || label.includes("living")) {
    minW = 10;
    minH = 10;
    minArea = 110;
  }

  // Bedrooms
  if (type === "bedroom" || label.includes("bedroom")) {
    minW = 9;
    minH = 9;
    minArea = 90;
  }

  // Study / Office / Gaming
  if (label.includes("study") || label.includes("office")) {
    minW = 8;
    minH = 8;
    minArea = 64;
  }
  if (label.includes("gaming")) {
    minW = 10;
    minH = 10;
    minArea = 100;
  }

  // Garage: depends, but keep it reasonable
  if (type === "garage" || label.includes("garage")) {
    minW = 18;
    minH = 18;
    minArea = 300;
  }

  // Stairs should not be tiny
  if (type === "stairs" || label.includes("stair")) {
    minW = 5;
    minH = 8;
    minArea = 40;
  }

  return { minW, minH, minArea };
}

function collectArchitectMinErrors(planSpec) {
  const errs = [];
  const levels = Array.isArray(planSpec?.levels) ? planSpec.levels : [];

  for (const lvl of levels) {
    const rooms = Array.isArray(lvl?.rooms) ? lvl.rooms : [];
    for (const r of rooms) {
      const w = Number(r.w);
      const h = Number(r.h);
      const area = w * h;

      if (!Number.isFinite(w) || !Number.isFinite(h)) continue;

      const { minW, minH, minArea } = getMinRulesForRoom(r);

      // also prevent extremely skinny rooms even if area passes
      const skinny = Math.min(w, h) < 3;

      if (w < minW || h < minH || area < minArea || skinny) {
        const name = r.label || r.type || r.id;
        errs.push(
          `Logic: Level ${lvl.level} room "${name}" too small/skinny (${w}x${h}=${area}). Minimum about ${minW}x${minH} and area>=${minArea}. Avoid strips.`
        );
      }
    }
  }

  return errs;
}

function collectAllErrors(planSpec, surveyData) {
  const schema = validatePlanSpecSchema(planSpec);
  const domain = validatePlanSpec(planSpec, surveyData);

  const out = [];
  if (!schema.valid) out.push(...schema.errors.map((e) => `Schema: ${e}`));
  if (Array.isArray(domain) && domain.length) out.push(...domain.map((e) => `Logic: ${e}`));

  // Enforce exact area fill per level
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

  // Architectural minimums
  out.push(...collectArchitectMinErrors(planSpec));

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

    // Keep history small (big payload = slow)
    let contents = Array.isArray(chatHistory) ? [...chatHistory] : [];
    if (contents.length > 3) contents = contents.slice(contents.length - 3);

    contents.push({ role: "user", parts: [{ text: prompt }] });

    const maxAttempts = 2;
    const perAttemptTimeoutMs = 55000; // 55s (cold starts can be slow)

    let lastModelText = "";
    let planSpec = null;
    let errors = [];
    let lastAttemptError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let result;
      try {
        result = await withTimeout(
          ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents,
            config: {} // speed-focused
          }),
          perAttemptTimeoutMs,
          `Gemini generateContent (attempt ${attempt})`
        );
      } catch (e) {
        // IMPORTANT: if attempt 1 times out, try attempt 2 in the same request
        lastAttemptError = e;
        if (attempt < maxAttempts && String(e?.message || "").includes("timed out after")) {
          continue;
        }
        throw e;
      }

      lastModelText = result?.text || "";

      const parsed = safeJsonParse(lastModelText);
      if (!parsed.ok) {
        errors = [`Parse: ${parsed.error}`];
      } else {
        planSpec = normalizePlanSpec(parsed.value, footprint);
        errors = collectAllErrors(planSpec, surveyData);
      }

      if (!errors.length) break;

      if (attempt < maxAttempts) {
        const prevJson = planSpec || (parsed && parsed.value) || {};
        const correctionPrompt = buildCorrectionPrompt(prevJson, errors, footprint);
        contents.push({ role: "model", parts: [{ text: lastModelText }] });
        contents.push({ role: "user", parts: [{ text: correctionPrompt }] });
      }
    }

    if (!planSpec || errors.length) {
      const msg = lastAttemptError ? String(lastAttemptError.message || "") : "";
      const timedOut = msg.includes("timed out after");

      return res.status(timedOut ? 504 : 422).json({
        success: false,
        message: timedOut
          ? "Model timed out. Try again (cold starts can be slow)."
          : "Failed to produce a valid plan within serverless limits",
        errors,
        rawModelText: lastModelText
      });
    }

    const svgString = renderPlanSvg(planSpec);

    // keep response history compact
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