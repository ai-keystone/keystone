// lib/renderPlanSvg.js (CommonJS)
const path = require("path");
const TextToSVG = require("text-to-svg");

const fontPath = path.join(__dirname, "Inter-Regular.ttf");
let textToSVG = null;
try {
  textToSVG = TextToSVG.loadSync(fontPath);
} catch (e) {
  console.error("Font missing", e);
}

function renderPlanSvg(planSpec) {
  if (!planSpec || !Array.isArray(planSpec.levels)) return "";

  const PX = 14; 
  const PAD = 80;
  const GAP = 100;
  
  let yOffset = 0;
  let svgWidth = 0;
  const groups = [];

  planSpec.levels.forEach((lvl, index) => {
    // FIX: Fallback if AI forgets level number
    const levelNum = lvl.level || (index + 1);
    const wFt = Number(lvl.width) || 40;
    const hFt = Number(lvl.height) || 40;
    
    const levelPixelW = wFt * PX;
    const levelPixelH = hFt * PX;
    svgWidth = Math.max(svgWidth, levelPixelW + PAD * 2);
    const startY = yOffset + PAD;

    // --- HELPER: Render Text ---
    const renderText = (text, x, y, size, anchor = "middle", color = "#222", weight = "normal") => {
      if (!text) return "";
      if (textToSVG) {
        const options = {
          x, y, fontSize: size, 
          anchor: anchor === "middle" ? "center middle" : (anchor === "end" ? "right middle" : "left middle"),
          attributes: { fill: color }
        };
        return `<path d="${textToSVG.getD(String(text), options)}" fill="${color}" />`;
      }
      return `<text x="${x}" y="${y}" font-family="sans-serif" font-size="${size}" fill="${color}" text-anchor="${anchor}">${text}</text>`;
    };

    // 1. Exterior Dimension Lines
    const topDim = `<line x1="${PAD}" y1="${startY - 25}" x2="${PAD + levelPixelW}" y2="${startY - 25}" stroke="#5B7C99" stroke-width="2" />
                    ${renderText(wFt + "'", PAD + levelPixelW/2, startY - 35, 16, "middle", "#5B7C99", "bold")}`;
    const sideDim = `<line x1="${PAD - 25}" y1="${startY}" x2="${PAD - 25}" y2="${startY + levelPixelH}" stroke="#5B7C99" stroke-width="2" />
                     ${renderText(hFt + "'", PAD - 35, startY + levelPixelH/2, 16, "end", "#5B7C99", "bold")}`;

    // 2. Rooms
    const roomSvg = (lvl.rooms || []).map(r => {
      const rx = PAD + r.x * PX; 
      const ry = startY + r.y * PX;
      const rw = r.w * PX; 
      const rh = r.h * PX;
      
      const labelText = r.label || r.type || "";
      const dimText = `${r.w}' x ${r.h}'`;

      // Visual distinction for Stairs
      let fill = "white";
      let extras = "";
      if (r.type === "stairs" || labelText.toLowerCase().includes("stair")) {
         fill = "#f0f0f0";
         // Draw simplified stair lines
         for(let i=1; i<8; i++) {
             extras += `<line x1="${rx}" y1="${ry + (rh/8)*i}" x2="${rx+rw}" y2="${ry + (rh/8)*i}" stroke="#ccc" stroke-width="1" />`;
         }
      }

      return `
        <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${fill}" stroke="#222" stroke-width="3" />
        ${extras}
        ${renderText(labelText, rx + rw/2, ry + rh/2 - 8, 14, "middle", "#222", "bold")}
        ${renderText(dimText, rx + rw/2, ry + rh/2 + 12, 12, "middle", "#666")}
      `;
    }).join("\n");

    // 3. Doors (Fixing Rotation & Garage Doors)
    const doorSvg = (lvl.doors || []).map(d => {
      const dx = PAD + d.x * PX; 
      const dy = startY + d.y * PX;
      const isVert = d.dir === "vertical";
      
      // Is this a Garage door? (Usually wider, detected by type or context usually, but here we guess by logic or assume standard)
      // Since we don't have type on door object in current schema, we render standard doors. 
      // But we make them cut the wall properly.
      
      if (isVert) {
          // Vertical Door (on left/right walls)
          return `<rect x="${dx - 4}" y="${dy - 18}" width="8" height="36" fill="white" />
                  <line x1="${dx}" y1="${dy - 18}" x2="${dx}" y2="${dy + 18}" stroke="#ccc" stroke-width="2" />
                  <path d="M ${dx} ${dy-18} Q ${dx+18} ${dy} ${dx} ${dy+18}" stroke="#ddd" fill="none" />`; 
      } else {
          // Horizontal Door (on top/bottom walls)
          return `<rect x="${dx - 18}" y="${dy - 4}" width="36" height="8" fill="white" />
                  <line x1="${dx - 18}" y1="${dy}" x2="${dx + 18}" y2="${dy}" stroke="#ccc" stroke-width="2" />
                  <path d="M ${dx-18} ${dy} Q ${dx} ${dy+18} ${dx+18} ${dy}" stroke="#ddd" fill="none" />`;
      }
    }).join("\n");

    // 4. Windows (Fixing Rotation)
    const winSvg = (lvl.windows || []).map(w => {
      const wx = PAD + w.x * PX; 
      const wy = startY + w.y * PX;
      const isVert = w.dir === "vertical";

      if (isVert) {
         return `<rect x="${wx - 3}" y="${wy - 18}" width="6" height="36" fill="white" stroke="#5B7C99" stroke-width="1" />`;
      } else {
         return `<rect x="${wx - 18}" y="${wy - 3}" width="36" height="6" fill="white" stroke="#5B7C99" stroke-width="1" />`;
      }
    }).join("\n");

    // Header
    const header = renderText(`Level ${levelNum} (${wFt * hFt} sq ft)`, PAD, yOffset + 40, 24, "start", "#222", "bold");

    groups.push(`<g>${header}${topDim}${sideDim}${roomSvg}${doorSvg}${winSvg}</g>`);
    yOffset += levelPixelH + PAD + GAP;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${yOffset}" viewBox="0 0 ${svgWidth} ${yOffset}"><rect width="100%" height="100%" fill="#F9F8F4" />${groups.join("\n")}</svg>`;
}

module.exports = { renderPlanSvg };