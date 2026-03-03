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
    
    const w = surveyData.shape === "Square" ? Math.floor(Math.sqrt(areaPerLevel)) : Math.floor(Math.sqrt(areaPerLevel * 1.8));
    const h = Math.floor(areaPerLevel / w);

    // DYNAMIC INSTRUCTIONS
    const garageRule = surveyData.garage !== "None" 
        ? `CRITICAL: You MUST include a room labeled "${surveyData.garage.toUpperCase()}" on Level 1. Do not forget this.` 
        : "No garage required.";

    const prompt = `
You are a strict Architectural API. Output ONLY valid JSON.
1 Unit = 1 Foot.

**USER REQUIREMENTS (PRIORITY 1):**
- Features: "${surveyData.features}"
- ${garageRule}
- Bedrooms: ${surveyData.bedrooms}. Bathrooms: ${surveyData.bathrooms}.

**LEVEL SPECS (PRIORITY 2):**
- Level Footprint: ${w} ft wide x ${h} ft deep. 
- Total Area: ${areaPerLevel} sq ft per level.

**ROOM LAYOUT RULES (PRIORITY 3):**
1. **COVERAGE:** The sum of all room areas (w*h) on a level MUST equal exactly ${w * h}. Rooms must fit together perfectly like a puzzle within the ${w}x${h} grid.
2. **STAIRS:** If 2 levels, place "STAIRS" at the exact same x,y coordinates on both levels.
3. **LABELS:** Give every room a clear "label" (e.g., "KITCHEN", "MASTER BEDROOM").

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