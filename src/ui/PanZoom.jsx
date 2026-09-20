import React, { useEffect, useRef, useState } from 'react';
import { ArrowsOut as ArrowsOutIcon, Minus as MinusIcon, Plus as PlusIcon } from '@phosphor-icons/react';
import { clamp } from '../lib/elevations.js';

/* `ratio` sets the stage's aspect box per view. The three hero tabs have
   very different natural shapes (the plan sheet is 2.37:1, the elevation
   sheet 1.25:1), so one fixed box letterboxed at least one of them into a
   third of its own frame. */
export const PanZoom = ({ src, alt, ratio }) => {
    const wrap = useRef(null);
    const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
    const drag = useRef(null);
    const pointers = useRef(new Map());
    const pinch = useRef(null);

    useEffect(() => { setView({ scale: 1, x: 0, y: 0 }); }, [src]);

    const clamp = (s) => Math.min(4, Math.max(0.6, s));

    useEffect(() => {
        const el = wrap.current;
        if (!el) return;
        const onWheel = (e) => {
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            const px = e.clientX - rect.left - rect.width / 2;
            const py = e.clientY - rect.top - rect.height / 2;
            setView((v) => {
                const next = clamp(v.scale * (e.deltaY > 0 ? 0.9 : 1.1));
                const k = next / v.scale;
                // Anchor the zoom on the cursor instead of the panel centre.
                return { scale: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
            });
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    const onPointerDown = (e) => {
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        e.currentTarget.setPointerCapture(e.pointerId);
        if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), scale: view.scale };
        } else {
            drag.current = { x: e.clientX - view.x, y: e.clientY - view.y };
        }
    };

    const onPointerMove = (e) => {
        if (!pointers.current.has(e.pointerId)) return;
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.current.size === 2 && pinch.current) {
            const [a, b] = [...pointers.current.values()];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            setView((v) => ({ ...v, scale: clamp(pinch.current.scale * (d / pinch.current.d)) }));
        } else if (drag.current) {
            setView((v) => ({ ...v, x: e.clientX - drag.current.x, y: e.clientY - drag.current.y }));
        }
    };

    const endPointer = (e) => {
        pointers.current.delete(e.pointerId);
        if (pointers.current.size < 2) pinch.current = null;
        if (pointers.current.size === 0) drag.current = null;
    };

    return (
        <div className="panzoom">
            <div
                ref={wrap}
                className="panzoom-stage"
                style={ratio ? { aspectRatio: String(ratio) } : undefined}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endPointer}
                onPointerCancel={endPointer}
            >
                <img
                    src={src}
                    alt={alt}
                    draggable="false"
                    width="1600"
                    height="1000"
                    style={{ transform: 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.scale + ')' }}
                />
            </div>
            <div className="panzoom-bar">
                <button type="button" onClick={() => setView((v) => ({ ...v, scale: clamp(v.scale * 0.8) }))} aria-label="Zoom out">
                    <MinusIcon size={18} weight="bold" />
                </button>
                <span className="mono">{Math.round(view.scale * 100)}%</span>
                <button type="button" onClick={() => setView((v) => ({ ...v, scale: clamp(v.scale * 1.25) }))} aria-label="Zoom in">
                    <PlusIcon size={18} weight="bold" />
                </button>
                <button type="button" onClick={() => setView({ scale: 1, x: 0, y: 0 })} aria-label="Reset view">
                    <ArrowsOutIcon size={18} weight="bold" />
                </button>
            </div>
        </div>
    );
};
