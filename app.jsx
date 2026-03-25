const { useState, useEffect, useRef, useMemo } = React;
const FM = window.framerMotion || window.Motion;
const { motion, AnimatePresence, useScroll, useTransform, useSpring } = FM;

const ASSETS = {
    watermark:        "images/keystone-line-art.png",
    icon:             "images/keystone-icon.svg",
    qrCode:           "images/qualtrics-qr.png",
    team:             { sujan: "images/sujan.png", subrat: "images/subrat.png", rhythm: "images/rhythm.png" },
    phase1:           ["images/1.jpg","images/2.jpg","images/3.jpg","images/4.jpg","images/5.jpg","images/6.jpg"],
    phase2:           ["images/7.jpeg","images/8.jpeg","images/9.jpeg","images/10.jpeg","images/11.jpeg","images/12.jpeg","images/13.jpeg","images/14.jpeg"],
    phase3:           ["images/15.jpeg","images/16.jpeg","images/17.jpeg","images/18.jpeg","images/19.jpeg","images/20.jpeg"],
    exampleBlueprint: "images/sample_plan.png",
    exampleRender:    "images/sample_3d.png",
};

// â”€â”€â”€ HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const scrollTo = (id) => {
    if (id === 'generator') { document.dispatchEvent(new CustomEvent('keystone:open-studio')); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};
const BRAND_NAME = 'Keystone AI Studio';
const CONTACT_EMAIL = 'aikeystone559@gmail.com';
const LEGAL_UPDATED_AT = 'March 14, 2026';
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

// ─── SCROLL PROGRESS ────────────────────────────────────────────────────────
// (handled by vanilla JS in index.html — no React overhead needed)

// ─── REVEAL WRAPPER ─────────────────────────────────────────────────────────
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

// ─── REACT-BITS ADAPTED COMPONENTS ──────────────────────────────────────────

// SpotlightCard — mouse-tracking radial spotlight
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

// TiltCard — 3D perspective tilt on hover
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

// BlurText — scroll-triggered word-by-word blur reveal
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

// GradientText — animated orange gradient text wrapper
const GradientText = ({ children, className = '' }) => (
    <span className={`gradient-text-anim ${className}`}>{children}</span>
);

// StarBorderBtn — CTA button with animated rotating glow ring
const StarBorderBtn = ({ children, onClick, className = '' }) => (
    <div className={`star-border-wrap ${className}`}>
        <button type="button" onClick={onClick} className="cta-hero cta-glow cta-live" style={{ position: 'relative', zIndex: 1 }}>
            {children}
        </button>
    </div>
);

// OrbBackground — CSS animated floating orb blobs
const OrbBackground = () => (
    <div className="orb-bg" aria-hidden="true">
        <div className="orb orb-1"/>
        <div className="orb orb-2"/>
        <div className="orb orb-3"/>
    </div>
);

// FloatingParticles — canvas-based drifting particle field
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

// CountUp — scroll-triggered animated number counter
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

// ─── SPLASH CURSOR (WebGL fluid simulation) ─────────────────────────────────
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
    // WebGL fluid sim disabled — causes GL_INVALID_OPERATION feedback-loop errors on some GPUs
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

// ─── WAVES (Perlin noise animated wave lines) ────────────────────────────────
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

