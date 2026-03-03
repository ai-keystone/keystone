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
    const stories = String(surveyData.stories).includes("2") ? 2 : 1;

    const prompt = `
You are a Senior Architect. Output ONLY valid JSON for a floor plan.
Target Total Area: ${targetArea} sq ft. Stories: ${stories}.

**RULES:**
- Sum of all levels MUST equal approx ${targetArea}.
- If Shape is "Square": W and H must be roughly equal.
- If Shape is "Rectangular": W must be at least 1.5x H.
- Level 1 MUST have an "ENTRY" and "STAIRS". 
- Level 2 MUST have "STAIRS" at the same spot as Level 1.
- Every room MUST have a label and dimensions.

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
    const svgString = renderPlanSvg(planSpec);

    return res.status(200).json({
      success: true,
      planSpec,
      svg: svgString,
      chatHistory: [...contents, { role: "model", parts: [{ text: JSON.stringify(planSpec) }] }]
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};