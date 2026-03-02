// lib/renderPlanSvg.js
const path = require("path");
const TextToSVG = require("text-to-svg");

const fontPath = path.join(__dirname, "Inter-Regular.ttf");
let textToSVG = null;
try { textToSVG = TextToSVG.loadSync(fontPath); } catch (e) { console.error("Font missing", e); }

function renderPlanSvg(planSpec, opts = {}) {
  if (!planSpec || !Array.isArray(planSpec.levels)) return "";

  const PX = opts.pxPerUnit ?? 18;
  const PAD = 40; 
  const GAP = 60;
  
  let yOffset = 0;
  let svgWidth = 0;
  const groups = [];

  for (const lvl of planSpec.levels) {
    const w = (Number(lvl.width) || 50) * PX;
    const h = (Number(lvl.height) || 50) * PX;
    const levelTotalW = w + PAD * 2;
    const levelTotalH = h + PAD * 2 + 40;
    svgWidth = Math.max(svgWidth, levelTotalW);
    const startY = yOffset + PAD + 30;

    // 1. Draw Rooms
    const roomSvg = (lvl.rooms || []).map(r => {
      const rx = PAD + r.x * PX;
      const ry = startY + r.y * PX;
      const rw = r.w * PX;
      const rh = r.h * PX;
      
      let labelSvg = "";
      const labelText = r.label || r.type || "";
      const fontSize = Math.max(10, Math.min(14, Math.min(rw, rh) / 4));

      if (textToSVG && rw > 20 && rh > 20) {
        const d = textToSVG.getD(labelText, {
          x: rx + rw/2, y: ry + rh/2, fontSize, anchor: "center middle", attributes: { fill: "#333" }
        });
        labelSvg = `<path d="${d}" fill="#333" />`;
      }

      return `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="white" stroke="#222" stroke-width="3" />${labelSvg}`;
    }).join("\n");

    // 2. Draw Doors (White Gap + Gray Line)
    const DOOR_LEN = 3.5 * PX;
    const WALL_THICK = 6;
    const doorSvg = (lvl.doors || []).map(d => {
      const dx = PAD + d.x * PX;
      const dy = startY + d.y * PX;
      if (d.dir === "vertical") {
         return `<rect x="${dx - WALL_THICK/2}" y="${dy - DOOR_LEN/2}" width="${WALL_THICK}" height="${DOOR_LEN}" fill="white" />
                 <line x1="${dx}" y1="${dy - DOOR_LEN/2}" x2="${dx}" y2="${dy + DOOR_LEN/2}" stroke="#ccc" stroke-width="1" />`;
      } else {
         return `<rect x="${dx - DOOR_LEN/2}" y="${dy - WALL_THICK/2}" width="${DOOR_LEN}" height="${WALL_THICK}" fill="white" />
                 <line x1="${dx - DOOR_LEN/2}" y1="${dy}" x2="${dx + DOOR_LEN/2}" y2="${dy}" stroke="#ccc" stroke-width="1" />`;
      }
    }).join("\n");

    // 3. Draw Windows (Cyan Lines on top of walls)
    const WIN_LEN = 4 * PX;
    const winSvg = (lvl.windows || []).map(wItem => {
      const wx = PAD + wItem.x * PX;
      const wy = startY + wItem.y * PX;
      // Windows are thinner cyan rectangles sitting ON the wall
      if (wItem.dir === "vertical") {
         return `<rect x="${wx - 2}" y="${wy - WIN_LEN/2}" width="4" height="${WIN_LEN}" fill="#AEEEEE" stroke="#5F9EA0" stroke-width="1" />`;
      } else {
         return `<rect x="${wx - WIN_LEN/2}" y="${wy - 2}" width="${WIN_LEN}" height="4" fill="#AEEEEE" stroke="#5F9EA0" stroke-width="1" />`;
      }
    }).join("\n");

    // Header
    let headerSvg = "";
    if (textToSVG) {
       const hd = textToSVG.getD(`Level ${lvl.level}`, { x: PAD, y: yOffset + 25, fontSize: 18, anchor: "left baseline" });
       headerSvg = `<path d="${hd}" fill="#222" />`;
    }

    groups.push(`<g>${headerSvg}${roomSvg}${doorSvg}${winSvg}</g>`);
    yOffset += levelTotalH + GAP;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${yOffset}" viewBox="0 0 ${svgWidth} ${yOffset}"><rect width="100%" height="100%" fill="white" />${groups.join("\n")}</svg>`;
}

module.exports = { renderPlanSvg };