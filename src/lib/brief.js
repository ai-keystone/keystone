/* Turns "3 bed, 2 bath, 2200 sq ft, garage" into survey values.
   Deliberately a shortcut, not magic: it returns what it matched so the
   studio can show its reading back and let the user correct it. */
export const parseBrief = (text) => {
    const t = String(text || '').toLowerCase();
    const patch = {};
    const read = [];

    const bed = t.match(/(\d+)\s*(?:bed|bedroom|br\b)/);
    if (bed) {
        const n = Math.min(6, Math.max(1, parseInt(bed[1], 10)));
        patch.bedrooms = n + ' Bed';
        read.push(n + ' bedrooms');
    }

    const bath = t.match(/(\d+)\s*(?:bath|bathroom|ba\b)/);
    if (bath) {
        const n = Math.min(6, Math.max(1, parseInt(bath[1], 10)));
        patch.bathrooms = n + ' Bath';
        read.push(n + ' bathrooms');
    }

    const area = t.match(/(\d[\d,]{2,})\s*(?:sq\s*\.?\s*f|sf\b|square\s*f)/) || t.match(/(\d[\d,]{3,})/);
    if (area) {
        const n = Math.min(10000, Math.max(600, parseInt(area[1].replace(/,/g, ''), 10)));
        patch.totalArea = String(n);
        read.push(n.toLocaleString() + ' sq ft');
    }

    if (/\b(single|one|1)[\s-]*(?:story|storey|level|floor)\b/.test(t)) {
        patch.stories = '1 Story';
        read.push('single story');
    } else if (/\b(two|2)[\s-]*(?:story|storey|level|floor)\b/.test(t)) {
        patch.stories = '2 Stories';
        read.push('two stories');
    }

    if (/\bno garage|without garage\b/.test(t)) {
        patch.garage = 'No Garage';
        read.push('no garage');
    } else {
        const car = t.match(/(\d)\s*[-\s]?car/);
        if (car) {
            const n = Math.min(3, Math.max(1, parseInt(car[1], 10)));
            patch.garage = n + ' Car Garage';
            read.push(n + '-car garage');
        } else if (/\bgarage\b/.test(t)) {
            patch.garage = '2 Car Garage';
            read.push('2-car garage');
        }
    }

    if (/\boffice|study\b/.test(t)) { patch.features = '1 Study'; read.push('a study'); }
    if (/\bopen[\s-]*(?:concept|plan)\b/.test(t)) patch.openConcept = 'Open Concept (Combined)';

    return { patch, read };
};

/* Pointer-based pan and zoom for the hero drawing.
   Uses pointer events rather than mouse events, so it works with touch
   and pen; the studio canvas still only binds mouse handlers and cannot
   be panned on a phone at all. That gets fixed in the studio pass. */
