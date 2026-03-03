// api/plan.js (CommonJS)
const { GoogleGenAI } = require("@google/genai");
const { renderPlanSvg } = require("../lib/renderPlanSvg");
const { svgToPngBase64 } = require("../lib/svgToPng");

// Helper to extract JSON from AI text
function extractJson(text) {
  if (!text) return null;
  let t = String(text).trim().replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = t.indexOf("{");
  const lastBrace = t.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) t = t.slice(firstBrace, lastBrace + 1);
  return t;
}

module.exports = async function handler(req, res) {
  // 1. Setup Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  
  try {
    // 2. Parse Input
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);

    const { surveyData, chatHistory = [] } = body;
    if (!surveyData) return res.status(400).json({ success: false, message: "Missing surveyData" });

    // 3. Initialize Gemini 3
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    const totalArea = Number(surveyData.totalArea) || 2500;
    const stories = String(surveyData.stories).includes("2") ? 2 : 1;
    const shape = surveyData.shape || "Rectangular";
    const garage = surveyData.garage || "None";
    
    const prompt = `
You are a Senior Architect. Generate a JSON floor plan.
1 Unit = 1 Foot.

**SPECS:**
- Total Area: ~${totalArea} sq ft.
- Stories: ${stories}.
- Shape: ${shape}.
- Garage: ${garage}.
- Features: ${surveyData.features || "None"}

**CRITICAL LAYOUT RULES:**
1. **STAIRS:** If Stories = 2, you MUST place a room with id "stairs" on Level 1 AND Level 2 with identical x,y,w,h.
2. **ENTRANCE:** Level 1 MUST have an "Entry" or "Foyer" room.
3. **DOORS/WINDOWS:** Every room needs at least one door. Use "dir": "horizontal" or "vertical" correctly based on wall orientation.

**JSON STRUCTURE:**
- The root must be an object containing a "levels" array.
- "levels": [ { "level": 1, "width": 50, "height": 40, "rooms": [...], "doors": [...], "windows": [...] } ]

OUTPUT VALID JSON ONLY. NO MARKDOWN.
    `.trim();

    // 4. Generate Content
    let contents = [...chatHistory];
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: contents
    });

    const rawJson = extractJson(result?.text);
    if (!rawJson) throw new Error("AI failed to return a JSON string.");

    // 5. Parse and Process PlanSpec
    let planSpec = JSON.parse(rawJson);

    // Auto-Unwrap if AI nested it
    if (planSpec.planSpec) planSpec = planSpec.planSpec;
    else if (planSpec.plan) planSpec = planSpec.plan;

    // Safety checks
    if (!planSpec.levels || !Array.isArray(planSpec.levels)) {
      throw new Error("AI JSON missing 'levels' array.");
    }

    // Ensure level numbers are set
    planSpec.levels.forEach((lvl, i) => {
      if (!lvl.level) lvl.level = i + 1;
    });

    // 6. Visual Rendering
    const svg = renderPlanSvg(planSpec);
    if (!svg) throw new Error("SVG Generation failed.");

    const planImageBase64 = await svgToPngBase64(svg, 1600);

    // 7. Update Memory for next turn
    const newHistory = [
      ...contents,
      { role: "model", parts: [{ text: JSON.stringify(planSpec) }] }
    ];

    return res.status(200).json({
      success: true,
      planSpec,
      planImage: planImageBase64,
      chatHistory: newHistory
    });

  } catch (err) {
    console.error("Plan API Final Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
  }
};