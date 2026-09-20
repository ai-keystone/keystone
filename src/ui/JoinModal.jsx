import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ JOIN MODAL Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬
export const JoinModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = React.useState({ fullName:'', projectName:'', email:'', questions:'' });
    const [status, setStatus] = React.useState('idle'); // idle | loading | success
    const [submitError, setSubmitError] = React.useState(null);
    const update = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (event) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSfdIXdz_gGRYmmTLENeYdSV17dwoBZWravDtM9SstDW_qvZag/formResponse';
        const fields = {
            'entry.564926659': formData.fullName.trim(),
            'entry.510477948': formData.projectName.trim(), // Reuse "Firm Name" field as project name
            'entry.1527142228': formData.email.trim(), // Business Email
            'entry.1172849489': formData.questions.trim(), // Additional Questions
        };
        try {
            const iframeName = `google-form-submit-${Date.now()}`;
            const hiddenIframe = document.createElement('iframe');
            hiddenIframe.name = iframeName;
            hiddenIframe.style.display = 'none';
            hiddenIframe.setAttribute('aria-hidden', 'true');
            document.body.appendChild(hiddenIframe);

            const hiddenForm = document.createElement('form');
            hiddenForm.action = FORM;
            hiddenForm.method = 'POST';
            hiddenForm.target = iframeName;
            hiddenForm.style.display = 'none';

            Object.entries(fields).forEach(([name, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                hiddenForm.appendChild(input);
            });

            document.body.appendChild(hiddenForm);
            hiddenForm.submit();
            window.setTimeout(() => {
                hiddenForm.remove();
                hiddenIframe.remove();
            }, 1400);

            setSubmitError(null);
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                onClose();
                setFormData({ fullName:'', projectName:'', email:'', questions:'' });
            }, 2600);
        } catch {
            // Was a blocking alert(). Inline, so the form keeps what was typed.
            setSubmitError('Could not send that. Check your connection and try again.');
            setStatus('idle');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity:0 }}
                    animate={{ opacity:1 }}
                    exit={{ opacity:0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-700 flex items-end md:items-center justify-center bg-black/85 backdrop-blur-xs p-0 md:p-6"
                >
                    <motion.div
                        initial={{ y:50, opacity:0 }}
                        animate={{ y:0, opacity:1 }}
                        exit={{ y:50, opacity:0 }}
                        transition={{ type:"spring", damping:26 }}
                        onClick={(event) => event.stopPropagation()}
                        className="electric-border w-full md:max-w-md rounded-t-2xl md:rounded-xl shadow-2xl relative overflow-hidden"
                        style={{
                            background:'linear-gradient(180deg, rgba(255,252,247,0.985), rgba(246,240,231,0.97))',
                            border:'1px solid var(--ink-soft)',
                            boxShadow:'0 28px 90px var(--ink-soft)',
                        }}
                    >
                        <div style={{ height:'3px', background:'linear-gradient(90deg, var(--accent), var(--accent-2))' }}/>

                        <button
                            onClick={onClose}
                            aria-label="Close access request"
                            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors z-10"
                            style={{
                                background:'rgba(255,255,255,0.82)',
                                color:'var(--ink)',
                                border:'1px solid var(--ink-soft)',
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </button>

                        <div className="p-6 md:p-8 overflow-y-auto" style={{ maxHeight:'90vh', color:'var(--ink)' }}>
                            <span className="badge mb-3 inline-block">Unlock Advanced Features</span>
                            <h2 className="cg text-3xl mb-1 mt-2" style={{ letterSpacing:'-0.05em', textTransform:'uppercase', color:'var(--ink)' }}>Request a trial passkey.</h2>
                            <p className="text-sm mt-2 mb-6 leading-relaxed" style={{color:'var(--ink)'}}>The free trial already includes the floor plan and elevations. Fill this out if you want access to the advanced package: Exterior Render, refinements, Cost Estimate workbook, and CAD export.</p>

                            {status === 'success' ? (
                                <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} className="flex flex-col items-center text-center py-10">
                                    <div className="w-16 h-16 rounded-full bg-blue flex items-center justify-center mb-4"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                                    <h3 className="cg text-2xl" style={{ letterSpacing:'-0.05em', textTransform:'uppercase' }}>You&apos;re on the list.</h3>
                                    <p className="text-mid text-sm mt-2">We will follow up with trial access details and next steps shortly.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mono text-[7px] uppercase tracking-widest text-mid block mb-1">Full Name</label>
                                            <input type="text" name="fullName" value={formData.fullName} onChange={update} required placeholder="Jane Doe"/>
                                        </div>
                                        <div>
                                            <label className="mono text-[7px] uppercase tracking-widest text-mid block mb-1">Project Name</label>
                                            <input type="text" name="projectName" value={formData.projectName} onChange={update} required placeholder="Dream House / Family Home"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mono text-[7px] uppercase tracking-widest text-mid block mb-1">Business Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={update} required placeholder="jane@email.com"/>
                                    </div>
                                    <div>
                                        <label className="mono text-[7px] uppercase tracking-widest text-mid block mb-1">Additional Questions</label>
                                        <textarea name="questions" rows="2" value={formData.questions} onChange={update} placeholder="Tell us what kind of house you are planning..."/>
                                    </div>
                                    {submitError && (
                                        <p role="alert" style={{color:'var(--accent)',fontSize:'var(--t-meta)',marginBottom:'0.5rem'}}>
                                            {submitError}
                                        </p>
                                    )}
                                    <button type="submit" disabled={status === 'loading'} className="cta-hero w-full py-4 text-base disabled:opacity-60">
                                        {status === 'loading' ? 'Sending...' : 'Request Trial Access'}
                                    </button>
                                    <p className="text-center mono text-[9px] text-mid">No spam • no credit card • fast follow-up</p>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-full py-3 text-[11px] uppercase tracking-[0.22em] mono text-mid border border-black/10 rounded-full hover:bg-black/4 transition-colors"
                                    >
                                        Not now, go back
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
