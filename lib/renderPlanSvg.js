// lib/renderPlanSvg.js (CommonJS)
const path = require("path");
const TextToSVG = require("text-to-svg");

const fontPath = path.join(__dirname, "Inter-Regular.ttf");
let textToSVG = null;
try { textToSVG = TextToSVG.loadSync(fontPath); } catch (e) { console.error("Font missing", e); }

function renderPlanSvg(planSpec) {
  if (!planSpec || !Array.isArray(planSpec.levels)) return "";

  const PX = 14; // 1 Foot = 14 pixels visually
  const PAD = 80; // Padding for exterior dimensions
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

    // Exterior Dimension Lines
    const topDim = `<line x1="${PAD}" y1="${startY - 20}" x2="${PAD + levelPixelW}" y2="${startY - 20}" stroke="#5B7C99" stroke-width="2" />
                    <text x="${PAD + levelPixelW/2}" y="${startY - 28}" font-family="sans-serif" font-size="16" fill="#5B7C99" text-anchor="middle" font-weight="bold">${wFt}'</text>`;
    const sideDim = `<line x1="${PAD - 20}" y1="${startY}" x2="${PAD - 20}" y2="${startY + levelPixelH}" stroke="#5B7C99" stroke-width="2" />
                     <text x="${PAD - 28}" y="${startY + levelPixelH/2}" font-family="sans-serif" font-size="16" fill="#5B7C99" text-anchor="end" dominant-baseline="middle" font-weight="bold">${hFt}'</text>`;

    // Draw Rooms with internal dimensions
    const roomSvg = (lvl.rooms || []).map(r => {
      const rx = PAD + r.x * PX; const ry = startY + r.y * PX;
      const rw = r.w * PX; const rh = r.h * PX;
      const labelText = r.label || r.type || "";
      const dimText = `${r.w}' x ${r.h}'`;

      return `
        <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="white" stroke="#222" stroke-width="3" />
        <text x="${rx + rw/2}" y="${ry + rh/2 - 6}" font-family="sans-serif" font-size="14" fill="#222" text-anchor="middle" font-weight="bold">${labelText}</text>
        <text x="${rx + rw/2}" y="${ry + rh/2 + 12}" font-family="sans-serif" font-size="12" fill="#666" text-anchor="middle">${dimText}</text>
      `;
    }).join("\n");

    // Draw Doors & Windows (Abstract gaps)
    const doorSvg = (lvl.doors || []).map(d => {
      const dx = PAD + d.x * PX; const dy = startY + d.y * PX;
      if (d.dir === "vertical") return `<rect x="${dx-2}" y="${dy-18}" width="4" height="36" fill="white" />`;
      return `<rect x="${dx-18}" y="${dy-2}" width="36" height="4" fill="white" />`;
    }).join("\n");

    const winSvg = (lvl.windows || []).map(w => {
      const wx = PAD + w.x * PX; const wy = startY + w.y * PX;
      if (w.dir === "vertical") return `<rect x="${wx-2}" y="${wy-18}" width="4" height="36" fill="#AEEEEE" />`;
      return `<rect x="${wx-18}" y="${wy-2}" width="36" height="4" fill="#AEEEEE" />`;
    }).join("\n");

    const header = `<text x="${PAD}" y="${yOffset + 30}" font-family="sans-serif" font-size="22" font-weight="bold" fill="#222">Level ${lvl.level} (${wFt * hFt} sq ft)</text>`;

    groups.push(`<g>${header}${topDim}${sideDim}${roomSvg}${doorSvg}${winSvg}</g>`);
    yOffset += levelPixelH + PAD + GAP;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${yOffset}" viewBox="0 0 ${svgWidth} ${yOffset}"><rect width="100%" height="100%" fill="#F9F8F4" />${groups.join("\n")}</svg>`;
}

module.exports = { renderPlanSvg };