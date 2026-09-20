import React, { useEffect, useRef, useState } from 'react';

export const DownloadMenu = ({ items, disabled }) => {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
        const onKey = (e) => {
            if (e.key !== 'Escape') return;
            e.stopPropagation();
            setOpen(false);
            triggerRef.current?.focus();
        };
        document.addEventListener('pointerdown', onDown);
        document.addEventListener('keydown', onKey, true);
        return () => {
            document.removeEventListener('pointerdown', onDown);
            document.removeEventListener('keydown', onKey, true);
        };
    }, [open]);

    const usable = items.filter((i) => !i.hidden);
    return (
        <div className="dl-menu" ref={wrapRef}>
            <button
                type="button"
                ref={triggerRef}
                className="studio-btn studio-btn-quiet"
                disabled={disabled}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                Download
                <span className="dl-caret" aria-hidden="true"/>
            </button>
            {open && (
                <div className="dl-menu-list" role="menu" aria-label="Downloads">
                    {usable.map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            role="menuitem"
                            className="dl-menu-item"
                            disabled={item.disabled}
                            aria-label={item.aria}
                            onClick={() => { setOpen(false); item.onClick(); }}
                        >
                            <span className="dl-menu-label">{item.label}</span>
                            {item.note && <span className="dl-menu-note">{item.note}</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
