// api/plan.js (CommonJS)
//
// Phase 1 improvements (Vercel-safe):
// 1) Enforce JSON Schema (Ajv) so malformed outputs are rejected.
// 2) Run domain validation (validatePlanSpec) to catch overlaps/out-of-bounds/etc.
// 3) Retry loop: if invalid, ask the model to minimally correct the JSON using the error list.
// 4) Normalize missing fields (stories/totalAreaSqFt/level numbers/room.level) for consistency.
// 5) Vercel hardening: fewer attempts + no "high thinking" + per-attempt timeout.

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

  // Existing heuristic: square vs rectangle footprint
  const shape = String(surveyData?.shape || "Rectangle");
  const w =
    shape === "Square"
      ? Math.floor(Math.sqrt(areaPerLevel))
      : Math.floor(Math.sqrt(areaPerLevel * 1.8));
  const h = Math.floor(areaPerLevel / w);

  return { totalArea, stories, areaPerLevel, width: w, height: h };
}

function normalizePlanSpec(planSpec, surveyData, footprint) {
  const out = planSpec && typeof planSpec === "object" ? planSpec : {};

  // Required by schema
  out.stories = Number.isFinite(out.stories) ? out.stories : footprint.stories;
  if (!Number.isFinite(out.totalAreaSqFt)) out.totalAreaSqFt = footprint.totalArea;

  // Ensure levels are present and numbered
  if (!Array.isArray(out.levels)) out.levels = [];
  out.levels.forEach((lvl, idx) => {
    if (!lvl || typeof lvl !== "object") return;

    if (!Number.isFinite(lvl.level)) lvl.level = idx + 1;
    if (!Number.isFinite(lvl.width)) lvl.width = footprint.width;
    if (!Number.isFinite(lvl.height)) lvl.height = footprint.height;

    if (!Array.isArray(lvl.rooms)) lvl.rooms = [];
    if (!Array.isArray(lvl.doors)) lvl.doors = [];
    if (!Array.isArray(lvl.windows)) lvl.windows = [];

    // Ensure rooms have required fields + correct level
    lvl.rooms.forEach((r, rIdx) => {
      if (!r || typeof r !== "object") return;
      if (!r.id) r.id = `r${idx + 1}_${rIdx + 1}`;
      if (!r.type) r.type = "room";
      if (!Number.isFinite(r.x)) r.x = 0;
      if (!Number.isFinite(r.y)) r.y = 0;
      if (!Number.isFinite(r.w)) r.w = 1;
      if (!Number.isFinite(r.h)) r.h = 1;
      r.level = lvl.level;
    });
  });

  return out;
}

function buildArchitectPrompt(surveyData, footprint) {
  const openConceptRule = String(surveyData?.openConcept || "").includes("Open")
    ? "PUBLIC ZONE: 'Living', 'Dining', and 'Kitchen' MUST share walls and act as one continuous block."
    : "PUBLIC ZONE: 'Living', 'Dining', and 'Kitchen' should be defined as separate but connected rooms.";

  const masterRule = String(surveyData?.masterLocation || "").includes("Level 1")
    ? "Place the 'Master Bedroom', 'Master Bath', and 'Walk-in Closet' tightly grouped together on LEVEL 1."
    : "Place the 'Master Bedroom', 'Master Bath', and 'Walk-in Closet' tightly grouped together on LEVEL 2.";

  const kitchenRule = String(surveyData?.kitchenPlacement || "").includes("Rear")
    ? "Place the Kitchen towards the top/rear coordinates (y=0)."
    : "Place the Kitchen towards the bottom/front coordinates.";

  const garageRule =
    surveyData?.garage && surveyData.garage !== "None"
      ? `Place "${String(surveyData.garage).toUpperCase()}" on Level 1 as a "garage" type room.`
      : "No garage.";

  return `
You are a Senior Architect. Output ONLY valid JSON. 1 Unit = 1 Foot.

You MUST follow this JSON contract exactly:
- Top-level keys ONLY: stories, totalAreaSqFt, levels
- stories must be ${footprint.stories}
- totalAreaSqFt must be ${footprint.totalArea}
- levels must have EXACTLY ${footprint.stories} items

Each level must include:
- level (1..stories), width, height, rooms, doors, windows

Each room must include:
- id, type, x, y, w, h
- x,y,w,h must be numbers
- Rooms must be axis-aligned rectangles

**USER PREFERENCES (CRITICAL):**
- Layout: ${openConceptRule}
- Primary Suite: ${masterRule}
- Kitchen: ${kitchenRule}
- Garage: ${garageRule}
- Extra Features: "${surveyData?.features || ""}"

**BUILDING CONSTRAINTS (MANDATORY):**
- Each level footprint is: width=${footprint.width} ft, height=${footprint.height} ft.
- Coordinates start at (0,0) in the top-left of the level.
- Every room must be within bounds: x>=0, y>=0, x+w<=width, y+h<=height

**AREA FILL CONSTRAINT (MANDATORY):**
- For EACH level, sum(room.w * room.h) MUST equal EXACTLY ${footprint.width * footprint.height}.
- Fill the footprint completely: no gaps, no overlaps.

**ZONING & ADJACENCY RULES:**
1) WET CORE: Group bathrooms near each other or near the Kitchen.
2) STAIRS: If 2 levels, include a "stairs" type room on BOTH levels at the EXACT same x,y,w,h.
3) CIRCULATION: Use "hallway" rooms so rooms are accessible.

Return JSON ONLY. No markdown. No extra commentary.
  `.trim();
}

