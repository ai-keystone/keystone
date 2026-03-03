// api/plan.js
const { GoogleGenAI } = require("@google/genai");
const { renderPlanSvg } = require("../lib/renderPlanSvg");

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

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    const targetArea = Number(surveyData.totalArea) || 2000;
    const isSquare = surveyData.shape === "Square";

    const prompt = `
You are a Senior Architect. Output ONLY valid JSON for a floor plan.
Target Total Area: ${targetArea} sq ft (Sum of all levels).

**STRICT MATH:**
- If 2 Stories: (Level 1 Area + Level 2 Area) MUST equal approx ${targetArea}.
- If Shape is "Square": Width and Height must be nearly equal.
- If Shape is "Rectangular": Width MUST be at least 1.5x larger than Height.

**STRICT LAYOUT:**
- Every room MUST have a label (e.g. "BEDROOM 1").
- Level 1 MUST have an "ENTRY" and "STAIRS".
- Level 2 MUST have "STAIRS" at the same coordinates as Level 1.
- Draw clear doors and windows.

JSON Structure: { "levels": [ { "level": 1, "width": 50, "height": 30, "rooms": [...], "doors": [...], "windows": [...] } ] }
    `.trim();

    let contents = [...chatHistory];
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: contents
    });

    const rawJson = extractJson(result?.text);
    const planSpec = JSON.parse(rawJson);

    // Generate SVG string (Fast text operation)
    const svgString = renderPlanSvg(planSpec);

    return res.status(200).json({
      success: true,
      planSpec,
      svg: svgString,
      chatHistory: [...contents, { role: "model", parts: [{ text: JSON.stringify(planSpec) }] }]
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};