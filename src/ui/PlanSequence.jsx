import React, { useEffect, useRef, useState } from 'react';
import { prepareSequence, playSequence, finishSequence, prefersReducedMotion } from '../lib/planSequence.js';

/* The hero.
 *
 * A real generated plan draws itself on black, then blooms into colour
 * and hands over to the studio. The plans are baked by
 * scripts/build-demo-plans.js from the live engine, so they are genuine
 * output rather than mock-ups, and re-running that script refreshes them.
 *
 * Which plan is shown depends on the shape of the space available, not on
 * a portrait/landscape switch: that is really one question - how close is
 * the drawing's proportion to its container's - and scoring it covers
 * every window size rather than two. Nothing is ever rotated to fit;
 * rotating a plan rotates its room labels and dimension strings with it.
 */
const fitScore = (planRatio, boxRatio) => {
    if (!planRatio || !boxRatio) return 0;
    return Math.min(planRatio / boxRatio, boxRatio / planRatio);
};

export const PlanSequence = ({ onOpenStudio }) => {
    const paperRef = useRef(null);
    const rootRef = useRef(null);
    const cancelRef = useRef(null);
    const [plans, setPlans] = useState([]);
    const [brief, setBrief] = useState('');
    const [dark, setDark] = useState(true);
    const [settled, setSettled] = useState(false);

    useEffect(() => {
        let alive = true;
        fetch('/demo/manifest.json')
            .then((r) => r.json())
            .then((list) => { if (alive) setPlans(Array.isArray(list) ? list : []); })
            .catch(() => { if (alive) setPlans([]); });
        return () => { alive = false; };
    }, []);

    useEffect(() => {
        if (!plans.length) return undefined;
        let alive = true;

        const paper = paperRef.current;
        const box = paper?.getBoundingClientRect();
        const boxRatio = box && box.height > 8 ? box.width / box.height : 1.6;

        const scored = plans
            .map((p) => ({ p, score: fitScore(p.ratio, boxRatio) }))
            .sort((a, b) => b.score - a.score);
        const best = scored[0].score;
        const pool = scored.filter((x) => x.score >= Math.max(0.45, best * 0.75));
        const chosen = pool[Math.floor(Math.random() * pool.length)].p;

        fetch(`/demo/${chosen.file}`)
            .then((r) => r.text())
            .then((text) => {
                if (!alive || !paperRef.current) return;
                paperRef.current.innerHTML = text;
                const svg = paperRef.current.querySelector('svg');
                if (!svg) return;
                svg.removeAttribute('width');
                svg.removeAttribute('height');
                svg.setAttribute('role', 'img');
                svg.setAttribute('aria-label',
                    `Generated floor plan for ${chosen.brief}`);
                setBrief(chosen.brief);

                const { beats } = prepareSequence(svg);
                if (prefersReducedMotion()) {
                    finishSequence(svg, beats);
                    setDark(false);
                    setSettled(true);
                    return;
                }
                // Commit the hidden resting state before the first beat,
                // or the browser coalesces both into one paint and
                // nothing appears to animate.
                void svg.getBoundingClientRect();
                cancelRef.current = playSequence(svg, beats, {
                    speed: 2,
                    onReveal: () => { if (alive) setDark(false); },
                    onDone: () => { if (alive) setSettled(true); },
                });
            })
            .catch(() => { if (alive) { setDark(false); setSettled(true); } });

        return () => {
            alive = false;
            cancelRef.current?.();
            cancelRef.current = null;
        };
    }, [plans]);

    // Any deliberate move to get on with it finishes the drawing rather
    // than blocking: the visitor sees the endpoint immediately because
    // they asked to move on.
    useEffect(() => {
        if (settled) return undefined;
        const skip = () => {
            cancelRef.current?.();
            cancelRef.current = null;
            setDark(false);
            setSettled(true);
        };
        window.addEventListener('wheel', skip, { passive: true, once: true });
        window.addEventListener('touchmove', skip, { passive: true, once: true });
        window.addEventListener('keydown', skip, { once: true });
        return () => {
            window.removeEventListener('wheel', skip);
            window.removeEventListener('touchmove', skip);
            window.removeEventListener('keydown', skip);
        };
    }, [settled]);

    return (
        <section
            className={'hero-seq' + (dark ? ' seq-dark' : '') + (settled ? ' is-settled' : '')}
            ref={rootRef}
            id="hero"
        >
            <p className="hero-seq-brief">
                <span>Brief</span> {brief || ' '}
            </p>
            <div className="hero-seq-paper seq-surface" ref={paperRef}/>
            <div className="hero-seq-cta">
                <button type="button" className="cta-glow" onClick={onOpenStudio}>
                    Open Live Studio
                    <span aria-hidden="true">&rarr;</span>
                </button>
                <p className="hero-seq-note">Free. No account needed.</p>
            </div>
        </section>
    );
};
