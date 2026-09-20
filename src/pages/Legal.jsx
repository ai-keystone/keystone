import React from 'react';
import { BRAND_NAME, CONTACT_EMAIL, LEGAL_UPDATED_AT } from '../data/brand.js';
import { useRouteMeta } from '../hooks/useRouteMeta.js';
import { getCurrentPath } from '../lib/routing.js';
import { SubpageChrome } from '../ui/chrome.jsx';

export const LegalPage = ({ eyebrow, title, intro, sections }) => {
    // Privacy and Terms previously set no title at all, so they kept
    // whatever the last rendered route had left in document.title.
    useRouteMeta(getCurrentPath());
    return (
    <SubpageChrome>
        {() => (
            <div className="subpage">
                <header className="subpage-head">
                    <p className="subpage-eyebrow">{eyebrow}</p>
                    <h1>{title}</h1>
                    <p>{intro}</p>
                    <dl className="fact-rows" style={{marginTop:'var(--s6)'}}>
                        <div className="fact-row">
                            <dt>Last updated</dt>
                            <dd>{LEGAL_UPDATED_AT}</dd>
                        </div>
                        <div className="fact-row">
                            <dt>Contact</dt>
                            <dd><a className="inline-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></dd>
                        </div>
                        <div className="fact-row">
                            <dt>Status</dt>
                            <dd>Starter draft. These pages use the public brand name {BRAND_NAME} while the formal legal entity details are finalized.</dd>
                        </div>
                    </dl>
                </header>

                <div className="legal-body">
                    {sections.map((section) => (
                        <section key={section.title}>
                            <h2>{section.title}</h2>
                            {section.body.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </section>
                    ))}
                </div>
            </div>
        )}
    </SubpageChrome>
    );
};

export const PrivacyPage = () => {
    const sections = [
        {
            title: 'Information we collect',
            body: [
                'We may collect contact details you send through access forms, project brief information submitted through the product, and the outputs generated from those inputs.',
                'We may also collect limited technical data such as basic usage logs, browser information, and service diagnostics needed to keep the product working.',
            ],
        },
        {
            title: 'How the information is used',
            body: [
                'We use information to operate Keystone, respond to access requests, improve output quality, maintain security, and understand whether the product is reliable for real homeowner use.',
                'We do not treat your project data as public marketing material without permission.',
            ],
        },
        {
            title: 'Sharing and service providers',
            body: [
                'Keystone relies on hosted infrastructure and model providers to generate outputs and deliver the service. Information may be processed by those providers as part of normal operation.',
                'We do not sell personal information. We share data only as needed to run, secure, or improve the service.',
            ],
        },
        {
            title: 'Retention',
            body: [
                'We retain information for as long as reasonably necessary to operate the product, support users, evaluate product quality, and comply with legal obligations.',
                'If you need a deletion request reviewed, contact us at the email listed on this page and we will handle it where reasonably possible.',
            ],
        },
        {
            title: 'Your choices',
            body: [
                'You can choose not to submit forms or project details, though that may limit access to Keystone.',
                'You may also contact us to ask questions about access, stored contact details, submitted project data, or deletion requests.',
            ],
        },
        {
            title: 'Important note',
            body: [
                'Keystone is an early-stage product. This privacy page is a starter draft designed to be transparent while the formal company structure is still being finalized.',
            ],
        },
    ];

    return (
        <LegalPage
            eyebrow="Privacy"
            title="A plain-language privacy draft for an early-stage studio product."
            intro="This page explains the current privacy posture for Keystone in straightforward terms. It is meant to be readable now and tightened further as the business structure becomes formalized."
            sections={sections}
        />
    );
};

export const TermsPage = () => {
    const sections = [
        {
            title: 'Nature of the service',
            body: [
                'Keystone is an early-stage home design and discovery product. It helps people describe what they want in a house, generate conceptual floor plans, prepare elevations and a concept-level Cost Estimate, create downloadable images and DXF exports, and produce Exterior Renders from project briefs.',
                'The service is offered on an early-stage basis and may evolve, change, pause, or improve over time.',
            ],
        },
        {
            title: 'Professional responsibility',
            body: [
                'Keystone does not replace licensed design professionals. All outputs must be reviewed, interpreted, and validated by qualified professionals before they are used in any meaningful project context.',
                'You are responsible for how you use outputs inside your own planning, budgeting, or design process.',
            ],
        },
        {
            title: 'Not construction documents',
            body: [
                'Keystone outputs are conceptual only. They are not permit-ready drawings, engineering documents, code compliance confirmations, or final construction instructions.',
                'You must not rely on Keystone outputs as final technical documents without further professional development and review.',
            ],
        },
        {
            title: 'User responsibilities',
            body: [
                'You agree to provide information you have the right to use and to avoid unlawful, infringing, or harmful inputs.',
                'If Keystone access is private or code-based, you are responsible for safeguarding that access and sharing it only as intended.',
            ],
        },
        {
            title: 'Payments and availability',
            body: [
                'Pricing, access policies, and demo eligibility may change as the product evolves. Guided sessions or free demos may be limited or discontinued.',
                'We do not guarantee uninterrupted availability, and we may suspend or modify access when needed for reliability or safety.',
            ],
        },
        {
            title: 'Warranty and liability',
            body: [
                'Keystone is provided as-is to the fullest extent permitted by law. We make no guarantee that outputs will be accurate for every project, complete for every use case, or uninterrupted at all times.',
                'To the fullest extent permitted by law, Keystone is not liable for project losses, downstream design decisions, construction reliance, or other damages arising from use of conceptual outputs.',
            ],
        },
    ];

    return (
        <LegalPage
            eyebrow="Terms"
            title="Interim terms for using Keystone responsibly."
            intro="These terms are written to match the current reality of the product: an early-stage studio tool for first conversations, not a substitute for professional design responsibility."
            sections={sections}
        />
    );
};