function buildCorrectionPrompt(previousJson, errorList, footprint) {
  const errorsText = errorList.map((e) => `- ${e}`).join("\n");

  return `
You produced a PlanSpec JSON, but it failed validation.

Fix it with MINIMAL changes.
Return corrected JSON ONLY (no markdown).

Rules you MUST satisfy:
- Top-level keys ONLY: stories, totalAreaSqFt, levels
- stories = ${footprint.stories}
- totalAreaSqFt = ${footprint.totalArea}
- levels length = ${footprint.stories}
- Each level fills width=${footprint.width}, height=${footprint.height} with NO overlaps and NO gaps.
- All rooms in bounds.
- Every room has id, type, x, y, w, h (numbers).
- room.level must match its level number.

VALIDATION ERRORS:
${errorsText}

PREVIOUS JSON (edit this):
${JSON.stringify(previousJson, null, 2)}

Return corrected JSON only.
  `.trim();
}

function collectAllErrors(planSpec, surveyData) {
  const schema = validatePlanSpecSchema(planSpec);
  const domain = validatePlanSpec(planSpec, surveyData);

  const out = [];
  if (!schema.valid) out.push(...schema.errors.map((e) => `Schema: ${e}`));
  if (Array.isArray(domain) && domain.length) out.push(...domain.map((e) => `Logic: ${e}`));

  // Enforce exact area fill per level (extra safety)
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
    const prompt = buildArchitectPrompt(surveyData, footprint);

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    // Start contents with any prior chat; add our instruction as the latest user message
    let contents = Array.isArray(chatHistory) ? [...chatHistory] : [];
    contents.push({ role: "user", parts: [{ text: prompt }] });

    // Vercel-safe settings:
    const maxAttempts = 2;          // keep low to avoid 60s timeout
    const perAttemptTimeoutMs = 20000; // 20s each; 2 attempts ~ 40s + overhead

    let lastModelText = "";
    let planSpec = null;
    let errors = [];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents,
          // Speed-focused: do NOT use thinkingLevel "high"
          config: {
            // You can optionally uncomment this if you want a bit more reasoning at slight cost:
            // thinkingConfig: { thinkingLevel: "medium" }
          }
        }),
        perAttemptTimeoutMs,
        `Gemini generateContent (attempt ${attempt})`
      );

      lastModelText = result?.text || "";

      const parsed = safeJsonParse(lastModelText);
      if (!parsed.ok) {
        errors = [`Parse: ${parsed.error}`];
      } else {
        planSpec = normalizePlanSpec(parsed.value, surveyData, footprint);
        errors = collectAllErrors(planSpec, surveyData);
      }

      // If no errors, we're done.
      if (!errors.length) break;

      // If more attempts remain, ask for a minimal correction.
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

    // Store the planSpec as the last model message (keeps your UI pattern working)
    const finalChatHistory = [
      ...contents,
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

    // If timeout triggered, return a clearer error for the frontend
    const msg = String(err?.message || "");
    const isTimeout = msg.includes("timed out after");

    return res.status(isTimeout ? 504 : 500).json({
      success: false,
      message: err.message
    });
  }
};