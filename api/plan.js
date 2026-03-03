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
You are a Senior Residential Architect. Output a high-detail JSON floor plan.
Target Total Area: ${area} sq ft. 

**ARCHITECTURAL THINKING REQUIREMENTS:**
1. **Circulation:** Do not just place boxes. Create logical hallways. Rooms should not be used as the only way to get to other rooms.
2. **Privacy:** Bedrooms should be separated from loud living areas by hallways or closets.
3. **Natural Light:** Every Living Room and Bedroom MUST have at least one window on an exterior wall.
4. **Zoning:** Group wet zones (Kitchen, Laundry, Baths) where possible for realistic plumbing logic.
5. **Incremental Edits:** ${isRevision ? "STRICTLY use the previous JSON as your foundation. Move walls and resize rooms ONLY as requested by the user. Maintain room IDs." : "Create a fresh, high-reasoning layout from scratch."}

**STRICT MATH:**
- Level 1 + Level 2 areas MUST equal approx ${area} sq ft.
- 1 Unit = 1 Foot.
- Shape: ${surveyData.shape}. (Square = W:H 1:1, Rectangular = W:H 1.5:1 or more).

**DATA STRUCTURE:**
- Root: { "levels": [ { "level": 1, "width": 60, "height": 40, "rooms": [], "doors": [], "windows": [] } ] }
- Room objects MUST include "label" and "type".

OUTPUT VALID JSON ONLY.
    `.trim();

    let contents = [...chatHistory];
    contents.push({ role: "user", parts: [{ text: prompt }] });

    // Using Gemini 3.1 Pro for high-reasoning architectural drafting
    const result = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview", 
      contents: contents
    });

    const rawJson = extractJson(result?.text);
    if (!rawJson) throw new Error("AI failed to return valid architectural data.");

    const planSpec = JSON.parse(rawJson);
    const svgString = renderPlanSvg(planSpec);

    return res.status(200).json({
      success: true,
      planSpec,
      svg: svgString,
      chatHistory: [...contents, { role: "model", parts: [{ text: JSON.stringify(planSpec) }] }]
    });

  } catch (err) {
    console.error("Plan Pro Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};