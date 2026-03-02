// api/generate.js
const planHandler = require("./plan");
const renderHandler = require("./render");

// Helper to run handlers internally
function runHandler(handler, body) {
  return new Promise((resolve) => {
    const req = { method: "POST", body };
    const res = {
      headers: {},
      statusCode: 200,
      setHeader(k, v) { this.headers[k] = v; },
      status(code) { this.statusCode = code; return this; },
      json(payload) { resolve({ status: this.statusCode || 200, payload }); },
      send(payload) { resolve({ status: this.statusCode || 200, payload }); },
      end() { resolve({ status: this.statusCode || 200, payload: null }); }
    };

    try {
      Promise.resolve(handler(req, res)).catch((err) => {
        resolve({ status: 500, payload: { success: false, message: err?.message || "Internal error" } });
      });
    } catch (err) {
      resolve({ status: 500, payload: { success: false, message: err?.message || "Fatal handler error" } });
    }
  });
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  
  // Notice we return 200 instead of 405 now to force the error through Vercel's gateway
  if (req.method !== "POST") return res.status(200).json({ success: false, message: "Method Not Allowed. Use POST." });

  try {
    // 1. BULLETPROOF BODY PARSING
    let body = req.body;
    
    // If Vercel passed it as a raw buffer, convert to string
    if (Buffer.isBuffer(body)) {
      body = body.toString('utf8');
    }
    
    // If it's a string, parse it to JSON
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(200).json({ success: false, message: "Vercel Gateway Error: Invalid JSON format received." });
      }
    }

    body = body || {};
    const { surveyData, passkey, refinementInput } = body;

    // 2. Validate Data
    if (!surveyData) {
      return res.status(200).json({ success: false, message: "Missing surveyData object in request body." });
    }

    // 3. Authenticate
    const basicKeys = (process.env.VALID_PASSKEYS || "").split(",").map(k => k.trim()).filter(Boolean);
    const premiumKeys = (process.env.VALID_PASSKEYS_PREMIUM || "").split(",").map(k => k.trim()).filter(Boolean);
    const allValidKeys = [...basicKeys, ...premiumKeys];

    if (!allValidKeys.includes(passkey)) {
      return res.status(200).json({ success: false, message: "Unauthorized: Invalid Passkey." });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(200).json({ success: false, message: "Server configuration error: Missing GOOGLE_API_KEY." });
    }

    // 4. Generate Plan
    const planRes = await runHandler(planHandler, { surveyData });
    if (!planRes.payload || planRes.payload.success !== true) {
      return res.status(200).json({ 
        success: false, 
        message: planRes.payload?.message || "Plan API Failed",
        details: planRes.payload 
      });
    }

    // 5. Generate Render
    const mergedSurveyData = {
      ...surveyData,
      features: refinementInput ? `${surveyData.features || ""}. Refinement: ${refinementInput}` : (surveyData.features || "")
    };

    const renderRes = await runHandler(renderHandler, {
      surveyData: mergedSurveyData,
      planImageBase64: planRes.payload.planImage
    });

    if (!renderRes.payload || renderRes.payload.success !== true) {
      return res.status(200).json({ 
        success: false, 
        message: renderRes.payload?.message || "Render API Failed",
        details: renderRes.payload 
      });
    }

    // 6. Success Output
    return res.status(200).json({
      success: true,
      planImage: planRes.payload.planImage,
      planMimeType: "image/png",
      planSpec: planRes.payload.planSpec,
      image: renderRes.payload.image,
      mimeType: renderRes.payload.mimeType || "image/png",
      isRefined: !!refinementInput
    });

  } catch (err) {
    return res.status(200).json({ success: false, message: "Fatal Server Crash", error: err?.message });
  }
};