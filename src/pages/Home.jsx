import React, { useEffect, useState } from 'react';
import { X as XIcon } from '@phosphor-icons/react';
import { ASSETS } from '../data/assets.js';
import { useRouteMeta } from '../hooks/useRouteMeta.js';
import { DesignGenerator } from '../studio/DesignGenerator.jsx';
import { JoinModal } from '../ui/JoinModal.jsx';
import { MobileMenuOverlay, MobileNavBar } from '../ui/MobileNav.jsx';
import { CapabilityGrid } from '../ui/CapabilityGrid.jsx';
import { PlanSequence } from '../ui/PlanSequence.jsx';
import { SiteFooter, SiteNav } from '../ui/chrome.jsx';

export const DreamApp = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isStudioOpen, setStudioOpen] = useState(false);
    const [hasStudioMounted, setHasStudioMounted] = useState(false);
    const [pendingBrief, setPendingBrief] = useState(null);
    useRouteMeta('/');

    useEffect(() => {
        const handler = () => setStudioOpen(true);
        document.addEventListener('keystone:open-studio', handler);
        return () => document.removeEventListener('keystone:open-studio', handler);
    }, []);

    useEffect(() => {
        const openFromHash = () => {
            if (window.location.hash === '#generator') setStudioOpen(true);
        };
        openFromHash();
        window.addEventListener('hashchange', openFromHash);
        return () => window.removeEventListener('hashchange', openFromHash);
    }, []);

    useEffect(() => { if (isStudioOpen) setHasStudioMounted(true); }, [isStudioOpen]);

    useEffect(() => {
        document.body.classList.toggle('studio-open', isStudioOpen);
        return () => document.body.classList.remove('studio-open');
    }, [isStudioOpen]);


    return (
        <div className="home-root">
            <JoinModal isOpen={isModalOpen} onClose={() => setModalOpen(false)}/>
            <MobileNavBar onOpenMenu={() => setMenuOpen(true)} onOpenStudio={() => setStudioOpen(true)}/>
            <MobileMenuOverlay isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} onJoin={() => setModalOpen(true)}/>

            <SiteNav onStartPlan={() => setStudioOpen(true)} currentPath="/"/>

            <main id="main" tabIndex={-1}>
                {/* 1. HERO  -  the product draws itself. */}
                <PlanSequence onOpenStudio={() => setStudioOpen(true)}/>

                {/* 2. WHAT ELSE COMES OUT OF THE BRIEF.
                    The plan used to lead this section as well. Sitting
                    directly under a hero that spends twelve seconds drawing
                    one, a second still of the same thing read as a repeat
                    and taught the visitor nothing they had not just watched.
                    What they have not seen is the rest of the set, so the
                    section now starts where the hero stopped. */}
                <section className="home-example" id="example">
                    <div className="example-head">
                        <h2>The plan is one drawing of several.</h2>
                        <p>
                            The brief that lays out the rooms also draws every exterior
                            face of the house, and a view of it built.
                        </p>
                    </div>
                    <div className="example-pair">
                        <figure>
                            <img
                                src={ASSETS.renderedElevations}
                                alt="Sheet of four exterior elevations - front, rear, left and right - of a two-storey house"
                                width="2000" height="1602" loading="lazy"
                            />
                            <figcaption>
                                <span className="example-label">Elevations</span>
                                <span className="example-meta">Front, rear, left and right</span>
                            </figcaption>
                        </figure>
                        <figure className="is-photo">
                            <img
                                src={ASSETS.exampleRender}
                                alt="Exterior view of the same two-storey house, rendered in brick with a double garage"
                                width="1400" height="900" loading="lazy"
                            />
                            <figcaption>
                                <span className="example-label">Exterior</span>
                                <span className="example-meta">Built from the same geometry</span>
                            </figcaption>
                        </figure>
                    </div>
                    <p className="example-spec">
                        <span>2,400 sq ft</span>
                        <span>3 bed</span>
                        <span>3 bath</span>
                        <span>2 levels</span>
                    </p>
                </section>

                <CapabilityGrid/>

                {/* 3. HOW IT WORKS  -  three rows, not three cards. */}
                <section className="home-steps">
                    <h2>How it works</h2>
                    <ol className="step-rows glass-quiet">
                        <li>
                            <span className="step-verb">Describe</span>
                            <p>Answer in plain language. No drafting vocabulary.</p>
                        </li>
                        <li>
                            <span className="step-verb">Compare</span>
                            <p>Keystone draws several layouts and shows you the strongest.</p>
                        </li>
                        <li>
                            <span className="step-verb">Take it further</span>
                            <p>Download the drawings and bring them to a designer.</p>
                        </li>
                    </ol>
                </section>

                {/* 4. ACCESS  -  two columns, honest about what is gated. */}
                <section className="home-access">
                    <h2>What you get</h2>
                    <div className="access-grid">
                        <div className="access-col glass">
                            <p className="access-price">Free</p>
                            <ul>
                                <li>Floor plans for every level</li>
                                <li>All four elevations</li>
                                <li>High resolution PNG downloads</li>
                            </ul>
                            <button type="button" className="btn-primary" onClick={() => setStudioOpen(true)}>
                                Start a plan
                            </button>
                        </div>
                        <div className="access-col glass-quiet">
                            <p className="access-price">With a passkey</p>
                            <ul>
                                <li>Exterior renders</li>
                                <li>Plan refinements in plain language</li>
                                <li>DXF export and cost estimate workbook</li>
                            </ul>
                            <button type="button" className="btn-ghost" onClick={() => setModalOpen(true)}>
                                Request access
                            </button>
                            {/* The pricing page publishes the launch figures, so this
                                can no longer say they are unset. */}
                            <p className="access-note">
                                Free while Keystone is in testing. <a href="/pricing" className="inline-link">See launch pricing</a>.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Studio, over the page. */}
                {hasStudioMounted && (
                    <div
                        className="studio-modal-overlay"
                        style={{
                            opacity: isStudioOpen ? 1 : 0,
                            pointerEvents: isStudioOpen ? 'auto' : 'none',
                            transition: 'opacity 180ms var(--ease)',
                        }}
                    >
                        <div className="studio-modal-window">
                            <div className="studio-modal-topbar">
                                <div style={{display:'flex',alignItems:'center',gap:10}}>
                                    <img src={ASSETS.icon} alt="" width="22" height="22" style={{opacity:0.85}}/>
                                    <span className="brand-wordmark" style={{fontSize:'0.95rem'}}>Studio</span>
                                </div>
                                <button className="studio-modal-close" onClick={() => setStudioOpen(false)} aria-label="Close studio">
                                    <XIcon size={16} weight="bold" />
                                </button>
                            </div>
                            <div className="studio-modal-body">
                                <DesignGenerator onOpenModal={() => setModalOpen(true)} initialBrief={pendingBrief}/>
                            </div>
                        </div>
                    </div>
                )}

                <SiteFooter/>
            </main>
        </div>
    );
};
