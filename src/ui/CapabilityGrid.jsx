import React, { useRef } from 'react';
import {
    Blueprint as BlueprintIcon,
    Buildings as BuildingsIcon,
    ChatText as ChatTextIcon,
    FileDashed as FileDashedIcon,
    Calculator as CalculatorIcon,
    DownloadSimple as DownloadSimpleIcon,
} from '@phosphor-icons/react';

/* The one block on the site that lights up.
 *
 * This is the legacy "Six capabilities" grid, rebuilt. The original
 * carried a GSAP dependency, ten DOM particles spawned per card on hover
 * and a global spotlight node appended to <body> - about 325 animated
 * nodes in total, which is why it was removed. The effect people actually
 * liked was only ever the border glow, and that is two custom properties
 * and a masked radial gradient: no library, no particles, no rAF loop,
 * and no React re-render, because the pointer position is written
 * straight to the node.
 *
 * It earns its ornament by being the only thing on the page with any.
 * Everything around it is white paper and hairlines, so this block is
 * where the eye goes.
 */
const CAPABILITIES = [
    { Icon: ChatTextIcon, label: 'Brief', title: 'Plain language in',
      body: 'Describe the house in a sentence. No drafting vocabulary, no dimensions to guess at.' },
    { Icon: BlueprintIcon, label: 'Plan', title: 'A dimensioned floor plan',
      body: 'Every level, with room names, areas and overall dimensions.' },
    { Icon: BuildingsIcon, label: 'Elevations', title: 'All four facades',
      body: 'Front, rear, left and right, generated from the same geometry as the plan.' },
    { Icon: FileDashedIcon, label: 'Render', title: 'An exterior to look at',
      body: 'A photorealistic view of the house, built from your brief rather than a stock photo.' },
    { Icon: DownloadSimpleIcon, label: 'Export', title: 'CAD-ready DXF',
      body: 'Open it in any CAD tool, or hand it to a designer to carry on from.' },
    { Icon: CalculatorIcon, label: 'Estimate', title: 'A concept cost range',
      body: 'A quantity takeoff and an early budget, so geometry and money are discussed together.' },
];

export const CapabilityGrid = () => {
    const gridRef = useRef(null);

    // Written to the node, never to state. A pointermove that re-rendered
    // React would cost a full reconciliation per frame.
    const track = (e) => {
        const el = gridRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', e.clientX - r.left + 'px');
        el.style.setProperty('--my', e.clientY - r.top + 'px');
        el.style.setProperty('--glow', '1');
    };
    const clear = () => gridRef.current?.style.setProperty('--glow', '0');

    return (
        <section className="capabilities" aria-labelledby="capabilities-title">
            <div className="capabilities-inner">
                <p className="capabilities-eyebrow">Inside every session</p>
                <h2 id="capabilities-title">Six things, every time.</h2>
                <div
                    className="capability-grid"
                    ref={gridRef}
                    onPointerMove={track}
                    onPointerLeave={clear}
                >
                    {CAPABILITIES.map(({ Icon, label, title, body }) => (
                        <article className="capability" key={label}>
                            <Icon size={28} weight="light" aria-hidden="true"/>
                            <p className="capability-label">{label}</p>
                            <h3>{title}</h3>
                            <p className="capability-body">{body}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};
