import React, { useState } from 'react';
import { JoinModal } from './JoinModal.jsx';
import { ASSETS } from '../data/assets.js';
import { BRAND_DISPLAY_NAME, CONTACT_EMAIL, LEGAL_UPDATED_AT } from '../data/brand.js';
import { RESOURCE_PAGE_LINKS, SITE_NAV_LINKS } from '../data/content.js';
import { LIVE_STUDIO_HASH, getCurrentPath } from '../lib/routing.js';

export const SiteNav = ({ onStartPlan, currentPath = '/' }) => (
    <nav className="site-nav">
        <div className="site-nav-inner">
            <a href="/" className="site-brand" aria-label={`${BRAND_DISPLAY_NAME} home`}>
                <img src={ASSETS.icon} alt="" width="30" height="30"/>
                <span className="brand-wordmark">Keystone</span>
            </a>
            <div className="site-nav-links">
                {SITE_NAV_LINKS.map(([label, href]) => (
                    <a key={href} href={href}
                        aria-current={currentPath === href ? 'page' : undefined}>{label}</a>
                ))}
            </div>
            {onStartPlan
                ? <button type="button" className="btn-primary" onClick={onStartPlan}>Start a plan</button>
                : <a className="btn-primary" href={LIVE_STUDIO_HASH}>Start a plan</a>}
        </div>
    </nav>
);

export const SiteFooter = () => (
    <footer className="site-footer">
        <div className="site-footer-inner">
            <div className="site-footer-grid">
                <div>
                    <a href="/" className="site-brand" aria-label={`${BRAND_DISPLAY_NAME} home`}>
                        <img src={ASSETS.icon} alt="" width="30" height="30"/>
                        <span className="brand-wordmark">Keystone</span>
                    </a>
                    <p className="site-footer-tagline">
                        Concept floor plans for people who are not architects.
                    </p>
                </div>
                <div>
                    <h2 className="site-footer-heading">Read next</h2>
                    <div className="site-footer-links">
                        {RESOURCE_PAGE_LINKS.map(([label, href]) => (
                            <a key={href} href={href}>{label}</a>
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="site-footer-heading">Get started</h2>
                    <div className="site-footer-links">
                        <a href={LIVE_STUDIO_HASH}>Open the studio</a>
                        <a href="/#example">See an example</a>
                    </div>
                    <h2 className="site-footer-heading" style={{marginTop:'var(--s5)'}}>Contact</h2>
                    <div className="site-footer-contact">
                        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                    </div>
                </div>
            </div>
            <div className="site-footer-base">
                <span>Copyright 2026 {BRAND_DISPLAY_NAME}</span>
                <span>Legal pages last updated {LEGAL_UPDATED_AT}</span>
            </div>
        </div>
    </footer>
);

export const SubpageChrome = ({ children }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const path = getCurrentPath();

    return (
        <div className="home-root">
            <JoinModal isOpen={isModalOpen} onClose={() => setModalOpen(false)}/>
            {/* The nav is sticky, so main needs no padding offset. The old
                PageNav was fixed and main carried a hardcoded 74px. */}
            <SiteNav currentPath={path}/>
            <main id="main" tabIndex={-1}>
                {children({ openModal: () => setModalOpen(true) })}
            </main>
            <SiteFooter/>
        </div>
    );
};

/* ===================================================================
   HOME  -  five sections, product first.

   Replaces a 14-section, ~1,800-word page in which the same capability
   list was restated ten times, the studio metrics rail was rendered
   twice, and the first real drawing appeared a full section below the
   fold. The drawings carry the page now; the copy gets out of the way.
   =================================================================== */
