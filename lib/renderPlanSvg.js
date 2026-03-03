// lib/renderPlanSvg.js
module.exports = {
  renderPlanSvg: function(planSpec) {
    if (!planSpec || !Array.isArray(planSpec.levels)) return "";

    const PX = 16; // 1 Foot = 16 pixels
    const PAD = 80;
    const GAP = 120;
    
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

      // Dimensions
      const topDim = `
        <line x1="${PAD}" y1="${startY - 30}" x2="${PAD + levelPixelW}" y2="${startY - 30}" stroke="#5B7C99" stroke-width="2" />
        <text x="${PAD + levelPixelW/2}" y="${startY - 40}" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#5B7C99" text-anchor="middle" font-weight="bold">${wFt}'</text>`;
      
      const sideDim = `
        <line x1="${PAD - 30}" y1="${startY}" x2="${PAD - 30}" y2="${startY + levelPixelH}" stroke="#5B7C99" stroke-width="2" />
        <text x="${PAD - 40}" y="${startY + levelPixelH/2}" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#5B7C99" text-anchor="end" dominant-baseline="middle" font-weight="bold">${hFt}'</text>`;

      // Rooms
      const roomSvg = (lvl.rooms || []).map(r => {
        const rx = PAD + r.x * PX; 
        const ry = startY + r.y * PX;
        const rw = r.w * PX; 
        const rh = r.h * PX;
        const label = (r.label || r.type || "Room").toUpperCase();
        
        return `
          <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="#FFFFFF" stroke="#000000" stroke-width="3" />
          <text x="${rx + rw/2}" y="${ry + rh/2 - 6}" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#000000" text-anchor="middle" font-weight="bold">${label}</text>
          <text x="${rx + rw/2}" y="${ry + rh/2 + 10}" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#666666" text-anchor="middle">${r.w}' x ${r.h}'</text>
        `;
      }).join("\n");

      // Openings
      const doorSvg = (lvl.doors || []).map(d => {
        const dx = PAD + d.x * PX; const dy = startY + d.y * PX;
        return d.dir === "vertical" 
          ? `<rect x="${dx-5}" y="${dy-16}" width="10" height="32" fill="#FFFFFF" stroke="none" />`
          : `<rect x="${dx-16}" y="${dy-5}" width="32" height="10" fill="#FFFFFF" stroke="none" />`;
      }).join("\n");

      const winSvg = (lvl.windows || []).map(w => {
        const wx = PAD + w.x * PX; const wy = startY + w.y * PX;
        return w.dir === "vertical"
          ? `<rect x="${wx-3}" y="${wy-16}" width="6" height="32" fill="#AEEEEE" stroke="#5B7C99" stroke-width="1" />`
          : `<rect x="${wx-16}" y="${wy-3}" width="32" height="6" fill="#AEEEEE" stroke="#5B7C99" stroke-width="1" />`;
      }).join("\n");

      const header = `<text x="${PAD}" y="${yOffset + 40}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#000000">LEVEL ${levelNum} (${wFt * hFt} SQ FT)</text>`;

      groups.push(`<g>${header}${topDim}${sideDim}${roomSvg}${doorSvg}${winSvg}</g>`);
      yOffset += levelPixelH + PAD + GAP;
    });

    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${yOffset}" viewBox="0 0 ${svgWidth} ${yOffset}">
  <rect width="100%" height="100%" fill="#F9F8F4" />
  ${groups.join("\n")}
</svg>`.trim();
  }
};