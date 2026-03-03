// api/plan.js (CommonJS)
const { GoogleGenAI } = require("@google/genai");
const { renderPlanSvg } = require("../lib/renderPlanSvg");
const { svgToPngBase64 } = require("../lib/svgToPng");
const planSchema = require("../lib/planSchema.json");

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
    if (!surveyData) return res.status(400).json({ success: false, message: "Missing surveyData" });

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    const totalArea = Number(surveyData.totalArea) || 2500;
    const stories = String(surveyData.stories).includes("2") ? 2 : 1;
    const shape = surveyData.shape || "Rectangular";
    const garage = surveyData.garage || "None";
    
    const prompt = `
You are an Expert Architect. Generate a JSON floor plan.
1 Unit = 1 Foot.

**CLIENT REQUIREMENTS:**
- Target Total Area: ~${totalArea} sq ft.
- Stories: ${stories}.
- Bedrooms: ${surveyData.bedrooms}. Bathrooms: ${surveyData.bathrooms}.
- Garage: ${garage}.
- House Shape: ${shape}. 
- Special Features: ${surveyData.features || "None"}

**MATH & SHAPE LOGIC:**
- If Shape is "Square": Make Level width (W) and height (H) roughly equal in feet.
- If Shape is "Rectangular": Make Level width (W) roughly 1.5x to 2x the height (H).
- Ensure total square footage (W * H across all levels) is close to ${totalArea}.
- The sum of (room.w * room.h) must fit inside the level W * H.

**RULES:**
- Rooms must be rectangles. Coordinates (x,y) start at top-left (0,0).
- If Garage is 1 Car (12x20), 2 Car (20x20), 3 Car (30x20).
- Add "doors" and "windows".

**CRITICAL JSON FORMAT:**
- DO NOT wrap the output in a parent key like "plan" or "response".
- The root of your JSON must DIRECTLY contain the "stories" and "levels" arrays.

OUTPUT JSON ONLY matching the schema exactly. Do not output markdown.
    `.trim();

    // Setup history for memory revisions
    let contents = [...chatHistory];
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const textResp = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: contents
    });

    const raw = extractJson(textResp?.text);
    if (!raw) return res.status(500).json({ success: false, message: "Empty AI response" });

    let planSpec;
    try {
      planSpec = JSON.parse(raw);
    } catch (e) {
      console.error("JSON Parse Failed. Raw:", raw);
      return res.status(500).json({ success: false, message: "AI generated invalid JSON structure." });
    }

    // --- AUTO-UNWRAPPER ---
    // If the AI accidentally wrapped the result (e.g., {"plan": { levels: [] }})
    if (planSpec.planSpec) planSpec = planSpec.planSpec;
    else if (planSpec.plan) planSpec = planSpec.plan;
    else if (planSpec.floorplan) planSpec = planSpec.floorplan;
    else if (planSpec.output) planSpec = planSpec.output;

    // --- SAFETY CHECK ---
    if (!planSpec.levels || !Array.isArray(planSpec.levels)) {
      console.error("AI missed 'levels' array. Final Parsed Object:", planSpec);
      return res.status(500).json({ success: false, message: "AI failed to map the floor plan levels. Please try generating again." });
    }

    const svg = renderPlanSvg(planSpec);
    
    // Fallback if SVG fails for some reason
    if (!svg || typeof svg !== "string" || svg.trim() === "") {
        return res.status(500).json({ success: false, message: "SVG Renderer failed to create a valid graphic." });
    }

    const planImageBase64 = await svgToPngBase64(svg, 1600);

    // Save this interaction to history to send back to frontend
    const newHistory = [
        ...contents,
        { role: "model", parts: [{ text: JSON.stringify(planSpec) }] }
    ];

    return res.status(200).json({
      success: true,
      planSpec,
      planImage: planImageBase64,
      chatHistory: newHistory
    });

  } catch (err) {
    console.error("Plan API Error:", err);
    return res.status(500).json({ success: false, message: err?.message || "Server Error" });
  }
};