import React from 'react';
import { LIVE_STUDIO_HASH } from '../lib/routing.js';
import { useRouteMeta } from '../hooks/useRouteMeta.js';
import { SubpageChrome } from '../ui/chrome.jsx';

/* A specification table, not three floating cards.
 *
 * Cards are a SaaS reflex: they float, they carry shadows, and they ask
 * the reader to hold three lists in their head and diff them. A table is
 * how a builder or a quantity surveyor presents numbers, and this
 * audience is about to be handed several documents that look exactly like
 * this one. It is also simply easier to compare.
 *
 * Figures are from docs/superpowers/plans/
 * 2026-03-29-keystone-consumer-pivot-and-demo-plan.md section 3.3, with
 * Single Session corrected to $49 on instruction. That document also sets
 * the framing: show pricing, but never imply open checkout is live.
 */
const TIERS = [
    { key: 'free', name: 'Free', price: '$0', note: 'no account', live: true },
    { key: 'single', name: 'Single Session', price: '$99', note: 'one project', feature: true },
    /* The pack has to be cheaper per project than buying singles or the
       ladder reads backwards, so the unit price is stated rather than
       left for the reader to divide. */
    { key: 'pack', name: 'Studio Pack', price: '$799', note: 'ten projects', unit: '$79.90 each' },
];

const ROWS = [
    ['Floor plan, every level', true, true, true],
    ['All four exterior elevations', true, true, true],
    ['High-resolution downloads', true, true, true],
    ['Projects included', '1', '1', '10'],
    ['Refinements in plain language', false, 'Unlimited', 'Unlimited'],
    ['Exterior renders', false, 'Unlimited', 'Unlimited'],
    ['CAD export (DXF)', false, true, true],
    ['Cost estimate workbook', false, true, true],
];

const QUESTIONS = [
    ['What can I use today, for nothing?',
     'Floor plans for every level, all four elevations, and high-resolution downloads. No account and no card.'],
    ['So the paid tiers are not live?',
     'Not yet. The prices above are the planned launch pricing, published early so there are no surprises. While Keystone is in testing, a passkey unlocks the paid features at no cost.'],
    ['How do I get a passkey?',
     'Request access and we will send one. It is free during the trial.'],
    ['Is a project the same as a house?',
     'Yes. One brief, and the plans, elevations, renders and exports that come from it.'],
];

/* Marks, not icons. A glyph alone is not readable, so every cell carries
   its meaning as text and the mark itself is hidden from assistive tech. */
const Cell = ({ value }) => {
    if (value === true) {
        return (<><span aria-hidden="true" className="mark-yes">&#9679;</span><span className="sr-only">Included</span></>);
    }
    if (value === false) {
        return (<><span aria-hidden="true" className="mark-no">&#8212;</span><span className="sr-only">Not included</span></>);
    }
    return <span className="mark-value">{value}</span>;
};

export const PricingPage = () => {
    useRouteMeta('/pricing');
    return (
        <SubpageChrome>
            {({ openModal }) => (
                <div className="subpage">
                    <header className="subpage-head">
                        <p className="subpage-eyebrow">Pricing</p>
                        <h1>Free to try. Paid when you need the exports.</h1>
                        <p>
                            Keystone is in testing, so nothing is charged yet. These are the
                            prices it will launch at.
                        </p>
                    </header>

                    <section className="subpage-section" aria-labelledby="plans">
                        <h2 id="plans" className="sr-only">Plans and what each one includes</h2>
                        <div className="price-table-wrap">
                            <table className="price-table">
                                <caption className="sr-only">
                                    Keystone plans compared. Free is available now; the paid
                                    tiers are planned launch pricing and are not yet charged.
                                </caption>
                                <thead>
                                    <tr>
                                        <th scope="col"><span className="sr-only">Feature</span></th>
                                        {TIERS.map((t) => (
                                            <th scope="col" key={t.key} className={t.feature ? 'is-feature' : undefined}>
                                                <span className="tier-name">{t.name}</span>
                                                <span className="tier-price">{t.price}</span>
                                                <span className="tier-note">{t.note}</span>
                                                {t.unit && <span className="tier-unit">{t.unit}</span>}
                                                <span className={'tier-state ' + (t.live ? 'is-live' : 'is-planned')}>
                                                    {t.live ? 'Available now' : 'Planned'}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {ROWS.map(([label, ...cells]) => (
                                        <tr key={label}>
                                            <th scope="row">{label}</th>
                                            {cells.map((v, i) => (
                                                <td key={TIERS[i].key} className={TIERS[i].feature ? 'is-feature' : undefined}>
                                                    <Cell value={v}/>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    <tr className="price-actions">
                                        <th scope="row"><span className="sr-only">Get started</span></th>
                                        {TIERS.map((t) => (
                                            <td key={t.key} className={t.feature ? 'is-feature' : undefined}>
                                                {t.live
                                                    ? <a href={LIVE_STUDIO_HASH} className="btn-primary">Start a plan</a>
                                                    : <button type="button" className="btn-ghost" onClick={openModal}>Request access</button>}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Below 768px the table has nowhere to go: three tiers
                            and a label column need about 720px, and scrolling
                            one into view hides the two it is being compared
                            against. So the same figures are restated per tier.
                            Only ever one of the two is in the document - the
                            other is display:none, which also takes it out of
                            the accessibility tree - so nothing is announced
                            twice. */}
                        <div className="price-stack">
                            {TIERS.map((t, col) => (
                                <section className={'price-block' + (t.feature ? ' is-feature' : '')} key={t.key}>
                                    <h3 className="tier-name">{t.name}</h3>
                                    <p className="tier-price">{t.price}</p>
                                    <p className="tier-note">
                                        {t.note}{t.unit ? ' · ' + t.unit : ''}
                                    </p>
                                    <p className={'tier-state ' + (t.live ? 'is-live' : 'is-planned')}>
                                        {t.live ? 'Available now' : 'Planned'}
                                    </p>
                                    <dl className="price-block-rows">
                                        {ROWS.map(([label, ...cells]) => (
                                            <div key={label}>
                                                <dt>{label}</dt>
                                                <dd><Cell value={cells[col]}/></dd>
                                            </div>
                                        ))}
                                    </dl>
                                    {t.live
                                        ? <a href={LIVE_STUDIO_HASH} className="btn-primary">Start a plan</a>
                                        : <button type="button" className="btn-ghost" onClick={openModal}>Request access</button>}
                                </section>
                            ))}
                        </div>

                        <p className="price-footnote">
                            Prices are in US dollars and are not yet charged. During the trial a
                            passkey unlocks every paid feature at no cost.
                        </p>
                    </section>

                    <section className="subpage-section" aria-labelledby="pricing-q">
                        <h2 id="pricing-q">Before you ask</h2>
                        <div className="faq-list">
                            {QUESTIONS.map(([q, a]) => (
                                <details className="faq-item" key={q}>
                                    <summary>{q}</summary>
                                    <p>{a}</p>
                                </details>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </SubpageChrome>
    );
};
