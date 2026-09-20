import { ASSETS } from './assets.js';

export const REFINEMENT_SUGGESTIONS = [
    "Make the living room 4 feet wider",
    "Make the primary bedroom bigger",
    "Expand the kitchen",
    "Make the master bathroom larger",
    "Widen the hallways",
    "Make the garage wider",
    "Expand the dining room",
];

export const RENDER_REFINEMENTS = [
    { label: 'Golden Hour',  hint: 'warm late-afternoon sunlight, long shadows, golden orange sky. Only change the lighting and sky; keep the house architecture identical.' },
    { label: 'Overcast Day', hint: 'soft diffuse overcast lighting, muted tones, grey cloud-covered sky. Only change the lighting and sky; keep the house architecture identical.' },
    { label: 'Night Lit',    hint: 'night scene with interior lights glowing warmly through windows, landscape uplighting, and a deep blue sky. Only change the lighting and sky; keep the house architecture identical.' },
    { label: 'Sunrise',      hint: 'sunrise with a pink-orange gradient sky and long warm shadows across the facade. Only change the lighting and sky; keep the house architecture identical.' },
];

// Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬ APP Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬Ã¢"â‚¬
export const HOME_NAV_ITEMS = [
    { label:'Platform', kind:'section', value:'work' },
    { label:'How It Works', kind:'path', value:'/how-floor-plans-work' },
    { label:'Roadmap', kind:'path', value:'/roadmap' },
    { label:'Guided Workflow', kind:'path', value:'/b2b-workflow' },
    { label:'FAQ', kind:'path', value:'/faq' },
];

export const RESOURCE_PAGE_LINKS = [
    ['How Floor Plans Work', '/how-floor-plans-work'],
    ['Guided Workflow', '/b2b-workflow'],
    ['Roadmap', '/roadmap'],
    ['Pricing', '/pricing'],
    ['FAQ', '/faq'],
    ['Privacy', '/privacy'],
    ['Terms', '/terms'],
];

export const PLATFORM_PAGE_CARDS = [
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

export const LIVE_NOW_FEATURES = [
    'Guided brief in plain language',
    'Generated floor plan + blueprint image',
    'Elevation views',
    'Cost Estimate workbook',
    'CAD Export (DXF)',
    'Exterior Render',
];

export const HERO_SIGNAL_CARDS = [
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

export const SAMPLE_SESSION_STEPS = [
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

export const GENERATOR_FLOW_STEPS = [
    { label: 'Answer', body: 'Move through the guided intake in plain language.' },
    { label: 'Compare', body: 'Review the strongest plan and alternatives side by side.' },
    { label: 'Export', body: 'Download the blueprint and elevation sheet immediately.' },
    { label: 'Unlock', body: 'Use a passkey later for renders, refinements, the Cost Estimate workbook, and CAD export.' },
];

export const GENERATOR_UNLOCK_PREVIEW = [
    { label: 'Free', body: 'Generate the floor plan and elevation set without needing a passkey.' },
    { label: 'Unlocked', body: 'Add refinements, Exterior Render, Cost Estimate, and CAD export after you request trial access.' },
    { label: 'Made for people', body: 'You do not need a technical background to describe the house you want.' },
];

export const LIVE_STUDIO_PREVIEW = [
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

export const SERVICE_BENEFITS = [
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

/* Shared chrome. Before Phase 5 the homepage and the subpages shipped two
   different navs, and the footer was styled with light-mode tokens on a
   near-black ground - the contact email rendered at 1.04:1. */

export const SITE_NAV_LINKS = [
    ['How it works', '/how-floor-plans-work'],
    ['Pricing', '/pricing'],
    ['Guided workflow', '/b2b-workflow'],
    ['Roadmap', '/roadmap'],
    ['FAQ', '/faq'],
];

// On the homepage the studio is a mounted modal, so onStartPlan opens it
// directly. Elsewhere it is not mounted, so we navigate to /#generator,
// which the homepage's existing hash effect picks up on arrival.

export const HOME_VIEWS = [
    { key: 'plan', label: 'Floor plan', ratio: 2.37, src: ASSETS.renderedPlan, alt: 'Generated floor plan for both levels, with materials, furniture and dimensions' },
    { key: 'elevations', label: 'Elevations', ratio: 1.25, src: ASSETS.renderedElevations, alt: 'Front, rear, left and right elevations for the same plan' },
    { key: 'exterior', label: 'Exterior', ratio: 1.5, src: ASSETS.exampleRender, alt: 'Photorealistic exterior render of the same house' },
];
