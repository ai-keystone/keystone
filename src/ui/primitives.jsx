import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ASSETS } from '../data/assets.js';
import { BRAND_DISPLAY_NAME, BRAND_TAGLINE } from '../data/brand.js';

export const DisclosureToggle = ({ expanded, hiddenCount, onToggle, label = 'items', ariaControls }) => {
    if (!hiddenCount && !expanded) return null;
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            {...(ariaControls ? { 'aria-controls': ariaControls } : {})}
            className="mono text-[12px] uppercase tracking-[0.18em]"
        >
            {expanded ? 'Show less' : `View all ${label}${hiddenCount ? ` (+${hiddenCount})` : ''}`}
        </button>
    );
};

export const ExpandableText = ({ summary, details, defaultExpanded = false }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const bodyText = expanded && details ? details : summary;
    return (
        <div>
            <p>{bodyText}</p>
            {details && details !== summary && (
                <button type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} className="mono text-[12px] uppercase tracking-[0.18em] mt-2">
                    {expanded ? 'Show less' : 'View all'}
                </button>
            )}
        </div>
    );
};

export const SmartImage = ({ eager = false, ...props }) => (
    <img
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        {...props}
    />
);

export const BrandLockup = ({
    href = '/',
    reverse = false,
    compact = false,
    markOnly = false,
    className = '',
    onClick,
}) => {
    const textColor = reverse ? 'text-white' : '';
    const subtitleColor = reverse ? 'var(--ink-soft)' : 'var(--ink-soft)';
    const content = (
        <div className={`flex items-center gap-3 ${className}`}>
            <SmartImage
                src={ASSETS.logoMark}
                alt={BRAND_DISPLAY_NAME}
                eager
                style={{
                    width: compact ? '30px' : '34px',
                    height: compact ? '30px' : '34px',
                    flexShrink: 0,
                }}
            />
            {!markOnly && (
                <div>
                    <span
                        className={`brand-wordmark block leading-none ${textColor}`}
                        style={{
                            fontSize: compact ? '1.08rem' : '1.18rem',
                            letterSpacing: '0.04em',
                        }}
                    >
                        {BRAND_DISPLAY_NAME}
                    </span>
                    <div
                        className="mono text-[11px] uppercase tracking-[0.22em] mt-1"
                        style={{ color: subtitleColor }}
                    >
                        {BRAND_TAGLINE}
                    </div>
                </div>
            )}
        </div>
    );

    if (!href) return content;
    return <a href={href} onClick={onClick}>{content}</a>;
};

export const Reveal = ({ children, delay = 0, y = 28, className = '', style = {} }) => (
    <motion.div
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-72px' }}
        transition={{ duration: 0.62, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
        style={style}
    >
        {children}
    </motion.div>
);

// â"€â"€â"€ REACT-BITS ADAPTED COMPONENTS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

/* Mobile bar. Three destinations, not five: two of the old five pointed at
   sections the homepage no longer has, and "Studio" meant the about section
   while the centre button meant the generator. One label per destination. */
