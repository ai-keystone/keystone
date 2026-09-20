import React from 'react';
import { ASSETS } from '../data/assets.js';
import { useRouteMeta } from '../hooks/useRouteMeta.js';
import { LIVE_STUDIO_HASH, getCurrentPath } from '../lib/routing.js';
import { SubpageChrome } from '../ui/chrome.jsx';
import { SmartImage } from '../ui/primitives.jsx';

export const HowFloorPlansWorkPage = () => {
    useRouteMeta(getCurrentPath());
    const caseFacts = [
        ['Input', 'Guided home brief'],
        ['Core engine', 'Deterministic layout + validation'],
        ['Output', 'Plan + elevations + DXF + optional render'],
        ['Boundary', 'Concept study, not permit docs'],
    ];
    const intakeSignals = [
        'Area, stories, bedrooms, baths, garage type, and broad footprint bias are captured before discovery starts.',
        'The brief records layout intent such as primary-suite level, kitchen position, laundry placement, and open-concept preference.',
        'Frontage, lot context, light preference, indoor-outdoor intent, and accessibility needs shape the first zoning pass.',
        'You leave the brief with a working plan artifact instead of trying to reconstruct the house from scattered notes later.',
    ];
    const processSteps = [
        {
            step: '01',
            title: 'The survey is normalized into a usable brief',
            body: 'The intake does not stay as loose text. Keystone converts your survey answers into structured constraints such as story count, area target, garage type, primary-suite level, bathroom rules, frontage, and lot context.',
        },
        {
            step: '02',
            title: 'Multiple footprint candidates are explored',
            body: 'The engine tests rectangular footprint options against the requested size, number of stories, garage needs, and lot assumptions so the first plan does not start from a single arbitrary box.',
        },
        {
            step: '03',
            title: 'A room program is built before geometry',
            body: 'Bedrooms, bathrooms, public rooms, stairs, circulation, mudroom, laundry, and requested extras are assembled into a room program with target areas and adjacency intent before the layout stage begins.',
        },
        {
            step: '04',
            title: 'The plan is laid out on a tile grid',
            body: 'Keystone places the room program into public, private, service, and circulation zones, then turns that into a real floor plan with dimensions, story alignment, and stair-core placement.',
        },
        {
            step: '05',
            title: 'Openings and circulation are validated',
            body: 'Doors, windows, and entry points are added after the room geometry exists. The plan is then checked for connectivity, room count, bathroom logic, hallway bloat, and other architectural quality gates.',
        },
        {
            step: '06',
            title: 'The concept package is exported',
            body: 'The floor plan, elevation set, and CAD export (DXF) are exported first. The Exterior Render can then be used as an optional image layer on top of the approved plan geometry rather than replacing the core floor-plan logic.',
        },
    ];
    const planInputs = [
        {
            title: 'Program before drawing',
            body: 'Keystone first resolves what must exist in the home: public rooms, private rooms, stairs, garage, service spaces, and the bathroom structure needed to make the program work.',
            image: ASSETS.exampleBlueprint,
            alt: 'Sample Keystone floor plan showing structured room program',
        },
        {
            title: 'Zoning and circulation',
            body: 'The engine separates public, private, service, and circulation zones so the layout starts from movement and room relationships, not just a list of boxes.',
            image: ASSETS.workflow.planReview,
            alt: 'Architect reviewing plan layout and zoning relationships',
        },
        {
            title: 'Elevations and CAD export',
            body: 'Doors, windows, frontage, elevations, and CAD export are prepared after the layout exists so the output is usable in studio review rather than just visually attractive.',
            image: ASSETS.exampleElevationSheet,
            alt: 'Technical architectural output supporting review and export',
        },
    ];

    return (
        <SubpageChrome>
            {({ openModal }) => (
                <div className="subpage">
                    <header className="subpage-head">
                        <p className="subpage-eyebrow">How floor plans are made</p>
                        <h1>How a sentence becomes a working floor plan.</h1>
                        <p>
                            A guided brief becomes plan constraints. Footprints are explored, a room
                            program is built, the layout is drawn, circulation is checked, and only
                            then are the exports prepared.
                        </p>
                        <div className="subpage-cta">
                            <a href={LIVE_STUDIO_HASH} className="btn-primary">Start a plan</a>
                            <button type="button" className="btn-ghost" onClick={openModal}>Request access</button>
                        </div>
                    </header>

                    <section className="subpage-section" aria-labelledby="at-a-glance">
                        <h2 id="at-a-glance">At a glance</h2>
                        <dl className="fact-rows">
                            {caseFacts.map(([label, value]) => (
                                <div className="fact-row" key={label}>
                                    <dt>{label}</dt>
                                    <dd>{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section className="subpage-section" aria-labelledby="the-sequence">
                        <h2 id="the-sequence">The sequence</h2>
                        <div className="card-grid card-grid-3">
                            {processSteps.map((item) => (
                                <article className="glass-card" key={item.step}>
                                    <span className="step-num">{item.step}</span>
                                    <h3>{item.title}</h3>
                                    <p>{item.body}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="subpage-section" aria-labelledby="what-it-produces">
                        <h2 id="what-it-produces">What it produces</h2>
                        <div className="card-grid card-grid-3">
                            {planInputs.map((item) => (
                                <figure className="subpage-figure" key={item.title}>
                                    <SmartImage src={item.image} alt={item.alt}/>
                                    <figcaption><strong>{item.title}.</strong> {item.body}</figcaption>
                                </figure>
                            ))}
                        </div>
                    </section>

                    <section className="subpage-section" aria-labelledby="the-boundary">
                        <h2 id="the-boundary">Where it stops</h2>
                        <div className="glass-card" style={{maxWidth:'70ch'}}>
                            <p>
                                The output is a concept aid for discovery and kickoff. It is not a
                                permit-ready drawing set, not a stamped document, and not a substitute
                                for architect, engineer, or builder review.
                            </p>
                        </div>
                        <div className="subpage-cta">
                            <a href={LIVE_STUDIO_HASH} className="btn-primary">Start a plan</a>
                        </div>
                    </section>
                </div>
            )}
        </SubpageChrome>
    );
};

export const CaseStudyPage = () => <HowFloorPlansWorkPage/>;
