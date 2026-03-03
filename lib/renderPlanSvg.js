// lib/renderPlanSvg.js (CommonJS)
const path = require("path");
const TextToSVG = require("text-to-svg");

const fontPath = path.join(__dirname, "Inter-Regular.ttf");
let textToSVG = null;
try { textToSVG = TextToSVG.loadSync(fontPath); } catch (e) { console.error("Font missing", e); }

function renderPlanSvg(planSpec) {
  if (!planSpec || !Array.isArray(planSpec.levels)) return "";

  const PX = 14; 
  const PAD = 80;
  const GAP = 100;
  
  let yOffset = 0;
  let svgWidth = 0;
  const groups = [];

  planSpec.levels.forEach((lvl, index) => {
    const levelNum = lvl.level || (index + 1);
    const wFt = Number(lvl.width) || 40;
    const hFt = Number(lvl.height) || 40;
    
    const levelPixelW = wFt * PX;
    const levelPixelH = hFt * PX;
    svgWidth = Math.max(svgWidth, levelPixelW + PAD * 2);
    const startY = yOffset + PAD;

    const renderText = (text, x, y, size, anchor = "middle", color = "#222", weight = "normal") => {
      if (!text || text === "undefined") return "";
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

    // 1. Exterior Dimensions
    const topDim = `<line x1="${PAD}" y1="${startY - 25}" x2="${PAD + levelPixelW}" y2="${startY - 25}" stroke="#5B7C99" stroke-width="2" />
                    ${renderText(wFt + "'", PAD + levelPixelW/2, startY - 35, 16, "middle", "#5B7C99")}`;
    const sideDim = `<line x1="${PAD - 25}" y1="${startY}" x2="${PAD - 25}" y2="${startY + levelPixelH}" stroke="#5B7C99" stroke-width="2" />
                     ${renderText(hFt + "'", PAD - 35, startY + levelPixelH/2, 16, "end", "#5B7C99")}`;

    // 2. Rooms
    const roomSvg = (lvl.rooms || []).map(r => {
      const rx = PAD + r.x * PX; const ry = startY + r.y * PX;
      const rw = r.w * PX; const rh = r.h * PX;
      
      const labelText = r.label || r.type || "Room";
      const dimText = `${r.w}' x ${r.h}'`;

      let fill = "white";
      let extras = "";
      if (r.type === "stairs") {
         fill = "#f8f8f8";
         for(let i=1; i<6; i++) extras += `<line x1="${rx}" y1="${ry + (rh/6)*i}" x2="${rx+rw}" y2="${ry + (rh/6)*i}" stroke="#ddd" />`;
      }

      return `
        <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${fill}" stroke="#222" stroke-width="2" />
        ${extras}
        ${renderText(labelText.toUpperCase(), rx + rw/2, ry + rh/2 - 8, 11, "middle", "#111")}
        ${renderText(dimText, rx + rw/2, ry + rh/2 + 10, 10, "middle", "#888")}
      `;
    }).join("\n");

    // 3. Doors & Windows
    const doorSvg = (lvl.doors || []).map(d => {
      const dx = PAD + d.x * PX; const dy = startY + d.y * PX;
      return d.dir === "vertical" 
        ? `<rect x="${dx-3}" y="${dy-18}" width="6" height="36" fill="white" />`
        : `<rect x="${dx-18}" y="${dy-3}" width="36" height="6" fill="white" />`;
    }).join("\n");

    const winSvg = (lvl.windows || []).map(w => {
      const wx = PAD + w.x * PX; const wy = startY + w.y * PX;
      return w.dir === "vertical"
        ? `<rect x="${wx-2}" y="${wy-18}" width="4" height="36" fill="#AEEEEE" />`
        : `<rect x="${wx-18}" y="${wy-2}" width="36" height="4" fill="#AEEEEE" />`;
    }).join("\n");

    const header = renderText(`LEVEL ${levelNum} (${wFt * hFt} SQ FT)`, PAD, yOffset + 40, 20, "start", "#222");

    groups.push(`<g>${header}${topDim}${sideDim}${roomSvg}${doorSvg}${winSvg}</g>`);
    yOffset += levelPixelH + PAD + GAP;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${yOffset}" viewBox="0 0 ${svgWidth} ${yOffset}"><rect width="100%" height="100%" fill="#F9F8F4" />${groups.join("\n")}</svg>`;
}

module.exports = { renderPlanSvg };