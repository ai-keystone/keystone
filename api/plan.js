// api/plan.js
module.exports.config = { runtime: "nodejs" };

const { GoogleGenAI } = require("@google/genai");
const { validatePlanSpec } = require("../lib/validatePlan");
const { renderPlanSvg } = require("../lib/renderPlanSvg");
const { svgToPngBase64 } = require("../lib/svgToPng");
const planSchema = require("../lib/planSchema.json");

function extractJson(text) {
  if (!text) return null;

  // Remove code fences if present
  let t = String(text).trim().replace(/```json/gi, "").replace(/```/g, "").trim();

  // If the model returns extra text around JSON, extract first {...} block
  const firstBrace = t.indexOf("{");
  const lastBrace = t.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    t = t.slice(firstBrace, lastBrace + 1);
  }

  return t;
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method Not Allowed" });

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: "Missing GOOGLE_API_KEY" });

    const { surveyData } = req.body || {};
    if (!surveyData || typeof surveyData !== "object") {
      return res.status(400).json({ success: false, message: "Missing surveyData" });
    }

    const ai = new GoogleGenAI({ apiKey });

    // --- PARSE INPUTS ---
    const stories = String(surveyData?.stories || "1 Story").includes("2") ? 2 : 1;
    const bedsStr = String(surveyData?.bedrooms || "3");
    const bathsStr = String(surveyData?.bathrooms || "2");
    const totalArea = surveyData?.totalArea ? Number(surveyData.totalArea) : 2000;
    
    // Crucial: Pass the raw user features text (e.g., "I want a wrap around porch and a garage")
    const userFeatures = surveyData?.features || "None"; 

    // --- CHAIN OF THOUGHT PROMPT ---
    const prompt = `
You are a Senior Residential Architect. Design a detailed floor plan based on these Client Requirements.

CLIENT DATA:
- Stories: ${stories}
- Bedrooms: ${bedsStr}
- Bathrooms: ${bathsStr}
- Approx Area: ${totalArea} sq ft
- **SPECIAL REQUESTS:** "${userFeatures}"

**ARCHITECTURAL LOGIC & THINKING PROCESS:**
1. **Analyze Special Requests:** 
   - If the user mentioned "Garage", "Porch", "Deck", "Office", or "Study", you MUST create specific Room objects for these.
   - If "Open Concept", merge Living/Dining/Kitchen areas.

2. **Structural Rules:**
   - **Stairs:** If Stories = 2, you MUST place a "Stairs" room on Level 1 AND Level 2. They should be in roughly the same X/Y position to align vertically.
   - **Closets:** Every "Bedroom" MUST have a small attached "Closet" room.
   - **Bathrooms:** Ensure the Master Bedroom has an attached Master Bath. Place other baths accessibly.

3. **Openings (Doors & Windows):**
   - **Doors:** You MUST populate the "doors" array.
     - Place "Entry" door on the exterior wall of the Foyer/Living room.
     - connect adjacent rooms (e.g., Hall -> Bedroom) with doors on shared walls.
   - **Windows:** You MUST populate the "windows" array.
     - Add windows to exterior walls of Living, Dining, Kitchen, and Bedrooms.

4. **Geometry:**
   - Keep rooms rectangular.
   - Do not overlap rooms.
   - Ensure the total footprint fits within a logical boundary (e.g., 60x40 units).

OUTPUT:
Return ONLY valid JSON matching this schema exactly.
${JSON.stringify(planSchema)}
    `.trim();

    // 1) Generate PlanSpec JSON
    // We use a "flash" model for speed, but instructions are strict enough for logic.
    // If you have access to "gemini-1.5-pro", use that for even better logic.
    const textResp = await ai.models.generateContent({
      model: "gemini-1.5-flash", 
      contents: prompt
    });

    const raw = extractJson(textResp?.text);
    if (!raw) {
      return res.status(500).json({ success: false, message: "Model returned empty plan spec" });
    }

    let planSpec;
    try {
      planSpec = JSON.parse(raw);
    } catch (e) {
      return res.status(422).json({
        success: false,
        message: "Plan JSON parse failed",
        error: e?.message || String(e),
        raw: raw.slice(0, 2000)
      });
    }

    // 2) Validate + Repair
    let errors = validatePlanSpec(planSpec, surveyData);

    if (errors.length) {
      console.log("Validation Errors:", errors);
      
      const repairPrompt = `
Your floor plan JSON had logic errors:
${errors.map((e) => `- ${e}`).join("\n")}

Please fix the JSON. 
- Ensure rooms do not overlap.
- Ensure all required "doors" are present.
- Ensure "windows" are present on exterior walls.
- Keep the structure valid JSON.

Schema:
${JSON.stringify(planSchema)}

Bad JSON:
${JSON.stringify(planSpec)}
      `.trim();

      const repairResp = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: repairPrompt
      });

      const fixedRaw = extractJson(repairResp?.text);
      if (fixedRaw) {
        try {
          const fixedSpec = JSON.parse(fixedRaw);
          // Only accept fix if it parses, otherwise keep original (best effort)
          planSpec = fixedSpec; 
        } catch (e) {
          console.error("Repair parse failed", e);
        }
      }
    }

    // 3) Render SVG -> PNG
    const svg = renderPlanSvg(planSpec, { pxPerUnit: 18, padding: 24, gap: 48 });
    const planPngBase64 = await svgToPngBase64(svg, 1600);

    return res.status(200).json({
      success: true,
      planSpec,
      planSvg: svg,
      planImage: planPngBase64,
      planMimeType: "image/png"
    });

  } catch (err) {
    console.error("PLAN error:", err);
    return res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
};