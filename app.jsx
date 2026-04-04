const { useState, useEffect, useRef, useMemo } = React;
const FM = window.framerMotion || window.Motion;
const { motion, AnimatePresence, useScroll, useTransform, useSpring } = FM;

const ASSETS = {
    watermark:        "images/keystone-line-art.png",
    icon:             "images/keystone-logo-mark.svg",
    logoMark:         "images/keystone-logo-mark.svg",
    logoPrimary:      "images/keystone-logo-primary.svg",
    logoReverse:      "images/keystone-logo-reverse.svg",
    qrCode:           "images/qualtrics-qr.png",
    team:             { sujan: "images/sujan.png", subrat: "images/subrat.png", rhythm: "images/rhythm.png" },
    phase1:           ["images/1.jpg","images/2.jpg","images/3.jpg","images/4.jpg","images/5.jpg","images/6.jpg"],
    phase2:           ["images/7.jpeg","images/8.jpeg","images/9.jpeg","images/10.jpeg","images/11.jpeg","images/12.jpeg","images/13.jpeg","images/14.jpeg"],
    phase3:           ["images/15.jpeg","images/6.jpg","images/1.jpg","images/4.jpg","images/2.jpg","images/5.jpg"],
    workflow:         {
        planReview:     "images/b2b-plan-review.jpeg",
        firmLaunch:     "images/b2b-firm-launch.jpeg",
        clientIntake:   "images/b2b-client-intake.jpeg",
        planExport:     "images/b2b-plan-export.jpeg",
        kickoffMeeting: "images/b2b-kickoff-meeting.jpeg",
        collage:        "images/b2b-workflow-collage.jpeg",
    },
    roadmap:          {
        exteriorStudy:  "images/keystone_study_render.png",
        cadExport:      "images/keystone_dx.png",
        overview:       "images/roadmap-overview.jpeg",
    },
    exampleBlueprint: "images/keystone_default_plan.png",
    exampleElevationSheet: "images/keystone_default_elevations.png",
    exampleRender:    "images/keystone_study_render.png",
};

// Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ HELPERS Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬
const scrollTo = (id) => {
    if (id === 'generator') { document.dispatchEvent(new CustomEvent('keystone:open-studio')); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};
const BRAND_DISPLAY_NAME = 'Keystone AI';
const BRAND_NAME = 'Keystone AI Studio';
const BRAND_TAGLINE = 'Home design, made understandable';
const CONTACT_EMAIL = 'aikeystone559@gmail.com';
const LEGAL_UPDATED_AT = 'March 14, 2026';
const STUDIO_UNLOCK_KEY = 'keystone_unlock';
const STUDIO_SESSION_KEY = 'keystone_studio_session';
const createEmptyRenderState = () => ({
    status: 'idle',
    image: null,
    imageClean: null,
    surveyData: null,
    activeRefinement: null,
    errorMsg: '',
});
const normalizeRenderState = (state) => {
    const base = { ...createEmptyRenderState(), ...(state || {}) };
    if (!base.image) {
        return {
            ...createEmptyRenderState(),
            surveyData: base.surveyData || null,
        };
    }
    return {
        ...base,
        status: base.status && base.status !== 'loading' && base.status !== 'survey' ? base.status : 'ready',
    };
};
const getStoredJson = (key) => {
    if (typeof window === 'undefined') return null;
    try {
        return JSON.parse(window.localStorage.getItem(key) || 'null');
    } catch {
        return null;
    }
};
const getInitialStudioSession = () => {
    const stored = getStoredJson(STUDIO_SESSION_KEY);
    if (!stored || typeof stored !== 'object') return null;
    if (stored.version !== 1) return null;
    return stored;
};
const getCurrentPath = () => {
    const raw = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
    return raw === '/index.html' ? '/' : raw;
};
const homeSectionHref = (id) => id === 'hero' ? '/' : `/#${id}`;
const SmartImage = ({ eager = false, ...props }) => (
    <img
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        {...props}
    />
);
const BrandLockup = ({
    href = '/',
    reverse = false,
    compact = false,
    markOnly = false,
    className = '',
    onClick,
}) => {
    const textColor = reverse ? 'text-white' : '';
    const subtitleColor = reverse ? 'rgba(244,239,230,0.56)' : 'rgba(9,9,9,0.42)';
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
                        className="mono text-[8px] uppercase tracking-[0.22em] mt-1"
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
const usePageTitle = (title) => {
    useEffect(() => {
        if (title) document.title = title;
    }, [title]);
};
const CloseIcon = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12"/>
    </svg>
);
const CheckIcon = ({ className = 'w-3 h-3' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 13l4 4L19 7"/>
    </svg>
);



const ClickSparkGlobal = ({
    sparkColor = '#fd9608',
    sparkSize = 16,
    sparkRadius = 34,
    sparkCount = 14,
    duration = 900,
}) => {
    const layerRef = useRef(null);

    useEffect(() => {
        const layer = layerRef.current;
        if (!layer) return undefined;

        const spawn = (event) => {
            if (event.target.closest('[data-no-clickspark="true"]')) return;
            const rect = layer.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            for (let i = 0; i < sparkCount; i += 1) {
                const spark = document.createElement('span');
                const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.28;
                const radius = sparkRadius * (0.72 + Math.random() * 0.5);
                const tx = Math.cos(angle) * radius;
                const ty = Math.sin(angle) * radius;
                spark.className = 'click-spark';
                spark.style.left = `${x}px`;
                spark.style.top = `${y}px`;
                spark.style.width = `${sparkSize}px`;
                spark.style.height = `${Math.max(4, sparkSize * 0.2)}px`;
                spark.style.background = `linear-gradient(90deg, rgba(255,255,255,0.95), ${sparkColor})`;
                spark.style.setProperty('--spark-x', `${tx}px`);
                spark.style.setProperty('--spark-y', `${ty}px`);
                spark.style.setProperty('--spark-rotate', `${(angle * 180 / Math.PI).toFixed(2)}deg`);
                spark.style.animationDuration = `${duration}ms`;
                layer.appendChild(spark);
                window.setTimeout(() => spark.remove(), duration + 80);
            }
            const core = document.createElement('span');
            core.className = 'click-spark-core';
            core.style.left = `${x}px`;
            core.style.top = `${y}px`;
            core.style.background = sparkColor;
            core.style.animationDuration = `${Math.max(520, duration * 0.92)}ms`;
            layer.appendChild(core);
            window.setTimeout(() => core.remove(), duration + 60);
        };

        window.addEventListener('pointerdown', spawn, { passive: true });
        return () => window.removeEventListener('pointerdown', spawn);
    }, [sparkColor, sparkCount, sparkRadius, sparkSize, duration]);

    return <div ref={layerRef} className="click-spark-layer" aria-hidden="true"/>;
};

const DotGridHero = ({
    dotSize = 3.1,
    gap = 28,
    baseColor = '249, 123, 6',
    activeColor = '255, 106, 55',
    proximity = 150,
}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const ctx = canvas.getContext('2d');
        if (!ctx) return undefined;

        let raf = 0;
        let width = 0;
        let height = 0;
        const pointer = { x: 0, y: 0, active: false };

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;
            width = parent.clientWidth;
            height = parent.clientHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.max(1, Math.round(width * dpr));
            canvas.height = Math.max(1, Math.round(height * dpr));
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const render = (time) => {
            ctx.clearRect(0, 0, width, height);
            const offsetX = Math.sin(time * 0.00016) * 10;
            const offsetY = Math.cos(time * 0.00012) * 6;
            for (let y = gap * 0.5; y < height + gap; y += gap) {
                for (let x = gap * 0.5; x < width + gap; x += gap) {
                    const px = x + offsetX * ((y / Math.max(height, 1)) - 0.5);
                    const py = y + offsetY * ((x / Math.max(width, 1)) - 0.5);
                    let intensity = 0;
                    if (pointer.active) {
                        const dist = Math.hypot(pointer.x - px, pointer.y - py);
                        intensity = Math.max(0, 1 - dist / proximity);
                    }
                    const pulse = 0.22 + (Math.sin((x + y) * 0.02 + time * 0.0014) + 1) * 0.14;
                    const radius = dotSize + intensity * 2.7 + pulse;
                    const alpha = 0.16 + pulse * 0.4 + intensity * 0.38;
                    const color = intensity > 0.04 ? activeColor : baseColor;
                    ctx.beginPath();
                    ctx.arc(px, py, radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${color}, ${Math.min(0.92, alpha)})`;
                    ctx.shadowBlur = intensity > 0.08 ? 18 : 0;
                    ctx.shadowColor = `rgba(255, 106, 55, ${Math.min(0.45, intensity * 0.55)})`;
                    ctx.fill();
                }
            }
            ctx.shadowBlur = 0;
            raf = window.requestAnimationFrame(render);
        };

        const onMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            const nextX = event.clientX - rect.left;
            const nextY = event.clientY - rect.top;
            pointer.active = nextX >= 0 && nextX <= rect.width && nextY >= 0 && nextY <= rect.height;
            pointer.x = nextX;
            pointer.y = nextY;
        };
        const onLeave = () => { pointer.active = false; };

        resize();
        raf = window.requestAnimationFrame(render);
        window.addEventListener('resize', resize);
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerleave', onLeave);

        return () => {
            window.cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerleave', onLeave);
        };
    }, [activeColor, baseColor, dotSize, gap, proximity]);

    return (
        <div className="hero-dot-grid" aria-hidden="true">
            <canvas ref={canvasRef} className="hero-dot-grid-canvas"/>
            <div className="hero-dot-grid-vignette"/>
        </div>
    );
};

const GradualBlur = ({
    target = 'parent',
    position = 'bottom',
    height = '7rem',
    strength = 2,
    divCount = 5,
    curve = 'bezier',
    exponential = true,
    opacity = 1,
    zIndex = 12,
    className = '',
}) => {
    const curveFunctions = {
        linear: (p) => p,
        bezier: (p) => p * p * (3 - 2 * p),
        'ease-in': (p) => p * p,
        'ease-out': (p) => 1 - Math.pow(1 - p, 2),
        'ease-in-out': (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
    };
    const directionMap = { top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right' };
    const divs = useMemo(() => {
        const items = [];
        const increment = 100 / divCount;
        const curveFunc = curveFunctions[curve] || curveFunctions.linear;
        for (let i = 1; i <= divCount; i += 1) {
            let progress = curveFunc(i / divCount);
            const blurValue = exponential
                ? Math.pow(2, progress * 4) * 0.0625 * strength
                : 0.0625 * (progress * divCount + 1) * strength;
            const p1 = Math.round((increment * i - increment) * 10) / 10;
            const p2 = Math.round(increment * i * 10) / 10;
            const p3 = Math.round((increment * i + increment) * 10) / 10;
            const p4 = Math.round((increment * i + increment * 2) * 10) / 10;
            let gradient = `transparent ${p1}%, black ${p2}%`;
            if (p3 <= 100) gradient += `, black ${p3}%`;
            if (p4 <= 100) gradient += `, transparent ${p4}%`;
            items.push(
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        maskImage: `linear-gradient(${directionMap[position] || 'to bottom'}, ${gradient})`,
                        WebkitMaskImage: `linear-gradient(${directionMap[position] || 'to bottom'}, ${gradient})`,
                        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
                        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
                        opacity,
                    }}
                />
            );
        }
        return items;
    }, [curve, divCount, exponential, opacity, position, strength]);

    const style = {
        position: target === 'page' ? 'fixed' : 'absolute',
        left: 0,
        right: 0,
        height,
        pointerEvents: 'none',
        zIndex,
    };
    style[position] = 0;

    return (
        <div className={`gradual-blur ${className}`} style={style} aria-hidden="true">
            <div className="gradual-blur-inner" style={{ position: 'relative', width: '100%', height: '100%' }}>
                {divs}
            </div>
        </div>
    );
};

const LaserCursor = () => {
    const cursorRef = useRef(null);
    const beamRef = useRef(null);
    const frameRef = useRef(null);
    const stateRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, visible: false });
    const [enabled, setEnabled] = useState(false);
    const [label, setLabel] = useState('');

    useEffect(() => {
        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const sync = () => setEnabled(finePointer.matches && !reducedMotion.matches);
        sync();
        finePointer.addEventListener?.('change', sync);
        reducedMotion.addEventListener?.('change', sync);
        return () => {
            finePointer.removeEventListener?.('change', sync);
            reducedMotion.removeEventListener?.('change', sync);
        };
    }, []);

    useEffect(() => {
        document.body.classList.toggle('has-laser-cursor', enabled);
        return () => document.body.classList.remove('has-laser-cursor');
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return undefined;
        const cursor = cursorRef.current;
        const beam = beamRef.current;
        if (!cursor || !beam) return undefined;

        const render = () => {
            const state = stateRef.current;
            state.x += (state.tx - state.x) * 0.28;
            state.y += (state.ty - state.y) * 0.28;
            cursor.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
            const dx = state.tx - state.x;
            const dy = state.ty - state.y;
            const speed = Math.hypot(dx, dy);
            const angle = Math.atan2(dy || 0.0001, dx || 0.0001) * 180 / Math.PI;
            const trailLength = Math.max(16, Math.min(54, speed * 1.45 + 14));
            const trailOpacity = Math.max(0.12, Math.min(0.62, speed / 24));
            beam.style.width = `${trailLength}px`;
            beam.style.opacity = `${trailOpacity}`;
            beam.style.transform = `translate(-100%, -50%) rotate(${angle}deg)`;
            frameRef.current = requestAnimationFrame(render);
        };

        const setHoverLabel = (target) => {
            const next = target?.getAttribute('data-cursor-text') || '';
            setLabel((prev) => (prev === next ? prev : next));
        };

        const handleMove = (event) => {
            stateRef.current.tx = event.clientX;
            stateRef.current.ty = event.clientY;
            stateRef.current.visible = true;
            cursor.classList.add('is-visible');
            setHoverLabel(event.target.closest('[data-cursor-text], .cursor-target'));
        };

        const handleLeave = () => {
            stateRef.current.visible = false;
            cursor.classList.remove('is-visible');
            setLabel('');
        };
        const handleMouseOut = (event) => {
            if (!event.relatedTarget) handleLeave();
        };

        frameRef.current = requestAnimationFrame(render);
        window.addEventListener('mousemove', handleMove, { passive: true });
        window.addEventListener('mouseout', handleMouseOut);
        window.addEventListener('blur', handleLeave);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('blur', handleLeave);
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <div ref={cursorRef} className={`laser-cursor${label ? ' has-label' : ''}`} aria-hidden="true">
            <div ref={beamRef} className="laser-cursor-trail"/>
            <div className="laser-cursor-ring"/>
            <div className="laser-cursor-core"/>
            <div className="laser-cursor-label">{label || 'Explore'}</div>
        </div>
    );
};

const SectionRail = () => {
    const [activeId, setActiveId] = useState('hero');
    const items = [
        { id: 'hero', label: 'Intro' },
        { id: 'proof', label: 'Proof' },
        { id: 'work', label: 'Work' },
        { id: 'generator', label: 'Live' },
        { id: 'services', label: 'Services' },
        { id: 'pricing', label: 'Pricing' },
        { id: 'studio', label: 'Studio' },
    ];

    useEffect(() => {
        const TRIGGER = Math.round(window.innerHeight * 0.30);
        const update = () => {
            let current = items[0].id;
            for (const { id } of items) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= TRIGGER) current = id;
            }
            setActiveId(current);
        };
        window.addEventListener('scroll', update, { passive: true });
        update();
        return () => window.removeEventListener('scroll', update);
    }, []);

    return (
        <aside className="section-rail" aria-label="Page sections">
            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    data-cursor-text={`Go ${item.label}`}
                    className={`section-rail-link${activeId === item.id ? ' is-active' : ''}`}
                >
                    <span className="section-rail-dot"/>
                    <span>{item.label}</span>
                </button>
            ))}
        </aside>
    );
};

// â"€â"€â"€ SCROLL PROGRESS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// (handled by vanilla JS in index.html â€" no React overhead needed)

// â"€â"€â"€ REVEAL WRAPPER â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// Elegant scroll-triggered entrance. Use for headings, standalone cards, etc.
const Reveal = ({ children, delay = 0, y = 28, className = '', style = {} }) => (
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

// SpotlightCard â€" mouse-tracking radial spotlight
const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(255,106,55,0.15)', style = {} }) => {
    const ref = useRef(null);
    const handleMove = (e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        ref.current.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
        ref.current.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
        ref.current.style.setProperty('--spotlight-color', spotlightColor);
    };
    return (
        <div ref={ref} onMouseMove={handleMove} className={`spotlight-card ${className}`} style={style}>
            {children}
        </div>
    );
};

// TiltCard â€" 3D perspective tilt on hover
const TiltCard = ({ children, className = '', style = {}, maxTilt = 7 }) => {
    const ref = useRef(null);
    const reset = () => { if (ref.current) ref.current.style.transform = 'perspective(860px) rotateX(0deg) rotateY(0deg) scale(1)'; };
    const tilt = (e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -maxTilt;
        const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * maxTilt;
        ref.current.style.transform = `perspective(860px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.015)`;
    };
    return (
        <div ref={ref} className={`tilt-wrap ${className}`} style={{ ...style }}
            onMouseMove={tilt} onMouseLeave={reset}>
            {children}
        </div>
    );
};

// BlurText â€" scroll-triggered word-by-word blur reveal
const BlurText = ({ text = '', delay = 65, className = '', direction = 'bottom', tag: Tag = 'span', style = {} }) => {
    const [inView, setInView] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.05 });
        obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    const words = text.split(' ');
    const yFrom = direction === 'bottom' ? 28 : -28;
    return (
        <Tag ref={ref} className={`blur-text-wrap ${className}`} style={style}>
            {words.map((word, i) => (
                <motion.span key={i} className="blur-word"
                    initial={{ filter: 'blur(10px)', opacity: 0, y: yFrom }}
                    animate={inView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.58, delay: i * (delay / 1000), ease: [0.22, 1, 0.36, 1] }}>
                    {word}
                </motion.span>
            ))}
        </Tag>
    );
};

// GradientText â€" animated orange gradient text wrapper
const GradientText = ({ children, className = '' }) => (
    <span className={`gradient-text-anim ${className}`}>{children}</span>
);

// StarBorderBtn â€" CTA button with animated rotating glow ring
const StarBorderBtn = ({ children, onClick, className = '' }) => (
    <div className={`star-border-wrap ${className}`}>
        <button type="button" onClick={onClick} className="cta-hero cta-glow cta-live" style={{ position: 'relative', zIndex: 1 }}>
            {children}
        </button>
    </div>
);

// OrbBackground â€" CSS animated floating orb blobs
const OrbBackground = () => (
    <div className="orb-bg" aria-hidden="true">
        <div className="orb orb-1"/>
        <div className="orb orb-2"/>
        <div className="orb orb-3"/>
    </div>
);

// FloatingParticles â€" canvas-based drifting particle field
const FloatingParticles = ({ count = 55, color = '255,106,55', className = '' }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let raf;
        let pts = [];
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        const init = () => {
            pts = Array.from({ length: count }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2.2 + 0.4,
                vx: (Math.random() - 0.5) * 0.22,
                vy: (Math.random() - 0.5) * 0.22,
                a: Math.random() * 0.45 + 0.08,
            }));
        };
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pts.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, ${p.a})`;
                ctx.fill();
            });
            raf = requestAnimationFrame(draw);
        };
        resize(); init(); draw();
        const onResize = () => { resize(); init(); };
        window.addEventListener('resize', onResize);
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
    }, [count, color]);
    return <canvas ref={canvasRef} className={`particle-canvas ${className}`}/>;
};

// CountUp â€" scroll-triggered animated number counter
const CountUp = ({ to, duration = 1600, suffix = '', className = '' }) => {
    const [n, setN] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true;
                let t0 = null;
                const step = (ts) => {
                    if (!t0) t0 = ts;
                    const p = Math.min((ts - t0) / duration, 1);
                    const ease = 1 - Math.pow(1 - p, 3);
                    setN(Math.floor(ease * to));
                    if (p < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
                obs.disconnect();
            }
        }, { threshold: 0.3 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [to, duration]);
    return <span ref={ref} className={className}>{n}{suffix}</span>;
};

// â"€â"€â"€ SPLASH CURSOR (WebGL fluid simulation) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const SplashCursor = ({
    SIM_RESOLUTION = 32,
    DYE_RESOLUTION = 1440,
    CAPTURE_RESOLUTION = 512,
    DENSITY_DISSIPATION = 8,
    VELOCITY_DISSIPATION = 0.6,
    PRESSURE = 0.1,
    PRESSURE_ITERATIONS = 20,
    CURL = 2,
    SPLAT_RADIUS = 0.12,
    SPLAT_FORCE = 3000,
    SHADING = true,
    COLOR_UPDATE_SPEED = 8,
    BACK_COLOR = { r: 0, g: 0, b: 0 },
    TRANSPARENT = true,
}) => {
    // WebGL fluid sim disabled â€" causes GL_INVALID_OPERATION feedback-loop errors on some GPUs
    return null;
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let isActive = true;
        function pointerPrototype() {
            this.id = -1; this.texcoordX = 0; this.texcoordY = 0;
            this.prevTexcoordX = 0; this.prevTexcoordY = 0;
            this.deltaX = 0; this.deltaY = 0;
            this.down = false; this.moved = false; this.color = [0,0,0];
        }
        let config = { SIM_RESOLUTION, DYE_RESOLUTION, CAPTURE_RESOLUTION, DENSITY_DISSIPATION, VELOCITY_DISSIPATION, PRESSURE, PRESSURE_ITERATIONS, CURL, SPLAT_RADIUS, SPLAT_FORCE, SHADING, COLOR_UPDATE_SPEED, PAUSED: false, BACK_COLOR, TRANSPARENT };
        let pointers = [new pointerPrototype()];
        const { gl, ext } = getWebGLContext(canvas);
        if (!ext.supportLinearFiltering) { config.DYE_RESOLUTION = 256; config.SHADING = false; }
        function getWebGLContext(canvas) {
            const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
            let gl = canvas.getContext('webgl2', params);
            const isWebGL2 = !!gl;
            if (!isWebGL2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
            let halfFloat, supportLinearFiltering;
            if (isWebGL2) { gl.getExtension('EXT_color_buffer_float'); supportLinearFiltering = gl.getExtension('OES_texture_float_linear'); }
            else { halfFloat = gl.getExtension('OES_texture_half_float'); supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear'); }
            gl.clearColor(0,0,0,1);
            const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat && halfFloat.HALF_FLOAT_OES;
            let formatRGBA, formatRG, formatR;
            if (isWebGL2) {
                formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
                formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
                formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
            } else {
                formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
                formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
                formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
            }
            return { gl, ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering } };
        }
        function getSupportedFormat(gl, internalFormat, format, type) {
            if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
                switch (internalFormat) {
                    case gl.R16F: return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
                    case gl.RG16F: return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
                    default: return null;
                }
            }
            return { internalFormat, format };
        }
        function supportRenderTextureFormat(gl, internalFormat, format, type) {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
        }
        class Material {
            constructor(vs, fsSrc) { this.vertexShader=vs; this.fragmentShaderSource=fsSrc; this.programs=[]; this.activeProgram=null; this.uniforms=[]; }
            setKeywords(keywords) {
                let hash=0; for (let i=0;i<keywords.length;i++) hash+=hashCode(keywords[i]);
                let program=this.programs[hash];
                if (program==null) { program=createProgram(this.vertexShader,compileShader(gl.FRAGMENT_SHADER,this.fragmentShaderSource,keywords)); this.programs[hash]=program; }
                if (program===this.activeProgram) return;
                this.uniforms=getUniforms(program); this.activeProgram=program;
            }
            bind() { gl.useProgram(this.activeProgram); }
        }
        class Program {
            constructor(vs,fs) { this.uniforms={}; this.program=createProgram(vs,fs); this.uniforms=getUniforms(this.program); }
            bind() { gl.useProgram(this.program); }
        }
        function createProgram(vs,fs) { let p=gl.createProgram(); gl.attachShader(p,vs); gl.attachShader(p,fs); gl.linkProgram(p); if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.error("Link err:", gl.getProgramInfoLog(p));} return p; }
        function getUniforms(program) { let u=[],n=gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS); for(let i=0;i<n;i++){let nm=gl.getActiveUniform(program,i).name; u[nm]=gl.getUniformLocation(program,nm);} return u; }
        function compileShader(type,source,keywords) {
            if(keywords){let s=''; keywords.forEach(k=>{s+='#define '+k+'\n';}); source=s+source;}
            const shader=gl.createShader(type); gl.shaderSource(shader,source); gl.compileShader(shader); 
            if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){console.error("Compile err:", gl.getShaderInfoLog(shader));}
            return shader;
        }
        const baseVS=compileShader(gl.VERTEX_SHADER,`precision highp float;attribute vec2 aPosition;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform vec2 texelSize;void main(){vUv=aPosition*0.5+0.5;vL=vUv-vec2(texelSize.x,0.0);vR=vUv+vec2(texelSize.x,0.0);vT=vUv+vec2(0.0,texelSize.y);vB=vUv-vec2(0.0,texelSize.y);gl_Position=vec4(aPosition,0.0,1.0);}`);
        const copyShader=compileShader(gl.FRAGMENT_SHADER,`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;void main(){gl_FragColor=texture2D(uTexture,vUv);}`);
        const clearShader=compileShader(gl.FRAGMENT_SHADER,`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;uniform float value;void main(){gl_FragColor=value*texture2D(uTexture,vUv);}`);
        const displayShaderSrc=`precision highp float;precision highp sampler2D;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform sampler2D uTexture;uniform vec2 texelSize;void main(){vec3 c=texture2D(uTexture,vUv).rgb;\n#ifdef SHADING\nvec3 lc=texture2D(uTexture,vL).rgb;vec3 rc=texture2D(uTexture,vR).rgb;vec3 tc=texture2D(uTexture,vT).rgb;vec3 bc=texture2D(uTexture,vB).rgb;float dx=length(rc)-length(lc);float dy=length(tc)-length(bc);vec3 n=normalize(vec3(dx,dy,length(texelSize)));float diffuse=clamp(dot(n,vec3(0,0,1))+0.7,0.7,1.0);c*=diffuse;\n#endif\nfloat a=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c,a);}`;
        const splatShader=compileShader(gl.FRAGMENT_SHADER,`precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uTarget;uniform float aspectRatio;uniform vec3 color;uniform vec2 point;uniform float radius;void main(){vec2 p=vUv-point.xy;p.x*=aspectRatio;vec3 splat=exp(-dot(p,p)/radius)*color;gl_FragColor=vec4(texture2D(uTarget,vUv).xyz+splat,1.0);}`);
        const advectionShader=compileShader(gl.FRAGMENT_SHADER,`precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uVelocity;uniform sampler2D uSource;uniform vec2 texelSize;uniform vec2 dyeTexelSize;uniform float dt;uniform float dissipation;vec4 bilerp(sampler2D sam,vec2 uv,vec2 tsize){vec2 st=uv/tsize-0.5;vec2 iuv=floor(st);vec2 fuv=fract(st);vec4 a=texture2D(sam,(iuv+vec2(0.5,0.5))*tsize);vec4 b=texture2D(sam,(iuv+vec2(1.5,0.5))*tsize);vec4 c=texture2D(sam,(iuv+vec2(0.5,1.5))*tsize);vec4 d=texture2D(sam,(iuv+vec2(1.5,1.5))*tsize);return mix(mix(a,b,fuv.x),mix(c,d,fuv.x),fuv.y);}void main(){\n#ifdef MANUAL_FILTERING\nvec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;vec4 result=bilerp(uSource,coord,dyeTexelSize);\n#else\nvec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;vec4 result=texture2D(uSource,coord);\n#endif\ngl_FragColor=result/(1.0+dissipation*dt);}`, ext.supportLinearFiltering?null:['MANUAL_FILTERING']);
        const divergenceShader=compileShader(gl.FRAGMENT_SHADER,`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).x;float R=texture2D(uVelocity,vR).x;float T=texture2D(uVelocity,vT).y;float B=texture2D(uVelocity,vB).y;vec2 C=texture2D(uVelocity,vUv).xy;if(vL.x<0.0)L=-C.x;if(vR.x>1.0)R=-C.x;if(vT.y>1.0)T=-C.y;if(vB.y<0.0)B=-C.y;gl_FragColor=vec4(0.5*(R-L+T-B),0.0,0.0,1.0);}`);
        const curlShader=compileShader(gl.FRAGMENT_SHADER,`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uVelocity;void main(){gl_FragColor=vec4(0.5*(texture2D(uVelocity,vR).y-texture2D(uVelocity,vL).y-texture2D(uVelocity,vT).x+texture2D(uVelocity,vB).x),0.0,0.0,1.0);}`);
        const vorticityShader=compileShader(gl.FRAGMENT_SHADER,`precision highp float;precision highp sampler2D;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform sampler2D uVelocity;uniform sampler2D uCurl;uniform float curl;uniform float dt;void main(){float L=texture2D(uCurl,vL).x;float R=texture2D(uCurl,vR).x;float T=texture2D(uCurl,vT).x;float B=texture2D(uCurl,vB).x;float C=texture2D(uCurl,vUv).x;vec2 force=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L));force/=length(force)+0.0001;force*=curl*C;force.y*=-1.0;vec2 velocity=texture2D(uVelocity,vUv).xy+force*dt;velocity=min(max(velocity,-1000.0),1000.0);gl_FragColor=vec4(velocity,0.0,1.0);}`);
        const pressureShader=compileShader(gl.FRAGMENT_SHADER,`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uPressure;uniform sampler2D uDivergence;void main(){gl_FragColor=vec4(0.25*(texture2D(uPressure,vL).x+texture2D(uPressure,vR).x+texture2D(uPressure,vB).x+texture2D(uPressure,vT).x-texture2D(uDivergence,vUv).x),0.0,0.0,1.0);}`);
        const gradSubShader=compileShader(gl.FRAGMENT_SHADER,`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uPressure;uniform sampler2D uVelocity;void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;vec2 velocity=texture2D(uVelocity,vUv).xy;velocity.xy-=vec2(R-L,T-B);gl_FragColor=vec4(velocity,0.0,1.0);}`);
        const blit = (() => {
            gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer()); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),gl.STATIC_DRAW);
            gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(0);
            return (target,clear=false)=>{
                if(target==null){gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight);gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
                else{gl.viewport(0,0,target.width,target.height);gl.bindFramebuffer(gl.FRAMEBUFFER,target.fbo);}
                if(clear){gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);}
                gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
            };
        })();
        function createFBO(w,h,internalFormat,format,type,param){
            gl.activeTexture(gl.TEXTURE0); let tex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tex);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,param); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,param);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D,0,internalFormat,w,h,0,format,type,null);
            let fbo=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
            gl.viewport(0,0,w,h); gl.clear(gl.COLOR_BUFFER_BIT);
            return {texture:tex,fbo,width:w,height:h,texelSizeX:1/w,texelSizeY:1/h,attach(id){gl.activeTexture(gl.TEXTURE0+id);gl.bindTexture(gl.TEXTURE_2D,tex);return id;}};
        }
        function createDoubleFBO(w,h,internalFormat,format,type,param){
            let fbo1=createFBO(w,h,internalFormat,format,type,param),fbo2=createFBO(w,h,internalFormat,format,type,param);
            return {width:w,height:h,texelSizeX:fbo1.texelSizeX,texelSizeY:fbo1.texelSizeY,get read(){return fbo1;},set read(v){fbo1=v;},get write(){return fbo2;},set write(v){fbo2=v;},swap(){let t=fbo1;fbo1=fbo2;fbo2=t;}};
        }
        function resizeFBO(t,w,h,internalFormat,format,type,param){let n=createFBO(w,h,internalFormat,format,type,param);copyP.bind();gl.uniform1i(copyP.uniforms.uTexture,t.attach(0));blit(n);return n;}
        function resizeDoubleFBO(t,w,h,internalFormat,format,type,param){if(t.width===w&&t.height===h)return t;t.read=resizeFBO(t.read,w,h,internalFormat,format,type,param);t.write=createFBO(w,h,internalFormat,format,type,param);t.width=w;t.height=h;t.texelSizeX=1/w;t.texelSizeY=1/h;return t;}
        const copyP=new Program(baseVS,copyShader),clearP=new Program(baseVS,clearShader),splatP=new Program(baseVS,splatShader);
        const advectionP=new Program(baseVS,advectionShader),divergenceP=new Program(baseVS,divergenceShader),curlP=new Program(baseVS,curlShader);
        const vorticityP=new Program(baseVS,vorticityShader),pressureP=new Program(baseVS,pressureShader),gradSubP=new Program(baseVS,gradSubShader);
        const displayMat=new Material(baseVS,displayShaderSrc);
        let dye,velocity,divergence,curl,pressure;
        function initFBOs(){
            let simRes=getRes(config.SIM_RESOLUTION),dyeRes=getRes(config.DYE_RESOLUTION);
            const texType=ext.halfFloatTexType,rgba=ext.formatRGBA,rg=ext.formatRG,r=ext.formatR,flt=ext.supportLinearFiltering?gl.LINEAR:gl.NEAREST;
            gl.disable(gl.BLEND);
            if(!dye) dye=createDoubleFBO(dyeRes.width,dyeRes.height,rgba.internalFormat,rgba.format,texType,flt);
            else dye=resizeDoubleFBO(dye,dyeRes.width,dyeRes.height,rgba.internalFormat,rgba.format,texType,flt);
            if(!velocity) velocity=createDoubleFBO(simRes.width,simRes.height,rg.internalFormat,rg.format,texType,flt);
            else velocity=resizeDoubleFBO(velocity,simRes.width,simRes.height,rg.internalFormat,rg.format,texType,flt);
            divergence=createFBO(simRes.width,simRes.height,r.internalFormat,r.format,texType,gl.NEAREST);
            curl=createFBO(simRes.width,simRes.height,r.internalFormat,r.format,texType,gl.NEAREST);
            pressure=createDoubleFBO(simRes.width,simRes.height,r.internalFormat,r.format,texType,gl.NEAREST);
        }
        function getRes(res){let ar=gl.drawingBufferWidth/gl.drawingBufferHeight;if(ar<1)ar=1/ar;const mn=Math.round(res),mx=Math.round(res*ar);return gl.drawingBufferWidth>gl.drawingBufferHeight?{width:mx,height:mn}:{width:mn,height:mx};}
        function updateKeys(){let k=[];if(config.SHADING)k.push('SHADING');displayMat.setKeywords(k);}
        function scaleByDPR(x){return Math.floor(x*(window.devicePixelRatio||1));}
        function hashCode(s){let h=0;for(let i=0;i<s.length;i++){h=(h<<5)-h+s.charCodeAt(i);h|=0;}return h;}
        updateKeys(); initFBOs();
        let lastTime=Date.now(),colorTimer=0;
        function frame(){
            if(!isActive)return;
            const now=Date.now();let dt=Math.min((now-lastTime)/1000,0.016666);lastTime=now;
            if(resizeCanvas())initFBOs();
            colorTimer+=dt*config.COLOR_UPDATE_SPEED;
            if(colorTimer>=1){colorTimer=((colorTimer%1)+1)%1;pointers.forEach(p=>{p.color=genColor();});}
            pointers.forEach(p=>{if(p.moved){p.moved=false;splatPtr(p);}});
            step(dt); renderFluid(null);
            animationFrameId.current=requestAnimationFrame(frame);
        }
        function resizeCanvas(){let w=scaleByDPR(canvas.clientWidth),h=scaleByDPR(canvas.clientHeight);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;return true;}return false;}
        function step(dt){
            gl.disable(gl.BLEND);
            curlP.bind();gl.uniform2f(curlP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(curlP.uniforms.uVelocity,velocity.read.attach(0));blit(curl);
            vorticityP.bind();gl.uniform2f(vorticityP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(vorticityP.uniforms.uVelocity,velocity.read.attach(0));gl.uniform1i(vorticityP.uniforms.uCurl,curl.attach(1));gl.uniform1f(vorticityP.uniforms.curl,config.CURL);gl.uniform1f(vorticityP.uniforms.dt,dt);blit(velocity.write);velocity.swap();
            divergenceP.bind();gl.uniform2f(divergenceP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(divergenceP.uniforms.uVelocity,velocity.read.attach(0));blit(divergence);
            clearP.bind();gl.uniform1i(clearP.uniforms.uTexture,pressure.read.attach(0));gl.uniform1f(clearP.uniforms.value,config.PRESSURE);blit(pressure.write);pressure.swap();
            pressureP.bind();gl.uniform2f(pressureP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(pressureP.uniforms.uDivergence,divergence.attach(0));
            for(let i=0;i<config.PRESSURE_ITERATIONS;i++){gl.uniform1i(pressureP.uniforms.uPressure,pressure.read.attach(1));blit(pressure.write);pressure.swap();}
            gradSubP.bind();gl.uniform2f(gradSubP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);gl.uniform1i(gradSubP.uniforms.uPressure,pressure.read.attach(0));gl.uniform1i(gradSubP.uniforms.uVelocity,velocity.read.attach(1));blit(velocity.write);velocity.swap();
            advectionP.bind();gl.uniform2f(advectionP.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);if(!ext.supportLinearFiltering)gl.uniform2f(advectionP.uniforms.dyeTexelSize,velocity.texelSizeX,velocity.texelSizeY);let vid=velocity.read.attach(0);gl.uniform1i(advectionP.uniforms.uVelocity,vid);gl.uniform1i(advectionP.uniforms.uSource,vid);gl.uniform1f(advectionP.uniforms.dt,dt);gl.uniform1f(advectionP.uniforms.dissipation,config.VELOCITY_DISSIPATION);blit(velocity.write);velocity.swap();
            if(!ext.supportLinearFiltering)gl.uniform2f(advectionP.uniforms.dyeTexelSize,dye.texelSizeX,dye.texelSizeY);gl.uniform1i(advectionP.uniforms.uVelocity,velocity.read.attach(0));gl.uniform1i(advectionP.uniforms.uSource,dye.read.attach(1));gl.uniform1f(advectionP.uniforms.dissipation,config.DENSITY_DISSIPATION);blit(dye.write);dye.swap();
        }
        function renderFluid(target){gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.enable(gl.BLEND);displayMat.bind();if(config.SHADING)gl.uniform2f(displayMat.uniforms.texelSize,1/(target==null?gl.drawingBufferWidth:target.width),1/(target==null?gl.drawingBufferHeight:target.height));gl.uniform1i(displayMat.uniforms.uTexture,dye.read.attach(0));blit(target);}
        function splatPtr(p){let dx=p.deltaX*config.SPLAT_FORCE,dy=p.deltaY*config.SPLAT_FORCE;splat(p.texcoordX,p.texcoordY,dx,dy,p.color);}
        function clickSplat(p){const c=genColor();c.r*=10;c.g*=10;c.b*=10;splat(p.texcoordX,p.texcoordY,10*(Math.random()-0.5),30*(Math.random()-0.5),c);}
        function splat(x,y,dx,dy,color){
            splatP.bind();gl.uniform1i(splatP.uniforms.uTarget,velocity.read.attach(0));gl.uniform1f(splatP.uniforms.aspectRatio,canvas.width/canvas.height);gl.uniform2f(splatP.uniforms.point,x,y);gl.uniform3f(splatP.uniforms.color,dx,dy,0);gl.uniform1f(splatP.uniforms.radius,correctRad(config.SPLAT_RADIUS/100));blit(velocity.write);velocity.swap();
            gl.uniform1i(splatP.uniforms.uTarget,dye.read.attach(0));gl.uniform3f(splatP.uniforms.color,color.r,color.g,color.b);blit(dye.write);dye.swap();
        }
        function correctRad(r){let ar=canvas.width/canvas.height;if(ar>1)r*=ar;return r;}
        function genColor(){
            // Orange/amber biased palette
            const hue=0.04+Math.random()*0.08;
            const {r,g,b}=HSVtoRGB(hue,0.85+Math.random()*0.15,1.0);
            return {r:r*0.22,g:g*0.08,b:b*0.02};
        }
        function HSVtoRGB(h,s,v){let r,g,b,i=Math.floor(h*6),f=h*6-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);switch(i%6){case 0:r=v,g=t,b=p;break;case 1:r=q,g=v,b=p;break;case 2:r=p,g=v,b=t;break;case 3:r=p,g=q,b=v;break;case 4:r=t,g=p,b=v;break;case 5:r=v,g=p,b=q;break;}return {r,g,b};}
        function corrDX(d){let ar=canvas.width/canvas.height;if(ar<1)d*=ar;return d;}
        function corrDY(d){let ar=canvas.width/canvas.height;if(ar>1)d/=ar;return d;}
        function downPtr(p,id,px,py){p.id=id;p.down=true;p.moved=false;p.texcoordX=px/canvas.width;p.texcoordY=1-(py/canvas.height);p.prevTexcoordX=p.texcoordX;p.prevTexcoordY=p.texcoordY;p.deltaX=0;p.deltaY=0;p.color=genColor();}
        function movePtr(p,px,py,color){p.prevTexcoordX=p.texcoordX;p.prevTexcoordY=p.texcoordY;p.texcoordX=px/canvas.width;p.texcoordY=1-(py/canvas.height);p.deltaX=corrDX(p.texcoordX-p.prevTexcoordX);p.deltaY=corrDY(p.texcoordY-p.prevTexcoordY);p.moved=Math.abs(p.deltaX)>0||Math.abs(p.deltaY)>0;p.color=color;}
        let firstMove=false;
        function handleMouseDown(e){let p=pointers[0];let px=scaleByDPR(e.clientX),py=scaleByDPR(e.clientY);downPtr(p,-1,px,py);clickSplat(p);}
        function handleMouseMove(e){let p=pointers[0];let px=scaleByDPR(e.clientX),py=scaleByDPR(e.clientY);if(!firstMove){movePtr(p,px,py,genColor());firstMove=true;}else{movePtr(p,px,py,p.color);}}
        function handleTouchStart(e){const touches=e.targetTouches;let p=pointers[0];for(let i=0;i<touches.length;i++){let px=scaleByDPR(touches[i].clientX),py=scaleByDPR(touches[i].clientY);downPtr(p,touches[i].identifier,px,py);}}
        function handleTouchMove(e){const touches=e.targetTouches;let p=pointers[0];for(let i=0;i<touches.length;i++){let px=scaleByDPR(touches[i].clientX),py=scaleByDPR(touches[i].clientY);movePtr(p,px,py,p.color);}}
        function handleTouchEnd(e){const touches=e.changedTouches;let p=pointers[0];for(let i=0;i<touches.length;i++){p.down=false;}}
        window.addEventListener('mousedown',handleMouseDown);
        window.addEventListener('mousemove',handleMouseMove);
        window.addEventListener('touchstart',handleTouchStart);
        window.addEventListener('touchmove',handleTouchMove,false);
        window.addEventListener('touchend',handleTouchEnd);
        frame();
        return ()=>{
            isActive=false;
            if(animationFrameId.current){cancelAnimationFrame(animationFrameId.current);animationFrameId.current=null;}
            window.removeEventListener('mousedown',handleMouseDown);
            window.removeEventListener('mousemove',handleMouseMove);
            window.removeEventListener('touchstart',handleTouchStart);
            window.removeEventListener('touchmove',handleTouchMove);
            window.removeEventListener('touchend',handleTouchEnd);
        };
    }, []);
    return (
        <div style={{position:'fixed',top:0,left:0,zIndex:50,pointerEvents:'none',width:'100%',height:'100%'}} aria-hidden="true">
            <canvas ref={canvasRef} style={{width:'100%',height:'100%'}}/>
        </div>
    );
};

// â"€â"€â"€ WAVES (Perlin noise animated wave lines) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const Waves = ({
    lineColor = 'rgba(255,106,55,0.35)',
    waveSpeedX = 0.015,
    waveSpeedY = 0.015,
    waveAmpX = 35,
    waveAmpY = 8,
    friction = 0.59,
    tension = 0.025,
    maxCursorMove = 80,
    xGap = 10,
    yGap = 34,
    className = '',
    style = {},
}) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const frameIdRef = useRef(null);
    const linesRef = useRef([]);
    const mouseRef = useRef({ x:-10,y:0,lx:0,ly:0,sx:0,sy:0,v:0,vs:0,a:0,set:false });
    const configRef = useRef({ lineColor,waveSpeedX,waveSpeedY,waveAmpX,waveAmpY,friction,tension,maxCursorMove,xGap,yGap });
    useEffect(()=>{configRef.current={lineColor,waveSpeedX,waveSpeedY,waveAmpX,waveAmpY,friction,tension,maxCursorMove,xGap,yGap};},[lineColor,waveSpeedX,waveSpeedY,waveAmpX,waveAmpY,friction,tension,maxCursorMove,xGap,yGap]);
    useEffect(()=>{
        const canvas=canvasRef.current,container=containerRef.current;
        if(!canvas||!container)return;
        const ctx=canvas.getContext('2d');
        let bounding={width:0,height:0,left:0,top:0};
        // Perlin noise
        const grad3=[{x:1,y:1,z:0},{x:-1,y:1,z:0},{x:1,y:-1,z:0},{x:-1,y:-1,z:0},{x:1,y:0,z:1},{x:-1,y:0,z:1},{x:1,y:0,z:-1},{x:-1,y:0,z:-1},{x:0,y:1,z:1},{x:0,y:-1,z:1},{x:0,y:1,z:-1},{x:0,y:-1,z:-1}];
        const pArr=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
        const perm=new Array(512),gradP=new Array(512);
        const seed=Math.random()*65536|0;
        for(let i=0;i<256;i++){let v=i&1?pArr[i]^(seed&255):pArr[i]^((seed>>8)&255);perm[i]=perm[i+256]=v;gradP[i]=gradP[i+256]=grad3[v%12];}
        function fade(t){return t*t*t*(t*(t*6-15)+10);}
        function lerp(a,b,t){return (1-t)*a+t*b;}
        function perlin2(x,y){let X=Math.floor(x)&255,Y=Math.floor(y)&255;x-=Math.floor(x);y-=Math.floor(y);const n00=gradP[X+perm[Y]];const n01=gradP[X+perm[Y+1]];const n10=gradP[X+1+perm[Y]];const n11=gradP[X+1+perm[Y+1]];const u=fade(x);return lerp(lerp(n00.x*x+n00.y*y,n10.x*(x-1)+n10.y*y,u),lerp(n01.x*x+n01.y*(y-1),n11.x*(x-1)+n11.y*(y-1),u),fade(y));}
        function setSize(){bounding=container.getBoundingClientRect();canvas.width=bounding.width;canvas.height=bounding.height;}
        function setLines(){
            linesRef.current=[];
            const {width,height}=bounding,{xGap,yGap}=configRef.current;
            const oW=width+200,oH=height+30;
            const tL=Math.ceil(oW/xGap),tP=Math.ceil(oH/yGap);
            const xStart=(width-xGap*tL)/2,yStart=(height-yGap*tP)/2;
            for(let i=0;i<=tL;i++){const pts=[];for(let j=0;j<=tP;j++){pts.push({x:xStart+xGap*i,y:yStart+yGap*j,wave:{x:0,y:0},cursor:{x:0,y:0,vx:0,vy:0}});}linesRef.current.push(pts);}
        }
        function movePoints(time){
            const {waveSpeedX,waveSpeedY,waveAmpX,waveAmpY,friction,tension,maxCursorMove}=configRef.current;
            const mouse=mouseRef.current;
            linesRef.current.forEach(pts=>{pts.forEach(p=>{
                const move=perlin2((p.x+time*waveSpeedX)*0.002,(p.y+time*waveSpeedY)*0.0015)*12;
                p.wave.x=Math.cos(move)*waveAmpX;p.wave.y=Math.sin(move)*waveAmpY;
                const dx=p.x-mouse.sx,dy=p.y-mouse.sy,dist=Math.hypot(dx,dy),l=Math.max(175,mouse.vs);
                if(dist<l){const s=1-dist/l;const f=Math.cos(dist*0.001)*s;p.cursor.vx+=Math.cos(mouse.a)*f*l*mouse.vs*0.00065;p.cursor.vy+=Math.sin(mouse.a)*f*l*mouse.vs*0.00065;}
                p.cursor.vx+=(0-p.cursor.x)*tension;p.cursor.vy+=(0-p.cursor.y)*tension;
                p.cursor.vx*=friction;p.cursor.vy*=friction;
                p.cursor.x+=p.cursor.vx*2;p.cursor.y+=p.cursor.vy*2;
                p.cursor.x=Math.min(maxCursorMove,Math.max(-maxCursorMove,p.cursor.x));
                p.cursor.y=Math.min(maxCursorMove,Math.max(-maxCursorMove,p.cursor.y));
            });});
        }
        function moved(point,withCursor=true){const x=point.x+point.wave.x+(withCursor?point.cursor.x:0);const y=point.y+point.wave.y+(withCursor?point.cursor.y:0);return{x:Math.round(x*10)/10,y:Math.round(y*10)/10};}
        function drawLines(){
            const {width,height}=bounding;ctx.clearRect(0,0,width,height);ctx.beginPath();ctx.strokeStyle=configRef.current.lineColor;ctx.lineWidth=0.8;
            linesRef.current.forEach(points=>{
                let p1=moved(points[0],false);ctx.moveTo(p1.x,p1.y);
                points.forEach((p,idx)=>{const isLast=idx===points.length-1;p1=moved(p,!isLast);const p2=moved(points[idx+1]||points[points.length-1],!isLast);ctx.lineTo(p1.x,p1.y);if(isLast)ctx.moveTo(p2.x,p2.y);});
            });
            ctx.stroke();
        }
        function tick(t){
            const mouse=mouseRef.current;
            mouse.sx+=(mouse.x-mouse.sx)*0.1;mouse.sy+=(mouse.y-mouse.sy)*0.1;
            const dx=mouse.x-mouse.lx,dy=mouse.y-mouse.ly;mouse.v=Math.hypot(dx,dy);mouse.vs+=(mouse.v-mouse.vs)*0.1;mouse.vs=Math.min(100,mouse.vs);mouse.lx=mouse.x;mouse.ly=mouse.y;mouse.a=Math.atan2(dy,dx);
            movePoints(t);drawLines();
            frameIdRef.current=requestAnimationFrame(tick);
        }
        function onResize(){setSize();setLines();}
        function onMouseMove(e){const mouse=mouseRef.current,b=bounding;mouse.x=e.clientX-b.left;mouse.y=e.clientY-b.top;if(!mouse.set){mouse.sx=mouse.x;mouse.sy=mouse.y;mouse.lx=mouse.x;mouse.ly=mouse.y;mouse.set=true;}}
        function onTouchMove(e){const t=e.touches[0],mouse=mouseRef.current,b=bounding;mouse.x=t.clientX-b.left;mouse.y=t.clientY-b.top;}
        setSize();setLines();frameIdRef.current=requestAnimationFrame(tick);
        window.addEventListener('resize',onResize);window.addEventListener('mousemove',onMouseMove);window.addEventListener('touchmove',onTouchMove,{passive:false});
        return ()=>{cancelAnimationFrame(frameIdRef.current);window.removeEventListener('resize',onResize);window.removeEventListener('mousemove',onMouseMove);window.removeEventListener('touchmove',onTouchMove);};
    },[]);
    return (
        <div ref={containerRef} className={className} style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',...style}} aria-hidden="true">
            <canvas ref={canvasRef} className="waves-canvas"/>
        </div>
    );
};

// â"€â"€â"€ MAGIC BENTO (interactive particle bento grid) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const keystoneBentoCards = [
    { color:'#0D0806', title:'Floor Plans in <60s', description:'From guided brief to a real layout, instantly', label:'Speed',
      svgHtml:'<svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="74" height="50" rx="2" stroke="#FF6A37" stroke-width="1.2" opacity="0.4"/><rect x="3" y="3" width="42" height="30" rx="1" stroke="#FF9A5C" stroke-width="1.4"/><rect x="45" y="3" width="32" height="30" rx="1" stroke="#FF9A5C" stroke-width="1.4"/><rect x="3" y="33" width="26" height="20" rx="1" stroke="#FF9A5C" stroke-width="1.4"/><rect x="29" y="33" width="48" height="20" rx="1" stroke="#FF9A5C" stroke-width="1.4"/><line x1="16" y1="3" x2="16" y2="33" stroke="#FF6A37" stroke-width="0.8" opacity="0.35"/><line x1="45" y1="33" x2="45" y2="53" stroke="#FF6A37" stroke-width="0.8" opacity="0.35"/></svg>' },
    { color:'#0D0806', title:'Exterior Render', description:'Atmosphere visualized from the same brief', label:'Vision',
      svgHtml:'<svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="40,6 70,27 70,53 10,53 10,27" stroke="#FF9A5C" stroke-width="1.4" fill="none" stroke-linejoin="round"/><polygon points="40,6 70,27 10,27" stroke="#FF6A37" stroke-width="1.2" fill="rgba(255,106,55,0.07)" stroke-linejoin="round"/><rect x="32" y="36" width="16" height="17" rx="1" stroke="#FF9A5C" stroke-width="1.2"/><rect x="14" y="30" width="12" height="10" rx="1" stroke="#FF9A5C" stroke-width="1" opacity="0.65"/><rect x="54" y="30" width="12" height="10" rx="1" stroke="#FF9A5C" stroke-width="1" opacity="0.65"/><circle cx="65" cy="13" r="5" stroke="#FF6A37" stroke-width="1" opacity="0.55"/><line x1="65" y1="6" x2="65" y2="4" stroke="#FF6A37" stroke-width="1" opacity="0.45"/><line x1="72" y1="13" x2="74" y2="13" stroke="#FF6A37" stroke-width="1" opacity="0.45"/><line x1="58" y1="13" x2="56" y2="13" stroke="#FF6A37" stroke-width="1" opacity="0.45"/></svg>' },
    { color:'#0D0806', title:'Guided Intake', description:'Structured discovery before the meeting starts', label:'Discovery',
      svgHtml:'<svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="8" width="48" height="44" rx="3" stroke="#FF6A37" stroke-width="1.4" opacity="0.55"/><rect x="28" y="4" width="24" height="8" rx="2" stroke="#FF9A5C" stroke-width="1.2"/><circle cx="24" cy="22" r="3" stroke="#FF9A5C" stroke-width="1.3"/><polyline points="22.6,22 24,23.8 26,20.2" stroke="#FF9A5C" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="30" y1="22" x2="57" y2="22" stroke="#FF9A5C" stroke-width="1.3" opacity="0.85"/><circle cx="24" cy="33" r="3" stroke="#FF9A5C" stroke-width="1.3" opacity="0.7"/><line x1="30" y1="33" x2="57" y2="33" stroke="#FF9A5C" stroke-width="1.3" opacity="0.6"/><circle cx="24" cy="44" r="3" stroke="#FF9A5C" stroke-width="1.3" opacity="0.5"/><line x1="30" y1="44" x2="50" y2="44" stroke="#FF9A5C" stroke-width="1.3" opacity="0.4"/></svg>' },
    { color:'#0D0806', title:'DXF + Elevations', description:'CAD-ready export and matching facade views', label:'Export',
      svgHtml:'<svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="5" width="24" height="18" rx="2" stroke="#FF6A37" stroke-width="1.4" opacity="0.75"/><rect x="14" y="9" width="16" height="10" rx="1" stroke="#FF9A5C" stroke-width="1.1" opacity="0.75"/><rect x="46" y="5" width="24" height="18" rx="2" stroke="#FF6A37" stroke-width="1.4" opacity="0.75"/><path d="M48 21 L58 11 L68 21" stroke="#FF9A5C" stroke-width="1.2" fill="none" stroke-linejoin="round"/><line x1="22" y1="29" x2="58" y2="29" stroke="#FF9A5C" stroke-width="1.1" opacity="0.6"/><line x1="22" y1="36" x2="58" y2="36" stroke="#FF9A5C" stroke-width="1.1" opacity="0.6"/><line x1="22" y1="43" x2="48" y2="43" stroke="#FF9A5C" stroke-width="1.1" opacity="0.45"/><line x1="40" y1="24" x2="40" y2="52" stroke="#FF9A5C" stroke-width="1.8" stroke-linecap="round"/><polyline points="33,45 40,52 47,45" stroke="#FF9A5C" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
    { color:'#0D0806', title:'Passkey Access', description:'Advanced tools stay protected behind secure entry', label:'Security',
      svgHtml:'<svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="22" y="27" width="36" height="26" rx="4" stroke="#FF6A37" stroke-width="1.4"/><path d="M29 27 V20 C29 11 51 11 51 20 V27" stroke="#FF9A5C" stroke-width="1.4" fill="none"/><circle cx="40" cy="38" r="4" stroke="#FF9A5C" stroke-width="1.4"/><line x1="40" y1="42" x2="40" y2="46" stroke="#FF9A5C" stroke-width="1.4" stroke-linecap="round"/><line x1="29" y1="17" x2="25" y2="14" stroke="#FF6A37" stroke-width="1" opacity="0.5"/><line x1="51" y1="17" x2="55" y2="14" stroke="#FF6A37" stroke-width="1" opacity="0.5"/><line x1="40" y1="11" x2="40" y2="7" stroke="#FF6A37" stroke-width="1" opacity="0.5"/></svg>' },
    { color:'#0D0806', title:'Session History', description:'Firm-visible pipeline for every active lead', label:'Pipeline',
      svgHtml:'<svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="28" r="6" stroke="#FF6A37" stroke-width="1.4" opacity="0.65"/><circle cx="40" cy="11" r="6" stroke="#FF9A5C" stroke-width="1.4"/><circle cx="40" cy="45" r="6" stroke="#FF9A5C" stroke-width="1.4" opacity="0.8"/><circle cx="68" cy="28" r="6" stroke="#FF6A37" stroke-width="1.4" opacity="0.65"/><line x1="18" y1="25" x2="34" y2="14" stroke="#FF6A37" stroke-width="1.1" opacity="0.45"/><line x1="18" y1="31" x2="34" y2="42" stroke="#FF6A37" stroke-width="1.1" opacity="0.45"/><line x1="46" y1="14" x2="62" y2="25" stroke="#FF6A37" stroke-width="1.1" opacity="0.45"/><line x1="46" y1="42" x2="62" y2="31" stroke="#FF6A37" stroke-width="1.1" opacity="0.45"/><circle cx="40" cy="28" r="3" fill="#FF6A37" opacity="0.5"/></svg>' },
];
const BentoParticleCard = ({ children, className='', style, particleCount=10, glowColor='255,106,55', clickEffect=true }) => {
    const cardRef = useRef(null);
    const particlesRef = useRef([]);
    const isHoveredRef = useRef(false);
    const timeoutsRef = useRef([]);
    const gsap = window.gsap;
    const clearParticles = () => {
        timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current=[];
        particlesRef.current.forEach(p=>{
            if(!gsap){p.remove();return;}
            gsap.to(p,{scale:0,opacity:0,duration:0.3,ease:'back.in(1.7)',onComplete:()=>p.parentNode?.removeChild(p)});
        });
        particlesRef.current=[];
    };
    const spawnParticles = () => {
        if(!cardRef.current||!isHoveredRef.current)return;
        const {width,height}=cardRef.current.getBoundingClientRect();
        for(let i=0;i<particleCount;i++){
            const tid=setTimeout(()=>{
                if(!isHoveredRef.current||!cardRef.current)return;
                const el=document.createElement('div');
                el.style.cssText=`position:absolute;width:4px;height:4px;border-radius:50%;background:rgba(${glowColor},1);box-shadow:0 0 6px rgba(${glowColor},0.6);pointer-events:none;z-index:100;left:${Math.random()*width}px;top:${Math.random()*height}px;`;
                cardRef.current.appendChild(el);
                particlesRef.current.push(el);
                if(gsap){
                    gsap.fromTo(el,{scale:0,opacity:0},{scale:1,opacity:1,duration:0.3,ease:'back.out(1.7)'});
                    gsap.to(el,{x:(Math.random()-0.5)*100,y:(Math.random()-0.5)*100,rotation:Math.random()*360,duration:2+Math.random()*2,ease:'none',repeat:-1,yoyo:true});
                    gsap.to(el,{opacity:0.3,duration:1.5,ease:'power2.inOut',repeat:-1,yoyo:true});
                }
            },i*100);
            timeoutsRef.current.push(tid);
        }
    };
    useEffect(()=>{
        const el=cardRef.current;if(!el)return;
        const onEnter=()=>{isHoveredRef.current=true;spawnParticles();};
        const onLeave=()=>{isHoveredRef.current=false;clearParticles();};
        const onClick=(e)=>{
            if(!clickEffect||!gsap)return;
            const rect=el.getBoundingClientRect();const x=e.clientX-rect.left;const y=e.clientY-rect.top;
            const maxD=Math.max(Math.hypot(x,y),Math.hypot(x-rect.width,y),Math.hypot(x,y-rect.height),Math.hypot(x-rect.width,y-rect.height));
            const ripple=document.createElement('div');
            ripple.style.cssText=`position:absolute;width:${maxD*2}px;height:${maxD*2}px;border-radius:50%;background:radial-gradient(circle,rgba(${glowColor},0.4)0%,rgba(${glowColor},0.2)30%,transparent 70%);left:${x-maxD}px;top:${y-maxD}px;pointer-events:none;z-index:1000;`;
            el.appendChild(ripple);
            gsap.fromTo(ripple,{scale:0,opacity:1},{scale:1,opacity:0,duration:0.8,ease:'power2.out',onComplete:()=>ripple.remove()});
        };
        el.addEventListener('mouseenter',onEnter);el.addEventListener('mouseleave',onLeave);el.addEventListener('click',onClick);
        return ()=>{isHoveredRef.current=false;el.removeEventListener('mouseenter',onEnter);el.removeEventListener('mouseleave',onLeave);el.removeEventListener('click',onClick);clearParticles();};
    },[]);
    return (
        <div ref={cardRef} className={`${className} particle-container`} style={{...style,position:'relative',overflow:'hidden'}}>
            {children}
        </div>
    );
};
const BentoGlobalSpotlight = ({ gridRef, spotlightRadius=400, glowColor='255,106,55' }) => {
    const spotRef = useRef(null);
    useEffect(()=>{
        if(!gridRef?.current)return;
        const gsap=window.gsap;
        const spotlight=document.createElement('div');
        spotlight.className='global-spotlight';
        spotlight.style.cssText=`position:fixed;width:600px;height:600px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(${glowColor},0.12)0%,rgba(${glowColor},0.06)20%,rgba(${glowColor},0.02)40%,transparent 65%);z-index:200;opacity:0;transform:translate(-50%,-50%);mix-blend-mode:screen;`;
        document.body.appendChild(spotlight);
        spotRef.current=spotlight;
        const { proximity, fadeDistance } = { proximity: spotlightRadius*0.5, fadeDistance: spotlightRadius*0.75 };
        const onMove=(e)=>{
            if(!spotRef.current||!gridRef.current)return;
            const section=gridRef.current.closest('.bento-section');
            const rect=section?.getBoundingClientRect();
            const inside=rect&&e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom;
            const cards=gridRef.current.querySelectorAll('.magic-bento-card');
            if(!inside){if(gsap)gsap.to(spotlight,{opacity:0,duration:0.3});else spotlight.style.opacity='0';cards.forEach(c=>c.style.setProperty('--glow-intensity','0'));return;}
            let minDist=Infinity;
            cards.forEach(card=>{
                const cr=card.getBoundingClientRect();const cx=cr.left+cr.width/2,cy=cr.top+cr.height/2;
                const dist=Math.max(0,Math.hypot(e.clientX-cx,e.clientY-cy)-Math.max(cr.width,cr.height)/2);
                minDist=Math.min(minDist,dist);
                const glow=dist<=proximity?1:dist<=fadeDistance?(fadeDistance-dist)/(fadeDistance-proximity):0;
                card.style.setProperty('--glow-x',`${((e.clientX-cr.left)/cr.width)*100}%`);
                card.style.setProperty('--glow-y',`${((e.clientY-cr.top)/cr.height)*100}%`);
                card.style.setProperty('--glow-intensity',glow.toString());
                card.style.setProperty('--glow-radius',`${spotlightRadius}px`);
            });
            if(gsap){gsap.to(spotlight,{left:e.clientX,top:e.clientY,duration:0.1,ease:'power2.out'});const op=minDist<=proximity?0.7:minDist<=fadeDistance?((fadeDistance-minDist)/(fadeDistance-proximity))*0.7:0;gsap.to(spotlight,{opacity:op,duration:0.2,ease:'power2.out'});}
            else{spotlight.style.left=e.clientX+'px';spotlight.style.top=e.clientY+'px';}
        };
        const onLeave=()=>{gridRef.current?.querySelectorAll('.magic-bento-card').forEach(c=>c.style.setProperty('--glow-intensity','0'));if(gsap)gsap.to(spotlight,{opacity:0,duration:0.3});else spotlight.style.opacity='0';};
        document.addEventListener('mousemove',onMove);
        document.addEventListener('mouseleave',onLeave);
        return ()=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseleave',onLeave);spotlight.parentNode?.removeChild(spotlight);};
    },[gridRef,spotlightRadius,glowColor]);
    return null;
};
const MagicBento = ({ cards=keystoneBentoCards, glowColor='255,106,55', spotlightRadius=400, particleCount=10, clickEffect=true }) => {
    const gridRef=useRef(null);
    const [isMobile,setIsMobile]=useState(false);
    useEffect(()=>{const check=()=>setIsMobile(window.innerWidth<=768);check();window.addEventListener('resize',check);return()=>window.removeEventListener('resize',check);},[]);
    return (
        <>
            {!isMobile&&<BentoGlobalSpotlight gridRef={gridRef} spotlightRadius={spotlightRadius} glowColor={glowColor}/>}
            <div className="card-grid bento-section" ref={gridRef}>
                {cards.map((card,i)=>(
                    <BentoParticleCard key={i}
                        className={`magic-bento-card magic-bento-card--text-autohide magic-bento-card--border-glow`}
                        style={{backgroundColor:card.color}}
                        particleCount={isMobile?0:particleCount}
                        glowColor={glowColor}
                        clickEffect={!isMobile&&clickEffect}>
                        <div className="magic-bento-card__header">
                            <div className="magic-bento-card__label">{card.label}</div>
                        </div>
                        {card.svgHtml && <div className="magic-bento-card__graphic" dangerouslySetInnerHTML={{ __html: card.svgHtml }} />}
                        <div className="magic-bento-card__content">
                            <h2 className="magic-bento-card__title">{card.title}</h2>
                            <p className="magic-bento-card__description">{card.description}</p>
                        </div>
                    </BentoParticleCard>
                ))}
            </div>
        </>
    );
};

const SurveySection = ({ onJoin }) => {
    const [copied, setCopied] = useState(false);
    const copyLink = () => {
        const url = window.location.origin + window.location.pathname.replace(/\/$/, '') + '/#research';
        navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2400); });
    };
    return (
        <section id="research" className="defer-section py-16 md:py-24" style={{background:'var(--cream)'}}>
            <div className="site-shell">
                <div className="max-w-2xl mx-auto text-center">
                    <Reveal y={12}>
                        <span className="section-label justify-center">Research / Beta Program</span>
                    </Reveal>
                    <Reveal y={32} delay={0.08}>
                        <h2 className="cg mt-5 magic-gradient-text" style={{fontSize:'clamp(2.6rem,5.5vw,4.2rem)',lineHeight:0.88,letterSpacing:'-0.055em',textTransform:'uppercase',color:'var(--ink)'}}>
                            Help us build<br/>the right tool.
                        </h2>
                    </Reveal>
                    <Reveal y={16} delay={0.14}>
                        <p className="mt-5 leading-relaxed mx-auto" style={{color:'rgba(9,9,9,0.58)',maxWidth:'30rem',fontSize:'1rem'}}>
                            Join the early trial list and help shape Keystone for homeowners and first-time home builders.
                        </p>
                    </Reveal>

                    <Reveal y={24} delay={0.22}>
                        <div className="mt-10 mx-auto inline-block survey-qr-frame" style={{padding:'2rem 2.4rem'}}>
                            <div className="mono text-[10px] uppercase tracking-[0.28em] mb-4" style={{color:'rgba(9,9,9,0.36)'}}>Scan to participate</div>
                            <div className="rounded-[18px] overflow-hidden mx-auto"
                                style={{width:'220px',height:'220px',background:'white',padding:'12px',boxShadow:'0 0 0 1px rgba(9,9,9,0.06), 0 8px 24px rgba(9,9,9,0.06)'}}>
                                <img src={ASSETS.qrCode} alt="Qualtrics research survey QR code"
                                    style={{width:'100%',height:'100%',objectFit:'contain'}}/>
                            </div>
                            <p className="mt-4 text-[13px]" style={{color:'rgba(9,9,9,0.48)'}}>
                                For homeowners, builders, and early design explorers
                            </p>
                        </div>
                    </Reveal>

                    <Reveal y={12} delay={0.30}>
                        <div className="flex justify-center gap-3 flex-wrap mt-6">
                            {[{val:'~3 min',lbl:'to complete'},{val:'1',lbl:'trial request'},{val:'early',lbl:'access'}].map(item => (
                                <div key={item.lbl} className="paper-panel px-5 py-3 flex items-center gap-2">
                                    <span className="cg" style={{fontSize:'1.3rem',color:'var(--accent)',letterSpacing:'-0.03em'}}>{item.val}</span>
                                    <span className="mono text-[10px] uppercase tracking-[0.18em]" style={{color:'rgba(9,9,9,0.44)'}}>{item.lbl}</span>
                                </div>
                            ))}
                        </div>
                    </Reveal>

                    <Reveal y={12} delay={0.38}>
                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                            <button onClick={copyLink} className="cta-secondary flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                {copied ? 'Link copied!' : 'Copy share link'}
                            </button>
                            <button onClick={onJoin} className="cta-hero cta-glow-soft">
                                Get Beta Access
                            </button>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
};

const HeroFloatingBlueprint = () => {
    const { scrollY } = useScroll();
    const rawRotate = useTransform(scrollY, [0, 480], [0, 18]);
    const rawOpacity = useTransform(scrollY, [0, 320], [1, 0]);
    const rawY = useTransform(scrollY, [0, 480], [0, 56]);
    const rotateX = useSpring(rawRotate, { stiffness: 60, damping: 22 });
    const opacity = useSpring(rawOpacity, { stiffness: 60, damping: 22 });
    const translateY = useSpring(rawY, { stiffness: 60, damping: 22 });
    return (
        <div className="absolute inset-0 hidden lg:block pointer-events-none overflow-hidden"
            style={{ perspective: '900px', perspectiveOrigin: '72% 38%' }}>
            <motion.div
                initial={{ opacity: 0, rotateX: -6, y: 20 }}
                animate={{ opacity: 0.28, rotateX: 0, y: 0 }}
                transition={{ delay: 0.7, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ rotateX, opacity, translateY, transformStyle: 'preserve-3d' }}
                className="absolute right-[-4%] top-[8%] w-[52%]">
                <svg viewBox="0 0 520 460" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'auto'}}>
                    <defs>
                        <pattern id="bpDot" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                            <circle cx="12" cy="12" r="0.9" fill="rgba(27,79,130,0.18)"/>
                        </pattern>
                    </defs>
                    <rect x="0" y="0" width="520" height="460" fill="url(#bpDot)"/>
                    {/* outer walls */}
                    <rect x="52" y="48" width="418" height="350" stroke="rgba(27,79,130,0.52)" strokeWidth="2.2" fill="rgba(27,79,130,0.018)"/>
                    {/* living / great room */}
                    <rect x="52" y="48" width="254" height="196" stroke="rgba(27,79,130,0.36)" strokeWidth="1.4" fill="rgba(27,79,130,0.022)"/>
                    {/* kitchen */}
                    <rect x="306" y="48" width="164" height="196" stroke="rgba(27,79,130,0.36)" strokeWidth="1.4" fill="rgba(27,79,130,0.022)"/>
                    {/* hallway */}
                    <rect x="52" y="244" width="104" height="154" stroke="rgba(27,79,130,0.28)" strokeWidth="1.2" fill="none"/>
                    {/* primary bedroom */}
                    <rect x="156" y="244" width="200" height="154" stroke="rgba(27,79,130,0.36)" strokeWidth="1.4" fill="rgba(27,79,130,0.022)"/>
                    {/* bed 2 */}
                    <rect x="356" y="244" width="114" height="154" stroke="rgba(27,79,130,0.36)" strokeWidth="1.4" fill="rgba(27,79,130,0.022)"/>
                    {/* door arcs */}
                    <path d="M52 196 Q82 196 82 226" stroke="rgba(27,79,130,0.3)" strokeWidth="1" fill="none" strokeDasharray="3,3"/>
                    <path d="M156 310 Q186 310 186 340" stroke="rgba(27,79,130,0.3)" strokeWidth="1" fill="none" strokeDasharray="3,3"/>
                    <path d="M306 196 Q306 166 336 166" stroke="rgba(27,79,130,0.3)" strokeWidth="1" fill="none" strokeDasharray="3,3"/>
                    {/* window symbols */}
                    <line x1="130" y1="48" x2="190" y2="48" stroke="rgba(27,79,130,0.5)" strokeWidth="2.8"/>
                    <line x1="340" y1="48" x2="400" y2="48" stroke="rgba(27,79,130,0.5)" strokeWidth="2.8"/>
                    <line x1="200" y1="398" x2="300" y2="398" stroke="rgba(27,79,130,0.5)" strokeWidth="2.8"/>
                    {/* room labels */}
                    <text x="178" y="154" fontSize="10" fill="rgba(27,79,130,0.45)" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" letterSpacing="2">LIVING</text>
                    <text x="388" y="154" fontSize="10" fill="rgba(27,79,130,0.45)" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" letterSpacing="2">KITCHEN</text>
                    <text x="256" y="328" fontSize="10" fill="rgba(27,79,130,0.45)" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" letterSpacing="2">PRIMARY</text>
                    <text x="413" y="328" fontSize="10" fill="rgba(27,79,130,0.45)" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" letterSpacing="2">BED 2</text>
                    {/* dimension ticks */}
                    <line x1="52" y1="30" x2="470" y2="30" stroke="rgba(27,79,130,0.22)" strokeWidth="0.7" strokeDasharray="4,5"/>
                    <line x1="34" y1="48" x2="34" y2="398" stroke="rgba(27,79,130,0.22)" strokeWidth="0.7" strokeDasharray="4,5"/>
                    <line x1="48" y1="30" x2="48" y2="42" stroke="rgba(27,79,130,0.3)" strokeWidth="0.8"/>
                    <line x1="472" y1="30" x2="472" y2="42" stroke="rgba(27,79,130,0.3)" strokeWidth="0.8"/>
                    <line x1="34" y1="44" x2="46" y2="44" stroke="rgba(27,79,130,0.3)" strokeWidth="0.8"/>
                    <line x1="34" y1="400" x2="46" y2="400" stroke="rgba(27,79,130,0.3)" strokeWidth="0.8"/>
                    {/* stair symbol */}
                    <g transform="translate(68, 258)">
                        {[0,1,2,3,4,5,6,7].map(i => (
                            <line key={i} x1="0" y1={i*9} x2="72" y2={i*9} stroke="rgba(27,79,130,0.28)" strokeWidth="0.8"/>
                        ))}
                        <rect x="0" y="0" width="72" height="72" stroke="rgba(27,79,130,0.32)" strokeWidth="0.9" fill="none"/>
                    </g>
                    {/* north marker */}
                    <g transform="translate(492, 28)">
                        <circle cx="0" cy="0" r="11" stroke="rgba(27,79,130,0.28)" strokeWidth="0.9" fill="none"/>
                        <text x="0" y="-14" fontSize="8" fill="rgba(27,79,130,0.42)" textAnchor="middle" fontFamily="IBM Plex Mono, monospace">N</text>
                        <polygon points="0,-8 -4,4 0,1 4,4" fill="rgba(27,79,130,0.38)" stroke="none"/>
                        <polygon points="0,8 -4,-4 0,-1 4,-4" fill="rgba(27,79,130,0.18)" stroke="none"/>
                    </g>
                    {/* scale bar */}
                    <g transform="translate(52, 432)">
                        <rect x="0" y="0" width="120" height="5" fill="rgba(27,79,130,0.22)"/>
                        <rect x="0" y="0" width="30" height="5" fill="rgba(27,79,130,0.4)"/>
                        <rect x="60" y="0" width="30" height="5" fill="rgba(27,79,130,0.4)"/>
                        <text x="0" y="16" fontSize="8" fill="rgba(27,79,130,0.38)" fontFamily="IBM Plex Mono, monospace">0</text>
                        <text x="58" y="16" fontSize="8" fill="rgba(27,79,130,0.38)" fontFamily="IBM Plex Mono, monospace">20</text>
                        <text x="116" y="16" fontSize="8" fill="rgba(27,79,130,0.38)" fontFamily="IBM Plex Mono, monospace">40 ft</text>
                    </g>
                </svg>
            </motion.div>
        </div>
    );
};

// â"€â"€â"€ MOBILE NAV â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const MobileNavBar = ({ onOpenMenu }) => (
    <div className="fixed bottom-0 left-0 w-full bottom-nav z-[90] md:hidden pb-safe">
        <div className="grid grid-cols-5 h-[60px] items-center">
            {[
                { svg: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: 'Home',    id: 'hero' },
                { svg: "M19 11H5m14-6H5m14 12H9m10 0l-4 4m0 0l-4-4m4 4V9",                       label: 'Work',    id: 'work' },
                null,
                { svg: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",              label: 'Studio',  id: 'studio' },
                { svg: "M4 6h16M4 12h16m-7 6h7", label: 'Menu', id: null },
            ].map((item, i) => {
                if (!item) return (
                    <div key={i} className="flex justify-center relative" style={{top:'-14px'}}>
                        <button onClick={() => scrollTo('generator')}
                            className="w-13 h-13 bg-ink rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform"
                            style={{width:'52px',height:'52px'}}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                            </svg>
                        </button>
                    </div>
                );
                return (
                    <button key={i} onClick={item.id ? () => scrollTo(item.id) : onOpenMenu}
                        className="flex flex-col items-center justify-center gap-1 text-black/45 active:text-black transition-colors">
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.svg}/>
                        </svg>
                        <span className="text-[7px] uppercase font-bold tracking-wider">{item.label}</span>
                    </button>
                );
            })}
        </div>
    </div>
);

const MobileMenuOverlay = ({ isOpen, onClose, onJoin }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ opacity:0, y:"100%" }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:"100%" }}
                transition={{ type:"spring", damping:28, stiffness:220 }}
                className="fixed inset-0 z-[100] text-paper flex flex-col pb-safe"
                style={{background:'linear-gradient(180deg, rgba(10,10,10,0.995), rgba(18,18,18,0.995))'}}>
                <div className="flex justify-between items-center px-6 py-5 border-b border-white/8">
                    <BrandLockup href="/" reverse compact onClick={onClose}/>
                    <button onClick={onClose} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div className="flex-1 px-6 py-6 flex flex-col gap-0">
                    {[['Platform','work'],['Services','services'],['Pricing','pricing'],['Live Studio','generator'],['Studio','studio'],['Sessions','gallery']].map(([label, id], i) => (
                        <button key={id} onClick={() => { scrollTo(id); onClose(); }}
                            className="cg text-[2rem] text-left border-b border-white/6 py-4 flex justify-between items-center text-white/90 hover:text-white transition-colors"
                            style={{letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                            {label}
                            <span className="mono text-sm text-white/20">0{i+1}</span>
                        </button>
                    ))}
                    <div className="grid grid-cols-2 gap-2 mt-5">
                        <a href="/how-floor-plans-work" className="mono text-[10px] uppercase tracking-[0.22em] px-4 py-3 rounded-full border border-white/10 text-center text-white/70 hover:text-white hover:border-white/24 transition-colors">
                            How It Works
                        </a>
                        <a href="/b2b-workflow" className="mono text-[10px] uppercase tracking-[0.22em] px-4 py-3 rounded-full border border-white/10 text-center text-white/70 hover:text-white hover:border-white/24 transition-colors">
                            Guided Workflow
                        </a>
                        <a href="/roadmap" className="mono text-[10px] uppercase tracking-[0.22em] px-4 py-3 rounded-full border border-white/10 text-center text-white/70 hover:text-white hover:border-white/24 transition-colors">
                            Roadmap
                        </a>
                        <a href="/faq" className="mono text-[10px] uppercase tracking-[0.22em] px-4 py-3 rounded-full border border-white/10 text-center text-white/70 hover:text-white hover:border-white/24 transition-colors">
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
                            Unlock Advanced Features
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

// Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ JOIN MODAL Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬
const JoinModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = React.useState({ fullName:'', firmName:'', email:'', volume:'0-6 months', questions:'' });
    const [status, setStatus] = React.useState('idle'); // idle | loading | success
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
        const FORM = "https://docs.google.com/forms/d/e/1FAIpQLSfdIXdz_gGRYmmTLENeYdSV17dwoBZWravDtM9SstDW_qvZag/formResponse";
        const d = new URLSearchParams();
        d.append("entry.564926659", formData.fullName);
        d.append("entry.510477948", formData.firmName);
        d.append("entry.1527142228", formData.email);
                d.append("entry.623368817", formData.volume);
        d.append("entry.1172849489", formData.questions);
        try {
            await fetch(FORM, { method:"POST", mode:"no-cors", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body: d.toString() });
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                onClose();
                setFormData({ fullName:'', firmName:'', email:'', volume:'0-6 months', questions:'' });
            }, 2600);
        } catch {
            alert("Error submitting. Please try again.");
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
                    className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/85 backdrop-blur-sm p-0 md:p-6"
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
                            border:'1px solid rgba(10,10,12,0.08)',
                            boxShadow:'0 28px 90px rgba(9,9,9,0.34)',
                        }}
                    >
                        <div style={{ height:'3px', background:'linear-gradient(90deg, var(--accent), var(--accent-2))' }}/>

                        <button
                            onClick={onClose}
                            aria-label="Close access request"
                            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors z-10"
                            style={{
                                background:'rgba(255,255,255,0.82)',
                                color:'rgba(10,10,12,0.72)',
                                border:'1px solid rgba(10,10,12,0.08)',
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </button>

                        <div className="p-6 md:p-8 overflow-y-auto" style={{ maxHeight:'90vh', color:'var(--ink)' }}>
                            <span className="badge mb-3 inline-block">Unlock Advanced Features</span>
                            <h2 className="cg text-3xl mb-1 mt-2" style={{ letterSpacing:'-0.05em', textTransform:'uppercase', color:'var(--ink)' }}>Request a trial passkey.</h2>
                            <p className="text-sm mt-2 mb-6 leading-relaxed" style={{color:'rgba(10,10,12,0.7)'}}>The free trial already includes the floor plan and elevations. Fill this out if you want access to the advanced package: Exterior Render, refinements, Cost Estimate workbook, and CAD export.</p>

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
                                            <input type="text" name="firmName" value={formData.firmName} onChange={update} required placeholder="Dream House / Family Home"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mono text-[7px] uppercase tracking-widest text-mid block mb-1">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={update} required placeholder="jane@email.com"/>
                                    </div>
                                    <div>
                                        <label className="mono text-[7px] uppercase tracking-widest text-mid block mb-1">Expected Build Timeline</label>
                                        <select name="volume" value={formData.volume} onChange={update}>
                                            <option>0-6 months</option>
                                            <option>6-12 months</option>
                                            <option>12+ months</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mono text-[7px] uppercase tracking-widest text-mid block mb-1">Questions / Notes</label>
                                        <textarea name="questions" rows="2" value={formData.questions} onChange={update} placeholder="Tell us what kind of house you are planning..."/>
                                    </div>
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

// PLAN SUMMARY Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬
const svgMarkupToDataUri = (svgMarkup) => {
    if (!svgMarkup || typeof svgMarkup !== 'string') return null;
    const svg = svgMarkup.includes('xmlns=')
        ? svgMarkup
        : svgMarkup.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

const extractPrimaryNumber = (value, fallback = '') => {
    const match = String(value ?? '').match(/\d+/);
    return match?.[0] || fallback;
};

const normalizeFilenameWords = (value) => String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildPlanExportFilename = (formData, label, extension, fallbackArea = '') => {
    const area = extractPrimaryNumber(formData?.totalArea, fallbackArea);
    const beds = normalizeFilenameWords(formData?.bedrooms);
    const baths = normalizeFilenameWords(formData?.bathrooms);
    const suffix = normalizeFilenameWords(label);
    const parts = [
        area ? `${area}sqft` : '',
        beds,
        baths,
        suffix,
    ].filter(Boolean);
    const stem = parts.join(' ') || 'keystone plan';
    return `${stem}.${extension}`;
};

const getElevationViews = (elevations) => [
    { key:'frontSvg', label:'Front' },
    { key:'rearSvg', label:'Rear' },
    { key:'leftSvg', label:'Left' },
    { key:'rightSvg', label:'Right' },
].filter(view => elevations?.[view.key]);

const BlueprintPresentationSheet = ({ planSvg, elevations, formData, footprintInfo, renderImage }) => {
    if (!planSvg) return null;
    const views = getElevationViews(elevations);
    const showSideRail = views.length > 0 || !!renderImage;
    const area = extractPrimaryNumber(formData?.totalArea, footprintInfo?.widthFt && footprintInfo?.heightFt ? String(footprintInfo.widthFt * footprintInfo.heightFt) : '');
    const styleLabel = elevations?.meta?.styleLabel || formData?.materials || 'Residential';
    const roofKind = String(elevations?.meta?.roofKind || 'gabled').replace(/_/g, ' ');
    const facing = String(formData?.frontFacing || elevations?.meta?.frontEdge || '').trim();
    const summaryBits = [
        area ? `${area} SQ FT` : null,
        formData?.bedrooms ? String(formData.bedrooms).toUpperCase() : null,
        formData?.bathrooms ? String(formData.bathrooms).toUpperCase() : null,
        facing ? `${facing.toUpperCase()} FACING` : null,
    ].filter(Boolean);

    return (
        <div style={{
            background:'#f6f1e8',
            border:'1px solid rgba(120,102,82,0.18)',
            borderRadius:24,
            padding:24,
            boxShadow:'0 24px 60px rgba(0,0,0,0.14)',
            width: showSideRail ? 1480 : 'auto',
        }}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:20,marginBottom:18}}>
                <div>
                    <div className="mono" style={{fontSize:10,letterSpacing:'0.28em',textTransform:'uppercase',color:'rgba(173,51,0,0.88)'}}>Keystone AI</div>
                    <div className="cg" style={{fontSize:'2rem',lineHeight:0.94,letterSpacing:'-0.05em',textTransform:'uppercase',color:'var(--ink)',marginTop:6}}>
                        Plan, Elevations + Exterior Render
                    </div>
                    <div className="mono" style={{fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(10,10,12,0.42)',marginTop:8}}>
                        {summaryBits.join('  |  ') || 'Residential concept set'}
                    </div>
                </div>
                <div className="mono" style={{fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',textAlign:'right',color:'rgba(10,10,12,0.5)',lineHeight:1.7}}>
                    <div>{styleLabel}</div>
                    <div>{roofKind}</div>
                </div>
            </div>

            <div style={{
                display:'grid',
                gridTemplateColumns: showSideRail ? 'minmax(0,1fr) 392px' : 'minmax(0,1fr)',
                gap:20,
                alignItems:'start',
            }}>
                <div style={{
                    background:'#fffdf9',
                    border:'1px solid rgba(120,102,82,0.12)',
                    borderRadius:18,
                    padding:18,
                    boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.6)',
                }}>
                    <div className="presentation-plan-svg" dangerouslySetInnerHTML={{__html: planSvg}} />
                </div>

                {showSideRail ? (
                    <div style={{display:'flex',flexDirection:'column',gap:12}}>
                        {renderImage ? (
                            <div style={{
                                background:'#fffdf9',
                                border:'1px solid rgba(120,102,82,0.12)',
                                borderRadius:16,
                                padding:'12px 12px 10px',
                                minHeight:218,
                                display:'flex',
                                flexDirection:'column',
                                gap:8,
                                boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.58)',
                            }}>
                                <div className="mono" style={{fontSize:8,letterSpacing:'0.18em',textTransform:'uppercase',color:'rgba(10,10,12,0.48)'}}>
                                    Exterior render
                                </div>
                                <img
                                    src={renderImage}
                                    alt="Exterior render preview"
                                    style={{
                                        width:'100%',
                                        height:220,
                                        objectFit:'cover',
                                        borderRadius:12,
                                        border:'1px solid rgba(120,102,82,0.12)',
                                    }}
                                />
                            </div>
                        ) : null}

                        {views.length ? (
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                                {views.map(view => (
                                    <div key={view.key} style={{
                                        background:'#fffdf9',
                                        border:'1px solid rgba(120,102,82,0.12)',
                                        borderRadius:16,
                                        padding:'12px 12px 10px',
                                        minHeight:176,
                                        display:'flex',
                                        flexDirection:'column',
                                        gap:8,
                                        boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.58)',
                                    }}>
                                        <div className="mono" style={{fontSize:8,letterSpacing:'0.18em',textTransform:'uppercase',color:'rgba(10,10,12,0.48)'}}>
                                            {view.label} elevation
                                        </div>
                                        <div className="presentation-elevation-svg" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}} dangerouslySetInnerHTML={{__html: elevations[view.key]}} />
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

const ElevationsPanel = ({ elevations, formData, onOpenPreview }) => {
    const availableViews = getElevationViews(elevations);

    const defaultKey = `${elevations?.meta?.supportViewKey || 'front'}Svg`;
    const [activeKey, setActiveKey] = React.useState(availableViews.some(view => view.key === 'frontSvg') ? 'frontSvg' : (availableViews[0]?.key || null));

    React.useEffect(() => {
        const nextKey = availableViews.some(view => view.key === 'frontSvg') ? 'frontSvg' : (availableViews[0]?.key || defaultKey || null);
        setActiveKey(nextKey);
    }, [elevations]);

    if (!elevations || availableViews.length === 0) return null;

    const activeView = availableViews.find(view => view.key === activeKey) || availableViews[0];
    const activeSvg = elevations?.[activeView?.key] || '';
    const activeSrc = svgMarkupToDataUri(activeSvg);
    const styleLabel = elevations?.meta?.styleLabel || formData?.materials || 'Residential';
    const roofKind = String(elevations?.meta?.roofKind || 'gabled').replace(/_/g, ' ');
    const supportLabel = elevations?.meta?.supportViewKey ? `${elevations.meta.supportViewKey} elevation` : 'side elevation';

    const downloadActive = () => {
        if (!activeSrc) return;
        const link = document.createElement('a');
        link.href = activeSrc;
        link.download = buildPlanExportFilename(formData, `${activeView.label} elevation`, 'svg');
        link.click();
    };

    return (
        <div className="paper-panel">
            <div className="p-4 border-b border-black/5 bg-white/40 flex items-start justify-between gap-3">
                <div>
                    <span className="section-label">Elevations</span>
                    <p className="text-[11px] leading-relaxed mt-2" style={{color:'rgba(10,10,12,0.62)'}}>
                        Deterministic facade views derived from the plan geometry, vertical model, and survey style.
                    </p>
                </div>
                <div className="mono text-[8px] uppercase tracking-[0.22em] text-right" style={{color:'rgba(10,10,12,0.46)'}}>
                    {styleLabel}<br/>
                    {roofKind}
                </div>
            </div>
            <div className="p-4">
                <div className="rounded-[18px] border border-black/8 bg-white overflow-hidden shadow-sm">
                    {activeSrc ? (
                        <img
                            src={activeSrc}
                            alt={`${activeView.label} elevation`}
                            className="w-full h-auto cursor-zoom-in"
                            onClick={() => onOpenPreview && onOpenPreview(activeSrc)}
                        />
                    ) : (
                        <div className="p-8 text-center text-mid text-[11px]">Elevation preview unavailable.</div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                    {availableViews.map(view => {
                        const selected = activeView?.key === view.key;
                        return (
                            <button
                                key={view.key}
                                type="button"
                                onClick={() => setActiveKey(view.key)}
                                className="px-3 py-2.5 border rounded-[12px] text-left transition-all"
                                style={{
                                    borderColor: selected ? 'rgba(27,79,130,0.32)' : 'rgba(10,10,12,0.08)',
                                    background: selected ? 'rgba(27,79,130,0.06)' : 'rgba(255,255,255,0.9)',
                                }}
                            >
                                <div className="mono text-[8px] uppercase tracking-[0.18em]" style={{color:selected?'rgba(27,79,130,0.92)':'rgba(10,10,12,0.52)'}}>{view.label} view</div>
                                <div className="text-[11px] mt-1" style={{color:'rgba(10,10,12,0.72)'}}>
                                    {view.key === 'frontSvg' ? 'Primary street-facing facade' :
                                     view.key === 'rearSvg' ? 'Rear massing and glazing' :
                                     view.key === 'leftSvg' ? 'Left-side profile' : 'Right-side profile'}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <button onClick={downloadActive} className="mono text-[9px] text-blue underline">Download active view</button>
                    <span className="mono text-[8px] uppercase tracking-[0.18em]" style={{color:'rgba(10,10,12,0.42)'}}>
                        {supportLabel} is also used to ground the Exterior Render.
                    </span>
                </div>
            </div>
        </div>
    );
};

const profileLabel = (value) => String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '-';

const PlanSummaryPanel = ({ planSpec, openingDiagnostics }) => {
    if (!planSpec) return null;
    const allRooms = (planSpec.levels||[]).flatMap(l => l.rooms||[]);
    const diag = openingDiagnostics || planSpec?.openingDiagnostics || null;
    const totals = diag?.totals || null;
    const profiles = diag?.profiles || null;
    const roomCounts = {};
    allRooms.forEach(r => { const t = r.label||r.type; roomCounts[t] = (roomCounts[t]||0)+1; });
    return (
        <div className="paper-panel p-4 md:p-5 mt-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                    <p className="mono text-[8px] uppercase tracking-[0.24em]" style={{color:'rgba(27,79,130,0.82)'}}>Generated plan summary</p>
                    <p className="text-[13px] leading-relaxed mt-2" style={{color:'rgba(10,10,12,0.62)'}}>This is the live floor plan output currently available in Keystone today.</p>
                </div>
                <div className="mono text-[8px] uppercase tracking-[0.22em]" style={{color:'rgba(10,10,12,0.42)'}}>
                    Download-ready PNG
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4 mt-4">
                <div className="spec-panel"><div className="spec-label">Area</div><div className="spec-value">{(planSpec.totalAreaSqFt||0).toLocaleString()} sqft</div></div>
                <div className="spec-panel"><div className="spec-label">Stories</div><div className="spec-value">{planSpec.stories}</div></div>
                <div className="spec-panel"><div className="spec-label">Levels</div><div className="spec-value">{(planSpec.levels||[]).length}</div></div>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {Object.entries(roomCounts).map(([label, count]) => (
                    <span key={label} className="room-badge active" style={{cursor:'default'}}>{label}{count > 1 ? ` x${count}` : ''}</span>
                ))}
            </div>
            {diag && (
                <div className="rounded-[14px] border border-black/8 bg-white/70 p-3 mt-4">
                    <p className="mono text-[8px] uppercase tracking-[0.2em]" style={{color:'rgba(10,10,12,0.5)'}}>Opening diagnostics</p>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="spec-panel"><div className="spec-label">Openings</div><div className="spec-value">{profileLabel(profiles?.openingProfile)}</div></div>
                        <div className="spec-panel"><div className="spec-label">Indoor/Outdoor</div><div className="spec-value">{profileLabel(profiles?.indoorOutdoorProfile)}</div></div>
                        <div className="spec-panel"><div className="spec-label">Doorways</div><div className="spec-value">{profileLabel(profiles?.doorwayProfile)}</div></div>
                    </div>
                    {totals && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            <span className="room-badge active" style={{cursor:'default'}}>Windows {Number(totals.windowCount || 0)}</span>
                            <span className="room-badge active" style={{cursor:'default'}}>Exterior doors {Number(totals.exteriorDoorCount || 0)}</span>
                            <span className="room-badge active" style={{cursor:'default'}}>Wide doors {Number(totals.wideDoorCount || 0)}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ REFINEMENT PANEL Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬
const formatUsd = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return '-';
    return `$${Math.round(n).toLocaleString()}`;
};

const formatQuantity = (value, unit = '') => {
    const n = Number(value);
    const qty = Number.isFinite(n)
        ? (Math.abs(n % 1) < 0.001 ? n.toLocaleString() : n.toLocaleString(undefined, { maximumFractionDigits: 1 }))
        : String(value ?? '-');
    return unit ? `${qty} ${unit}` : qty;
};

const csvEscape = (value) => {
    const str = value == null ? '' : String(value);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
};

const estimateToCsv = (estimate) => {
    const rows = Array.isArray(estimate?.csvRows) ? estimate.csvRows : [];
    const headers = ['section', 'item', 'unit', 'quantity', 'low', 'target', 'high', 'notes'];
    const lines = [headers.join(',')];
    rows.forEach((row) => {
        lines.push(headers.map((header) => csvEscape(row?.[header] ?? '')).join(','));
    });
    return lines.join('\r\n');
};

const EstimatePanel = ({ estimate }) => {
    if (!estimate) return null;
    const summary = estimate.summary || {};
    const costRange = estimate.costRange || {};
    const lineItems = Array.isArray(costRange.lineItems) ? costRange.lineItems : [];
    const assemblies = Array.isArray(estimate.takeoff?.assemblies) ? estimate.takeoff.assemblies : [];
    const assumptions = Array.isArray(estimate.assumptions?.notes) ? estimate.assumptions.notes : [];
    const bathCount = Number(summary.bathCount || 0);

    return (
        <div className="paper-panel mt-4 overflow-hidden">
            <div className="p-4 md:p-5 border-b border-black/5 bg-white/40">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                    <div>
                        <p className="mono text-[8px] uppercase tracking-[0.24em]" style={{color:'rgba(27,79,130,0.82)'}}>Cost estimate</p>
                        <p className="text-[13px] leading-relaxed mt-2" style={{color:'rgba(10,10,12,0.62)'}}>
                            Concept-level quantity takeoff and cost range generated directly from the live plan geometry.
                        </p>
                    </div>
                    <span className="mono text-[8px] uppercase tracking-[0.22em]" style={{color:'rgba(10,10,12,0.42)'}}>
                        USD • {summary.rateFamily || 'MID'} rates
                    </span>
                </div>
            </div>

            <div className="p-4 md:p-5">
                <div className="grid grid-cols-2 xl:grid-cols-5 gap-2 mb-4">
                    <div className="spec-panel" style={{gridColumn:'span 2'}}>
                        <div className="spec-label">Cost range</div>
                        <div className="spec-value" style={{fontSize:'1rem'}}>{formatUsd(costRange?.total?.low)} - {formatUsd(costRange?.total?.high)}</div>
                        <div className="mono text-[8px] uppercase mt-1" style={{color:'rgba(10,10,12,0.42)'}}>Target {formatUsd(costRange?.total?.target)}</div>
                    </div>
                    <div className="spec-panel"><div className="spec-label">Conditioned area</div><div className="spec-value">{formatQuantity(summary.conditionedAreaSqFt, 'sqft')}</div></div>
                    <div className="spec-panel"><div className="spec-label">Roof area</div><div className="spec-value">{formatQuantity(summary.estimatedRoofSurfaceAreaSqFt, 'sqft')}</div></div>
                    <div className="spec-panel"><div className="spec-label">Windows</div><div className="spec-value">{formatQuantity(summary.windowCount, 'total')}</div><div className="mono text-[8px] uppercase mt-1" style={{color:'rgba(10,10,12,0.42)'}}>{formatQuantity(summary.roughGlazingAreaSqFt, 'sqft glazing')}</div></div>
                    <div className="spec-panel"><div className="spec-label">Baths</div><div className="spec-value">{bathCount}</div></div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                    <div className="rounded-[18px] border border-black/8 overflow-hidden bg-white/72">
                        <div className="px-4 py-3 border-b border-black/6">
                            <p className="mono text-[8px] uppercase tracking-[0.22em]" style={{color:'rgba(10,10,12,0.46)'}}>Cost line items</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="mono text-[8px] uppercase tracking-[0.18em]" style={{color:'rgba(10,10,12,0.42)'}}>
                                        <th className="px-4 py-2">Item</th>
                                        <th className="px-2 py-2">Qty</th>
                                        <th className="px-2 py-2">Target</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lineItems.map((item) => (
                                        <tr key={item.key} className="border-t border-black/5 text-[11px]" style={{color:'rgba(10,10,12,0.78)'}}>
                                            <td className="px-4 py-2.5">
                                                <div className="font-medium">{item.label}</div>
                                                {item.notes && <div className="text-[10px] mt-0.5" style={{color:'rgba(10,10,12,0.46)'}}>{item.notes}</div>}
                                            </td>
                                            <td className="px-2 py-2.5">{formatQuantity(item.quantity, item.unit === 'percent' ? '%' : item.unit)}</td>
                                            <td className="px-2 py-2.5 font-medium">{formatUsd(item.target)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-[18px] border border-black/8 overflow-hidden bg-white/72">
                        <div className="px-4 py-3 border-b border-black/6">
                            <p className="mono text-[8px] uppercase tracking-[0.22em]" style={{color:'rgba(10,10,12,0.46)'}}>Quantity takeoff</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="mono text-[8px] uppercase tracking-[0.18em]" style={{color:'rgba(10,10,12,0.42)'}}>
                                        <th className="px-4 py-2">Item</th>
                                        <th className="px-2 py-2">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assemblies.map((item) => (
                                        <tr key={item.key} className="border-t border-black/5 text-[11px]" style={{color:'rgba(10,10,12,0.78)'}}>
                                            <td className="px-4 py-2.5">
                                                <div className="font-medium">{item.label}</div>
                                                {item.notes && <div className="text-[10px] mt-0.5" style={{color:'rgba(10,10,12,0.46)'}}>{item.notes}</div>}
                                            </td>
                                            <td className="px-2 py-2.5">{formatQuantity(item.quantity, item.unit)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="rounded-[18px] border border-black/8 bg-white/64 p-4 mt-4">
                    <p className="mono text-[8px] uppercase tracking-[0.22em]" style={{color:'rgba(10,10,12,0.46)'}}>Assumptions</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                        <span className="room-badge active" style={{cursor:'default'}}>Concept / cost estimate</span>
                        <span className="room-badge active" style={{cursor:'default'}}>Roof: {String(summary.roofKind || 'gabled').replace(/_/g, ' ')}</span>
                        <span className="room-badge active" style={{cursor:'default'}}>Budget: {summary.budgetTier || 'MID'}</span>
                    </div>
                    <div className="mt-3 text-[12px] leading-relaxed" style={{color:'rgba(10,10,12,0.62)'}}>
                        {assumptions.map((note) => (
                            <p key={note} className="mt-1 first:mt-0">{note}</p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const REFINEMENT_SUGGESTIONS = [
    "Make the living room 4 feet wider",
    "Make the primary bedroom bigger",
    "Expand the kitchen",
    "Make the master bathroom larger",
    "Widen the hallways",
    "Make the garage wider",
    "Expand the dining room",
];

const RefinementPanel = ({ planSpec, formData, refinementsLeft, refinementHistory, onRefine, isLoading }) => {
    const [custom, setCustom] = React.useState('');
    const historyRef = React.useRef(null);

    // Auto-scroll history to bottom when new messages arrive
    React.useEffect(() => {
        if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }, [refinementHistory]);

    if (!planSpec) return null;

    const handleCustom = (e) => {
        e.preventDefault();
        if (!custom.trim() || isLoading || refinementsLeft <= 0) return;
        onRefine(custom.trim());
        setCustom('');
    };

    const disabled = isLoading || refinementsLeft <= 0;
    const countColor = refinementsLeft > 5 ? 'var(--blue)' : refinementsLeft > 2 ? 'var(--gold)' : 'var(--red)';

    return (
        <div className="border-t border-black/8">
            <div className="flex items-center justify-between px-4 md:px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'var(--accent)',display:'inline-block'}}/>
                    <p className="mono text-[8px] uppercase tracking-[0.24em] font-bold" style={{color:'rgba(10,10,12,0.62)'}}>Studio notes</p>
                </div>
                <span className="mono text-[9px] font-bold" style={{color: countColor}}>
                    {refinementsLeft}/10 edits left
                </span>
            </div>
            <div className="px-4 md:px-5 pb-3">
                <p className="text-[12px] leading-relaxed" style={{color:'rgba(10,10,12,0.62)'}}>
                    Use quick edits to explore the floor plan before you export it or move into the Exterior Render.
                </p>
            </div>

            {refinementHistory.length > 0 && (
                <div ref={historyRef} className="mx-4 md:mx-5 mb-3 max-h-40 overflow-y-auto rounded-[14px]"
                    style={{background:'rgba(255,255,255,0.86)',border:'1px solid rgba(10,10,12,0.08)'}}>
                    {refinementHistory.map((msg, i) => (
                        <div key={i} className="px-3 py-2.5 border-b last:border-0" style={{borderColor:'rgba(10,10,12,0.06)'}}>
                            {msg.role === 'user' && (
                                <div className="flex gap-2 items-start">
                                    <span className="mono text-[7px] uppercase pt-0.5 flex-shrink-0 font-bold" style={{color:'rgba(173,51,0,0.92)'}}>You</span>
                                    <span className="text-[11px] leading-snug" style={{color:'rgba(10,10,12,0.82)'}}>{msg.content}</span>
                                </div>
                            )}
                            {msg.role === 'assistant' && (
                                <div className="flex gap-2 items-start">
                                    <span className="mono text-[7px] uppercase pt-0.5 flex-shrink-0 font-bold" style={{color:'rgba(10,10,12,0.42)'}}>Studio</span>
                                    <span className="text-[11px] leading-snug" style={{color:'rgba(27,79,130,0.92)'}}>Updated: {msg.content}</span>
                                </div>
                            )}
                            {msg.role === 'error' && (
                                <div className="flex gap-2 items-start">
                                    <span className="mono text-[7px] uppercase pt-0.5 flex-shrink-0 font-bold" style={{color:'rgba(255,133,119,0.92)'}}>Error</span>
                                    <span className="text-[11px] leading-snug" style={{color:'rgba(255,178,164,0.92)'}}>{msg.content}</span>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="px-3 py-2 flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-blue border-t-transparent rounded-full animate-spin flex-shrink-0"/>
                            <span className="mono text-[8px] uppercase tracking-widest animate-pulse" style={{color:'rgba(10,10,12,0.46)'}}>Updating the plan...</span>
                        </div>
                    )}
                </div>
            )}
            {isLoading && refinementHistory.length === 0 && (
                <div className="mx-4 md:mx-5 mb-3 px-3 py-2 flex items-center gap-2 rounded-[14px]" style={{background:'rgba(255,255,255,0.82)', border:'1px solid rgba(10,10,12,0.08)'}}>
                    <div className="w-3 h-3 border-2 border-blue border-t-transparent rounded-full animate-spin flex-shrink-0"/>
                    <span className="mono text-[8px] uppercase tracking-widest animate-pulse" style={{color:'rgba(10,10,12,0.46)'}}>Updating the plan...</span>
                </div>
            )}

            <div className="flex flex-wrap gap-1.5 px-4 md:px-5 mb-3">
                {REFINEMENT_SUGGESTIONS.map((s, i) => (
                    <button key={i} disabled={disabled} onClick={() => onRefine(s)}
                        className="text-[9px] px-2.5 py-1.5 border transition-all disabled:opacity-30 rounded-full"
                        style={{borderColor:'rgba(10,10,12,0.1)',background:'rgba(255,255,255,0.72)',color:'rgba(10,10,12,0.74)'}}>
                        {s}
                    </button>
                ))}
            </div>

            <form onSubmit={handleCustom} className="flex gap-2 px-4 md:px-5 pb-5">
                <input
                    type="text"
                    value={custom}
                    onChange={e => setCustom(e.target.value)}
                    placeholder={disabled ? 'No edits left' : 'e.g. Make the living room 6 feet wider'}
                    disabled={disabled}
                    className="flex-1 text-sm px-3 py-2 border rounded-[14px] focus:outline-none disabled:opacity-40"
                    style={{background:'rgba(255,255,255,0.92)',borderColor:'rgba(255,255,255,0.18)'}}
                />
                <button type="submit" disabled={disabled || !custom.trim()}
                    className="px-4 py-2 cta-hero cta-glow-soft text-[9px] disabled:opacity-30 whitespace-nowrap">
                    Apply
                </button>
            </form>

            {refinementsLeft === 0 && (
                <p className="mono text-[9px] font-bold uppercase px-4 md:px-5 pb-4" style={{color:'rgba(255,133,119,0.92)'}}>
                    Included edits used. Request guided access if you need a deeper session.
                </p>
            )}
        </div>
    );
};

// Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ RENDER SURVEY MODAL Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬
const buildRenderSurveyDefaults = (baseSurveyData = {}, initialData = {}) => ({
    zipCode: '',
    lotContext: '',
    contextDensity: 'Detached neighboring homes',
    topography: 'Mostly flat site',
    drivewayStyle: 'Concrete driveway',
    landscaping: 'Foundation plantings + lawn',
    surroundings: '',
    season: 'Summer',
    timeOfDay: 'Midday',
    weather: 'Clear sky',
    ...initialData,
});

const RenderSurveyModal = ({ isOpen, onClose, onSubmit, initialData, baseSurveyData }) => {
    const [data, setData] = useState(buildRenderSurveyDefaults(baseSurveyData, initialData));
    useEffect(() => {
        setData(buildRenderSurveyDefaults(baseSurveyData, initialData));
    }, [initialData, baseSurveyData, isOpen]);
    const upd = (f, v) => setData(p => ({ ...p, [f]: v }));

    const BtnRow = ({ field, options }) => (
        <div className="flex flex-wrap gap-1.5">
            {options.map(opt => {
                const val = typeof opt === 'string' ? opt : opt.val;
                const label = typeof opt === 'string' ? opt : opt.label;
                const sel = data[field] === val;
                return <button key={val} type="button" onClick={() => upd(field, val)}
                    className="px-3 py-1.5 border rounded-sm text-[10px] font-semibold transition-all"
                    style={{borderColor: sel?'var(--blue)':'rgba(0,0,0,0.1)', background: sel?'var(--ink)':'white', color: sel?'white':'var(--ink)'}}>
                    {label}
                </button>;
            })}
        </div>
    );
    const Lbl = ({children}) => <label className="mono text-[7px] uppercase tracking-widest text-mid block mb-1.5">{children}</label>;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    className="fixed inset-0 z-[150] flex items-end md:items-center justify-center bg-black/88 backdrop-blur-sm p-0 md:p-6">
                    <motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} exit={{y:40,opacity:0}}
                        transition={{type:'spring',damping:26}}
                        className="electric-border w-full md:max-w-lg rounded-t-2xl md:rounded-xl shadow-2xl relative overflow-hidden"
                        style={{
                            background:'linear-gradient(180deg, rgba(255,252,247,0.985), rgba(246,240,231,0.97))',
                            border:'1px solid rgba(10,10,12,0.08)',
                            boxShadow:'0 30px 96px rgba(9,9,9,0.36)',
                        }}>
                        <div style={{height:'3px',background:'linear-gradient(90deg,var(--blue),var(--red))'}}/>
                        <button type="button" onClick={onClose} aria-label="Close render options" className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
                            style={{
                                background:'rgba(255,255,255,0.82)',
                                color:'rgba(10,10,12,0.72)',
                                border:'1px solid rgba(10,10,12,0.08)',
                            }}>
                            <CloseIcon className="w-4 h-4"/>
                        </button>

                        <div className="p-6 overflow-y-auto" style={{maxHeight:'85vh', color:'var(--ink)'}}>
                            <span className="badge mb-3 inline-block">3D Render Options</span>
                            <h2 className="cg text-2xl italic mb-1" style={{color:'var(--ink)'}}>Customize Your Render.</h2>
                            <p className="text-[11px] mb-5 leading-relaxed" style={{color:'rgba(10,10,12,0.7)'}}>These options shape site context, lighting, landscaping, and presentation mood. The house style, roof, and massing stay grounded by your floor plan and elevation set.</p>

                            <div className="space-y-4">
                                {/* ZIP CODE */}
                                <div>
                                    <Lbl>Project ZIP Code</Lbl>
                                    <input type="text" placeholder="e.g. 78701" maxLength="10"
                                        value={data.zipCode} onChange={e => upd('zipCode', e.target.value)}
                                        style={{maxWidth:'180px'}}/>
                                    <p className="text-[9px] mt-1" style={{color:'rgba(10,10,12,0.56)'}}>Helps set regional context - climate, terrain, neighborhood character</p>
                                </div>

                                {/* LOT CONTEXT */}
                                <div>
                                    <Lbl>Lot / Site Context Override</Lbl>
                                    <BtnRow field="lotContext" options={[
                                        {val:'',                      label:'Use Plan Survey'},
                                        {val:'Suburban standard lot', label:'Suburban'},
                                        {val:'Suburban corner lot',   label:'Corner'},
                                        {val:'Urban tight lot',       label:'Urban'},
                                        {val:'Rural acreage',         label:'Rural'},
                                        {val:'View focused site',     label:'View Site'},
                                        {val:'Waterfront lot',        label:'Waterfront'},
                                    ]}/>
                                    <p className="text-[9px] mt-1" style={{color:'rgba(10,10,12,0.56)'}}>Leave on “Use Plan Survey” unless the render needs a different site framing.</p>
                                </div>

                                {/* CONTEXT DENSITY */}
                                <div>
                                    <Lbl>Neighborhood / Context</Lbl>
                                    <BtnRow field="contextDensity" options={[
                                        'Detached neighboring homes',
                                        'Close urban neighbors',
                                        'Open rural edge',
                                        'Tree-lined residential street',
                                        'View-oriented sparse context',
                                    ]}/>
                                </div>

                                {/* TOPOGRAPHY */}
                                <div>
                                    <Lbl>Topography / Site Grade</Lbl>
                                    <BtnRow field="topography" options={[
                                        'Mostly flat site',
                                        'Gentle front slope',
                                        'Gentle rear slope',
                                        'Hillside / stepped terrain',
                                    ]}/>
                                </div>

                                {/* SEASON */}
                                <div>
                                    <Lbl>Season / Vegetation</Lbl>
                                    <BtnRow field="season" options={['Spring','Summer','Fall','Winter (Snow)']}/>
                                </div>

                                {/* TIME OF DAY */}
                                <div>
                                    <Lbl>Time of Day / Lighting</Lbl>
                                    <BtnRow field="timeOfDay" options={['Sunrise','Midday','Golden Hour','Overcast','Night']}/>
                                </div>

                                {/* WEATHER */}
                                <div>
                                    <Lbl>Sky / Weather</Lbl>
                                    <BtnRow field="weather" options={[
                                        'Clear sky',
                                        'Soft clouds',
                                        'Overcast sky',
                                        'Stormy atmosphere',
                                        'Snowy air',
                                    ]}/>
                                </div>

                                {/* SURROUNDINGS */}
                                <div>
                                    <Lbl>Immediate Surroundings</Lbl>
                                    <BtnRow field="surroundings" options={[
                                        {val:'Suburban neighborhood', label:'Suburban'},
                                        {val:'Wooded edge / mature trees', label:'Wooded'},
                                        {val:'Desert arid landscape', label:'Desert'},
                                        {val:'Ocean or lake waterfront', label:'Waterfront'},
                                        {val:'Mountain or hillside backdrop', label:'Mountain'},
                                        {val:'Clean new-build street presence', label:'New Build'},
                                    ]}/>
                                </div>

                                {/* DRIVEWAY */}
                                <div>
                                    <Lbl>Driveway / Hardscape</Lbl>
                                    <BtnRow field="drivewayStyle" options={[
                                        'Concrete driveway',
                                        'Exposed aggregate concrete',
                                        'Paver driveway',
                                        'Gravel driveway',
                                        'Minimal hardscape',
                                    ]}/>
                                </div>

                                {/* LANDSCAPING */}
                                <div>
                                    <Lbl>Landscaping</Lbl>
                                    <BtnRow field="landscaping" options={[
                                        'Foundation plantings + lawn',
                                        'Native plantings',
                                        'Desert xeriscaping',
                                        'Formal hedges',
                                        'Wildflower meadow',
                                        'Minimal / gravel',
                                    ]}/>
                                </div>
                            </div>

                            <button onClick={() => onSubmit(data)}
                                className="w-full mt-6 py-3.5 bg-ink text-white mono text-[10px] uppercase tracking-[0.18em] font-bold hover:bg-blue transition-colors rounded-sm">
                                Generate Exterior Render
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const svgToPngDataUrl = (svgMarkup, options = {}) => new Promise((resolve, reject) => {
    try {
        if (!svgMarkup || typeof svgMarkup !== 'string') {
            reject(new Error('svgToPngDataUrl: missing SVG markup'));
            return;
        }

        const {
            background = '#F6F4EF',
            pixelRatio = window.devicePixelRatio && window.devicePixelRatio > 1 ? Math.min(window.devicePixelRatio, 2) : 1,
        } = options;

        let svg = svgMarkup.trim();
        if (!svg.includes('xmlns=')) {
            svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
        }

        const widthMatch = svg.match(/width=["']([\d.]+)(px)?["']/i);
        const heightMatch = svg.match(/height=["']([\d.]+)(px)?["']/i);
        const viewBoxMatch = svg.match(/viewBox=["']([\d.\s-]+)["']/i);

        let width = widthMatch ? parseFloat(widthMatch[1]) : null;
        let height = heightMatch ? parseFloat(heightMatch[1]) : null;

        if ((!width || !height) && viewBoxMatch) {
            const vb = viewBoxMatch[1].trim().split(/\s+/).map(Number);
            if (vb.length === 4) {
                if (!width) width = vb[2];
                if (!height) height = vb[3];
            }
        }

        if (!width) width = 1600;
        if (!height) height = 1000;

        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = Math.max(1, Math.round(width * pixelRatio));
                canvas.height = Math.max(1, Math.round(height * pixelRatio));
                ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                if (background) {
                    ctx.fillStyle = background;
                    ctx.fillRect(0, 0, width, height);
                } else {
                    ctx.clearRect(0, 0, width, height);
                }
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/png'));
            } catch (err) {
                reject(err);
            }
        };
        img.onerror = () => reject(new Error('svgToPngDataUrl: unable to rasterize SVG'));
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    } catch (err) {
        reject(err);
    }
});

const loadImageElement = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Unable to load reference image'));
    img.src = src;
});

const composeElevationReferenceSheet = async (elevations) => {
    const views = getElevationViews(elevations).map((view) => ({
        ...view,
        label: `${view.label.toUpperCase()} ELEVATION`,
    }));

    if (!views.length) return null;

    const rasterized = await Promise.all(
        views.map(async (view) => ({
            ...view,
            src: await svgToPngDataUrl(elevations[view.key], { background: '#F8F2E7' }),
        }))
    );
    const images = await Promise.all(
        rasterized.map(async (entry) => ({
            ...entry,
            image: await loadImageElement(entry.src),
        }))
    );

    const cols = 2;
    const rows = Math.ceil(images.length / cols);
    const cellW = 720;
    const cellH = 280;
    const gutter = 28;
    const pad = 30;
    const headerH = 54;
    const canvas = document.createElement('canvas');
    canvas.width = pad * 2 + cols * cellW + (cols - 1) * gutter;
    canvas.height = pad * 2 + headerH + rows * cellH + (rows - 1) * gutter;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f6f1e8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#d8cfbf';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

    ctx.fillStyle = '#111';
    ctx.font = '700 24px Georgia, serif';
    ctx.fillText('Keystone Elevation Reference Set', pad, pad + 22);
    ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = '#6f6558';
    ctx.fillText(`Style: ${elevations?.meta?.styleLabel || 'Residential'} | Roof: ${String(elevations?.meta?.roofKind || 'gabled').replace(/_/g, ' ')}`, pad, pad + 42);

    images.forEach((entry, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = pad + col * (cellW + gutter);
        const y = pad + headerH + row * (cellH + gutter);
        ctx.fillStyle = '#fffdf9';
        ctx.fillRect(x, y, cellW, cellH);
        ctx.strokeStyle = '#d3c9b8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, cellW, cellH);
        ctx.fillStyle = '#534b40';
        ctx.font = '700 13px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillText(entry.label, x + 14, y + 20);

        const availableW = cellW - 28;
        const availableH = cellH - 44;
        const scale = Math.min(availableW / entry.image.width, availableH / entry.image.height);
        const drawW = entry.image.width * scale;
        const drawH = entry.image.height * scale;
        const drawX = x + (cellW - drawW) / 2;
        const drawY = y + 30 + (availableH - drawH) / 2;
        ctx.drawImage(entry.image, drawX, drawY, drawW, drawH);
    });

    return canvas.toDataURL('image/png');
};

const composeBlueprintPresentationSheet = async ({ planSvg, elevations, formData, footprintInfo, renderImage }) => {
    if (!planSvg) return null;

    const planSrc = await svgToPngDataUrl(planSvg, { background: '#fffdf9', pixelRatio: 2.5 });
    const planImage = await loadImageElement(planSrc);
    const views = getElevationViews(elevations);
    const renderAsset = renderImage ? await loadImageElement(renderImage) : null;
    const elevationImages = await Promise.all(
        views.map(async (view) => ({
            ...view,
            image: await loadImageElement(await svgToPngDataUrl(elevations[view.key], { background: '#fffdf9', pixelRatio: 2 })),
        }))
    );

    const pad = 30;
    const headerH = 86;
    const gap = 22;
    const planBoxW = 1120;
    const planBoxH = 720;
    const sideW = (views.length || renderAsset) ? 392 : 0;
    const cardGap = 14;
    const cardW = sideW ? (sideW - cardGap) / 2 : 0;
    const cardH = 168;
    const renderCardH = renderAsset ? 248 : 0;
    const elevationRows = views.length ? Math.ceil(views.length / 2) : 0;
    const elevationGridH = views.length ? (elevationRows * cardH) + ((elevationRows - 1) * cardGap) : 0;
    const sideH = (renderAsset ? renderCardH : 0) + (renderAsset && views.length ? cardGap : 0) + elevationGridH;
    const contentH = Math.max(planBoxH, sideH);

    const canvas = document.createElement('canvas');
    canvas.width = pad * 2 + planBoxW + (sideW ? gap + sideW : 0);
    canvas.height = pad * 2 + headerH + contentH;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f6f1e8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#d8cfbf';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

    const area = extractPrimaryNumber(formData?.totalArea, footprintInfo?.widthFt && footprintInfo?.heightFt ? String(footprintInfo.widthFt * footprintInfo.heightFt) : '');
    const summaryBits = [
        area ? `${area} SQ FT` : null,
        formData?.bedrooms ? String(formData.bedrooms).toUpperCase() : null,
        formData?.bathrooms ? String(formData.bathrooms).toUpperCase() : null,
        formData?.frontFacing ? `${String(formData.frontFacing).toUpperCase()} FACING` : null,
    ].filter(Boolean);

    ctx.fillStyle = '#ad3300';
    ctx.font = '700 12px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText('KEYSTONE AI', pad, pad + 14);
    ctx.fillStyle = '#111';
    ctx.font = '700 28px Georgia, serif';
    ctx.fillText('Plan, Elevations + Exterior Render', pad, pad + 46);
    ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = '#6f6558';
    ctx.fillText(summaryBits.join(' | ') || 'Residential concept set', pad, pad + 70);
    ctx.textAlign = 'right';
    ctx.fillText(`${elevations?.meta?.styleLabel || formData?.materials || 'Residential'} | ${String(elevations?.meta?.roofKind || 'gabled').replace(/_/g, ' ')}`, canvas.width - pad, pad + 70);
    ctx.textAlign = 'left';

    const planX = pad;
    const planY = pad + headerH;
    ctx.fillStyle = '#fffdf9';
    ctx.fillRect(planX, planY, planBoxW, planBoxH);
    ctx.strokeStyle = '#d3c9b8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(planX, planY, planBoxW, planBoxH);
    const planScale = Math.min((planBoxW - 36) / planImage.width, (planBoxH - 36) / planImage.height);
    const drawPlanW = planImage.width * planScale;
    const drawPlanH = planImage.height * planScale;
    const drawPlanX = planX + (planBoxW - drawPlanW) / 2;
    const drawPlanY = planY + (planBoxH - drawPlanH) / 2;
    ctx.drawImage(planImage, drawPlanX, drawPlanY, drawPlanW, drawPlanH);

    if (renderAsset) {
        const renderX = pad + planBoxW + gap;
        const renderY = pad + headerH;
        ctx.fillStyle = '#fffdf9';
        ctx.fillRect(renderX, renderY, sideW, renderCardH);
        ctx.strokeStyle = '#d3c9b8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(renderX, renderY, sideW, renderCardH);
        ctx.fillStyle = '#534b40';
        ctx.font = '700 10px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillText('EXTERIOR RENDER', renderX + 10, renderY + 16);
        const availableW = sideW - 18;
        const availableH = renderCardH - 30;
        const scale = Math.min(availableW / renderAsset.width, availableH / renderAsset.height);
        const drawW = renderAsset.width * scale;
        const drawH = renderAsset.height * scale;
        const drawX = renderX + (sideW - drawW) / 2;
        const drawY = renderY + 22 + (availableH - drawH) / 2;
        ctx.drawImage(renderAsset, drawX, drawY, drawW, drawH);
    }

    const elevationsTop = pad + headerH + (renderAsset ? renderCardH + cardGap : 0);
    elevationImages.forEach((entry, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = pad + planBoxW + gap + col * (cardW + cardGap);
        const y = elevationsTop + row * (cardH + cardGap);
        ctx.fillStyle = '#fffdf9';
        ctx.fillRect(x, y, cardW, cardH);
        ctx.strokeStyle = '#d3c9b8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, cardW, cardH);
        ctx.fillStyle = '#534b40';
        ctx.font = '700 10px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillText(`${entry.label.toUpperCase()} ELEVATION`, x + 10, y + 16);
        const availableW = cardW - 16;
        const availableH = cardH - 30;
        const scale = Math.min(availableW / entry.image.width, availableH / entry.image.height);
        const drawW = entry.image.width * scale;
        const drawH = entry.image.height * scale;
        const drawX = x + (cardW - drawW) / 2;
        const drawY = y + 22 + (availableH - drawH) / 2;
        ctx.drawImage(entry.image, drawX, drawY, drawW, drawH);
    });

    return canvas.toDataURL('image/png');
};

const svgAttrNumber = (value, fallback = 0) => {
    const n = parseFloat(String(value ?? '').replace(/[^\d.+-]/g, ''));
    return Number.isFinite(n) ? n : fallback;
};

const parseSvgPathSubpaths = (d) => {
    const tokens = String(d || '').match(/[MmLlHhVvZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
    const subpaths = [];
    let i = 0;
    let x = 0, y = 0, startX = 0, startY = 0;
    let current = [];
    let command = null;

    const pushCurrent = (closed = false) => {
        if (current.length >= 2) {
            subpaths.push({ points: [...current], closed });
        }
        current = [];
    };

    const readNumber = () => {
        const value = parseFloat(tokens[i++]);
        return Number.isFinite(value) ? value : 0;
    };

    while (i < tokens.length) {
        if (/[A-Za-z]/.test(tokens[i])) {
            command = tokens[i++];
        } else if (!command) {
            break;
        }

        if (command === 'M' || command === 'm') {
            const relative = command === 'm';
            if (current.length) pushCurrent(false);
            x = relative ? x + readNumber() : readNumber();
            y = relative ? y + readNumber() : readNumber();
            startX = x; startY = y;
            current.push([x, y]);
            command = relative ? 'l' : 'L';
            while (i < tokens.length && !/[A-Za-z]/.test(tokens[i])) {
                x = command === 'l' ? x + readNumber() : readNumber();
                y = command === 'l' ? y + readNumber() : readNumber();
                current.push([x, y]);
            }
            continue;
        }

        if (command === 'L' || command === 'l') {
            const relative = command === 'l';
            while (i < tokens.length && !/[A-Za-z]/.test(tokens[i])) {
                x = relative ? x + readNumber() : readNumber();
                y = relative ? y + readNumber() : readNumber();
                current.push([x, y]);
            }
            continue;
        }

        if (command === 'H' || command === 'h') {
            const relative = command === 'h';
            while (i < tokens.length && !/[A-Za-z]/.test(tokens[i])) {
                x = relative ? x + readNumber() : readNumber();
                current.push([x, y]);
            }
            continue;
        }

        if (command === 'V' || command === 'v') {
            const relative = command === 'v';
            while (i < tokens.length && !/[A-Za-z]/.test(tokens[i])) {
                y = relative ? y + readNumber() : readNumber();
                current.push([x, y]);
            }
            continue;
        }

        if (command === 'Z' || command === 'z') {
            if (current.length && (current[0][0] !== x || current[0][1] !== y)) {
                current.push([startX, startY]);
            }
            pushCurrent(true);
            x = startX;
            y = startY;
            command = null;
            continue;
        }
    }

    if (current.length) pushCurrent(false);
    return subpaths;
};

const rotateEdgeForView = (frontEdge, viewKey) => {
    const order = ['top', 'right', 'bottom', 'left'];
    const idx = Math.max(0, order.indexOf(String(frontEdge || 'bottom')));
    const delta = viewKey === 'front' ? 0 : viewKey === 'right' ? 1 : viewKey === 'rear' ? 2 : -1;
    return order[(idx + delta + order.length) % order.length];
};

const planSpanForElevation = (planSpec, viewKey) => {
    const level1 = (planSpec?.levels || []).find(level => Number(level?.level || 1) === 1) || (planSpec?.levels || [])[0];
    if (!level1) return 30;
    const frontEdge = planSpec?.elevations?.meta?.frontEdge || planSpec?.facade?.frontEdge || 'bottom';
    const edge = rotateEdgeForView(frontEdge, viewKey);
    return edge === 'top' || edge === 'bottom'
        ? Number(level1.width || 30)
        : Number(level1.height || 24);
};

const buildPresentationDxf = (planSpec) => {
    // Keep DXF in feet and prefer broad-reader compatibility.
    const SCALE = 1;
    const DXF_VERSION = 'AC1015';
    const DXF_INCLUDE_LINEWEIGHT_CODES = true;
    const DXF_INCLUDE_OBJECTS_SECTION = true;
    const entities = [];

    // Professional A-prefix layer table.
    const layerStyles = {
        'A-WALL':       { name: 'A-WALL',       color: 7, lineweight: 50 },
        'A-WALL-INT':   { name: 'A-WALL-INT',   color: 8, lineweight: 25 },
        'A-FLOR-PATT':  { name: 'A-FLOR-PATT',  color: 8, lineweight: 9 },
        'A-DOOR':       { name: 'A-DOOR',       color: 1, lineweight: 18 },
        'A-WINDOW':     { name: 'A-WINDOW',     color: 5, lineweight: 18 },
        'A-ROOM-LABEL': { name: 'A-ROOM-LABEL', color: 2, lineweight: 13 },
        'A-FURN':       { name: 'A-FURN',       color: 6, lineweight: 13 },
        'A-DIM':        { name: 'A-DIM',        color: 4, lineweight: 13 },
        'A-ELEV':       { name: 'A-ELEV',       color: 3, lineweight: 25 },
        'A-ELEV-TEXT':  { name: 'A-ELEV-TEXT',  color: 2, lineweight: 13 },
        'A-SHEET':      { name: 'A-SHEET',      color: 8, lineweight: 18 },
        'A-TITLE':      { name: 'A-TITLE',      color: 7, lineweight: 35 },
        'A-NORTH':      { name: 'A-NORTH',      color: 3, lineweight: 18 },
        'A-SCHEDULE':   { name: 'A-SCHEDULE',   color: 2, lineweight: 13 },
    };

    const push = (s) => entities.push(s);
    const finite = (...values) => values.every(v => Number.isFinite(v));
    const safeText = (value) => String(value || '').replace(/\n/g, ' ').replace(/[^\x20-\x7E]/g, '').trim();
    const styleForLayer = (layer) => layerStyles[layer] || { name: String(layer || '0'), color: 7, lineweight: 18 };

    // Layer attributes for entities (color only — lineweights live in LAYER table)
    const dxfLayerAttrs = (layer) => {
        const style = styleForLayer(layer);
        return `8\n${style.name}\n62\n${style.color}`;
    };

    const drawLine = (x1, y1, x2, y2, layer) => {
        if (!finite(x1, y1, x2, y2)) return;
        push(`0\nLINE\n${dxfLayerAttrs(layer)}\n10\n${x1*SCALE}\n20\n${y1*SCALE}\n30\n0\n11\n${x2*SCALE}\n21\n${y2*SCALE}\n31\n0`);
    };
    const drawRect = (x, y, w, h, layer) => {
        if (!finite(x, y, w, h) || w <= 0 || h <= 0) return;
        drawLine(x, y, x + w, y, layer);
        drawLine(x + w, y, x + w, y + h, layer);
        drawLine(x + w, y + h, x, y + h, layer);
        drawLine(x, y + h, x, y, layer);
    };
    const drawCircle = (cx, cy, r, layer) => {
        if (!finite(cx, cy, r) || r <= 0) return;
        push(`0\nCIRCLE\n${dxfLayerAttrs(layer)}\n10\n${cx*SCALE}\n20\n${cy*SCALE}\n30\n0\n40\n${r*SCALE}`);
    };
    const drawArc = (cx, cy, r, startAngle, endAngle, layer) => {
        if (!finite(cx, cy, r, startAngle, endAngle) || r <= 0) return;
        push(`0\nARC\n${dxfLayerAttrs(layer)}\n10\n${cx*SCALE}\n20\n${cy*SCALE}\n30\n0\n40\n${r*SCALE}\n50\n${startAngle}\n51\n${endAngle}`);
    };
    const drawPolyline = (points, layer, closed = false) => {
        if (!Array.isArray(points) || points.length < 2) return;
        const safe = points.filter(([x, y]) => finite(x, y));
        if (safe.length < 2) return;
        for (let i = 0; i < safe.length - 1; i++) {
            drawLine(safe[i][0], safe[i][1], safe[i + 1][0], safe[i + 1][1], layer);
        }
        if (closed) drawLine(safe[safe.length - 1][0], safe[safe.length - 1][1], safe[0][0], safe[0][1], layer);
    };
    const drawText = (x, y, h, text, layer, align = 'left') => {
        const safe = safeText(text);
        if (!safe || !finite(x, y, h) || h <= 0) return;
        const justification = align === 'center' ? 1 : align === 'right' ? 2 : 0;
        push(`0\nTEXT\n${dxfLayerAttrs(layer)}\n10\n${x*SCALE}\n20\n${y*SCALE}\n30\n0\n40\n${h*SCALE}\n1\n${safe}\n7\nSTANDARD\n72\n${justification}\n73\n0\n11\n${x*SCALE}\n21\n${y*SCALE}\n31\n0`);
    };

    // Double-line wall: draws two parallel lines offset ±thickness/2 from the centerline segment
    const drawDoubleLineWall = (x1, y1, x2, y2, thickness, layer) => {
        if (!finite(x1, y1, x2, y2, thickness) || thickness <= 0) return;
        const half = thickness / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 0.01) return;
        // Perpendicular offset unit vector
        const ox = (-dy / len) * half;
        const oy = (dx / len) * half;
        drawLine(x1 + ox, y1 + oy, x2 + ox, y2 + oy, layer);
        drawLine(x1 - ox, y1 - oy, x2 - ox, y2 - oy, layer);
    };

    const drawDimH = (x1, x2, baseY, offset, label) => {
        const y = baseY + offset;
        drawLine(x1, baseY, x1, y, 'A-DIM');
        drawLine(x2, baseY, x2, y, 'A-DIM');
        drawLine(x1, y, x2, y, 'A-DIM');
        drawLine(x1, y - 0.3, x1 + 0.35, y + 0.35, 'A-DIM');
        drawLine(x1, y + 0.3, x1 + 0.35, y - 0.35, 'A-DIM');
        drawLine(x2, y - 0.3, x2 - 0.35, y + 0.35, 'A-DIM');
        drawLine(x2, y + 0.3, x2 - 0.35, y - 0.35, 'A-DIM');
        drawText((x1 + x2) / 2, y + 0.55, 0.75, label, 'A-DIM', 'center');
    };
    const drawDimV = (y1, y2, baseX, offset, label) => {
        const x = baseX - offset;
        drawLine(baseX, y1, x, y1, 'A-DIM');
        drawLine(baseX, y2, x, y2, 'A-DIM');
        drawLine(x, y1, x, y2, 'A-DIM');
        drawLine(x - 0.3, y1, x + 0.3, y1 + 0.35, 'A-DIM');
        drawLine(x + 0.3, y1, x - 0.3, y1 + 0.35, 'A-DIM');
        drawLine(x - 0.3, y2, x + 0.3, y2 - 0.35, 'A-DIM');
        drawLine(x + 0.3, y2, x - 0.3, y2 - 0.35, 'A-DIM');
        drawText(x - 0.55, (y1 + y2) / 2, 0.75, label, 'A-DIM', 'right');
    };
    const drawSheetFrame = (x, y, w, h) => {
        drawRect(x, y, w, h, 'A-SHEET');
        drawRect(x + 0.8, y + 0.8, w - 1.6, h - 1.6, 'A-SHEET');
    };

    // North arrow: circle + N text + triangle pointing north
    const drawNorthArrow = (cx, cy, radius) => {
        drawCircle(cx, cy, radius, 'A-NORTH');
        // Triangle pointing up (north): tip at top, base at bottom of circle
        const tipX = cx, tipY = cy + radius * 0.85;
        const baseLeft = cx - radius * 0.4, baseRight = cx + radius * 0.4, baseY = cy - radius * 0.55;
        drawPolyline([[tipX, tipY], [baseLeft, baseY], [baseRight, baseY], [tipX, tipY]], 'A-NORTH', true);
        // Vertical stem
        drawLine(cx, cy + radius * 0.85, cx, cy - radius * 0.85, 'A-NORTH');
        // N label above circle
        drawText(cx - radius * 0.2, cy + radius + 0.3, radius * 0.7, 'N', 'A-NORTH', 'center');
    };

    // Keystone AI logo mark: stylized roof peak chevron
    const drawKeystoneLogoMark = (originX, originY) => {
        // Chevron roof peak: (0,0) -> (1.5,2) -> (3,0) relative to origin
        drawLine(originX,       originY,       originX + 1.5, originY + 2,   'A-TITLE');
        drawLine(originX + 1.5, originY + 2,   originX + 3,   originY,       'A-TITLE');
        // Baseline
        drawLine(originX,       originY,       originX + 3,   originY,       'A-TITLE');
        // Small vertical below peak
        drawLine(originX + 1.5, originY,       originX + 1.5, originY - 0.5, 'A-TITLE');
    };

    // Enhanced title block with logo mark, project fields, scale, drawing number
    const drawTitleBlock = (x, y, w, h) => {
        // Outer border
        drawRect(x, y, w, h, 'A-TITLE');
        // Horizontal divider: top band for logo + title
        drawLine(x, y + h - 4.5, x + w, y + h - 4.5, 'A-SHEET');
        // Vertical divider separating left (brand) from right (project data)
        drawLine(x + w * 0.5, y, x + w * 0.5, y + h - 4.5, 'A-SHEET');

        // Logo mark in top-left of title band
        drawKeystoneLogoMark(x + 1.0, y + h - 3.8);

        // Company name + subtitle
        drawText(x + 5.5, y + h - 3.2, 1.1,  'KEYSTONE AI',              'A-TITLE',      'left');
        drawText(x + 5.5, y + h - 1.9, 0.65, 'RESIDENTIAL CONCEPT PLAN', 'A-ROOM-LABEL', 'left');
        drawText(x + 5.5, y + h - 0.9, 0.5,  `Generated ${new Date().toISOString().slice(0, 10)}`, 'A-ROOM-LABEL', 'left');

        // Right column: project metadata
        const rx = x + w * 0.5 + 0.8;
        const styleLabel = String(planSpec?.elevations?.meta?.styleLabel || 'Residential').toUpperCase();
        const frontFacing = String(planSpec?.surveyData?.frontFacing || 'South').toUpperCase();
        const totalArea = (planSpec?.levels || []).reduce((sum, lv) => {
            return sum + (lv.rooms || []).reduce((s, r) => {
                const parts = Array.isArray(r.parts) && r.parts.length ? r.parts : [r];
                return s + parts.reduce((ps, p) => ps + (Number(p.w || 0) * Number(p.h || 0)), 0);
            }, 0);
        }, 0);
        drawText(rx, y + h - 4.1, 0.65, `STYLE: ${styleLabel}`,            'A-ROOM-LABEL', 'left');
        drawText(rx, y + h - 3.2, 0.65, `FRONT: ${frontFacing}`,           'A-ROOM-LABEL', 'left');
        drawText(rx, y + h - 2.3, 0.65, `AREA:  ${Math.round(totalArea)} SQFT`, 'A-ROOM-LABEL', 'left');
        drawText(rx, y + h - 1.4, 0.55, 'SCALE: NTS',                      'A-ROOM-LABEL', 'left');
        drawText(rx, y + h - 0.7, 0.55, 'DRG: KS-2026',                    'A-ROOM-LABEL', 'left');
    };

    // Finish class lookup for room schedule
    const finishClassForDxf = (type) => {
        const t = String(type || '').toLowerCase();
        if (/bedroom|primary_bedroom|child|sleep/.test(t)) return 'CARPET';
        if (/living|dining|loft|library|study|gym|family|great_room/.test(t)) return 'HARDWOOD';
        if (/bathroom|kitchen|laundry|mudroom|powder/.test(t)) return 'TILE';
        if (/garage/.test(t)) return 'CONCRETE';
        return 'HARDWOOD';
    };

    // Room schedule table: header + one row per room + footer
    const drawRoomSchedule = (spec, x, y, w) => {
        const rowH = 0.9;
        const colWidths = [w * 0.07, w * 0.30, w * 0.13, w * 0.22, w * 0.28];
        const headers = ['NO.', 'ROOM', 'LEVEL', 'AREA (SQFT)', 'FINISH CLASS'];
        const tileSizeFt = spec?.tileSizeFt || 2;

        // Title
        drawText(x, y + 1.2, 0.7, 'ROOM SCHEDULE', 'A-SCHEDULE', 'left');

        let curY = y;
        // Draw a horizontal line above header
        drawLine(x, curY, x + w, curY, 'A-SCHEDULE');
        curY -= rowH;

        // Header row
        let colX = x;
        headers.forEach((h, i) => {
            drawText(colX + 0.15, curY + 0.25, 0.45, h, 'A-SCHEDULE', 'left');
            colX += colWidths[i];
        });
        drawLine(x, curY, x + w, curY, 'A-SCHEDULE');
        curY -= rowH;

        // Data rows
        let rowNum = 1;
        let totalConditioned = 0;
        let totalGarage = 0;
        (spec?.levels || []).forEach((lv) => {
            (lv.rooms || []).forEach((room) => {
                const parts = Array.isArray(room.parts) && room.parts.length ? room.parts : [room];
                const areaTiles = parts.reduce((s, p) => s + (Number(p.w || 0) * Number(p.h || 0)), 0);
                const areaSqft = Math.round(areaTiles * (tileSizeFt * tileSizeFt));
                const label = String(room.label || room.type || '').toUpperCase().replace(/_/g, ' ');
                const finish = finishClassForDxf(room.type);
                const isGarage = /garage/i.test(String(room.type || ''));
                if (isGarage) totalGarage += areaSqft;
                else totalConditioned += areaSqft;

                const cells = [String(rowNum), label, `L${lv.level || 1}`, `${areaSqft}`, finish];
                colX = x;
                cells.forEach((cell, i) => {
                    drawText(colX + 0.15, curY + 0.22, 0.4, cell, 'A-SCHEDULE', 'left');
                    colX += colWidths[i];
                });
                drawLine(x, curY, x + w, curY, 'A-SCHEDULE');
                curY -= rowH;
                rowNum++;
            });
        });

        // Footer totals
        drawLine(x, curY + rowH, x + w, curY + rowH, 'A-SCHEDULE');
        drawText(x + 0.15, curY - rowH + 0.6, 0.42, `TOTAL CONDITIONED: ${totalConditioned} SQFT`, 'A-SCHEDULE', 'left');
        drawText(x + 0.15, curY - rowH * 2 + 0.6, 0.42, `GARAGE: ${totalGarage} SQFT`, 'A-SCHEDULE', 'left');

        // Vertical column separators
        let sepX = x;
        for (let i = 0; i < colWidths.length - 1; i++) {
            sepX += colWidths[i];
            drawLine(sepX, y, sepX, curY - rowH * 2, 'A-SCHEDULE');
        }
        // Left + right borders
        drawLine(x, y, x, curY - rowH * 2, 'A-SCHEDULE');
        drawLine(x + w, y, x + w, curY - rowH * 2, 'A-SCHEDULE');
    };

    const roomParts = (room) => Array.isArray(room?.parts) && room.parts.length ? room.parts : [room];
    const largestPart = (room) => roomParts(room).reduce((best, part) => (
        ((part.w || 0) * (part.h || 0)) > ((best.w || 0) * (best.h || 0)) ? part : best
    ), roomParts(room)[0] || room || {});
    const roomArea = (room) => roomParts(room).reduce((sum, part) => sum + (Number(part.w || 0) * Number(part.h || 0)), 0);

    const collectExteriorBreaks = (level, axis) => {
        const max = axis === 'x' ? Number(level.width || 0) : Number(level.height || 0);
        const values = new Set([0, max]);
        (level.rooms || []).forEach((room) => {
            roomParts(room).forEach((part) => {
                const x = Number(part.x || 0), y = Number(part.y || 0), w = Number(part.w || 0), h = Number(part.h || 0);
                if (axis === 'x') {
                    if (y === 0 || y + h === Number(level.height || 0)) {
                        values.add(x);
                        values.add(x + w);
                    }
                } else if (x === 0 || x + w === Number(level.width || 0)) {
                    values.add(y);
                    values.add(y + h);
                }
            });
        });
        return [...values].sort((a, b) => a - b).filter((value, index, arr) => index === 0 || Math.abs(value - arr[index - 1]) > 0.1);
    };

    const roundWallCoord = (value) => Math.round((Number(value) || 0) * 1000) / 1000;
    const wallSegmentKey = (axis, coord) => `${axis}:${roundWallCoord(coord)}`;

    const classifyWallSegments = (level, originX, originY) => {
        const lvlH = Number(level.height || 0);
        const mapY = (y, h = 0) => originY + (lvlH - y - h);
        const groups = new Map();

        const addSegment = (axis, coord, a, b, roomKey) => {
            const start = roundWallCoord(Math.min(a, b));
            const end = roundWallCoord(Math.max(a, b));
            if (!finite(start, end) || end - start < 0.05) return;
            const key = wallSegmentKey(axis, coord);
            let group = groups.get(key);
            if (!group) {
                group = {
                    axis,
                    coord: roundWallCoord(coord),
                    spans: [],
                    breaks: new Set(),
                };
                groups.set(key, group);
            }
            group.spans.push({ start, end, roomKey: String(roomKey || '') });
            group.breaks.add(start);
            group.breaks.add(end);
        };

        (level.rooms || []).forEach((room, roomIndex) => {
            const roomKey = String(room?.id || room?.label || room?.type || `room_${roomIndex}`);
            roomParts(room).forEach((part) => {
                const px = Number(part.x || 0);
                const py = Number(part.y || 0);
                const pw = Number(part.w || 0);
                const ph = Number(part.h || 0);
                if (!finite(px, py, pw, ph) || pw <= 0 || ph <= 0) return;

                const rx = originX + px;
                const ry = mapY(py, ph);
                const rx2 = rx + pw;
                const ry2 = ry + ph;

                addSegment('h', ry, rx, rx2, roomKey);
                addSegment('h', ry2, rx, rx2, roomKey);
                addSegment('v', rx, ry, ry2, roomKey);
                addSegment('v', rx2, ry, ry2, roomKey);
            });
        });

        const out = [];
        groups.forEach((group) => {
            const sortedBreaks = [...group.breaks].sort((a, b) => a - b);
            for (let i = 0; i < sortedBreaks.length - 1; i++) {
                const a = sortedBreaks[i];
                const b = sortedBreaks[i + 1];
                if (b - a < 0.05) continue;
                const mid = (a + b) / 2;
                const covering = group.spans.filter((span) => mid >= span.start - 0.001 && mid <= span.end + 0.001);
                if (!covering.length) continue;
                const roomKeys = new Set(covering.map((span) => span.roomKey).filter(Boolean));
                if (!roomKeys.size) continue;

                // Skip seams created by multi-part decomposition of a single room.
                if (roomKeys.size === 1 && covering.length > 1) continue;

                const type = roomKeys.size > 1 ? 'interior' : 'exterior';
                if (group.axis === 'h') {
                    out.push({ x1: a, y1: group.coord, x2: b, y2: group.coord, type });
                } else {
                    out.push({ x1: group.coord, y1: a, x2: group.coord, y2: b, type });
                }
            }
        });
        return out;
    };

    const drawHatchInRect = (x, y, w, h, pattern) => {
        if (!finite(x, y, w, h) || w <= 0.25 || h <= 0.25) return;
        const left = x;
        const right = x + w;
        const bottom = y;
        const top = y + h;
        const maxMarks = 240;

        if (pattern === 'TILE') {
            const spacing = 2.0;
            let marks = 0;
            for (let xx = left + spacing; xx < right && marks < maxMarks; xx += spacing, marks++) {
                drawLine(xx, bottom, xx, top, 'A-FLOR-PATT');
            }
            for (let yy = bottom + spacing; yy < top && marks < maxMarks * 2; yy += spacing, marks++) {
                drawLine(left, yy, right, yy, 'A-FLOR-PATT');
            }
            return;
        }

        if (pattern === 'CARPET' || pattern === 'CONCRETE') {
            const spacing = pattern === 'CARPET' ? 1.4 : 2.6;
            const radius = pattern === 'CARPET' ? 0.045 : 0.035;
            let marks = 0;
            for (let yy = bottom + spacing / 2; yy < top && marks < maxMarks; yy += spacing) {
                for (let xx = left + spacing / 2; xx < right && marks < maxMarks; xx += spacing, marks++) {
                    drawCircle(xx, yy, radius, 'A-FLOR-PATT');
                }
            }
            return;
        }

        // HARDWOOD default: diagonal plank-like strokes
        const spacing = 1.2;
        let marks = 0;
        for (let offset = -h; offset <= w && marks < maxMarks; offset += spacing, marks++) {
            const x1 = left + Math.max(0, offset);
            const y1 = bottom + Math.max(0, -offset);
            const x2 = left + Math.min(w, offset + h);
            const y2 = bottom + Math.min(h, h + offset);
            if (finite(x1, y1, x2, y2) && (Math.abs(x2 - x1) > 0.05 || Math.abs(y2 - y1) > 0.05)) {
                drawLine(x1, y1, x2, y2, 'A-FLOR-PATT');
            }
        }
    };

    const drawFurnitureItem = (item, level, originX, originY) => {
        const lvlH = Number(level.height || 0);
        const fx = originX + Number(item.x || 0);
        const fy = originY + (lvlH - Number(item.y || 0) - Number(item.h || 0));
        const fw = Number(item.w || 0);
        const fh = Number(item.h || 0);
        if (!fw || !fh) return;
        drawRect(fx, fy, fw, fh, 'A-FURN');
        const kind = String(item.kind || '').toLowerCase();
        if (kind.includes('bed')) {
            drawLine(fx, fy + fh - 0.8, fx + fw, fy + fh - 0.8, 'A-FURN');
            drawRect(fx + 0.35, fy + fh - 1.35, Math.min(1.35, fw / 2 - 0.45), 0.55, 'A-FURN');
            drawRect(fx + fw - Math.min(1.35, fw / 2 - 0.45) - 0.35, fy + fh - 1.35, Math.min(1.35, fw / 2 - 0.45), 0.55, 'A-FURN');
        } else if (kind === 'shower') {
            drawLine(fx, fy, fx + fw, fy + fh, 'A-FURN');
            drawLine(fx + fw, fy, fx, fy + fh, 'A-FURN');
        } else if (kind === 'washer' || kind === 'dryer') {
            drawCircle(fx + fw / 2, fy + fh / 2, Math.min(fw, fh) * 0.22, 'A-FURN');
        } else if (kind === 'dining_table') {
            drawCircle(fx + fw / 2, fy + fh / 2, Math.min(fw, fh) * 0.35, 'A-FURN');
        } else if (kind === 'sofa') {
            drawLine(fx + 0.4, fy + 0.55, fx + fw - 0.4, fy + 0.55, 'A-FURN');
            drawLine(fx + 0.4, fy + fh - 0.55, fx + fw - 0.4, fy + fh - 0.55, 'A-FURN');
        } else if (kind === 'coffee_table' || kind === 'console' || kind === 'dresser' || kind === 'laundry_counter' || kind === 'desk') {
            drawLine(fx, fy + fh / 2, fx + fw, fy + fh / 2, 'A-FURN');
        } else if (kind === 'bookcase' || kind === 'counter') {
            const step = Math.max(0.5, fw > fh ? fh / 4 : fw / 4);
            if (fw >= fh) {
                for (let y = fy + step; y < fy + fh; y += step) drawLine(fx, y, fx + fw, y, 'A-FURN');
            } else {
                for (let x = fx + step; x < fx + fw; x += step) drawLine(x, fy, x, fy + fh, 'A-FURN');
            }
        } else if (kind === 'vanity') {
            drawCircle(fx + fw * 0.28, fy + fh * 0.5, Math.min(fw, fh) * 0.12, 'A-FURN');
        } else if (kind === 'tub') {
            drawRect(fx + 0.25, fy + 0.25, Math.max(0.8, fw - 0.5), Math.max(0.8, fh - 0.5), 'A-FURN');
        }
    };

    const drawDoorSymbol = (door, level, originX, originY) => {
        const lvlH = Number(level.height || 0);
        const dw = Number(door.width || door.doorWidth || (door.garageDoor ? 9 : 3));
        const mapY = (y) => originY + (lvlH - y);
        const dx = originX + Number(door.x || 0);
        const dy = mapY(Number(door.y || 0));

        if (door.garageDoor) {
            if (door.dir === 'horizontal') {
                const left = dx - dw / 2;
                const top = dy + 0.35;
                drawLine(left, top, left + dw, top, 'A-DOOR');
                const panelWidth = dw / Math.max(3, Math.round(dw / 2.5));
                for (let px = left + panelWidth; px < left + dw - 0.1; px += panelWidth) {
                    drawLine(px, top, px, top - 0.9, 'A-DOOR');
                }
                drawLine(left, top, left + 0.9, top - 0.9, 'A-DOOR');
                drawLine(left + dw, top, left + dw - 0.9, top - 0.9, 'A-DOOR');
            } else {
                const bottom = dy - dw / 2;
                drawLine(dx + 0.35, bottom, dx + 0.35, bottom + dw, 'A-DOOR');
                const panelHeight = dw / Math.max(3, Math.round(dw / 2.5));
                for (let py = bottom + panelHeight; py < bottom + dw - 0.1; py += panelHeight) {
                    drawLine(dx + 0.35, py, dx - 0.55, py, 'A-DOOR');
                }
                drawLine(dx + 0.35, bottom, dx - 0.55, bottom + 0.9, 'A-DOOR');
                drawLine(dx + 0.35, bottom + dw, dx - 0.55, bottom + dw - 0.9, 'A-DOOR');
            }
            return;
        }

        if (door.openThreshold) {
            const gapHalf = dw / 2;
            if (door.dir === 'horizontal') {
                drawLine(dx - gapHalf, dy, dx + gapHalf, dy, 'A-DOOR');
            } else {
                drawLine(dx, dy - gapHalf, dx, dy + gapHalf, 'A-DOOR');
            }
            return;
        }

        const rooms = level.rooms || [];
        const roomA = rooms.find(room => String(room.id) === String(door.a));
        const roomB = rooms.find(room => String(room.id) === String(door.b));
        const isPrivate = (room) => /bedroom|bathroom|study|office|garage|library|gym/i.test(String(room?.type || ''));
        const preferIntoA = isPrivate(roomA) && !isPrivate(roomB);
        const preferIntoB = isPrivate(roomB) && !isPrivate(roomA);

        if (door.dir === 'vertical') {
            const yTop = dy + dw / 2;
            const yBottom = dy - dw / 2;
            const centerA = roomA ? Number(roomA.x || 0) + Number(roomA.w || 0) / 2 : 0;
            const centerB = roomB ? Number(roomB.x || 0) + Number(roomB.w || 0) / 2 : 0;
            const swingRight = preferIntoB ? centerB > Number(door.x || 0) : preferIntoA ? centerA > Number(door.x || 0) : centerB >= centerA;
            const hingeX = dx;
            const hingeY = yTop;
            const leafX = swingRight ? dx + dw : dx - dw;
            drawLine(hingeX, hingeY, leafX, hingeY, 'A-DOOR');
            if (swingRight) drawArc(hingeX, hingeY, dw, 270, 360, 'A-DOOR');
            else drawArc(hingeX, hingeY, dw, 180, 270, 'A-DOOR');
            drawLine(dx, yTop, dx, yBottom, 'A-DOOR');
            return;
        }

        const xLeft = dx - dw / 2;
        const centerA = roomA ? Number(roomA.y || 0) + Number(roomA.h || 0) / 2 : 0;
        const centerB = roomB ? Number(roomB.y || 0) + Number(roomB.h || 0) / 2 : 0;
        const swingDown = preferIntoB ? centerB < Number(door.y || 0) : preferIntoA ? centerA < Number(door.y || 0) : centerB <= centerA;
        const hingeX = xLeft;
        const hingeY = dy;
        const leafY = swingDown ? dy - dw : dy + dw;
        drawLine(hingeX, hingeY, hingeX, leafY, 'A-DOOR');
        if (swingDown) drawArc(hingeX, hingeY, dw, 270, 360, 'A-DOOR');
        else drawArc(hingeX, hingeY, dw, 0, 90, 'A-DOOR');
        drawLine(dx - dw / 2, dy, dx + dw / 2, dy, 'A-DOOR');
    };

    const drawWindowSymbol = (win, level, originX, originY) => {
        const lvlH = Number(level.height || 0);
        const ww = Number(win.width || win.windowWidth || 4);
        const mapY = (y) => originY + (lvlH - y);
        const wx = originX + Number(win.x || 0);
        const wy = mapY(Number(win.y || 0));
        if (win.dir === 'horizontal') {
            drawLine(wx - ww / 2, wy - 0.18, wx + ww / 2, wy - 0.18, 'A-WINDOW');
            drawLine(wx - ww / 2, wy + 0.18, wx + ww / 2, wy + 0.18, 'A-WINDOW');
        } else {
            drawLine(wx - 0.18, wy - ww / 2, wx - 0.18, wy + ww / 2, 'A-WINDOW');
            drawLine(wx + 0.18, wy - ww / 2, wx + 0.18, wy + ww / 2, 'A-WINDOW');
        }
    };

    const drawPlanLevel = (level, originX, originY) => {
        const lvlW = Number(level.width || 40);
        const lvlH = Number(level.height || 30);
        const mapY = (y, h = 0) => originY + (lvlH - y - h);
        const titleY = originY + lvlH + 7.5;

        drawText(originX, titleY, 1.35, `LEVEL ${level.level}`, 'A-ROOM-LABEL');
        drawText(originX, titleY - 1.2, 0.8, `${Math.round((lvlW * lvlH)).toLocaleString()} SQ FT`, 'A-ROOM-LABEL');

        // Room hatches first so walls/symbols remain legible above them.
        (level.rooms || []).forEach((room) => {
            const finishClass = finishClassForDxf(room.type);
            roomParts(room).forEach((part) => {
                const px = Number(part.x || 0);
                const py = Number(part.y || 0);
                const pw = Number(part.w || 0);
                const ph = Number(part.h || 0);
                if (!finite(px, py, pw, ph) || pw <= 0 || ph <= 0) return;
                const rx = originX + px;
                const ry = mapY(py, ph);
                drawHatchInRect(rx, ry, pw, ph, finishClass);
            });
        });

        // Shared-wall extraction: draw each centerline segment once.
        const EXT_THICK = 0.5;
        const INT_THICK = 0.33;
        const wallSegments = classifyWallSegments(level, originX, originY);
        wallSegments.forEach((segment) => {
            const exterior = segment.type === 'exterior';
            drawDoubleLineWall(
                segment.x1,
                segment.y1,
                segment.x2,
                segment.y2,
                exterior ? EXT_THICK : INT_THICK,
                exterior ? 'A-WALL' : 'A-WALL-INT'
            );
        });

        (level.rooms || []).forEach((room) => {
            const anchor = largestPart(room);
            const label = String(room.label || room.type || '').toUpperCase().replace(/_/g, ' ');
            drawText(originX + Number(anchor.x || 0) + Number(anchor.w || 0) / 2, mapY(Number(anchor.y || 0), Number(anchor.h || 0)) + Number(anchor.h || 0) / 2 + 0.4, 0.6, label, 'A-ROOM-LABEL', 'center');
            drawText(originX + Number(anchor.x || 0) + Number(anchor.w || 0) / 2, mapY(Number(anchor.y || 0), Number(anchor.h || 0)) + Number(anchor.h || 0) / 2 - 0.5, 0.45, `${Math.round(roomArea(room))} sqft`, 'A-ROOM-LABEL', 'center');
        });

        (level.doors || []).forEach((door) => drawDoorSymbol(door, level, originX, originY));
        (level.windows || []).forEach((win) => drawWindowSymbol(win, level, originX, originY));
        (level.furniture || []).forEach((item) => drawFurnitureItem(item, level, originX, originY));

        drawDimH(originX, originX + lvlW, originY + lvlH, 3.2, `${lvlW.toFixed(0)}'`);
        drawDimV(originY, originY + lvlH, originX, 3.2, `${lvlH.toFixed(0)}'`);

        const xBreaks = collectExteriorBreaks(level, 'x');
        const yBreaks = collectExteriorBreaks(level, 'y');
        if (xBreaks.length > 2 && xBreaks.length <= 9) {
            for (let i = 0; i < xBreaks.length - 1; i++) {
                const a = xBreaks[i], b = xBreaks[i + 1];
                if (b - a < 1) continue;
                drawDimH(originX + a, originX + b, originY + lvlH, 1.55, `${(b - a).toFixed(0)}'`);
            }
        }
        if (yBreaks.length > 2 && yBreaks.length <= 9) {
            for (let i = 0; i < yBreaks.length - 1; i++) {
                const a = yBreaks[i], b = yBreaks[i + 1];
                if (b - a < 1) continue;
                drawDimV(originY + lvlH - b, originY + lvlH - a, originX, 1.55, `${(b - a).toFixed(0)}'`);
            }
        }

        return { width: lvlW, height: lvlH };
    };

    const drawElevationSvg = (svgMarkup, label, originX, originY, targetWidthFt, dimensionLabel) => {
        if (!svgMarkup || typeof DOMParser === 'undefined') return { width: targetWidthFt, height: 0 };
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
        const root = doc.documentElement;
        const viewBox = String(root.getAttribute('viewBox') || '').trim().split(/\s+/).map(Number);
        const vbX = viewBox.length === 4 ? viewBox[0] : 0;
        const vbY = viewBox.length === 4 ? viewBox[1] : 0;
        const vbW = viewBox.length === 4 ? viewBox[2] : svgAttrNumber(root.getAttribute('width'), 940);
        const vbH = viewBox.length === 4 ? viewBox[3] : svgAttrNumber(root.getAttribute('height'), 480);
        const scale = targetWidthFt / Math.max(1, vbW);
        const mapX = (x) => originX + (x - vbX) * scale;
        const mapY = (y, h = 0) => originY + (vbH - (y - vbY) - h) * scale;
        const elevationHeight = vbH * scale;

        drawText(originX, originY + elevationHeight + 3.2, 0.95, label, 'A-ELEV-TEXT');
        if (dimensionLabel) drawDimH(originX, originX + targetWidthFt, originY, -2.4, dimensionLabel);

        root.querySelectorAll('line,rect,circle,path,text,polygon,polyline').forEach((node) => {
            const tag = node.tagName.toLowerCase();
            const stroke = node.getAttribute('stroke');
            const fill = node.getAttribute('fill');

            if (tag === 'rect') {
                const x = svgAttrNumber(node.getAttribute('x'));
                const y = svgAttrNumber(node.getAttribute('y'));
                const w = svgAttrNumber(node.getAttribute('width'));
                const h = svgAttrNumber(node.getAttribute('height'));
                if (!w || !h) return;
                const fullBg = w >= vbW * 0.98 && h >= vbH * 0.98 && !stroke;
                if (fullBg) return;
                if (!stroke && (!fill || fill === 'none')) return;
                drawRect(mapX(x), mapY(y, h), w * scale, h * scale, 'A-ELEV');
                return;
            }

            if (tag === 'line') {
                const x1 = svgAttrNumber(node.getAttribute('x1'));
                const y1 = svgAttrNumber(node.getAttribute('y1'));
                const x2 = svgAttrNumber(node.getAttribute('x2'));
                const y2 = svgAttrNumber(node.getAttribute('y2'));
                drawLine(mapX(x1), mapY(y1), mapX(x2), mapY(y2), 'A-ELEV');
                return;
            }

            if (tag === 'circle') {
                const cx = svgAttrNumber(node.getAttribute('cx'));
                const cy = svgAttrNumber(node.getAttribute('cy'));
                const r = svgAttrNumber(node.getAttribute('r'));
                if (r > 0) drawCircle(mapX(cx), mapY(cy), r * scale, 'A-ELEV');
                return;
            }

            if (tag === 'polygon' || tag === 'polyline') {
                const raw = String(node.getAttribute('points') || '').trim();
                if (!raw) return;
                const points = raw
                    .split(/\s+/)
                    .map(pair => pair.split(',').map(Number))
                    .filter(pair => pair.length === 2 && pair.every(Number.isFinite))
                    .map(([x, y]) => [mapX(x), mapY(y)]);
                drawPolyline(points, 'A-ELEV', tag === 'polygon');
                return;
            }

            if (tag === 'path') {
                parseSvgPathSubpaths(node.getAttribute('d')).forEach((subpath) => {
                    const points = subpath.points.map(([x, y]) => [mapX(x), mapY(y)]);
                    drawPolyline(points, 'A-ELEV', subpath.closed);
                });
                return;
            }

            if (tag === 'text') {
                const x = svgAttrNumber(node.getAttribute('x'));
                const y = svgAttrNumber(node.getAttribute('y'));
                const size = Math.max(0.45, svgAttrNumber(node.getAttribute('font-size'), 10) * scale * 0.18);
                const text = node.textContent || '';
                if (text.trim()) drawText(mapX(x), mapY(y), size, text, 'A-ELEV-TEXT');
            }
        });

        return { width: targetWidthFt, height: elevationHeight };
    };

    const level1 = (planSpec.levels || [])[0];
    const level2 = (planSpec.levels || [])[1];
    const leftMargin = 8;
    const planGap = 14;
    const elevationGap = 10;
    const planBaseY = 62;

    const level1Origin = { x: leftMargin, y: planBaseY };
    const level1Size = drawPlanLevel(level1, level1Origin.x, level1Origin.y);
    const level2Origin = { x: leftMargin + level1Size.width + planGap, y: planBaseY };
    const level2Size = level2 ? drawPlanLevel(level2, level2Origin.x, level2Origin.y) : { width: 0, height: 0 };

    const elevations = planSpec?.elevations || {};
    const frontWidth = Math.max(26, planSpanForElevation(planSpec, 'front'));
    const rearWidth = Math.max(26, planSpanForElevation(planSpec, 'rear'));
    const leftWidth = Math.max(18, planSpanForElevation(planSpec, 'left'));
    const rightWidth = Math.max(18, planSpanForElevation(planSpec, 'right'));

    const elevationRow1Y = 0;
    const elevationRow2Y = 26;
    drawElevationSvg(elevations.frontSvg, 'FRONT ELEVATION', leftMargin, elevationRow1Y, frontWidth, `${frontWidth.toFixed(0)}'`);
    drawElevationSvg(elevations.rearSvg, 'REAR ELEVATION', leftMargin + frontWidth + elevationGap, elevationRow1Y, rearWidth, `${rearWidth.toFixed(0)}'`);
    drawElevationSvg(elevations.leftSvg, 'LEFT ELEVATION', leftMargin, elevationRow2Y, leftWidth, `${leftWidth.toFixed(0)}'`);
    drawElevationSvg(elevations.rightSvg, 'RIGHT ELEVATION', leftMargin + leftWidth + elevationGap, elevationRow2Y, rightWidth, `${rightWidth.toFixed(0)}'`);

    const sheet = { x: 0, y: 0, w: 140, h: 108 };
    drawSheetFrame(sheet.x, sheet.y, sheet.w, sheet.h);

    // Title block: right side of sheet, upper portion
    const tbX = sheet.x + sheet.w - 42;
    const tbY = sheet.y + 2;
    const tbW = 40;
    const tbH = 14;
    drawTitleBlock(tbX, tbY, tbW, tbH);

    // North arrow: inside title block area, lower-right
    drawNorthArrow(tbX + tbW - 4, tbY + 4, 2);

    // Room schedule: below title block
    const schedW = tbW;
    const schedY = tbY + tbH + 1;
    drawRoomSchedule(planSpec, tbX, schedY + 16, schedW);

    // Assemble DXF output. Use conservative R12 profile for maximum reader compatibility.
    const lines = [];
    // HEADER
    lines.push('0\nSECTION\n2\nHEADER');
    lines.push(`9\n$ACADVER\n1\n${DXF_VERSION}`);
    lines.push('9\n$DWGCODEPAGE\n3\nANSI_1252');
    lines.push('9\n$INSUNITS\n70\n2');      // 2 = feet
    lines.push('9\n$MEASUREMENT\n70\n0');   // 0 = imperial
    lines.push('9\n$LTSCALE\n40\n1.0');
    lines.push('9\n$LIMMIN\n10\n0.0\n20\n0.0');
    lines.push(`9\n$LIMMAX\n10\n${(sheet.w * SCALE).toFixed(1)}\n20\n${(sheet.h * SCALE).toFixed(1)}`);
    lines.push('0\nENDSEC');
    // TABLES
    lines.push('0\nSECTION\n2\nTABLES');
    // LTYPE table
    lines.push('0\nTABLE\n2\nLTYPE\n70\n1');
    lines.push('0\nLTYPE\n2\nCONTINUOUS\n70\n0\n3\nSolid line\n72\n65\n73\n0\n40\n0.0');
    lines.push('0\nENDTAB');
    // LAYER table
    lines.push(`0\nTABLE\n2\nLAYER\n70\n${Object.keys(layerStyles).length + 1}`);
    lines.push('0\nLAYER\n2\n0\n70\n0\n62\n7\n6\nCONTINUOUS');
    Object.values(layerStyles).forEach((style) => {
        const lineweight = DXF_INCLUDE_LINEWEIGHT_CODES ? `\n370\n${style.lineweight}` : '';
        lines.push(`0\nLAYER\n2\n${style.name}\n70\n0\n62\n${style.color}\n6\nCONTINUOUS${lineweight}`);
    });
    lines.push('0\nENDTAB');
    // STYLE table
    lines.push('0\nTABLE\n2\nSTYLE\n70\n1');
    lines.push('0\nSTYLE\n2\nSTANDARD\n70\n0\n40\n0\n41\n1\n50\n0\n71\n0\n42\n0.2\n3\ntxt\n4\n');
    lines.push('0\nENDTAB');
    // APPID table
    lines.push('0\nTABLE\n2\nAPPID\n70\n1');
    lines.push('0\nAPPID\n2\nACAD\n70\n0');
    lines.push('0\nENDTAB');
    lines.push('0\nENDSEC');
    // BLOCKS — required MODEL_SPACE and PAPER_SPACE stubs
    lines.push('0\nSECTION\n2\nBLOCKS');
    lines.push('0\nBLOCK\n8\n0\n2\n*MODEL_SPACE\n70\n0\n10\n0.0\n20\n0.0\n30\n0.0\n3\n*MODEL_SPACE\n1\n');
    lines.push('0\nENDBLK\n8\n0');
    lines.push('0\nBLOCK\n8\n0\n2\n*PAPER_SPACE\n70\n0\n10\n0.0\n20\n0.0\n30\n0.0\n3\n*PAPER_SPACE\n1\n');
    lines.push('0\nENDBLK\n8\n0');
    lines.push('0\nENDSEC');
    // ENTITIES
    lines.push('0\nSECTION\n2\nENTITIES');
    lines.push(...entities);
    lines.push('0\nENDSEC');
    if (DXF_INCLUDE_OBJECTS_SECTION) {
        lines.push('0\nSECTION\n2\nOBJECTS');
        lines.push('0\nENDSEC');
    }
    lines.push('0\nEOF');
    return lines.join('\r\n');
};

// Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ 3D RENDER PANEL Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬
const RENDER_REFINEMENTS = [
    { label: 'Golden Hour',  hint: 'warm late-afternoon sunlight, long shadows, golden orange sky. Only change the lighting and sky; keep the house architecture identical.' },
    { label: 'Overcast Day', hint: 'soft diffuse overcast lighting, muted tones, grey cloud-covered sky. Only change the lighting and sky; keep the house architecture identical.' },
    { label: 'Night Lit',    hint: 'night scene with interior lights glowing warmly through windows, landscape uplighting, and a deep blue sky. Only change the lighting and sky; keep the house architecture identical.' },
    { label: 'Sunrise',      hint: 'sunrise with a pink-orange gradient sky and long warm shadows across the facade. Only change the lighting and sky; keep the house architecture identical.' },
];

const Render3DPanel = ({
    planSpec,
    formData,
    planSvg,
    elevations,
    galleryId,
    onRenderReady,
    onRenderStateSnapshot,
    launchSignal = 0,
    showLaunchButton = true,
    onRenderStatusChange,
    accessToken = null,
    initialState = null,
    resetKey = 0,
    isLocked = false,
    onLockedAction,
}) => {
    const [renderStatus, setRenderStatus] = useState(() => normalizeRenderState(initialState).status); // idle|survey|loading|error|ready
    const [renderImage, setRenderImage] = useState(() => normalizeRenderState(initialState).image || null);
    const [renderImageClean, setRenderImageClean] = useState(() => normalizeRenderState(initialState).imageClean || null); // without watermark, for lighting edits
    const [errorMsg, setErrorMsg] = useState(() => normalizeRenderState(initialState).errorMsg || '');
    const [activeRefinement, setActiveRefinement] = useState(() => normalizeRenderState(initialState).activeRefinement || null);
    const [showSurvey, setShowSurvey] = useState(false);
    const [renderSurveyData, setRenderSurveyData] = useState(() => normalizeRenderState(initialState).surveyData || null);
    const launchHandledRef = useRef(launchSignal);
    const ensureAdvancedAccess = React.useCallback((featureLabel = 'Exterior Render') => {
        if (!isLocked) return true;
        onLockedAction?.(featureLabel);
        return false;
    }, [isLocked, onLockedAction]);

    const applyWatermark = (imgSrc) => new Promise((resolve) => {
        const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d'), img = new Image();
        img.onload = () => {
            canvas.width = img.width; canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const barH = Math.max(28, canvas.height * 0.05);
            ctx.fillStyle = 'rgba(10,10,12,0.82)';
            ctx.fillRect(0, canvas.height - barH, canvas.width, barH);
            ctx.fillStyle = '#fff';
            ctx.font = `italic ${Math.floor(barH * 0.42)}px serif`;
            ctx.textBaseline = 'middle';
            ctx.fillText('Property of Keystone AI', barH * 0.5, canvas.height - barH / 2);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(imgSrc);
        img.src = imgSrc;
    });

    const doRender = async (renderSurvey, lightingHint = null, existingImageForLighting = null) => {
        setRenderStatus('loading');
        setErrorMsg('');
        try {
            const isLightingOnly = !!(lightingHint && existingImageForLighting);
            const elevationSet = elevations || planSpec?.elevations || null;
            const safeRasterize = async (svgMarkup, background = '#F8F2E7') => {
                if (!svgMarkup) return null;
                try {
                    return await svgToPngDataUrl(svgMarkup, { background });
                } catch (_) {
                    return null;
                }
            };

            const [planImage, elevationSheetImage] = isLightingOnly
                ? [null, null]
                : await Promise.all([
                    svgToPngDataUrl(planSvg, { background: '#F6F4EF' }),
                    composeElevationReferenceSheet(elevationSet),
                ]);

            const payload = {
                surveyData: formData,
                renderSurveyData: renderSurvey || renderSurveyData || {},
                planSpec,
                galleryId,
                lightingHint: lightingHint || null,
                // Pass existing render (without watermark) for lighting-only edits
                existingRenderImage: existingImageForLighting || null,
                // Ground new renders against the generated floor plan image
                planImage,
                elevationSheetImage,
            };

            const res = await fetch('/api/render', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            let data;
            try { data = await res.json(); } catch(_) { data = { success: false, message: `Server error ${res.status}` }; }

            if (!res.ok || !data.success) {
                setErrorMsg(data.message || 'Unknown error from server');
                setRenderStatus('error');
                return;
            }

            const imgSrc = data.image.startsWith('data:') ? data.image : `data:image/jpeg;base64,${data.image}`;
            setRenderImageClean(imgSrc); // store clean copy for future lighting edits
            const watermarked = await applyWatermark(imgSrc);
            setRenderImage(watermarked);
            setRenderStatus('ready');
            if (onRenderReady) onRenderReady(watermarked);
        } catch(err) {
            console.error('[render]', err);
            setErrorMsg(err.message || 'Network error - is the server running?');
            setRenderStatus('error');
        }
    };

    const handleSurveySubmit = (surveyData) => {
        setShowSurvey(false);
        setRenderSurveyData(surveyData);
        setActiveRefinement(null);
        doRender(surveyData, null, null);
    };

    const handleRender = () => {
        if (!ensureAdvancedAccess('Exterior Render')) return;
        setActiveRefinement(null);
        setShowSurvey(true);
    };
    const handleRegenerate = () => {
        if (!ensureAdvancedAccess('Exterior Render')) return;
        setActiveRefinement(null);
        doRender(renderSurveyData, null, null);
    };

    const handleRefinement = (ref) => {
        if (!ensureAdvancedAccess('Exterior Render')) return;
        setActiveRefinement(ref.label);
        // Pass the clean (un-watermarked) existing image so backend can do lighting-only edit
        doRender(renderSurveyData, ref.hint, renderImageClean);
    };

    // Session-restore: apply initialState once on mount only (prevents snapshot feedback loop)
    const _initialApplied = useRef(false);
    useEffect(() => {
        if (_initialApplied.current || !initialState) return;
        _initialApplied.current = true;
        const next = normalizeRenderState(initialState);
        setRenderStatus(next.status);
        setRenderImage(next.image || null);
        setRenderImageClean(next.imageClean || null);
        setErrorMsg(next.errorMsg || '');
        setActiveRefinement(next.activeRefinement || null);
        setRenderSurveyData(next.surveyData || null);
        setShowSurvey(false);
    }, [initialState]);

    // Explicit reset when parent generates a new plan (resetKey increments)
    useEffect(() => {
        if (!resetKey) return;
        setRenderStatus('idle');
        setRenderImage(null);
        setRenderImageClean(null);
        setErrorMsg('');
        setActiveRefinement(null);
        setRenderSurveyData(null);
        setShowSurvey(false);
    }, [resetKey]);

    useEffect(() => {
        if (typeof onRenderStatusChange === 'function') onRenderStatusChange(renderStatus);
    }, [renderStatus, onRenderStatusChange]);

    useEffect(() => {
        if (typeof onRenderStateSnapshot === 'function') {
            onRenderStateSnapshot({
                status: renderStatus,
                image: renderImage,
                imageClean: renderImageClean,
                surveyData: renderSurveyData,
                activeRefinement,
                errorMsg,
            });
        }
    }, [renderStatus, renderImage, renderImageClean, renderSurveyData, activeRefinement, errorMsg, onRenderStateSnapshot]);

    useEffect(() => {
        if (!launchSignal || launchSignal === launchHandledRef.current) return;
        launchHandledRef.current = launchSignal;
        handleRender();
    }, [launchSignal]);

    if (renderStatus === 'idle') return (
        <>
            <RenderSurveyModal isOpen={showSurvey} onClose={() => setShowSurvey(false)} onSubmit={handleSurveySubmit} initialData={renderSurveyData} baseSurveyData={formData}/>
            {showLaunchButton ? (
                <button onClick={handleRender}
                    className="w-full py-3.5 cta-hero cta-glow text-[10px]">
                    {isLocked ? 'Unlock Exterior Render' : 'Generate Exterior Render'}
                </button>
            ) : (
                <div className="p-4 rounded-[16px] border border-black/8 bg-white/72">
                    <p className="mono text-[8px] uppercase tracking-[0.22em]" style={{color:'rgba(10,10,12,0.42)'}}>Exterior render</p>
                    <p className="text-[11px] leading-relaxed mt-2" style={{color:'rgba(10,10,12,0.62)'}}>
                        {isLocked
                            ? 'Unlock advanced features with a passkey to generate and download precise exterior renders from this plan.'
                            : 'Use the main action bar above to open render options and generate the exterior render from this plan.'}
                    </p>
                </div>
            )}
        </>
    );

    if (renderStatus === 'loading') return (
        <div className="flex flex-col items-center gap-3 py-5">
            <div className="flex items-center gap-3 text-blue">
                <div className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin"/>
                <span className="mono text-[9px] uppercase tracking-widest animate-pulse">
                    {activeRefinement ? `Adjusting lighting: ${activeRefinement}...` : 'Rendering exterior view...'}
                </span>
            </div>
            <p className="mono text-[8px] text-mid opacity-50">
                {activeRefinement ? 'Changing lighting only - architecture unchanged' : 'Usually 15-30 seconds'}
            </p>
        </div>
    );

    if (renderStatus === 'error') return (
        <>
            <RenderSurveyModal isOpen={showSurvey} onClose={() => setShowSurvey(false)} onSubmit={handleSurveySubmit} initialData={renderSurveyData} baseSurveyData={formData}/>
            <div className="p-4 bg-red/5 border border-red/20 rounded-sm">
                <p className="mono text-[9px] font-bold text-red uppercase mb-1">Render Failed</p>
                <p className="text-[10px] text-mid leading-relaxed mb-3" style={{wordBreak:'break-word'}}>{errorMsg}</p>
                <button onClick={() => {
                    if (!ensureAdvancedAccess('Exterior Render')) return;
                    setShowSurvey(true);
                }}
                    className="mono text-[9px] uppercase tracking-widest px-3 py-1.5 bg-ink text-white rounded-sm hover:bg-blue transition-colors">
                    Retry
                </button>
            </div>
        </>
    );

    if (renderStatus === 'ready') return (
        <div>
            <RenderSurveyModal isOpen={showSurvey} onClose={() => setShowSurvey(false)} onSubmit={handleSurveySubmit} initialData={renderSurveyData} baseSurveyData={formData}/>
            <SmartImage src={renderImage} className="w-full object-cover rounded-[16px] shadow-xl" alt="Exterior render"/>
            {/* Toolbar */}
            <div className="flex items-center gap-2 mt-2 mb-3 flex-wrap">
                <span className="mono text-[8px] uppercase tracking-widest text-mid">
                    {activeRefinement ? `Lighting: ${activeRefinement}` : 'Exterior render'}
                </span>
                <button onClick={() => {
                    if (!ensureAdvancedAccess('Exterior Render')) return;
                    const l=document.createElement('a'); l.href=renderImage; l.download=buildPlanExportFilename(formData, '3d render', 'png'); l.click();
                }}
                    className="ml-auto mono text-[9px] text-blue underline">Download</button>
                <button onClick={handleRegenerate} className="mono text-[9px] text-mid underline">Regenerate</button>
                <button onClick={() => {
                    if (!ensureAdvancedAccess('Exterior Render')) return;
                    setShowSurvey(true);
                }} className="mono text-[9px] text-mid underline">Options</button>
            </div>

            {/* Lighting refinement chips Ã¢â‚¬" lighting only, architecture unchanged */}
            <div className="border-t border-black/5 pt-3">
                <div className="flex items-center justify-between mb-2">
                    <p className="mono text-[7px] uppercase tracking-widest text-mid">Lighting &amp; Mood</p>
                    <p className="mono text-[7px] text-mid/40">Architecture stays unchanged</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {RENDER_REFINEMENTS.map(ref => (
                        <button key={ref.label}
                            onClick={() => handleRefinement(ref)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border rounded-sm transition-all mono text-[9px] font-bold uppercase tracking-wide"
                            style={{
                                borderColor: activeRefinement === ref.label ? 'var(--blue)' : 'rgba(0,0,0,0.1)',
                                background: activeRefinement === ref.label ? 'var(--blue)' : 'white',
                                color: activeRefinement === ref.label ? 'white' : 'var(--ink)',
                            }}>
                            {ref.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
    return null;
};

// Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ SURVEY FORM Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬
const STYLE_FINISH_DEFAULTS = {
    'Craftsman (Wood & Stone)': {
        exteriorSiding: 'Cedar lap',
        roofMaterial: 'Architectural asphalt',
        countertop: 'Granite',
        flooringPublic: 'Engineered hardwood',
        cabinetGrade: 'Semi-custom',
        fixtureGrade: 'Mid-grade',
    },
    'Modern Farmhouse (Board & Batten)': {
        exteriorSiding: 'Board & batten',
        roofMaterial: 'Standing seam metal',
        countertop: 'Quartz',
        flooringPublic: 'Hardwood',
        cabinetGrade: 'Semi-custom',
        fixtureGrade: 'Premium',
    },
    'Traditional Colonial (Brick)': {
        exteriorSiding: 'Brick',
        roofMaterial: 'Architectural asphalt',
        countertop: 'Laminate',
        flooringPublic: 'Engineered hardwood',
        cabinetGrade: 'Builder stock',
        fixtureGrade: 'Builder',
    },
    'Contemporary Modern (Concrete)': {
        exteriorSiding: 'Concrete panel',
        roofMaterial: 'Flat membrane',
        countertop: 'Concrete',
        flooringPublic: 'Polished concrete',
        cabinetGrade: 'Full custom',
        fixtureGrade: 'Premium',
    },
    'Mediterranean (Stucco & Tile)': {
        exteriorSiding: 'Stucco',
        roofMaterial: 'Clay tile',
        countertop: 'Marble',
        flooringPublic: 'Tile',
        cabinetGrade: 'Semi-custom',
        fixtureGrade: 'Luxury',
    },
};

const FINISH_OVERRIDE_OPTIONS = {
    exteriorSiding: ['Cedar lap', 'Board & batten', 'Brick', 'Stucco', 'Concrete panel', 'Stone', 'Fiber cement'],
    roofMaterial: ['Asphalt shingles', 'Architectural asphalt', 'Standing seam metal', 'Clay tile', 'Slate', 'Flat membrane'],
    countertop: ['Laminate', 'Granite', 'Quartz', 'Marble', 'Butcher block', 'Concrete'],
    flooringPublic: ['Hardwood', 'Engineered hardwood', 'LVP', 'Tile', 'Polished concrete'],
    cabinetGrade: ['Builder stock', 'Semi-custom', 'Full custom'],
    fixtureGrade: ['Builder', 'Mid-grade', 'Premium', 'Luxury'],
};

const SURVEY_STEPS = [
    { id:'basics',    title:'Basic Requirements',   subtitle:'Size, stories, and rooms',           fields:['totalArea','stories','bedrooms','bathrooms','privateBaths'] },
    { id:'structure', title:'Structure & Site',      subtitle:'Garage, shape, and orientation',     fields:['garage','shape','frontFacing','lotContext','lotWidth','lotDepth'] },
    { id:'lifestyle', title:'Lifestyle & Layout',    subtitle:'How you live in the home',           fields:['openConcept','masterLocation','kitchenPlacement','laundryLocation','ceilingHeight'] },
    { id:'style',     title:'Style & Materials',     subtitle:'Aesthetic and finishes',             fields:['materials','indoorOutdoor','naturalLight'] },
    { id:'extras',    title:'Special Features',      subtitle:'Additional rooms and preferences',   fields:['features','accessibilityNeeds','budgetTier','foundationType','hvacSystem','outdoorLiving','outdoorArea','freeformWishes'] },
];
const DEFAULT_FORM_DATA = {
    location:'', totalArea:'2400', stories:'2 Stories', bedrooms:'3 Bed', bathrooms:'3 Bath',
    privateBaths:'1',
    bedroomConfigs: null,
    shape:'Rectangular', garage:'1 Car Garage', materials:'Craftsman (Wood & Stone)',
    openConcept:'Open Concept (Combined)', masterLocation:'Level 2 (Upper)', kitchenPlacement:'Rear of House',
    features:'1 Study', frontFacing:'South', lotContext:'Suburban standard lot',
    laundryLocation:'Level 1 (near garage/mud)', ceilingHeight:'Standard (9 ft)',
    indoorOutdoor:'Moderate (some connection)', naturalLight:'Balanced windows',
    accessibilityNeeds:'None', budgetTier:'Mid ($200-300/sqft)',
    foundationType:'Slab-on-grade', hvacSystem:'Forced air (gas)', outdoorLiving:'None', outdoorArea:'0',
    lotWidth:'', lotDepth:'',
    finishOverrides:{},
    freeformWishes:'',
};

const SurveyForm = ({ formData, setFormData, onSubmit, isLoading, onReset }) => {
    const [step, setStep] = useState(0);
    const upd = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    const styleFinishDefaults = STYLE_FINISH_DEFAULTS[formData.materials] || STYLE_FINISH_DEFAULTS['Craftsman (Wood & Stone)'];
    const effectiveFinishValue = (key) => (formData.finishOverrides?.[key] || styleFinishDefaults?.[key] || '');
    const updateFinishOverride = (key, value) => {
        setFormData(prev => ({
            ...prev,
            finishOverrides: {
                ...(prev.finishOverrides || {}),
                [key]: value,
            },
        }));
    };
    const handleReset = () => {
        if (onReset) onReset();
        setStep(0);
    };
    const choiceStyle = (selected, tone = 'ink') => {
        if (selected) {
            const isBlue = tone === 'blue';
            return {
                borderColor: isBlue ? 'rgba(27,79,130,0.92)' : 'rgba(10,10,12,0.94)',
                background: isBlue
                    ? 'linear-gradient(180deg, rgba(27,79,130,1) 0%, rgba(20,61,100,1) 100%)'
                    : 'linear-gradient(180deg, rgba(24,24,24,1) 0%, rgba(9,9,9,1) 100%)',
                color: 'rgba(255,252,248,0.98)',
                boxShadow: isBlue
                    ? '0 12px 28px rgba(27,79,130,0.18)'
                    : '0 12px 28px rgba(10,10,12,0.14)',
            };
        }
        return {
            borderColor: 'rgba(10,10,12,0.1)',
            background: 'rgba(255,255,255,0.96)',
            color: 'var(--ink)',
            boxShadow: 'none',
        };
    };
    const actionStyle = (tone = 'blue') => ({
        borderColor: tone === 'blue' ? 'rgba(27,79,130,0.92)' : 'rgba(10,10,12,0.94)',
        background: tone === 'blue'
            ? 'linear-gradient(180deg, rgba(27,79,130,1) 0%, rgba(20,61,100,1) 100%)'
            : 'linear-gradient(180deg, rgba(24,24,24,1) 0%, rgba(9,9,9,1) 100%)',
        color: 'rgba(255,252,248,0.98)',
        boxShadow: tone === 'blue'
            ? '0 14px 30px rgba(27,79,130,0.18)'
            : '0 14px 30px rgba(10,10,12,0.14)',
    });

    const BtnGrid = ({ field, options, cols=2 }) => (
        <div className="grid gap-2" style={{gridTemplateColumns:`repeat(${cols},1fr)`}}>
            {options.map(opt => {
                const val = typeof opt === 'string' ? opt : opt.val;
                const label = typeof opt === 'string' ? opt : opt.label;
                const desc = typeof opt === 'object' ? opt.desc : null;
                const sel = formData[field] === val;
                return (
                    <button key={val} type="button" aria-pressed={sel} onClick={() => upd(field, val)}
                        className="py-3 px-3 border text-left rounded-sm transition-all"
                        style={choiceStyle(sel)}>
                        <div className="text-[11px] font-semibold leading-tight">{label}</div>
                        {desc && <div className="text-[9px] mt-0.5 leading-tight" style={{opacity: sel ? 0.74 : 0.42}}>{desc}</div>}
                    </button>
                );
            })}
        </div>
    );

    // Toggle-chip button for multi-select style (features)
    const ToggleChip = ({ value, label, icon, field }) => {
        const selected = (formData[field] || '').toLowerCase().includes(label.toLowerCase());
        const toggle = () => {
            const current = formData[field] || '';
            // Parse existing features into an array
            const parts = current.split(',').map(s => s.trim()).filter(Boolean);
            if (selected) {
                const next = parts.filter(p => !p.toLowerCase().includes(label.toLowerCase())).join(', ');
                upd(field, next);
            } else {
                const next = [...parts, `1 ${label}`].join(', ');
                upd(field, next);
            }
        };
        return (
            <button type="button" aria-pressed={selected} onClick={toggle}
                className="flex items-center gap-1.5 px-3 py-2 border rounded-sm transition-all text-[10px] font-semibold"
                style={choiceStyle(selected)}>
                {icon ? <span className="mono text-[9px] uppercase tracking-[0.18em]" style={{opacity:selected ? 0.76 : 0.6}}>{icon}</span> : null}
                {label}
                {selected && <CheckIcon className="w-3 h-3" style={{opacity:0.82}}/>}
            </button>
        );
    };

    const Lbl = ({children}) => <label className="mono text-[7px] uppercase tracking-widest text-mid block mb-1.5">{children}</label>;

    // Footprint shape visual options
    const FootprintOption = ({ val, label, desc, ratio }) => {
        const sel = formData.shape === val;
        // ratio: [w, h] proportional
        const [fw, fh] = ratio;
        return (
            <button type="button" aria-pressed={sel} onClick={() => upd('shape', val)}
                className="p-3 border rounded-sm transition-all flex flex-col items-center gap-2"
                style={choiceStyle(sel)}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'36px'}}>
                    <div style={{
                        width: `${fw * 28}px`, height: `${fh * 28}px`,
                        border: `2px solid ${sel ? 'rgba(255,255,255,0.7)' : 'var(--blue)'}`,
                        background: sel ? 'rgba(255,255,255,0.08)' : 'rgba(27,79,130,0.06)',
                        borderRadius: '2px',
                    }}/>
                </div>
                <div className="text-[10px] font-semibold leading-tight text-center">{label}</div>
                <div className={`text-[8px] leading-tight text-center ${sel?'opacity-50':'opacity-40'}`}>{desc}</div>
            </button>
        );
    };

    // Lot context visual option (like street/front but for lot type)
    const LotOption = ({ val, label, svgContent }) => {
        const sel = formData.lotContext === val;
        return (
            <button type="button" aria-pressed={sel} onClick={() => upd('lotContext', val)}
                className={`p-2 border rounded-sm transition-all flex flex-col items-center gap-1.5 ${sel ? 'border-blue' : 'border-black/10 bg-white hover:border-blue'}`}
                style={{background: sel ? 'rgba(27,79,130,0.05)' : 'white'}}>
                <svg viewBox="0 0 60 40" width="60" height="40" style={{display:'block'}}>
                    {svgContent}
                </svg>
                <div className="text-[9px] font-semibold leading-tight text-center" style={{color: sel ? 'var(--blue)' : 'var(--ink)'}}>{label}</div>
            </button>
        );
    };

    const renderField = (field) => {
        const bedCount = parseInt(formData.bedrooms) || 3;
        switch(field) {
            case 'totalArea': return <div key={field} className="space-y-1.5"><Lbl>Total Floor Area (Sq Ft)</Lbl><input type="number" placeholder="e.g. 2400" value={formData.totalArea} onChange={e=>upd('totalArea',e.target.value)} min="600" max="10000"/><p className="text-[9px] text-mid/60">Total finished sq ft across all levels</p></div>;
            case 'stories': return <div key={field} className="space-y-1.5"><Lbl>Number of Stories</Lbl><BtnGrid field="stories" options={['1 Story','2 Stories']}/></div>;
            case 'bedrooms': return (
                <div key={field} className="space-y-1.5">
                    <Lbl>Bedrooms</Lbl>
                    <div className="flex gap-2">{[1,2,3,4,5].map(n=>{ const selected = formData.bedrooms===`${n} Bed`; return <button key={n} type="button" aria-pressed={selected} onClick={()=>upd('bedrooms',`${n} Bed`)} className="flex-1 h-11 border text-sm font-bold rounded-sm transition-all" style={choiceStyle(selected)}>{n}</button>; })}</div>
                </div>
            );
            case 'bathrooms': return (
                <div key={field} className="space-y-1.5">
                    <Lbl>Full Bathrooms</Lbl>
                    <div className="flex gap-2">{[1,2,3,4,5].map(n=>{ const selected = formData.bathrooms===`${n} Bath`; return <button key={n} type="button" aria-pressed={selected} onClick={()=>upd('bathrooms',`${n} Bath`)} className="flex-1 h-11 border text-sm font-bold rounded-sm transition-all" style={choiceStyle(selected)}>{n}</button>; })}</div>
                    <p className="text-[9px] text-mid/60">Half baths added automatically</p>
                </div>
            );
            case 'privateBaths': {
                const bedLabels = bedCount <= 1
                    ? ['Primary Bedroom']
                    : ['Primary Bedroom', ...Array.from({length: bedCount - 1}, (_, i) => `Bedroom ${i + 2}`)];
                const configs = formData.bedroomConfigs || bedLabels.map((_, i) => ({
                    privateBath: i === 0 ? 'Yes' : 'No',
                    closet: i === 0 ? 'Walk-in' : 'Standard',
                }));
                const ensureConfigs = () => {
                    if (!formData.bedroomConfigs) {
                        upd('bedroomConfigs', configs);
                    }
                };
                const updateConfig = (idx, key, val) => {
                    const next = [...(formData.bedroomConfigs || configs)];
                    while (next.length < bedCount) next.push({ privateBath: 'No', closet: 'Standard' });
                    next[idx] = { ...next[idx], [key]: val };
                    upd('bedroomConfigs', next.slice(0, bedCount));
                    const privateCount = next.slice(1, bedCount).filter(c => c.privateBath === 'Yes').length;
                    upd('privateBaths', `${privateCount}`);
                };
                return (
                    <div key={field} className="space-y-3 p-3 bg-blue/4 border border-blue/15 rounded-sm">
                        <Lbl>Bedroom Configuration</Lbl>
                        <p className="text-[10px] text-mid mb-1">Set private bathroom and closet type for each bedroom.</p>
                        {bedLabels.map((label, idx) => {
                            const cfg = (formData.bedroomConfigs || configs)[idx] || { privateBath: idx === 0 ? 'Yes' : 'No', closet: idx === 0 ? 'Walk-in' : 'Standard' };
                            return (
                                <div key={idx} className="p-2.5 bg-white/60 border border-black/5 rounded-sm space-y-2">
                                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{color:'var(--blue)'}}>{label}</div>
                                    <div className="flex gap-3 items-center">
                                        <span className="text-[9px] font-medium text-mid w-16 shrink-0">En-Suite</span>
                                        <div className="flex gap-1.5 flex-1">
                                            {['Yes', 'No'].map(v => {
                                                const sel = cfg.privateBath === v;
                                                return <button key={v} type="button" aria-pressed={sel} onClick={() => { ensureConfigs(); updateConfig(idx, 'privateBath', v); }} className="flex-1 h-8 border text-[10px] font-bold rounded-sm" style={choiceStyle(sel, 'blue')}>{v}</button>;
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <span className="text-[9px] font-medium text-mid w-16 shrink-0">Closet</span>
                                        <div className="flex gap-1.5 flex-1">
                                            {['Walk-in', 'Standard'].map(v => {
                                                const sel = cfg.closet === v;
                                                return <button key={v} type="button" aria-pressed={sel} onClick={() => { ensureConfigs(); updateConfig(idx, 'closet', v); }} className="flex-1 h-8 border text-[10px] font-bold rounded-sm" style={choiceStyle(sel, 'blue')}>{v}</button>;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <p className="text-[9px] text-mid/50">Primary bedroom always gets an en-suite. Remaining baths are shared.</p>
                    </div>
                );
            }
            case 'garage': return (
                <div key={field} className="space-y-1.5">
                    <Lbl>Garage</Lbl>
                    <BtnGrid field="garage" options={[
                        {val:'No Garage', label:'No Garage', desc:'Driveway only'},
                        {val:'1 Car Garage', label:'1 Car', desc:'Single attached garage'},
                        {val:'2 Car Garage', label:'2 Car', desc:'Double attached garage'},
                    ]}/>
                </div>
            );
            case 'shape': return (
                <div key={field} className="space-y-1.5">
                    <Lbl>Footprint Shape</Lbl>
                    <div className="grid grid-cols-2 gap-2">
                        <FootprintOption val="Rectangular (Wide)" label="Wide Rectangle" desc="Width > depth - more street frontage" ratio={[1.6, 1]}/>
                        <FootprintOption val="Rectangular (Deep)" label="Deep Rectangle" desc="Depth > width - narrow lot" ratio={[1, 1.4]}/>
                        <FootprintOption val="Square" label="Square" desc="Equal width and depth" ratio={[1, 1]}/>
                        <FootprintOption val="Rectangular" label="Standard Rect" desc="Classic proportions" ratio={[1.3, 1]}/>
                    </div>
                </div>
            );
            case 'frontFacing': return (
                <div key={field} className="space-y-2">
                    <Lbl>Street / Front Faces</Lbl>
                    <div className="flex items-center justify-center">
                        <div className="relative" style={{width:'210px',height:'210px'}}>
                            <svg viewBox="0 0 210 210" width="210" height="210" style={{position:'absolute',top:0,left:0,pointerEvents:'none'}}>
                                <circle cx="105" cy="105" r="100" fill="none" stroke="rgba(100,100,100,0.1)" strokeWidth="1"/>
                                <circle cx="105" cy="105" r="68" fill="none" stroke="rgba(100,100,100,0.07)" strokeWidth="1" strokeDasharray="3 4"/>
                                {[[105,6,105,20],[105,190,105,204],[6,105,20,105],[190,105,204,105]].map(([x1,y1,x2,y2],i)=><line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(100,100,100,0.22)" strokeWidth="1.5"/>)}
                                <path d="M 174 68 Q 200 105 174 142" fill="none" stroke="rgba(181,136,42,0.2)" strokeWidth="1.5" strokeDasharray="3 3"/>
                                <text x="188" y="109" textAnchor="middle" fontSize="8" fill="rgba(181,136,42,0.5)">sun</text>
                            </svg>
                            <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',zIndex:2}}>
                                {['North','South','East','West'].includes(formData.frontFacing) && (() => {
                                    const dir = formData.frontFacing;
                                    const arrs = {North:[38,2,38,14],South:[38,66,38,54],East:[74,34,60,34],West:[2,34,16,34]};
                                    const lps  = {North:{x:38,y:24,a:'middle'},South:{x:38,y:48,a:'middle'},East:{x:50,y:34,a:'start'},West:{x:26,y:34,a:'end'}};
                                    const arr = arrs[dir]; const lp = lps[dir];
                                    return <svg viewBox="0 0 76 68" width="76" height="68">
                                        <rect x="14" y="26" width="48" height="36" rx="1" fill="#f3f2ee" stroke="#2c2c2e" strokeWidth="1.5"/>
                                        <polygon points="8,28 38,7 68,28" fill="#1a1a1a" opacity="0.85"/>
                                        <rect x="48" y="10" width="6" height="10" fill="#1a1a1a" opacity="0.5"/>
                                        {dir==='South'&&<><rect x="22" y="42" width="14" height="14" rx="1" fill="#ccc" stroke="#333" strokeWidth="0.8" opacity="0.8"/><rect x="42" y="48" width="7" height="14" rx="1" fill="#7a7060" stroke="#333" strokeWidth="0.8"/></>}
                                        {dir==='North'&&<><rect x="22" y="26" width="14" height="10" rx="1" fill="#ccc" stroke="#333" strokeWidth="0.8" opacity="0.8"/><rect x="42" y="26" width="7" height="10" fill="#7a7060" stroke="#333" strokeWidth="0.8"/></>}
                                        {dir==='East'&&<><rect x="50" y="34" width="12" height="16" rx="1" fill="#ccc" stroke="#333" strokeWidth="0.8" opacity="0.8"/><rect x="50" y="52" width="12" height="8" fill="#7a7060" stroke="#333" strokeWidth="0.8"/></>}
                                        {dir==='West'&&<><rect x="14" y="34" width="12" height="16" rx="1" fill="#ccc" stroke="#333" strokeWidth="0.8" opacity="0.8"/><rect x="14" y="52" width="12" height="8" fill="#7a7060" stroke="#333" strokeWidth="0.8"/></>}
                                        <line x1={arr[0]} y1={arr[1]} x2={arr[2]} y2={arr[3]} stroke="#1B4F82" strokeWidth="1.5" strokeDasharray="2 2"/>
                                        <circle cx={arr[0]} cy={arr[1]} r="2.5" fill="#1B4F82"/>
                                        <text x={lp.x} y={lp.y} textAnchor={lp.a} fontSize="5" fill="#1B4F82" fontWeight="bold" fontFamily="sans-serif">STREET</text>
                                    </svg>;
                                })()}
                            </div>
                            {[{dir:'North',x:77,y:0,w:56,h:34},{dir:'South',x:77,y:176,w:56,h:34},{dir:'West',x:0,y:77,w:34,h:56},{dir:'East',x:176,y:77,w:34,h:56}].map(({dir,x,y,w,h})=>{
                                const sel = formData.frontFacing===dir;
                                return <button key={dir} type="button" aria-pressed={sel} onClick={()=>upd('frontFacing',dir)}
                                    style={{position:'absolute',left:x,top:y,width:w,height:h,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:sel?'1.5px solid #1B4F82':'1px solid rgba(100,100,100,0.14)',borderRadius:'4px',background:sel?'#1B4F82':'rgba(246,244,239,0.95)',color:sel?'#fff':'#0A0A0C',cursor:'pointer',zIndex:10,transition:'all 0.12s',boxShadow:sel?'0 2px 10px rgba(27,79,130,0.3)':'none'}}>
                                    <span style={{fontSize:'13px',fontWeight:'800',lineHeight:1}}>{dir[0]}</span>
                                    <span style={{fontSize:'6px',fontWeight:'600',opacity:0.65,marginTop:'1px'}}>{dir}</span>
                                </button>;
                            })}
                        </div>
                    </div>
                    <p className="mono text-[7px] text-mid/50 text-center">South = most winter sun - East = morning light</p>
                </div>
            );
            case 'lotContext': return (
                <div key={field} className="space-y-2">
                    <Lbl>Lot / Site Context</Lbl>
                    <div className="grid grid-cols-3 gap-2">
                        <LotOption val="Suburban standard lot" label="Suburban" svgContent={<>
                            <rect x="5" y="20" width="50" height="15" fill="#c8e6c9" stroke="#888" strokeWidth="0.5"/>
                            <rect x="15" y="8" width="30" height="14" fill="#e8e4dc" stroke="#555" strokeWidth="1"/>
                            <polygon points="15,8 30,2 45,8" fill="#555"/>
                            <rect x="10" y="32" width="40" height="3" fill="#aaa"/>
                            <line x1="0" y1="35" x2="60" y2="35" stroke="#aaa" strokeWidth="1"/>
                        </>}/>
                        <LotOption val="Suburban corner lot" label="Corner" svgContent={<>
                            <rect x="5" y="15" width="50" height="20" fill="#c8e6c9" stroke="#888" strokeWidth="0.5"/>
                            <rect x="8" y="8" width="25" height="14" fill="#e8e4dc" stroke="#555" strokeWidth="1"/>
                            <polygon points="8,8 20,2 33,8" fill="#555"/>
                            <line x1="5" y1="35" x2="55" y2="35" stroke="#aaa" strokeWidth="1.5"/>
                            <line x1="5" y1="35" x2="5" y2="5" stroke="#aaa" strokeWidth="1.5"/>
                        </>}/>
                        <LotOption val="Urban tight lot" label="Urban" svgContent={<>
                            <rect x="8" y="5" width="16" height="30" fill="#e8e4dc" stroke="#555" strokeWidth="1"/>
                            <rect x="26" y="2" width="12" height="33" fill="#ddd" stroke="#777" strokeWidth="0.7"/>
                            <rect x="40" y="8" width="14" height="27" fill="#d5cfc5" stroke="#666" strokeWidth="0.7"/>
                            <line x1="0" y1="35" x2="60" y2="35" stroke="#aaa" strokeWidth="1.5"/>
                        </>}/>
                        <LotOption val="Rural acreage" label="Rural" svgContent={<>
                            <rect x="0" y="25" width="60" height="15" fill="#a5d6a7" stroke="none"/>
                            <rect x="18" y="14" width="24" height="14" fill="#e8e4dc" stroke="#555" strokeWidth="1"/>
                            <polygon points="18,14 30,7 42,14" fill="#555"/>
                            <circle cx="8" cy="22" r="5" fill="#66bb6a"/>
                            <circle cx="52" cy="20" r="6" fill="#4caf50"/>
                            <circle cx="46" cy="23" r="4" fill="#81c784"/>
                        </>}/>
                        <LotOption val="View focused site" label="View Site" svgContent={<>
                            <rect x="0" y="22" width="60" height="18" fill="#b3e5fc" stroke="none"/>
                            <polyline points="0,22 10,16 20,20 32,12 44,18 60,14" fill="none" stroke="#8d6e63" strokeWidth="1.5"/>
                            <rect x="20" y="12" width="20" height="12" fill="#e8e4dc" stroke="#555" strokeWidth="1"/>
                            <polygon points="20,12 30,6 40,12" fill="#555"/>
                        </>}/>
                        <LotOption val="Waterfront lot" label="Waterfront" svgContent={<>
                            <rect x="0" y="24" width="60" height="16" fill="#81d4fa" stroke="none"/>
                            <rect x="0" y="24" width="60" height="4" fill="#4fc3f7" stroke="none"/>
                            <rect x="15" y="10" width="28" height="16" fill="#e8e4dc" stroke="#555" strokeWidth="1"/>
                            <polygon points="15,10 29,4 43,10" fill="#555"/>
                            <rect x="26" y="24" width="4" height="6" fill="#8d6e63"/>
                        </>}/>
                    </div>
                </div>
            );
            case 'openConcept': return <div key={field} className="space-y-1.5"><Lbl>Kitchen / Living / Dining</Lbl><BtnGrid field="openConcept" cols={1} options={[{val:'Open Concept (Combined)',label:'Open Concept',desc:'Kitchen, dining, and living flow together as one great room'},{val:'Traditional (Separate Rooms)',label:'Traditional',desc:'Each room is enclosed and defined with walls'}]}/></div>;
            case 'masterLocation': return (
                <div key={field} className="space-y-1.5">
                    <Lbl>Primary Suite Location</Lbl>
                    <BtnGrid field="masterLocation" options={
                        formData.stories === '1 Story'
                            ? ['Level 1 (Main)']
                            : ['Level 1 (Main)','Level 2 (Upper)']
                    }/>
                </div>
            );
            case 'kitchenPlacement': return <div key={field} className="space-y-1.5"><Lbl>Kitchen Location</Lbl><BtnGrid field="kitchenPlacement" options={['Rear of House','Front of House']}/></div>;
            case 'laundryLocation': return (
                <div key={field} className="space-y-1.5">
                    <Lbl>Laundry Location</Lbl>
                    <BtnGrid field="laundryLocation" cols={1} options={
                        formData.stories === '1 Story'
                            ? ['Level 1 (near garage/mud)', 'No preference']
                            : ['Level 1 (near garage/mud)','Level 2 (near bedrooms)','No preference']
                    }/>
                </div>
            );
            case 'ceilingHeight': return <div key={field} className="space-y-1.5"><Lbl>Ceiling Height</Lbl><BtnGrid field="ceilingHeight" cols={3} options={['Standard (9 ft)','Tall (10 ft)','Cathedral / Vaulted']}/></div>;
            case 'materials': return (
                <div key={field} className="space-y-2">
                    <Lbl>Exterior Style & Materials</Lbl>
                    <BtnGrid field="materials" cols={1} options={[
                        {val:'Craftsman (Wood & Stone)',          label:'Craftsman',              desc:'Natural wood trim, stone veneer, covered porch'},
                        {val:'Modern Farmhouse (Board & Batten)', label:'Modern Farmhouse',       desc:'Board-and-batten, black frames, metal roof'},
                        {val:'Traditional Colonial (Brick)',      label:'Traditional / Colonial', desc:'Brick facade, symmetrical windows, pitched roof'},
                        {val:'Contemporary Modern (Concrete)',    label:'Contemporary / Modern',  desc:'Flat roof, concrete, floor-to-ceiling glass'},
                        {val:'Mediterranean (Stucco & Tile)',     label:'Mediterranean',          desc:'Stucco exterior, terracotta tiles, arched details'},
                    ]}/>
                    <details className="p-3 border border-black/10 rounded-sm bg-white/80">
                        <summary className="cursor-pointer select-none text-[10px] font-semibold uppercase tracking-[0.14em]" style={{color:'var(--blue)'}}>
                            Customize Finishes (optional)
                        </summary>
                        <p className="text-[9px] text-mid/65 mt-2 mb-2">
                            Defaults come from the selected style. You can override only what you want.
                        </p>
                        <div className="grid md:grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                                <Lbl>Exterior siding</Lbl>
                                <select value={effectiveFinishValue('exteriorSiding')} onChange={e => updateFinishOverride('exteriorSiding', e.target.value)}>
                                    {FINISH_OVERRIDE_OPTIONS.exteriorSiding.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Lbl>Roof material</Lbl>
                                <select value={effectiveFinishValue('roofMaterial')} onChange={e => updateFinishOverride('roofMaterial', e.target.value)}>
                                    {FINISH_OVERRIDE_OPTIONS.roofMaterial.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Lbl>Countertop</Lbl>
                                <select value={effectiveFinishValue('countertop')} onChange={e => updateFinishOverride('countertop', e.target.value)}>
                                    {FINISH_OVERRIDE_OPTIONS.countertop.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Lbl>Flooring (public)</Lbl>
                                <select value={effectiveFinishValue('flooringPublic')} onChange={e => updateFinishOverride('flooringPublic', e.target.value)}>
                                    {FINISH_OVERRIDE_OPTIONS.flooringPublic.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Lbl>Cabinet grade</Lbl>
                                <select value={effectiveFinishValue('cabinetGrade')} onChange={e => updateFinishOverride('cabinetGrade', e.target.value)}>
                                    {FINISH_OVERRIDE_OPTIONS.cabinetGrade.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Lbl>Fixture grade</Lbl>
                                <select value={effectiveFinishValue('fixtureGrade')} onChange={e => updateFinishOverride('fixtureGrade', e.target.value)}>
                                    {FINISH_OVERRIDE_OPTIONS.fixtureGrade.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                        </div>
                    </details>
                </div>
            );
            case 'indoorOutdoor': return <div key={field} className="space-y-1.5"><Lbl>Indoor / Outdoor Flow</Lbl><BtnGrid field="indoorOutdoor" cols={1} options={['Minimal (enclosed feel)','Moderate (some connection)','Maximum (open to outdoors)']}/></div>;
            case 'naturalLight': return <div key={field} className="space-y-1.5"><Lbl>Natural Light Priority</Lbl><BtnGrid field="naturalLight" cols={1} options={['Balanced windows','Maximum glazing','Privacy first (fewer windows)']}/></div>;
            case 'features': return (
                <div key={field} className="space-y-2">
                    <Lbl>Special Rooms</Lbl>
                    <p className="text-[9px] text-mid/60 mb-2">Tap to add special rooms to your plan. Default: none.</p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            {label:'Study'},
                            {label:'Home Office'},
                            {label:'Home Theater'},
                            {label:'Gym'},
                            {label:'Gaming Room'},
                            {label:'Library'},
                            {label:'Wine Cellar'},
                            {label:'Music Room'},
                            {label:'Guest Suite'},
                            {label:'Playroom'},
                        ].map(f => <ToggleChip key={f.label} field="features" value={f.label} label={f.label} icon={f.icon}/>)}
                    </div>
                    {(formData.features||'').trim() && (
                        <div className="mt-1 p-2 bg-blue/5 border border-blue/15 rounded-sm">
                            <span className="mono text-[7px] uppercase text-blue">Selected: </span>
                            <span className="text-[9px] text-ink">{formData.features}</span>
                            <button onClick={() => upd('features', '')} className="ml-2 text-[9px] text-red/60 hover:text-red">clear</button>
                        </div>
                    )}
                </div>
            );
            case 'accessibilityNeeds': return (
                <div key={field} className="space-y-1.5">
                    <Lbl>Accessibility Needs</Lbl>
                    <BtnGrid field="accessibilityNeeds" options={
                        formData.stories === '2 Stories'
                            ? ['None','Wheelchair accessible','Wide doorways']
                            : ['None','Wheelchair accessible','Wide doorways','Single-level preferred']
                    }/>
                </div>
            );
            case 'budgetTier': return <div key={field} className="space-y-1.5"><Lbl>Budget Tier</Lbl><BtnGrid field="budgetTier" cols={1} options={[{val:'Entry ($120-180/sqft)',label:'Entry - $120-180/sqft',desc:'Efficient, value-optimized design'},{val:'Mid ($200-300/sqft)',label:'Mid - $200-300/sqft',desc:'Quality finishes, flexible layouts'},{val:'Luxury ($350+/sqft)',label:'Luxury - $350+/sqft',desc:'Premium materials, custom details'}]}/></div>;
            case 'foundationType': return (
                <div key={field} className="space-y-1.5">
                    <Lbl>Foundation Type</Lbl>
                    <BtnGrid field="foundationType" cols={1} options={['Slab-on-grade','Crawl space','Full basement']}/>
                </div>
            );
            case 'hvacSystem': return (
                <div key={field} className="space-y-1.5">
                    <Lbl>HVAC System</Lbl>
                    <BtnGrid field="hvacSystem" cols={1} options={['Forced air (gas)','Heat pump','Mini-split']}/>
                </div>
            );
            case 'outdoorLiving': return (
                <div key={field} className="space-y-1.5">
                    <Lbl>Outdoor Living</Lbl>
                    <BtnGrid field="outdoorLiving" cols={1} options={['None','Covered porch','Open deck','Screened porch','Patio']}/>
                </div>
            );
            case 'outdoorArea': {
                if ((formData.outdoorLiving || 'None') === 'None') return null;
                const outdoorArea = Math.max(0, Math.min(800, parseInt(formData.outdoorArea, 10) || 0));
                return (
                    <div key={field} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Lbl>Outdoor Area (sq ft)</Lbl>
                            <span className="mono text-[9px] text-mid">{outdoorArea} sqft</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="800"
                            step="10"
                            value={outdoorArea}
                            onChange={e => upd('outdoorArea', e.target.value)}
                        />
                    </div>
                );
            }
            case 'lotWidth': return (
                <div key={field} className="space-y-1.5">
                    <Lbl>Lot Width (ft) — optional</Lbl>
                    <input type="number" min="20" max="500" placeholder="e.g. 60" value={formData.lotWidth} onChange={e=>upd('lotWidth',e.target.value)} className="w-full"/>
                </div>
            );
            case 'lotDepth': return (
                <div key={field} className="space-y-1.5">
                    <Lbl>Lot Depth (ft) — optional</Lbl>
                    <input type="number" min="20" max="500" placeholder="e.g. 120" value={formData.lotDepth} onChange={e=>upd('lotDepth',e.target.value)} className="w-full"/>
                </div>
            );
            case 'freeformWishes': return <div key={field} className="space-y-1.5"><Lbl>Anything Else? (optional)</Lbl><textarea rows="3" placeholder="Specific wishes, must-haves, or notes..." value={formData.freeformWishes} onChange={e=>upd('freeformWishes',e.target.value)}/></div>;
            default: return null;
        }
    };

    const cur = SURVEY_STEPS[step];
    const isLast = step === SURVEY_STEPS.length - 1;

    return (
        <div>
            {/* Progress bar */}
            <div className="flex gap-1 mb-5">
                {SURVEY_STEPS.map((_,i) => <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{background: i<=step ? 'var(--blue)' : 'rgba(0,0,0,0.07)'}}/>)}
            </div>
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <span className="mono text-[7px] uppercase tracking-widest text-mid">Step {step+1} of {SURVEY_STEPS.length}</span>
                    <h3 className="cg text-2xl italic mt-0.5">{cur.title}</h3>
                    <p className="text-[11px] mt-1" style={{color:'rgba(10,10,12,0.56)'}}>{cur.subtitle}</p>
                </div>
                <button type="button" onClick={handleReset} className="cta-secondary px-4 py-3 text-[9px]">
                    Reset Sample
                </button>
            </div>
            <div className="survey-step-row mb-5" aria-label="Survey steps">
                {SURVEY_STEPS.map((item, i) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setStep(i)}
                        className={`survey-step-pill ${i === step ? 'active' : ''}`}
                        aria-current={i === step ? 'step' : undefined}
                    >
                        <span className="mono text-[8px] uppercase tracking-[0.22em] opacity-55">0{i + 1}</span>
                        <span>{item.title}</span>
                    </button>
                ))}
            </div>
            <p className="survey-quick-note">
                The sample residential brief is already filled in, so you can move quickly and adjust only what matters.
            </p>
            <div className="space-y-4 step-in" key={step}>
                {cur.fields.map(f => renderField(f))}
            </div>
            <div className="flex gap-2.5 mt-5">
                {step > 0 && <button type="button" onClick={() => setStep(s=>s-1)} className="px-5 py-3 border border-black/10 text-[11px] font-semibold hover:border-ink transition-colors rounded-sm">Back</button>}
                {!isLast
                    ? <button type="button" onClick={() => setStep(s=>s+1)} className="flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors rounded-sm border" style={actionStyle('blue')}>Continue</button>
                    : <button type="button" onClick={onSubmit} disabled={isLoading} className="flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 rounded-sm border" style={actionStyle('ink')}>
                        {isLoading ? 'Generating...' : 'Generate Floor Plan'}
                      </button>
                }
            </div>
        </div>
    );
};


// Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ GALLERY COMPONENT Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬
const Gallery = ({ onOpenModal }) => {
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
                        className="fixed inset-0 z-[200] bg-ink/93 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out">
                        {typeof zoomImg === 'string' && zoomImg.startsWith('<svg')
                            ? <div className="bg-white p-6 max-w-4xl w-full max-h-[90vh] overflow-auto rounded-sm shadow-2xl" dangerouslySetInnerHTML={{__html:zoomImg}}/>
                            : <img src={zoomImg} className="max-h-[90vh] max-w-full object-contain rounded-sm" alt="Zoom"/>}
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
                        className="fixed inset-0 z-[150] bg-ink/70 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6"
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
                                    <button type="button" onClick={() => setSelected(null)} aria-label="Close session detail" className="w-9 h-9 bg-black/6 rounded-full flex items-center justify-center hover:bg-black/12 transition-colors flex-shrink-0">
                                        <CloseIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                                {/* Side-by-side at 50% scale each Ã¢â‚¬" both visible without scrolling */}
                                <div className="gallery-detail-grid">
                                    {/* SVG blueprint Ã¢â‚¬" clipped to fixed height, scaled down */}
                                    <div className="border border-black/6 rounded-sm overflow-hidden cursor-zoom-in"
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
                                    <div className="border border-black/6 rounded-sm overflow-hidden flex flex-col"
                                        style={{background:'#f8f8f8'}}>
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
                        <span className="section-label" style={{color:'rgba(10,10,12,0.44)'}}>Recent sessions</span>
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
                                        <span className="bg-white/95 px-3 py-1.5 rounded-full shadow-sm mono text-[8px] uppercase tracking-widest text-blue font-bold">View Details</span>
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
const InteractiveCanvas = ({ children }) => {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [blueprintMode, setBlueprintMode] = useState(false);
    const containerRef = useRef(null);
    const contentRef = useRef(null);

    const fitToView = React.useCallback(() => {
        const container = containerRef.current;
        const content = contentRef.current;
        if (!container || !content) return;

        const containerRect = container.getBoundingClientRect();
        const contentWidth = content.scrollWidth || content.offsetWidth || 0;
        const contentHeight = content.scrollHeight || content.offsetHeight || 0;
        if (!containerRect.width || !containerRect.height || !contentWidth || !contentHeight) return;

        const pad = 40;
        const availableW = Math.max(1, containerRect.width - pad * 2);
        const availableH = Math.max(1, containerRect.height - pad * 2);
        const nextScale = Math.min(availableW / contentWidth, availableH / contentHeight, 1);
        setScale(Math.max(0.15, nextScale));
        setOffset({ x: 0, y: 0 });
    }, []);

    const handleWheel = React.useCallback((e) => {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(s => Math.min(Math.max(s * factor, 0.2), 5));
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    useEffect(() => {
        const container = containerRef.current;
        const content = contentRef.current;
        if (!container || !content) return;

        let rafId = requestAnimationFrame(() => fitToView());
        const observer = new ResizeObserver(() => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => fitToView());
        });

        observer.observe(container);
        observer.observe(content);

        return () => {
            cancelAnimationFrame(rafId);
            observer.disconnect();
        };
    }, [children, fitToView]);

    const onMouseDown = (e) => { if (e.button !== 0) return; setIsDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
    const onMouseMove = (e) => { if (!isDragging) return; setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
    const onMouseUp = () => setIsDragging(false);
    const resetView = () => fitToView();

    const bg = blueprintMode ? '#0d1b2a' : '#161b24';
    const gridColor = blueprintMode ? 'rgba(100,149,237,0.12)' : 'rgba(255,255,255,0.05)';
    const gridSz = Math.round(40 * scale);

    const toolbarBtn = (onClick, title, content, active) => (
        <button onClick={onClick} title={title} style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 6, border: 'none', cursor: 'pointer',
            background: active ? 'rgba(100,149,237,0.25)' : 'transparent',
            color: active ? 'rgb(147,197,253)' : 'rgba(244,239,230,0.72)',
            fontSize: 15, fontWeight: 'bold',
        }}>{content}</button>
    );

    return (
        <div ref={containerRef} style={{ position: 'relative', flex: 1, overflow: 'hidden', background: bg, cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
            {/* Grid */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
                backgroundSize: `${gridSz}px ${gridSz}px`,
                backgroundPosition: `${offset.x % gridSz}px ${offset.y % gridSz}px`,
            }} />
            {/* Content */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.06s ease',
                willChange: 'transform',
            }}>
                <div ref={contentRef} style={{display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
                    {children}
                </div>
            </div>
            {/* Floating toolbar */}
            <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', alignItems: 'center', gap: 2,
                background: 'rgba(10,10,12,0.72)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999,
                padding: '4px 10px', zIndex: 20, userSelect: 'none',
            }}>
                {toolbarBtn((e) => { e.stopPropagation(); setScale(s => Math.max(s * 0.8, 0.2)); }, 'Zoom Out',
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/></svg>)}
                <span className="mono" style={{ fontSize: 8, color: 'rgba(244,239,230,0.4)', letterSpacing: '0.1em', minWidth: 34, textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
                {toolbarBtn((e) => { e.stopPropagation(); setScale(s => Math.min(s * 1.25, 5)); }, 'Zoom In',
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>)}
                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', margin: '0 2px' }} />
                {toolbarBtn((e) => { e.stopPropagation(); resetView(); }, 'Fit to View',
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>)}
                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', margin: '0 2px' }} />
                {toolbarBtn((e) => { e.stopPropagation(); setBlueprintMode(m => !m); }, blueprintMode ? 'White Mode' : 'Blueprint Mode',
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
                    blueprintMode)}
            </div>
            <div style={{ position: 'absolute', top: 10, left: 12, fontFamily: 'IBM Plex Mono,monospace', fontSize: 8,
                color: 'rgba(244,239,230,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase',
                pointerEvents: 'none', userSelect: 'none',
            }}>{blueprintMode ? 'Blueprint View - Drag to Pan | Scroll to Zoom' : 'Drag to Pan | Scroll to Zoom'}</div>
        </div>
    );
};

// â"€â"€â"€ DESIGN GENERATOR â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const DesignGenerator = ({ onOpenModal }) => {
    const initialSessionRef = useRef(getInitialStudioSession());
    const initialSession = initialSessionRef.current;
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [accessTokenExpiry, setAccessTokenExpiry] = useState(null);
    const [passkeyInput, setPasskeyInput] = useState('');
    const [unlockStatus, setUnlockStatus] = useState('idle');

    const [formData, setFormData] = useState(() => ({ ...DEFAULT_FORM_DATA, ...(initialSession?.formData || {}) }));

    const [status, setStatus] = useState(() => initialSession?.status || 'idle');
    const [planSvg, setPlanSvg] = useState(() => initialSession?.planSvg || null);
    const [planSpec, setPlanSpec] = useState(() => initialSession?.planSpec || null);
    const [refinementHistory, setRefinementHistory] = useState(() => initialSession?.refinementHistory || []);
    const [refinementsLeft, setRefinementsLeft] = useState(() => Number.isFinite(initialSession?.refinementsLeft) ? initialSession.refinementsLeft : 10);
    const [zoomImage, setZoomImage] = useState(null);
    const [galleryId, setGalleryId] = useState(() => initialSession?.galleryId || null);
    const [planScore, setPlanScore] = useState(() => initialSession?.planScore ?? null);
    const [footprintInfo, setFootprintInfo] = useState(() => initialSession?.footprintInfo ?? null);
    const [openingDiagnostics, setOpeningDiagnostics] = useState(() => initialSession?.openingDiagnostics ?? null);
    const [alternatives, setAlternatives] = useState(() => initialSession?.alternatives || []);
    const [showAlternatives, setShowAlternatives] = useState(false);
    const [optionSequence, setOptionSequence] = useState(() => initialSession?.optionSequence || []);
    const [currentOptionIndex, setCurrentOptionIndex] = useState(0);
    const [isExportingEstimateXlsx, setIsExportingEstimateXlsx] = useState(false);
    const [renderLaunchSignal, setRenderLaunchSignal] = useState(0);
    const [renderResetKey, setRenderResetKey] = useState(0);
    const [renderPanelStatus, setRenderPanelStatus] = useState(() => normalizeRenderState(initialSession?.renderState).status);
    const [renderState, setRenderState] = useState(() => normalizeRenderState(initialSession?.renderState));

    useEffect(() => {
        try {
            const s = JSON.parse(localStorage.getItem(STUDIO_UNLOCK_KEY) || 'null');
            const expiresAt = s?.expiresAt ? Date.parse(s.expiresAt) : NaN;
            if (s?.token && Number.isFinite(expiresAt) && expiresAt > Date.now()) {
                setIsUnlocked(true);
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
        alert(`Unlock advanced features with a passkey to use ${featureLabel}.`);
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
        setStatus('loading-plan');
        setShowAlternatives(false);
        try {
            const res = await fetch('/api/plan', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ surveyData:formData, chatHistory:[] }) });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
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
            setOptionSequence([bestOption, ...altOptions]);
            setCurrentOptionIndex(0);
            setRenderState(createEmptyRenderState());
            setRenderResetKey(k => k + 1);
            setRenderPanelStatus('idle');
            setStatus('plan-ready');
        } catch(err) { alert('Error: ' + err.message); setStatus('idle'); }
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

            setPlanSvg(data.svg);
            setPlanSpec(data.planSpec ? { ...data.planSpec, estimate: data.estimate || data.planSpec?.estimate || null } : null);
            setOpeningDiagnostics(data.openingDiagnostics || data.planSpec?.openingDiagnostics || null);
            if (data.galleryId) setGalleryId(data.galleryId);
            setRenderState(createEmptyRenderState());
            setRenderResetKey(k => k + 1);
            setRenderPanelStatus('idle');
            setRefinementHistory(prev => [...prev, { role:'assistant', content: summary }]);
            setRefinementsLeft(prev => prev - 1);
            setStatus('plan-ready');
        } catch(err) {
            console.error('[refine]', err);
            setRefinementHistory(prev => [...prev, { role:'error', content: err.message }]);
            setStatus('plan-ready');
        }
    };

    const downloadBlueprint = async () => {
    try {
        const pngUrl = await composeBlueprintPresentationSheet({
            planSvg,
            elevations: planSpec?.elevations || null,
            formData,
            footprintInfo,
            renderImage: renderState?.image || null,
        }) || await svgToPngDataUrl(planSvg, {
            background: '#F6F4EF',
            pixelRatio: 3,
        });

        const l = document.createElement('a');
        l.href = pngUrl;
        l.download = buildPlanExportFilename(formData, 'floor plan', 'png');
        document.body.appendChild(l);
        l.click();
        l.remove();
    } catch (err) {
        console.error('[downloadBlueprint]', err);
        alert('Download failed.');
        }
    };

    const downloadElevations = async () => {
        if (!planSpec?.elevations) { alert('No elevations to export yet.'); return; }
        try {
            const pngUrl = await composeElevationReferenceSheet(planSpec.elevations);
            if (!pngUrl) throw new Error('Unable to build elevation sheet');
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = buildPlanExportFilename(formData, 'elevation set', 'png');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('[downloadElevations]', err);
            alert('Elevation export failed.');
        }
    };

    const downloadDxf = () => {
        if (!planSpec || !planSpec.levels) { alert('No plan to export.'); return; }
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
            alert('DXF export failed: ' + err.message);
        }
    };

    const downloadRenderImage = () => {
        if (!requireAdvancedAccess('Exterior Render')) return;
        if (!renderState?.image) { alert('Generate an exterior render first.'); return; }
        const link = document.createElement('a');
        link.href = renderState.image;
        link.download = buildPlanExportFilename(formData, 'exterior render', 'png');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const downloadEstimateXlsx = async () => {
        const estimate = planSpec?.estimate || null;
        if (!planSpec || !estimate) { alert('No estimate to export yet.'); return; }
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
            alert('Estimate XLSX export failed: ' + err.message);
        } finally {
            setIsExportingEstimateXlsx(false);
        }
    };

    const launchRenderSurvey = () => {
        if (!planSpec || !planSvg) {
            alert('Generate a plan first.');
            return;
        }
        if (!requireAdvancedAccess('Exterior Render')) return;
        if (renderPanelStatus === 'loading') return;
        setRenderLaunchSignal((value) => value + 1);
    };

    const actionButtonClass = (disabled = false) =>
        'px-4 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] shadow-md text-white ks-action-btn';

    const actionButtonStyle = (_disabled = false) => undefined;

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
        <section id="generator" className="py-14 md:py-[4.75rem] px-4 md:px-10" style={{background:'linear-gradient(180deg, #ECE3D3 0%, #F7F2E9 58%, #F3EEE6 100%)'}}>
            <div className="site-shell">
                {/* Lightbox */}
                <AnimatePresence>
                    {zoomImage && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setZoomImage(null)}
                            className="fixed inset-0 z-[200] bg-ink/93 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out">
                            {typeof zoomImage === 'string' && zoomImage.startsWith('<svg')
                                ? <div className="bg-white p-4 md:p-8 max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl rounded-sm" dangerouslySetInnerHTML={{__html:zoomImage}}/>
                                : <img src={zoomImage} className="max-h-[90vh] max-w-full object-contain rounded-sm" alt="Zoom"/>}
                            <button type="button" onClick={() => setZoomImage(null)} aria-label="Close zoomed plan" className="absolute top-4 right-4 text-white/40 hover:text-white">
                                <CloseIcon className="w-6 h-6"/>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Advanced feature unlock */}
                {!isUnlocked && (
                    <div className="studio-access-grid mb-8">
                        <div className="dream-panel studio-access-card p-6 md:p-8">
                            <div className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center mb-5">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                            </div>
                            <span className="section-label" style={{color:'rgba(244,239,230,0.56)'}}>Unlock advanced features</span>
                            <h3 className="cg text-white mt-4" style={{fontSize:'clamp(1.9rem, 3vw, 2.6rem)',letterSpacing:'-0.05em',textTransform:'uppercase',lineHeight:0.94}}>
                                Floor plans and elevations are free. Renders, DXF, refinements, and the cost estimate unlock with a passkey.
                            </h3>
                            <p className="mt-4 text-sm leading-relaxed" style={{color:'rgba(244,239,230,0.66)'}}>
                                Start with the sample brief or create your own. If you want the advanced package during the trial phase, request access and we will send you a passkey.
                            </p>
                            <form onSubmit={handleUnlock} className="space-y-3 mt-6">
                                <input type="password" placeholder="Enter access code" className="text-center tracking-[0.2em]" value={passkeyInput} onChange={e=>setPasskeyInput(e.target.value)} required style={{background:'rgba(255,255,255,0.92)',borderColor:'rgba(255,255,255,0.2)'}}/>
                                <button type="submit" disabled={unlockStatus==='loading'} className="cta-hero cta-glow w-full">{unlockStatus==='loading'?'Verifying...':'Unlock Advanced Tools'}</button>
                            </form>
                            {unlockStatus.startsWith('error:') && <p className="mt-3 mono text-[9px] uppercase font-bold text-red">{unlockStatus.replace('error:','')}</p>}
                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <div className="studio-metric">
                                    <strong>Free</strong>
                                    <span className="text-[11px] uppercase tracking-[0.18em]" style={{color:'rgba(244,239,230,0.5)'}}>plan + elevations</span>
                                </div>
                                <div className="studio-metric">
                                    <strong>4</strong>
                                    <span className="text-[11px] uppercase tracking-[0.18em]" style={{color:'rgba(244,239,230,0.5)'}}>advanced tools</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-5 border-t border-white/10">
                                <p className="text-[11px]" style={{color:'rgba(244,239,230,0.6)'}}>Need a trial passkey?</p>
                                <button onClick={onOpenModal} className="mt-3 cta-hero cta-glow-soft">
                                    Request Trial Access
                                </button>
                            </div>
                        </div>
                        <div className="paper-panel studio-preview-card p-5 md:p-6">
                            <span className="section-label" style={{color:'rgba(10,10,12,0.44)'}}>What opens up</span>
                            <h3 className="cg mt-4" style={{fontSize:'clamp(1.85rem, 3vw, 2.5rem)',lineHeight:0.95,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                The house starts feeling real before you ever learn drafting software.
                            </h3>
                            <p className="mt-4 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.64)'}}>
                                Tell Keystone what you want, how you want to live, and what matters most. The result is a floor plan first, elevations second, and the advanced package when you unlock it.
                            </p>
                            <div className="studio-preview-rail mt-5">
                                {LIVE_STUDIO_PREVIEW.map((item) => (
                                    <article key={item.label} className="studio-preview-browser">
                                        <div className="proof-browser-top">
                                            <div className="bc-dot" style={{background:'#FF5F57'}}/>
                                            <div className="bc-dot" style={{background:'#FFBD2E'}}/>
                                            <div className="bc-dot" style={{background:'#28C840'}}/>
                                            <span className="mono text-[8px] ml-3" style={{color:'rgba(255,255,255,0.32)',letterSpacing:'0.16em'}}>{item.label}</span>
                                        </div>
                                        <div className="studio-preview-screen">
                                            <SmartImage src={item.image} alt={item.alt} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                                        </div>
                                        <div className="studio-preview-copy">
                                            <strong>{item.title}</strong>
                                            <p>{item.body}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            <div className="unlock-preview-grid mt-5">
                                {GENERATOR_UNLOCK_PREVIEW.map((item) => (
                                    <div key={item.label} className="unlock-preview-card" style={{background:'rgba(255,255,255,0.64)',borderColor:'rgba(10,10,12,0.08)'}}>
                                        <div className="mono text-[8px] uppercase tracking-[0.2em]" style={{color:'rgba(10,10,12,0.42)'}}>{item.label}</div>
                                        <p style={{color:'rgba(10,10,12,0.66)'}}>{item.body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="transition-opacity">
                    <div className="paper-panel p-4 md:p-5 mb-4">
                        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                            <div>
                                <div className="mono text-[8px] uppercase tracking-[0.24em]" style={{color:'rgba(10,10,12,0.42)'}}>Main actions</div>
                                <p className="text-[12px] leading-relaxed mt-2" style={{color:'rgba(10,10,12,0.64)'}}>
                                    Free today: floor plan and elevations. Unlock advanced features for the Exterior Render, CAD Export (DXF), refinements, and the Cost Estimate workbook.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={launchRenderSurvey} disabled={!planSpec || !planSvg || isLoading || renderPanelStatus === 'loading'} className={actionButtonClass(!planSpec || !planSvg || isLoading || renderPanelStatus === 'loading')} style={actionButtonStyle(!planSpec || !planSvg || isLoading || renderPanelStatus === 'loading')}>
                                    {renderActionLabel}
                                </button>
                                <button onClick={downloadBlueprint} disabled={!planSvg || isLoading} className={actionButtonClass(!planSvg || isLoading)} style={actionButtonStyle(!planSvg || isLoading)}>
                                    Download PNG
                                </button>
                                <button onClick={downloadElevations} disabled={!planSpec?.elevations || isLoading} className={actionButtonClass(!planSpec?.elevations || isLoading)} style={actionButtonStyle(!planSpec?.elevations || isLoading)}>
                                    Elevations PNG
                                </button>
                                <button onClick={downloadRenderImage} disabled={!renderState?.image || isLoading} className={actionButtonClass(!renderState?.image || isLoading)} style={actionButtonStyle(!renderState?.image || isLoading)}>
                                    Exterior Render PNG
                                </button>
                                <button onClick={downloadDxf} disabled={!planSpec || isLoading} className={actionButtonClass(!planSpec || isLoading)} style={actionButtonStyle(!planSpec || isLoading)}>
                                    Export DXF
                                </button>
                                <button onClick={downloadEstimateXlsx} disabled={!planSpec?.estimate || isLoading || isExportingEstimateXlsx} className={actionButtonClass(!planSpec?.estimate || isLoading || isExportingEstimateXlsx)} style={actionButtonStyle(!planSpec?.estimate || isLoading || isExportingEstimateXlsx)}>
                                    {isExportingEstimateXlsx ? 'Building XLSX...' : 'Cost Estimate XLSX'}
                                </button>
                            </div>
                        </div>
                    </div>

                <div className={`grid lg:grid-cols-[300px_minmax(0,1fr)_300px] gap-4 items-start`}>
                    {/* LEFT â€" The Brief */}
                    <div className="cad-panel-brief">
                        <div className="cad-panel-brief-header">
                            <div>
                                <div className="mono text-[7px] uppercase tracking-[0.22em]" style={{color:'rgba(10,10,12,0.36)'}}>The Brief</div>
                                <div className="cg text-sm font-bold" style={{letterSpacing:'-0.02em',marginTop:1}}>Project Parameters</div>
                            </div>
                            {isLoading
                                ? <div className="w-3 h-3 border-[2px] border-blue border-t-transparent rounded-full animate-spin"/>
                                : planSvg
                                    ? <span style={{display:'inline-flex',alignItems:'center',gap:4,background:'rgba(27,79,130,0.1)',color:'var(--blue)',padding:'3px 8px',borderRadius:99,fontSize:8,fontFamily:'IBM Plex Mono,monospace',letterSpacing:'0.14em',textTransform:'uppercase'}}>
                                        <span style={{width:5,height:5,borderRadius:'50%',background:'var(--blue)',display:'inline-block'}}/>Ready
                                      </span>
                                    : null}
                        </div>
                        <div className="cad-panel-brief-body">
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
                        {/* Canvas body */}
                        <div className="cad-canvas-body">
                            {status === 'idle' && (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center" style={{color:'rgba(244,239,230,0.42)'}} role="status" aria-live="polite">
                                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                                    <p className="cg text-2xl text-white" style={{letterSpacing:'-0.05em',textTransform:'uppercase'}}>Awaiting your brief</p>
                                    <p className="mono text-[9px] uppercase tracking-widest mt-2">Complete the survey to generate the first plan</p>
                                </div>
                            )}
                            {isLoading && (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-white" role="status" aria-live="polite">
                                    <div className="w-12 h-12 border-[3px] border-blue border-t-transparent rounded-full animate-spin mb-6"/>
                                    <p className="mono text-[10px] uppercase tracking-widest animate-pulse text-blue">{status==='refining' ? 'Applying refinement...' : 'Generating floor plan...'}</p>
                                    <p className="text-[9px] mt-2" style={{color:'rgba(244,239,230,0.5)'}}>Usually under 5 seconds</p>
                                </div>
                            )}
                            {(status === 'plan-ready' || status === 'refining') && planSvg && (
                                <InteractiveCanvas>
                                    <BlueprintPresentationSheet
                                        planSvg={planSvg}
                                        elevations={planSpec?.elevations}
                                        formData={formData}
                                        footprintInfo={footprintInfo}
                                        renderImage={renderState?.image || null}
                                    />
                                </InteractiveCanvas>
                            )}
                        </div>
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
                                            <p className="mono text-[8px] uppercase tracking-[0.2em]" style={{color:'rgba(10,10,12,0.42)'}}>Action bar</p>
                                            <p className="text-[10px] leading-relaxed mt-2" style={{color:'rgba(10,10,12,0.64)'}}>
                                                Main exports and the 3D render action now live in the orange command bar above the studio columns.
                                            </p>
                                        </div>
                                        {optionSequence.length > 1 && (
                                            <button onClick={() => setShowAlternatives(true)} className="w-full cta-secondary py-3 text-[10px]">View Options ({optionSequence.length})</button>
                                        )}
                                    </div>
                                </div>
                                {isUnlocked ? (
                                    <div className="paper-panel">
                                        <RefinementPanel planSpec={planSpec} formData={formData} refinementsLeft={refinementsLeft} refinementHistory={refinementHistory} onRefine={handleRefine} isLoading={isLoading}/>
                                    </div>
                                ) : (
                                    <div className="paper-panel p-5">
                                        <p className="mono text-[8px] uppercase tracking-[0.2em]" style={{color:'rgba(10,10,12,0.42)'}}>Advanced refinement</p>
                                        <p className="text-[11px] leading-relaxed mt-2" style={{color:'rgba(10,10,12,0.64)'}}>
                                            Free mode gives you the first plan and elevations. Unlock advanced access to refine, export DXF, generate renders, and download the Cost Estimate workbook.
                                        </p>
                                    </div>
                                )}
                                <ElevationsPanel elevations={planSpec?.elevations} formData={formData} onOpenPreview={img=>setZoomImage(img)}/>
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
                                        initialState={null}
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

                {(status === 'plan-ready' || status === 'refining') && planSvg && (
                    <div className="paper-panel mt-4 overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-black/5 bg-white/40">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                                <div>
                                    <span className="section-label">Plan Summary + Estimate</span>
                                    <p className="text-[12px] leading-relaxed mt-2" style={{color:'rgba(10,10,12,0.62)'}}>
                                        Review the plan summary and the concept-level Cost Estimate together below the main studio workspace.
                                    </p>
                                </div>
                                <span className="mono text-[8px] uppercase tracking-[0.22em]" style={{color:'rgba(10,10,12,0.42)'}}>
                                    Footer review panel
                                </span>
                            </div>
                        </div>
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
                                                <p className="mono text-[8px] uppercase tracking-[0.24em]" style={{color:'rgba(27,79,130,0.82)'}}>Cost estimate</p>
                                                <p className="text-[13px] leading-relaxed mt-2" style={{color:'rgba(10,10,12,0.62)'}}>
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
                )}
                </div>

                        {/* Ã¢"â‚¬Ã¢"â‚¬ ALTERNATIVES MODAL Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ */}
                        {showAlternatives && optionSequence.length > 0 && (() => {
                            const opt = optionSequence[currentOptionIndex] || optionSequence[0];
                            const isActive = currentOptionIndex === 0 && planSvg === opt?.svg;
                            return (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.7)'}}>
                                <div className="bg-paper rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                                    {/* Header with option navigation */}
                                    <div className="flex items-center justify-between p-4 border-b border-black/10">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setCurrentOptionIndex(i => Math.max(0, i - 1))}
                                                disabled={currentOptionIndex === 0}
                                                className="w-8 h-8 flex items-center justify-center rounded border border-black/10 hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                                            </button>
                                            <div className="text-center">
                                                <h3 className="font-semibold text-sm">Option {currentOptionIndex + 1} of {optionSequence.length}</h3>
                                                <p className="mono text-[8px] text-mid mt-0.5 uppercase tracking-widest">
                                                    {opt?.functionalLabel || `Option ${currentOptionIndex + 1}`}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setCurrentOptionIndex(i => Math.min(optionSequence.length - 1, i + 1))}
                                                disabled={currentOptionIndex >= optionSequence.length - 1}
                                                className="w-8 h-8 flex items-center justify-center rounded border border-black/10 hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                            </button>
                                        </div>
                                        <button onClick={() => setShowAlternatives(false)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-black/8 text-mid hover:text-ink transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                    </div>

                                    {/* Option dots */}
                                    <div className="flex items-center justify-center gap-2 py-2 border-b border-black/5">
                                        {optionSequence.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentOptionIndex(i)}
                                                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentOptionIndex ? 'bg-blue' : 'bg-black/15 hover:bg-black/30'}`}
                                                title={`Option ${i + 1}: ${optionSequence[i]?.functionalLabel || ''}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Plan preview */}
                                    <div className="overflow-y-auto p-4 flex-1">
                                        <div className="bg-white rounded-lg border border-black/8 p-3 overflow-hidden" style={{maxHeight:'50vh'}} dangerouslySetInnerHTML={{__html: opt?.svg || '<p style="padding:20px;color:#999;font-size:11px">Preview unavailable</p>'}}/>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div>
                                                <span className="mono text-[8px] text-mid">
                                                    {opt?.footprintInfo ? `${opt.footprintInfo.widthFt} x ${opt.footprintInfo.heightFt} ft` : ''}
                                                </span>
                                                {opt?.footprintInfo?.aspectRatio && (
                                                    <span className="mono text-[8px] text-mid ml-3">ratio {opt.footprintInfo.aspectRatio.toFixed(2)}</span>
                                                )}
                                            </div>
                                            {opt?.score !== undefined && (
                                                <span className="mono text-[8px] text-mid">Score {opt.score}/100</span>
                                            )}
                                        </div>
                                        {opt?.openingDiagnostics?.profiles && (
                                            <p className="mono text-[7px] mt-1" style={{color:'rgba(10,10,12,0.5)'}}>
                                                {profileLabel(opt.openingDiagnostics.profiles.openingProfile)} • {profileLabel(opt.openingDiagnostics.profiles.doorwayProfile)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Footer with select button */}
                                    <div className="p-3 border-t border-black/10 bg-paper/40 flex items-center justify-between">
                                        <p className="mono text-[7px] text-mid">
                                            Option 1 is the highest-scoring design. Use arrows or dots to browse.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setPlanSvg(opt.svg);
                                                setPlanSpec(opt.planSpec);
                                                setPlanScore(opt.score);
                                                setFootprintInfo(opt.footprintInfo);
                                                setOpeningDiagnostics(opt.openingDiagnostics || opt.planSpec?.openingDiagnostics || null);
                                                setRenderState(createEmptyRenderState());
                                                setRenderResetKey(k => k + 1);
                                                setRenderPanelStatus('idle');
                                                setShowAlternatives(false);
                                            }}
                                            className="cta-hero text-[10px] px-4 py-2"
                                        >
                                            Use This Option
                                        </button>
                                    </div>
                                </div>
                            </div>
                            );
                        })()}
            </div>
        </section>
    );
};

// Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ APP Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬
const HOME_NAV_ITEMS = [
    { label:'Platform', kind:'section', value:'work' },
    { label:'How It Works', kind:'path', value:'/how-floor-plans-work' },
    { label:'Roadmap', kind:'path', value:'/roadmap' },
    { label:'Guided Workflow', kind:'path', value:'/b2b-workflow' },
    { label:'FAQ', kind:'path', value:'/faq' },
];
const PAGE_NAV_LINKS = [
    ['Home', '/'],
    ['How It Works', '/how-floor-plans-work'],
    ['Roadmap', '/roadmap'],
    ['Guided Workflow', '/b2b-workflow'],
    ['FAQ', '/faq'],
    ['Live Studio', '/#generator'],
];
const FOOTER_SECTION_LINKS = [
    ['Work', 'work'],
    ['Services', 'services'],
    ['Pricing', 'pricing'],
    ['Studio', 'studio'],
    ['Live Studio', 'generator'],
    ['Sessions', 'gallery'],
];
const RESOURCE_PAGE_LINKS = [
    ['How Floor Plans Work', '/how-floor-plans-work'],
    ['Guided Workflow', '/b2b-workflow'],
    ['Roadmap', '/roadmap'],
    ['FAQ', '/faq'],
    ['Privacy', '/privacy'],
    ['Terms', '/terms'],
];
const PLATFORM_PAGE_CARDS = [
    {
        eyebrow: 'Methodology',
        title: 'How Keystone turns what you want into a first working floor plan.',
        body: 'The floor-plan page explains the intake, plan logic, output review, and professional limits in plain language.',
        href: '/how-floor-plans-work',
        cta: 'View Methodology',
        image: ASSETS.exampleBlueprint,
        alt: 'Keystone sample blueprint methodology preview',
        stat: '4 steps',
    },
    {
        eyebrow: 'Studio workflow',
        title: 'See how the guided brief becomes a plan, elevations, and the optional advanced package.',
        body: 'Follow the path from plain-language survey to floor plan, elevations, exterior render, cost estimate, and export-ready files.',
        href: '/b2b-workflow',
        cta: 'View Workflow',
        image: ASSETS.workflow.planReview,
        alt: 'Home planning workflow inside Keystone',
        stat: 'Step by step',
    },
    {
        eyebrow: 'Product roadmap',
        title: 'What is live today, what is next, and where 3D, scheduling, and estimates fit.',
        body: 'The roadmap page separates live capability like elevations, CAD export, and the Cost Estimate from what is still next, like scheduling and deeper 3D tools.',
        href: '/roadmap',
        cta: 'View Roadmap',
        image: ASSETS.roadmap.overview,
        alt: 'Keystone roadmap overview collage with plans, 3D concept, and schedule cards',
        stat: 'Live + next',
    },
];
const LIVE_NOW_FEATURES = [
    'Guided brief in plain language',
    'Generated floor plan + blueprint image',
    'Elevation views',
    'Cost Estimate workbook',
    'CAD Export (DXF)',
    'Exterior Render',
];
const HERO_SIGNAL_CARDS = [
    {
        label: 'Live today',
        value: 'Brief -> plan -> elevations -> cost',
        note: 'One guided brief becomes a real home concept package without drafting knowledge.',
    },
    {
        label: 'Best fit',
        value: 'First-time home builders',
        note: 'Built for people who know what they want in a house, but not how to draw it.',
    },
    {
        label: 'Trial phase',
        value: 'Free floor plan + elevations',
        note: 'The advanced package unlocks during the trial phase with a passkey after request.',
    },
];
const SAMPLE_SESSION_STEPS = [
    {
        number: '01',
        title: 'Tell Keystone what you want',
        body: 'Answer the guided survey in plain language instead of trying to explain your dream house in technical terms.',
    },
    {
        number: '02',
        title: 'Your brief becomes a real layout',
        body: 'Room count, area target, light priorities, and lot cues become a working floor plan and elevations you can actually react to.',
    },
    {
        number: '03',
        title: 'Review the first package',
        body: 'Keystone scores multiple footprint options, keeps the strongest one, and prepares the plan, elevations, and core summary together.',
    },
    {
        number: '04',
        title: 'Unlock the advanced package',
        body: 'With a passkey, the same approved geometry can also become an Exterior Render, Cost Estimate workbook, and CAD export.',
    },
];
const GENERATOR_FLOW_STEPS = [
    { label: 'Answer', body: 'Move through the guided intake in plain language.' },
    { label: 'Compare', body: 'Review the strongest plan and alternatives side by side.' },
    { label: 'Export', body: 'Download the blueprint and elevation sheet immediately.' },
    { label: 'Unlock', body: 'Use a passkey later for renders, refinements, the Cost Estimate workbook, and CAD export.' },
];
const GENERATOR_UNLOCK_PREVIEW = [
    { label: 'Free', body: 'Generate the floor plan and elevation set without needing a passkey.' },
    { label: 'Unlocked', body: 'Add refinements, Exterior Render, Cost Estimate, and CAD export after you request trial access.' },
    { label: 'Made for people', body: 'You do not need a technical background to describe the house you want.' },
];
const LIVE_STUDIO_PREVIEW = [
    {
        label: 'Plan + elevation set',
        title: 'You get a real concept package, not just a mood board.',
        body: 'A scored plan and matching elevations make the house easier to understand before anyone opens CAD.',
        image: ASSETS.exampleBlueprint,
        alt: 'Keystone generated blueprint preview',
    },
    {
        label: 'Exterior render',
        title: 'Mood can be added without losing the house.',
        body: 'The render stays grounded in the same geometry, so the house still matches the plan and elevations.',
        image: ASSETS.exampleRender,
        alt: 'Keystone exterior study preview',
    },
];
const SERVICE_BENEFITS = [
    {
        eyebrow: 'Before you build',
        title: 'You can finally see what you have been describing.',
        body: 'Rooms, light, lifestyle, and priorities become something visual instead of a vague idea in your head.',
    },
    {
        eyebrow: 'No technical barrier',
        title: 'You do not need drafting language to use it.',
        body: 'The survey is written for real people, so the process feels understandable from the first screen.',
    },
    {
        eyebrow: 'Clear next step',
        title: 'You leave with something real to compare and discuss.',
        body: 'A saved plan, elevation set, and optional advanced package give you something specific to refine with confidence.',
    },
];
const navHref = (item, home = false) => item.kind === 'section' ? (home ? `#${item.value}` : homeSectionHref(item.value)) : item.value;

const SiteFooter = ({ home = false }) => (
    <footer style={{background:'var(--night)',padding:'3.75rem 0',borderTop:'1px solid rgba(255,106,55,0.18)'}}>
        <div className="site-shell">
            <div className="grid md:grid-cols-[1.15fr_0.9fr_0.9fr_1fr] gap-8 items-start">
                <div>
                    <BrandLockup href="/" reverse compact/>
                    <p className="text-sm leading-relaxed mt-4" style={{color:'rgba(244,239,230,0.58)'}}>
                        Keystone helps homeowners and first-time home builders turn what they want into a floor plan, elevations, an exterior render, and an early cost estimate.
                    </p>
                </div>
                <div>
                    <p className="mono text-[10px] uppercase tracking-[0.24em]" style={{color:'rgba(244,239,230,0.34)'}}>Explore</p>
                    <div className="grid gap-3 mt-4 mono text-[10px] uppercase tracking-[0.22em]">
                        {FOOTER_SECTION_LINKS.map(([label, id]) => (
                            <a key={id} href={home ? `#${id}` : homeSectionHref(id)} className="footer-link">{label}</a>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="mono text-[10px] uppercase tracking-[0.24em]" style={{color:'rgba(244,239,230,0.34)'}}>Read Next</p>
                    <div className="grid gap-3 mt-4 mono text-[10px] uppercase tracking-[0.22em]">
                        {RESOURCE_PAGE_LINKS.map(([label, href]) => (
                            <a key={href} href={href} className="footer-link">{label}</a>
                        ))}
                    </div>
                </div>
                <div style={{border:'1px solid rgba(255,255,255,0.08)',borderRadius:'18px',background:'rgba(255,255,255,0.04)',padding:'1.15rem'}}>
                    <p className="mono text-[10px] uppercase tracking-[0.24em]" style={{color:'rgba(244,239,230,0.34)'}}>Contact</p>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="inline-block mt-4 text-sm" style={{color:'rgba(244,239,230,0.82)'}}>{CONTACT_EMAIL}</a>
                    <div className="grid gap-2 mt-5">
                        {LIVE_NOW_FEATURES.map((item) => (
                            <div key={item} className="flex items-start gap-2 text-[12px] leading-relaxed" style={{color:'rgba(244,239,230,0.56)'}}>
                                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{background:'var(--accent)'}}/>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-10 pt-5 flex flex-col md:flex-row justify-between gap-4 mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(244,239,230,0.26)'}}>
                <span>Copyright 2026 {BRAND_DISPLAY_NAME}</span>
                <span>Legal pages last updated {LEGAL_UPDATED_AT}</span>
            </div>
        </div>
    </footer>
);

const PageNav = ({ onOpenModal }) => (
    <nav className="fixed top-0 w-full z-40 h-[64px] flex items-center justify-between px-5 md:px-10"
        style={{background:'rgba(245,240,233,0.84)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',borderBottom:'1px solid rgba(9,9,9,0.08)'}}>
        <BrandLockup href="/" compact/>
        <div className="hidden md:flex items-center gap-6 mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(9,9,9,0.54)'}}>
            {PAGE_NAV_LINKS.map(([label, href]) => (
                <a key={href} href={href} className="transition-colors hover:text-black">{label}</a>
            ))}
            <button onClick={onOpenModal} className="cta-hero cta-glow-soft px-5 py-3 text-[11px]">
                Unlock Advanced Features
            </button>
        </div>
        <div className="md:hidden flex items-center gap-2">
            <a href="/#generator" className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(9,9,9,0.56)'}}>Live Studio</a>
            <button onClick={onOpenModal} className="cta-hero cta-glow-soft px-4 py-2 text-[10px]">Unlock</button>
        </div>
    </nav>
);

const SubpageChrome = ({ children }) => {
    const [isModalOpen, setModalOpen] = useState(false);

    return (
        <div>
            <JoinModal isOpen={isModalOpen} onClose={() => setModalOpen(false)}/>
            <PageNav onOpenModal={() => setModalOpen(true)}/>
            <main style={{paddingTop:'74px'}}>
                {children({ openModal: () => setModalOpen(true) })}
            </main>
            <SiteFooter/>
        </div>
    );
};

const DreamApp = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [heroVisible, setHeroVisible] = useState(true);
    const [isStudioOpen, setStudioOpen] = useState(false);
    const [hasStudioMounted, setHasStudioMounted] = useState(false);
    usePageTitle('Keystone AI - Home Design in Plain Language');

    useEffect(() => {
        const handler = () => setStudioOpen(true);
        document.addEventListener('keystone:open-studio', handler);
        return () => {
            document.removeEventListener('keystone:open-studio', handler);
        };
    }, []);

    useEffect(() => {
        const openFromHash = () => {
            if (window.location.hash === '#generator') {
                setStudioOpen(true);
            }
        };
        openFromHash();
        window.addEventListener('hashchange', openFromHash);
        return () => window.removeEventListener('hashchange', openFromHash);
    }, []);

    useEffect(() => {
        if (isStudioOpen) setHasStudioMounted(true);
    }, [isStudioOpen]);

    useEffect(() => {
        if (isStudioOpen) document.body.classList.add('studio-open');
        else document.body.classList.remove('studio-open');
        return () => document.body.classList.remove('studio-open');
    }, [isStudioOpen]);

    const featuredWorks = [
        {
            eyebrow: 'Generated floor plan',
            title: 'A plan you can react to before talking to a professional.',
            body: 'Room count, circulation intent, and footprint goals become a real plan instead of a vague description.',
            image: ASSETS.exampleBlueprint,
            alt: 'Keystone generated floor plan',
        },
        {
            eyebrow: 'Exterior render',
            title: 'An exterior you can actually feel.',
            body: 'The same brief can produce a visual anchor that helps you respond emotionally while still staying tied to the same house.',
            image: ASSETS.exampleRender,
            alt: 'Keystone exterior render',
        },
        {
            eyebrow: 'Elevation set',
            title: 'The plan now comes with facade views too.',
            body: 'Matching elevations make the output feel closer to a real home concept package before you ever open CAD.',
            image: ASSETS.exampleElevationSheet,
            alt: 'Keystone generated elevation sheet',
        },
    ];
    const trustCards = [
        {
            eyebrow: 'Plain-language workflow',
            title: 'Made for people, not just technical teams.',
            body: 'You answer the brief in everyday language and Keystone translates it into a plan package you can actually understand.',
        },
        {
            eyebrow: 'Live today',
            title: 'Plan, elevations, Cost Estimate, DXF export, and Exterior Render.',
            body: 'Keystone currently covers guided intake, floor plan generation, elevation views, a concept-level Cost Estimate, CAD Export (DXF), and an Exterior Render from the same brief.',
        },
        {
            eyebrow: 'Coming next',
            title: 'Scheduling and deeper 3D remain on the roadmap.',
            body: 'The Cost Estimate is now live. Scheduling, richer viewer tools, and deeper quantity logic are still on the roadmap until they are ready.',
        },
    ];
    const outcomeCards = [
        {
            eyebrow: 'Before you build',
            title: 'You start with something real.',
            body: 'Taste, light, priorities, and rough footprint intent are already translated into something you can compare and discuss.',
            stat: '1 brief',
        },
        {
            eyebrow: 'Inside the studio',
            title: 'The blank page disappears.',
            body: 'Instead of starting from raw notes, you begin with a structured brief, a plan, and an optional visual anchor worth discussing.',
            stat: '<60s',
        },
        {
            eyebrow: 'Across the process',
            title: 'Early confusion starts shrinking.',
            body: 'Keystone helps homeowners make clearer decisions before they spend heavily on drawings, revisions, and miscommunication.',
            stat: 'Clearer',
        },
    ];
    const marqueeItems = [
        'Home design, made understandable',
        'Live floor plan generation',
        'Elevation views',
        'Cost estimate',
        'CAD Export (DXF)',
        'Exterior renders',
        'Made for first-time home builders',
    ];
    const serviceCards = [
        {
            number: '01',
            title: 'You answer the guided brief',
            body: 'Instead of trying to speak in drafting terms, you describe your future home in plain language.',
        },
        {
            number: '02',
            title: 'The brief becomes a house concept',
            body: 'That intake becomes a first residential layout you can review, export, and use as the basis for the real conversation.',
        },
        {
            number: '03',
            title: 'The advanced package unlocks when you need it',
            body: 'Once you request trial access, the same plan can also produce an Exterior Render, Cost Estimate workbook, and CAD export.',
        },
    ];
    const studioMetrics = [
        { value: '<60s', label: 'first floor plan' },
        { value: '4 views', label: 'elevation set' },
        { value: 'XLSX', label: 'cost estimate' },
        { value: 'DXF', label: 'cad export' },
        { value: '3D', label: 'exterior render' },
    ];
    const sessionStack = [
        'Guided survey in plain language',
        'Free floor plan + elevations',
        'Passkey-controlled advanced tools',
        'Scored footprint alternatives',
        'Blueprint image export',
        'Elevation SVG set',
        'Cost Estimate workbook',
        'CAD Export (DXF)',
        'Saved studio session state',
        'Exterior render',
        'Recent-session gallery proof',
    ];
    const studioTeam = [
        {
            name: 'Sujan Acharya',
            role: 'Founder and CEO',
            image: ASSETS.team.sujan,
            bio: 'Civil engineering and construction management background. Built Keystone after seeing how hard it is for families to explain the house they want without getting lost in technical language.',
        },
        {
            name: 'Rhythm Bhattarai',
            role: 'CTO',
            image: ASSETS.team.rhythm,
            bio: 'Civil engineer, researcher, and full-stack builder shaping the system that turns survey logic into plan logic.',
        },
        {
            name: 'Subrat Acharya',
            role: 'CFO',
            image: ASSETS.team.subrat,
            bio: 'Financial operator focused on keeping Keystone rigorous, durable, and realistic for homeowners trying to make confident early decisions.',
        },
    ];
    const roadmapCards = [
        'Formatted XLSX estimate export',
        'Deeper quantity logic by assembly',
        'Scheduling and viewer depth',
        'White-label studio branding',
        'CRM handoff for qualified leads',
    ];
    const quoteCards = [
        {
            quote: 'The strongest use case right now is the homeowner who knows what they want, but needs help seeing it clearly for the first time.',
            name: 'Who it is for',
            firm: 'Product direction',
        },
        {
            quote: 'The live promise stays disciplined on purpose: guided intake, generated plan, elevations, a Cost Estimate, CAD export, and an optional Exterior Render. Scheduling and deeper quantity logic come next, but only when they are real.',
            name: 'Scope discipline',
            firm: 'Product truth',
        },
    ];
    const pricingTiers = [
        {
            tag: 'Trial phase',
            price: '$0',
            unit: 'demo floor plan generation',
            desc: 'Currently in trial phase. Start with one free floor plan and the matching elevations, then request access if you want the advanced package.',
            cta: 'Request Trial Access',
            featured: false,
        },
        {
            tag: 'Single session',
            price: '$149',
            unit: '1 project',
            desc: 'After launch: one complete Keystone session for one home project, with unlimited refining and unlimited exterior renders.',
            cta: 'Join Launch List',
            featured: true,
        },
        {
            tag: 'Studio pack',
            price: '$1,099',
            unit: '10 projects',
            desc: 'After launch: a 10-pack for repeat use across multiple home concepts, with the same advanced package available in every project.',
            cta: 'Join Launch List',
            featured: false,
        },
    ];

    useEffect(() => {
        const hero = document.getElementById('hero');
        if (!hero) return;
        const obs = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0.1 });
        obs.observe(hero);
        return () => obs.disconnect();
    }, []);

    return (
        <div className="pb-[60px] md:pb-0">
            <JoinModal isOpen={isModalOpen} onClose={() => setModalOpen(false)}/>
            <ClickSparkGlobal/>
            <SplashCursor SIM_RESOLUTION={32} DYE_RESOLUTION={1440} DENSITY_DISSIPATION={8} VELOCITY_DISSIPATION={0.6} PRESSURE={0.1} CURL={2} SPLAT_RADIUS={0.12} SPLAT_FORCE={3000} COLOR_UPDATE_SPEED={8} TRANSPARENT={true}/>
            <MobileNavBar onOpenMenu={() => setMenuOpen(true)}/>
            <MobileMenuOverlay isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} onJoin={() => setModalOpen(true)}/>
            <SectionRail/>

            <AnimatePresence>
                {!heroVisible && (
                    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}
                        className="mobile-cta-float md:hidden">
                        <StarBorderBtn onClick={() => scrollTo('generator')}>
                            <span>Open Live Studio</span>
                            <span className="cta-live-mark"><span className="cta-live-dot"/>Now</span>
                        </StarBorderBtn>
                    </motion.div>
                )}
            </AnimatePresence>

            <main>
                    {/* â"€â"€â"€ NAV â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
                    <motion.nav
                        initial={{ opacity: 0, y: -64 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                        className="fixed top-0 w-full z-40 h-[64px] flex items-center justify-between px-5 md:px-10"
                        style={{background:'rgba(255,253,249,0.92)',backdropFilter:'blur(22px)',WebkitBackdropFilter:'blur(22px)',borderBottom:'1px solid rgba(255,106,55,0.1)'}}>
                        <BrandLockup href="#hero" compact/>
                        <div className="hidden md:flex items-center gap-6 mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(9,9,9,0.52)'}}>
                            {HOME_NAV_ITEMS.map((item) => (
                                <a key={item.label} href={navHref(item, true)} className="transition-colors hover:text-black">{item.label}</a>
                            ))}
                            <button onClick={() => setModalOpen(true)} className="cta-hero cta-glow px-5 py-3 text-[11px]">
                                Unlock Advanced Features
                            </button>
                        </div>
                    </motion.nav>

                        {/* â"€â"€â"€ HERO â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
                        <section id="hero" className="relative overflow-hidden hero-v2-bg"
                            style={{minHeight:'min(90svh, 920px)',paddingTop:'64px'}}>
                            <OrbBackground/>
                            <Waves lineColor="rgba(255,106,55,0.18)" waveSpeedX={0.012} waveSpeedY={0.012} waveAmpX={40} waveAmpY={10} friction={0.62} tension={0.022} maxCursorMove={90} xGap={12} yGap={36}/>
                            <FloatingParticles count={55} color="255,106,55" className="opacity-50"/>
                            <DotGridHero/>
                            <GradualBlur target="parent" position="bottom" height="7rem" strength={2.2} divCount={6} curve="bezier" exponential opacity={1}/>

                            <div className="site-shell relative z-10">
                                <div className="grid lg:grid-cols-[minmax(0,1.08fr)_400px] gap-8 lg:gap-12 items-center pt-10 pb-12 md:pt-14 md:pb-18"
                                    style={{minHeight:'min(calc(86svh - 64px), 740px)'}}>

                                    {/* LEFT COLUMN */}
                                    <div>
                                        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.12}} className="mb-6">
                                            <span className="hero-badge">
                                                <span className="hero-badge-dot"/>
                                                Home design, made understandable
                                            </span>
                                        </motion.div>

                                        <motion.h1 initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.18}}
                                            className="cg leading-[0.84]"
                                            style={{fontSize:'clamp(3.2rem,7.4vw,6.8rem)',letterSpacing:'-0.065em',textTransform:'uppercase',color:'var(--ink)'}}>
                                            <span className="block">Describe the</span>
                                            <span className="block">
                                                <BlurText text="house you want" delay={55} direction="bottom" tag="span"
                                                    className="serif hero-accent-word" style={{ color: '#FF7040' }}/>
                                            </span>
                                            <span className="block" style={{color:'rgba(78,69,61,0.78)'}}>and see it take shape.</span>
                                        </motion.h1>

                                        <motion.p initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.48}}
                                            className="mt-6 max-w-[46rem] leading-relaxed"
                                            style={{fontSize:'clamp(1rem,1.8vw,1.12rem)',color:'rgba(32,26,21,0.68)'}}>
                                            Keystone helps homeowners and first-time home builders turn what they want into a floor plan, elevations, an Exterior Render, and an early Cost Estimate without needing a technical background.
                                        </motion.p>

                                        <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.62}}
                                            className="mt-8 flex flex-col sm:flex-row gap-3 items-start">
                                            <StarBorderBtn onClick={() => scrollTo('generator')} data-cursor-text="Open studio">
                                                <span>Open Live Studio</span>
                                                <span className="cta-live-mark">
                                                    <span className="cta-live-dot"/>
                                                    Try it now
                                                </span>
                                            </StarBorderBtn>
                                            <button onClick={() => setModalOpen(true)} data-cursor-text="Unlock advanced features" className="cta-hero cta-glow-soft">
                                                Unlock Advanced Features
                                            </button>
                                        </motion.div>

                                        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.76}}
                                            className="mt-6 flex flex-wrap gap-2">
                                            {LIVE_NOW_FEATURES.map((item) => (
                                                <span key={item} className="marquee-pill marquee-pill-orange" style={{animation:'none'}}>
                                                    {item}
                                                </span>
                                            ))}
                                        </motion.div>

                                        <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.88}}
                                            className="hero-proof-grid mt-8">
                                            {HERO_SIGNAL_CARDS.map((item) => (
                                                <TiltCard key={item.label} maxTilt={5}>
                                                    <SpotlightCard spotlightColor="rgba(255,106,55,0.16)"
                                                        className="hero-proof-card cursor-target electric-border h-full"
                                                        data-cursor-text={item.label}>
                                                        <div className="mono text-[9px] uppercase tracking-[0.22em]" style={{color:'var(--accent)',opacity:0.7}}>{item.label}</div>
                                                        <h3 className="hero-proof-value">{item.value}</h3>
                                                        <p className="hero-proof-note">{item.note}</p>
                                                    </SpotlightCard>
                                                </TiltCard>
                                            ))}
                                        </motion.div>
                                    </div>

                                    {/* RIGHT PANEL */}
                                    <motion.aside initial={{opacity:0,x:28}} animate={{opacity:1,x:0}} transition={{delay:0.44}}
                                        className="dream-panel p-6 md:p-7 relative overflow-hidden animated-border">
                                        <div className="absolute inset-x-0 top-0 h-px" style={{background:'rgba(255,255,255,0.12)'}}/>
                                        <div className="absolute right-0 bottom-0 w-64 h-64 pointer-events-none" style={{
                                            background:'radial-gradient(circle at 80% 80%, rgba(255,106,55,0.12), transparent 60%)'
                                        }}/>
                                        <span className="section-label" style={{color:'rgba(245,240,233,0.55)'}}>Inside the room</span>
                                        <h2 className="cg text-white mt-4" style={{fontSize:'clamp(1.7rem,3.1vw,2.6rem)',lineHeight:0.92,textTransform:'uppercase',letterSpacing:'-0.055em'}}>
                                            A first pass that already feels worth building on.
                                        </h2>
                                        <p className="mt-3 text-sm leading-relaxed" style={{color:'rgba(244,239,230,0.6)'}}>
                                            You arrive at the next conversation with something you can point to, compare, and refine instead of starting from a blank page.
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 mt-6">
                                            {studioMetrics.map((metric) => (
                                                <div key={metric.label} className="studio-metric">
                                                    <strong>{metric.value}</strong>
                                                    <span className="text-[11px] uppercase tracking-[0.18em]" style={{color:'rgba(244,239,230,0.46)'}}>{metric.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-5 pt-4 border-t border-white/10">
                                            <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(244,239,230,0.46)'}}>How it works</p>
                                            <a href="/how-floor-plans-work" data-cursor-text="Open methodology page" className="inline-block mt-3 text-sm transition-colors hover:text-orange-300" style={{color:'rgba(255,255,255,0.88)'}}>
                                                See how Keystone makes floor plans â†’
                                            </a>
                                        </div>
                                    </motion.aside>
                                </div>
                            </div>
                        </section>

                    <section id="proof" className="proof-shelf relative overflow-hidden">
                        <OrbBackground/>
                        <div className="site-shell relative z-10">
                            <div className="proof-frame p-4 md:p-6">
                                <div className="proof-top-grid">
                                    <div className="p-2 md:p-4">
                                        <Reveal y={12}>
                                        <span className="section-label" style={{color:'rgba(10,10,12,0.44)'}}>Sample session</span>
                                        <div className="orange-line mt-3"/>
                                        </Reveal>
                                        <Reveal y={28} delay={0.08}>
                                        <h2 className="cg mt-5" style={{fontSize:'clamp(2.1rem, 4.6vw, 3.8rem)',lineHeight:0.92,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                            Real output. <GradientText className="serif">No imagination tax.</GradientText>
                                        </h2>
                                        </Reveal>
                                        <Reveal y={16} delay={0.16}>
                                        <p className="mt-4 text-sm md:text-base leading-relaxed" style={{color:'rgba(10,10,12,0.62)'}}>
                                            The fastest way to trust Keystone is to watch the workflow happen in sequence: guided brief, generated plan, elevations, Cost Estimate, CAD export, and optional Exterior Render from the same house.
                                        </p>
                                        <div className="mt-6 flex flex-wrap gap-3">
                                            <StarBorderBtn onClick={() => scrollTo('generator')}>
                                                <span>Try Free Floor Plan</span>
                                                <span className="cta-live-mark"><span className="cta-live-dot"/>Now</span>
                                            </StarBorderBtn>
                                            <a href="/how-floor-plans-work" data-cursor-text="Open methodology page" className="cta-secondary">How Floor Plans Work</a>
                                        </div>
                                        </Reveal>
                                    </div>
                                    <div className="proof-journey-rail mt-2 md:mt-0">
                                        {SAMPLE_SESSION_STEPS.map((item, index) => (
                                            <motion.article key={item.number}
                                                initial={{opacity:0, y:20}}
                                                whileInView={{opacity:1, y:0}}
                                                viewport={{once:true, margin:'-48px'}}
                                                transition={{duration:0.52, delay:index*0.07, ease:[0.22,1,0.36,1]}}>
                                                <TiltCard maxTilt={4}>
                                                    <SpotlightCard spotlightColor="rgba(255,106,55,0.13)"
                                                        className="proof-journey-card cursor-target h-full" data-cursor-text={item.title}>
                                                        <div className="proof-journey-step" style={{background:'var(--accent)',color:'white'}}>{item.number}</div>
                                                        <h3>{item.title}</h3>
                                                        <p>{item.body}</p>
                                                    </SpotlightCard>
                                                </TiltCard>
                                            </motion.article>
                                        ))}
                                    </div>
                                </div>
                                <div className="proof-browsers-grid mt-5">
                                    <TiltCard maxTilt={3}>
                                        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.3}}
                                            className="proof-browser cursor-target h-full" data-cursor-text="Preview plan">
                                            <div className="proof-browser-top">
                                                <div className="bc-dot" style={{background:'#FF5F57'}}/>
                                                <div className="bc-dot" style={{background:'#FFBD2E'}}/>
                                                <div className="bc-dot" style={{background:'#28C840'}}/>
                                                <span className="mono text-[8px] ml-3" style={{color:'rgba(255,255,255,0.32)',letterSpacing:'0.16em'}}>KEYSTONE AI / 2D FLOOR PLAN</span>
                                            </div>
                                            <div className="proof-browser-screen plan">
                                                <div className="diagonal-accent"/>
                                                <SmartImage src={ASSETS.exampleBlueprint} alt="Keystone sample floor plan" style={{width:'100%',display:'block',objectFit:'contain'}}/>
                                            </div>
                                            <div className="proof-caption">
                                                <span className="proof-dot" style={{background:'var(--accent)'}}/>
                                                Client footprint translated into a working blueprint
                                            </div>
                                        </motion.div>
                                    </TiltCard>
                                    <TiltCard maxTilt={3}>
                                        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.3}} transition={{delay:0.08}}
                                            className="proof-browser cursor-target h-full" data-cursor-text="Preview study">
                                            <div className="proof-browser-top">
                                                <div className="bc-dot" style={{background:'#FF5F57'}}/>
                                                <div className="bc-dot" style={{background:'#FFBD2E'}}/>
                                                <div className="bc-dot" style={{background:'#28C840'}}/>
                                                <span className="mono text-[8px] ml-3" style={{color:'rgba(255,255,255,0.32)',letterSpacing:'0.16em'}}>KEYSTONE AI / EXTERIOR RENDER</span>
                                            </div>
                                            <div className="proof-browser-screen" style={{minHeight:'100%'}}>
                                                <SmartImage src={ASSETS.exampleRender} alt="Keystone sample exterior render" style={{width:'100%',height:'100%',minHeight:'320px',objectFit:'cover',display:'block'}}/>
                                                <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg, rgba(9,9,9,0.02) 0%, rgba(9,9,9,0.48) 100%)'}}/>
                                                <div className="proof-caption" style={{position:'absolute',left:0,right:0,bottom:0,borderTop:'none',color:'rgba(255,255,255,0.72)',background:'linear-gradient(180deg, transparent, rgba(9,9,9,0.58))'}}>
                                                    <span className="proof-dot" style={{background:'var(--accent)'}}/>
                                                    The same brief, now felt as a real house
                                                </div>
                                            </div>
                                        </motion.div>
                                    </TiltCard>
                                </div>
                                <div className="proof-card-row mt-4">
                                    {trustCards.map((item, index) => (
                                        <motion.div key={item.title}
                                            initial={{opacity:0, y:18}}
                                            whileInView={{opacity:1, y:0}}
                                            viewport={{once:true, margin:'-48px'}}
                                            transition={{duration:0.52, delay:index*0.06, ease:[0.22,1,0.36,1]}}>
                                            <SpotlightCard spotlightColor="rgba(255,106,55,0.1)"
                                                className="proof-mini-tile cursor-target h-full" data-cursor-text={item.eyebrow}>
                                                <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'var(--accent)',opacity:0.8}}>{item.eyebrow}</div>
                                                <p className="cg mt-2 text-[1.15rem] leading-[1.02]" style={{color:'var(--ink)'}}>{item.title}</p>
                                                <p className="mt-2 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.78)'}}>{item.body}</p>
                                            </SpotlightCard>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="proof-card-row mt-4">
                                    {featuredWorks.map((item, index) => (
                                        <motion.article key={item.eyebrow} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.3}} transition={{delay:index * 0.08}}
                                            className="proof-feature-card cursor-target" data-cursor-text={item.eyebrow}>
                                            <div className="proof-feature-thumb">
                                                <SmartImage src={item.image} alt={item.alt} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                                            </div>
                                            <div className="proof-feature-copy">
                                                <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'var(--accent)',opacity:0.8}}>{item.eyebrow}</div>
                                                <h3 className="cg mt-3 text-[1.3rem] leading-[0.98]" style={{color:'var(--ink)'}}>{item.title}</h3>
                                                <p className="mt-3 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.62)'}}>{item.body}</p>
                                            </div>
                                        </motion.article>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="defer-section py-12 md:py-14 relative overflow-hidden" style={{background:'var(--paper)'}}>
                        <FloatingParticles count={30} color="255,106,55" className="opacity-30"/>
                        <div className="site-shell relative z-10">
                            <Reveal y={24}>
                                <TiltCard maxTilt={2}>
                                    <SpotlightCard spotlightColor="rgba(255,106,55,0.12)" className="paper-panel p-7 md:p-10">
                                        <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-8 items-end">
                                            <div>
                                                <span className="section-label" style={{color:'rgba(9,9,9,0.42)'}}>Live studio</span>
                                                <div className="orange-line mt-3 mb-5"/>
                                                <h2 className="cg mt-6" style={{fontSize:'clamp(2.6rem, 6vw, 4.8rem)',lineHeight:0.9,letterSpacing:'-0.05em',textTransform:'uppercase',color:'var(--ink)'}}>
                                                    Try the real workflow, not a teaser.
                                                </h2>
                                                <p className="mt-5 max-w-2xl text-base leading-relaxed" style={{color:'rgba(9,9,9,0.62)'}}>
                                                    The same guided workflow behind the hero is right below. Open the live studio, walk through the survey, shape a plan, and see how much you can understand before a formal design meeting.
                                                </p>
                                            </div>
                                            <div className="flex justify-start lg:justify-end">
                                                <StarBorderBtn onClick={() => scrollTo('generator')}>
                                                    <span>Open Live Studio</span>
                                                    <span className="cta-live-mark">
                                                        <span className="cta-live-dot"/>
                                                    Free today
                                                    </span>
                                                </StarBorderBtn>
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                </TiltCard>
                            </Reveal>
                        </div>
                    </section>

                    {/* Studio fullscreen modal */}
                    {hasStudioMounted && (
                        <div
                            className="studio-modal-overlay"
                            style={{
                                opacity: isStudioOpen ? 1 : 0,
                                pointerEvents: isStudioOpen ? 'auto' : 'none',
                                transition: 'opacity 180ms ease',
                            }}
                        >
                            <div
                                className="studio-modal-window"
                                style={{
                                    transform: isStudioOpen ? 'translateY(0px)' : 'translateY(16px)',
                                    opacity: isStudioOpen ? 1 : 0,
                                    transition: 'transform 220ms cubic-bezier(0.22,1,0.36,1), opacity 220ms cubic-bezier(0.22,1,0.36,1)',
                                }}
                            >
                                    <div className="studio-modal-topbar">
                                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                                            <img src={ASSETS.icon} alt="Keystone" style={{width:22,height:22,opacity:0.85}}/>
                                            <span className="cg" style={{fontSize:'1rem',fontWeight:700,letterSpacing:'-0.03em'}}>Live Studio</span>
                                            <span className="mono" style={{fontSize:8,color:'rgba(10,10,12,0.36)',letterSpacing:'0.18em',textTransform:'uppercase',marginLeft:4}}>Keystone AI</span>
                                        </div>
                                        <button className="studio-modal-close" onClick={() => setStudioOpen(false)} aria-label="Close Live Studio">
                                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="studio-modal-body">
                                        <DesignGenerator onOpenModal={() => setModalOpen(true)}/>
                                    </div>
                            </div>
                        </div>
                    )}

                    <Gallery onOpenModal={() => setModalOpen(true)}/>

                    <section className="relative py-5 border-y overflow-hidden" style={{background:'linear-gradient(90deg,#FFF8F5,#FFF3ED,#FFF8F5)',borderColor:'rgba(255,106,55,0.15)'}}>
                        <div className="marquee-wrap">
                            <div className="marquee-track px-5 md:px-10">
                                {[...marqueeItems, ...marqueeItems].map((item, index) => (
                                    <span key={`${item}-${index}`} className="marquee-pill marquee-pill-orange">{item}</span>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="defer-section py-12 md:py-16 relative overflow-hidden" style={{background:'linear-gradient(180deg,#0A0806 0%,#130B05 100%)'}}>
                        <FloatingParticles count={30} color="255,106,55" className="opacity-20"/>
                        <div className="site-shell relative z-10">
                            <Reveal y={16}>
                                <span className="section-label" style={{color:'rgba(255,106,55,0.7)'}}>What's inside</span>
                                <div className="orange-line mt-3 mb-2"/>
                                <h2 className="cg text-white mt-5" style={{fontSize:'clamp(2rem,4.5vw,3.6rem)',lineHeight:0.9,letterSpacing:'-0.05em',textTransform:'uppercase',maxWidth:'32rem'}}>
                                    Every session. <GradientText>Six capabilities.</GradientText>
                                </h2>
                            </Reveal>
                            <div className="mt-8">
                                <MagicBento glowColor="255,106,55" spotlightRadius={420} particleCount={10} clickEffect={true}/>
                            </div>
                        </div>
                    </section>

                    <section id="work" className="defer-section py-14 md:py-[4.75rem]" style={{background:'var(--paper)'}}>
                        <div className="site-shell">
                            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 items-end mb-10 md:mb-12">
                                <div>
                                    <Reveal y={12}>
                                        <span className="section-label">What changes</span>
                                        <div className="orange-line mt-3"/>
                                    </Reveal>
                                    <Reveal y={32} delay={0.08}>
                                    <h2 className="cg mt-6" style={{fontSize:'clamp(2.8rem, 7vw, 5.8rem)',lineHeight:0.9,letterSpacing:'-0.05em',textTransform:'uppercase',color:'var(--ink)'}}>
                                        The point is not more content. <GradientText>Better-prepared</GradientText> first meetings.
                                    </h2>
                                    </Reveal>
                                </div>
                                <Reveal y={16} delay={0.18}>
                                <p className="text-sm md:text-base leading-relaxed" style={{color:'rgba(9,9,9,0.58)'}}>
                                    Keystone works when the person planning the home, the future professional team, and the next decision all feel less vague. These are the shifts the workflow is built to create.
                                </p>
                                </Reveal>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                {outcomeCards.map((item, index) => (
                                    <motion.article key={item.eyebrow} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.3}} transition={{delay:index * 0.08}}>
                                        <TiltCard maxTilt={5} style={{height:'100%'}}>
                                            <SpotlightCard spotlightColor="rgba(255,106,55,0.12)"
                                                className="outcome-card p-6 md:p-7 flex flex-col justify-between min-h-[300px] h-full">
                                                <div>
                                                    <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'var(--accent)',opacity:0.8}}>{item.eyebrow}</div>
                                                    <h3 className="cg mt-5 text-[2rem] leading-[0.94]" style={{color:'var(--ink)'}}>{item.title}</h3>
                                                    <p className="mt-5 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.66)'}}>{item.body}</p>
                                                </div>
                                                <div className="mt-10 pt-5" style={{borderTop:'1px solid rgba(255,106,55,0.15)'}}>
                                                    <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'var(--accent)',opacity:0.7}}>Keystone signal</div>
                                                    <div className="cg mt-3 text-[2.4rem] leading-none gradient-text-anim" style={{letterSpacing:'-0.06em'}}>{item.stat}</div>
                                                </div>
                                            </SpotlightCard>
                                        </TiltCard>
                                    </motion.article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="defer-section py-14 md:py-[4.75rem] relative overflow-hidden" style={{background:'linear-gradient(180deg, #FFFDFC 0%, #F7F1E8 100%)'}}>
                        <OrbBackground/>
                        <FloatingParticles count={28} color="255,106,55" className="opacity-24"/>
                        <div className="site-shell relative z-10">
                            <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-end">
                                <div>
                                    <Reveal y={12}>
                                        <span className="section-label" style={{color:'rgba(9,9,9,0.42)'}}>Platform pages</span>
                                        <div className="orange-line mt-3"/>
                                    </Reveal>
                                    <Reveal y={26} delay={0.08}>
                                        <h2 className="cg mt-6" style={{fontSize:'clamp(2.4rem, 5vw, 4.6rem)',lineHeight:0.9,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                            Three clearer ways to understand Keystone.
                                        </h2>
                                    </Reveal>
                                </div>
                                <Reveal y={16} delay={0.16}>
                                    <p className="text-sm md:text-base leading-relaxed" style={{color:'rgba(9,9,9,0.6)'}}>
                                        The homepage keeps the live product story. These pages go deeper into the floor-plan method, the guided workflow, and the roadmap without flattening everything into one long scroll.
                                    </p>
                                </Reveal>
                            </div>
                            <div className="grid lg:grid-cols-3 gap-4 mt-10">
                                {PLATFORM_PAGE_CARDS.map((card, index) => (
                                    <motion.article key={card.href} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.3}} transition={{delay:index * 0.08}}>
                                        <TiltCard maxTilt={4} style={{height:'100%'}}>
                                            <SpotlightCard spotlightColor="rgba(255,106,55,0.12)" className="h-full" style={{background:'rgba(255,255,255,0.78)',border:'1px solid rgba(255,106,55,0.1)',borderRadius:'22px',overflow:'hidden'}}>
                                                <div style={{aspectRatio:'1 / 0.78',overflow:'hidden',position:'relative'}}>
                                                    <SmartImage src={card.image} alt={card.alt} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                                                    <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg, rgba(9,9,9,0.02) 0%, rgba(9,9,9,0.42) 100%)'}}/>
                                                    <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{position:'absolute',left:'1rem',right:'1rem',top:'1rem',color:'rgba(255,255,255,0.78)'}}>
                                                        {card.eyebrow}
                                                    </div>
                                                    <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{position:'absolute',left:'1rem',bottom:'1rem',color:'white'}}>
                                                        {card.stat}
                                                    </div>
                                                </div>
                                                <div className="p-5 md:p-6">
                                                    <h3 className="cg text-[1.8rem] leading-[0.94]" style={{color:'var(--ink)'}}>{card.title}</h3>
                                                    <p className="mt-4 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.62)'}}>{card.body}</p>
                                                    <a href={card.href} className="cta-secondary mt-6 inline-flex">
                                                        {card.cta}
                                                    </a>
                                                </div>
                                            </SpotlightCard>
                                        </TiltCard>
                                    </motion.article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="services" className="defer-section py-14 md:py-[4.75rem] relative overflow-hidden" style={{background:'linear-gradient(180deg, #ECE3D3 0%, #F7F2E9 60%, #F0EBE1 100%)',color:'var(--ink)'}}>
                        <OrbBackground/>
                        <div className="site-shell relative z-10">
                            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-12 items-end">
                                <div>
                                    <Reveal y={12}>
                                        <span className="section-label" style={{color:'rgba(10,10,12,0.45)'}}>Your workflow</span>
                                        <div className="orange-line mt-3"/>
                                    </Reveal>
                                    <Reveal y={32} delay={0.08}>
                                    <h2 className="cg mt-6" style={{fontSize:'clamp(2.8rem, 7vw, 5.4rem)',lineHeight:0.9,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                        A <GradientText>calmer way</GradientText> to move from first idea to a real house concept.
                                    </h2>
                                    </Reveal>
                                </div>
                                <Reveal y={16} delay={0.18}>
                                <p className="text-sm md:text-base leading-relaxed text-mid">
                                    Keystone is not trying to replace professional judgment. It gives homeowners a clearer starting point before they spend heavily on drawings and revisions.
                                </p>
                                </Reveal>
                            </div>
                            <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 mt-10 items-start">
                                <div className="grid md:grid-cols-3 gap-5 self-start">
                                    {serviceCards.map((card, index) => (
                                        <motion.div key={card.number} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.3}} transition={{delay:index * 0.08}}>
                                            <TiltCard maxTilt={6} style={{height:'100%'}}>
                                                <SpotlightCard spotlightColor="rgba(255,106,55,0.14)"
                                                    className="service-card-v2 p-6 md:p-7 self-start h-full">
                                                    <div className="service-number">{card.number}</div>
                                                    <h3 className="cg mt-5 text-[2rem] leading-[0.96]">{card.title}</h3>
                                                    <p className="mt-4 text-sm leading-relaxed" style={{color:'var(--mid)'}}>{card.body}</p>
                                                </SpotlightCard>
                                            </TiltCard>
                                        </motion.div>
                                    ))}
                                </div>
                                <SpotlightCard spotlightColor="rgba(255,106,55,0.1)" className="paper-panel p-6 md:p-7 self-start">
                                    <div className="mono text-[10px] uppercase tracking-[0.24em]" style={{color:'var(--accent)',opacity:0.8}}>Inside every session</div>
                                    <div className="orange-line mt-3 mb-4"/>
                                    <h3 className="cg mt-5 text-[2.1rem] leading-[0.95]">The full package that makes the house easier to understand.</h3>
                                    <div className="flex flex-wrap gap-2 mt-6">
                                        {sessionStack.map((item) => (
                                            <span key={item} className="session-stack-pill">{item}</span>
                                        ))}
                                    </div>
                                    <div className="mt-8 pt-6" style={{borderTop:'1px solid rgba(255,106,55,0.12)'}}>
                                        <div className="mono text-[10px] uppercase tracking-[0.24em]" style={{color:'var(--accent)',opacity:0.6}}>Coming next</div>
                                        <div className="grid gap-3 mt-4">
                                            {roadmapCards.map((item) => (
                                                <div key={item} className="flex items-center gap-3 text-sm" style={{color:'var(--mid)'}}>
                                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:'var(--accent)'}}/>
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </div>
                            <div className="service-summary-grid mt-8">
                                {SERVICE_BENEFITS.map((item, index) => (
                                    <motion.article
                                        key={item.eyebrow}
                                        initial={{opacity:0,y:18}}
                                        whileInView={{opacity:1,y:0}}
                                        viewport={{once:true,amount:0.3}}
                                        transition={{delay:index * 0.08}}
                                        className="service-summary-card"
                                    >
                                        <div className="service-summary-kicker">{item.eyebrow}</div>
                                        <h3>{item.title}</h3>
                                        <p>{item.body}</p>
                                    </motion.article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="pricing" className="defer-section py-14 md:py-[4.75rem] relative overflow-hidden" style={{background:'var(--paper)',color:'var(--ink)'}}>
                        <FloatingParticles count={25} color="255,106,55" className="opacity-20"/>
                        <div className="site-shell relative z-10">
                            <div className="max-w-3xl">
                                <Reveal y={12}>
                                    <span className="section-label" style={{color:'rgba(10,10,12,0.45)'}}>Pricing</span>
                                    <div className="orange-line mt-3"/>
                                </Reveal>
                                <Reveal y={32} delay={0.08}>
                                <h2 className="cg mt-6" style={{fontSize:'clamp(2.4rem, 5.6vw, 4.5rem)',lineHeight:0.9,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                    <GradientText>Clear pricing</GradientText> before you commit the money.
                                </h2>
                                </Reveal>
                                <Reveal y={16} delay={0.18}>
                                <p className="mt-5 text-base leading-relaxed" style={{color:'var(--mid)'}}>
                                    Start with the free trial floor plan, then move into the paid session model once the product is ready for launch.
                                </p>
                                </Reveal>
                            </div>
                            <div className="grid xl:grid-cols-[minmax(0,1fr)_300px] gap-6 mt-10 items-start">
                                <div>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        {pricingTiers.map((tier, index) => (
                                            <motion.div key={tier.tag} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.3}} transition={{delay:index * 0.08}}>
                                                {tier.featured ? (
                                                    <TiltCard maxTilt={5} style={{height:'100%'}}>
                                                        <SpotlightCard spotlightColor="rgba(255,106,55,0.2)"
                                                            className="pricing-featured p-6 md:p-7 flex flex-col min-h-[360px] h-full">
                                                            <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(255,255,255,0.6)'}}>{tier.tag}</div>
                                                            <div className="cg mt-5 text-white" style={{fontSize:'3rem',lineHeight:0.88,letterSpacing:'-0.06em'}}>{tier.price}</div>
                                                            <div className="mono text-[10px] uppercase tracking-[0.22em] mt-2" style={{color:'rgba(255,255,255,0.46)'}}>{tier.unit}</div>
                                                            <p className="mt-5 text-sm leading-relaxed flex-1" style={{color:'rgba(255,255,255,0.72)'}}>{tier.desc}</p>
                                                            <StarBorderBtn onClick={() => scrollTo('generator')} className="w-full mt-6">
                                                                <span>{tier.cta}</span>
                                                                <span className="cta-live-mark"><span className="cta-live-dot"/>Now</span>
                                                            </StarBorderBtn>
                                                        </SpotlightCard>
                                                    </TiltCard>
                                                ) : (
                                                    <SpotlightCard spotlightColor="rgba(255,106,55,0.1)"
                                                        className="p-6 md:p-7 rounded-[14px] flex flex-col min-h-[360px] h-full"
                                                        style={{background:'rgba(255,255,255,0.62)',border:'1px solid rgba(255,106,55,0.1)',color:'var(--ink)'}}>
                                                        <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(10,10,12,0.4)'}}>{tier.tag}</div>
                                                        <div className="cg mt-5" style={{fontSize:'3rem',lineHeight:0.88,letterSpacing:'-0.06em'}}>{tier.price}</div>
                                                        <div className="mono text-[10px] uppercase tracking-[0.22em] mt-2" style={{color:'rgba(10,10,12,0.42)'}}>{tier.unit}</div>
                                                        <p className="mt-5 text-sm leading-relaxed flex-1" style={{color:'var(--mid)'}}>{tier.desc}</p>
                                                        <button onClick={() => setModalOpen(true)}
                                                            className={`cta-hero w-full mt-6 min-h-[58px] flex items-center justify-center ${tier.tag === 'Trial phase' ? 'cta-glow-soft' : ''}`}>
                                                            {tier.cta}
                                                        </button>
                                                    </SpotlightCard>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    {quoteCards.map((quote, index) => (
                                        <motion.div key={quote.name} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.3}} transition={{delay:index * 0.08}}>
                                            <SpotlightCard spotlightColor="rgba(255,106,55,0.08)" className="quote-card p-5 h-full">
                                                <p className="cg text-[1.2rem] leading-[1.1]" style={{color:'var(--ink)'}}>
                                                    {quote.quote}
                                                </p>
                                                <div className="mt-4 pt-4" style={{borderTop:'1px solid rgba(255,106,55,0.12)'}}>
                                                    <p className="font-semibold text-sm">{quote.name}</p>
                                                    <p className="mono text-[10px] uppercase tracking-[0.2em] mt-2" style={{color:'var(--mid)'}}>{quote.firm}</p>
                                                </div>
                                            </SpotlightCard>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="studio" className="defer-section py-16 md:py-20 relative overflow-hidden" style={{background:'linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(23,23,23,1) 100%)'}}>
                        <FloatingParticles count={40} color="255,106,55" className="opacity-25"/>
                        <div className="hero-glow" style={{top:'12%', left:'18%', width:'540px', height:'540px', background:'radial-gradient(circle, rgba(255,106,55,0.12), transparent 70%)'}}/>
                        <div className="site-shell relative z-10">
                            <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-10 items-start">
                                <Reveal y={28}>
                                    <SpotlightCard spotlightColor="rgba(255,106,55,0.1)" className="dream-panel p-7 md:p-10 animated-border">
                                        <span className="section-label" style={{color:'rgba(232,238,244,0.65)'}}>Studio</span>
                                        <div className="orange-line mt-3"/>
                                        <h2 className="cg text-white mt-6" style={{fontSize:'clamp(2.8rem, 7vw, 5.2rem)',lineHeight:0.9,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                            Built by people who have felt the discovery gap up close.
                                        </h2>
                                        <p className="mt-6 max-w-2xl text-base leading-relaxed" style={{color:'rgba(244,239,230,0.72)'}}>
                                            Keystone began from a simple frustration: too many people knew the home they wanted emotionally, but did not know how to describe it clearly enough to move the design forward.
                                        </p>
                                        <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{color:'rgba(244,239,230,0.72)'}}>
                                            The product is designed to help people do some of that thinking before the formal design meeting, so the next conversation can shape ideas instead of extracting basics.
                                        </p>
                                        <div className="mt-8 pt-6 border-t border-white/10">
                                            <p className="cg text-white" style={{fontSize:'clamp(1.6rem, 3vw, 2.6rem)',lineHeight:1.08}}>
                                                "Architects should spend their energy shaping ideas, not extracting them one exhausted question at a time."
                                            </p>
                                            <p className="mono mt-4 text-[10px] uppercase tracking-[0.24em]" style={{color:'rgba(244,239,230,0.5)'}}>Founder note / Keystone AI</p>
                                        </div>
                                    </SpotlightCard>
                                </Reveal>
                                <div className="grid gap-4">
                                    {studioMetrics.map((metric, index) => (
                                        <motion.div key={metric.label} initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true,margin:'-48px'}} transition={{duration:0.5,delay:index*0.07,ease:[0.22,1,0.36,1]}}>
                                            <TiltCard maxTilt={4}>
                                                <SpotlightCard spotlightColor="rgba(255,106,55,0.15)" className="studio-metric h-full">
                                                    <strong className="gradient-text-anim">{metric.value}</strong>
                                                    <span className="text-[11px] uppercase tracking-[0.18em]" style={{color:'rgba(244,239,230,0.5)'}}>{metric.label}</span>
                                                </SpotlightCard>
                                            </TiltCard>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 mt-8">
                                {studioTeam.map((member, index) => (
                                    <motion.article key={member.name} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.25}} transition={{delay:index * 0.08}}>
                                        <TiltCard maxTilt={4} style={{height:'100%'}}>
                                            <SpotlightCard spotlightColor="rgba(255,106,55,0.12)"
                                                className="dream-panel p-4 md:p-5 flex items-start gap-4 h-full">
                                                <div className="rounded-[20px] overflow-hidden flex-shrink-0" style={{width:'88px',height:'104px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,106,55,0.15)'}}>
                                                    <SmartImage src={member.image} alt={member.name} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top'}}/>
                                                </div>
                                                <div>
                                                    <div className="mono text-[10px] uppercase tracking-[0.24em]" style={{color:'var(--accent)',opacity:0.7}}>{member.role}</div>
                                                    <h3 className="cg text-white text-[1.6rem] mt-2 leading-[0.96]">{member.name}</h3>
                                                    <p className="mt-2 text-[13px] leading-relaxed" style={{color:'rgba(244,239,230,0.68)'}}>{member.bio}</p>
                                                </div>
                                            </SpotlightCard>
                                        </TiltCard>
                                    </motion.article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <SurveySection onJoin={() => setModalOpen(true)}/>

                    <section className="defer-section py-20 md:py-28 relative overflow-hidden" style={{background:'linear-gradient(180deg, #FFFDFC 0%, #FFF4EE 60%, #F5F0E9 100%)'}}>
                        <Waves lineColor="rgba(255,106,55,0.22)" waveSpeedX={0.01} waveSpeedY={0.008} waveAmpX={30} waveAmpY={6} friction={0.7} tension={0.018} xGap={14} yGap={40}/>
                        <OrbBackground/>
                        <FloatingParticles count={45} color="255,106,55" className="opacity-35"/>
                        <div className="container mx-auto max-w-5xl px-5 md:px-10 text-center relative z-10">
                            <Reveal y={12}>
                                <span className="section-label justify-center" style={{color:'rgba(9,9,9,0.42)'}}>Final invitation</span>
                                <div className="flex justify-center mt-3"><div className="orange-line"/></div>
                            </Reveal>
                            <Reveal y={28} delay={0.08}>
                                <h2 className="cg mt-6" style={{fontSize:'clamp(3rem, 7vw, 5.8rem)',lineHeight:0.88,letterSpacing:'-0.06em',textTransform:'uppercase',color:'var(--ink)'}}>
                                    <BlurText text="Give the first meeting" delay={50} direction="bottom" tag="span" className="block"/>
                                    <span className="block" style={{color:'var(--accent)'}}>
                                        <BlurText text="a stronger starting point." delay={50} direction="bottom" tag="span"/>
                                    </span>
                                </h2>
                            </Reveal>
                            <Reveal y={16} delay={0.22}>
                                <p className="mt-5 max-w-2xl mx-auto text-base md:text-lg leading-relaxed" style={{color:'rgba(9,9,9,0.62)'}}>
                                    If you want to walk into the first builder or architect conversation with something real in hand, Keystone is ready to help you start there.
                                </p>
                            </Reveal>
                            <Reveal y={20} delay={0.34}>
                                <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                                    <StarBorderBtn onClick={() => scrollTo('generator')}>
                                        <span>Open Live Studio</span>
                                        <span className="cta-live-mark">
                                            <span className="cta-live-dot"/>
                                            Try it now
                                        </span>
                                    </StarBorderBtn>
                                    <button onClick={() => setModalOpen(true)} className="cta-hero cta-glow-soft">
                                        Unlock Advanced Features
                                    </button>
                                </div>
                            </Reveal>
                        </div>
                    </section>

                    <SiteFooter home/>
            </main>
        </div>
    );
};

const HowFloorPlansWorkPage = () => {
    usePageTitle('Keystone AI - How Floor Plans Work');
    const caseFacts = [
        ['Input', 'Guided home brief'],
        ['Core engine', 'Deterministic layout + validation'],
        ['Output', 'Plan + elevations + DXF + optional render'],
        ['Boundary', 'Concept study, not permit docs'],
    ];
    const intakeSignals = [
        'Area, stories, bedrooms, baths, garage type, and broad footprint bias are captured before discovery starts.',
        'The brief records layout intent such as primary-suite level, kitchen position, laundry placement, and open-concept preference.',
        'Frontage, lot context, light preference, indoor-outdoor intent, and accessibility needs shape the first zoning pass.',
        'You leave the brief with a working plan artifact instead of trying to reconstruct the house from scattered notes later.',
    ];
    const processSteps = [
        {
            step: '01',
            title: 'The survey is normalized into a usable brief',
            body: 'The intake does not stay as loose text. Keystone converts your survey answers into structured constraints such as story count, area target, garage type, primary-suite level, bathroom rules, frontage, and lot context.',
        },
        {
            step: '02',
            title: 'Multiple footprint candidates are explored',
            body: 'The engine tests rectangular footprint options against the requested size, number of stories, garage needs, and lot assumptions so the first plan does not start from a single arbitrary box.',
        },
        {
            step: '03',
            title: 'A room program is built before geometry',
            body: 'Bedrooms, bathrooms, public rooms, stairs, circulation, mudroom, laundry, and requested extras are assembled into a room program with target areas and adjacency intent before the layout stage begins.',
        },
        {
            step: '04',
            title: 'The plan is laid out on a tile grid',
            body: 'Keystone places the room program into public, private, service, and circulation zones, then turns that into a real floor plan with dimensions, story alignment, and stair-core placement.',
        },
        {
            step: '05',
            title: 'Openings and circulation are validated',
            body: 'Doors, windows, and entry points are added after the room geometry exists. The plan is then checked for connectivity, room count, bathroom logic, hallway bloat, and other architectural quality gates.',
        },
        {
            step: '06',
            title: 'The concept package is exported',
            body: 'The floor plan, elevation set, and CAD export (DXF) are exported first. The Exterior Render can then be used as an optional image layer on top of the approved plan geometry rather than replacing the core floor-plan logic.',
        },
    ];
    const planInputs = [
        {
            title: 'Program before drawing',
            body: 'Keystone first resolves what must exist in the home: public rooms, private rooms, stairs, garage, service spaces, and the bathroom structure needed to make the program work.',
            image: ASSETS.exampleBlueprint,
            alt: 'Sample Keystone floor plan showing structured room program',
        },
        {
            title: 'Zoning and circulation',
            body: 'The engine separates public, private, service, and circulation zones so the layout starts from movement and room relationships, not just a list of boxes.',
            image: ASSETS.workflow.planReview,
            alt: 'Architect reviewing plan layout and zoning relationships',
        },
        {
            title: 'Elevations and CAD export',
            body: 'Doors, windows, frontage, elevations, and CAD export are prepared after the layout exists so the output is usable in studio review rather than just visually attractive.',
            image: ASSETS.exampleElevationSheet,
            alt: 'Technical architectural output supporting review and export',
        },
    ];
    const supportingGallery = [ASSETS.workflow.clientIntake, ASSETS.exampleElevationSheet, ASSETS.roadmap.cadExport, ASSETS.exampleRender];

    return (
        <SubpageChrome>
            {({ openModal }) => (
                <>
                    <section className="relative overflow-hidden" style={{background:'linear-gradient(180deg, #FFFDF9 0%, #F2E9DE 100%)'}}>
                        <div className="hero-video-shell">
                            <div className="hero-video-base"/>
                            <div className="hero-video-wave orange"/>
                            <div className="hero-video-wave soft"/>
                            <div className="hero-video-wave sand"/>
                        </div>
                        <div className="dream-grid absolute inset-0 opacity-70"/>
                        <div className="site-shell py-16 md:py-24 relative z-10">
                            <div className="grid xl:grid-cols-[minmax(0,1.05fr)_360px] gap-8 items-start">
                                <div>
                                    <span className="section-label">How floor plans are made</span>
                                    <h1 className="cg mt-6" style={{fontSize:'clamp(3rem, 7vw, 6rem)',lineHeight:0.9,letterSpacing:'-0.06em',textTransform:'uppercase',color:'var(--ink)'}}>
                                        How Keystone turns client intent into a first working floor plan.
                                    </h1>
                                    <p className="mt-6 max-w-3xl text-base md:text-lg leading-relaxed" style={{color:'rgba(32,26,21,0.72)'}}>
                                        This page explains the actual floor-plan workflow behind Keystone. A guided brief is normalized into plan constraints, footprint options are explored, a room program is built, the plan is laid out, circulation is validated, and only then are the export package and optional Exterior Render prepared.
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-3 mt-8 max-w-3xl">
                                        {caseFacts.map(([label, value]) => (
                                            <div key={label} className="paper-panel p-4 md:p-5">
                                                <div className="mono text-[9px] uppercase tracking-[0.22em]" style={{color:'rgba(10,10,12,0.42)'}}>{label}</div>
                                                <div className="cg text-[1.4rem] mt-3 leading-[0.95]" style={{color:'var(--ink)'}}>{value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 flex flex-wrap gap-3">
                                        <a href="/#generator" className="cta-hero cta-glow">Open Live Studio</a>
                                        <button onClick={openModal} className="cta-hero cta-glow-soft">Unlock Advanced Features</button>
                                    </div>
                                </div>
                                <aside className="dream-panel p-6 md:p-7 overflow-hidden relative">
                                    <span className="section-label" style={{color:'rgba(245,240,233,0.58)'}}>What goes in</span>
                                    <h2 className="cg text-white mt-5" style={{fontSize:'clamp(1.8rem,3vw,2.6rem)',lineHeight:0.92,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                        Enough specificity to help you explain your future home before the meeting, not just during it.
                                    </h2>
                                    <div className="grid gap-3 mt-6">
                                        {intakeSignals.map((item) => (
                                            <div key={item} className="flex items-start gap-3 text-sm leading-relaxed" style={{color:'rgba(244,239,230,0.66)'}}>
                                                <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{background:'var(--accent)'}}/>
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 rounded-[18px] overflow-hidden" style={{border:'1px solid rgba(255,255,255,0.12)'}}>
                                        <SmartImage src={ASSETS.phase3[4]} alt="Keystone guided intake shown on mobile" style={{width:'100%',height:'220px',objectFit:'cover',display:'block'}}/>
                                    </div>
                                    <div className="mt-8 pt-5 border-t border-white/10">
                                        <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(244,239,230,0.46)'}}>Outcome</p>
                                        <p className="text-sm leading-relaxed mt-3" style={{color:'rgba(244,239,230,0.7)'}}>
                                            The plan is already structured, zoned, and checked for basic circulation. If you want an image, the Exterior Render comes after that as an optional layer rather than the core planning method.
                                        </p>
                                    </div>
                                </aside>
                            </div>
                        </div>
                    </section>

                    <section className="py-10 md:py-14" style={{background:'linear-gradient(180deg, #FFFDFC 0%, #F5F0E9 100%)'}}>
                        <div className="site-shell">
                            <div className="proof-frame p-4 md:p-6">
                                <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
                                    <div className="proof-browser">
                                        <div className="proof-browser-top">
                                            <div className="bc-dot" style={{background:'#FF5F57'}}/>
                                            <div className="bc-dot" style={{background:'#FFBD2E'}}/>
                                            <div className="bc-dot" style={{background:'#28C840'}}/>
                                            <span className="mono text-[8px] ml-3" style={{color:'rgba(255,255,255,0.32)',letterSpacing:'0.16em'}}>SAMPLE SESSION / GENERATED PLAN</span>
                                        </div>
                                        <div className="proof-browser-screen plan">
                                            <div className="diagonal-accent"/>
                                            <SmartImage src={ASSETS.exampleBlueprint} alt="Sample generated floor plan" style={{width:'100%',display:'block',objectFit:'contain'}}/>
                                        </div>
                                        <div className="proof-caption">
                                            <span className="proof-dot" style={{background:'var(--blue)'}}/>
                                            Keystone turns the brief into a working plan artifact you can review, share, and react to before the next design conversation.
                                        </div>
                                    </div>
                                    <div className="proof-browser">
                                        <div className="proof-browser-top">
                                            <div className="bc-dot" style={{background:'#FF5F57'}}/>
                                            <div className="bc-dot" style={{background:'#FFBD2E'}}/>
                                            <div className="bc-dot" style={{background:'#28C840'}}/>
                                            <span className="mono text-[8px] ml-3" style={{color:'rgba(255,255,255,0.32)',letterSpacing:'0.16em'}}>SAMPLE SESSION / EXTERIOR RENDER</span>
                                        </div>
                                        <div className="proof-browser-screen render">
                                            <SmartImage src={ASSETS.exampleRender} alt="Sample exterior render" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                        </div>
                                        <div className="proof-caption">
                                            <span className="proof-dot" style={{background:'var(--accent)'}}/>
                                            The Exterior Render is optional and comes after the plan, giving you an exterior mood to react to without replacing the floor-plan logic.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="py-16 md:py-20" style={{background:'var(--paper)'}}>
                        <div className="site-shell">
                            <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-8 items-start">
                                <div>
                                    <span className="section-label" style={{color:'rgba(10,10,12,0.42)'}}>Method</span>
                                    <h2 className="cg mt-6" style={{fontSize:'clamp(2.4rem, 5vw, 4.3rem)',lineHeight:0.92,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                        The value is not mystery. It is a clearer planning sequence before the real project conversation begins.
                                    </h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {processSteps.map((item) => (
                                        <article key={item.step} className="paper-panel p-5 md:p-6">
                                            <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(27,79,130,0.72)'}}>{item.step}</div>
                                            <h3 className="cg text-[1.7rem] mt-5 leading-[0.95]" style={{color:'var(--ink)'}}>{item.title}</h3>
                                            <p className="mt-4 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.64)'}}>{item.body}</p>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="py-10 md:py-14" style={{background:'linear-gradient(180deg, #FFFDF9 0%, #F0E8DD 100%)'}}>
                        <div className="site-shell">
                            <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
                                <div>
                                    <span className="section-label" style={{color:'rgba(10,10,12,0.42)'}}>What shapes the plan</span>
                                    <h2 className="cg mt-6" style={{fontSize:'clamp(2.2rem, 4.5vw, 4rem)',lineHeight:0.92,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                        The floor plan is built from program, zoning, and review logic before mood comes into the picture.
                                    </h2>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {planInputs.map((item, index) => (
                                        <motion.article key={item.title} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.3}} transition={{delay:index * 0.08}}>
                                            <TiltCard maxTilt={4} style={{height:'100%'}}>
                                                <SpotlightCard spotlightColor="rgba(255,106,55,0.12)" className="h-full" style={{background:'rgba(255,255,255,0.7)',border:'1px solid rgba(255,106,55,0.1)',borderRadius:'22px',overflow:'hidden'}}>
                                                    <div style={{aspectRatio:'1 / 0.78',overflow:'hidden'}}>
                                                        <SmartImage src={item.image} alt={item.alt} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                                                    </div>
                                                    <div className="p-5 md:p-6">
                                                        <h3 className="cg text-[1.6rem] leading-[0.95]" style={{color:'var(--ink)'}}>{item.title}</h3>
                                                        <p className="mt-4 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.64)'}}>{item.body}</p>
                                                    </div>
                                                </SpotlightCard>
                                            </TiltCard>
                                        </motion.article>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="py-12 md:py-16 relative overflow-hidden" style={{background:'linear-gradient(180deg,#0A0806 0%,#130B05 100%)'}}>
                        <FloatingParticles count={28} color="255,106,55" className="opacity-18"/>
                        <div className="site-shell relative z-10">
                            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
                                <div>
                                    <span className="section-label" style={{color:'rgba(255,106,55,0.7)'}}>Support material</span>
                                    <h2 className="cg text-white mt-6" style={{fontSize:'clamp(2.3rem, 4.8vw, 4rem)',lineHeight:0.92,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                        More visual proof, while staying honest about what the system is and is not.
                                    </h2>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
                                        {supportingGallery.map((image, index) => (
                                            <div key={image} className="rounded-[18px] overflow-hidden" style={{border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.03)'}}>
                                                <SmartImage src={image} alt={`Keystone floor plan support visual ${index + 1}`} style={{width:'100%',height:'210px',objectFit:'cover',display:'block'}}/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <SpotlightCard spotlightColor="rgba(255,106,55,0.14)" className="dream-panel p-6 md:p-7 self-start">
                                    <div className="mono text-[10px] uppercase tracking-[0.24em]" style={{color:'rgba(255,106,55,0.8)'}}>Important boundary</div>
                                    <h3 className="cg text-white mt-5 text-[2rem] leading-[0.95]">Keystone helps start the design discussion. It does not replace architectural responsibility.</h3>
                                    <p className="mt-5 text-sm leading-relaxed" style={{color:'rgba(244,239,230,0.7)'}}>
                                        The output is a concept aid for discovery and kickoff. It is not a permit-ready drawing set, not a stamped document, and not a substitute for architect, engineer, or builder review. The Exterior Render can support the exterior mood, but it is not the core floor-plan engine.
                                    </p>
                                    <div className="mt-6 flex flex-col gap-3">
                                        <a href="/#generator" className="cta-secondary text-center">Open Live Studio</a>
                                        <button onClick={openModal} className="cta-hero cta-glow-soft">Unlock Advanced Features</button>
                                    </div>
                                </SpotlightCard>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </SubpageChrome>
    );
};

const CaseStudyPage = () => <HowFloorPlansWorkPage/>;

const B2BWorkflowPage = () => {
    usePageTitle('Keystone AI - Guided Workflow');
    const workflowStages = [
        {
            step: '01',
            title: 'You open the guided brief',
            body: 'Keystone starts with a survey written for normal people, so the process begins with clarity instead of technical guesswork.',
            image: ASSETS.workflow.firmLaunch,
        },
        {
            step: '02',
            title: 'You fill out structured intent',
            body: 'Room needs, lot cues, light preferences, and style signals arrive in a format that can later be reviewed by you, your family, and any professional you bring in.',
            image: ASSETS.workflow.clientIntake,
        },
        {
            step: '03',
            title: 'Keystone returns a plan, elevations, and export',
            body: 'The generated plan becomes a working artifact you can download as a blueprint image, matching elevations, and CAD Export (DXF) before the next design conversation even begins.',
            image: ASSETS.workflow.planExport,
        },
        {
            step: '04',
            title: 'The next conversation starts ahead',
            body: 'An optional Exterior Render can support emotional alignment, but the deeper win is simpler: the process begins with more clarity and less drift.',
            image: ASSETS.workflow.kickoffMeeting,
        },
    ];
    const operatorBenefits = [
        'A clearer first design conversation',
        'An easier handoff into professional design work later',
        'A stronger concept artifact for family discussion, review, and budgeting',
    ];
    const supportGallery = [ASSETS.workflow.collage, ASSETS.exampleElevationSheet, ASSETS.roadmap.cadExport, ASSETS.exampleRender];

    return (
        <SubpageChrome>
            {({ openModal }) => (
                <>
                    <section className="relative overflow-hidden" style={{background:'linear-gradient(180deg, #FFFDF9 0%, #F5EADF 100%)'}}>
                        <div className="site-shell py-16 md:py-24 relative z-10">
                            <div className="grid xl:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
                                <div>
                                    <span className="section-label">Guided workflow</span>
                                    <h1 className="cg mt-6" style={{fontSize:'clamp(3rem, 7vw, 6rem)',lineHeight:0.9,letterSpacing:'-0.06em',textTransform:'uppercase',color:'var(--ink)'}}>
                                        A guided workflow designed to make home design easier to understand.
                                    </h1>
                                    <p className="mt-6 max-w-3xl text-base md:text-lg leading-relaxed" style={{color:'rgba(32,26,21,0.72)'}}>
                                        Keystone is not a generic lead form or a gallery trick. It is a guided process that helps people arrive at the first serious design conversation with more structure, less drift, and something real to react to.
                                    </p>
                                    <div className="grid sm:grid-cols-3 gap-3 mt-8 max-w-3xl">
                                        {[
                                            ['Buyer', 'Home builders'],
                                            ['Live today', 'Brief + plan + elevations + DXF'],
                                            ['Trial', 'Free + unlocked'],
                                        ].map(([label, value]) => (
                                            <div key={label} className="paper-panel p-4 md:p-5">
                                                <div className="mono text-[9px] uppercase tracking-[0.22em]" style={{color:'rgba(10,10,12,0.42)'}}>{label}</div>
                                                <div className="cg text-[1.4rem] mt-3 leading-[0.95]" style={{color:'var(--ink)'}}>{value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <aside className="paper-panel p-5 md:p-6">
                                    <div className="rounded-[18px] overflow-hidden">
                                        <SmartImage src={ASSETS.workflow.planReview} alt="Architect reviewing a Keystone floor plan on screen and paper" style={{width:'100%',height:'260px',objectFit:'cover',display:'block'}}/>
                                    </div>
                                    <div className="mt-5">
                                        <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(10,10,12,0.42)'}}>What you get</div>
                                        <div className="grid gap-3 mt-4">
                                            {LIVE_NOW_FEATURES.map((item) => (
                                                <div key={item} className="flex items-start gap-3 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.68)'}}>
                                                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{background:'var(--accent)'}}/>
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </div>
                    </section>

                    <section className="py-12 md:py-16" style={{background:'var(--paper)'}}>
                        <div className="site-shell">
                            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                                {workflowStages.map((item, index) => (
                                    <motion.article key={item.step} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.3}} transition={{delay:index * 0.08}}>
                                        <TiltCard maxTilt={4} style={{height:'100%'}}>
                                            <SpotlightCard spotlightColor="rgba(255,106,55,0.1)" className="h-full" style={{background:'rgba(255,255,255,0.72)',border:'1px solid rgba(255,106,55,0.1)',borderRadius:'22px',overflow:'hidden'}}>
                                                <div style={{aspectRatio:'1 / 0.82'}}>
                                                    <SmartImage src={item.image} alt={item.title} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                                                </div>
                                                <div className="p-5 md:p-6">
                                                    <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'var(--accent)',opacity:0.78}}>{item.step}</div>
                                                    <h3 className="cg text-[1.6rem] mt-4 leading-[0.95]" style={{color:'var(--ink)'}}>{item.title}</h3>
                                                    <p className="mt-4 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.64)'}}>{item.body}</p>
                                                </div>
                                            </SpotlightCard>
                                        </TiltCard>
                                    </motion.article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-12 md:py-16 relative overflow-hidden" style={{background:'linear-gradient(180deg,#0A0806 0%,#130B05 100%)'}}>
                        <FloatingParticles count={24} color="255,106,55" className="opacity-18"/>
                        <div className="site-shell relative z-10">
                            <div className="grid xl:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
                                <div>
                                    <span className="section-label" style={{color:'rgba(255,106,55,0.72)'}}>Why it matters</span>
                                    <h2 className="cg text-white mt-6" style={{fontSize:'clamp(2.4rem, 5vw, 4.4rem)',lineHeight:0.92,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                        More signal before you spend real money or step into a serious design conversation.
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-3 mt-8">
                                        {supportGallery.map((image, index) => (
                                            <div key={image} className="rounded-[18px] overflow-hidden" style={{border:'1px solid rgba(255,255,255,0.08)'}}>
                                                <SmartImage src={image} alt={`Guided workflow support visual ${index + 1}`} style={{width:'100%',height:'220px',objectFit:'cover',display:'block'}}/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    <SpotlightCard spotlightColor="rgba(255,106,55,0.14)" className="dream-panel p-6 md:p-7">
                                        <div className="mono text-[10px] uppercase tracking-[0.24em]" style={{color:'rgba(255,106,55,0.78)'}}>Operator benefits</div>
                                        <div className="grid gap-3 mt-5">
                                            {operatorBenefits.map((item) => (
                                                <div key={item} className="flex items-start gap-3 text-sm leading-relaxed" style={{color:'rgba(244,239,230,0.7)'}}>
                                                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{background:'var(--accent)'}}/>
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </SpotlightCard>
                                    <SpotlightCard spotlightColor="rgba(255,106,55,0.12)" className="paper-panel p-6 md:p-7">
                                        <div className="mono text-[10px] uppercase tracking-[0.24em]" style={{color:'rgba(10,10,12,0.42)'}}>Scope discipline</div>
                                        <p className="mt-4 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.68)'}}>
                                            Keystone is intentionally narrow today: structured intake, generated plan, elevation views, a Cost Estimate, CAD export (DXF), and an optional Exterior Render. Scheduling and deeper viewer tools stay on the roadmap until they are truly live.
                                        </p>
                                        <div className="mt-6 flex flex-col gap-3">
                                            <a href="/roadmap" className="cta-secondary text-center">View Roadmap</a>
                                            <button onClick={openModal} className="cta-hero cta-glow-soft">Unlock Advanced Features</button>
                                        </div>
                                    </SpotlightCard>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </SubpageChrome>
    );
};

const RoadmapPage = () => {
    usePageTitle('Keystone AI - Roadmap');
    const roadmapModules = [
        {
            phase: 'Live today',
            title: 'Guided brief capture',
            body: 'The guided intake already turns loose preferences into structured discovery data before the first serious design conversation.',
            image: ASSETS.workflow.clientIntake,
            status: 'Live',
        },
        {
            phase: 'Live today',
            title: 'Generated plan + blueprint image',
            body: 'Keystone already returns a usable floor plan and a clean blueprint image you can download, share, and review.',
            image: ASSETS.workflow.planExport,
            status: 'Live',
        },
        {
            phase: 'Live today',
            title: 'Elevation views',
            body: 'The same generated plan now comes with deterministic elevation views grounded in the plan geometry and survey inputs.',
            image: ASSETS.exampleElevationSheet,
            status: 'Live',
        },
        {
            phase: 'Live today',
            title: 'Exterior render',
            body: 'An optional exterior render is already available to give the household a visual anchor during the early conversation.',
            image: ASSETS.roadmap.exteriorStudy,
            status: 'Live',
        },
        {
            phase: 'Live today',
            title: 'Vector DXF export',
            body: 'CAD-ready DXF export is live so approved concept geometry can move into studio review and downstream drafting more cleanly.',
            image: ASSETS.roadmap.cadExport,
            status: 'Live',
        },
        {
            phase: 'Live today',
            title: 'Planning estimate layer',
            body: 'The generated plan now includes a concept-level quantity takeoff and early cost range so the household can discuss geometry and budget together.',
            image: ASSETS.roadmap.overview,
            status: 'Live',
        },
        {
            phase: 'Roadmap next',
            title: '3D viewer and schedule depth',
            body: 'Interactive 3D viewing and project schedule intelligence are part of the broader platform direction, but they are not marketed as live today.',
            image: ASSETS.phase3[1],
            status: 'Planned',
        },
    ];
    const roadmapTracks = [
        ['Estimates', 'Tie quantity logic to early project conversations without overselling precision.'],
        ['Scheduling', 'Help homeowners understand timing dependencies once the product truth is ready for it.'],
        ['3D viewer', 'Add richer interactive viewing only after the core plan, elevation, and export workflow is solid.'],
        ['White-labeling', 'Later, let professionals present Keystone inside their own brand language.'],
    ];

    return (
        <SubpageChrome>
            {({ openModal }) => (
                <>
                    <section className="relative overflow-hidden" style={{background:'linear-gradient(180deg, #FFFDF9 0%, #F4EBE1 100%)'}}>
                        <div className="site-shell py-16 md:py-24 relative z-10">
                            <div className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
                                <div>
                                    <span className="section-label">Roadmap</span>
                                    <h1 className="cg mt-6" style={{fontSize:'clamp(3rem, 7vw, 6rem)',lineHeight:0.9,letterSpacing:'-0.06em',textTransform:'uppercase',color:'var(--ink)'}}>
                                        What Keystone does now, and what the platform is growing toward next.
                                    </h1>
                                    <p className="mt-6 max-w-3xl text-base md:text-lg leading-relaxed" style={{color:'rgba(32,26,21,0.72)'}}>
                                        This roadmap keeps a strict line between live capability and planned capability. It shows the platform direction around deeper quantity logic, scheduling, and 3D viewing while keeping live features like elevations, the Cost Estimate, and DXF export clearly separate from roadmap items.
                                    </p>
                                </div>
                                <SpotlightCard spotlightColor="rgba(255,106,55,0.1)" className="paper-panel p-6 md:p-7">
                                    <div className="mono text-[10px] uppercase tracking-[0.24em]" style={{color:'rgba(10,10,12,0.42)'}}>Product truth</div>
                                    <div className="grid gap-3 mt-5">
                                        {LIVE_NOW_FEATURES.map((item) => (
                                            <div key={item} className="flex items-start gap-3 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.68)'}}>
                                                <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{background:'var(--accent)'}}/>
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 pt-5" style={{borderTop:'1px solid rgba(10,10,12,0.08)'}}>
                                        <p className="text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.64)'}}>
                                            Everything below marked <strong>Planned</strong> is direction, not a live sales claim.
                                        </p>
                                    </div>
                                </SpotlightCard>
                            </div>
                        </div>
                    </section>

                    <section className="py-12 md:py-16" style={{background:'var(--paper)'}}>
                        <div className="site-shell">
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {roadmapModules.map((module, index) => (
                                    <motion.article key={module.title} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.3}} transition={{delay:index * 0.06}}>
                                        <TiltCard maxTilt={4} style={{height:'100%'}}>
                                            <SpotlightCard spotlightColor="rgba(255,106,55,0.12)" className="h-full" style={{background:'rgba(255,255,255,0.74)',border:'1px solid rgba(255,106,55,0.1)',borderRadius:'22px',overflow:'hidden'}}>
                                                <div style={{aspectRatio:'1 / 0.75'}}>
                                                    <SmartImage src={module.image} alt={module.title} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                                                </div>
                                                <div className="p-5 md:p-6">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(10,10,12,0.42)'}}>{module.phase}</div>
                                                        <span className="mono text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded-full" style={{
                                                            color: module.status === 'Live' ? 'white' : 'rgba(10,10,12,0.56)',
                                                            background: module.status === 'Live' ? 'var(--accent)' : 'rgba(10,10,12,0.06)',
                                                        }}>{module.status}</span>
                                                    </div>
                                                    <h3 className="cg text-[1.7rem] mt-4 leading-[0.95]" style={{color:'var(--ink)'}}>{module.title}</h3>
                                                    <p className="mt-4 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.64)'}}>{module.body}</p>
                                                </div>
                                            </SpotlightCard>
                                        </TiltCard>
                                    </motion.article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-12 md:py-16 relative overflow-hidden" style={{background:'linear-gradient(180deg,#0A0806 0%,#130B05 100%)'}}>
                        <FloatingParticles count={20} color="255,106,55" className="opacity-16"/>
                        <div className="site-shell relative z-10">
                            <div className="grid xl:grid-cols-[320px_minmax(0,1fr)] gap-8 items-start">
                                <div>
                                    <span className="section-label" style={{color:'rgba(255,106,55,0.72)'}}>Direction</span>
                                    <h2 className="cg text-white mt-6" style={{fontSize:'clamp(2.4rem, 5vw, 4rem)',lineHeight:0.92,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                        The platform grows outward from plan logic.
                                    </h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {roadmapTracks.map(([title, body]) => (
                                        <SpotlightCard key={title} spotlightColor="rgba(255,106,55,0.14)" className="dream-panel p-5 md:p-6">
                                            <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(255,106,55,0.78)'}}>{title}</div>
                                            <p className="mt-4 text-sm leading-relaxed" style={{color:'rgba(244,239,230,0.68)'}}>{body}</p>
                                        </SpotlightCard>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <a href="/b2b-workflow" className="cta-secondary text-center">View Guided Workflow</a>
                                <button onClick={openModal} className="cta-hero cta-glow-soft">Unlock Advanced Features</button>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </SubpageChrome>
    );
};

const FAQPage = () => {
    usePageTitle('Keystone AI - FAQ');
    const faqItems = [
        {
            question: 'What is live in Keystone right now?',
            answer: 'The live workflow today includes guided brief capture, floor plan generation, elevation views, a concept-level Cost Estimate workbook, CAD Export (DXF), high-resolution plan download, and Exterior Render generation from the same project brief.',
        },
        {
            question: 'Who is Keystone for right now?',
            answer: 'Keystone is currently being shaped for homeowners and first-time home builders who want to describe the house they want without needing technical drafting knowledge.',
        },
        {
            question: 'Do I need a technical background to use it?',
            answer: 'No. That is the point of the guided brief. Keystone is designed so you can talk about your rooms, priorities, and preferences in plain language.',
        },
        {
            question: 'What do I get from the free mode?',
            answer: 'Free mode gives you the generated floor plan, the elevation views, and the high-resolution blueprint download.',
        },
        {
            question: 'What unlocks with a passkey?',
            answer: 'The passkey unlocks advanced refinements, the Exterior Render, the Cost Estimate workbook, and CAD Export (DXF) during the current trial phase.',
        },
        {
            question: 'Does Keystone replace an architect or builder?',
            answer: 'No. Keystone is an early home-design and discovery tool. It helps you arrive with a clearer starting point, but professional design judgment still matters for any real project.',
        },
        {
            question: 'Are these outputs construction documents?',
            answer: 'No. Keystone outputs are concept aids only. They are not permit-ready drawings, stamped documents, engineering deliverables, or final construction instructions.',
        },
        {
            question: 'Are CAD files and cost estimates live today?',
            answer: 'The Cost Estimate workbook and CAD Export (DXF) are live today inside the advanced package. Native DWG production, scheduling, and deeper downstream quantity logic still belong to the later workflow.',
        },
        {
            question: 'Why is access private right now?',
            answer: 'Keystone is still in a controlled trial phase so the expensive features stay protected while the product is maturing.',
        },
        {
            question: 'How long does it take?',
            answer: 'The first floor plan is designed to arrive quickly, often in under a minute. Exterior renders take longer, but still fit inside an early-stage design session.',
        },
        {
            question: 'How should I think about data and privacy?',
            answer: 'Project inputs and generated outputs are used to operate the service, support access requests, and improve product quality. The current privacy page explains the starter policy in more detail.',
        },
    ];

    return (
        <SubpageChrome>
            {({ openModal }) => (
                <>
                    <section className="py-16 md:py-24" style={{background:'linear-gradient(180deg, #FFFDF9 0%, #F5F0E9 100%)'}}>
                        <div className="site-shell">
                            <div className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
                                <div>
                                    <span className="section-label">FAQ</span>
                                    <h1 className="cg mt-6" style={{fontSize:'clamp(3rem, 7vw, 5.8rem)',lineHeight:0.9,letterSpacing:'-0.06em',textTransform:'uppercase'}}>
                                        Questions first-time home builders ask before they trust Keystone.
                                    </h1>
                                    <p className="mt-6 max-w-3xl text-base md:text-lg leading-relaxed" style={{color:'rgba(32,26,21,0.72)'}}>
                                        These answers stay anchored to what is actually live right now, how the free and unlocked modes work, and what is still on the roadmap.
                                    </p>
                                </div>
                                <aside className="paper-panel p-6 md:p-7">
                                    <div className="mono text-[10px] uppercase tracking-[0.24em]" style={{color:'rgba(27,79,130,0.72)'}}>Live today</div>
                                    <div className="grid gap-3 mt-5">
                                        {LIVE_NOW_FEATURES.map((item) => (
                                            <div key={item} className="flex items-start gap-3 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.7)'}}>
                                                <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{background:'var(--accent)'}}/>
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 pt-5" style={{borderTop:'1px solid rgba(10,10,12,0.08)'}}>
                                        <p className="mono text-[10px] uppercase tracking-[0.24em]" style={{color:'rgba(10,10,12,0.42)'}}>Need a direct answer?</p>
                                        <a href={`mailto:${CONTACT_EMAIL}`} className="inline-block mt-3 text-sm" style={{color:'var(--ink)'}}>{CONTACT_EMAIL}</a>
                                        <div className="mt-5 flex flex-col gap-3">
                                            <a href="/how-floor-plans-work" className="cta-secondary text-center">How Floor Plans Work</a>
                                            <button onClick={openModal} className="cta-hero cta-glow-soft">Unlock Advanced Features</button>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </div>
                    </section>

                    <section className="py-8 md:py-12" style={{background:'var(--paper)'}}>
                        <div className="site-shell">
                            <div className="grid lg:grid-cols-2 gap-4">
                                {faqItems.map((item, index) => (
                                    <details key={item.question} className="faq-card paper-panel p-5 md:p-6" open={index === 0}>
                                        <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                                            <span className="cg text-[1.4rem] leading-[0.98]" style={{color:'var(--ink)'}}>{item.question}</span>
                                            <span className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(10,10,12,0.36)'}}>Open</span>
                                        </summary>
                                        <p className="mt-4 text-sm md:text-base leading-relaxed" style={{color:'rgba(10,10,12,0.66)'}}>{item.answer}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}
        </SubpageChrome>
    );
};

const LegalPage = ({ eyebrow, title, intro, sections }) => (
    <SubpageChrome>
        {({ openModal }) => (
            <>
                <section className="py-16 md:py-24" style={{background:'linear-gradient(180deg, #FFFDF9 0%, #F5F0E9 100%)'}}>
                    <div className="site-shell">
                        <div className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
                            <div>
                                <span className="section-label">{eyebrow}</span>
                                <h1 className="cg mt-6" style={{fontSize:'clamp(3rem, 7vw, 5.8rem)',lineHeight:0.9,letterSpacing:'-0.06em',textTransform:'uppercase'}}>
                                    {title}
                                </h1>
                                <p className="mt-6 max-w-3xl text-base md:text-lg leading-relaxed" style={{color:'rgba(32,26,21,0.72)'}}>
                                    {intro}
                                </p>
                            </div>
                            <aside className="paper-panel p-6 md:p-7">
                                <div className="mono text-[10px] uppercase tracking-[0.24em]" style={{color:'rgba(27,79,130,0.72)'}}>Starter legal draft</div>
                                <p className="mt-4 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.66)'}}>
                                    These pages use the public brand name {BRAND_NAME} while the formal legal entity details are still being finalized.
                                </p>
                                <p className="mono text-[10px] uppercase tracking-[0.22em] mt-5" style={{color:'rgba(10,10,12,0.42)'}}>Last updated</p>
                                <p className="text-sm mt-2" style={{color:'var(--ink)'}}>{LEGAL_UPDATED_AT}</p>
                                <p className="mono text-[10px] uppercase tracking-[0.22em] mt-5" style={{color:'rgba(10,10,12,0.42)'}}>Contact</p>
                                <a href={`mailto:${CONTACT_EMAIL}`} className="inline-block mt-2 text-sm" style={{color:'var(--ink)'}}>{CONTACT_EMAIL}</a>
                                <div className="mt-5 flex flex-col gap-3">
                                    <a href="/#generator" className="cta-secondary text-center">Open Live Studio</a>
                                    <button onClick={openModal} className="cta-hero cta-glow-soft">Unlock Advanced Features</button>
                                </div>
                            </aside>
                        </div>
                    </div>
                </section>

                <section className="py-8 md:py-12" style={{background:'var(--paper)'}}>
                    <div className="site-shell">
                        <div className="grid lg:grid-cols-2 gap-4">
                            {sections.map((section) => (
                                <article key={section.title} className="paper-panel p-5 md:p-6">
                                    <div className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(27,79,130,0.72)'}}>{section.title}</div>
                                    <div className="grid gap-3 mt-4">
                                        {section.body.map((paragraph, index) => (
                                            <p key={index} className="text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.66)'}}>{paragraph}</p>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </>
        )}
    </SubpageChrome>
);

const PrivacyPage = () => {
    const sections = [
        {
            title: 'Information we collect',
            body: [
                'We may collect contact details you send through access forms, project brief information submitted through the product, and the outputs generated from those inputs.',
                'We may also collect limited technical data such as basic usage logs, browser information, and service diagnostics needed to keep the product working.',
            ],
        },
        {
            title: 'How the information is used',
            body: [
                'We use information to operate Keystone, respond to access requests, improve output quality, maintain security, and understand whether the product is reliable for real homeowner use.',
                'We do not treat your project data as public marketing material without permission.',
            ],
        },
        {
            title: 'Sharing and service providers',
            body: [
                'Keystone relies on hosted infrastructure and model providers to generate outputs and deliver the service. Information may be processed by those providers as part of normal operation.',
                'We do not sell personal information. We share data only as needed to run, secure, or improve the service.',
            ],
        },
        {
            title: 'Retention',
            body: [
                'We retain information for as long as reasonably necessary to operate the product, support users, evaluate product quality, and comply with legal obligations.',
                'If you need a deletion request reviewed, contact us at the email listed on this page and we will handle it where reasonably possible.',
            ],
        },
        {
            title: 'Your choices',
            body: [
                'You can choose not to submit forms or project details, though that may limit access to Keystone.',
                'You may also contact us to ask questions about access, stored contact details, submitted project data, or deletion requests.',
            ],
        },
        {
            title: 'Important note',
            body: [
                'Keystone is an early-stage product. This privacy page is a starter draft designed to be transparent while the formal company structure is still being finalized.',
            ],
        },
    ];

    return (
        <LegalPage
            eyebrow="Privacy"
            title="A plain-language privacy draft for an early-stage studio product."
            intro="This page explains the current privacy posture for Keystone in straightforward terms. It is meant to be readable now and tightened further as the business structure becomes formalized."
            sections={sections}
        />
    );
};

const TermsPage = () => {
    const sections = [
        {
            title: 'Nature of the service',
            body: [
                'Keystone is an early-stage home design and discovery product. It helps people describe what they want in a house, generate conceptual floor plans, prepare elevations and a concept-level Cost Estimate, create downloadable images and DXF exports, and produce Exterior Renders from project briefs.',
                'The service is offered on an early-stage basis and may evolve, change, pause, or improve over time.',
            ],
        },
        {
            title: 'Professional responsibility',
            body: [
                'Keystone does not replace licensed design professionals. All outputs must be reviewed, interpreted, and validated by qualified professionals before they are used in any meaningful project context.',
                'You are responsible for how you use outputs inside your own planning, budgeting, or design process.',
            ],
        },
        {
            title: 'Not construction documents',
            body: [
                'Keystone outputs are conceptual only. They are not permit-ready drawings, engineering documents, code compliance confirmations, or final construction instructions.',
                'You must not rely on Keystone outputs as final technical documents without further professional development and review.',
            ],
        },
        {
            title: 'User responsibilities',
            body: [
                'You agree to provide information you have the right to use and to avoid unlawful, infringing, or harmful inputs.',
                'If Keystone access is private or code-based, you are responsible for safeguarding that access and sharing it only as intended.',
            ],
        },
        {
            title: 'Payments and availability',
            body: [
                'Pricing, access policies, and demo eligibility may change as the product evolves. Guided sessions or free demos may be limited or discontinued.',
                'We do not guarantee uninterrupted availability, and we may suspend or modify access when needed for reliability or safety.',
            ],
        },
        {
            title: 'Warranty and liability',
            body: [
                'Keystone is provided as-is to the fullest extent permitted by law. We make no guarantee that outputs will be accurate for every project, complete for every use case, or uninterrupted at all times.',
                'To the fullest extent permitted by law, Keystone is not liable for project losses, downstream design decisions, construction reliance, or other damages arising from use of conceptual outputs.',
            ],
        },
    ];

    return (
        <LegalPage
            eyebrow="Terms"
            title="Interim terms for using Keystone responsibly."
            intro="These terms are written to match the current reality of the product: an early-stage studio tool for first conversations, not a substitute for professional design responsibility."
            sections={sections}
        />
    );
};

const AppRouter = () => {
    const path = getCurrentPath();
    if (path === '/how-floor-plans-work') return <HowFloorPlansWorkPage/>;
    if (path === '/case-study') return <CaseStudyPage/>;
    if (path === '/b2b-workflow') return <B2BWorkflowPage/>;
    if (path === '/roadmap') return <RoadmapPage/>;
    if (path === '/faq') return <FAQPage/>;
    if (path === '/privacy') return <PrivacyPage/>;
    if (path === '/terms') return <TermsPage/>;
    return <DreamApp/>;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppRouter/>);


