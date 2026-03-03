// api/plan.js
const { GoogleGenAI } = require("@google/genai");
const { renderPlanSvg } = require("../lib/renderPlanSvg");
const logic = require("../lib/planningLogic.json");

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
    
    // Calculate targeted math for the prompt
    const totalArea = Number(surveyData.totalArea) || 2000;
    const stories = String(surveyData.stories).includes("2") ? 2 : 1;
    const areaPerLevel = Math.floor(totalArea / stories);
    
    // Geometry logic for the prompt
    const shapeConstraint = surveyData.shape === "Square" 
        ? `SQUARE: Width and Height must be approx ${Math.floor(Math.sqrt(areaPerLevel))}'` 
        : `RECTANGULAR: Width must be approx ${Math.floor(Math.sqrt(areaPerLevel * 1.8))}' and Height approx ${Math.floor(Math.sqrt(areaPerLevel / 1.8))}'`;

    const prompt = `
You are a Senior Architect. Output a JSON floor plan. 1 Unit = 1 Foot.

**MATHEMATICAL CONSTRAINTS (MANDATORY):**
1. **Total Area Budget:** ${totalArea} sq ft total.
2. **Level Budget:** Exactly ${areaPerLevel} sq ft per level.
3. **Dimensions:** ${shapeConstraint}. 
   - Level Width * Level Height MUST equal ${areaPerLevel} (approx +/- 5%).
   - Room areas (w * h) sum MUST NOT exceed level area.

**PLANNING LOGIC:**
1. **Zoning:** Use the "ResidentialPlanningLogic" adjacency rules. 
2. **Specific Requests:** ${surveyData.features}. 
   - If user asks for a bedroom on Level 1, it MUST be there.
3. **Stairs:** If 2 levels, place "STAIRS" (approx 8'x10') at the EXACT same x,y coordinates on both levels.
4. **Garage:** Size for ${surveyData.garage}. Place on Level 1.

**OUTPUT RULES:**
- NO markdown. NO conversational text.
- JSON must contain "levels" array. 
- Every room must have a unique "id", "label", and "type".

JSON Structure: { "levels": [ { "level": 1, "width": 50, "height": 22, "rooms": [...] } ] }
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

    if (planSpec.levels) {
        planSpec.levels.forEach((lvl, i) => { if(!lvl.level) lvl.level = i + 1; });
    }
    
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