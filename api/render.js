// api/render.js
module.exports.config = { runtime: "nodejs" };
const { GoogleGenAI } = require("@google/genai");

function stripDataUrlPrefix(b64) {
  if (!b64) return b64;
  const idx = b64.indexOf("base64,");
  return idx >= 0 ? b64.slice(idx + "base64,".length) : b64;
}

module.exports = async function handler(req, res) {
  // CORS...
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method Not Allowed" });

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const { surveyData, planImageBase64 } = req.body || {};
    if (!planImageBase64) return res.status(400).json({ success: false, message: "Missing plan image" });

    const ai = new GoogleGenAI({ apiKey });

    // 1. Extract Specific User Inputs
    const style = surveyData?.materials || "Modern";
    const location = surveyData?.location || "A scenic landscape";
    const features = surveyData?.features || ""; // e.g. "White picket fence, large swimming pool"
    const stories = String(surveyData?.stories || "1").includes("2") ? "2-Story" : "1-Story";

    // 2. Construct the "Hard" Prompt
    // We emphasize the features so the AI draws them (Fence, Porch, etc)
    const renderPrompt = `
You are an architectural visualizer. 

**INPUT:** The attached image is a 2D floor plan footprint.
**TASK:** Create a Photorealistic 3D Exterior Render.

**DESIGN SPECIFICATIONS (Must Follow):**
1. **Structure:** ${stories} Residential House. 
2. **Style:** ${style}.
3. **Location/Environment:** ${location}.
4. **MANDATORY FEATURES:** The client specifically requested: "${features}". You MUST include these elements visually in the scene (e.g. if they asked for a fence, draw a fence; if a pool, draw a pool).
5. **View:** Ground-level eye view from the street.

**RESTRICTIONS:**
- DO NOT overlay the floor plan lines on the house.
- DO NOT show any text, labels, or dimensions.
- The house shape must roughly match the footprint provided.

Create a high-end, magazine-quality render.
    `.trim();

    const imgResp = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Use flash for speed, or pro-vision for quality
      contents: [
        {
          role: "user",
          parts: [
            { text: renderPrompt },
            { inlineData: { data: stripDataUrlPrefix(planImageBase64), mimeType: "image/png" } }
          ]
        }
      ]
    });

    // ... Extract image logic (same as before) ...
    let imageBase64 = null;
    let mimeType = "image/png";
    const parts = imgResp?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part?.inlineData?.data) {
        imageBase64 = part.inlineData.data;
        mimeType = part.inlineData.mimeType || "image/png";
        break;
      }
    }

    if (!imageBase64) return res.status(500).json({ success: false, message: "No image generated" });

    return res.status(200).json({ success: true, image: imageBase64, mimeType });

  } catch (err) {
    console.error("RENDER error:", err);
    return res.status(500).json({ success: false, message: err?.message });
  }
};