// lib/renderPlanSvg.js
module.exports = {
  renderPlanSvg: function(planSpec) {
    if (!planSpec || !Array.isArray(planSpec.levels)) return "";

    const PX = 18; 
    const PAD = 100;
    const GAP = 150;
    
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

      // Exterior Dimensions
      const dims = `
        <line x1="${PAD}" y1="${startY - 40}" x2="${PAD + levelPixelW}" y2="${startY - 40}" stroke="#5B7C99" stroke-width="2" />
        <text x="${PAD + levelPixelW/2}" y="${startY - 50}" font-family="Arial" font-size="18" fill="#5B7C99" text-anchor="middle" font-weight="bold">${wFt}'</text>
        <line x1="${PAD - 40}" y1="${startY}" x2="${PAD - 40}" y2="${startY + levelPixelH}" stroke="#5B7C99" stroke-width="2" />
        <text x="${PAD - 50}" y="${startY + levelPixelH/2}" font-family="Arial" font-size="18" fill="#5B7C99" text-anchor="end" dominant-baseline="middle" font-weight="bold">${hFt}'</text>
      `;

      // Rooms
      const roomSvg = (lvl.rooms || []).map(r => {
        // FAILSAFE: Support both "w" and "width"
        const width = Number(r.w || r.width || 0);
        const height = Number(r.h || r.height || 0);
        const xPos = Number(r.x || 0);
        const yPos = Number(r.y || 0);

        const rx = PAD + (xPos * PX); 
        const ry = startY + (yPos * PX);
        const rw = width * PX; 
        const rh = height * PX;
        const label = (r.label || r.type || "Room").toUpperCase();

        // Only draw if we have dimensions
        if (width === 0 || height === 0) return "";

        return `
          <g>
            <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="#FFFFFF" stroke="#000000" stroke-width="4" />
            <text x="${rx + rw/2}" y="${ry + rh/2 - 6}" font-family="Arial" font-size="12" fill="#000000" text-anchor="middle" font-weight="bold">${label}</text>
            <text x="${rx + rw/2}" y="${ry + rh/2 + 12}" font-family="Arial" font-size="10" fill="#666666" text-anchor="middle">${width}' x ${height}'</text>
          </g>
        `;
      }).join("\n");

      // Openings
      const openings = (lvl.doors || []).map(d => {
        const dx = PAD + (d.x * PX); const dy = startY + (d.y * PX);
        return d.dir === "vertical" 
          ? `<rect x="${dx-6}" y="${dy-18}" width="12" height="36" fill="#FFFFFF" />`
          : `<rect x="${dx-18}" y="${dy-6}" width="36" height="12" fill="#FFFFFF" />`;
      }).join("\n") + (lvl.windows || []).map(w => {
        const wx = PAD + (w.x * PX); const wy = startY + (w.y * PX);
        return w.dir === "vertical"
          ? `<rect x="${wx-3}" y="${wy-18}" width="6" height="36" fill="#AEEEEE" stroke="#5B7C99" stroke-width="1" />`
          : `<rect x="${wx-18}" y="${wy-3}" width="36" height="6" fill="#AEEEEE" stroke="#5B7C99" stroke-width="1" />`;
      }).join("\n");

      const header = `<text x="${PAD}" y="${yOffset + 40}" font-family="Arial" font-size="24" font-weight="bold" fill="#000000">LEVEL ${levelNum} (${wFt * hFt} SQ FT)</text>`;

      groups.push(`<g>${header}${dims}${roomSvg}${openings}</g>`);
      yOffset += levelPixelH + PAD + GAP;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${yOffset}" viewBox="0 0 ${svgWidth} ${yOffset}"><rect width="100%" height="100%" fill="#F9F8F4" />${groups.join("\n")}</svg>`;
  }
};