// api/plan.js (CommonJS)
const { GoogleGenAI } = require("@google/genai");
const { renderPlanSvg } = require("../lib/renderPlanSvg");
const { svgToPngBase64 } = require("../lib/svgToPng");

function extractJson(text) {
  if (!text) return null;
  // Robust JSON extraction
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
    
    // Architect Prompt - Optimized for Gemini 3.1 Reasoning
    // Architect Prompt - Optimized for speed to prevent Vercel Timeouts
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
1. **STAIRS:** If Stories = 2, you MUST place a room with id "stairs" on Level 1 AND Level 2.
2. **ENTRANCE:** Level 1 MUST have an "Entry" or "Foyer" room.
3. **DOORS:** Every room must have at least one door. Use "dir": "horizontal" or "vertical".

**JSON STRUCTURE:**
- The root object must directly contain a "levels" array. No markdown, no wrappers.
- "levels": [ { "level": 1, "width": 50, "height": 40, "rooms": [...], "doors": [...], "windows": [...] } ]

OUTPUT VALID JSON ONLY.
    `.trim();

    let contents = [...chatHistory];
    contents.push({ role: "user", parts: [{ text: prompt }] });

    // USE FLASH TO PREVENT VERCEL TIMEOUTS
    const textResp = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: contents
    });

    const raw = extractJson(textResp?.text);
    if (!raw) return res.status(500).json({ success: false, message: "Empty AI response" });

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