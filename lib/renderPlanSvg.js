// lib/renderPlanSvg.js (CommonJS)
const path = require("path");
const TextToSVG = require("text-to-svg");

// Load the font once explicitly from the lib folder
// Make sure 'Inter-Regular.ttf' is inside the 'lib' folder
const fontPath = path.join(__dirname, "Inter-Regular.ttf");
let textToSVG = null;

try {
  textToSVG = TextToSVG.loadSync(fontPath);
} catch (e) {
  console.error("FAILED TO LOAD FONT:", e);
  // Fallback if font is missing (prevents crash, but might still show boxes if system has no fonts)
  textToSVG = null;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPlanSvg(planSpec, opts = {}) {
  if (!planSpec || !Array.isArray(planSpec.levels)) {
    throw new Error("Invalid planSpec: missing levels");
  }

  const PX_PER_UNIT = opts.pxPerUnit ?? 18;
  const PAD = opts.padding ?? 24;
  const GAP = opts.gap ?? 48;

  let yOffset = 0;
  let svgWidth = 0;
  const groups = [];

  for (const lvl of planSpec.levels) {
    const levelWidthUnits = Number(lvl.width) || 0;
    const levelHeightUnits = Number(lvl.height) || 0;

    const levelPixelW = levelWidthUnits * PX_PER_UNIT;
    const levelPixelH = levelHeightUnits * PX_PER_UNIT;

    const levelW = PAD * 2 + levelPixelW;
    const levelH = PAD * 2 + levelPixelH + 36; // header space

    svgWidth = Math.max(svgWidth, levelW);

    const headerY = yOffset + 24;
    const levelTopY = yOffset + PAD + 20;

    // --- RENDER HEADER TEXT ---
    let headerSvg = "";
    const headerText = `Level ${lvl.level}`;
    
    if (textToSVG) {
      // Convert text to Vector Path
      const headerPath = textToSVG.getD(headerText, {
        x: PAD,
        y: headerY,
        fontSize: 18,
        anchor: "left baseline",
        attributes: { fill: "#111", stroke: "none" }
      });
      headerSvg = `<path d="${headerPath}" fill="#111" />`;
    } else {
      // Fallback (will likely be boxes on Vercel)
      headerSvg = `<text x="${PAD}" y="${headerY}" font-family="sans-serif" font-size="18" font-weight="bold">${escapeXml(headerText)}</text>`;
    }

    const border = `
      <rect x="${PAD}" y="${levelTopY}"
        width="${levelPixelW}"
        height="${levelPixelH}"
        fill="white"
        stroke="black"
        stroke-width="4"/>
    `;

    const rooms = (lvl.rooms || []).map((r) => {
      const x = PAD + (Number(r.x) || 0) * PX_PER_UNIT;
      const y = levelTopY + (Number(r.y) || 0) * PX_PER_UNIT;
      const w = (Number(r.w) || 0) * PX_PER_UNIT;
      const h = (Number(r.h) || 0) * PX_PER_UNIT;

      const label = r.label || r.type || "Room";

      // Auto-scale text size
      const minDim = Math.min(w, h);
      const fontSize = Math.max(10, Math.min(16, minDim * 0.18));
      
      let textElement = "";

      if (textToSVG) {
        // Convert Label to Vector Path
        // We use center/middle anchoring to place it perfectly in the rect
        const pathData = textToSVG.getD(label, {
          x: x + w / 2,
          y: y + h / 2,
          fontSize: fontSize,
          anchor: "center middle", 
          attributes: { fill: "#111", stroke: "none" }
        });
        textElement = `<path d="${pathData}" fill="#111" />`;
      } else {
        textElement = `
          <text x="${x + w / 2}" y="${y + h / 2}"
            font-family="sans-serif" font-size="${fontSize}"
            text-anchor="middle" dominant-baseline="middle">
            ${escapeXml(label)}
          </text>`;
      }

      return `
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white" stroke="black" stroke-width="2"/>
        ${textElement}
      `;
    }).join("\n");

    groups.push(`<g>${headerSvg}${border}${rooms}</g>`);

    yOffset += levelH + GAP;
  }

  const svgHeight = yOffset;

  return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="${svgWidth}"
     height="${svgHeight}"
     viewBox="0 0 ${svgWidth} ${svgHeight}">
  <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="white"/>
  ${groups.join("\n")}
</svg>`.trim();
}

module.exports = { renderPlanSvg };