// lib/renderPlanSvg.js
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

    // 1. Exterior Dimension Lines
    const topDim = `
      <line x1="${PAD}" y1="${startY - 25}" x2="${PAD + levelPixelW}" y2="${startY - 25}" stroke="#5B7C99" stroke-width="2" />
      <text x="${PAD + levelPixelW/2}" y="${startY - 35}" font-family="Arial, sans-serif" font-size="16" fill="#5B7C99" text-anchor="middle" font-weight="bold">${wFt}'</text>`;
    
    const sideDim = `
      <line x1="${PAD - 25}" y1="${startY}" x2="${PAD - 25}" y2="${startY + levelPixelH}" stroke="#5B7C99" stroke-width="2" />
      <text x="${PAD - 35}" y="${startY + levelPixelH/2}" font-family="Arial, sans-serif" font-size="16" fill="#5B7C99" text-anchor="end" dominant-baseline="middle" font-weight="bold">${hFt}'</text>`;

    // 2. Rooms
    const roomSvg = (lvl.rooms || []).map(r => {
      const rx = PAD + r.x * PX; 
      const ry = startY + r.y * PX;
      const rw = r.w * PX; 
      const rh = r.h * PX;
      const labelText = r.label || r.type || "Room";
      const dimText = `${r.w}' x ${r.h}'`;

      return `
        <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="white" stroke="#111" stroke-width="3" />
        <text x="${rx + rw/2}" y="${ry + rh/2 - 8}" font-family="Arial, sans-serif" font-size="12" fill="#111" text-anchor="middle" font-weight="bold">${labelText.toUpperCase()}</text>
        <text x="${rx + rw/2}" y="${ry + rh/2 + 10}" font-family="Arial, sans-serif" font-size="10" fill="#666" text-anchor="middle">${dimText}</text>
      `;
    }).join("\n");

    // 3. Doors & Windows (High Contrast)
    const doorSvg = (lvl.doors || []).map(d => {
      const dx = PAD + d.x * PX; const dy = startY + d.y * PX;
      return d.dir === "vertical" 
        ? `<rect x="${dx-4}" y="${dy-18}" width="8" height="36" fill="white" stroke="none" />`
        : `<rect x="${dx-18}" y="${dy-4}" width="36" height="8" fill="white" stroke="none" />`;
    }).join("\n");

    const winSvg = (lvl.windows || []).map(w => {
      const wx = PAD + w.x * PX; const wy = startY + w.y * PX;
      return w.dir === "vertical"
        ? `<rect x="${wx-2}" y="${wy-18}" width="4" height="36" fill="#5B7C99" />`
        : `<rect x="${wx-18}" y="${wy-2}" width="36" height="4" fill="#5B7C99" />`;
    }).join("\n");

    const header = `<text x="${PAD}" y="${yOffset + 40}" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#111">LEVEL ${levelNum} (${wFt * hFt} SQ FT)</text>`;

    groups.push(`<g>${header}${topDim}${sideDim}${roomSvg}${doorSvg}${winSvg}</g>`);
    yOffset += levelPixelH + PAD + GAP;
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${yOffset}" viewBox="0 0 ${svgWidth} ${yOffset}">
  <rect width="100%" height="100%" fill="#F9F8F4" />
  ${groups.join("\n")}
</svg>`.trim();
}

module.exports = { renderPlanSvg };