import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ JOIN MODAL Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬
export const JoinModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = React.useState({ fullName:'', projectName:'', email:'', questions:'' });
    const [status, setStatus] = React.useState('idle'); // idle | loading | success
    const [submitError, setSubmitError] = React.useState(null);
    const update = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const panelRef = React.useRef(null);
    const firstFieldRef = React.useRef(null);
    const returnFocusRef = React.useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;
        const handleEscape = (event) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    /* This dialog used to open without moving focus at all: the caret
       stayed on the page underneath, so anyone on a keyboard had to tab
       forward through the whole site to reach a form that was already
       covering it. Remember where focus came from, put it on the first
       field, and hand it back on close. */
    useEffect(() => {
        if (!isOpen) return undefined;
        returnFocusRef.current = document.activeElement;
        const id = window.setTimeout(() => firstFieldRef.current?.focus(), 60);
        return () => {
            window.clearTimeout(id);
            const back = returnFocusRef.current;
            if (back && typeof back.focus === 'function' && document.contains(back)) back.focus();
        };
    }, [isOpen]);

    /* aria-modal tells assistive tech the rest of the page is inert; it
       does not stop Tab. Without this, tabbing past the last field walks
       out of the dialog and into the page it is covering. */
    const trapTab = (event) => {
        if (event.key !== 'Tab') return;
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = [...panel.querySelectorAll(
            'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )].filter((el) => el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="join-scrim"
                >
                    <motion.div
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 24, opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={trapTab}
                        ref={panelRef}
                        className="join-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="join-title"
                        aria-describedby="join-intro"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="join-close"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                            </svg>
                        </button>

                        <div className="join-body">
                            <p className="join-eyebrow">Trial access</p>
                            <h2 id="join-title">Request a passkey.</h2>

                            {status === 'success' ? (
                                <div className="join-done" role="status">
                                    <p className="join-done-head">You&apos;re on the list.</p>
                                    <p>We will email your passkey and what to do with it.</p>
                                </div>
                            ) : (
                                <>
                                    <p id="join-intro" className="join-intro">
                                        Floor plans and elevations are already free, with no account. A
                                        passkey adds exterior renders, refinements in plain language, DXF
                                        export and the cost estimate workbook &mdash; at no charge while
                                        Keystone is in testing.
                                    </p>
                                    <form onSubmit={handleSubmit} className="join-form">
                                        <div className="join-row">
                                            <div className="join-field">
                                                <label htmlFor="join-name">Your name</label>
                                                <input id="join-name" ref={firstFieldRef} type="text" name="fullName"
                                                       value={formData.fullName} onChange={update} required
                                                       autoComplete="name" placeholder="Jane Doe"/>
                                            </div>
                                            <div className="join-field">
                                                <label htmlFor="join-project">Project</label>
                                                <input id="join-project" type="text" name="projectName"
                                                       value={formData.projectName} onChange={update} required
                                                       placeholder="Family home"/>
                                            </div>
                                        </div>
                                        <div className="join-field">
                                            <label htmlFor="join-email">Email</label>
                                            <input id="join-email" type="email" name="email"
                                                   value={formData.email} onChange={update} required
                                                   autoComplete="email" placeholder="jane@email.com"/>
                                        </div>
                                        <div className="join-field">
                                            <label htmlFor="join-questions">
                                                Anything we should know <span className="join-optional">optional</span>
                                            </label>
                                            <textarea id="join-questions" name="questions" rows="2"
                                                      value={formData.questions} onChange={update}
                                                      placeholder="What kind of house are you planning?"/>
                                        </div>

                                        {submitError && (
                                            <p role="alert" className="join-error">{submitError}</p>
                                        )}

                                        <button type="submit" disabled={status === 'loading'} className="btn-primary join-submit">
                                            {status === 'loading' ? 'Sending' : 'Request a passkey'}
                                        </button>
                                        <p className="join-fineprint">No spam. No card. We reply by email.</p>
                                        <button type="button" onClick={onClose} className="join-dismiss">
                                            Not now
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

