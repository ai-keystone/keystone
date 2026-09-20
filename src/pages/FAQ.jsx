import React, { useMemo } from 'react';
import { useRouteMeta } from '../hooks/useRouteMeta.js';
import { LIVE_STUDIO_HASH } from '../lib/routing.js';
import { SubpageChrome } from '../ui/chrome.jsx';

export const FAQPage = () => {

    const faqItems = [
        {
            question: 'What is live in Keystone right now?',
            answer: 'The live workflow today includes guided brief capture, floor plan generation, elevation views, a concept-level Cost Estimate workbook, CAD Export (DXF), high-resolution plan download, and Exterior Render generation from the same project brief.',
        },
        {
            question: 'Who is Keystone for right now?',
            answer: 'Keystone is currently being shaped for homeowners and first-time home builders who want to describe the house they want without needing technical drafting knowledge.',
        },
        {
            question: 'Do I need a technical background to use it?',
            answer: 'No. That is the point of the guided brief. Keystone is designed so you can talk about your rooms, priorities, and preferences in plain language.',
        },
        {
            question: 'What do I get from the free mode?',
            answer: 'Free mode gives you the generated floor plan, the elevation views, and the high-resolution blueprint download.',
        },
        {
            question: 'What unlocks with a passkey?',
            answer: 'The passkey unlocks advanced refinements, the Exterior Render, the Cost Estimate workbook, and CAD Export (DXF) during the current trial phase.',
        },
        {
            question: 'Does Keystone replace an architect or builder?',
            answer: 'No. Keystone is an early home-design and discovery tool. It helps you arrive with a clearer starting point, but professional design judgment still matters for any real project.',
        },
        {
            question: 'Are these outputs construction documents?',
            answer: 'No. Keystone outputs are concept aids only. They are not permit-ready drawings, stamped documents, engineering deliverables, or final construction instructions.',
        },
        {
            question: 'Are CAD files and cost estimates live today?',
            answer: 'The Cost Estimate workbook and CAD Export (DXF) are live today inside the advanced package. Native DWG production, scheduling, and deeper downstream quantity logic still belong to the later workflow.',
        },
        {
            question: 'Why is access private right now?',
            answer: 'Keystone is still in a controlled trial phase so the expensive features stay protected while the product is maturing.',
        },
        {
            question: 'How long does it take?',
            answer: 'The first floor plan is designed to arrive quickly, often in under a minute. Exterior renders take longer, but still fit inside an early-stage design session.',
        },
        {
            question: 'How should I think about data and privacy?',
            answer: 'Project inputs and generated outputs are used to operate the service, support access requests, and improve product quality. The current privacy page explains the starter policy in more detail.',
        },
    ];

    // /faq already holds the content, so the FAQPage block is real data
    // rather than markup invented for crawlers.
    const faqLd = useMemo(() => ({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
    }), []);
    useRouteMeta('/faq', faqLd);

    return (
        <SubpageChrome>
            {({ openModal }) => (
                <div className="subpage">
                    <header className="subpage-head">
                        <p className="subpage-eyebrow">FAQ</p>
                        <h1>Questions, answered plainly.</h1>
                        <p>Open only what you need. Nothing here requires reading in order.</p>
                        <div className="subpage-cta">
                            <a href={LIVE_STUDIO_HASH} className="btn-primary">Start a plan</a>
                            <button type="button" className="btn-ghost" onClick={openModal}>Request access</button>
                        </div>
                    </header>

                    {/* Native <details>: keyboard operable, findable by in-page
                        search when open, and no JavaScript to get wrong. */}
                    <section className="subpage-section" aria-labelledby="faq-list">
                        <h2 id="faq-list" className="sr-only">Frequently asked questions</h2>
                        <div className="faq-list">
                            {faqItems.map((item) => (
                                <details className="faq-item" key={item.question}>
                                    <summary>{item.question}</summary>
                                    <p>{item.answer}</p>
                                </details>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </SubpageChrome>
    );
};

/* Legal pages read top to bottom in one measured column. The previous
   layout put legal text in a two-column grid, which forces the reader
   back up the page at the end of every column. */
