import { STUDIO_SESSION_KEY } from '../data/brand.js';

export const createEmptyRenderState = () => ({
    status: 'idle',
    image: null,
    imageClean: null,
    surveyData: null,
    activeRefinement: null,
    errorMsg: '',
});

export const normalizeRenderState = (state) => {
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

export const getStoredJson = (key) => {
    if (typeof window === 'undefined') return null;
    try {
        return JSON.parse(window.localStorage.getItem(key) || 'null');
    } catch {
        return null;
    }
};

export const getInitialStudioSession = () => {
    const stored = getStoredJson(STUDIO_SESSION_KEY);
    if (!stored || typeof stored !== 'object') return null;
    if (stored.version !== 1) return null;
    return stored;
};
