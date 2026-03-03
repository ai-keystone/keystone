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
1 Unit = 1 Foot.

**STRICT RULES:**
1. **FOOTPRINT:** Every level must have a "width" and "height" that reflects the outer shell.
2. **ROOMS:** Every level MUST contain multiple rooms (Living, Kitchen, Beds, Hallways) that fill the footprint.
3. **LABELS:** Every room object MUST have a "label" (e.g. "BEDROOM") and "type".
4. **COORDINATES:** Rooms must have valid x, y, w, h that are NOT zero.
5. **GEOMETRY:** If Shape is "Square", w/h ratio is 1:1. If "Rectangular", w/h ratio is at least 1.5:1.

JSON Structure: { "levels": [ { "level": 1, "width": 50, "height": 30, "rooms": [...], "doors": [...], "windows": [...] } ] }
    `.trim();

    let contents = [...chatHistory];
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: contents,
      config: { thinkingConfig: { thinkingLevel: "high" } }
    });

    const rawJson = extractJson(result?.text);
    const planSpec = JSON.parse(rawJson);
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