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
    
    const totalArea = Number(surveyData.totalArea) || 2000;
    const stories = String(surveyData.stories).includes("2") ? 2 : 1;
    const areaPerLevel = Math.floor(totalArea / stories);
    
    // Exact dimensions to prevent "square" default
    const w = surveyData.shape === "Square" ? Math.floor(Math.sqrt(areaPerLevel)) : Math.floor(Math.sqrt(areaPerLevel * 1.8));
    const h = Math.floor(areaPerLevel / w);

    const prompt = `
You are a Senior Architect. Output a JSON floor plan. 1 Unit = 1 Foot.

**LEVEL SPECS:**
- Level Footprint: ${w} ft wide x ${h} ft deep.
- Total Level Area: ${areaPerLevel} sq ft.

**ROOM LAYOUT RULES:**
1. **FULL COVERAGE:** Rooms MUST fill the entire ${w}x${h} footprint. Do not leave empty space.
2. **STRICT KEYS:** Every room object MUST use exactly these keys: "id", "label", "type", "x", "y", "w", "h".
3. **STAIRS:** Place stairs at the same x,y coordinates on Level 1 and Level 2.
4. **LABELS:** Use clear room names (e.g., "MASTER BEDROOM").

**JSON STRUCTURE EXAMPLE:**
{
  "levels": [
    {
      "level": 1,
      "width": ${w},
      "height": ${h},
      "rooms": [
        { "id": "r1", "label": "LIVING ROOM", "type": "living", "x": 0, "y": 0, "w": 20, "h": ${h} }
      ],
      "doors": [],
      "windows": []
    }
  ]
}
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