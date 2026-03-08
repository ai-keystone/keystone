export const svgToPngDataUrl = (svgMarkup, options = {}) => new Promise((resolve, reject) => {
    try {
        if (!svgMarkup || typeof svgMarkup !== 'string') {
            reject(new Error('svgToPngDataUrl: missing SVG markup'));
            return;
        }

        const {
            background = '#F6F4EF',
            pixelRatio = window.devicePixelRatio && window.devicePixelRatio > 1 ? Math.min(window.devicePixelRatio, 2) : 1,
        } = options;

        let svg = svgMarkup.trim();
        if (!svg.includes('xmlns=')) {
            svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
        }

        const widthMatch = svg.match(/width=["']([\d.]+)(px)?["']/i);
        const heightMatch = svg.match(/height=["']([\d.]+)(px)?["']/i);
        const viewBoxMatch = svg.match(/viewBox=["']([\d.\s-]+)["']/i);

        let width = widthMatch ? parseFloat(widthMatch[1]) : null;
        let height = heightMatch ? parseFloat(heightMatch[1]) : null;

        if ((!width || !height) && viewBoxMatch) {
            const vb = viewBoxMatch[1].trim().split(/\s+/).map(Number);
            if (vb.length === 4) {
                if (!width) width = vb[2];
                if (!height) height = vb[3];
            }
        }

        if (!width) width = 1600;
        if (!height) height = 1000;

        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = Math.max(1, Math.round(width * pixelRatio));
                canvas.height = Math.max(1, Math.round(height * pixelRatio));
                ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                if (background) {
                    ctx.fillStyle = background;
                    ctx.fillRect(0, 0, width, height);
                } else {
                    ctx.clearRect(0, 0, width, height);
                }
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/png'));
            } catch (err) {
                reject(err);
            }
        };
        img.onerror = () => reject(new Error('svgToPngDataUrl: unable to rasterize SVG'));
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    } catch (err) {
        reject(err);
    }
});
