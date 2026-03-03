// lib/renderPlanSvg.js (CommonJS)
const path = require("path");
const TextToSVG = require("text-to-svg");

// Try to resolve font path robustly
const fontPath = path.join(__dirname, "Inter-Regular.ttf");
let textToSVG = null;

try {
  textToSVG = TextToSVG.loadSync(fontPath);
  console.log("✅ Font loaded successfully from:", fontPath);
} catch (e) {
  console.error("❌ FONT LOAD FAILED. Text will be boxes.", e);
  console.error("Attempted Path:", fontPath);
}

function renderPlanSvg(planSpec) {
  if (!planSpec || !Array.isArray(planSpec.levels)) return "";

  const PX = 14; 
  const PAD = 80;
  const GAP = 80;
  
  let yOffset = 0;
  let svgWidth = 0;
  const groups = [];

  for (const lvl of planSpec.levels) {
    const wFt = Number(lvl.width) || 40;
    const hFt = Number(lvl.height) || 40;
    
    const levelPixelW = wFt * PX;
    const levelPixelH = hFt * PX;
    svgWidth = Math.max(svgWidth, levelPixelW + PAD * 2);
    const startY = yOffset + PAD;

    // --- TEXT RENDERING HELPER ---
    // This converts text to vector paths so it works without system fonts
    const renderText = (text, x, y, size, anchor = "middle", color = "#222", weight = "normal") => {
      if (!text) return "";
      
      // If we have the font loaded, convert to SVG Path (The Fix)
      if (textToSVG) {
        const options = {
          x: x, 
          y: y, 
          fontSize: size, 
          anchor: anchor === "middle" ? "center middle" : (anchor === "end" ? "right middle" : "left middle"),
          attributes: { fill: color }
        };
        return `<path d="${textToSVG.getD(String(text), options)}" fill="${color}" />`;
      }

      // FALLBACK (If font missing, this shows boxes on Vercel)
      const anchorAttr = anchor === "middle" ? 'text-anchor="middle"' : (anchor === "end" ? 'text-anchor="end"' : '');
      const weightAttr = weight === "bold" ? 'font-weight="bold"' : '';
      return `<text x="${x}" y="${y}" font-family="sans-serif" font-size="${size}" fill="${color}" ${anchorAttr} ${weightAttr}>${text}</text>`;
    };

    // Exterior Dimension Lines
    const topDim = `<line x1="${PAD}" y1="${startY - 20}" x2="${PAD + levelPixelW}" y2="${startY - 20}" stroke="#5B7C99" stroke-width="2" />
                    ${renderText(wFt + "'", PAD + levelPixelW/2, startY - 28, 16, "middle", "#5B7C99", "bold")}`;
    
    const sideDim = `<line x1="${PAD - 20}" y1="${startY}" x2="${PAD - 20}" y2="${startY + levelPixelH}" stroke="#5B7C99" stroke-width="2" />
                     ${renderText(hFt + "'", PAD - 28, startY + levelPixelH/2, 16, "end", "#5B7C99", "bold")}`;

    // Draw Rooms with internal dimensions
    const roomSvg = (lvl.rooms || []).map(r => {
      const rx = PAD + r.x * PX; const ry = startY + r.y * PX;
      const rw = r.w * PX; const rh = r.h * PX;
      const labelText = r.label || r.type || "Room";
      const dimText = `${r.w}' x ${r.h}'`;

      return `
        <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="white" stroke="#222" stroke-width="3" />
        ${renderText(labelText, rx + rw/2, ry + rh/2 - 6, 14, "middle", "#222", "bold")}
        ${renderText(dimText, rx + rw/2, ry + rh/2 + 12, 12, "middle", "#666")}
      `;
    }).join("\n");

    // Doors & Windows (Simple blocks)
    const doorSvg = (lvl.doors || []).map(d => {
      const dx = PAD + d.x * PX; const dy = startY + d.y * PX;
      return d.dir === "vertical" 
        ? `<rect x="${dx-2}" y="${dy-18}" width="4" height="36" fill="white" />` 
        : `<rect x="${dx-18}" y="${dy-2}" width="36" height="4" fill="white" />`;
    }).join("\n");

    const winSvg = (lvl.windows || []).map(w => {
      const wx = PAD + w.x * PX; const wy = startY + w.y * PX;
      return w.dir === "vertical"
        ? `<rect x="${wx-2}" y="${wy-18}" width="4" height="36" fill="#AEEEEE" />`
        : `<rect x="${wx-18}" y="${wy-2}" width="36" height="4" fill="#AEEEEE" />`;
    }).join("\n");

    const header = renderText(`Level ${lvl.level} (${wFt * hFt} sq ft)`, PAD, yOffset + 30, 22, "start", "#222", "bold");

    groups.push(`<g>${header}${topDim}${sideDim}${roomSvg}${doorSvg}${winSvg}</g>`);
    yOffset += levelPixelH + PAD + GAP;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${yOffset}" viewBox="0 0 ${svgWidth} ${yOffset}"><rect width="100%" height="100%" fill="#F9F8F4" />${groups.join("\n")}</svg>`;
}

module.exports = { renderPlanSvg };