import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { House as HouseIcon, List as ListIcon, PencilSimple as PencilSimpleIcon } from '@phosphor-icons/react';
import { scrollTo } from '../lib/routing.js';
import { BrandLockup } from './primitives.jsx';

export const MobileNavBar = ({ onOpenMenu, onOpenStudio }) => (
    <div className="fixed bottom-0 left-0 w-full bottom-nav z-90 md:hidden pb-safe">
        <div className="grid grid-cols-3 h-[60px] items-center">
            <button
                onClick={() => scrollTo('hero')}
                className="mobile-nav-btn"
                aria-label="Top of page"
            >
                <HouseIcon size={20} weight="regular" aria-hidden="true" />
                <span>Home</span>
            </button>
            <div className="flex justify-center relative" style={{top:'-14px'}}>
                <button
                    onClick={onOpenStudio}
                    className="mobile-nav-fab"
                    aria-label="Open the studio"
                >
                    <PencilSimpleIcon size={20} weight="bold" aria-hidden="true" />
                </button>
            </div>
            <button onClick={onOpenMenu} className="mobile-nav-btn" aria-label="Open menu">
                <ListIcon size={20} weight="regular" aria-hidden="true" />
                <span>Menu</span>
            </button>
        </div>
    </div>
);

export const MobileMenuOverlay = ({ isOpen, onClose, onJoin }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ opacity:0, y:"100%" }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:"100%" }}
                transition={{ type:"spring", damping:28, stiffness:220 }}
                className="fixed inset-0 z-100 text-paper flex flex-col pb-safe"
                style={{background:'linear-gradient(180deg, rgba(10,10,10,0.995), rgba(18,18,18,0.995))'}}>
                <div className="flex justify-between items-center px-6 py-5 border-b border-white/8">
                    <BrandLockup href="/" reverse compact onClick={onClose}/>
                    <button onClick={onClose} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div className="flex-1 px-6 py-6 flex flex-col gap-0">
                    {[['Example','example'],['Studio','generator']].map(([label, id], i) => (
                        <button key={id} onClick={() => { scrollTo(id); onClose(); }}
                            className="cg text-[2rem] text-left border-b border-white/6 py-4 flex justify-between items-center text-white/90 hover:text-white transition-colors"
                            style={{letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                            {label}
                            <span className="mono text-sm text-white/20">0{i+1}</span>
                        </button>
                    ))}
                    <div className="grid grid-cols-2 gap-2 mt-5">
                        <a href="/how-floor-plans-work" className="mono text-[12px] uppercase tracking-[0.22em] px-4 py-3 rounded-full border border-white/10 text-center text-white/70 hover:text-white hover:border-white/24 transition-colors">
                            How It Works
                        </a>
                        <a href="/b2b-workflow" className="mono text-[12px] uppercase tracking-[0.22em] px-4 py-3 rounded-full border border-white/10 text-center text-white/70 hover:text-white hover:border-white/24 transition-colors">
                            Guided Workflow
                        </a>
                        <a href="/roadmap" className="mono text-[12px] uppercase tracking-[0.22em] px-4 py-3 rounded-full border border-white/10 text-center text-white/70 hover:text-white hover:border-white/24 transition-colors">
                            Roadmap
                        </a>
                        <a href="/faq" className="mono text-[12px] uppercase tracking-[0.22em] px-4 py-3 rounded-full border border-white/10 text-center text-white/70 hover:text-white hover:border-white/24 transition-colors">
                            FAQ
                        </a>
                    </div>
                    <div className="mt-auto pt-8 grid gap-3">
                        <button onClick={() => { scrollTo('generator'); onClose(); }}
                            className="cta-hero cta-glow w-full text-center py-4">
                            Open Live Studio
                        </button>
                        <button onClick={() => { onJoin(); onClose(); }}
                            className="cta-hero cta-glow-soft w-full text-center py-4">
                            Request a passkey
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);
