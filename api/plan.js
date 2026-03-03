// api/plan.js (CommonJS)
const { GoogleGenAI } = require("@google/genai");
const { renderPlanSvg } = require("../lib/renderPlanSvg");
const { svgToPngBase64 } = require("../lib/svgToPng");

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

    // Determine if we are in REVISION mode
    const isRevision = chatHistory.length > 0;
    const activeModel = isRevision ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";

    const basePrompt = `
You are a Senior Architect. Generate a JSON floor plan. 1 Unit = 1 Foot.
Target Area: ${surveyData.totalArea} sq ft. Stories: ${surveyData.stories}. Shape: ${surveyData.shape}.

**STRICT RULES:**
1. **LABELS:** Every room object MUST have a "label" (e.g., "Master Bedroom") and a "type".
2. **STAIRS:** For 2 stories, you MUST have identical "stairs" rooms on both levels.
3. **DOORS:** Every room needs a door. Vertical walls = "vertical", horizontal = "horizontal".

${isRevision ? `
**REVISION MODE:** 
The user is providing feedback on the PREVIOUS plan in the chat history.
1. DO NOT start from scratch. Use the last JSON provided as your base.
2. If the user asks for a change (e.g., "add labels" or "make kitchen bigger"), modify the EXISTING room coordinates and labels.
3. Keep room IDs identical where possible.
4. Maintain the current footprint unless the user asks to change the shape.
` : `
**NEW PLAN MODE:** Create a new plan following the specs.
`}

OUTPUT VALID JSON ONLY.
    `.trim();

    let contents = [...chatHistory];
    contents.push({ role: "user", parts: [{ text: basePrompt }] });

    const result = await ai.models.generateContent({
      model: activeModel, 
      contents: contents
    });

    const rawJson = extractJson(result?.text);
    if (!rawJson) throw new Error("AI failed to return JSON.");

    let planSpec = JSON.parse(rawJson);
    if (planSpec.planSpec) planSpec = planSpec.planSpec;
    else if (planSpec.plan) planSpec = planSpec.plan;

    if (!planSpec.levels) throw new Error("AI JSON missing levels.");

    const svg = renderPlanSvg(planSpec);
    const planImageBase64 = await svgToPngBase64(svg, 1600);

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
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};