import React, { useState } from 'react';
import { FINISH_OVERRIDE_OPTIONS, STYLE_FINISH_DEFAULTS, SURVEY_STEPS } from '../data/survey.js';
import { CheckIcon } from '../ui/icons.jsx';

export const SurveyForm = ({ formData, setFormData, onSubmit, isLoading, onReset }) => {
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
            // The survey only ever renders inside the dark studio, where
            // --ink is remapped to near-white. The old selected state was a
            // gradient ending at var(--ink) with white text on top, which
            // became white-on-white: "3" measured 2.03:1 and "2 Stories"
            // 3.70:1. A filled accent chip with near-black type is 7.4:1 and
            // reads as chosen at a glance.
            return {
                borderColor: 'var(--d-accent)',
                background: 'var(--d-accent)',
                color: '#1A0D06',
                fontWeight: 700,
                boxShadow: '0 6px 18px -6px rgba(255,122,69,0.55)',
            };
        }
        // Surface token, not hardcoded white: the same chip has to work on the
        // light page and inside the dark studio, where var(--ink) is light.
        return {
            borderColor: 'var(--control-edge)',
            background: 'var(--chip-bg)',
            color: 'var(--ink)',
            boxShadow: 'none',
        };
    };
    const actionStyle = (tone = 'blue') => ({
        borderColor: tone === 'blue' ? 'var(--accent)' : 'var(--ink)',
        background: tone === 'blue'
            ? 'linear-gradient(180deg, var(--accent) 0%, rgba(20,61,100,1) 100%)'
            : 'linear-gradient(180deg, rgba(24,24,24,1) 0%, var(--ink) 100%)',
        color: 'rgba(255,252,248,0.98)',
        boxShadow: tone === 'blue'
            ? '0 14px 30px var(--accent)'
            : '0 14px 30px var(--ink-soft)',
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
                        className="py-3 px-3 border text-left rounded-xs transition-all"
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
                className="flex items-center gap-1.5 px-3 py-2 border rounded-xs transition-all text-[10px] font-semibold"
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
                className="p-3 border rounded-xs transition-all flex flex-col items-center gap-2"
                style={choiceStyle(sel)}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'36px'}}>
                    <div style={{
                        width: `${fw * 28}px`, height: `${fh * 28}px`,
                        border: `2px solid ${sel ? 'rgba(255,255,255,0.7)' : 'var(--blue)'}`,
                        background: sel ? 'rgba(255,255,255,0.08)' : 'var(--accent)',
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
                className={`p-2 border rounded-xs transition-all flex flex-col items-center gap-1.5 ${sel ? 'border-blue' : 'border-black/10 bg-white hover:border-blue'}`}
                style={{background: sel ? 'var(--accent)' : 'white'}}>
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
                    <div className="flex gap-2">{[1,2,3,4,5].map(n=>{ const selected = formData.bedrooms===`${n} Bed`; return <button key={n} type="button" aria-pressed={selected} onClick={()=>upd('bedrooms',`${n} Bed`)} className="flex-1 h-11 border text-sm font-bold rounded-xs transition-all" style={choiceStyle(selected)}>{n}</button>; })}</div>
                </div>
            );
            case 'bathrooms': return (
                <div key={field} className="space-y-1.5">
                    <Lbl>Full Bathrooms</Lbl>
                    <div className="flex gap-2">{[1,2,3,4,5].map(n=>{ const selected = formData.bathrooms===`${n} Bath`; return <button key={n} type="button" aria-pressed={selected} onClick={()=>upd('bathrooms',`${n} Bath`)} className="flex-1 h-11 border text-sm font-bold rounded-xs transition-all" style={choiceStyle(selected)}>{n}</button>; })}</div>
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
                    <div key={field} className="space-y-3 p-3 bg-blue/4 border border-blue/15 rounded-xs">
                        <Lbl>Bedroom Configuration</Lbl>
                        <p className="text-[10px] text-mid mb-1">Set private bathroom and closet type for each bedroom.</p>
                        {bedLabels.map((label, idx) => {
                            const cfg = (formData.bedroomConfigs || configs)[idx] || { privateBath: idx === 0 ? 'Yes' : 'No', closet: idx === 0 ? 'Walk-in' : 'Standard' };
                            return (
                                <div key={idx} className="p-2.5 bg-white/60 border border-black/5 rounded-xs space-y-2">
                                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{color:'var(--blue)'}}>{label}</div>
                                    <div className="flex gap-3 items-center">
                                        <span className="text-[9px] font-medium text-mid w-16 shrink-0">En-Suite</span>
                                        <div className="flex gap-1.5 flex-1">
                                            {['Yes', 'No'].map(v => {
                                                const sel = cfg.privateBath === v;
                                                return <button key={v} type="button" aria-pressed={sel} onClick={() => { ensureConfigs(); updateConfig(idx, 'privateBath', v); }} className="flex-1 h-8 border text-[10px] font-bold rounded-xs" style={choiceStyle(sel, 'blue')}>{v}</button>;
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <span className="text-[9px] font-medium text-mid w-16 shrink-0">Closet</span>
                                        <div className="flex gap-1.5 flex-1">
                                            {['Walk-in', 'Standard'].map(v => {
                                                const sel = cfg.closet === v;
                                                return <button key={v} type="button" aria-pressed={sel} onClick={() => { ensureConfigs(); updateConfig(idx, 'closet', v); }} className="flex-1 h-8 border text-[10px] font-bold rounded-xs" style={choiceStyle(sel, 'blue')}>{v}</button>;
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
                                    style={{position:'absolute',left:x,top:y,width:w,height:h,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:sel?'1.5px solid #1B4F82':'1px solid rgba(100,100,100,0.14)',borderRadius:'4px',background:sel?'#1B4F82':'rgba(246,244,239,0.95)',color:sel?'#fff':'#0A0A0C',cursor:'pointer',zIndex:10,transition:'all 0.12s',boxShadow:sel?'0 2px 10px var(--accent)':'none'}}>
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
                    <details className="p-3 border border-black/10 rounded-xs bg-white/80">
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
                        <div className="mt-1 p-2 bg-blue/5 border border-blue/15 rounded-xs">
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
                    <p className="text-[11px] mt-1" style={{color:'var(--ink)'}}>{cur.subtitle}</p>
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
                {step > 0 && <button type="button" onClick={() => setStep(s=>s-1)} className="px-5 py-3 border border-black/10 text-[11px] font-semibold hover:border-ink transition-colors rounded-xs">Back</button>}
                {!isLast
                    ? <button type="button" onClick={() => setStep(s=>s+1)} className="flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors rounded-xs border" style={actionStyle('blue')}>Continue</button>
                    : <button type="button" onClick={onSubmit} disabled={isLoading} className="flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 rounded-xs border" style={actionStyle('ink')}>
                        {isLoading ? 'Generating...' : 'Generate Floor Plan'}
                      </button>
                }
            </div>
        </div>
    );
};
