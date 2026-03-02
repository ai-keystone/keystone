// api/plan.js (CommonJS)
module.exports.config = { runtime: "nodejs" };

const { GoogleGenAI } = require("@google/genai");
const { renderPlanSvg } = require("../lib/renderPlanSvg");
const { svgToPngBase64 } = require("../lib/svgToPng");
const planSchema = require("../lib/planSchema.json");

function extractJson(text) {
  if (!text) return null;
  let t = String(text).trim().replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = t.indexOf("{");
  const lastBrace = t.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    t = t.slice(firstBrace, lastBrace + 1);
  }
  return t;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method Not Allowed" });

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: "Missing GOOGLE_API_KEY" });

    const { surveyData } = req.body || {};
    if (!surveyData) return res.status(400).json({ success: false, message: "Missing surveyData" });

    const ai = new GoogleGenAI({ apiKey });

    // Parse Inputs
    const stories = String(surveyData?.stories || "1 Story").includes("2") ? 2 : 1;
    const bedsStr = String(surveyData?.bedrooms || "3 Bed");
    const bathsStr = String(surveyData?.bathrooms || "2 Bath");
    const totalArea = surveyData?.totalArea ? Number(surveyData.totalArea) : 2000;
    const userFeatures = surveyData?.features || "None"; 

    const prompt = `
You are a Senior Residential Architect. Design a realistic floor plan.

CLIENT REQUIREMENTS:
- Stories: ${stories}
- Bedrooms: ${bedsStr}
- Bathrooms: ${bathsStr}
- Approx Area: ${totalArea} sq ft
- **SPECIAL REQUESTS:** "${userFeatures}"

**ARCHITECTURAL REASONING:**
1. **Analyze Special Requests:** If user asks for "Garage", "Porch", "Deck", "Office", create these specific rooms. If "Open Concept", merge Living/Dining/Kitchen.
2. **Structure & Logic:**
   - If Stories=2, place "Stairs" on Level 1 AND Level 2 (same X,Y).
   - Every "Bedroom" must have an attached "Closet".
   - Master Bedroom gets an attached Master Bath.
3. **Openings:**
   - POPULATE the "doors" array. Add an "Entry" door. Add internal doors between connected rooms.
   - POPULATE the "windows" array. Add windows to exterior walls of Living, Kitchen, and Bedrooms.
4. **Geometry:** Rooms must be rectangular, no overlaps. Ensure a logical footprint.

OUTPUT JSON ONLY.
Schema:
${JSON.stringify(planSchema)}
    `.trim();

    // Generate Plan - NO REPAIR LOOP to prevent Vercel 60s Timeouts
    const textResp = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt
    });

    const raw = extractJson(textResp?.text);
    if (!raw) return res.status(500).json({ success: false, message: "AI returned empty plan" });

    let planSpec;
    try {
      planSpec = JSON.parse(raw);
    } catch (e) {
      return res.status(422).json({ success: false, message: "Invalid JSON from AI", raw });
    }

    // Render SVG -> PNG
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