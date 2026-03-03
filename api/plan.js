// api/render.js (CommonJS)

const { GoogleGenAI } = require("@google/genai");

function stripDataUrlPrefix(b64) {
  if (!b64) return b64;
  const idx = b64.indexOf("base64,");
  return idx >= 0 ? b64.slice(idx + "base64,".length) : b64;
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method Not Allowed" });

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: "Missing GOOGLE_API_KEY" });

    const { surveyData, planImageBase64 } = req.body || {};
    if (!planImageBase64) return res.status(400).json({ success: false, message: "Missing plan image" });

    const ai = new GoogleGenAI({ apiKey });

    // 1. Extract Specific User Inputs
    const style = surveyData?.materials || "Modern Residential";
    const location = surveyData?.location || "A scenic landscape";
    const features = surveyData?.features || ""; 
    const stories = String(surveyData?.stories || "1").includes("2") ? "2-Story" : "1-Story";

    // 2. Construct the "Hard" Prompt to fix perspective and include user features
    const renderPrompt = `
You are an architectural visualizer. 

**INPUT:** The attached image is a 2D floor plan footprint.
**TASK:** Create a Photorealistic 3D EXTERIOR RENDER of the house represented by this plan.

**DESIGN SPECIFICATIONS (Must Follow):**
1. **Structure:** ${stories} Residential House. 
2. **Style:** ${style}.
3. **Location/Environment:** ${location}.
4. **MANDATORY FEATURES:** The client specifically requested: "${features}". You MUST include these elements visually in the scene (e.g., if they asked for a fence, draw a fence; if a wrap-around porch, draw it).
5. **View:** Ground-level eye view from the street.

**RESTRICTIONS (CRITICAL):**
- DO NOT generate a top-down view.
- DO NOT overlay the floor plan lines on the house.
- DO NOT show any text, labels, or dimensions.
- The house shape must roughly match the footprint provided.

Create ONE single, high-end, magazine-quality photograph of the house exterior.
    `.trim();

    // 3. Generate Image using the correct Gemini 3 Pro Image model
    const imgResp = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: renderPrompt },
            {
              inlineData: {
                data: stripDataUrlPrefix(planImageBase64),
                mimeType: "image/png"
              }
            }
          ]
        }
      ]
    });

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

    if (!imageBase64) {
      return res.status(500).json({
        success: false,
        message: "No image returned.",
        debug: {
          hasCandidates: !!imgResp?.candidates?.length,
          partsCount: parts.length
        }
      });
    }

    return res.status(200).json({
      success: true,
      image: imageBase64,
      mimeType
    });
  } catch (err) {
    console.error("RENDER error:", err);
    return res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
};