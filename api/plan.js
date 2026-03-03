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
    const area = Number(surveyData.totalArea) || 2000;
    const isRevision = chatHistory.length > 0;

    const prompt = `
You are a Senior Residential Architect. Output a high-reasoning JSON floor plan.
Target Total Area: ${area} sq ft (Sum of all levels).

**STRICT ARCHITECTURAL LOGIC:**
1. **Zoning:** Group wet zones (Kitchen/Baths) and separate quiet zones (Bedrooms) from social areas.
2. **Circulation:** Use hallways. Do not walk through one bedroom to get to another.
3. **Natural Light:** Bedrooms and Living areas MUST have a window on an exterior wall.
4. **Revisions:** ${isRevision ? "Treat the previous JSON as the fixed foundation. Modify only specific rooms as requested while keeping the overall logic consistent." : "Create a fresh, professional layout."}

**SPECS:**
- Shape: ${surveyData.shape}.
- Levels: ${surveyData.stories}.
- Garage: ${surveyData.garage}.
- 1 Unit = 1 Foot.

JSON Structure: { "levels": [ { "level": 1, "width": 50, "height": 40, "rooms": [], "doors": [], "windows": [] } ] }
    `.trim();

    let contents = [...chatHistory];
    contents.push({ role: "user", parts: [{ text: prompt }] });

    // Using Gemini 3.1 Pro Preview with "Low Thinking" for optimal speed/quality
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: contents,
      config: {
        thinkingConfig: {
          thinkingLevel: "high",
        }
      },
    });

    const rawJson = extractJson(result?.text);
    if (!rawJson) throw new Error("AI failed to return valid architectural JSON.");

    const planSpec = JSON.parse(rawJson);
    const svgString = renderPlanSvg(planSpec);

    return res.status(200).json({
      success: true,
      planSpec,
      svg: svgString,
      chatHistory: [...contents, { role: "model", parts: [{ text: JSON.stringify(planSpec) }] }]
    });

  } catch (err) {
    console.error("Plan Pro Thinking Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};