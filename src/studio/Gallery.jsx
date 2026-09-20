import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clamp } from '../lib/elevations.js';
import { scrollTo } from '../lib/routing.js';
import { CloseIcon } from '../ui/icons.jsx';

// Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ GALLERY COMPONENT Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬
export const Gallery = ({ onOpenModal }) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null); // expanded entry
    const [zoomImg, setZoomImg] = useState(null);
    const sectionRef = useRef(null);
    const fetchControllerRef = useRef(null);
    const isVisibleRef = useRef(true);

    const fetchGallery = async () => {
        if (document.visibilityState === 'hidden' || !isVisibleRef.current) return;
        if (fetchControllerRef.current) fetchControllerRef.current.abort();
        const controller = new AbortController();
        fetchControllerRef.current = controller;
        try {
            const res = await fetch('/api/gallery', { signal: controller.signal });
            const data = await res.json();
            if (data.success) setEntries(data.gallery || []);
        } catch(e) {
            if (e.name !== 'AbortError') console.warn('Gallery fetch failed:', e);
        } finally {
            if (fetchControllerRef.current === controller) fetchControllerRef.current = null;
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGallery();
        const visibilityHandler = () => {
            if (document.visibilityState === 'visible' && isVisibleRef.current) fetchGallery();
        };
        const observer = new IntersectionObserver(([entry]) => {
            isVisibleRef.current = entry.isIntersecting;
            if (entry.isIntersecting && document.visibilityState === 'visible') fetchGallery();
        }, { threshold: 0.15 });
        if (sectionRef.current) observer.observe(sectionRef.current);
        document.addEventListener('visibilitychange', visibilityHandler);
        // Refresh only while the section is visible and the tab is active.
        const t = setInterval(() => {
            if (document.visibilityState === 'visible' && isVisibleRef.current) fetchGallery();
        }, 45000);
        return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', visibilityHandler);
            clearInterval(t);
            if (fetchControllerRef.current) fetchControllerRef.current.abort();
        };
    }, []);

    const fmt = (ts) => {
        const d = new Date(ts);
        return d.toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' });
    };

    return (
        <section id="gallery" ref={sectionRef} style={{background:'linear-gradient(180deg, #FFFDFC 0%, #F5F0E9 100%)', padding:'4.5rem 0 5.5rem'}}>
            {/* Lightbox */}
            <AnimatePresence>
                {zoomImg && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                        onClick={() => setZoomImg(null)}
                        className="fixed inset-0 z-200 bg-ink/93 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out">
                        {typeof zoomImg === 'string' && zoomImg.startsWith('<svg')
                            ? <div className="bg-white p-6 max-w-4xl w-full max-h-[90vh] overflow-auto rounded-xs shadow-2xl" dangerouslySetInnerHTML={{__html:zoomImg}}/>
                            : <img src={zoomImg} className="max-h-[90vh] max-w-full object-contain rounded-xs" alt="Zoom"/>}
                        <button type="button" onClick={() => setZoomImg(null)} aria-label="Close zoomed preview" className="absolute top-4 right-4 text-white/40 hover:text-white">
                            <CloseIcon className="w-6 h-6"/>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detail drawer */}
            <AnimatePresence>
                {selected && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                        className="fixed inset-0 z-150 bg-ink/70 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6"
                        onClick={(e) => { if(e.target===e.currentTarget) setSelected(null); }}>
                        <motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} exit={{y:40,opacity:0}}
                            transition={{type:'spring',damping:26}}
                            className="bg-paper w-full md:max-w-4xl max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-xl shadow-2xl">
                            <div style={{height:'3px',background:'linear-gradient(90deg,var(--blue),var(--red))',borderRadius:'8px 8px 0 0'}}/>
                            <div className="p-5 md:p-7">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className="badge">Generated Plan</span>
                                        <h3 className="cg italic text-2xl mt-2">{selected.label || 'Floor Plan'}</h3>
                                        <p className="mono text-[8px] uppercase tracking-widest text-mid mt-1">{fmt(selected.createdAt)}</p>
                                    </div>
                                    <button type="button" onClick={() => setSelected(null)} aria-label="Close session detail" className="w-9 h-9 bg-black/6 rounded-full flex items-center justify-center hover:bg-black/12 transition-colors shrink-0">
                                        <CloseIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                                {/* Side-by-side at 50% scale each Ã¢â‚¬" both visible without scrolling */}
                                <div className="gallery-detail-grid">
                                    {/* SVG blueprint Ã¢â‚¬" clipped to fixed height, scaled down */}
                                    <div className="border border-black/6 rounded-xs overflow-hidden cursor-zoom-in"
                                        style={{background:'white'}} onClick={() => setZoomImg(selected.svg)}>
                                        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-black/5">
                                            <span style={{width:'5px',height:'5px',borderRadius:'50%',background:'var(--blue)',flexShrink:0,display:'inline-block'}}/>
                                            <span className="mono text-[7px] uppercase tracking-widest text-mid">2D Blueprint</span>
                                            <span className="mono text-[7px] text-mid ml-auto opacity-40">open</span>
                                        </div>
                                        {/* Fixed-height container, SVG scaled to fit at ~50% */}
                                        <div style={{height:'200px', overflow:'hidden', position:'relative', padding:'8px'}}>
                                            <div dangerouslySetInnerHTML={{__html: selected.svg}}
                                                style={{
                                                    width:'200%',
                                                    height:'200%',
                                                    transform:'scale(0.5)',
                                                    transformOrigin:'top left',
                                                    pointerEvents:'none',
                                                }}/>
                                        </div>
                                    </div>
                                    {/* 3D render or placeholder */}
                                    <div className="border border-black/6 rounded-xs overflow-hidden flex flex-col"
                                        style={{background:'var(--surface-1)'}}>
                                        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-black/5">
                                            <span style={{width:'5px',height:'5px',borderRadius:'50%',background:'var(--gold)',flexShrink:0,display:'inline-block'}}/>
                                            <span className="mono text-[7px] uppercase tracking-widest text-mid">3D Render</span>
                                            {selected.renderImage && <span className="mono text-[7px] text-mid ml-auto opacity-40">open</span>}
                                        </div>
                                        {selected.renderImage
                                            ? <img src={selected.renderImage} alt="3D render"
                                                onClick={() => setZoomImg(selected.renderImage)}
                                                className="cursor-zoom-in"
                                                style={{width:'100%', height:'200px', objectFit:'cover'}}/>
                                            : <div className="flex-1 flex flex-col items-center justify-center text-center" style={{height:'200px',opacity:0.3}}>
                                                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                                <p className="mono text-[7px] uppercase tracking-widest">No render yet</p>
                                              </div>
                                        }
                                    </div>
                                </div>
                                {/* Survey summary */}
                                {selected.surveyData && (
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {[
                                            ['Area', selected.planSpec?.totalAreaSqFt ? `${selected.planSpec.totalAreaSqFt.toLocaleString()} sqft` : '-'],
                                            ['Stories', selected.surveyData.stories || '-'],
                                            ['Garage', selected.surveyData.garage || '-'],
                                            ['Style', (selected.surveyData.budgetTier || '-').split(' ')[0]],
                                        ].map(([k,v]) => (
                                            <div key={k} className="spec-panel">
                                                <div className="spec-label">{k}</div>
                                                <div className="spec-value">{v}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="site-shell">
                <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-6 items-end mb-10">
                    <div>
                        <span className="section-label" style={{color:'var(--ink-soft)'}}>Recent sessions</span>
                        <h2 className="cg mt-5" style={{fontSize:'clamp(2.2rem,4.8vw,3.6rem)',letterSpacing:'-0.05em',textTransform:'uppercase',lineHeight:0.94}}>Recent sessions, not mockups.</h2>
                        <p className="text-mid text-sm mt-2">The last 10 plans generated by Keystone AI users, live from the server.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                        <button onClick={fetchGallery} className="cta-secondary flex items-center gap-1.5 px-4 py-3">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            Refresh
                        </button>
                        <button onClick={() => scrollTo('generator')} className="cta-hero cta-glow-soft px-5 py-3">
                            Open Live Studio
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20 gap-3 text-mid" role="status" aria-live="polite">
                        <div className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin"/>
                        <span className="mono text-[9px] uppercase tracking-widest">Loading gallery...</span>
                    </div>
                )}

                {!loading && entries.length === 0 && (
                    <div className="paper-panel text-center py-20 px-6">
                        <div style={{marginBottom:'1rem',opacity:0.3,display:'flex',justifyContent:'center'}}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg></div>
                        <p className="cg text-2xl opacity-50" style={{letterSpacing:'-0.05em',textTransform:'uppercase'}}>No recent sessions yet.</p>
                        <p className="mono text-[9px] uppercase tracking-widest text-mid mt-2 opacity-50">Be the first - generate a plan above.</p>
                        <button onClick={() => scrollTo('generator')} className="cta-hero cta-glow mt-5 px-6 py-3">
                            Open Live Studio
                        </button>
                    </div>
                )}

                {!loading && entries.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                        {entries.map((entry, i) => (
                            <motion.div key={entry.id}
                                initial={{opacity:0, y:16}} whileInView={{opacity:1, y:0}}
                                viewport={{once:true}} transition={{delay: Math.min(i,4)*0.06}}
                                onClick={() => setSelected(entry)}
                                className="group cursor-pointer paper-panel overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-1">

                                {/* Thumbnail Ã¢â‚¬" blueprint + render side by side at 50% */}
                                <div style={{position:'relative', borderBottom:'1px solid rgba(0,0,0,0.05)'}}>
                                    <div style={{display:'grid', gridTemplateColumns: entry.renderImage ? '1fr 1fr' : '1fr', height:'140px', background:'white'}}>
                                        {/* Blueprint at 50% scale */}
                                        <div style={{overflow:'hidden', position:'relative', background:'white', borderRight: entry.renderImage ? '1px solid rgba(0,0,0,0.06)' : 'none'}}>
                                            <div dangerouslySetInnerHTML={{__html: entry.svg}}
                                                style={{
                                                    width:'200%',
                                                    height:'200%',
                                                    transform:'scale(0.5)',
                                                    transformOrigin:'top left',
                                                    pointerEvents:'none',
                                                }}/>
                                            <div style={{position:'absolute',bottom:'4px',left:'6px'}}>
                                                <span className="mono text-[6px] uppercase tracking-widest opacity-30">Plan</span>
                                            </div>
                                        </div>
                                        {/* 3D render if available */}
                                        {entry.renderImage && (
                                            <div style={{overflow:'hidden'}}>
                                                <img src={entry.renderImage} alt="3D"
                                                    style={{width:'100%', height:'140px', objectFit:'cover'}}/>
                                                <div style={{position:'absolute',bottom:'4px',right:'6px'}}>
                                                    <span className="mono text-[6px] uppercase tracking-widest px-1.5 py-0.5 rounded-full font-bold" style={{background:'rgba(181,136,42,0.85)',color:'white'}}>3D</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-blue/0 group-hover:bg-blue/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="bg-white/95 px-3 py-1.5 rounded-full shadow-xs mono text-[8px] uppercase tracking-widest text-blue font-bold">View Details</span>
                                    </div>
                                </div>

                                {/* Card footer */}
                                <div style={{padding:'0.75rem 1rem'}}>
                                    <p className="cg italic text-base leading-tight mb-0.5">{entry.label || 'Custom Plan'}</p>
                                    <p className="mono text-[7px] uppercase tracking-widest text-mid opacity-60">{fmt(entry.createdAt)}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && entries.length > 0 && (
                    <div className="text-center mt-10">
                        <p className="mono text-[8px] uppercase tracking-widest text-mid opacity-40">Showing {entries.length} recent sessions - refreshes quietly while this section is visible</p>
                    </div>
                )}
            </div>
        </section>
    );
};

// â"€â"€â"€ INTERACTIVE CANVAS (pan/zoom blueprint viewport) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
/* Studio exports.
 *
 * These five downloads used to sit above the drawing as six equal-weight
 * pills plus a 40-word paragraph, shown at every width and in every state -
 * including "Awaiting your brief", when there is nothing to export at all.
 * They are secondary to the drawing, so they live behind one disclosure and
 * only appear once a plan exists.
 */
