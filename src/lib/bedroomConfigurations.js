// Materialize the choices the form displays when preparing a NEW generation.
// Do not retrofit these defaults onto an existing plan during refinement.
export function surveyWithBedroomConfigurations(formData) {
    const bedCount = Number.parseInt(formData.bedrooms, 10) || 3;
    const saved = Array.isArray(formData.bedroomConfigs) ? formData.bedroomConfigs : null;
    const aggregate = Number.parseInt(formData.privateBaths, 10);
    const defaultPrivateCount = Number.isFinite(aggregate) ? aggregate : 1;
    const bedroomConfigs = Array.from({ length: bedCount }, (_, index) => {
        const defaults = {
            privateBath: !saved && index < defaultPrivateCount ? 'Yes' : 'No',
            closet: index === 0 ? 'Walk-in' : 'Standard',
        };
        // An explicit primary No survives. Growing the household adds shared
        // bedrooms; shrinking it removes only the discarded bedroom entries.
        const config = { ...defaults, ...saved?.[index] };
        if (typeof config.privateBath === 'boolean') config.privateBath = config.privateBath ? 'Yes' : 'No';
        if (config.closet === 'walk_in') config.closet = 'Walk-in';
        if (config.closet === 'reach_in' || config.closet === 'Small') config.closet = 'Standard';
        return config;
    });
    // Preserve an impossible legacy aggregate for backend conflict reporting.
    const privateBaths = !saved && (defaultPrivateCount > bedCount || defaultPrivateCount < 0)
        ? formData.privateBaths : String(bedroomConfigs.filter(c => c.privateBath === 'Yes').length);
    return { ...formData, bedroomConfigs, privateBaths };
}
