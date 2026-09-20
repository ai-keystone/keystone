import React from 'react';
import { ASSETS } from '../data/assets.js';
import { useRouteMeta } from '../hooks/useRouteMeta.js';
import { LIVE_STUDIO_HASH } from '../lib/routing.js';
import { SubpageChrome } from '../ui/chrome.jsx';

export const RoadmapPage = () => {
    useRouteMeta('/roadmap');
    const roadmapModules = [
        {
            phase: 'Live today',
            title: 'Guided brief capture',
            body: 'The guided intake already turns loose preferences into structured discovery data before the first serious design conversation.',
            image: ASSETS.workflow.clientIntake,
            status: 'Live',
        },
        {
            phase: 'Live today',
            title: 'Generated plan + blueprint image',
            body: 'Keystone already returns a usable floor plan and a clean blueprint image you can download, share, and review.',
            image: ASSETS.workflow.planExport,
            status: 'Live',
        },
        {
            phase: 'Live today',
            title: 'Elevation views',
            body: 'The same generated plan now comes with deterministic elevation views grounded in the plan geometry and survey inputs.',
            image: ASSETS.exampleElevationSheet,
            status: 'Live',
        },
        {
            phase: 'Live today',
            title: 'Exterior render',
            body: 'An optional exterior render is already available to give the household a visual anchor during the early conversation.',
            image: ASSETS.roadmap.exteriorStudy,
            status: 'Live',
        },
        {
            phase: 'Live today',
            title: 'Vector DXF export',
            body: 'CAD-ready DXF export is live so approved concept geometry can move into studio review and downstream drafting more cleanly.',
            image: ASSETS.roadmap.cadExport,
            status: 'Live',
        },
        {
            phase: 'Live today',
            title: 'Planning estimate layer',
            body: 'The generated plan now includes a concept-level quantity takeoff and early cost range so the household can discuss geometry and budget together.',
            image: ASSETS.roadmap.overview,
            status: 'Live',
        },
        {
            phase: 'Roadmap next',
            title: '3D viewer and schedule depth',
            body: 'Interactive 3D viewing and project schedule intelligence are part of the broader platform direction, but they are not marketed as live today.',
            image: ASSETS.phase3[1],
            status: 'Planned',
        },
    ];
    const roadmapTracks = [
        ['Estimates', 'Tie quantity logic to early project conversations without overselling precision.'],
        ['Scheduling', 'Help homeowners understand timing dependencies once the product truth is ready for it.'],
        ['3D viewer', 'Add richer interactive viewing only after the core plan, elevation, and export workflow is solid.'],
        ['White-labeling', 'Later, let professionals present Keystone inside their own brand language.'],
    ];
    // The live/planned split is the whole point of this page, so it is the
    // structure rather than a badge colour on an undifferentiated list.
    const liveNow = roadmapModules.filter((m) => m.status === 'Live');

    return (
        <SubpageChrome>
            {() => (
                <div className="subpage">
                    <header className="subpage-head">
                        <p className="subpage-eyebrow">Roadmap</p>
                        <h1>What works today, and what comes next.</h1>
                        <p>
                            A strict line between live capability and planned capability. Anything
                            below the first heading works right now.
                        </p>
                        <div className="subpage-cta">
                            <a href={LIVE_STUDIO_HASH} className="btn-primary">Try what is live</a>
                        </div>
                    </header>

                    <section className="subpage-section" aria-labelledby="rm-live">
                        <h2 id="rm-live">
                            Live today
                            <span className="status-pill is-live">{liveNow.length} features</span>
                        </h2>
                        <div className="card-grid card-grid-3">
                            {liveNow.map((item) => (
                                <article className="glass-card" key={item.title}>
                                    <h3>{item.title}</h3>
                                    <p>{item.body}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="subpage-section" aria-labelledby="rm-planned">
                        <h2 id="rm-planned">
                            Planned
                            <span className="status-pill is-planned">Not available yet</span>
                        </h2>
                        <div className="card-grid card-grid-3">
                            {/* roadmapTracks only - the one `planned` module
                                ("3D viewer and schedule depth") duplicates the
                                3D viewer and Scheduling tracks below it. */}
                            {roadmapTracks.map(([title, body]) => (
                                <article className="glass-card is-planned" key={title}>
                                    <h3>{title}</h3>
                                    <p>{body}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </SubpageChrome>
    );
};