// ─── MAGIC BENTO (interactive particle bento grid) ───────────────────────────
const keystoneBentoCards = [
    { color:'#0D0806', title:'Floor Plans in <60s', description:'From guided client brief to architect-ready layout, instantly', label:'Speed',
      svgHtml:'<svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="74" height="50" rx="2" stroke="#FF6A37" stroke-width="1.2" opacity="0.4"/><rect x="3" y="3" width="42" height="30" rx="1" stroke="#FF9A5C" stroke-width="1.4"/><rect x="45" y="3" width="32" height="30" rx="1" stroke="#FF9A5C" stroke-width="1.4"/><rect x="3" y="33" width="26" height="20" rx="1" stroke="#FF9A5C" stroke-width="1.4"/><rect x="29" y="33" width="48" height="20" rx="1" stroke="#FF9A5C" stroke-width="1.4"/><line x1="16" y1="3" x2="16" y2="33" stroke="#FF6A37" stroke-width="0.8" opacity="0.35"/><line x1="45" y1="33" x2="45" y2="53" stroke="#FF6A37" stroke-width="0.8" opacity="0.35"/></svg>' },
    { color:'#0D0806', title:'Gemini Exterior', description:'Atmosphere visualized from the same brief', label:'Vision',
      svgHtml:'<svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="40,6 70,27 70,53 10,53 10,27" stroke="#FF9A5C" stroke-width="1.4" fill="none" stroke-linejoin="round"/><polygon points="40,6 70,27 10,27" stroke="#FF6A37" stroke-width="1.2" fill="rgba(255,106,55,0.07)" stroke-linejoin="round"/><rect x="32" y="36" width="16" height="17" rx="1" stroke="#FF9A5C" stroke-width="1.2"/><rect x="14" y="30" width="12" height="10" rx="1" stroke="#FF9A5C" stroke-width="1" opacity="0.65"/><rect x="54" y="30" width="12" height="10" rx="1" stroke="#FF9A5C" stroke-width="1" opacity="0.65"/><circle cx="65" cy="13" r="5" stroke="#FF6A37" stroke-width="1" opacity="0.55"/><line x1="65" y1="6" x2="65" y2="4" stroke="#FF6A37" stroke-width="1" opacity="0.45"/><line x1="72" y1="13" x2="74" y2="13" stroke="#FF6A37" stroke-width="1" opacity="0.45"/><line x1="58" y1="13" x2="56" y2="13" stroke="#FF6A37" stroke-width="1" opacity="0.45"/></svg>' },
    { color:'#0D0806', title:'Guided Intake', description:'Structured discovery before the meeting starts', label:'Discovery',
      svgHtml:'<svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="8" width="48" height="44" rx="3" stroke="#FF6A37" stroke-width="1.4" opacity="0.55"/><rect x="28" y="4" width="24" height="8" rx="2" stroke="#FF9A5C" stroke-width="1.2"/><circle cx="24" cy="22" r="3" stroke="#FF9A5C" stroke-width="1.3"/><polyline points="22.6,22 24,23.8 26,20.2" stroke="#FF9A5C" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="30" y1="22" x2="57" y2="22" stroke="#FF9A5C" stroke-width="1.3" opacity="0.85"/><circle cx="24" cy="33" r="3" stroke="#FF9A5C" stroke-width="1.3" opacity="0.7"/><line x1="30" y1="33" x2="57" y2="33" stroke="#FF9A5C" stroke-width="1.3" opacity="0.6"/><circle cx="24" cy="44" r="3" stroke="#FF9A5C" stroke-width="1.3" opacity="0.5"/><line x1="30" y1="44" x2="50" y2="44" stroke="#FF9A5C" stroke-width="1.3" opacity="0.4"/></svg>' },
    { color:'#0D0806', title:'4K PNG Export', description:'High-res blueprint download, architect-ready', label:'Export',
      svgHtml:'<svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="18" y="2" width="44" height="38" rx="3" stroke="#FF6A37" stroke-width="1.4" opacity="0.55"/><rect x="22" y="6" width="36" height="30" rx="1" stroke="#FF9A5C" stroke-width="1.1" opacity="0.5"/><line x1="22" y1="14" x2="58" y2="14" stroke="#FF9A5C" stroke-width="0.9" opacity="0.4"/><line x1="22" y1="22" x2="58" y2="22" stroke="#FF9A5C" stroke-width="0.9" opacity="0.4"/><line x1="22" y1="30" x2="50" y2="30" stroke="#FF9A5C" stroke-width="0.9" opacity="0.35"/><line x1="32" y1="6" x2="32" y2="36" stroke="#FF9A5C" stroke-width="0.9" opacity="0.3"/><line x1="40" y1="43" x2="40" y2="52" stroke="#FF9A5C" stroke-width="2" stroke-linecap="round"/><polyline points="33,48 40,54 47,48" stroke="#FF9A5C" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
    { color:'#0D0806', title:'Passkey Access', description:'Firm-controlled client link with secure entry', label:'Security',
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
                            A brief study with residential architects and designers. Your responses directly shape Keystone's roadmap and pricing.
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
                                For residential architects &amp; designers
                            </p>
                        </div>
                    </Reveal>

                    <Reveal y={12} delay={0.30}>
                        <div className="flex justify-center gap-3 flex-wrap mt-6">
                            {[{val:'~3 min',lbl:'to complete'},{val:'10',lbl:'questions'},{val:'100%',lbl:'anonymous'}].map(item => (
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

// ─── MOBILE NAV ──────────────────────────────────────────────────────────────
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
                    <div>
                        <span className="cg text-[1.35rem] uppercase tracking-[-0.05em] text-white">Keystone</span>
                        <p className="mono text-[8px] uppercase tracking-[0.24em] mt-1" style={{color:'rgba(244,239,230,0.4)'}}>AI studio</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div className="flex-1 px-6 py-6 flex flex-col gap-0">
                    {[['Work','work'],['Services','services'],['Pricing','pricing'],['Live Studio','generator'],['Studio','studio'],['Sessions','gallery']].map(([label, id], i) => (
                        <button key={id} onClick={() => { scrollTo(id); onClose(); }}
                            className="cg text-[2rem] text-left border-b border-white/6 py-4 flex justify-between items-center text-white/90 hover:text-white transition-colors"
                            style={{letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                            {label}
                            <span className="mono text-sm text-white/20">0{i+1}</span>
                        </button>
                    ))}
                    <div className="grid grid-cols-2 gap-2 mt-5">
                        <a href="/case-study" className="mono text-[10px] uppercase tracking-[0.22em] px-4 py-3 rounded-full border border-white/10 text-center text-white/70 hover:text-white hover:border-white/24 transition-colors">
                            Case Study
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
                            Request Access
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

// â”€â”€â”€ JOIN MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const JoinModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = React.useState({ fullName:'', firmName:'', email:'', volume:'1-10 Projects', questions:'' });
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
                setFormData({ fullName:'', firmName:'', email:'', volume:'1-10 Projects', questions:'' });
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
                        className="bg-paper electric-border w-full md:max-w-md rounded-t-2xl md:rounded-xl shadow-2xl relative overflow-hidden"
                    >
                        <div style={{ height:'3px', background:'linear-gradient(90deg, var(--accent), var(--accent-2))' }}/>

                        <button
                            onClick={onClose}
                            aria-label="Close access request"
                            className="absolute top-4 right-4 w-9 h-9 bg-black/6 hover:bg-black/12 rounded-full flex items-center justify-center transition-colors z-10"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </button>

                        <div className="p-6 md:p-8 overflow-y-auto" style={{ maxHeight:'90vh' }}>
                            <span className="badge mb-3 inline-block">Request Access</span>
                            <h2 className="cg text-3xl mb-1 mt-2" style={{ letterSpacing:'-0.05em', textTransform:'uppercase' }}>Access the live studio.</h2>
                            <p className="text-mid text-sm mt-2 mb-6 leading-relaxed">Qualified residential architecture firms can see how the B2B workflow works in practice: send the client a guided link, collect a structured brief, and review outputs before the first meeting.</p>

                            {status === 'success' ? (
                                <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} className="flex flex-col items-center text-center py-10">
                                    <div className="w-16 h-16 rounded-full bg-blue flex items-center justify-center mb-4"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                                    <h3 className="cg text-2xl" style={{ letterSpacing:'-0.05em', textTransform:'uppercase' }}>You&apos;re in the queue.</h3>
                                    <p className="text-mid text-sm mt-2">We will follow up with studio access details and next steps for your firm shortly.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mono text-[7px] uppercase tracking-widest text-mid block mb-1">Full Name</label>
                                            <input type="text" name="fullName" value={formData.fullName} onChange={update} required placeholder="Jane Doe"/>
                                        </div>
                                        <div>
                                            <label className="mono text-[7px] uppercase tracking-widest text-mid block mb-1">Firm Name</label>
                                            <input type="text" name="firmName" value={formData.firmName} onChange={update} required placeholder="Firm LLC"/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mono text-[7px] uppercase tracking-widest text-mid block mb-1">Business Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={update} required placeholder="jane@firm.com"/>
                                    </div>
                                    <div>
                                        <label className="mono text-[7px] uppercase tracking-widest text-mid block mb-1">Annual Project Volume</label>
                                        <select name="volume" value={formData.volume} onChange={update}>
                                            <option>1-10 Projects</option>
                                            <option>10-30 Projects</option>
                                            <option>30+ Projects</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mono text-[7px] uppercase tracking-widest text-mid block mb-1">Questions / Notes</label>
                                        <textarea name="questions" rows="2" value={formData.questions} onChange={update} placeholder="Optional..."/>
                                    </div>
                                    <button type="submit" disabled={status === 'loading'} className="cta-hero w-full py-4 text-base disabled:opacity-60">
                                        {status === 'loading' ? 'Sending...' : 'Request Access'}
                                    </button>
                                    <p className="text-center mono text-[9px] text-mid">No spam - no credit card - fast follow-up</p>
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

// PLAN SUMMARY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PlanSummaryPanel = ({ planSpec }) => {
    if (!planSpec) return null;
    const allRooms = (planSpec.levels||[]).flatMap(l => l.rooms||[]);
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
        </div>
    );
};

// â”€â”€â”€ REFINEMENT PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        <div className="border-t border-white/8">
            <div className="flex items-center justify-between px-4 md:px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'var(--accent)',display:'inline-block'}}/>
                    <p className="mono text-[8px] uppercase tracking-[0.24em] font-bold" style={{color:'rgba(244,239,230,0.76)'}}>Studio notes</p>
                </div>
                <span className="mono text-[9px] font-bold" style={{color: countColor}}>
                    {refinementsLeft}/10 edits left
                </span>
            </div>
            <div className="px-4 md:px-5 pb-3">
                <p className="text-[12px] leading-relaxed" style={{color:'rgba(244,239,230,0.56)'}}>
                    Use quick edits to explore the floor plan before you export it or move into the Gemini exterior study.
                </p>
            </div>

            {refinementHistory.length > 0 && (
                <div ref={historyRef} className="mx-4 md:mx-5 mb-3 max-h-40 overflow-y-auto rounded-[14px]"
                    style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)'}}>
                    {refinementHistory.map((msg, i) => (
                        <div key={i} className="px-3 py-2.5 border-b last:border-0" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                            {msg.role === 'user' && (
                                <div className="flex gap-2 items-start">
                                    <span className="mono text-[7px] uppercase pt-0.5 flex-shrink-0 font-bold" style={{color:'rgba(255,181,160,0.92)'}}>You</span>
                                    <span className="text-[11px] leading-snug" style={{color:'rgba(244,239,230,0.82)'}}>{msg.content}</span>
                                </div>
                            )}
                            {msg.role === 'assistant' && (
                                <div className="flex gap-2 items-start">
                                    <span className="mono text-[7px] uppercase pt-0.5 flex-shrink-0 font-bold" style={{color:'rgba(244,239,230,0.46)'}}>Studio</span>
                                    <span className="text-[11px] leading-snug" style={{color:'rgba(190,221,255,0.92)'}}>Updated: {msg.content}</span>
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
                            <span className="mono text-[8px] uppercase tracking-widest animate-pulse" style={{color:'rgba(244,239,230,0.48)'}}>Updating the plan...</span>
                        </div>
                    )}
                </div>
            )}
            {isLoading && refinementHistory.length === 0 && (
                <div className="mx-4 md:mx-5 mb-3 px-3 py-2 flex items-center gap-2 rounded-[14px]" style={{background:'rgba(255,255,255,0.06)'}}>
                    <div className="w-3 h-3 border-2 border-blue border-t-transparent rounded-full animate-spin flex-shrink-0"/>
                    <span className="mono text-[8px] uppercase tracking-widest animate-pulse" style={{color:'rgba(244,239,230,0.48)'}}>Updating the plan...</span>
                </div>
            )}

            <div className="flex flex-wrap gap-1.5 px-4 md:px-5 mb-3">
                {REFINEMENT_SUGGESTIONS.map((s, i) => (
                    <button key={i} disabled={disabled} onClick={() => onRefine(s)}
                        className="text-[9px] px-2.5 py-1.5 border transition-all disabled:opacity-30 rounded-full"
                        style={{borderColor:'rgba(255,255,255,0.12)',background:'rgba(255,255,255,0.04)',color:'rgba(244,239,230,0.74)'}}>
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

// â”€â”€â”€ RENDER SURVEY MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const RenderSurveyModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [data, setData] = useState(initialData || {
        zipCode: '', exteriorStyle: '', roofStyle: 'Gabled', landscaping: 'Manicured lawn',
        surroundings: '', season: 'Summer', timeOfDay: 'Midday', lotContext: '',
    });
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
                        className="bg-paper electric-border w-full md:max-w-lg rounded-t-2xl md:rounded-xl shadow-2xl relative overflow-hidden">
                        <div style={{height:'3px',background:'linear-gradient(90deg,var(--blue),var(--red))'}}/>
                        <button type="button" onClick={onClose} aria-label="Close render options" className="absolute top-4 right-4 w-8 h-8 bg-black/6 hover:bg-black/12 rounded-full flex items-center justify-center z-10">
                            <CloseIcon className="w-4 h-4"/>
                        </button>

                        <div className="p-6 overflow-y-auto" style={{maxHeight:'85vh'}}>
                            <span className="badge mb-3 inline-block">3D Render Options</span>
                            <h2 className="cg text-2xl italic mb-1">Customize Your Render.</h2>
                            <p className="text-mid text-[11px] mb-5 leading-relaxed">These details help Gemini AI generate a more accurate and context-aware exterior render.</p>

                            <div className="space-y-4">
                                {/* ZIP CODE */}
                                <div>
                                    <Lbl>Project ZIP Code</Lbl>
                                    <input type="text" placeholder="e.g. 78701" maxLength="10"
                                        value={data.zipCode} onChange={e => upd('zipCode', e.target.value)}
                                        style={{maxWidth:'180px'}}/>
                                    <p className="text-[9px] text-mid/60 mt-1">Helps set regional context - climate, terrain, neighborhood character</p>
                                </div>

                                {/* EXTERIOR STYLE OVERRIDE */}
                                <div>
                                    <Lbl>Exterior Style</Lbl>
                                    <BtnRow field="exteriorStyle" options={[
                                        {val:'Craftsman (Wood & Stone)',          label:'Craftsman'},
                                        {val:'Modern Farmhouse (Board & Batten)', label:'Farmhouse'},
                                        {val:'Traditional Colonial (Brick)',      label:'Colonial'},
                                        {val:'Contemporary Modern (Concrete)',    label:'Modern'},
                                        {val:'Mediterranean (Stucco & Tile)',     label:'Mediterranean'},
                                        {val:'Rustic Cabin (Log & Stone)',        label:'Rustic'},
                                    ]}/>
                                    <p className="text-[9px] text-mid/60 mt-1">Leave blank to use your plan survey style</p>
                                </div>

                                {/* ROOF STYLE */}
                                <div>
                                    <Lbl>Roof Style</Lbl>
                                    <BtnRow field="roofStyle" options={['Gabled','Hip Roof','Flat Roof','Metal Standing Seam','Terracotta Tile','Cathedral / Vaulted']}/>
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

                                {/* SURROUNDINGS */}
                                <div>
                                    <Lbl>Surrounding Environment</Lbl>
                                    <BtnRow field="surroundings" options={[
                                        {val:'Suburban neighborhood', label:'Suburban'},
                                        {val:'Wooded forest',         label:'Wooded'},
                                        {val:'Desert arid landscape', label:'Desert'},
                                        {val:'Tropical lush',         label:'Tropical'},
                                        {val:'Snow and mountains',    label:'Mountain'},
                                        {val:'Ocean or lake waterfront', label:'Waterfront'},
                                    ]}/>
                                </div>

                                {/* LANDSCAPING */}
                                <div>
                                    <Lbl>Landscaping</Lbl>
                                    <BtnRow field="landscaping" options={[
                                        'Manicured lawn',
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
                                Generate Exterior Study
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

// â”€â”€â”€ 3D RENDER PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const RENDER_REFINEMENTS = [
    { label: 'Golden Hour',  hint: 'warm late-afternoon sunlight, long shadows, golden orange sky. Only change the lighting and sky; keep the house architecture identical.' },
    { label: 'Overcast Day', hint: 'soft diffuse overcast lighting, muted tones, grey cloud-covered sky. Only change the lighting and sky; keep the house architecture identical.' },
    { label: 'Night Lit',    hint: 'night scene with interior lights glowing warmly through windows, landscape uplighting, and a deep blue sky. Only change the lighting and sky; keep the house architecture identical.' },
    { label: 'Sunrise',      hint: 'sunrise with a pink-orange gradient sky and long warm shadows across the facade. Only change the lighting and sky; keep the house architecture identical.' },
];

const Render3DPanel = ({ planSpec, formData, planSvg, galleryId, onRenderReady }) => {
    const [renderStatus, setRenderStatus] = useState('idle'); // idle|survey|loading|error|ready
    const [renderImage, setRenderImage] = useState(null);
    const [renderImageClean, setRenderImageClean] = useState(null); // without watermark, for lighting edits
    const [errorMsg, setErrorMsg] = useState('');
    const [activeRefinement, setActiveRefinement] = useState(null);
    const [showSurvey, setShowSurvey] = useState(false);
    const [renderSurveyData, setRenderSurveyData] = useState(null);

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
            const planImage = isLightingOnly ? null : await svgToPngDataUrl(planSvg, { background: '#F6F4EF' });

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
            };

            const res = await fetch('/api/render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            let data;
            try { data = await res.json(); } catch(_) { data = { success: false, message: `Server error ${res.status}` }; }

            if (!data.success) {
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

    const handleRender = () => { setActiveRefinement(null); setShowSurvey(true); };
    const handleRegenerate = () => { setActiveRefinement(null); doRender(renderSurveyData, null, null); };

    const handleRefinement = (ref) => {
        setActiveRefinement(ref.label);
        // Pass the clean (un-watermarked) existing image so backend can do lighting-only edit
        doRender(renderSurveyData, ref.hint, renderImageClean);
    };

    if (renderStatus === 'idle') return (
        <>
            <RenderSurveyModal isOpen={showSurvey} onClose={() => setShowSurvey(false)} onSubmit={handleSurveySubmit} initialData={renderSurveyData}/>
            <button onClick={handleRender}
                className="w-full py-3.5 cta-hero cta-glow text-[10px]">
                Generate Gemini Exterior Study
            </button>
        </>
    );

    if (renderStatus === 'loading') return (
        <div className="flex flex-col items-center gap-3 py-5">
            <div className="flex items-center gap-3 text-blue">
                <div className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin"/>
                <span className="mono text-[9px] uppercase tracking-widest animate-pulse">
                    {activeRefinement ? `Adjusting lighting: ${activeRefinement}...` : 'Rendering with Gemini...'}
                </span>
            </div>
            <p className="mono text-[8px] text-mid opacity-50">
                {activeRefinement ? 'Changing lighting only - architecture unchanged' : 'Usually 15-30 seconds'}
            </p>
        </div>
    );

    if (renderStatus === 'error') return (
        <>
            <RenderSurveyModal isOpen={showSurvey} onClose={() => setShowSurvey(false)} onSubmit={handleSurveySubmit} initialData={renderSurveyData}/>
            <div className="p-4 bg-red/5 border border-red/20 rounded-sm">
                <p className="mono text-[9px] font-bold text-red uppercase mb-1">Render Failed</p>
                <p className="text-[10px] text-mid leading-relaxed mb-3" style={{wordBreak:'break-word'}}>{errorMsg}</p>
                <button onClick={() => setShowSurvey(true)}
                    className="mono text-[9px] uppercase tracking-widest px-3 py-1.5 bg-ink text-white rounded-sm hover:bg-blue transition-colors">
                    Retry
                </button>
            </div>
        </>
    );

    if (renderStatus === 'ready') return (
        <div>
            <RenderSurveyModal isOpen={showSurvey} onClose={() => setShowSurvey(false)} onSubmit={handleSurveySubmit} initialData={renderSurveyData}/>
            <SmartImage src={renderImage} className="w-full object-cover rounded-[16px] shadow-xl" alt="Gemini exterior study"/>
            {/* Toolbar */}
            <div className="flex items-center gap-2 mt-2 mb-3 flex-wrap">
                <span className="mono text-[8px] uppercase tracking-widest text-mid">
                    {activeRefinement ? `Lighting: ${activeRefinement}` : 'Gemini exterior study'}
                </span>
                <button onClick={() => { const l=document.createElement('a'); l.href=renderImage; l.download='Keystone_3D.png'; l.click(); }}
                    className="ml-auto mono text-[9px] text-blue underline">Download</button>
                <button onClick={handleRegenerate} className="mono text-[9px] text-mid underline">Regenerate</button>
                <button onClick={() => setShowSurvey(true)} className="mono text-[9px] text-mid underline">Options</button>
            </div>

            {/* Lighting refinement chips â€” lighting only, architecture unchanged */}
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

// â”€â”€â”€ SURVEY FORM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SURVEY_STEPS = [
    { id:'basics',    title:'Basic Requirements',   subtitle:'Size, stories, and rooms',           fields:['totalArea','stories','bedrooms','bathrooms','privateBaths'] },
    { id:'structure', title:'Structure & Site',      subtitle:'Garage, shape, and orientation',     fields:['garage','shape','frontFacing','lotContext'] },
    { id:'lifestyle', title:'Lifestyle & Layout',    subtitle:'How you live in the home',           fields:['openConcept','masterLocation','kitchenPlacement','laundryLocation','ceilingHeight'] },
    { id:'style',     title:'Style & Materials',     subtitle:'Aesthetic and finishes',             fields:['materials','indoorOutdoor','naturalLight'] },
    { id:'extras',    title:'Special Features',      subtitle:'Additional rooms and preferences',   fields:['features','accessibilityNeeds','budgetTier','freeformWishes'] },
];
const DEFAULT_FORM_DATA = {
    location:'', totalArea:'2400', stories:'2 Stories', bedrooms:'3 Bed', bathrooms:'3 Bath',
    privateBaths:'1',
    shape:'Rectangular', garage:'1 Car Garage', materials:'Craftsman (Wood & Stone)',
    openConcept:'Open Concept (Combined)', masterLocation:'Level 2 (Upper)', kitchenPlacement:'Rear of House',
    features:'', frontFacing:'South', lotContext:'Suburban standard lot',
    laundryLocation:'Level 1 (near garage/mud)', ceilingHeight:'Standard (9 ft)',
    indoorOutdoor:'Moderate (some connection)', naturalLight:'Balanced windows',
    accessibilityNeeds:'None', budgetTier:'Mid ($200-300/sqft)', freeformWishes:'',
};

const SurveyForm = ({ formData, setFormData, onSubmit, isLoading, onReset }) => {
    const [step, setStep] = useState(0);
    const upd = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
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
            case 'privateBaths': return (
                <div key={field} className="space-y-1.5 p-3 bg-blue/4 border border-blue/15 rounded-sm">
                    <Lbl>Private En-Suite Bathrooms</Lbl>
                    <p className="text-[10px] text-mid mb-2">How many bedrooms should have their own private bathroom attached?</p>
                    <div className="flex gap-2">{[0,1,2,3].filter(n => n <= bedCount).map(n=>{ const selected = formData.privateBaths===`${n}`; return <button key={n} type="button" aria-pressed={selected} onClick={()=>upd('privateBaths',`${n}`)} className="flex-1 h-10 border text-sm font-bold rounded-sm transition-all" style={choiceStyle(selected, 'blue')}>{n === 0 ? 'None' : n}</button>; })}</div>
                    <p className="text-[9px] text-mid/50">Primary bedroom always gets an en-suite. Remaining baths are shared.</p>
                </div>
            );
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
            case 'materials': return <div key={field} className="space-y-1.5"><Lbl>Exterior Style & Materials</Lbl><BtnGrid field="materials" cols={1} options={[
                {val:'Craftsman (Wood & Stone)',          label:'Craftsman',              desc:'Natural wood trim, stone veneer, covered porch'},
                {val:'Modern Farmhouse (Board & Batten)', label:'Modern Farmhouse',       desc:'Board-and-batten, black frames, metal roof'},
                {val:'Traditional Colonial (Brick)',      label:'Traditional / Colonial', desc:'Brick facade, symmetrical windows, pitched roof'},
                {val:'Contemporary Modern (Concrete)',    label:'Contemporary / Modern',  desc:'Flat roof, concrete, floor-to-ceiling glass'},
                {val:'Mediterranean (Stucco & Tile)',     label:'Mediterranean',          desc:'Stucco exterior, terracotta tiles, arched details'},
            ]}/></div>;
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


// â”€â”€â”€ GALLERY COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
                                {/* Side-by-side at 50% scale each â€” both visible without scrolling */}
                                <div className="gallery-detail-grid">
                                    {/* SVG blueprint â€” clipped to fixed height, scaled down */}
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

                                {/* Thumbnail â€” blueprint + render side by side at 50% */}
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

// ─── INTERACTIVE CANVAS (pan/zoom blueprint viewport) ────────────────────────
const InteractiveCanvas = ({ children }) => {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [blueprintMode, setBlueprintMode] = useState(false);
    const containerRef = useRef(null);

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

    const onMouseDown = (e) => { if (e.button !== 0) return; setIsDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
    const onMouseMove = (e) => { if (!isDragging) return; setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
    const onMouseUp = () => setIsDragging(false);
    const resetView = () => { setScale(1); setOffset({ x: 0, y: 0 }); };

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
            }}>{children}</div>
            {/* Floating toolbar */}
            <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', alignItems: 'center', gap: 2,
                background: 'rgba(10,10,12,0.72)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999,
                padding: '4px 10px', zIndex: 20, userSelect: 'none',
            }}>
                {toolbarBtn((e) => { e.stopPropagation(); setScale(s => Math.max(s * 0.8, 0.2)); }, 'Zoom Out',
                    <svg width=”13” height=”13” fill=”none” stroke=”currentColor” viewBox=”0 0 24 24”><path strokeLinecap=”round” strokeLinejoin=”round” strokeWidth=”2” d=”M20 12H4”/></svg>)}
                <span className=”mono” style={{ fontSize: 8, color: 'rgba(244,239,230,0.4)', letterSpacing: '0.1em', minWidth: 34, textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
                {toolbarBtn((e) => { e.stopPropagation(); setScale(s => Math.min(s * 1.25, 5)); }, 'Zoom In',
                    <svg width=”13” height=”13” fill=”none” stroke=”currentColor” viewBox=”0 0 24 24”><path strokeLinecap=”round” strokeLinejoin=”round” strokeWidth=”2” d=”M12 4v16m8-8H4”/></svg>)}
                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', margin: '0 2px' }} />
                {toolbarBtn((e) => { e.stopPropagation(); resetView(); }, 'Fit to View',
                    <svg width=”13” height=”13” fill=”none” stroke=”currentColor” viewBox=”0 0 24 24”><path strokeLinecap=”round” strokeLinejoin=”round” strokeWidth=”2” d=”M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4”/></svg>)}
                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', margin: '0 2px' }} />
                {toolbarBtn((e) => { e.stopPropagation(); setBlueprintMode(m => !m); }, blueprintMode ? 'White Mode' : 'Blueprint Mode',
                    <svg width=”13” height=”13” fill=”none” stroke=”currentColor” viewBox=”0 0 24 24”><path strokeLinecap=”round” strokeLinejoin=”round” strokeWidth=”2” d=”M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2”/></svg>,
                    blueprintMode)}
            </div>
            <div style={{ position: 'absolute', top: 10, left: 12, fontFamily: 'IBM Plex Mono,monospace', fontSize: 8,
                color: 'rgba(244,239,230,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase',
                pointerEvents: 'none', userSelect: 'none',
            }}>{blueprintMode ? 'BLUEPRINT — DRAG TO PAN · SCROLL TO ZOOM' : 'DRAG TO PAN · SCROLL TO ZOOM'}</div>
        </div>
    );
};

// ─── DESIGN GENERATOR ────────────────────────────────────────────────────────
const DesignGenerator = ({ onOpenModal }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passkeyInput, setPasskeyInput] = useState('');
    const [unlockStatus, setUnlockStatus] = useState('idle');

    const [formData, setFormData] = useState(() => ({ ...DEFAULT_FORM_DATA }));

    const [status, setStatus] = useState('idle');
    const [planSvg, setPlanSvg] = useState(null);
    const [planSpec, setPlanSpec] = useState(null);
    const [refinementHistory, setRefinementHistory] = useState([]);
    const [refinementsLeft, setRefinementsLeft] = useState(10);
    const [zoomImage, setZoomImage] = useState(null);
    const [galleryId, setGalleryId] = useState(null);
    const [planScore, setPlanScore] = useState(null);
    const [footprintInfo, setFootprintInfo] = useState(null);
    const [alternatives, setAlternatives] = useState([]);
    const [showAlternatives, setShowAlternatives] = useState(false);

    useEffect(() => {
        try { const s = JSON.parse(localStorage.getItem('keystone_unlock')||'null'); if (s?.unlocked && s?.ts && (Date.now() - s.ts < 30 * 24 * 60 * 60 * 1000)) setIsUnlocked(true); else if (s?.unlocked && (!s?.ts || Date.now() - s.ts >= 30 * 24 * 60 * 60 * 1000)) localStorage.removeItem('keystone_unlock'); } catch {}
    }, []);

    const handleUnlock = async (e) => {
        e.preventDefault();
        const key = (passkeyInput||'').trim();
        if (!key) { setUnlockStatus('error:Enter a passkey.'); return; }
        setUnlockStatus('loading');
        try {
            const res = await fetch('/api/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ passkey:key }) });
            const data = await res.json().catch(() => null);
            if (res.ok && data?.success) { setIsUnlocked(true); setUnlockStatus('idle'); try { localStorage.setItem('keystone_unlock', JSON.stringify({unlocked:true,ts:Date.now()})); } catch {} return; }
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
            setPlanSpec(data.planSpec);
            setRefinementHistory([]);
            setRefinementsLeft(10);
            setGalleryId(data.galleryId || null);
            setPlanScore(data.score ?? null);
            setFootprintInfo(data.footprintInfo ?? null);
            setAlternatives(data.alternatives || []);
            setStatus('plan-ready');
        } catch(err) { alert('Error: ' + err.message); setStatus('idle'); }
    };

    const handleRefine = async (instruction) => {
        if (refinementsLeft <= 0) return;
        setStatus('refining');
        // Optimistically add user message to history
        setRefinementHistory(prev => [...prev, { role:'user', content: instruction }]);
        try {
            const res = await fetch('/api/plan/refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            setPlanSpec(data.planSpec);
            if (data.galleryId) setGalleryId(data.galleryId);
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
        const pngUrl = await svgToPngDataUrl(planSvg, {
            background: '#F6F4EF',
            pixelRatio: 3,
        });

        const l = document.createElement('a');
        l.href = pngUrl;
        l.download = 'Keystone_Blueprint_4K.png';
        document.body.appendChild(l);
        l.click();
        l.remove();
    } catch (err) {
        console.error('[downloadBlueprint]', err);
        alert('Download failed.');
    }
    };

    const isLoading = status === 'loading-plan' || status === 'refining';
    const resetSampleBrief = () => setFormData({ ...DEFAULT_FORM_DATA });

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

                {/* Passkey gate */}
                {!isUnlocked && (
                    <div className="studio-access-grid mb-8">
                        <div className="dream-panel studio-access-card p-6 md:p-8">
                            <div className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center mb-5">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                            </div>
                            <span className="section-label" style={{color:'rgba(244,239,230,0.56)'}}>Private beta access</span>
                            <h3 className="cg text-white mt-4" style={{fontSize:'clamp(1.9rem, 3vw, 2.6rem)',letterSpacing:'-0.05em',textTransform:'uppercase',lineHeight:0.94}}>
                                Unlock the same passkey-based workflow firms share with clients.
                            </h3>
                            <p className="mt-4 text-sm leading-relaxed" style={{color:'rgba(244,239,230,0.66)'}}>
                                Use a passkey if you already have one, or request a guided walkthrough if you want to see how the client link and architect handoff work in practice.
                            </p>
                            <form onSubmit={handleUnlock} className="space-y-3 mt-6">
                                <input type="password" placeholder="Enter access code" className="text-center tracking-[0.2em]" value={passkeyInput} onChange={e=>setPasskeyInput(e.target.value)} required style={{background:'rgba(255,255,255,0.92)',borderColor:'rgba(255,255,255,0.2)'}}/>
                                <button type="submit" disabled={unlockStatus==='loading'} className="cta-hero cta-glow w-full">{unlockStatus==='loading'?'Verifying...':'Unlock Live Studio'}</button>
                            </form>
                            {unlockStatus.startsWith('error:') && <p className="mt-3 mono text-[9px] uppercase font-bold text-red">{unlockStatus.replace('error:','')}</p>}
                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <div className="studio-metric">
                                    <strong>3</strong>
                                    <span className="text-[11px] uppercase tracking-[0.18em]" style={{color:'rgba(244,239,230,0.5)'}}>live outputs</span>
                                </div>
                                <div className="studio-metric">
                                    <strong>1</strong>
                                    <span className="text-[11px] uppercase tracking-[0.18em]" style={{color:'rgba(244,239,230,0.5)'}}>sample brief loaded</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-5 border-t border-white/10">
                                <p className="text-[11px]" style={{color:'rgba(244,239,230,0.6)'}}>Need guided access for your firm first?</p>
                                <button onClick={onOpenModal} className="mt-3 cta-hero cta-glow-soft">
                                    Request Access
                                </button>
                            </div>
                        </div>
                        <div className="paper-panel studio-preview-card p-5 md:p-6">
                            <span className="section-label" style={{color:'rgba(10,10,12,0.44)'}}>What opens up</span>
                            <h3 className="cg mt-4" style={{fontSize:'clamp(1.85rem, 3vw, 2.5rem)',lineHeight:0.95,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                What the architect gets back is already sitting inside the product.
                            </h3>
                            <p className="mt-4 text-sm leading-relaxed" style={{color:'rgba(10,10,12,0.64)'}}>
                                One client intake becomes a structured brief, a blueprint first, and a Gemini study second. The goal is not spectacle. It is a stronger first discussion for the studio.
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

                <div className={`grid lg:grid-cols-[300px_minmax(0,1fr)_300px] gap-4 items-start transition-opacity ${!isUnlocked ? 'opacity-10 pointer-events-none blur-sm select-none' : ''}`}>
                    {/* LEFT — The Brief */}
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

                    {/* CENTER — Blueprint Canvas */}
                    <div className="cad-canvas-panel">
                        {/* Title block */}
                        <div className="cad-canvas-titleblock">
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                                <svg width="12" height="12" fill="none" stroke="rgba(244,239,230,0.4)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                                <span className="mono" style={{fontSize:8,color:'rgba(244,239,230,0.38)',letterSpacing:'0.18em',textTransform:'uppercase'}}>
                                    {planSvg && footprintInfo ? `${footprintInfo.widthFt}′ × ${footprintInfo.heightFt}′  ·  ${formData.stories || ''}  ·  ${formData.bedrooms || ''}` : 'Blueprint Viewport'}
                                </span>
                            </div>
                            {planSvg && planScore != null
                                ? <div style={{display:'flex',alignItems:'center',gap:6}}>
                                    <span className="mono" style={{fontSize:7,color:'rgba(244,239,230,0.3)',letterSpacing:'0.14em',textTransform:'uppercase'}}>AI Score</span>
                                    <span className="mono" style={{fontSize:9,fontWeight:700,color:planScore>=70?'#4ade80':planScore>=40?'#facc15':'#f87171'}}>{planScore}/100</span>
                                  </div>
                                : <span className="mono" style={{fontSize:7,color:'rgba(244,239,230,0.2)',letterSpacing:'0.16em',textTransform:'uppercase'}}>Keystone AI · Blueprint</span>}
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
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'center'}} dangerouslySetInnerHTML={{__html:planSvg}}/>
                                </InteractiveCanvas>
                            )}
                        </div>
                    </div>

                    {/* RIGHT — Actions & Tools */}
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
                                                    <span className="value">{footprintInfo.widthFt}′ × {footprintInfo.heightFt}′</span>
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
                                        <button onClick={downloadBlueprint} className="w-full cta-hero cta-glow py-3 text-[10px] mt-1 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all">Download High-Res PNG</button>
                                        <button onClick={() => { alert('DXF export functionality is coming soon.'); }} className="w-full px-4 py-3 border border-black/10 rounded-sm hover:border-blue hover:text-blue text-[10px] font-bold uppercase tracking-widest transition-all bg-white shadow-sm flex items-center justify-center gap-2">
                                            {!isUnlocked && <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>}
                                            Export Vector DXF
                                        </button>
                                        {alternatives.length > 0 && (
                                            <button onClick={() => setShowAlternatives(true)} className="w-full cta-secondary py-3 text-[10px]">View Alternatives ({alternatives.length})</button>
                                        )}
                                    </div>
                                </div>
                                <div className="paper-panel overflow-hidden">
                                    <RefinementPanel planSpec={planSpec} formData={formData} refinementsLeft={refinementsLeft} refinementHistory={refinementHistory} onRefine={handleRefine} isLoading={isLoading}/>
                                </div>
                                <div className="paper-panel overflow-hidden">
                                    <Render3DPanel planSpec={planSpec} formData={formData} planSvg={planSvg} galleryId={galleryId} onRenderReady={img=>setZoomImage(img)}/>
                                </div>
                                <div className="paper-panel overflow-hidden">
                                    <div className="p-4 border-b border-black/5 bg-white/40"><span className="section-label">Spec Details</span></div>
                                    <PlanSummaryPanel planSpec={planSpec}/>
                                </div>
                            </>
                        ) : (
                            <div className="paper-panel p-6 text-center text-mid flex flex-col items-center justify-center h-full">
                                <svg className="w-8 h-8 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>
                                <p className="text-[11px] leading-relaxed">Once you generate a plan, export options, AI refinement tools, and structural metrics will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                        {/* â”€â”€ ALTERNATIVES MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        {showAlternatives && (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.7)'}}>
                                <div className="bg-paper rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                                    <div className="flex items-center justify-between p-4 border-b border-black/10">
                                        <div>
                                            <h3 className="font-semibold text-sm">Other Generated Plans</h3>
                                            <p className="mono text-[8px] text-mid mt-0.5 uppercase tracking-widest">
                                                {alternatives.length} alternative footprints - click any to use it
                                            </p>
                                        </div>
                                        <button onClick={() => setShowAlternatives(false)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-black/8 text-mid hover:text-ink transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                    <div className="overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {alternatives.map((alt, i) => (
                                            <div
                                                key={i}
                                                className="border border-black/10 rounded-lg overflow-hidden cursor-pointer hover:border-blue hover:shadow-md transition-all group"
                                                onClick={() => {
                                                    setPlanSvg(alt.svg);
                                                    setPlanSpec(alt.planSpec);
                                                    setPlanScore(alt.score);
                                                    setFootprintInfo(alt.footprintInfo);
                                                    // Swap: current becomes an alternative
                                                    const newAlts = [
                                                        { svg: planSvg, planSpec, score: planScore, footprintInfo },
                                                        ...alternatives.filter((_, j) => j !== i),
                                                    ].filter(a => a.svg);
                                                    setAlternatives(newAlts);
                                                    setShowAlternatives(false);
                                                }}
                                            >
                                                <div className="bg-white p-2 overflow-hidden" style={{maxHeight:'180px'}} dangerouslySetInnerHTML={{__html: alt.svg || '<p style="padding:20px;color:#999;font-size:11px">Preview unavailable</p>'}}/>
                                                <div className="p-2 bg-paper/60 border-t border-black/5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="mono text-[7px] text-mid">
                                                            {alt.footprintInfo ? `${alt.footprintInfo.widthFt} x ${alt.footprintInfo.heightFt} ft` : `Option ${i+2}`}
                                                        </span>
                                                        {alt.footprintInfo && (
                                                            <span className="mono text-[7px] text-mid">ratio {alt.footprintInfo.aspectRatio?.toFixed(2)}</span>
                                                        )}
                                                    </div>
                                                    {alt.score !== undefined && (
                                                        <div className="mt-1 h-1 bg-black/8 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue/60 rounded-full transition-all" style={{width:`${Math.min(100, alt.score)}%`}}/>
                                                        </div>
                                                    )}
                                                    <p className="mono text-[7px] text-blue mt-1 group-hover:text-ink">
                                                        {alt.score !== undefined ? `Score ${alt.score}/100` : ''} - Click to use
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-black/10 bg-paper/40">
                                        <p className="mono text-[7px] text-mid text-center">The first plan shown is the highest-scoring design. Others are alternative footprints.</p>
                                    </div>
                                </div>
                            </div>
                        )}
            </div>
        </section>
    );
};

// â”€â”€â”€ APP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const HOME_NAV_ITEMS = [
    { label:'Work', kind:'section', value:'work' },
    { label:'Case Study', kind:'path', value:'/case-study' },
    { label:'Services', kind:'section', value:'services' },
    { label:'Pricing', kind:'section', value:'pricing' },
    { label:'FAQ', kind:'path', value:'/faq' },
    { label:'Live Studio', kind:'section', value:'generator' },
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
    ['Case Study', '/case-study'],
    ['FAQ', '/faq'],
    ['Privacy', '/privacy'],
    ['Terms', '/terms'],
];
const LIVE_NOW_FEATURES = [
    'Client-guided brief capture',
    'Generated plan plus 4K blueprint export',
    'Gemini-powered exterior study',
];
const HERO_SIGNAL_CARDS = [
    {
        label: 'Live today',
        value: 'Client brief -> plan -> export',
        note: 'The firm shares a link, and Keystone returns something useful before the meeting.',
    },
    {
        label: 'Best fit',
        value: 'Residential architecture firms',
        note: 'Built for B2B studios that want stronger first meetings and less unpaid drift.',
    },
    {
        label: 'Commercial model',
        value: 'Firm-led rollout',
        note: 'Start with one active lead, then expand the workflow across the studio.',
    },
];
const SAMPLE_SESSION_STEPS = [
    {
        number: '01',
        title: 'Firm shares the link',
        body: 'The studio sends a guided intake link and passkey before the first meeting so the client can do the early thinking in structure.',
    },
    {
        number: '02',
        title: 'Client brief captured',
        body: 'Room count, area target, light priorities, and lot cues arrive in a format the architect can review later instead of re-extracting live.',
    },
    {
        number: '03',
        title: 'Plan generated and saved',
        body: 'Keystone scores multiple footprint options, keeps the strongest one, and gives the firm a clean blueprint export before kickoff.',
    },
    {
        number: '04',
        title: 'Meeting starts ahead',
        body: 'If the studio wants it, the same brief also becomes a Gemini study so the client reacts to mood while the architect reacts to plan.',
    },
];
const GENERATOR_FLOW_STEPS = [
    { label: 'Unlock', body: 'Open the same passkey-based workflow a firm can share with its clients.' },
    { label: 'Answer', body: 'Move through the guided intake a client would complete before the first architect meeting.' },
    { label: 'Compare', body: 'Review the strongest plan and alternatives the architect would see before kickoff.' },
    { label: 'Export', body: 'Download the blueprint and optionally create a Gemini exterior study from the same brief.' },
];
const GENERATOR_UNLOCK_PREVIEW = [
    { label: 'Structured brief', body: 'The firm can review exactly what the client entered before anyone sits down together.' },
    { label: 'Plan export', body: 'A scored floor plan can be saved immediately as a clean blueprint image for the meeting.' },
    { label: 'Optional study', body: 'The same brief can create a Gemini exterior image when the studio wants an emotional anchor too.' },
];
const LIVE_STUDIO_PREVIEW = [
    {
        label: 'Firm-ready blueprint',
        title: 'The architect gets something concrete before kickoff.',
        body: 'A scored plan gives the studio a real layout to critique instead of relying on raw intake notes.',
        image: ASSETS.exampleBlueprint,
        alt: 'Keystone generated blueprint preview',
    },
    {
        label: 'Client-facing visual anchor',
        title: 'Mood can be added without losing the plan.',
        body: 'The paired exterior study gives the client something emotional to respond to while the architect stays spatially grounded.',
        image: ASSETS.exampleRender,
        alt: 'Keystone exterior study preview',
    },
];
const SERVICE_BENEFITS = [
    {
        eyebrow: 'Before the meeting',
        title: 'The architect opens with clearer intent.',
        body: 'The client has already described rooms, goals, light, and taste in a format the studio can actually use.',
    },
    {
        eyebrow: 'Protect studio time',
        title: 'Unpaid discovery hours stop leaking into fog.',
        body: 'Keystone is designed to keep early qualification from becoming free-form consulting before the relationship is real.',
    },
    {
        eyebrow: 'Clear next step',
        title: 'Both sides leave with a real artifact.',
        body: 'A saved plan export and optional visual study give the architect and the client something specific to continue from.',
    },
];
const navHref = (item, home = false) => item.kind === 'section' ? (home ? `#${item.value}` : homeSectionHref(item.value)) : item.value;

const SiteFooter = ({ home = false }) => (
    <footer style={{background:'var(--night)',padding:'3.75rem 0',borderTop:'1px solid rgba(255,106,55,0.18)'}}>
        <div className="site-shell">
            <div className="grid md:grid-cols-[1.15fr_0.9fr_0.9fr_1fr] gap-8 items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <SmartImage src={ASSETS.icon} alt="Keystone" eager style={{width:'30px',height:'30px',filter:'brightness(0) invert(1)'}}/>
                        <div>
                            <span className="cg text-[1.1rem] uppercase tracking-[-0.05em] text-white">Keystone AI</span>
                            <p className="mono text-[10px] uppercase tracking-[0.22em] mt-1 nav-subtitle-orange">Architect-first discovery</p>
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed mt-4" style={{color:'rgba(244,239,230,0.58)'}}>
                        Keystone lets residential firms send a guided client link before kickoff, then walk into the meeting with a structured brief, a generated plan, and a downloadable blueprint already in hand.
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
                <span>Copyright 2026 {BRAND_NAME}</span>
                <span>Legal pages last updated {LEGAL_UPDATED_AT}</span>
            </div>
        </div>
    </footer>
);

const PageNav = ({ onOpenModal }) => (
    <nav className="fixed top-0 w-full z-40 h-[64px] flex items-center justify-between px-5 md:px-10"
        style={{background:'rgba(245,240,233,0.84)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',borderBottom:'1px solid rgba(9,9,9,0.08)'}}>
        <a href="/" className="flex items-center gap-3">
            <SmartImage src={ASSETS.icon} alt="Keystone" eager style={{width:'30px',height:'30px'}}/>
            <div>
                <span className="cg text-[1.2rem] leading-none uppercase tracking-[-0.05em]" style={{color:'var(--ink)'}}>Keystone</span>
                <div className="mono text-[8px] uppercase tracking-[0.22em] mt-1" style={{color:'rgba(9,9,9,0.42)'}}>AI studio</div>
            </div>
        </a>
        <div className="hidden md:flex items-center gap-7 mono text-[11px] uppercase tracking-[0.24em]" style={{color:'rgba(9,9,9,0.54)'}}>
            {[
                ['Home', '/'],
                ['Case Study', '/case-study'],
                ['FAQ', '/faq'],
                ['Privacy', '/privacy'],
                ['Terms', '/terms'],
                ['Live Studio', '/#generator'],
            ].map(([label, href]) => (
                <a key={href} href={href} className="transition-colors hover:text-black">{label}</a>
            ))}
            <button onClick={onOpenModal} className="cta-hero cta-glow-soft px-5 py-3 text-[11px]">
                Request Access
            </button>
        </div>
        <div className="md:hidden flex items-center gap-2">
            <a href="/#generator" className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(9,9,9,0.56)'}}>Live Studio</a>
            <button onClick={onOpenModal} className="cta-hero cta-glow-soft px-4 py-2 text-[10px]">Request Access</button>
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

    useEffect(() => {
        const handler = () => setStudioOpen(true);
        const escHandler = (e) => { if (e.key === 'Escape') setStudioOpen(false); };
        document.addEventListener('keystone:open-studio', handler);
        document.addEventListener('keydown', escHandler);
        return () => {
            document.removeEventListener('keystone:open-studio', handler);
            document.removeEventListener('keydown', escHandler);
        };
    }, []);

    useEffect(() => {
        if (isStudioOpen) document.body.classList.add('studio-open');
        else document.body.classList.remove('studio-open');
        return () => document.body.classList.remove('studio-open');
    }, [isStudioOpen]);

    const featuredWorks = [
        {
            eyebrow: 'Generated floor plan',
            title: 'A plan the architect can react to before kickoff.',
            body: 'Room count, circulation intent, and footprint goals become a real plan instead of a vague transcript taken in the room.',
            image: ASSETS.exampleBlueprint,
            alt: 'Keystone generated floor plan',
        },
        {
            eyebrow: 'Gemini exterior study',
            title: 'An atmosphere the client can actually feel.',
            body: 'The same brief can produce a visual anchor that helps the client respond emotionally while the architect stays tied to the plan.',
            image: ASSETS.exampleRender,
            alt: 'Keystone Gemini exterior study',
        },
        {
            eyebrow: 'Guided intake',
            title: 'A client link that does real pre-meeting work.',
            body: 'Light, taste, room priorities, and lot context arrive in a structure the firm can review before the first conversation starts.',
            image: ASSETS.phase3[4],
            alt: 'Keystone client experience preview',
        },
    ];
    const trustCards = [
        {
            eyebrow: 'Firm workflow',
            title: 'Sold to the studio, used by the client.',
            body: 'The firm shares the link and passkey, the client completes the guided brief, and the architect reviews the output before the meeting.',
        },
        {
            eyebrow: 'Live today',
            title: 'Plan generation, export, and Gemini study.',
            body: 'Keystone currently covers guided intake, floor plan generation, high-resolution PNG export, and Gemini exterior study generation from the same brief.',
        },
        {
            eyebrow: 'Coming next',
            title: 'CAD/DWG and estimate layers are on the roadmap.',
            body: 'DWG or CAD export, quantity takeoff, and early cost-estimate features are planned next, but they are not being sold as live today.',
        },
    ];
    const outcomeCards = [
        {
            eyebrow: 'Before the meeting',
            title: 'A more prepared client arrives.',
            body: 'Taste, light, priorities, and rough footprint intent are already translated into something your team can react to together.',
            stat: '1 link',
        },
        {
            eyebrow: 'Inside the studio',
            title: 'The blank page disappears.',
            body: 'Instead of starting from raw notes, your team begins with a structured brief, a plan, and an optional visual anchor worth discussing.',
            stat: '<60s',
        },
        {
            eyebrow: 'Across the pipeline',
            title: 'Early hours stay protected.',
            body: 'Keystone helps firms qualify seriousness faster, save unpaid exploration time, and move active leads into real design momentum.',
            stat: 'B2B',
        },
    ];
    const marqueeItems = [
        'Architect-first discovery',
        'Live floor plan generation',
        '4K PNG blueprint download',
        'Gemini exterior studies',
        'Pay-as-you-go for firms',
        'Client-ready visual anchors',
    ];
    const serviceCards = [
        {
            number: '01',
            title: 'Firm sends the link',
            body: 'The architect shares a guided link and passkey before kickoff so the client can complete the early thinking asynchronously.',
        },
        {
            number: '02',
            title: 'Client brief becomes a plan',
            body: 'That intake becomes a first residential layout your team can review, export, and use as the basis for the real conversation.',
        },
        {
            number: '03',
            title: 'Architect walks in prepared',
            body: 'Before the meeting starts, the firm can already review the brief, save the plan, and optionally add a Gemini study for emotional context.',
        },
    ];
    const studioMetrics = [
        { value: '<60s', label: 'first floor plan' },
        { value: '4K PNG', label: 'download ready' },
        { value: 'Gemini', label: '3D exterior study' },
        { value: '1 brief', label: 'becomes 2 outputs' },
    ];
    const sessionStack = [
        'Client-facing intake link',
        'Passkey-controlled access',
        'Scored footprint alternatives',
        'Blueprint PNG export',
        'Firm-visible session history',
        'Gemini exterior study',
        'Recent-session gallery proof',
    ];
    const studioTeam = [
        {
            name: 'Sujan Acharya',
            role: 'Founder and CEO',
            image: ASSETS.team.sujan,
            bio: 'Civil engineering and construction management background. Built Keystone after watching firms lose weekends to unpaid discovery work.',
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
            bio: 'Financial operator focused on keeping Keystone rigorous, durable, and built for steady studio adoption.',
        },
    ];
    const roadmapCards = [
        'DWG/CAD export for downstream drafting',
        'Quantity takeoff support',
        'Early cost estimate ranges',
        'White-label studio branding',
        'CRM handoff for qualified leads',
    ];
    const quoteCards = [
        {
            quote: 'The best use case is a firm that wants to send one link before the first serious meeting and walk in with something concrete already on screen.',
            name: 'Workflow fit',
            firm: 'B2B motion',
        },
        {
            quote: 'The current promise stays narrow on purpose: guided intake, generated plan, PNG export, and Gemini study. CAD and estimating come next, but only when they are real.',
            name: 'Scope discipline',
            firm: 'Product truth',
        },
    ];
    const pricingTiers = [
        {
            tag: 'Guided demo',
            price: '$0',
            unit: 'for qualified firms',
            desc: 'A guided walkthrough of the firm workflow so your team can see the client link, plan generation, export path, and Gemini study together.',
            cta: 'Request Access',
            featured: false,
        },
        {
            tag: 'Single session',
            price: '$149',
            unit: 'per live run',
            desc: 'A complete Keystone session for one active lead, from client brief capture through architect-ready plan export and optional Gemini study.',
            cta: 'Open Live Studio',
            featured: true,
        },
        {
            tag: 'Studio pack',
            price: '$1,199',
            unit: '10 sessions',
            desc: 'For firms that want Keystone to become a repeatable pre-meeting rhythm across multiple active residential leads.',
            cta: 'Request Access',
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
                    {/* ─── NAV ─────────────────────────────────────────── */}
                    <motion.nav
                        initial={{ opacity: 0, y: -64 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                        className="fixed top-0 w-full z-40 h-[64px] flex items-center justify-between px-5 md:px-10"
                        style={{background:'rgba(255,253,249,0.92)',backdropFilter:'blur(22px)',WebkitBackdropFilter:'blur(22px)',borderBottom:'1px solid rgba(255,106,55,0.1)'}}>
                        <a href="#hero" className="flex items-center gap-3">
                            <SmartImage src={ASSETS.icon} alt="Keystone" eager style={{width:'30px',height:'30px'}}/>
                            <div>
                                <span className="cg text-[1.2rem] leading-none uppercase tracking-[-0.05em]" style={{color:'var(--ink)'}}>Keystone</span>
                                <div className="mono text-[8px] uppercase tracking-[0.22em] mt-0.5 nav-subtitle-orange">AI studio</div>
                            </div>
                        </a>
                        <div className="hidden md:flex items-center gap-8 mono text-[11px] uppercase tracking-[0.26em]" style={{color:'rgba(9,9,9,0.52)'}}>
                            {HOME_NAV_ITEMS.map((item) => (
                                <a key={item.label} href={navHref(item, true)} className="transition-colors hover:text-black">{item.label}</a>
                            ))}
                            <button onClick={() => setModalOpen(true)} className="cta-hero cta-glow px-5 py-3 text-[11px]">
                                Request Access
                            </button>
                        </div>
                    </motion.nav>

                        {/* ─── HERO ──────────────────────────────────────── */}
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
                                                Architect-first discovery
                                            </span>
                                        </motion.div>

                                        <motion.h1 initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.18}}
                                            className="cg leading-[0.84]"
                                            style={{fontSize:'clamp(3.2rem,7.4vw,6.8rem)',letterSpacing:'-0.065em',textTransform:'uppercase',color:'var(--ink)'}}>
                                            <span className="block">Build the</span>
                                            <span className="block">
                                                <BlurText text="feeling of home" delay={55} direction="bottom" tag="span"
                                                    className="serif hero-accent-word" style={{ color: '#FF7040' }}/>
                                            </span>
                                            <span className="block" style={{color:'rgba(78,69,61,0.78)'}}>before the meeting.</span>
                                        </motion.h1>

                                        <motion.p initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.48}}
                                            className="mt-6 max-w-[46rem] leading-relaxed"
                                            style={{fontSize:'clamp(1rem,1.8vw,1.12rem)',color:'rgba(32,26,21,0.68)'}}>
                                            Keystone helps residential firms send a guided client link before kickoff, then open the first design conversation with a structured brief, a generated floor plan, and an optional Gemini study.
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
                                            <button onClick={() => setModalOpen(true)} data-cursor-text="Request access" className="cta-hero cta-glow-soft">
                                                Request Access
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
                                            A first pass that already feels worth discussing.
                                        </h2>
                                        <p className="mt-3 text-sm leading-relaxed" style={{color:'rgba(244,239,230,0.6)'}}>
                                            Clients arrive with something they can point to. Your team arrives with something they can shape.
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
                                            <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(244,239,230,0.46)'}}>Proof before pitch</p>
                                            <a href="/case-study" data-cursor-text="Open case study" className="inline-block mt-3 text-sm transition-colors hover:text-orange-300" style={{color:'rgba(255,255,255,0.88)'}}>
                                                View the representative case study →
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
                                            The fastest way to trust Keystone is to watch the whole firm workflow happen in sequence: client brief, generated plan, export-ready blueprint, and optional Gemini study before the first architect meeting.
                                        </p>
                                        <div className="mt-6 flex flex-wrap gap-3">
                                            <StarBorderBtn onClick={() => scrollTo('generator')}>
                                                <span>Open Live Studio</span>
                                                <span className="cta-live-mark"><span className="cta-live-dot"/>Now</span>
                                            </StarBorderBtn>
                                            <a href="/case-study" data-cursor-text="Open case study" className="cta-secondary">View Case Study</a>
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
                                                <span className="mono text-[8px] ml-3" style={{color:'rgba(255,255,255,0.32)',letterSpacing:'0.16em'}}>KEYSTONE AI / 3D EXTERIOR STUDY</span>
                                            </div>
                                            <div className="proof-browser-screen" style={{minHeight:'100%'}}>
                                                <SmartImage src={ASSETS.exampleRender} alt="Keystone sample exterior study" style={{width:'100%',height:'100%',minHeight:'320px',objectFit:'cover',display:'block'}}/>
                                                <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg, rgba(9,9,9,0.02) 0%, rgba(9,9,9,0.48) 100%)'}}/>
                                                <div className="proof-caption" style={{position:'absolute',left:0,right:0,bottom:0,borderTop:'none',color:'rgba(255,255,255,0.72)',background:'linear-gradient(180deg, transparent, rgba(9,9,9,0.58))'}}>
                                                    <span className="proof-dot" style={{background:'var(--accent)'}}/>
                                                    The same brief, now felt as atmosphere
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
                                                    The same client-to-studio logic behind the hero is right below. Open the live studio, walk through the guided intake, shape a plan, and see what the architect gets back before kickoff.
                                                </p>
                                            </div>
                                            <div className="flex justify-start lg:justify-end">
                                                <StarBorderBtn onClick={() => scrollTo('generator')}>
                                                    <span>Open Live Studio</span>
                                                    <span className="cta-live-mark">
                                                        <span className="cta-live-dot"/>
                                                        Try it now
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
                    <AnimatePresence>
                        {isStudioOpen && (
                            <motion.div key="studio-modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                                transition={{duration:0.18}} className="studio-modal-overlay">
                                <motion.div initial={{y:32,opacity:0}} animate={{y:0,opacity:1}} exit={{y:16,opacity:0}}
                                    transition={{duration:0.22,ease:[0.22,1,0.36,1]}} className="studio-modal-window">
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
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
                                    Keystone works when the client, the architect, and the next decision all feel less vague. These are the business-level shifts the workflow is built to create for firms.
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

                    <section id="services" className="defer-section py-14 md:py-[4.75rem] relative overflow-hidden" style={{background:'linear-gradient(180deg, #ECE3D3 0%, #F7F2E9 60%, #F0EBE1 100%)',color:'var(--ink)'}}>
                        <OrbBackground/>
                        <div className="site-shell relative z-10">
                            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-12 items-end">
                                <div>
                                    <Reveal y={12}>
                                        <span className="section-label" style={{color:'rgba(10,10,12,0.45)'}}>Firm workflow</span>
                                        <div className="orange-line mt-3"/>
                                    </Reveal>
                                    <Reveal y={32} delay={0.08}>
                                    <h2 className="cg mt-6" style={{fontSize:'clamp(2.8rem, 7vw, 5.4rem)',lineHeight:0.9,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                        A <GradientText>calmer way</GradientText> to move from first inquiry to architect-ready intent.
                                    </h2>
                                    </Reveal>
                                </div>
                                <Reveal y={16} delay={0.18}>
                                <p className="text-sm md:text-base leading-relaxed text-mid">
                                    Keystone is not trying to replace architectural judgment. It gives firms a better handoff from client curiosity to the first serious design conversation.
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
                                    <h3 className="cg mt-5 text-[2.1rem] leading-[0.95]">The studio stack clients never see, but your team will feel.</h3>
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
                                    <GradientText>Clear pricing</GradientText> before your team commits the hours.
                                </h2>
                                </Reveal>
                                <Reveal y={16} delay={0.18}>
                                <p className="mt-5 text-base leading-relaxed" style={{color:'var(--mid)'}}>
                                    Start with a guided demo, try one live client session, or turn Keystone into a repeatable pre-meeting rhythm without a dead-month subscription.
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
                                                            className={`cta-hero w-full mt-6 min-h-[58px] flex items-center justify-center ${tier.tag === 'Guided demo' ? 'cta-glow-soft' : ''}`}>
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
                                            Keystone began from a simple frustration: talented architects were burning unpaid hours trying to pull clarity out of clients who had not yet learned how to describe what they wanted.
                                        </p>
                                        <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{color:'rgba(244,239,230,0.72)'}}>
                                            The product is designed to let the client do some of that thinking before the meeting so the architect can spend the kickoff shaping ideas instead of extracting basics.
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
                                    If the goal is to help residential clients arrive better prepared while protecting your studio's time, Keystone is ready for a real conversation.
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
                                        Request Access
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

const CaseStudyPage = () => {
    const caseFacts = [
        ['Project type', 'Representative family-home intake'],
        ['Firm workflow', 'Client completes guided link before kickoff'],
        ['Area target', '2,640 sq ft'],
        ['Architect handoff', 'Structured brief + plan export'],
    ];
    const intakeSignals = [
        'Client completed the brief through a firm-issued pre-meeting link',
        'Four-bedroom layout with one quiet home office',
        'Warm modern exterior with wood, stone, and soft daylight',
        'Open kitchen / living core with a cleaner circulation path',
    ];
    const processSteps = [
        {
            step: '01',
            title: 'Firm sends the link',
            body: 'The studio shares a guided intake link before kickoff so the client can describe needs, priorities, and taste before the architect meeting begins.',
        },
        {
            step: '02',
            title: 'Client brief is structured',
            body: 'The intake captures room count, lot context, circulation intent, and stylistic cues before the architect spends an unpaid hour pulling it out in conversation.',
        },
        {
            step: '03',
            title: 'Plan is generated and saved',
            body: 'Keystone turns that brief into a first residential layout and a clean PNG export the team can save, review, and annotate before kickoff.',
        },
        {
            step: '04',
            title: 'Meeting starts ahead',
            body: 'A Gemini exterior image can add emotional context, but the real gain is that the architect begins with a plan, not a blank page.',
        },
    ];

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
                                    <span className="section-label">Representative case study</span>
                                    <h1 className="cg mt-6" style={{fontSize:'clamp(3rem, 7vw, 6rem)',lineHeight:0.9,letterSpacing:'-0.06em',textTransform:'uppercase',color:'var(--ink)'}}>
                                        A firm-sent client brief, turned into a first plan the kickoff meeting can actually use.
                                    </h1>
                                    <p className="mt-6 max-w-3xl text-base md:text-lg leading-relaxed" style={{color:'rgba(32,26,21,0.72)'}}>
                                        This sample is intentionally labeled as a representative session. It shows the B2B workflow Keystone is built for: a firm sends a guided client link, the client completes the brief, and the architect receives a generated plan, downloadable blueprint export, and optional Gemini-powered exterior study before the meeting.
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
                                        <button onClick={openModal} className="cta-hero cta-glow-soft">Request Access</button>
                                    </div>
                                </div>
                                <aside className="dream-panel p-6 md:p-7 overflow-hidden relative">
                                    <span className="section-label" style={{color:'rgba(245,240,233,0.58)'}}>What went in</span>
                                    <h2 className="cg text-white mt-5" style={{fontSize:'clamp(1.8rem,3vw,2.6rem)',lineHeight:0.92,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                        Enough specificity to help the architect before the meeting, not just during it.
                                    </h2>
                                    <div className="grid gap-3 mt-6">
                                        {intakeSignals.map((item) => (
                                            <div key={item} className="flex items-start gap-3 text-sm leading-relaxed" style={{color:'rgba(244,239,230,0.66)'}}>
                                                <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{background:'var(--accent)'}}/>
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 pt-5 border-t border-white/10">
                                        <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{color:'rgba(244,239,230,0.46)'}}>Outcome</p>
                                        <p className="text-sm leading-relaxed mt-3" style={{color:'rgba(244,239,230,0.7)'}}>
                                            The architect starts with a plan that can be critiqued and an image that can be felt. The client stops reacting to abstractions and starts reacting to something real.
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
                                            Keystone turns the intake into a working plan the team can save and discuss.
                                        </div>
                                    </div>
                                    <div className="proof-browser">
                                        <div className="proof-browser-top">
                                            <div className="bc-dot" style={{background:'#FF5F57'}}/>
                                            <div className="bc-dot" style={{background:'#FFBD2E'}}/>
                                            <div className="bc-dot" style={{background:'#28C840'}}/>
                                            <span className="mono text-[8px] ml-3" style={{color:'rgba(255,255,255,0.32)',letterSpacing:'0.16em'}}>SAMPLE SESSION / GEMINI EXTERIOR STUDY</span>
                                        </div>
                                        <div className="proof-browser-screen render">
                                            <SmartImage src={ASSETS.exampleRender} alt="Sample Gemini exterior study" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                                        </div>
                                        <div className="proof-caption">
                                            <span className="proof-dot" style={{background:'var(--accent)'}}/>
                                            The paired Gemini study gives the client a mood to react to during the same early conversation.
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
                                    <span className="section-label" style={{color:'rgba(10,10,12,0.42)'}}>Why it matters</span>
                                    <h2 className="cg mt-6" style={{fontSize:'clamp(2.4rem, 5vw, 4.3rem)',lineHeight:0.92,letterSpacing:'-0.05em',textTransform:'uppercase'}}>
                                        The value is not more content. It is a better first conversation for the firm and the client.
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
                </>
            )}
        </SubpageChrome>
    );
};

const FAQPage = () => {
    const faqItems = [
        {
            question: 'What is live in Keystone right now?',
            answer: 'The live workflow today includes guided brief capture, floor plan generation, high-resolution plan download, and Gemini-powered exterior study generation from the same project brief.',
        },
        {
            question: 'Who is Keystone actually sold to?',
            answer: 'Keystone is a B2B product for residential architecture and design-led firms. The firm adopts it, then shares the guided workflow with clients before the first serious meeting.',
        },
        {
            question: 'Can a firm send Keystone to a client before the first meeting?',
            answer: 'Yes. That is the core workflow. The firm shares the link and access code, the client completes the guided brief, and the architect reviews the results before kickoff.',
        },
        {
            question: 'What does the architect receive before the meeting?',
            answer: 'The firm can review the completed brief, the generated floor plan, the downloadable blueprint image, and the Gemini exterior study if one was generated for that session.',
        },
        {
            question: 'Does Keystone replace the architect?',
            answer: 'No. Keystone is an early discovery tool. It helps generate an initial plan and visual anchor, but design judgment still belongs to the architect and project team.',
        },
        {
            question: 'Are these outputs construction documents?',
            answer: 'No. Keystone outputs are concept aids only. They are not permit-ready drawings, stamped documents, engineering deliverables, or final construction instructions.',
        },
        {
            question: 'Are CAD files, quantity takeoff, or cost estimates live today?',
            answer: 'Not yet. Today the live workflow centers on guided intake, plan generation, PNG export, and Gemini study generation. DWG or CAD export plus quantity and cost-estimate layers are planned next, but they are not being marketed as live today.',
        },
        {
            question: 'Why is access private right now?',
            answer: 'Keystone is still being introduced through guided access so the workflow, onboarding, and firm fit stay strong while the product is maturing.',
        },
        {
            question: 'How long does it take?',
            answer: 'The first floor plan is designed to arrive quickly, often in under a minute. Gemini exterior studies take longer, but still fit inside an early-stage pre-meeting session.',
        },
        {
            question: 'How should I think about data and privacy?',
            answer: 'Project inputs and generated outputs are used to operate the service, support firm access, and improve product quality. The current privacy page explains the starter policy in more detail.',
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
                                        Questions serious firms ask before they open Keystone.
                                    </h1>
                                    <p className="mt-6 max-w-3xl text-base md:text-lg leading-relaxed" style={{color:'rgba(32,26,21,0.72)'}}>
                                        These answers stay anchored to what is actually live right now, how firms use the workflow, and what is still on the roadmap.
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
                                            <a href="/case-study" className="cta-secondary text-center">View Case Study</a>
                                            <button onClick={openModal} className="cta-hero cta-glow-soft">Request Access</button>
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
                                    <button onClick={openModal} className="cta-hero cta-glow-soft">Request Access</button>
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
                'We may collect contact details you send through access forms, firm details, client or project brief information submitted through the product, and the outputs generated from those inputs.',
                'We may also collect limited technical data such as basic usage logs, browser information, and service diagnostics needed to keep the product working.',
            ],
        },
        {
            title: 'How the information is used',
            body: [
                'We use information to operate Keystone, respond to access requests, let firms review submitted briefs and outputs, improve output quality, maintain security, and understand whether the product is reliable for firms using it.',
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
                'You may also contact us to ask questions about access, stored contact details, client-submitted project data, or deletion requests.',
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
                'Keystone is a B2B design-assist product for early residential discovery. It helps firms collect client inputs, generate conceptual floor plans, create downloadable images, and produce Gemini-powered exterior studies from project briefs.',
                'The service is offered on an early-stage basis and may evolve, change, pause, or improve over time.',
            ],
        },
        {
            title: 'Professional responsibility',
            body: [
                'Keystone does not replace licensed design professionals. All outputs must be reviewed, interpreted, and validated by qualified professionals before they are used in any meaningful project context.',
                'You are responsible for how you use outputs inside your own practice or process.',
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
                'If Keystone access is private or code-based, you are responsible for safeguarding that access, sharing it only as intended, and handling client access responsibly inside your own firm workflow.',
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
    if (path === '/case-study') return <CaseStudyPage/>;
    if (path === '/faq') return <FAQPage/>;
    if (path === '/privacy') return <PrivacyPage/>;
    if (path === '/terms') return <TermsPage/>;
    return <DreamApp/>;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppRouter/>);
