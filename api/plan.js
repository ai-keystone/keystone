// api/plan.js (CommonJS)
const { GoogleGenAI } = require("@google/genai");
const { renderPlanSvg } = require("../lib/renderPlanSvg");
const { svgToPngBase64 } = require("../lib/svgToPng");

function extractJson(text) {
  if (!text) return null;
  let t = String(text).trim().replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = t.indexOf("{");
  const lastBrace = t.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) t = t.slice(firstBrace, lastBrace + 1);
  return t;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  
  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);

    const { surveyData, chatHistory = [] } = body;
    if (!surveyData) return res.status(400).json({ success: false, message: "Missing surveyData" });

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    const totalArea = Number(surveyData.totalArea) || 2500;
    const stories = String(surveyData.stories).includes("2") ? 2 : 1;
    const shape = surveyData.shape || "Rectangular";
    const garage = surveyData.garage || "None";
    
    // Updated Prompt with STRICT Layout Logic
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
1. **STAIRS (Vital):** If Stories = 2, you MUST place a room with id "stairs" on Level 1 AND Level 2. They MUST have the exact same x,y,w,h coordinates.
2. **ENTRANCE:** Level 1 MUST have an "Entry" or "Foyer" room.
3. **GARAGE:** If Garage requested, place it on Level 1. It needs a large dimensions (e.g. 20x20).
4. **DOORS & ORIENTATION:**
   - Every room must have at least one door connecting to a Hall or another room.
   - **Main Entry Door:** Place a door on the exterior wall of the Foyer.
   - **Garage Door:** Place a door on the exterior wall of the Garage.
   - **Orientation (dir):** 
     - If the door is on a Left/Right wall, set "dir": "vertical".
     - If the door is on a Top/Bottom wall, set "dir": "horizontal".

**JSON STRUCTURE:**
- Use "levels": [ { "level": 1, ... }, { "level": 2, ... } ]
- Ensure "level" key is present in each level object.

OUTPUT JSON ONLY.
    `.trim();

    let contents = [...chatHistory];
    contents.push({ role: "user", parts: [{ text: prompt }] });

    // Using gemini-2.0-flash because it follows complex logic (stairs/coordinates) better than 3-flash-preview
    // If you prefer 3-flash, change string below.
    const textResp = await ai.models.generateContent({
      model: "gemini-2.0-flash", 
      contents: contents
    });

    const raw = extractJson(textResp?.text);
    if (!raw) return res.status(500).json({ success: false, message: "Empty AI response" });

    let planSpec;
    try {
      planSpec = JSON.parse(raw);
    } catch (e) {
      return res.status(500).json({ success: false, message: "Invalid JSON structure." });
    }

    // Unwrapper
    if (planSpec.planSpec) planSpec = planSpec.planSpec;
    else if (planSpec.plan) planSpec = planSpec.plan;

    // Safety: Ensure levels exist
    if (!planSpec.levels || !Array.isArray(planSpec.levels)) {
       return res.status(500).json({ success: false, message: "AI failed to generate levels." });
    }

    // Safety: Inject level numbers if missing
    planSpec.levels.forEach((lvl, i) => {
        if (!lvl.level) lvl.level = i + 1;
    });

    const svg = renderPlanSvg(planSpec);
    if (!svg) return res.status(500).json({ success: false, message: "SVG Render failed" });

    const planImageBase64 = await svgToPngBase64(svg, 1600);

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
    console.error("Plan API Error:", err);
    return res.status(500).json({ success: false, message: err?.message || "Server Error" });
  }
};