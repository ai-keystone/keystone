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

    // DYNAMIC ZONING RULES BASED ON NEW USER INPUTS
    const openConceptRule = surveyData.openConcept.includes("Open") 
        ? "PUBLIC ZONE: 'Living', 'Dining', and 'Kitchen' MUST share walls and act as one continuous block."
        : "PUBLIC ZONE: 'Living', 'Dining', and 'Kitchen' should be defined as separate but connected rooms.";
        
    const masterRule = surveyData.masterLocation.includes("Level 1")
        ? "Place the 'Master Bedroom', 'Master Bath', and 'Walk-in Closet' tightly grouped together on LEVEL 1."
        : "Place the 'Master Bedroom', 'Master Bath', and 'Walk-in Closet' tightly grouped together on LEVEL 2.";

    const kitchenRule = surveyData.kitchenPlacement.includes("Rear")
        ? "Place the Kitchen towards the top/rear coordinates (y=0)."
        : "Place the Kitchen towards the bottom/front coordinates.";

    const prompt = `
You are a Senior Architect. Output ONLY valid JSON. 1 Unit = 1 Foot.

**USER PREFERENCES (CRITICAL):**
- Layout: ${openConceptRule}
- Primary Suite: ${masterRule}
- Kitchen: ${kitchenRule}
- Garage: ${surveyData.garage !== "None" ? `Place "${surveyData.garage.toUpperCase()}" on Level 1.` : "No garage."}
- Extra Features: "${surveyData.features}"

**LEVEL FOOTPRINT (MANDATORY):**
- Level grid: ${w} ft wide x ${h} ft deep. 
- The sum of all room areas (w*h) MUST equal exactly ${w * h} for EACH level. Fill the footprint completely.

**ZONING & ADJACENCY RULES:**
1. **WET CORE:** Group Bathrooms near each other or near the Kitchen to share plumbing walls.
2. **STAIRS:** If 2 levels, place "STAIRS" at the EXACT same x,y coordinates on Level 1 and Level 2.
3. **CIRCULATION:** Use "Hallway" rooms to connect spaces. No room should be inaccessible.

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