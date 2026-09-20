import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X as XIcon } from '@phosphor-icons/react';
import { STUDIO_SESSION_KEY, STUDIO_UNLOCK_KEY } from '../data/brand.js';
import { DEFAULT_FORM_DATA } from '../data/survey.js';
import { buildPresentationDxf } from '../lib/dxf.js';
import { buildPlanExportFilename, profileLabel } from '../lib/format.js';
import { composeElevationReferenceSheet, svgToPngDataUrl } from '../lib/raster.js';
import { createEmptyRenderState, getInitialStudioSession, normalizeRenderState } from '../lib/storage.js';
import { BlueprintPresentationSheet } from './BlueprintPresentationSheet.jsx';
import { DownloadMenu } from './DownloadMenu.jsx';
import { ElevationsPanel } from './ElevationsPanel.jsx';
import { EstimatePanel } from './EstimatePanel.jsx';
import { InteractiveCanvas } from './InteractiveCanvas.jsx';
import { PlanSummaryPanel } from './PlanSummaryPanel.jsx';
import { RefinementPanel } from './RefinementPanel.jsx';
import { Render3DPanel } from './Render3DPanel.jsx';
import { SurveyForm } from './SurveyForm.jsx';
import { CloseIcon } from '../ui/icons.jsx';

// â"€â"€â"€ DESIGN GENERATOR â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export const DesignGenerator = ({ onOpenModal, initialBrief = null }) => {
    const initialSessionRef = useRef(getInitialStudioSession());
    const initialSession = initialSessionRef.current;
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [accessTokenExpiry, setAccessTokenExpiry] = useState(null);
    const [passkeyInput, setPasskeyInput] = useState('');
    const [unlockStatus, setUnlockStatus] = useState('idle');

    const [formData, setFormData] = useState(() => ({ ...DEFAULT_FORM_DATA, ...(initialSession?.formData || {}) }));

    // A brief typed in the hero arrives here as {patch, read}. Merge it into the
    // survey and surface what was understood, so the reading is visible and
    // correctable rather than silently applied.
    // Replaces twelve blocking alert() dialogs. A notice never steals focus,
    // never costs the user their place in the studio, and is announced.
    const [notices, setNotices] = useState([]);
    const noticeSeq = useRef(0);
    const notify = React.useCallback((kind, message, detail) => {
        const id = ++noticeSeq.current;
        setNotices((list) => [...list.slice(-2), { id, kind, message, detail }]);
        if (kind !== 'error') {
            window.setTimeout(() => setNotices((l) => l.filter((n) => n.id !== id)), 6000);
        }
    }, []);
    const dismissNotice = (id) => setNotices((l) => l.filter((n) => n.id !== id));

    // A 422 carries diagnostics worth reading. They were being discarded.
    const [layoutFailure, setLayoutFailure] = useState(null);

    // One access surface, shown where the locked action is.
    const [accessPrompt, setAccessPrompt] = useState(null);

    const [briefReading, setBriefReading] = useState(null);
    useEffect(() => {
        if (!initialBrief || !initialBrief.patch) return;
        setFormData((prev) => ({ ...prev, ...initialBrief.patch }));
        setBriefReading(initialBrief.read || []);
    }, [initialBrief]);

    const [status, setStatus] = useState(() => initialSession?.status || 'idle');
    const [planSvg, setPlanSvg] = useState(() => initialSession?.planSvg || null);
    const [planSpec, setPlanSpec] = useState(() => initialSession?.planSpec || null);
    const [refinementHistory, setRefinementHistory] = useState(() => initialSession?.refinementHistory || []);
    const [refinementsLeft, setRefinementsLeft] = useState(() => Number.isFinite(initialSession?.refinementsLeft) ? initialSession.refinementsLeft : 10);
    const [zoomImage, setZoomImage] = useState(null);
    // Index of the ranked option shown in the option dialog, or null.
    const [openOption, setOpenOption] = useState(null);
    useEffect(() => {
        if (openOption === null) return;
        const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpenOption(null); } };
        document.addEventListener('keydown', onKey, true);
        return () => document.removeEventListener('keydown', onKey, true);
    }, [openOption]);
    const [galleryId, setGalleryId] = useState(() => initialSession?.galleryId || null);
    const [planScore, setPlanScore] = useState(() => initialSession?.planScore ?? null);
    const [footprintInfo, setFootprintInfo] = useState(() => initialSession?.footprintInfo ?? null);
    const [openingDiagnostics, setOpeningDiagnostics] = useState(() => initialSession?.openingDiagnostics ?? null);
    const [alternatives, setAlternatives] = useState(() => initialSession?.alternatives || []);
    const [optionSequence, setOptionSequence] = useState(() => initialSession?.optionSequence || []);
    const [currentOptionIndex, setCurrentOptionIndex] = useState(0);
    const [isExportingEstimateXlsx, setIsExportingEstimateXlsx] = useState(false);
    const [renderLaunchSignal, setRenderLaunchSignal] = useState(0);
    const [renderResetKey, setRenderResetKey] = useState(0);
    const [renderPanelStatus, setRenderPanelStatus] = useState(() => normalizeRenderState(initialSession?.renderState).status);
    const [renderState, setRenderState] = useState(() => normalizeRenderState(initialSession?.renderState));
    const [planView, setPlanView] = useState('rendered');
    const [renderedPlan, setRenderedPlan] = useState(null);
    const [presentationStatus, setPresentationStatus] = useState('idle');
    const [presentationError, setPresentationError] = useState('');
    const [showRenderedLabels, setShowRenderedLabels] = useState(true);
    const [isExportingPng, setIsExportingPng] = useState(false);
    const presentationRequest = useRef(0);
    const renderedReady = renderedPlan?.source === planSvg && renderedPlan?.spec === planSpec;
    const activeRenderedSvg = renderedReady ? renderedPlan.svg : null;
    const displayPlanSvg = planView === 'rendered' && activeRenderedSvg
        ? (showRenderedLabels ? activeRenderedSvg : activeRenderedSvg.replace('</style>', '.rendered-labels { display:none; }</style>'))
        : planSvg;
    const displayElevations = planView === 'rendered' && renderedReady ? renderedPlan.elevations : planSpec?.elevations;
    const presentationPending = planView === 'rendered' && !renderedReady && !!planSvg && presentationStatus !== 'error';
    const preparePresentation = async () => {
        const requestId = ++presentationRequest.current;
        setPresentationStatus('loading'); setPresentationError('');
        try {
            const response = await fetch('/api/plan/presentation', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planSpec, surveyData: formData }),
            });
            const result = await response.json();
            if (!response.ok || !result.success || !result.svg || !result.elevations) throw new Error(result.message || 'Unable to prepare rendered views.');
            if (requestId !== presentationRequest.current) return;
            setRenderedPlan({ source: planSvg, spec: planSpec, svg: result.svg, elevations: result.elevations });
            setPresentationStatus('ready');
        } catch (error) {
            if (requestId !== presentationRequest.current) return;
            setPresentationError(`${error.message} Showing normal views. Select Rendered to retry.`);
            setPresentationStatus('error'); setPlanView('normal');
        }
    };
    useEffect(() => {
        setPlanView('rendered'); setRenderedPlan(null); setPresentationError('');
        if (planSvg && planSpec) preparePresentation();
        else setPresentationStatus('idle');
        return () => { presentationRequest.current += 1; };
    }, [planSvg, planSpec]);
    const selectPlanView = view => {
        setPlanView(view);
        if (view === 'rendered' && !renderedReady && presentationStatus !== 'loading') preparePresentation();
    };


    useEffect(() => {
        try {
            const s = JSON.parse(localStorage.getItem(STUDIO_UNLOCK_KEY) || 'null');
            const expiresAt = s?.expiresAt ? Date.parse(s.expiresAt) : NaN;
            if (s?.token && Number.isFinite(expiresAt) && expiresAt > Date.now()) {
                setIsUnlocked(true);
                setAccessPrompt(null);
                setAccessToken(s.token);
                setAccessTokenExpiry(s.expiresAt);
            } else if (s) {
                localStorage.removeItem(STUDIO_UNLOCK_KEY);
            }
        } catch {}
    }, []);

    useEffect(() => {
        const snapshot = {
            version: 1,
            savedAt: new Date().toISOString(),
            formData,
            status: status === 'loading-plan' || status === 'refining'
                ? (planSvg ? 'plan-ready' : 'idle')
                : status,
            planSvg,
            planSpec,
            refinementHistory,
            refinementsLeft,
            galleryId,
            planScore,
            footprintInfo,
            openingDiagnostics,
            alternatives: Array.isArray(alternatives) ? alternatives.slice(0, 6) : [],
            optionSequence: Array.isArray(optionSequence) ? optionSequence.slice(0, 6) : [],
            renderState: renderState?.image
                ? {
                    ...renderState,
                    image: null,
                    imageClean: null,
                    status: 'ready',
                    errorMsg: '',
                  }
                : {
                    ...createEmptyRenderState(),
                    surveyData: renderState?.surveyData || null,
                  },
        };
        try {
            localStorage.setItem(STUDIO_SESSION_KEY, JSON.stringify(snapshot));
        } catch {}
    }, [formData, status, planSvg, planSpec, refinementHistory, refinementsLeft, galleryId, planScore, footprintInfo, openingDiagnostics, alternatives, optionSequence, renderState]);

    const promptUnlock = (featureLabel = 'advanced features') => {
        setAccessPrompt(featureLabel);
    };

    const requireAdvancedAccess = (featureLabel) => {
        if (accessToken) return true;
        promptUnlock(featureLabel);
        return false;
    };

    const handleUnlock = async (e) => {
        e.preventDefault();
        const key = (passkeyInput||'').trim();
        if (!key) { setUnlockStatus('error:Enter a passkey.'); return; }
        setUnlockStatus('loading');
        try {
            const res = await fetch('/api/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ passkey:key }) });
            const data = await res.json().catch(() => null);
            if (res.ok && data?.success && data?.token) {
                setIsUnlocked(true);
                setAccessToken(data.token);
                setAccessTokenExpiry(data.expiresAt || null);
                setUnlockStatus('idle');
                try {
                    localStorage.setItem(STUDIO_UNLOCK_KEY, JSON.stringify({
                        unlocked: true,
                        token: data.token,
                        expiresAt: data.expiresAt || null,
                        ts: Date.now(),
                    }));
                } catch {}
                return;
            }
            setUnlockStatus(`error:${data?.message||'Invalid passkey.'}`);
        } catch { setUnlockStatus('error:Network error.'); }
    };

    const handleGeneratePlan = async () => {
        setLayoutFailure(null);
        setStatus('loading-plan');
        try {
            const res = await fetch('/api/plan', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ surveyData:formData, chatHistory:[] }) });
            const data = await res.json();
            if (!res.ok || !data.success) {
                // res.ok was never checked, so a 422 NO_VALID_LAYOUT arrived
                // with a full diagnostics object and was reduced to
                // alert('Error: ' + message) with the detail thrown away.
                const err = new Error(data.message || ('Request failed with status ' + res.status));
                err.code = data.code;
                err.diagnostics = data.diagnostics;
                throw err;
            }
            setLayoutFailure(null);
            setPlanSvg(data.svg);
            setPlanSpec(data.planSpec ? { ...data.planSpec, estimate: data.estimate || data.planSpec?.estimate || null } : null);
            setRefinementHistory([]);
            setRefinementsLeft(10);
            setGalleryId(data.galleryId || null);
            setPlanScore(data.score ?? null);
            setFootprintInfo(data.footprintInfo ?? null);
            setOpeningDiagnostics(data.openingDiagnostics || data.planSpec?.openingDiagnostics || null);
            setAlternatives(data.alternatives || []);
            // Build immutable option sequence: best plan as option 0, then alternatives
            const bestOption = {
                svg: data.svg,
                planSpec: data.planSpec ? { ...data.planSpec, estimate: data.estimate || data.planSpec?.estimate || null } : null,
                score: data.score,
                footprintInfo: data.footprintInfo,
                openingDiagnostics: data.openingDiagnostics || data.planSpec?.openingDiagnostics || null,
                functionalId: data.footprintInfo?.functionalId || data.planSpec?.functionalId || 'front_core_compact',
                functionalLabel: data.footprintInfo?.functionalLabel || data.planSpec?.functionalLabel || 'Option 1',
            };
            const altOptions = (data.alternatives || []).map((alt, i) => ({
                svg: alt.svg,
                planSpec: alt.planSpec,
                score: alt.score,
                footprintInfo: alt.footprintInfo,
                openingDiagnostics: alt.openingDiagnostics || alt.planSpec?.openingDiagnostics || null,
                functionalId: alt.footprintInfo?.functionalId || alt.planSpec?.functionalId || `option_${i + 2}`,
                functionalLabel: alt.footprintInfo?.functionalLabel || alt.planSpec?.functionalLabel || `Option ${i + 2}`,
            }));
            setOptionSequence([bestOption, ...altOptions].slice(0, 3));
            setCurrentOptionIndex(0);
            setRenderState(createEmptyRenderState());
            setRenderResetKey(k => k + 1);
            setRenderPanelStatus('idle');
            setStatus('plan-ready');
        } catch (err) {
            if (err.code === 'NO_VALID_LAYOUT') {
                const rejected = err.diagnostics?.rejectedCandidates || [];
                const reasons = [...new Set(rejected.map((r) => r.reason).filter(Boolean))].slice(0, 4);
                setLayoutFailure({
                    message: err.message,
                    tried: err.diagnostics?.triedCandidateCount ?? rejected.length,
                    reasons,
                });
            } else {
                notify('error', 'Could not generate a plan.', err.message);
            }
            // The brief stays exactly as the user left it, and any plan they
            // already had is untouched.
            setStatus(planSvg ? 'plan-ready' : 'idle');
        }
    };

    const handleRefine = async (instruction) => {
        if (!requireAdvancedAccess('refinements')) return;
        if (refinementsLeft <= 0) return;
        setStatus('refining');
        // Optimistically add user message to history
        setRefinementHistory(prev => [...prev, { role:'user', content: instruction }]);
        try {
            const res = await fetch('/api/plan/refine', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify({
                    surveyData: formData,
                    currentPlanSpec: planSpec,
                    refinementInstruction: instruction,
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            // Build a human-readable summary of what changed
            const changes = data.appliedChanges || [];
            const summary = changes.length > 0
                ? changes.map(c => {
                    const room = planSpec.levels?.flatMap(l => l.rooms || []).find(r => r.id === c.id);
                    const name = room?.label || c.id;
                    if (c.action === 'resize') return `Resized ${name} to ${c.w} x ${c.h} ft`;
                    if (c.action === 'move') return `Moved ${name} to (${c.x}, ${c.y})`;
                    if (c.action === 'resize_and_move') return `Resized & moved ${name} to ${c.w} x ${c.h} ft`;
                    return `Updated ${name}`;
                }).join(', ')
                : `Applied: ${instruction}`;

            const updatedSpec = data.planSpec ? { ...data.planSpec, estimate: data.estimate || data.planSpec?.estimate || null } : null;
            setPlanSvg(data.svg);
            setPlanSpec(updatedSpec);
            setOpeningDiagnostics(data.openingDiagnostics || data.planSpec?.openingDiagnostics || null);
            if (data.galleryId) setGalleryId(data.galleryId);
            setRenderState(createEmptyRenderState());
            setRenderResetKey(k => k + 1);
            setRenderPanelStatus('idle');
            setRefinementHistory(prev => [...prev, { role:'assistant', content: summary }]);
            setRefinementsLeft(prev => prev - 1);
            // Update the current option in optionSequence so alternatives stay in sync
            setOptionSequence(prev => prev.map((opt, i) =>
                i === currentOptionIndex
                    ? { ...opt, svg: data.svg, planSpec: updatedSpec, score: data.diagnostics?.refined?.score ?? opt.score, openingDiagnostics: data.openingDiagnostics || null }
                    : opt
            ));
            setStatus('plan-ready');
        } catch(err) {
            console.error('[refine]', err);
            setRefinementHistory(prev => [...prev, { role:'error', content: err.message }]);
            setStatus('plan-ready');
        }
    };

    const applyOptionChoice = React.useCallback((opt, index = 0) => {
        if (!opt?.svg || !opt?.planSpec) return;
        setPlanSvg(opt.svg);
        setPlanSpec(opt.planSpec);
        setPlanScore(opt.score);
        setFootprintInfo(opt.footprintInfo);
        setOpeningDiagnostics(opt.openingDiagnostics || opt.planSpec?.openingDiagnostics || null);
        setCurrentOptionIndex(index);
        setRenderState(createEmptyRenderState());
        setRenderResetKey(k => k + 1);
        setRenderPanelStatus('idle');
    }, []);

    const downloadBlueprint = async () => {
    if (presentationPending) return;
    try {
        setIsExportingPng(true);
        // A dedicated full-resolution plan keeps every floor and room readable.
        const pngUrl = await svgToPngDataUrl(displayPlanSvg, {
            background: planView === 'rendered' ? '#535f64' : '#F9F8F4',
            longEdge: 6000,
        });

        const l = document.createElement('a');
        l.href = pngUrl;
        l.download = buildPlanExportFilename(formData, planView === 'rendered' ? 'rendered floor plan 6k' : 'floor plan 6k', 'png');
        document.body.appendChild(l);
        l.click();
        l.remove();
    } catch (err) {
        console.error('[downloadBlueprint]', err);
        notify('error', 'Download failed.', err?.message);
        } finally { setIsExportingPng(false); }
    };

    const downloadElevations = async () => {
        if (presentationPending) return;
        if (!planSpec?.elevations) { notify('info', 'No elevations to export yet.'); return; }
        try {
            const pngUrl = await composeElevationReferenceSheet(displayElevations, { exportQuality: true });
            if (!pngUrl) throw new Error('Unable to build elevation sheet');
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = buildPlanExportFilename(formData, planView === 'rendered' ? 'rendered elevation set' : 'elevation set', 'png');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('[downloadElevations]', err);
            notify('error', 'Elevation export failed.', err?.message);
        }
    };

    const downloadDxf = () => {
        if (!planSpec || !planSpec.levels) { notify('info', 'Generate a plan before exporting.'); return; }
        if (!requireAdvancedAccess('CAD export (DXF)')) return;
        try {
            const dxfString = buildPresentationDxf(planSpec);
            const blob = new Blob([dxfString], { type: 'application/dxf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = buildPlanExportFilename(formData, 'floor plan cad', 'dxf');
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('[downloadDxf]', err);
            notify('error', 'DXF export failed.', err.message);
        }
    };

    const downloadRenderImage = () => {
        if (!requireAdvancedAccess('Exterior Render')) return;
        if (!renderState?.image) { notify('info', 'Generate an exterior render first.'); return; }
        const link = document.createElement('a');
        link.href = renderState.image;
        link.download = buildPlanExportFilename(formData, 'exterior render', 'png');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const downloadEstimateXlsx = async () => {
        const estimate = planSpec?.estimate || null;
        if (!planSpec || !estimate) { notify('info', 'No estimate to export yet.'); return; }
        if (!requireAdvancedAccess('Cost Estimate XLSX')) return;
        setIsExportingEstimateXlsx(true);
        try {
            const res = await fetch('/api/estimate/xlsx', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify({
                    surveyData: formData,
                    planSpec,
                    estimate,
                    exportMeta: {
                        projectName: 'Keystone Cost Estimate',
                        generatedAt: new Date().toISOString(),
                    },
                }),
            });

            if (!res.ok) {
                let message = 'Failed to export XLSX.';
                const raw = await res.text();
                if (raw) {
                    try {
                        const data = JSON.parse(raw);
                        message = data?.detail || data?.message || message;
                    } catch (_) {
                        message = raw;
                    }
                }
                throw new Error(message);
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = buildPlanExportFilename(formData, 'cost estimate', 'xlsx');
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('[downloadEstimateXlsx]', err);
            notify('error', 'Cost estimate export failed.', err.message);
        } finally {
            setIsExportingEstimateXlsx(false);
        }
    };

    const launchRenderSurvey = () => {
        if (!planSpec || !planSvg) {
            notify('info', 'Generate a plan first.');
            return;
        }
        if (!requireAdvancedAccess('Exterior Render')) return;
        if (renderPanelStatus === 'loading') return;
        setRenderLaunchSignal((value) => value + 1);
    };

    const renderActionLabel =
        renderPanelStatus === 'loading'
            ? 'Rendering 3D...'
            : renderPanelStatus === 'ready'
                ? 'Exterior Render Options'
                : 'Generate Exterior Render';

    const isLoading = status === 'loading-plan' || status === 'refining';
    const resetSampleBrief = () => {
        setFormData({ ...DEFAULT_FORM_DATA });
        setStatus('idle');
        setPlanSvg(null);
        setPlanSpec(null);
        setRefinementHistory([]);
        setRefinementsLeft(10);
        setGalleryId(null);
        setPlanScore(null);
        setFootprintInfo(null);
        setAlternatives([]);
        setRenderState(createEmptyRenderState());
        setRenderResetKey(k => k + 1);
        setRenderPanelStatus('idle');
        try { localStorage.removeItem(STUDIO_SESSION_KEY); } catch {}
    };

    return (
        <section id="generator" className="studio-section px-4 md:px-6 py-5">
            <div className="site-shell">
                {/* Lightbox */}
                {/* Option preview. Escape and the close button both return
                    you to the studio with nothing changed; keeping an option
                    is a separate, explicit action. */}
                <AnimatePresence>
                    {openOption !== null && optionSequence[openOption] && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.16 }}
                            className="option-dialog-backdrop"
                            onClick={() => setOpenOption(null)}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                                className="option-dialog"
                                role="dialog"
                                aria-modal="true"
                                aria-label={`Option ${openOption + 1}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="option-dialog-bar">
                                    <div>
                                        <h3>Option {openOption + 1}</h3>
                                        <p>{optionSequence[openOption]?.functionalLabel || 'Ranked layout'}</p>
                                    </div>
                                    <div className="option-dialog-actions">
                                        {planSvg === optionSequence[openOption]?.svg ? (
                                            <span className="option-chip-current">In the studio now</span>
                                        ) : (
                                            <button
                                                type="button"
                                                className="studio-btn studio-btn-primary"
                                                onClick={() => {
                                                    applyOptionChoice(optionSequence[openOption], openOption);
                                                    setOpenOption(null);
                                                }}
                                            >Use this option</button>
                                        )}
                                        <button
                                            type="button"
                                            className="studio-btn studio-btn-quiet"
                                            onClick={() => setOpenOption(null)}
                                        >Close</button>
                                    </div>
                                </div>
                                <div
                                    className="option-dialog-sheet"
                                    dangerouslySetInnerHTML={{ __html: optionSequence[openOption]?.svg || '' }}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {zoomImage && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setZoomImage(null)}
                            className="fixed inset-0 z-200 bg-ink/93 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out">
                            {typeof zoomImage === 'string' && zoomImage.startsWith('<svg')
                                ? <div className="bg-white p-4 md:p-8 max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl rounded-xs" dangerouslySetInnerHTML={{__html:zoomImage}}/>
                                : <img src={zoomImage} className="max-h-[90vh] max-w-full object-contain rounded-xs" alt="Zoom"/>}
                            <button type="button" onClick={() => setZoomImage(null)} aria-label="Close zoomed plan" className="absolute top-4 right-4 text-white/40 hover:text-white">
                                <CloseIcon className="w-6 h-6"/>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>


                <div className="transition-opacity">
                    {/* Only rendered once there is something to act on. The
                        access rules that used to be explained in a paragraph
                        here are now shown inline at each gated control. */}
                    {planSvg && (
                        <div className="studio-actions">
                            <button
                                type="button"
                                className="studio-btn studio-btn-primary"
                                onClick={launchRenderSurvey}
                                disabled={!planSpec || !planSvg || isLoading || renderPanelStatus === 'loading'}
                            >
                                {renderActionLabel}
                            </button>
                            <DownloadMenu
                                disabled={isLoading}
                                items={[
                                    { label: isExportingPng ? 'Preparing PNG...' : 'Floor plan',
                                      aria: 'Download floor plan PNG',
                                      note: 'PNG, 6000px long edge',
                                      disabled: !planSvg || isLoading || isExportingPng || presentationPending,
                                      onClick: downloadBlueprint },
                                    { label: 'Elevations',
                                      aria: 'Download elevations PNG',
                                      note: 'PNG, all four sides',
                                      disabled: !displayElevations || isLoading || presentationPending,
                                      onClick: downloadElevations },
                                    { label: 'Exterior render',
                                      aria: 'Download exterior render PNG',
                                      note: renderState?.image ? 'PNG' : 'Generate a render first',
                                      disabled: !renderState?.image || isLoading,
                                      onClick: downloadRenderImage },
                                    { label: 'CAD export',
                                      aria: 'Download CAD export DXF',
                                      note: 'DXF, opens in any CAD tool',
                                      disabled: !planSpec || isLoading,
                                      onClick: downloadDxf },
                                    { label: isExportingEstimateXlsx ? 'Building XLSX...' : 'Cost estimate',
                                      aria: 'Download cost estimate XLSX',
                                      note: planSpec?.estimate ? 'XLSX workbook' : 'Not available for this plan',
                                      disabled: !planSpec?.estimate || isLoading || isExportingEstimateXlsx,
                                      onClick: downloadEstimateXlsx },
                                ]}
                            />
                        </div>
                    )}

                {/* Two columns, not three. The tools rail used to hold a fixed
                    300px beside the drawing at every width, leaving the drawing
                    about 54% of the workspace; it now sits below, full width. */}
                <div className="studio-grid">
                    {/* LEFT â€" The Brief */}
                    <div className="cad-panel-brief">
                        <div className="cad-panel-brief-header">
                            <div>
                                <div className="mono text-[7px] uppercase tracking-[0.22em]" style={{color:'var(--ink-soft)'}}>The Brief</div>
                                <div className="cg text-sm font-bold" style={{letterSpacing:'-0.02em',marginTop:1}}>Project Parameters</div>
                            </div>
                            {isLoading
                                ? <div className="w-3 h-3 border-2 border-blue border-t-transparent rounded-full animate-spin"/>
                                : planSvg
                                    ? <span style={{display:'inline-flex',alignItems:'center',gap:4,background:'var(--accent)',color:'#1A0D06',padding:'3px 8px',borderRadius:99,fontSize:8,fontFamily:'IBM Plex Mono,monospace',letterSpacing:'0.14em',textTransform:'uppercase'}}>
                                        <span style={{width:5,height:5,borderRadius:'50%',background:'#1A0D06',display:'inline-block'}}/>Ready
                                      </span>
                                    : null}
                        </div>
                        <div className="cad-panel-brief-body">
                            {briefReading && briefReading.length > 0 && (
                                <div className="brief-reading" role="status">
                                    <p>From your sentence, Keystone read:</p>
                                    <ul>{briefReading.map((r) => <li key={r}>{r}</li>)}</ul>
                                    <p className="brief-reading-note">Change anything below before generating.</p>
                                </div>
                            )}
                            <div style={{padding:'8px 12px 12px'}}>
                                <SurveyForm formData={formData} setFormData={setFormData} onSubmit={handleGeneratePlan} isLoading={isLoading} onReset={resetSampleBrief}/>
                            </div>
                        </div>
                    </div>

                    {/* CENTER â€" Blueprint Canvas */}
                    <div className="cad-canvas-panel">
                        {/* Title block */}
                        <div className="cad-canvas-titleblock">
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                                <svg width="12" height="12" fill="none" stroke="rgba(110,220,130,0.75)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                                <span className="mono" style={{fontSize:8,color:'rgba(110,220,130,0.92)',letterSpacing:'0.18em',textTransform:'uppercase'}}>
                                    {planSvg && footprintInfo
                                        ? `${footprintInfo.widthFt}' x ${footprintInfo.heightFt}' | ${formData.stories || ''} | ${formData.bedrooms || ''}${planSpec?.elevations ? ' | elevation set' : ''}`
                                        : 'Blueprint Viewport'}
                                </span>
                            </div>
                            {planSvg && planScore != null
                                ? <div style={{display:'flex',alignItems:'center',gap:6}}>
                                    <span className="mono" style={{fontSize:7,color:'rgba(110,220,130,0.72)',letterSpacing:'0.14em',textTransform:'uppercase'}}>AI Score</span>
                                    <span className="mono" style={{fontSize:9,fontWeight:700,color:planScore>=70?'#4ade80':planScore>=40?'#facc15':'#f87171'}}>{planScore}/100</span>
                                  </div>
                                : <span className="mono" style={{fontSize:7,color:'rgba(110,220,130,0.55)',letterSpacing:'0.16em',textTransform:'uppercase'}}>Keystone AI | Blueprint</span>}
                        </div>
                        {planSvg && <div className="flex flex-wrap items-center gap-2 p-3" style={{background:'var(--surface-1)'}}>
                            <div role="group" aria-label="Plan and elevation view" className="flex gap-2">
                                {['rendered', 'normal'].map(view => <button key={view} type="button"
                                    aria-pressed={planView === view} disabled={view === 'rendered' && (isLoading || presentationStatus === 'loading')}
                                    onClick={() => selectPlanView(view)} className="px-3 py-2 border rounded-xs text-[11px]"
                                    style={{background:planView === view ? '#263b43' : '#fff',color:planView === view ? '#fff' : '#263b43'}}>
                                    {view === 'normal' ? 'Normal' : 'Rendered'}
                                </button>)}
                            </div>
                            {planView === 'rendered' && renderedReady && <label className="flex items-center gap-2 text-[11px]"><input type="checkbox" checked={showRenderedLabels} onChange={e => setShowRenderedLabels(e.target.checked)} style={{width:'auto'}}/>Room details</label>}
                            {presentationPending && <span role="status" className="text-[11px]">Preparing rendered plan and elevations...</span>}
                            {presentationError && <p role="alert" className="text-[11px] text-red">{presentationError}</p>}
                        </div>}
                        {/* Canvas body */}
                        <div className="cad-canvas-body">
                            {layoutFailure && (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="layout-failure" role="alert">
                                        <h4>No layout met the checks</h4>
                                        <p>{layoutFailure.message}</p>
                                        {layoutFailure.tried > 0 && (
                                            <p style={{marginTop:'0.5rem'}}>
                                                Keystone tried {layoutFailure.tried} {layoutFailure.tried === 1 ? 'layout' : 'layouts'}.
                                            </p>
                                        )}
                                        {layoutFailure.reasons.length > 0 && (
                                            <ul>
                                                {layoutFailure.reasons.map((r) => (
                                                    <li key={r}>{String(r).replace(/_/g, ' ')}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                            {status === 'idle' && !layoutFailure && (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center" style={{color:'var(--ink-soft)'}} role="status" aria-live="polite">
                                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                                    <p className="cg text-2xl text-white" style={{letterSpacing:'-0.05em',textTransform:'uppercase'}}>Awaiting your brief</p>
                                    <p className="mono text-[9px] uppercase tracking-widest mt-2">Complete the survey to generate the first plan</p>
                                </div>
                            )}
                            {isLoading && (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-white" role="status" aria-live="polite">
                                    <div className="w-12 h-12 border-[3px] border-blue border-t-transparent rounded-full animate-spin mb-6"/>
                                    <p className="mono text-[10px] uppercase tracking-widest animate-pulse text-blue">{status==='refining' ? 'Applying refinement...' : 'Generating floor plan...'}</p>
                                    <p className="text-[9px] mt-2" style={{color:'var(--ink-soft)'}}>Usually under 5 seconds</p>
                                </div>
                            )}
                            {(status === 'plan-ready' || status === 'refining') && planSvg && (
                                <InteractiveCanvas viewKey={[galleryId, currentOptionIndex, planView, renderedReady].join('|')}>
                                    <BlueprintPresentationSheet
                                        planSvg={displayPlanSvg}
                                        elevations={displayElevations}
                                        formData={formData}
                                        footprintInfo={footprintInfo}
                                        renderImage={renderState?.image || null}
                                        planSpec={planSpec}
                                    />
                                </InteractiveCanvas>
                            )}
                        </div>

                        {(notices.length > 0 || accessPrompt) && (
                            <div className="studio-notices" role="status" aria-live="polite">
                                {accessPrompt && (
                                    <div className="studio-notice is-info">
                                        <div className="access-inline" style={{padding:0,background:'transparent',border:0}}>
                                            <h4>A passkey unlocks {accessPrompt}</h4>
                                            <p>Floor plans and elevations stay free. Enter a passkey to continue, or request one.</p>
                                            <form onSubmit={(e) => { e.preventDefault(); handleUnlock(); }}>
                                                <input
                                                    type="password"
                                                    value={passkeyInput}
                                                    onChange={(e) => setPasskeyInput(e.target.value)}
                                                    placeholder="Access code"
                                                    aria-label="Access code"
                                                />
                                                <button type="submit" className="btn-primary">
                                                    {unlockStatus === 'loading' ? 'Checking' : 'Unlock'}
                                                </button>
                                            </form>
                                            {unlockStatus.startsWith('error:') && (
                                                <p className="access-error" role="alert">{unlockStatus.slice(6)}</p>
                                            )}
                                            <button type="button" className="btn-ghost" onClick={onOpenModal}>Request a passkey</button>
                                        </div>
                                        <button type="button" onClick={() => setAccessPrompt(null)} aria-label="Dismiss">
                                            <XIcon size={16} weight="bold" aria-hidden="true"/>
                                        </button>
                                    </div>
                                )}
                                {notices.map((n) => (
                                    <div key={n.id} className={'studio-notice is-' + n.kind}>
                                        <div>
                                            <p>{n.message}</p>
                                            {n.detail && <p className="studio-notice-detail">{n.detail}</p>}
                                        </div>
                                        <button type="button" onClick={() => dismissNotice(n.id)} aria-label="Dismiss">
                                            <XIcon size={16} weight="bold" aria-hidden="true"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT â€" Actions & Tools */}
                    <div className="cad-panel-actions">
                        {(status === 'plan-ready' || status === 'refining') && planSvg ? (
                            <>
                                <div className="paper-panel p-5">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="badge" style={{background: status === 'refining' ? '#fff6ed' : 'var(--paper)', borderColor: status === 'refining' ? 'var(--accent)' : 'var(--blue)'}}>{status === 'refining' ? 'Refining...' : 'Plan ready'}</span>
                                            <span className="mono text-[7px] uppercase tracking-[0.22em] text-mid font-bold">{refinementsLeft} updates left</span>
                                        </div>
                                        {footprintInfo && (
                                            <div style={{display:'flex',flexDirection:'column',gap:6}}>
                                                <div className="cad-metric-chip">
                                                    <span className="label">Footprint</span>
                                                    <span className="value">{footprintInfo.widthFt}' x {footprintInfo.heightFt}'</span>
                                                </div>
                                                {planScore != null && (
                                                    <div className="cad-metric-chip" style={{flexDirection:'column',alignItems:'flex-start',gap:4}}>
                                                        <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                                                            <span className="label">AI Score</span>
                                                            <span className="value" style={{color:planScore>=70?'#16a34a':planScore>=40?'#b45309':'#dc2626'}}>{planScore} / 100</span>
                                                        </div>
                                                        <div className="cad-score-bar" style={{width:'100%'}}>
                                                            <div className="cad-score-fill" style={{width:`${Math.min(100,planScore)}%`}}/>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="rounded-[14px] border border-black/8 bg-white/70 px-3 py-3">
                                            <p className="mono text-[8px] uppercase tracking-[0.2em]" style={{color:'var(--ink-soft)'}}>Action bar</p>
                                            <p className="text-[10px] leading-relaxed mt-2" style={{color:'var(--ink)'}}>
                                                Main exports and the 3D render action now live in the orange command bar above the studio columns.
                                            </p>
                                        </div>
                                        {optionSequence.length > 1 && (
                                            <button
                                                onClick={() => document.getElementById('keystone-option-stack')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                                className="w-full cta-secondary py-3 text-[10px]"
                                            >
                                                Jump To Option Stack ({Math.min(3, optionSequence.length)})
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {isUnlocked ? (
                                    <div className="paper-panel">
                                        <RefinementPanel planSpec={planSpec} formData={formData} refinementsLeft={refinementsLeft} refinementHistory={refinementHistory} onRefine={handleRefine} isLoading={isLoading}/>
                                    </div>
                                ) : (
                                    <div className="paper-panel p-5">
                                        <p className="mono text-[8px] uppercase tracking-[0.2em]" style={{color:'var(--ink-soft)'}}>Advanced refinement</p>
                                        <p className="text-[11px] leading-relaxed mt-2" style={{color:'var(--ink)'}}>
                                            Free mode gives you the first plan and elevations. Unlock advanced access to refine, export DXF, generate renders, and download the Cost Estimate workbook.
                                        </p>
                                    </div>
                                )}
                                {/* Behind a disclosure. The four elevations are a
                                    reference set you consult, not something you
                                    read on the way past, and expanded they pushed
                                    the estimate and the exports far below the
                                    fold. */}
                                <details className="studio-drawer">
                                    <summary>
                                        <span>Elevations</span>
                                        <span className="studio-drawer-meta">All four facades</span>
                                    </summary>
                                    <div className="studio-drawer-body">
                                        <ElevationsPanel elevations={displayElevations} formData={formData} onOpenPreview={img=>setZoomImage(img)}/>
                                    </div>
                                </details>
                                <div className="paper-panel">
                                    <Render3DPanel
                                        planSpec={planSpec}
                                        formData={formData}
                                        planSvg={planSvg}
                                        elevations={planSpec?.elevations}
                                        galleryId={galleryId}
                                        onRenderReady={img=>setZoomImage(img)}
                                        onRenderStateSnapshot={setRenderState}
                                        launchSignal={renderLaunchSignal}
                                        showLaunchButton={false}
                                        onRenderStatusChange={setRenderPanelStatus}
                                        accessToken={accessToken}
                                        initialState={renderState}
                                        resetKey={renderResetKey}
                                        isLocked={!isUnlocked}
                                        onLockedAction={promptUnlock}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="paper-panel p-6 text-center text-mid flex flex-col items-center justify-center h-full">
                                <svg className="w-8 h-8 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>
                                <p className="text-[11px] leading-relaxed">Once you generate a plan, this side shows the summary, refinements, elevations, render controls, and the cost estimate.</p>
                            </div>
                        )}
                    </div>
                </div>

                {(status === 'plan-ready' || status === 'refining') && optionSequence.length > 1 && (
                    <div id="keystone-option-stack" className="option-picker">
                        <div className="option-picker-head">
                            <span className="section-label">Other options</span>
                            <p>
                                Keystone ranked every layout it drew. Open one to see it full size,
                                then keep it or close and stay where you are.
                            </p>
                        </div>
                        {/* Buttons, not a stacked column of live previews. The
                            previous version rendered all three plan SVGs inline
                            underneath the drawing, which pushed the summary and
                            estimate off-screen and made comparing them a scroll
                            exercise. */}
                        <div className="option-picker-row">
                            {optionSequence.slice(0, 3).map((opt, index) => {
                                const isActive = planSvg === opt?.svg;
                                return (
                                    <button
                                        key={`${opt?.functionalId || 'option'}_${index}`}
                                        type="button"
                                        className={'option-chip' + (isActive ? ' is-current' : '')}
                                        onClick={() => setOpenOption(index)}
                                    >
                                        <span className="option-chip-n">Option {index + 1}</span>
                                        <span className="option-chip-label">
                                            {opt?.functionalLabel || 'Ranked layout'}
                                        </span>
                                        <span className="option-chip-meta">
                                            {opt?.footprintInfo
                                                ? `${opt.footprintInfo.widthFt} x ${opt.footprintInfo.heightFt} ft`
                                                : 'Open to view'}
                                        </span>
                                        {isActive && <span className="option-chip-current">In the studio now</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {(status === 'plan-ready' || status === 'refining') && planSvg && (
                    <details className="studio-drawer">
                        <summary>
                            <span>Generated plan summary</span>
                            <span className="studio-drawer-meta">Details, openings and cost estimate</span>
                        </summary>
                        <div className="studio-drawer-body">
                        <div className="grid xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] gap-0">
                            <div className="border-r border-black/5">
                                <PlanSummaryPanel planSpec={planSpec} openingDiagnostics={openingDiagnostics}/>
                            </div>
                            {isUnlocked ? (
                                <EstimatePanel estimate={planSpec?.estimate}/>
                            ) : (
                                <div className="paper-panel mt-4 overflow-hidden">
                                    <div className="p-4 md:p-5 border-b border-black/5 bg-white/40">
                                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                                            <div>
                                                <p className="mono text-[8px] uppercase tracking-[0.24em]" style={{color:'var(--accent)'}}>Cost estimate</p>
                                                <p className="text-[13px] leading-relaxed mt-2" style={{color:'var(--ink)'}}>
                                                    Unlock advanced features to view and download the concept-level Cost Estimate workbook for this plan.
                                                </p>
                                            </div>
                                            <button onClick={onOpenModal} className="cta-hero cta-glow-soft">
                                                Unlock Advanced Features
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        </div>
                    </details>
                )}
                </div>
            </div>
        </section>
    );
};
