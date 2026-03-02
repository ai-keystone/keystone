// api/plan.js (CommonJS)
module.exports.config = { runtime: "nodejs" };

const { GoogleGenAI } = require("@google/genai");
const { validatePlanSpec } = require("../lib/validatePlan");
const { renderPlanSvg } = require("../lib/renderPlanSvg");
const { svgToPngBase64 } = require("../lib/svgToPng");
const planSchema = require("../lib/planSchema.json");

function extractJson(text) {
  if (!text) return null;
  // Remove markdown code fences
  let t = String(text).trim().replace(/```json/gi, "").replace(/```/g, "").trim();
  // Extract first JSON object
  const firstBrace = t.indexOf("{");
  const lastBrace = t.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    t = t.slice(firstBrace, lastBrace + 1);
  }
  return t;
}

module.exports = async function handler(req, res) {
  // 1. CORS Headers
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

    // 2. Initialize AI
    const ai = new GoogleGenAI({ apiKey });

    // 3. Parse Inputs
    const stories = String(surveyData?.stories || "1 Story").includes("2") ? 2 : 1;
    const bedsStr = String(surveyData?.bedrooms || "3 Bed");
    const bathsStr = String(surveyData?.bathrooms || "2 Bath");
    const totalArea = surveyData?.totalArea ? Number(surveyData.totalArea) : 2000;
    
    // Inject user specific requests (e.g., "Porch", "Garage")
    const userFeatures = surveyData?.features || "None"; 

    // 4. "Deep Thinking" Architect Prompt
    const prompt = `
You are a Senior Residential Architect. Design a realistic floor plan.

CLIENT REQUIREMENTS:
- Stories: ${stories}
- Bedrooms: ${bedsStr}
- Bathrooms: ${bathsStr}
- Approx Area: ${totalArea} sq ft
- **SPECIAL REQUESTS:** "${userFeatures}"

**ARCHITECTURAL REASONING:**
1. **Analyze Special Requests:** 
   - If user asks for "Garage", "Porch", "Deck", "Office", you MUST create these specific room types/labels.
   - If "Open Concept", merge Living/Dining/Kitchen logic.

2. **Structure & Logic:**
   - **Stairs:** If Stories=2, place "Stairs" on Level 1 AND Level 2 (same X,Y coordinates so they stack).
   - **Closets:** Every "Bedroom" must have a small attached "Closet" room.
   - **Bathrooms:** Master Bedroom gets an attached Master Bath. Place other baths accessibly.

3. **Openings (Crucial):**
   - **Doors:** POPULATE the "doors" array.
     - Add an "Entry" door on the exterior wall of the Entryway or Living room.
     - Add internal doors between connected rooms (e.g. Hall -> Bedroom).
   - **Windows:** POPULATE the "windows" array.
     - Add windows to exterior walls of Living, Kitchen, and Bedrooms.

4. **Geometry:**
   - Rooms must be rectangular.
   - No overlaps.
   - Ensure a logical overall footprint (e.g., width 40-80, height 40-80).

OUTPUT JSON ONLY.
Schema:
${JSON.stringify(planSchema)}
    `.trim();

    // 5. Generate Plan using gemini-3-flash-preview
    const textResp = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt
    });

    const raw = extractJson(textResp?.text);
    if (!raw) {
      return res.status(500).json({ success: false, message: "AI returned empty plan" });
    }

    let planSpec;
    try {
      planSpec = JSON.parse(raw);
    } catch (e) {
      return res.status(422).json({ success: false, message: "Invalid JSON from AI", raw });
    }

    // 6. Validate & Repair
    // If logic is broken (e.g., missing doors, overlaps), try one repair attempt
    let errors = validatePlanSpec(planSpec, surveyData);
    if (errors.length) {
      const repairPrompt = `
      The floor plan JSON has logic errors:
      ${errors.map(e => `- ${e}`).join("\n")}
      
      Fix the JSON. Keep rooms rectangular and non-overlapping. Ensure "doors" and "windows" arrays are correctly populated.
      
      Schema:
      ${JSON.stringify(planSchema)}
      
      Bad JSON:
      ${JSON.stringify(planSpec)}
      `.trim();

      try {
        const repairResp = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: repairPrompt
        });
        const fixedRaw = extractJson(repairResp?.text);
        if (fixedRaw) {
          planSpec = JSON.parse(fixedRaw);
        }
      } catch (e) {
        console.warn("Repair failed or returned invalid JSON. Proceeding with original attempt.", e);
      }
    }

    // 7. Render SVG -> PNG
    const svg = renderPlanSvg(planSpec, { pxPerUnit: 18, padding: 40, gap: 60 });
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
    return res.status(500).json({ success: false, message: err?.message || "Server Error" });
  }
};