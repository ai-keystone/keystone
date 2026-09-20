import React from 'react';
import { ASSETS } from '../data/assets.js';
import { useRouteMeta } from '../hooks/useRouteMeta.js';
import { LIVE_STUDIO_HASH } from '../lib/routing.js';
import { SubpageChrome } from '../ui/chrome.jsx';
import { SmartImage } from '../ui/primitives.jsx';

export const B2BWorkflowPage = () => {
    useRouteMeta('/b2b-workflow');
    const workflowStages = [
        {
            step: '01',
            title: 'You open the guided brief',
            body: 'Keystone starts with a survey written for normal people, so the process begins with clarity instead of technical guesswork.',
            image: ASSETS.workflow.firmLaunch,
        },
        {
            step: '02',
            title: 'You fill out structured intent',
            body: 'Room needs, lot cues, light preferences, and style signals arrive in a format that can later be reviewed by you, your family, and any professional you bring in.',
            image: ASSETS.workflow.clientIntake,
        },
        {
            step: '03',
            title: 'Keystone returns a plan, elevations, and export',
            body: 'The generated plan becomes a working artifact you can download as a blueprint image, matching elevations, and CAD Export (DXF) before the next design conversation even begins.',
            image: ASSETS.workflow.planExport,
        },
        {
            step: '04',
            title: 'The next conversation starts ahead',
            body: 'An optional Exterior Render can support emotional alignment, but the deeper win is simpler: the process begins with more clarity and less drift.',
            image: ASSETS.workflow.kickoffMeeting,
        },
    ];
    const operatorBenefits = [
        'A clearer first design conversation',
        'An easier handoff into professional design work later',
        'A stronger concept artifact for family discussion, review, and budgeting',
    ];

    return (
        <SubpageChrome>
            {({ openModal }) => (
                <div className="subpage">
                    <header className="subpage-head">
                        <p className="subpage-eyebrow">Guided workflow</p>
                        <h1>Arrive at the first design conversation already ahead.</h1>
                        <p>
                            Keystone is a guided process, not a lead form. It gives you something
                            real to react to before anyone starts drawing.
                        </p>
                        <div className="subpage-cta">
                            <a href={LIVE_STUDIO_HASH} className="btn-primary">Start a plan</a>
                            <button type="button" className="btn-ghost" onClick={openModal}>Request access</button>
                        </div>
                    </header>

                    <section className="subpage-section" aria-labelledby="wf-steps">
                        <h2 id="wf-steps">How it goes</h2>
                        <div className="card-grid">
                            {workflowStages.map((item) => (
                                <article className="glass-card" key={item.step}>
                                    <span className="step-num">{item.step}</span>
                                    <h3>{item.title}</h3>
                                    <p>{item.body}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="subpage-section" aria-labelledby="wf-value">
                        <h2 id="wf-value">What you walk away with</h2>
                        <div className="glass-card" style={{maxWidth:'70ch'}}>
                            <ul className="plain-list">
                                {operatorBenefits.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                    </section>

                    <section className="subpage-section" aria-labelledby="wf-proof">
                        <h2 id="wf-proof">The output</h2>
                        <div className="card-grid card-grid-3">
                            <figure className="subpage-figure">
                                <SmartImage src={ASSETS.exampleBlueprint} alt="Keystone floor plan for both levels with dimensions and room labels"/>
                                <figcaption><strong>Floor plan.</strong> Every level, dimensioned and labelled.</figcaption>
                            </figure>
                            <figure className="subpage-figure">
                                <SmartImage src={ASSETS.exampleElevationSheet} alt="Sheet of four exterior elevations: front, rear, left and right"/>
                                <figcaption><strong>Elevations.</strong> All four sides on one sheet.</figcaption>
                            </figure>
                            <figure className="subpage-figure">
                                <SmartImage src={ASSETS.roadmap.cadExport} alt="CAD drawing exported from Keystone as a DXF file"/>
                                <figcaption><strong>CAD export.</strong> DXF a designer can open directly.</figcaption>
                            </figure>
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
