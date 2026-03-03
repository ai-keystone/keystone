// api/plan.js
const { GoogleGenAI } = require("@google/genai");
const { renderPlanSvg } = require("../lib/renderPlanSvg");
const logic = require("../lib/planningLogic.json"); // Import the Research Logic

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
    
    // --- EXTRACT LOGIC CHUNKS ---
    const garageKey = surveyData.garage === "None" ? "NONE" : 
                     surveyData.garage.includes("1") ? "ONE_CAR" : 
                     surveyData.garage.includes("2") ? "TWO_CAR" : "THREE_CAR";
    
    const garageSpecs = logic.garagePresets[garageKey];
    const shapeSpecs = logic.templates.footprintZoningPatterns[surveyData.shape.toUpperCase().replace("-","_")] || logic.templates.footprintZoningPatterns.RECTANGULAR;
    const adjacencies = logic.adjacencyGraph;

    const prompt = `
You are a Senior Architect using the "ResidentialPlanningLogic" framework. 
Generate a JSON floor plan (1 Unit = 1 Foot).

**CORE HEURISTICS TO FOLLOW:**
1. **Garage Specs:** ${JSON.stringify(garageSpecs)}
2. **Footprint Zoning:** Use the "${shapeSpecs.circulationTemplate}" strategy. Bands: ${shapeSpecs.zoneBands.join(", ")}.
3. **Adjacency Requirements:** 
   ${adjacencies.filter(a => a.weight >= 9).map(a => `- ${a.from} to ${a.to}: ${a.relation}`).join("\n")}
4. **Dimensions:** Min room width for Bedrooms is 9ft, Public rooms 10ft.
5. **Efficiency:** Aim for Net-to-Gross ratio of 0.75 (Standard). Circulation area should be ~12% of total area.

**CLIENT SPECS:**
- Total Area: ${surveyData.totalArea} sq ft.
- Stories: ${surveyData.stories}.
- Requirements: ${surveyData.features}

**STRICT RULES:**
- LEVEL 1 + LEVEL 2 areas must total ${surveyData.totalArea}.
- STAIRS: Must be stacked (identical x,y,w,h) on both levels.
- LABELS: Every room needs a "label" and "type" from logic.enums.roomCategory.

JSON Structure: { "levels": [ { "level": 1, "width": 60, "height": 40, "rooms": [], "doors": [], "windows": [] } ] }
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
    if (planSpec.levels) planSpec.levels.forEach((lvl, i) => { if(!lvl.level) lvl.level = i + 1; });
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