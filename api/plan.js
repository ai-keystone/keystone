// api/plan.js
const { GoogleGenAI } = require("@google/genai");
const { renderPlanSvg } = require("../lib/renderPlanSvg");
const logic = require("../lib/planningLogic.json"); // Your Research Logic file

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
    
    // --- PATH FIXES FOR RESEARCH LOGIC ---
    const garageKey = surveyData.garage === "None" ? "NONE" : 
                     surveyData.garage.includes("1") ? "ONE_CAR" : 
                     surveyData.garage.includes("2") ? "TWO_CAR" : "THREE_CAR";
    
    // Safety check for logic paths
    const garageSpecs = logic.garagePresets?.[garageKey] || {};
    const footprintPatterns = logic.templates?.footprintZoningPatterns || {};
    const shapeKey = surveyData.shape.toUpperCase().replace("-","_");
    const shapeSpecs = footprintPatterns[shapeKey] || footprintPatterns.RECTANGULAR;
    
    // Fix: adjacencyGraph is inside rules
    const adjacencies = logic.rules?.adjacencyGraph || [];

    const prompt = `
You are a Senior Architect using the "ResidentialPlanningLogic" framework. 
Generate a high-reasoning JSON floor plan. 1 Unit = 1 Foot.

**USER'S SPECIFIC REQUEST (PRIORITY #1):** 
"${surveyData.features}"

**ARCHITECTURAL FRAMEWORK (PRIORITY #2):**
1. **Garage:** Use these dimensions: ${JSON.stringify(garageSpecs)}. Place on Level 1.
2. **Adjacencies:** Follow these core relations:
   ${adjacencies.filter(a => a.weight >= 9).map(a => `- ${a.from} to ${a.to}: ${a.relation}`).join("\n")}
3. **Zoning Pattern:** Use the "${shapeSpecs.circulationTemplate}" strategy.
4. **Dimensions:** Bedrooms min 10ft wide. Hallways 3.5ft wide.

**STRICT MATH:**
- Level 1 Area + Level 2 Area MUST equal approx ${surveyData.totalArea} sq ft.
- Total width/height must fit the ${surveyData.shape} footprint.

**REVISION LOGIC:**
${chatHistory.length > 0 ? "DO NOT start from scratch. Modify the PREVIOUS JSON in history based on the user's latest comment." : "Create a new professional draft."}

JSON Output: { "levels": [ { "level": 1, "width": 60, "height": 40, "rooms": [], "doors": [], "windows": [] } ] }
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

    // Standardize & Render
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
    console.error("Plan Logic Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};