(() => {
  const { useState, useEffect, useRef } = React;
  const FM = window.framerMotion || window.Motion;
  const { motion, AnimatePresence } = FM;
  const ASSETS = {
    watermark: "images/keystone-line-art.png",
    icon: "images/keystone-icon.svg",
    qrCode: "images/qualtrics-qr.png",
    team: { sujan: "images/sujan.png", subrat: "images/subrat.png", rhythm: "images/rhythm.png" },
    phase1: ["images/1.jpg", "images/2.jpg", "images/3.jpg", "images/4.jpg", "images/5.jpg", "images/6.jpg"],
    phase2: ["images/7.jpeg", "images/8.jpeg", "images/9.jpeg", "images/10.jpeg", "images/11.jpeg", "images/12.jpeg", "images/13.jpeg", "images/14.jpeg"],
    phase3: ["images/15.jpeg", "images/16.jpeg", "images/17.jpeg", "images/18.jpeg", "images/19.jpeg", "images/20.jpeg"],
    exampleBlueprint: "images/sample_plan.png",
    exampleRender: "images/sample_3d.png"
  };
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const MobileNavBar = ({ onOpenMenu }) => /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-0 left-0 w-full bottom-nav z-[90] md:hidden pb-safe" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-5 h-[60px] items-center" }, [
    { svg: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "Home", id: "hero" },
    { svg: "M19 11H5m14-6H5m14 12H9m10 0l-4 4m0 0l-4-4m4 4V9", label: "Work", id: "work" },
    null,
    { svg: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Studio", id: "studio" },
    { svg: "M4 6h16M4 12h16m-7 6h7", label: "Menu", id: null }
  ].map((item, i) => {
    if (!item) return /* @__PURE__ */ React.createElement("div", { key: i, className: "flex justify-center relative", style: { top: "-14px" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => scrollTo("generator"),
        className: "w-13 h-13 bg-ink rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform",
        style: { width: "52px", height: "52px" }
      },
      /* @__PURE__ */ React.createElement("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" }))
    ));
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        onClick: item.id ? () => scrollTo(item.id) : onOpenMenu,
        className: "flex flex-col items-center justify-center gap-1 text-black/45 active:text-black transition-colors"
      },
      /* @__PURE__ */ React.createElement("svg", { className: "w-[18px] h-[18px]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: item.svg })),
      /* @__PURE__ */ React.createElement("span", { className: "text-[7px] uppercase font-bold tracking-wider" }, item.label)
    );
  })));
  const MobileMenuOverlay = ({ isOpen, onClose, onJoin }) => /* @__PURE__ */ React.createElement(AnimatePresence, null, isOpen && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0, y: "100%" },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: "100%" },
      transition: { type: "spring", damping: 28, stiffness: 220 },
      className: "fixed inset-0 z-[100] text-paper flex flex-col pb-safe",
      style: { background: "linear-gradient(180deg, rgba(10,10,10,0.98), rgba(23,23,23,0.98))" }
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center px-6 py-5 border-b border-white/8" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "cg text-[1.35rem] uppercase tracking-[-0.05em] text-white" }, "Keystone"), /* @__PURE__ */ React.createElement("p", { className: "mono text-[8px] uppercase tracking-[0.24em] mt-1", style: { color: "rgba(244,239,230,0.4)" } }, "AI studio")), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "w-9 h-9 bg-white/10 rounded-full flex items-center justify-center" }, /* @__PURE__ */ React.createElement("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })))),
    /* @__PURE__ */ React.createElement("div", { className: "flex-1 px-6 py-6 flex flex-col gap-0" }, [["Work", "work"], ["Services", "services"], ["Pricing", "pricing"], ["Studio", "studio"], ["Live Studio", "generator"], ["Sessions", "gallery"]].map(([label, id], i) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: id,
        onClick: () => {
          scrollTo(id);
          onClose();
        },
        className: "cg text-[2rem] text-left border-b border-white/6 py-4 flex justify-between items-center text-white/90 hover:text-white transition-colors",
        style: { letterSpacing: "-0.05em", textTransform: "uppercase" }
      },
      label,
      /* @__PURE__ */ React.createElement("span", { className: "mono text-sm text-white/20" }, "0", i + 1)
    )), /* @__PURE__ */ React.createElement("div", { className: "mt-auto pt-8 grid gap-3" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          scrollTo("generator");
          onClose();
        },
        className: "cta-hero cta-glow w-full text-center py-4"
      },
      "Open Live Studio"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          onJoin();
          onClose();
        },
        className: "cta-hero cta-glow-soft w-full text-center py-4"
      },
      "Request Access"
    )))
  ));
  const JoinModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = React.useState({ fullName: "", firmName: "", email: "", volume: "1-10 Projects", questions: "" });
    const [status, setStatus] = React.useState("idle");
    const update = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    useEffect(() => {
      if (!isOpen) return;
      const handleEscape = (event) => {
        if (event.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);
    const handleSubmit = async (e) => {
      e.preventDefault();
      setStatus("loading");
      const FORM = "https://docs.google.com/forms/d/e/1FAIpQLSeGuYIMrOkuJopGDt-TqRkqVeYrhRE7kIOrWGxEEvz1s4F9NA/formResponse";
      const d = new URLSearchParams();
      d.append("entry.564926659", formData.fullName);
      d.append("entry.510477948", formData.firmName);
      d.append("entry.1527142228", formData.email);
      d.append("entry.623368817", formData.volume);
      d.append("entry.1172849489", formData.questions);
      try {
        await fetch(FORM, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: d.toString() });
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
          onClose();
          setFormData({ fullName: "", firmName: "", email: "", volume: "1-10 Projects", questions: "" });
        }, 2600);
      } catch {
        alert("Error submitting. Please try again.");
        setStatus("idle");
      }
    };
    return /* @__PURE__ */ React.createElement(AnimatePresence, null, isOpen && /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: onClose,
        className: "fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-ink/65 backdrop-blur-lg p-0 md:p-6"
      },
      /* @__PURE__ */ React.createElement(
        motion.div,
        {
          initial: { y: 50, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: 50, opacity: 0 },
          transition: { type: "spring", damping: 26 },
          onClick: (event) => event.stopPropagation(),
          className: "bg-paper w-full md:max-w-md rounded-t-2xl md:rounded-xl shadow-2xl relative overflow-hidden"
        },
        /* @__PURE__ */ React.createElement("div", { style: { height: "3px", background: "linear-gradient(90deg, var(--accent), var(--accent-2))" } }),
        /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: onClose,
            "aria-label": "Close access request",
            className: "absolute top-4 right-4 w-9 h-9 bg-black/6 hover:bg-black/12 rounded-full flex items-center justify-center transition-colors z-10"
          },
          /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M3 3L11 11M11 3L3 11", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }))
        ),
        /* @__PURE__ */ React.createElement("div", { className: "p-6 md:p-8 overflow-y-auto", style: { maxHeight: "90vh" } }, /* @__PURE__ */ React.createElement("span", { className: "badge mb-3 inline-block" }, "Request Access"), /* @__PURE__ */ React.createElement("h2", { className: "cg text-3xl mb-1 mt-2", style: { letterSpacing: "-0.05em", textTransform: "uppercase" } }, "Access the live studio."), /* @__PURE__ */ React.createElement("p", { className: "text-mid text-sm mt-2 mb-6 leading-relaxed" }, "Qualified architectural firms get a guided live session with no credit card and no commitment."), status === "success" ? /* @__PURE__ */ React.createElement(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, className: "flex flex-col items-center text-center py-10" }, /* @__PURE__ */ React.createElement("div", { className: "w-16 h-16 rounded-full bg-blue flex items-center justify-center text-white text-xl mb-4" }, "OK"), /* @__PURE__ */ React.createElement("h3", { className: "cg text-2xl", style: { letterSpacing: "-0.05em", textTransform: "uppercase" } }, "You're in the queue."), /* @__PURE__ */ React.createElement("p", { className: "text-mid text-sm mt-2" }, "We will follow up with studio access details shortly.")) : /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "mono text-[7px] uppercase tracking-widest text-mid block mb-1" }, "Full Name"), /* @__PURE__ */ React.createElement("input", { type: "text", name: "fullName", value: formData.fullName, onChange: update, required: true, placeholder: "Jane Doe" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "mono text-[7px] uppercase tracking-widest text-mid block mb-1" }, "Firm Name"), /* @__PURE__ */ React.createElement("input", { type: "text", name: "firmName", value: formData.firmName, onChange: update, required: true, placeholder: "Firm LLC" }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "mono text-[7px] uppercase tracking-widest text-mid block mb-1" }, "Business Email"), /* @__PURE__ */ React.createElement("input", { type: "email", name: "email", value: formData.email, onChange: update, required: true, placeholder: "jane@firm.com" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "mono text-[7px] uppercase tracking-widest text-mid block mb-1" }, "Annual Project Volume"), /* @__PURE__ */ React.createElement("select", { name: "volume", value: formData.volume, onChange: update }, /* @__PURE__ */ React.createElement("option", null, "1-10 Projects"), /* @__PURE__ */ React.createElement("option", null, "10-30 Projects"), /* @__PURE__ */ React.createElement("option", null, "30+ Projects"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "mono text-[7px] uppercase tracking-widest text-mid block mb-1" }, "Questions / Notes"), /* @__PURE__ */ React.createElement("textarea", { name: "questions", rows: "2", value: formData.questions, onChange: update, placeholder: "Optional..." })), /* @__PURE__ */ React.createElement("button", { type: "submit", disabled: status === "loading", className: "cta-hero w-full py-4 text-base disabled:opacity-60" }, status === "loading" ? "Sending..." : "Request Access"), /* @__PURE__ */ React.createElement("p", { className: "text-center mono text-[9px] text-mid" }, "No spam - no credit card - fast follow-up"), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "w-full py-3 text-[11px] uppercase tracking-[0.22em] mono text-mid border border-black/10 rounded-full hover:bg-black/4 transition-colors"
          },
          "Not now, go back"
        )))
      )
    ));
  };
  const PlanSummaryPanel = ({ planSpec }) => {
    if (!planSpec) return null;
    const allRooms = (planSpec.levels || []).flatMap((l) => l.rooms || []);
    const roomCounts = {};
    allRooms.forEach((r) => {
      const t = r.label || r.type;
      roomCounts[t] = (roomCounts[t] || 0) + 1;
    });
    return /* @__PURE__ */ React.createElement("div", { className: "border border-black/6 rounded-sm p-4 mt-4 bg-white/60" }, /* @__PURE__ */ React.createElement("p", { className: "mono text-[8px] uppercase tracking-widest text-blue mb-3" }, "Plan Summary"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-2 mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "spec-panel" }, /* @__PURE__ */ React.createElement("div", { className: "spec-label" }, "Area"), /* @__PURE__ */ React.createElement("div", { className: "spec-value" }, (planSpec.totalAreaSqFt || 0).toLocaleString(), " sqft")), /* @__PURE__ */ React.createElement("div", { className: "spec-panel" }, /* @__PURE__ */ React.createElement("div", { className: "spec-label" }, "Stories"), /* @__PURE__ */ React.createElement("div", { className: "spec-value" }, planSpec.stories)), /* @__PURE__ */ React.createElement("div", { className: "spec-panel" }, /* @__PURE__ */ React.createElement("div", { className: "spec-label" }, "Levels"), /* @__PURE__ */ React.createElement("div", { className: "spec-value" }, (planSpec.levels || []).length))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1" }, Object.entries(roomCounts).map(([label, count]) => /* @__PURE__ */ React.createElement("span", { key: label, className: "room-badge active", style: { cursor: "default" } }, label, count > 1 ? ` \xD7${count}` : ""))));
  };
  const REFINEMENT_SUGGESTIONS = [
    "Make the living room 4 feet wider",
    "Make the primary bedroom bigger",
    "Expand the kitchen",
    "Make the master bathroom larger",
    "Widen the hallways",
    "Make the garage wider",
    "Expand the dining room"
  ];
  const RefinementPanel = ({ planSpec, formData, refinementsLeft, refinementHistory, onRefine, isLoading }) => {
    const [custom, setCustom] = React.useState("");
    const historyRef = React.useRef(null);
    React.useEffect(() => {
      if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }, [refinementHistory]);
    if (!planSpec) return null;
    const handleCustom = (e) => {
      e.preventDefault();
      if (!custom.trim() || isLoading || refinementsLeft <= 0) return;
      onRefine(custom.trim());
      setCustom("");
    };
    const disabled = isLoading || refinementsLeft <= 0;
    const countColor = refinementsLeft > 5 ? "var(--blue)" : refinementsLeft > 2 ? "var(--gold)" : "var(--red)";
    return /* @__PURE__ */ React.createElement("div", { className: "border-t border-black/5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-4 pt-4 pb-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { style: { width: "6px", height: "6px", borderRadius: "50%", background: "var(--blue)", display: "inline-block" } }), /* @__PURE__ */ React.createElement("p", { className: "mono text-[8px] uppercase tracking-widest text-blue font-bold" }, "Refine Your Plan")), /* @__PURE__ */ React.createElement("span", { className: "mono text-[9px] font-bold", style: { color: countColor } }, refinementsLeft, "/10 free")), refinementHistory.length > 0 && /* @__PURE__ */ React.createElement(
      "div",
      {
        ref: historyRef,
        className: "mx-4 mb-3 max-h-40 overflow-y-auto rounded-sm",
        style: { background: "var(--cream)", border: "1px solid rgba(0,0,0,0.06)" }
      },
      refinementHistory.map((msg, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "px-3 py-2 border-b border-black/4 last:border-0" }, msg.role === "user" && /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 items-start" }, /* @__PURE__ */ React.createElement("span", { className: "mono text-[7px] uppercase text-blue pt-0.5 flex-shrink-0 font-bold" }, "You"), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] leading-snug" }, msg.content)), msg.role === "assistant" && /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 items-start" }, /* @__PURE__ */ React.createElement("span", { className: "mono text-[7px] uppercase text-mid pt-0.5 flex-shrink-0 font-bold" }, "AI"), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] leading-snug text-blue" }, "\u2713 ", msg.content)), msg.role === "error" && /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 items-start" }, /* @__PURE__ */ React.createElement("span", { className: "mono text-[7px] uppercase text-red pt-0.5 flex-shrink-0 font-bold" }, "Error"), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] leading-snug text-red" }, msg.content)))),
      isLoading && /* @__PURE__ */ React.createElement("div", { className: "px-3 py-2 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-3 h-3 border-2 border-blue border-t-transparent rounded-full animate-spin flex-shrink-0" }), /* @__PURE__ */ React.createElement("span", { className: "mono text-[8px] uppercase tracking-widest text-mid animate-pulse" }, "Gemini is analyzing your plan\u2026"))
    ), isLoading && refinementHistory.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "mx-4 mb-3 px-3 py-2 flex items-center gap-2 rounded-sm", style: { background: "var(--cream)" } }, /* @__PURE__ */ React.createElement("div", { className: "w-3 h-3 border-2 border-blue border-t-transparent rounded-full animate-spin flex-shrink-0" }), /* @__PURE__ */ React.createElement("span", { className: "mono text-[8px] uppercase tracking-widest text-mid animate-pulse" }, "Gemini is analyzing your plan\u2026")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1 px-4 mb-3" }, REFINEMENT_SUGGESTIONS.map((s, i) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        disabled,
        onClick: () => onRefine(s),
        className: "text-[9px] px-2 py-1 border border-black/8 hover:border-blue hover:text-blue transition-all disabled:opacity-30 rounded-sm bg-white"
      },
      s
    ))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleCustom, className: "flex gap-2 px-4 pb-4" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: custom,
        onChange: (e) => setCustom(e.target.value),
        placeholder: disabled ? "No refinements left" : "e.g. Make the living room 6 feet wider\u2026",
        disabled,
        className: "flex-1 text-sm px-3 py-2 border border-black/10 rounded-sm focus:outline-none focus:border-blue disabled:opacity-40",
        style: { background: "white" }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        disabled: disabled || !custom.trim(),
        className: "px-4 py-2 bg-blue text-white mono text-[9px] font-bold uppercase tracking-wider disabled:opacity-30 hover:bg-ink transition-colors rounded-sm whitespace-nowrap"
      },
      "Apply \u2192"
    )), refinementsLeft === 0 && /* @__PURE__ */ React.createElement("p", { className: "mono text-[9px] text-red font-bold uppercase px-4 pb-3" }, "Free refinements used \u2014 upgrade to Studio for more."));
  };
  const RenderSurveyModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [data, setData] = useState(initialData || {
      zipCode: "",
      exteriorStyle: "",
      roofStyle: "Gabled",
      landscaping: "Manicured lawn",
      surroundings: "",
      season: "Summer",
      timeOfDay: "Midday",
      lotContext: ""
    });
    const upd = (f, v) => setData((p) => ({ ...p, [f]: v }));
    const BtnRow = ({ field, options }) => /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5" }, options.map((opt) => {
      const val = typeof opt === "string" ? opt : opt.val;
      const label = typeof opt === "string" ? opt : opt.label;
      const sel = data[field] === val;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: val,
          type: "button",
          onClick: () => upd(field, val),
          className: "px-3 py-1.5 border rounded-sm text-[10px] font-semibold transition-all",
          style: { borderColor: sel ? "var(--blue)" : "rgba(0,0,0,0.1)", background: sel ? "var(--ink)" : "white", color: sel ? "white" : "var(--ink)" }
        },
        label
      );
    }));
    const Lbl = ({ children }) => /* @__PURE__ */ React.createElement("label", { className: "mono text-[7px] uppercase tracking-widest text-mid block mb-1.5" }, children);
    return /* @__PURE__ */ React.createElement(AnimatePresence, null, isOpen && /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-[150] flex items-end md:items-center justify-center bg-ink/70 backdrop-blur-lg p-0 md:p-6"
      },
      /* @__PURE__ */ React.createElement(
        motion.div,
        {
          initial: { y: 40, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: 40, opacity: 0 },
          transition: { type: "spring", damping: 26 },
          className: "bg-paper w-full md:max-w-lg rounded-t-2xl md:rounded-xl shadow-2xl relative overflow-hidden"
        },
        /* @__PURE__ */ React.createElement("div", { style: { height: "3px", background: "linear-gradient(90deg,var(--blue),var(--red))" } }),
        /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "absolute top-4 right-4 w-8 h-8 bg-black/6 hover:bg-black/12 rounded-full flex items-center justify-center text-lg z-10" }, "\xD7"),
        /* @__PURE__ */ React.createElement("div", { className: "p-6 overflow-y-auto", style: { maxHeight: "85vh" } }, /* @__PURE__ */ React.createElement("span", { className: "badge mb-3 inline-block" }, "3D Render Options"), /* @__PURE__ */ React.createElement("h2", { className: "cg text-2xl italic mb-1" }, "Customize Your Render."), /* @__PURE__ */ React.createElement("p", { className: "text-mid text-[11px] mb-5 leading-relaxed" }, "These details help Gemini AI generate a more accurate and context-aware exterior render."), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Lbl, null, "\u{1F4CD} Project Zip Code"), /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "text",
            placeholder: "e.g. 78701",
            maxLength: "10",
            value: data.zipCode,
            onChange: (e) => upd("zipCode", e.target.value),
            style: { maxWidth: "180px" }
          }
        ), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-mid/60 mt-1" }, "Helps set regional context \u2014 climate, terrain, neighborhood character")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Lbl, null, "\u{1F3E0} Exterior Style"), /* @__PURE__ */ React.createElement(BtnRow, { field: "exteriorStyle", options: [
          { val: "Craftsman (Wood & Stone)", label: "Craftsman" },
          { val: "Modern Farmhouse (Board & Batten)", label: "Farmhouse" },
          { val: "Traditional Colonial (Brick)", label: "Colonial" },
          { val: "Contemporary Modern (Concrete)", label: "Modern" },
          { val: "Mediterranean (Stucco & Tile)", label: "Mediterranean" },
          { val: "Rustic Cabin (Log & Stone)", label: "Rustic" }
        ] }), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-mid/60 mt-1" }, "Leave blank to use your plan survey style")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Lbl, null, "\u{1F3D7}\uFE0F Roof Style"), /* @__PURE__ */ React.createElement(BtnRow, { field: "roofStyle", options: ["Gabled", "Hip Roof", "Flat Roof", "Metal Standing Seam", "Terracotta Tile", "Cathedral / Vaulted"] })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Lbl, null, "\u{1F33F} Season / Vegetation"), /* @__PURE__ */ React.createElement(BtnRow, { field: "season", options: ["Spring", "Summer", "Fall", "Winter (Snow)"] })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Lbl, null, "\u2600\uFE0F Time of Day / Lighting"), /* @__PURE__ */ React.createElement(BtnRow, { field: "timeOfDay", options: ["Sunrise", "Midday", "Golden Hour", "Overcast", "Night"] })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Lbl, null, "\u{1F332} Surrounding Environment"), /* @__PURE__ */ React.createElement(BtnRow, { field: "surroundings", options: [
          { val: "Suburban neighborhood", label: "Suburban" },
          { val: "Wooded forest", label: "Wooded" },
          { val: "Desert arid landscape", label: "Desert" },
          { val: "Tropical lush", label: "Tropical" },
          { val: "Snow and mountains", label: "Mountain" },
          { val: "Ocean or lake waterfront", label: "Waterfront" }
        ] })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Lbl, null, "\u{1F333} Landscaping"), /* @__PURE__ */ React.createElement(BtnRow, { field: "landscaping", options: [
          "Manicured lawn",
          "Native plantings",
          "Desert xeriscaping",
          "Formal hedges",
          "Wildflower meadow",
          "Minimal / gravel"
        ] }))), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => onSubmit(data),
            className: "w-full mt-6 py-3.5 bg-ink text-white mono text-[10px] uppercase tracking-[0.18em] font-bold hover:bg-blue transition-colors rounded-sm"
          },
          "\u2726 Generate 3D Render \u2192"
        ))
      )
    ));
  };
  const svgToPngDataUrl = (svgMarkup, options = {}) => new Promise((resolve, reject) => {
    try {
      if (!svgMarkup || typeof svgMarkup !== "string") {
        reject(new Error("svgToPngDataUrl: missing SVG markup"));
        return;
      }
      const {
        background = "#F6F4EF",
        pixelRatio = window.devicePixelRatio && window.devicePixelRatio > 1 ? Math.min(window.devicePixelRatio, 2) : 1
      } = options;
      let svg = svgMarkup.trim();
      if (!svg.includes("xmlns=")) {
        svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
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
      if (!height) height = 1e3;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
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
          resolve(canvas.toDataURL("image/png"));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("svgToPngDataUrl: unable to rasterize SVG"));
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    } catch (err) {
      reject(err);
    }
  });
  const RENDER_REFINEMENTS = [
    { label: "Golden Hour", hint: "warm late-afternoon sunlight, long shadows, golden orange sky \u2014 ONLY change the lighting and sky, keep the house architecture identical" },
    { label: "Overcast Day", hint: "soft diffuse overcast lighting, muted tones, grey cloud-covered sky \u2014 ONLY change the lighting and sky, keep the house architecture identical" },
    { label: "Night Lit", hint: "night scene with interior lights glowing warmly through windows, landscape uplighting, dark blue starry sky \u2014 ONLY change the lighting and sky, keep the house architecture identical" },
    { label: "Sunrise", hint: "sunrise with pink and orange gradient sky, long warm shadows raking across the facade \u2014 ONLY change the lighting and sky, keep the house architecture identical" }
  ];
  const Render3DPanel = ({ planSpec, formData, planSvg, galleryId, onRenderReady }) => {
    const [renderStatus, setRenderStatus] = useState("idle");
    const [renderImage, setRenderImage] = useState(null);
    const [renderImageClean, setRenderImageClean] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [activeRefinement, setActiveRefinement] = useState(null);
    const [showSurvey, setShowSurvey] = useState(false);
    const [renderSurveyData, setRenderSurveyData] = useState(null);
    const applyWatermark = (imgSrc) => new Promise((resolve) => {
      const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d"), img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const barH = Math.max(28, canvas.height * 0.05);
        ctx.fillStyle = "rgba(10,10,12,0.82)";
        ctx.fillRect(0, canvas.height - barH, canvas.width, barH);
        ctx.fillStyle = "#fff";
        ctx.font = `italic ${Math.floor(barH * 0.42)}px serif`;
        ctx.textBaseline = "middle";
        ctx.fillText("Property of Keystone AI", barH * 0.5, canvas.height - barH / 2);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(imgSrc);
      img.src = imgSrc;
    });
    const doRender = async (renderSurvey, lightingHint = null, existingImageForLighting = null) => {
      setRenderStatus("loading");
      setErrorMsg("");
      try {
        const isLightingOnly = !!(lightingHint && existingImageForLighting);
        const planImage = isLightingOnly ? null : await svgToPngDataUrl(planSvg, { background: "#F6F4EF" });
        const payload = {
          surveyData: formData,
          renderSurveyData: renderSurvey || renderSurveyData || {},
          planSpec,
          galleryId,
          lightingHint: lightingHint || null,
          // Pass existing render (without watermark) for lighting-only edits
          existingRenderImage: existingImageForLighting || null,
          // Ground new renders against the generated floor plan image
          planImage
        };
        const res = await fetch("/api/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        let data;
        try {
          data = await res.json();
        } catch (_) {
          data = { success: false, message: `Server error ${res.status}` };
        }
        if (!data.success) {
          setErrorMsg(data.message || "Unknown error from server");
          setRenderStatus("error");
          return;
        }
        const imgSrc = data.image.startsWith("data:") ? data.image : `data:image/jpeg;base64,${data.image}`;
        setRenderImageClean(imgSrc);
        const watermarked = await applyWatermark(imgSrc);
        setRenderImage(watermarked);
        setRenderStatus("ready");
        if (onRenderReady) onRenderReady(watermarked);
      } catch (err) {
        console.error("[render]", err);
        setErrorMsg(err.message || "Network error \u2014 is the server running?");
        setRenderStatus("error");
      }
    };
    const handleSurveySubmit = (surveyData) => {
      setShowSurvey(false);
      setRenderSurveyData(surveyData);
      setActiveRefinement(null);
      doRender(surveyData, null, null);
    };
    const handleRender = () => {
      setActiveRefinement(null);
      setShowSurvey(true);
    };
    const handleRegenerate = () => {
      setActiveRefinement(null);
      doRender(renderSurveyData, null, null);
    };
    const handleRefinement = (ref) => {
      setActiveRefinement(ref.label);
      doRender(renderSurveyData, ref.hint, renderImageClean);
    };
    if (renderStatus === "idle") return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(RenderSurveyModal, { isOpen: showSurvey, onClose: () => setShowSurvey(false), onSubmit: handleSurveySubmit, initialData: renderSurveyData }), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleRender,
        className: "w-full py-3.5 bg-ink text-white mono text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-blue transition-colors rounded-sm"
      },
      "\u2726 Generate AI 3D Render"
    ));
    if (renderStatus === "loading") return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center gap-3 py-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 text-blue" }, /* @__PURE__ */ React.createElement("div", { className: "w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin" }), /* @__PURE__ */ React.createElement("span", { className: "mono text-[9px] uppercase tracking-widest animate-pulse" }, activeRefinement ? `Adjusting lighting: ${activeRefinement}\u2026` : "Rendering with Gemini AI\u2026")), /* @__PURE__ */ React.createElement("p", { className: "mono text-[8px] text-mid opacity-50" }, activeRefinement ? "Changing lighting only \u2014 architecture unchanged" : "Usually 15\u201330 seconds"));
    if (renderStatus === "error") return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(RenderSurveyModal, { isOpen: showSurvey, onClose: () => setShowSurvey(false), onSubmit: handleSurveySubmit, initialData: renderSurveyData }), /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-red/5 border border-red/20 rounded-sm" }, /* @__PURE__ */ React.createElement("p", { className: "mono text-[9px] font-bold text-red uppercase mb-1" }, "Render Failed"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-mid leading-relaxed mb-3", style: { wordBreak: "break-word" } }, errorMsg), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setShowSurvey(true),
        className: "mono text-[9px] uppercase tracking-widest px-3 py-1.5 bg-ink text-white rounded-sm hover:bg-blue transition-colors"
      },
      "Retry \u2192"
    )));
    if (renderStatus === "ready") return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(RenderSurveyModal, { isOpen: showSurvey, onClose: () => setShowSurvey(false), onSubmit: handleSurveySubmit, initialData: renderSurveyData }), /* @__PURE__ */ React.createElement("img", { src: renderImage, className: "w-full object-cover rounded-sm shadow-xl", alt: "AI 3D Render" }), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mt-2 mb-3 flex-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "mono text-[8px] uppercase tracking-widest text-mid" }, activeRefinement ? `Lighting: ${activeRefinement}` : "AI Exterior Render"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          const l = document.createElement("a");
          l.href = renderImage;
          l.download = "Keystone_3D.png";
          l.click();
        },
        className: "ml-auto mono text-[9px] text-blue underline"
      },
      "Download"
    ), /* @__PURE__ */ React.createElement("button", { onClick: handleRegenerate, className: "mono text-[9px] text-mid underline" }, "\u21BA Regenerate"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowSurvey(true), className: "mono text-[9px] text-mid underline" }, "\u2699 Options")), /* @__PURE__ */ React.createElement("div", { className: "border-t border-black/5 pt-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("p", { className: "mono text-[7px] uppercase tracking-widest text-mid" }, "Lighting & Mood"), /* @__PURE__ */ React.createElement("p", { className: "mono text-[7px] text-mid/40" }, "Architecture stays unchanged")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 flex-wrap" }, RENDER_REFINEMENTS.map((ref) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: ref.label,
        onClick: () => handleRefinement(ref),
        className: "flex items-center gap-1.5 px-3 py-1.5 border rounded-sm transition-all mono text-[9px] font-bold uppercase tracking-wide",
        style: {
          borderColor: activeRefinement === ref.label ? "var(--blue)" : "rgba(0,0,0,0.1)",
          background: activeRefinement === ref.label ? "var(--blue)" : "white",
          color: activeRefinement === ref.label ? "white" : "var(--ink)"
        }
      },
      ref.label === "Golden Hour" && "\u2600 ",
      ref.label === "Overcast Day" && "\u2601 ",
      ref.label === "Night Lit" && "\u{1F319} ",
      ref.label === "Sunrise" && "\u{1F305} ",
      ref.label
    )))));
    return null;
  };
  const SURVEY_STEPS = [
    { id: "basics", title: "Basic Requirements", subtitle: "Size, stories, and rooms", fields: ["totalArea", "stories", "bedrooms", "bathrooms", "privateBaths"] },
    { id: "structure", title: "Structure & Site", subtitle: "Garage, shape, and orientation", fields: ["garage", "shape", "frontFacing", "lotContext"] },
    { id: "lifestyle", title: "Lifestyle & Layout", subtitle: "How you live in the home", fields: ["openConcept", "masterLocation", "kitchenPlacement", "laundryLocation", "ceilingHeight"] },
    { id: "style", title: "Style & Materials", subtitle: "Aesthetic and finishes", fields: ["materials", "indoorOutdoor", "naturalLight"] },
    { id: "extras", title: "Special Features", subtitle: "Additional rooms and preferences", fields: ["features", "accessibilityNeeds", "budgetTier", "freeformWishes"] }
  ];
  const SurveyForm = ({ formData, setFormData, onSubmit, isLoading }) => {
    const [step, setStep] = useState(0);
    const upd = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
    const BtnGrid = ({ field, options, cols = 2 }) => /* @__PURE__ */ React.createElement("div", { className: "grid gap-2", style: { gridTemplateColumns: `repeat(${cols},1fr)` } }, options.map((opt) => {
      const val = typeof opt === "string" ? opt : opt.val;
      const label = typeof opt === "string" ? opt : opt.label;
      const desc = typeof opt === "object" ? opt.desc : null;
      const sel = formData[field] === val;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: val,
          type: "button",
          onClick: () => upd(field, val),
          className: `py-3 px-3 border text-left rounded-sm transition-all ${sel ? "bg-ink text-white border-ink" : "border-black/10 bg-white hover:border-blue"}`
        },
        /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-semibold leading-tight" }, label),
        desc && /* @__PURE__ */ React.createElement("div", { className: `text-[9px] mt-0.5 leading-tight ${sel ? "opacity-50" : "opacity-35"}` }, desc)
      );
    }));
    const ToggleChip = ({ value, label, icon, field }) => {
      const selected = (formData[field] || "").toLowerCase().includes(label.toLowerCase());
      const toggle = () => {
        const current = formData[field] || "";
        const parts = current.split(",").map((s) => s.trim()).filter(Boolean);
        if (selected) {
          const next = parts.filter((p) => !p.toLowerCase().includes(label.toLowerCase())).join(", ");
          upd(field, next);
        } else {
          const next = [...parts, `1 ${label}`].join(", ");
          upd(field, next);
        }
      };
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: toggle,
          className: "flex items-center gap-1.5 px-3 py-2 border rounded-sm transition-all text-[10px] font-semibold",
          style: {
            borderColor: selected ? "var(--blue)" : "rgba(0,0,0,0.1)",
            background: selected ? "var(--ink)" : "white",
            color: selected ? "white" : "var(--ink)"
          }
        },
        /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px" } }, icon),
        label,
        selected && /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.5, fontSize: "9px" } }, "\u2713")
      );
    };
    const Lbl = ({ children }) => /* @__PURE__ */ React.createElement("label", { className: "mono text-[7px] uppercase tracking-widest text-mid block mb-1.5" }, children);
    const FootprintOption = ({ val, label, desc, ratio }) => {
      const sel = formData.shape === val;
      const [fw, fh] = ratio;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => upd("shape", val),
          className: `p-3 border rounded-sm transition-all flex flex-col items-center gap-2 ${sel ? "bg-ink text-white border-ink" : "border-black/10 bg-white hover:border-blue"}`
        },
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", height: "36px" } }, /* @__PURE__ */ React.createElement("div", { style: {
          width: `${fw * 28}px`,
          height: `${fh * 28}px`,
          border: `2px solid ${sel ? "rgba(255,255,255,0.7)" : "var(--blue)"}`,
          background: sel ? "rgba(255,255,255,0.08)" : "rgba(27,79,130,0.06)",
          borderRadius: "2px"
        } })),
        /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-semibold leading-tight text-center" }, label),
        /* @__PURE__ */ React.createElement("div", { className: `text-[8px] leading-tight text-center ${sel ? "opacity-50" : "opacity-40"}` }, desc)
      );
    };
    const LotOption = ({ val, label, svgContent }) => {
      const sel = formData.lotContext === val;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => upd("lotContext", val),
          className: `p-2 border rounded-sm transition-all flex flex-col items-center gap-1.5 ${sel ? "border-blue" : "border-black/10 bg-white hover:border-blue"}`,
          style: { background: sel ? "rgba(27,79,130,0.05)" : "white" }
        },
        /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 60 40", width: "60", height: "40", style: { display: "block" } }, svgContent),
        /* @__PURE__ */ React.createElement("div", { className: "text-[9px] font-semibold leading-tight text-center", style: { color: sel ? "var(--blue)" : "var(--ink)" } }, label)
      );
    };
    const renderField = (field) => {
      const bedCount = parseInt(formData.bedrooms) || 3;
      switch (field) {
        case "totalArea":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Total Floor Area (Sq Ft)"), /* @__PURE__ */ React.createElement("input", { type: "number", placeholder: "e.g. 2400", value: formData.totalArea, onChange: (e) => upd("totalArea", e.target.value), min: "600", max: "10000" }), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-mid/60" }, "Total finished sq ft across all levels"));
        case "stories":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Number of Stories"), /* @__PURE__ */ React.createElement(BtnGrid, { field: "stories", options: ["1 Story", "2 Stories"] }));
        case "bedrooms":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Bedrooms"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ React.createElement("button", { key: n, type: "button", onClick: () => upd("bedrooms", `${n} Bed`), className: `flex-1 h-11 border text-sm font-bold rounded-sm transition-all ${formData.bedrooms === `${n} Bed` ? "bg-ink text-white border-ink" : "border-black/10 bg-white hover:border-blue"}` }, n))));
        case "bathrooms":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Full Bathrooms"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ React.createElement("button", { key: n, type: "button", onClick: () => upd("bathrooms", `${n} Bath`), className: `flex-1 h-11 border text-sm font-bold rounded-sm transition-all ${formData.bathrooms === `${n} Bath` ? "bg-ink text-white border-ink" : "border-black/10 bg-white hover:border-blue"}` }, n))), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-mid/60" }, "Half baths added automatically"));
        case "privateBaths":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5 p-3 bg-blue/4 border border-blue/15 rounded-sm" }, /* @__PURE__ */ React.createElement(Lbl, null, "\u{1F6C1} Private En-Suite Bathrooms"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-mid mb-2" }, "How many bedrooms should have their own private bathroom attached?"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, [0, 1, 2, 3].filter((n) => n <= bedCount).map((n) => /* @__PURE__ */ React.createElement("button", { key: n, type: "button", onClick: () => upd("privateBaths", `${n}`), className: `flex-1 h-10 border text-sm font-bold rounded-sm transition-all ${formData.privateBaths === `${n}` ? "bg-blue text-white border-blue" : "border-black/10 bg-white hover:border-blue"}` }, n === 0 ? "None" : n))), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-mid/50" }, "Primary bedroom always gets an en-suite \xB7 Remaining baths are shared"));
        case "garage":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Garage"), /* @__PURE__ */ React.createElement(BtnGrid, { field: "garage", options: [
            { val: "No Garage", label: "No Garage", desc: "Driveway only" },
            { val: "1 Car Garage", label: "1 Car", desc: "Single attached garage" },
            { val: "2 Car Garage", label: "2 Car", desc: "Double attached garage" }
          ] }));
        case "shape":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Footprint Shape"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ React.createElement(FootprintOption, { val: "Rectangular (Wide)", label: "Wide Rectangle", desc: "Width > depth \u2014 more street frontage", ratio: [1.6, 1] }), /* @__PURE__ */ React.createElement(FootprintOption, { val: "Rectangular (Deep)", label: "Deep Rectangle", desc: "Depth > width \u2014 narrow lot", ratio: [1, 1.4] }), /* @__PURE__ */ React.createElement(FootprintOption, { val: "Square", label: "Square", desc: "Equal width and depth", ratio: [1, 1] }), /* @__PURE__ */ React.createElement(FootprintOption, { val: "Rectangular", label: "Standard Rect", desc: "Classic proportions", ratio: [1.3, 1] })));
        case "frontFacing":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-2" }, /* @__PURE__ */ React.createElement(Lbl, null, "Street / Front Faces"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center" }, /* @__PURE__ */ React.createElement("div", { className: "relative", style: { width: "210px", height: "210px" } }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 210 210", width: "210", height: "210", style: { position: "absolute", top: 0, left: 0, pointerEvents: "none" } }, /* @__PURE__ */ React.createElement("circle", { cx: "105", cy: "105", r: "100", fill: "none", stroke: "rgba(100,100,100,0.1)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("circle", { cx: "105", cy: "105", r: "68", fill: "none", stroke: "rgba(100,100,100,0.07)", strokeWidth: "1", strokeDasharray: "3 4" }), [[105, 6, 105, 20], [105, 190, 105, 204], [6, 105, 20, 105], [190, 105, 204, 105]].map(([x1, y1, x2, y2], i) => /* @__PURE__ */ React.createElement("line", { key: i, x1, y1, x2, y2, stroke: "rgba(100,100,100,0.22)", strokeWidth: "1.5" })), /* @__PURE__ */ React.createElement("path", { d: "M 174 68 Q 200 105 174 142", fill: "none", stroke: "rgba(181,136,42,0.2)", strokeWidth: "1.5", strokeDasharray: "3 3" }), /* @__PURE__ */ React.createElement("text", { x: "188", y: "109", textAnchor: "middle", fontSize: "8", fill: "rgba(181,136,42,0.5)" }, "\u2600")), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 2 } }, ["North", "South", "East", "West"].includes(formData.frontFacing) && (() => {
            const dir = formData.frontFacing;
            const arrs = { North: [38, 2, 38, 14], South: [38, 66, 38, 54], East: [74, 34, 60, 34], West: [2, 34, 16, 34] };
            const lps = { North: { x: 38, y: 24, a: "middle" }, South: { x: 38, y: 48, a: "middle" }, East: { x: 50, y: 34, a: "start" }, West: { x: 26, y: 34, a: "end" } };
            const arr = arrs[dir];
            const lp = lps[dir];
            return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 76 68", width: "76", height: "68" }, /* @__PURE__ */ React.createElement("rect", { x: "14", y: "26", width: "48", height: "36", rx: "1", fill: "#f3f2ee", stroke: "#2c2c2e", strokeWidth: "1.5" }), /* @__PURE__ */ React.createElement("polygon", { points: "8,28 38,7 68,28", fill: "#1a1a1a", opacity: "0.85" }), /* @__PURE__ */ React.createElement("rect", { x: "48", y: "10", width: "6", height: "10", fill: "#1a1a1a", opacity: "0.5" }), dir === "South" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "22", y: "42", width: "14", height: "14", rx: "1", fill: "#ccc", stroke: "#333", strokeWidth: "0.8", opacity: "0.8" }), /* @__PURE__ */ React.createElement("rect", { x: "42", y: "48", width: "7", height: "14", rx: "1", fill: "#7a7060", stroke: "#333", strokeWidth: "0.8" })), dir === "North" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "22", y: "26", width: "14", height: "10", rx: "1", fill: "#ccc", stroke: "#333", strokeWidth: "0.8", opacity: "0.8" }), /* @__PURE__ */ React.createElement("rect", { x: "42", y: "26", width: "7", height: "10", fill: "#7a7060", stroke: "#333", strokeWidth: "0.8" })), dir === "East" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "50", y: "34", width: "12", height: "16", rx: "1", fill: "#ccc", stroke: "#333", strokeWidth: "0.8", opacity: "0.8" }), /* @__PURE__ */ React.createElement("rect", { x: "50", y: "52", width: "12", height: "8", fill: "#7a7060", stroke: "#333", strokeWidth: "0.8" })), dir === "West" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "14", y: "34", width: "12", height: "16", rx: "1", fill: "#ccc", stroke: "#333", strokeWidth: "0.8", opacity: "0.8" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "52", width: "12", height: "8", fill: "#7a7060", stroke: "#333", strokeWidth: "0.8" })), /* @__PURE__ */ React.createElement("line", { x1: arr[0], y1: arr[1], x2: arr[2], y2: arr[3], stroke: "#1B4F82", strokeWidth: "1.5", strokeDasharray: "2 2" }), /* @__PURE__ */ React.createElement("circle", { cx: arr[0], cy: arr[1], r: "2.5", fill: "#1B4F82" }), /* @__PURE__ */ React.createElement("text", { x: lp.x, y: lp.y, textAnchor: lp.a, fontSize: "5", fill: "#1B4F82", fontWeight: "bold", fontFamily: "sans-serif" }, "STREET"));
          })()), [{ dir: "North", x: 77, y: 0, w: 56, h: 34 }, { dir: "South", x: 77, y: 176, w: 56, h: 34 }, { dir: "West", x: 0, y: 77, w: 34, h: 56 }, { dir: "East", x: 176, y: 77, w: 34, h: 56 }].map(({ dir, x, y, w, h }) => {
            const sel = formData.frontFacing === dir;
            return /* @__PURE__ */ React.createElement(
              "button",
              {
                key: dir,
                type: "button",
                onClick: () => upd("frontFacing", dir),
                style: { position: "absolute", left: x, top: y, width: w, height: h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: sel ? "1.5px solid #1B4F82" : "1px solid rgba(100,100,100,0.14)", borderRadius: "4px", background: sel ? "#1B4F82" : "rgba(246,244,239,0.95)", color: sel ? "#fff" : "#0A0A0C", cursor: "pointer", zIndex: 10, transition: "all 0.12s", boxShadow: sel ? "0 2px 10px rgba(27,79,130,0.3)" : "none" }
              },
              /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", fontWeight: "800", lineHeight: 1 } }, dir[0]),
              /* @__PURE__ */ React.createElement("span", { style: { fontSize: "6px", fontWeight: "600", opacity: 0.65, marginTop: "1px" } }, dir)
            );
          }))), /* @__PURE__ */ React.createElement("p", { className: "mono text-[7px] text-mid/50 text-center" }, "\u2600 South = most winter sun \xB7 East = morning light"));
        case "lotContext":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-2" }, /* @__PURE__ */ React.createElement(Lbl, null, "Lot / Site Context"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-2" }, /* @__PURE__ */ React.createElement(LotOption, { val: "Suburban standard lot", label: "Suburban", svgContent: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "5", y: "20", width: "50", height: "15", fill: "#c8e6c9", stroke: "#888", strokeWidth: "0.5" }), /* @__PURE__ */ React.createElement("rect", { x: "15", y: "8", width: "30", height: "14", fill: "#e8e4dc", stroke: "#555", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("polygon", { points: "15,8 30,2 45,8", fill: "#555" }), /* @__PURE__ */ React.createElement("rect", { x: "10", y: "32", width: "40", height: "3", fill: "#aaa" }), /* @__PURE__ */ React.createElement("line", { x1: "0", y1: "35", x2: "60", y2: "35", stroke: "#aaa", strokeWidth: "1" })) }), /* @__PURE__ */ React.createElement(LotOption, { val: "Suburban corner lot", label: "Corner", svgContent: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "5", y: "15", width: "50", height: "20", fill: "#c8e6c9", stroke: "#888", strokeWidth: "0.5" }), /* @__PURE__ */ React.createElement("rect", { x: "8", y: "8", width: "25", height: "14", fill: "#e8e4dc", stroke: "#555", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("polygon", { points: "8,8 20,2 33,8", fill: "#555" }), /* @__PURE__ */ React.createElement("line", { x1: "5", y1: "35", x2: "55", y2: "35", stroke: "#aaa", strokeWidth: "1.5" }), /* @__PURE__ */ React.createElement("line", { x1: "5", y1: "35", x2: "5", y2: "5", stroke: "#aaa", strokeWidth: "1.5" })) }), /* @__PURE__ */ React.createElement(LotOption, { val: "Urban tight lot", label: "Urban", svgContent: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "8", y: "5", width: "16", height: "30", fill: "#e8e4dc", stroke: "#555", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "26", y: "2", width: "12", height: "33", fill: "#ddd", stroke: "#777", strokeWidth: "0.7" }), /* @__PURE__ */ React.createElement("rect", { x: "40", y: "8", width: "14", height: "27", fill: "#d5cfc5", stroke: "#666", strokeWidth: "0.7" }), /* @__PURE__ */ React.createElement("line", { x1: "0", y1: "35", x2: "60", y2: "35", stroke: "#aaa", strokeWidth: "1.5" })) }), /* @__PURE__ */ React.createElement(LotOption, { val: "Rural acreage", label: "Rural", svgContent: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "0", y: "25", width: "60", height: "15", fill: "#a5d6a7", stroke: "none" }), /* @__PURE__ */ React.createElement("rect", { x: "18", y: "14", width: "24", height: "14", fill: "#e8e4dc", stroke: "#555", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("polygon", { points: "18,14 30,7 42,14", fill: "#555" }), /* @__PURE__ */ React.createElement("circle", { cx: "8", cy: "22", r: "5", fill: "#66bb6a" }), /* @__PURE__ */ React.createElement("circle", { cx: "52", cy: "20", r: "6", fill: "#4caf50" }), /* @__PURE__ */ React.createElement("circle", { cx: "46", cy: "23", r: "4", fill: "#81c784" })) }), /* @__PURE__ */ React.createElement(LotOption, { val: "View focused site", label: "View Site", svgContent: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "0", y: "22", width: "60", height: "18", fill: "#b3e5fc", stroke: "none" }), /* @__PURE__ */ React.createElement("polyline", { points: "0,22 10,16 20,20 32,12 44,18 60,14", fill: "none", stroke: "#8d6e63", strokeWidth: "1.5" }), /* @__PURE__ */ React.createElement("rect", { x: "20", y: "12", width: "20", height: "12", fill: "#e8e4dc", stroke: "#555", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("polygon", { points: "20,12 30,6 40,12", fill: "#555" })) }), /* @__PURE__ */ React.createElement(LotOption, { val: "Waterfront lot", label: "Waterfront", svgContent: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "0", y: "24", width: "60", height: "16", fill: "#81d4fa", stroke: "none" }), /* @__PURE__ */ React.createElement("rect", { x: "0", y: "24", width: "60", height: "4", fill: "#4fc3f7", stroke: "none" }), /* @__PURE__ */ React.createElement("rect", { x: "15", y: "10", width: "28", height: "16", fill: "#e8e4dc", stroke: "#555", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("polygon", { points: "15,10 29,4 43,10", fill: "#555" }), /* @__PURE__ */ React.createElement("rect", { x: "26", y: "24", width: "4", height: "6", fill: "#8d6e63" })) })));
        case "openConcept":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Kitchen / Living / Dining"), /* @__PURE__ */ React.createElement(BtnGrid, { field: "openConcept", cols: 1, options: [{ val: "Open Concept (Combined)", label: "Open Concept", desc: "Kitchen, dining, and living flow together as one great room" }, { val: "Traditional (Separate Rooms)", label: "Traditional", desc: "Each room is enclosed and defined with walls" }] }));
        case "masterLocation":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Primary Suite Location"), /* @__PURE__ */ React.createElement(BtnGrid, { field: "masterLocation", options: formData.stories === "1 Story" ? ["Level 1 (Main)"] : ["Level 1 (Main)", "Level 2 (Upper)"] }));
        case "kitchenPlacement":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Kitchen Location"), /* @__PURE__ */ React.createElement(BtnGrid, { field: "kitchenPlacement", options: ["Rear of House", "Front of House"] }));
        case "laundryLocation":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Laundry Location"), /* @__PURE__ */ React.createElement(BtnGrid, { field: "laundryLocation", cols: 1, options: formData.stories === "1 Story" ? ["Level 1 (near garage/mud)", "No preference"] : ["Level 1 (near garage/mud)", "Level 2 (near bedrooms)", "No preference"] }));
        case "ceilingHeight":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Ceiling Height"), /* @__PURE__ */ React.createElement(BtnGrid, { field: "ceilingHeight", cols: 3, options: ["Standard (9 ft)", "Tall (10 ft)", "Cathedral / Vaulted"] }));
        case "materials":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Exterior Style & Materials"), /* @__PURE__ */ React.createElement(BtnGrid, { field: "materials", cols: 1, options: [
            { val: "Craftsman (Wood & Stone)", label: "Craftsman", desc: "Natural wood trim, stone veneer, covered porch" },
            { val: "Modern Farmhouse (Board & Batten)", label: "Modern Farmhouse", desc: "Board-and-batten, black frames, metal roof" },
            { val: "Traditional Colonial (Brick)", label: "Traditional / Colonial", desc: "Brick facade, symmetrical windows, pitched roof" },
            { val: "Contemporary Modern (Concrete)", label: "Contemporary / Modern", desc: "Flat roof, concrete, floor-to-ceiling glass" },
            { val: "Mediterranean (Stucco & Tile)", label: "Mediterranean", desc: "Stucco exterior, terracotta tiles, arched details" }
          ] }));
        case "indoorOutdoor":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Indoor / Outdoor Flow"), /* @__PURE__ */ React.createElement(BtnGrid, { field: "indoorOutdoor", cols: 1, options: ["Minimal (enclosed feel)", "Moderate (some connection)", "Maximum (open to outdoors)"] }));
        case "naturalLight":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Natural Light Priority"), /* @__PURE__ */ React.createElement(BtnGrid, { field: "naturalLight", cols: 1, options: ["Balanced windows", "Maximum glazing", "Privacy first (fewer windows)"] }));
        case "features":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-2" }, /* @__PURE__ */ React.createElement(Lbl, null, "Special Rooms"), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-mid/60 mb-2" }, "Tap to add special rooms to your plan. Default: none."), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, [
            { label: "Study", icon: "\u{1F4DA}" },
            { label: "Home Office", icon: "\u{1F4BC}" },
            { label: "Home Theater", icon: "\u{1F3AC}" },
            { label: "Gym", icon: "\u{1F3CB}\uFE0F" },
            { label: "Gaming Room", icon: "\u{1F3AE}" },
            { label: "Library", icon: "\u{1F4D6}" },
            { label: "Wine Cellar", icon: "\u{1F377}" },
            { label: "Music Room", icon: "\u{1F3B5}" },
            { label: "Guest Suite", icon: "\u{1F6CF}\uFE0F" },
            { label: "Playroom", icon: "\u{1F9F8}" }
          ].map((f) => /* @__PURE__ */ React.createElement(ToggleChip, { key: f.label, field: "features", value: f.label, label: f.label, icon: f.icon }))), (formData.features || "").trim() && /* @__PURE__ */ React.createElement("div", { className: "mt-1 p-2 bg-blue/5 border border-blue/15 rounded-sm" }, /* @__PURE__ */ React.createElement("span", { className: "mono text-[7px] uppercase text-blue" }, "Selected: "), /* @__PURE__ */ React.createElement("span", { className: "text-[9px] text-ink" }, formData.features), /* @__PURE__ */ React.createElement("button", { onClick: () => upd("features", ""), className: "ml-2 text-[9px] text-red/60 hover:text-red" }, "clear")));
        case "accessibilityNeeds":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Accessibility Needs"), /* @__PURE__ */ React.createElement(BtnGrid, { field: "accessibilityNeeds", options: formData.stories === "2 Stories" ? ["None", "Wheelchair accessible", "Wide doorways"] : ["None", "Wheelchair accessible", "Wide doorways", "Single-level preferred"] }));
        case "budgetTier":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Budget Tier"), /* @__PURE__ */ React.createElement(BtnGrid, { field: "budgetTier", cols: 1, options: [{ val: "Entry ($120\u2013180/sqft)", label: "Entry \u2014 $120\u2013180/sqft", desc: "Efficient, value-optimized design" }, { val: "Mid ($200\u2013300/sqft)", label: "Mid \u2014 $200\u2013300/sqft", desc: "Quality finishes, flexible layouts" }, { val: "Luxury ($350+/sqft)", label: "Luxury \u2014 $350+/sqft", desc: "Premium materials, custom details" }] }));
        case "freeformWishes":
          return /* @__PURE__ */ React.createElement("div", { key: field, className: "space-y-1.5" }, /* @__PURE__ */ React.createElement(Lbl, null, "Anything Else? (optional)"), /* @__PURE__ */ React.createElement("textarea", { rows: "3", placeholder: "Specific wishes, must-haves, or notes\u2026", value: formData.freeformWishes, onChange: (e) => upd("freeformWishes", e.target.value) }));
        default:
          return null;
      }
    };
    const cur = SURVEY_STEPS[step];
    const isLast = step === SURVEY_STEPS.length - 1;
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex gap-1 mb-5" }, SURVEY_STEPS.map((_, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "flex-1 h-1 rounded-full transition-all duration-300", style: { background: i <= step ? "var(--blue)" : "rgba(0,0,0,0.07)" } }))), /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "mono text-[7px] uppercase tracking-widest text-mid" }, "Step ", step + 1, " of ", SURVEY_STEPS.length), /* @__PURE__ */ React.createElement("h3", { className: "cg text-2xl italic mt-0.5" }, cur.title)), /* @__PURE__ */ React.createElement("div", { className: "space-y-4 step-in", key: step }, cur.fields.map((f) => renderField(f))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2.5 mt-5" }, step > 0 && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setStep((s) => s - 1), className: "px-5 py-3 border border-black/10 text-[11px] font-semibold hover:border-ink transition-colors rounded-sm" }, "\u2190 Back"), !isLast ? /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setStep((s) => s + 1), className: "flex-1 py-3 bg-blue text-white text-[11px] font-bold uppercase tracking-wider hover:bg-ink transition-colors rounded-sm" }, "Continue \u2192") : /* @__PURE__ */ React.createElement("button", { type: "button", onClick: onSubmit, disabled: isLoading, className: "flex-1 py-3 bg-ink text-white text-[11px] font-bold uppercase tracking-wider hover:bg-blue transition-colors disabled:opacity-50 rounded-sm" }, isLoading ? "\u27F3  Generating\u2026" : "\u2726  Generate Floor Plan")));
  };
  const Gallery = ({ onOpenModal }) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [zoomImg, setZoomImg] = useState(null);
    const fetchGallery = async () => {
      try {
        const res = await fetch("/api/gallery");
        const data = await res.json();
        if (data.success) setEntries(data.gallery || []);
      } catch (e) {
        console.warn("Gallery fetch failed:", e);
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {
      fetchGallery();
      const t = setInterval(fetchGallery, 3e4);
      return () => clearInterval(t);
    }, []);
    const fmt = (ts) => {
      const d = new Date(ts);
      return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    };
    return /* @__PURE__ */ React.createElement("section", { id: "gallery", style: { background: "linear-gradient(180deg, #FFFDFC 0%, #F5F0E9 100%)", padding: "4.5rem 0 5.5rem" } }, /* @__PURE__ */ React.createElement(AnimatePresence, null, zoomImg && /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: () => setZoomImg(null),
        className: "fixed inset-0 z-[200] bg-ink/93 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out"
      },
      typeof zoomImg === "string" && zoomImg.startsWith("<svg") ? /* @__PURE__ */ React.createElement("div", { className: "bg-white p-6 max-w-4xl w-full max-h-[90vh] overflow-auto rounded-sm shadow-2xl", dangerouslySetInnerHTML: { __html: zoomImg } }) : /* @__PURE__ */ React.createElement("img", { src: zoomImg, className: "max-h-[90vh] max-w-full object-contain rounded-sm", alt: "Zoom" }),
      /* @__PURE__ */ React.createElement("button", { className: "absolute top-4 right-4 text-white/40 hover:text-white text-4xl font-light" }, "\xD7")
    )), /* @__PURE__ */ React.createElement(AnimatePresence, null, selected && /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-[150] bg-ink/70 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6",
        onClick: (e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }
      },
      /* @__PURE__ */ React.createElement(
        motion.div,
        {
          initial: { y: 40, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: 40, opacity: 0 },
          transition: { type: "spring", damping: 26 },
          className: "bg-paper w-full md:max-w-4xl max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-xl shadow-2xl"
        },
        /* @__PURE__ */ React.createElement("div", { style: { height: "3px", background: "linear-gradient(90deg,var(--blue),var(--red))", borderRadius: "8px 8px 0 0" } }),
        /* @__PURE__ */ React.createElement("div", { className: "p-5 md:p-7" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "badge" }, "Generated Plan"), /* @__PURE__ */ React.createElement("h3", { className: "cg italic text-2xl mt-2" }, selected.label || "Floor Plan"), /* @__PURE__ */ React.createElement("p", { className: "mono text-[8px] uppercase tracking-widest text-mid mt-1" }, fmt(selected.createdAt))), /* @__PURE__ */ React.createElement("button", { onClick: () => setSelected(null), className: "w-9 h-9 bg-black/6 rounded-full flex items-center justify-center text-lg hover:bg-black/12 transition-colors flex-shrink-0" }, "\xD7")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement(
          "div",
          {
            className: "border border-black/6 rounded-sm overflow-hidden cursor-zoom-in",
            style: { background: "white" },
            onClick: () => setZoomImg(selected.svg)
          },
          /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 px-3 py-2 border-b border-black/5" }, /* @__PURE__ */ React.createElement("span", { style: { width: "5px", height: "5px", borderRadius: "50%", background: "var(--blue)", flexShrink: 0, display: "inline-block" } }), /* @__PURE__ */ React.createElement("span", { className: "mono text-[7px] uppercase tracking-widest text-mid" }, "2D Blueprint"), /* @__PURE__ */ React.createElement("span", { className: "mono text-[7px] text-mid ml-auto opacity-40" }, "\u2922 expand")),
          /* @__PURE__ */ React.createElement("div", { style: { height: "200px", overflow: "hidden", position: "relative", padding: "8px" } }, /* @__PURE__ */ React.createElement(
            "div",
            {
              dangerouslySetInnerHTML: { __html: selected.svg },
              style: {
                width: "200%",
                height: "200%",
                transform: "scale(0.5)",
                transformOrigin: "top left",
                pointerEvents: "none"
              }
            }
          ))
        ), /* @__PURE__ */ React.createElement(
          "div",
          {
            className: "border border-black/6 rounded-sm overflow-hidden flex flex-col",
            style: { background: "#f8f8f8" }
          },
          /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 px-3 py-2 border-b border-black/5" }, /* @__PURE__ */ React.createElement("span", { style: { width: "5px", height: "5px", borderRadius: "50%", background: "var(--gold)", flexShrink: 0, display: "inline-block" } }), /* @__PURE__ */ React.createElement("span", { className: "mono text-[7px] uppercase tracking-widest text-mid" }, "3D Render"), selected.renderImage && /* @__PURE__ */ React.createElement("span", { className: "mono text-[7px] text-mid ml-auto opacity-40" }, "\u2922 expand")),
          selected.renderImage ? /* @__PURE__ */ React.createElement(
            "img",
            {
              src: selected.renderImage,
              alt: "3D render",
              onClick: () => setZoomImg(selected.renderImage),
              className: "cursor-zoom-in",
              style: { width: "100%", height: "200px", objectFit: "cover" }
            }
          ) : /* @__PURE__ */ React.createElement("div", { className: "flex-1 flex flex-col items-center justify-center text-center", style: { height: "200px", opacity: 0.3 } }, /* @__PURE__ */ React.createElement("svg", { className: "w-8 h-8 mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" })), /* @__PURE__ */ React.createElement("p", { className: "mono text-[7px] uppercase tracking-widest" }, "No render yet"))
        )), selected.surveyData && /* @__PURE__ */ React.createElement("div", { className: "mt-4 grid grid-cols-2 md:grid-cols-4 gap-2" }, [
          ["Area", selected.planSpec?.totalAreaSqFt ? `${selected.planSpec.totalAreaSqFt.toLocaleString()} sqft` : "\u2014"],
          ["Stories", selected.surveyData.stories || "\u2014"],
          ["Garage", selected.surveyData.garage || "\u2014"],
          ["Style", (selected.surveyData.budgetTier || "\u2014").split(" ")[0]]
        ].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k, className: "spec-panel" }, /* @__PURE__ */ React.createElement("div", { className: "spec-label" }, k), /* @__PURE__ */ React.createElement("div", { className: "spec-value" }, v)))))
      )
    )), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto max-w-7xl px-5 md:px-10" }, /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-[minmax(0,1fr)_280px] gap-6 items-end mb-10" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "section-label", style: { color: "rgba(10,10,12,0.44)" } }, "Recent sessions"), /* @__PURE__ */ React.createElement("h2", { className: "cg mt-5", style: { fontSize: "clamp(2.2rem,4.8vw,3.6rem)", letterSpacing: "-0.05em", textTransform: "uppercase", lineHeight: 0.94 } }, "Recent sessions, not mockups."), /* @__PURE__ */ React.createElement("p", { className: "text-mid text-sm mt-2" }, "The last 10 plans generated by Keystone AI users \u2014 live from the server.")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 lg:justify-end" }, /* @__PURE__ */ React.createElement("button", { onClick: fetchGallery, className: "cta-secondary flex items-center gap-1.5 px-4 py-3" }, /* @__PURE__ */ React.createElement("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" })), "Refresh"), /* @__PURE__ */ React.createElement("button", { onClick: () => scrollTo("generator"), className: "cta-hero cta-glow-soft px-5 py-3" }, "Open Live Studio"))), loading && /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center py-20 gap-3 text-mid" }, /* @__PURE__ */ React.createElement("div", { className: "w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin" }), /* @__PURE__ */ React.createElement("span", { className: "mono text-[9px] uppercase tracking-widest" }, "Loading gallery...")), !loading && entries.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "paper-panel text-center py-20 px-6" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.3 } }, "+"), /* @__PURE__ */ React.createElement("p", { className: "cg text-2xl opacity-50", style: { letterSpacing: "-0.05em", textTransform: "uppercase" } }, "No recent sessions yet."), /* @__PURE__ */ React.createElement("p", { className: "mono text-[9px] uppercase tracking-widest text-mid mt-2 opacity-50" }, "Be the first - generate a plan above."), /* @__PURE__ */ React.createElement("button", { onClick: () => scrollTo("generator"), className: "cta-hero cta-glow mt-5 px-6 py-3" }, "Open Live Studio")), !loading && entries.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5" }, entries.map((entry, i) => /* @__PURE__ */ React.createElement(
      motion.div,
      {
        key: entry.id,
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { delay: Math.min(i, 4) * 0.06 },
        onClick: () => setSelected(entry),
        className: "group cursor-pointer paper-panel overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
      },
      /* @__PURE__ */ React.createElement("div", { style: { position: "relative", borderBottom: "1px solid rgba(0,0,0,0.05)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: entry.renderImage ? "1fr 1fr" : "1fr", height: "140px", background: "white" } }, /* @__PURE__ */ React.createElement("div", { style: { overflow: "hidden", position: "relative", background: "white", borderRight: entry.renderImage ? "1px solid rgba(0,0,0,0.06)" : "none" } }, /* @__PURE__ */ React.createElement(
        "div",
        {
          dangerouslySetInnerHTML: { __html: entry.svg },
          style: {
            width: "200%",
            height: "200%",
            transform: "scale(0.5)",
            transformOrigin: "top left",
            pointerEvents: "none"
          }
        }
      ), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: "4px", left: "6px" } }, /* @__PURE__ */ React.createElement("span", { className: "mono text-[6px] uppercase tracking-widest opacity-30" }, "Plan"))), entry.renderImage && /* @__PURE__ */ React.createElement("div", { style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement(
        "img",
        {
          src: entry.renderImage,
          alt: "3D",
          style: { width: "100%", height: "140px", objectFit: "cover" }
        }
      ), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: "4px", right: "6px" } }, /* @__PURE__ */ React.createElement("span", { className: "mono text-[6px] uppercase tracking-widest px-1.5 py-0.5 rounded-full font-bold", style: { background: "rgba(181,136,42,0.85)", color: "white" } }, "3D")))), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-blue/0 group-hover:bg-blue/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100" }, /* @__PURE__ */ React.createElement("span", { className: "bg-white/95 px-3 py-1.5 rounded-full shadow-sm mono text-[8px] uppercase tracking-widest text-blue font-bold" }, "View Details"))),
      /* @__PURE__ */ React.createElement("div", { style: { padding: "0.75rem 1rem" } }, /* @__PURE__ */ React.createElement("p", { className: "cg italic text-base leading-tight mb-0.5" }, entry.label || "Custom Plan"), /* @__PURE__ */ React.createElement("p", { className: "mono text-[7px] uppercase tracking-widest text-mid opacity-60" }, fmt(entry.createdAt)))
    ))), !loading && entries.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "text-center mt-10" }, /* @__PURE__ */ React.createElement("p", { className: "mono text-[8px] uppercase tracking-widest text-mid opacity-40" }, "Showing ", entries.length, " most recent \xB7 Auto-refreshes every 30s \xB7 Cleared on server restart"))));
  };
  const DesignGenerator = ({ onOpenModal }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passkeyInput, setPasskeyInput] = useState("");
    const [unlockStatus, setUnlockStatus] = useState("idle");
    const [formData, setFormData] = useState({
      location: "",
      totalArea: "2400",
      stories: "2 Stories",
      bedrooms: "3 Bed",
      bathrooms: "3 Bath",
      privateBaths: "1",
      shape: "Rectangular",
      garage: "1 Car Garage",
      materials: "Craftsman (Wood & Stone)",
      openConcept: "Open Concept (Combined)",
      masterLocation: "Level 2 (Upper)",
      kitchenPlacement: "Rear of House",
      features: "",
      frontFacing: "South",
      lotContext: "Suburban standard lot",
      laundryLocation: "Level 1 (near garage/mud)",
      ceilingHeight: "Standard (9 ft)",
      indoorOutdoor: "Moderate (some connection)",
      naturalLight: "Balanced windows",
      accessibilityNeeds: "None",
      budgetTier: "Mid ($200\u2013300/sqft)",
      freeformWishes: ""
    });
    const [status, setStatus] = useState("idle");
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
      try {
        const s = JSON.parse(localStorage.getItem("keystone_unlock") || "null");
        if (s?.unlocked) setIsUnlocked(true);
      } catch {
      }
    }, []);
    const handleUnlock = async (e) => {
      e.preventDefault();
      const key = (passkeyInput || "").trim();
      if (!key) {
        setUnlockStatus("error:Enter a passkey.");
        return;
      }
      setUnlockStatus("loading");
      try {
        const res = await fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passkey: key }) });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.success) {
          setIsUnlocked(true);
          setUnlockStatus("idle");
          try {
            localStorage.setItem("keystone_unlock", JSON.stringify({ unlocked: true, ts: Date.now() }));
          } catch {
          }
          return;
        }
        setUnlockStatus(`error:${data?.message || "Invalid passkey."}`);
      } catch {
        setUnlockStatus("error:Network error.");
      }
    };
    const handleGeneratePlan = async () => {
      setStatus("loading-plan");
      setShowAlternatives(false);
      try {
        const res = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ surveyData: formData, chatHistory: [] }) });
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
        setStatus("plan-ready");
      } catch (err) {
        alert("Error: " + err.message);
        setStatus("idle");
      }
    };
    const handleRefine = async (instruction) => {
      if (refinementsLeft <= 0) return;
      setStatus("refining");
      setRefinementHistory((prev) => [...prev, { role: "user", content: instruction }]);
      try {
        const res = await fetch("/api/plan/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            surveyData: formData,
            currentPlanSpec: planSpec,
            refinementInstruction: instruction
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        const changes = data.appliedChanges || [];
        const summary = changes.length > 0 ? changes.map((c) => {
          const room = planSpec.levels?.flatMap((l) => l.rooms || []).find((r) => r.id === c.id);
          const name = room?.label || c.id;
          if (c.action === "resize") return `Resized ${name} to ${c.w}\xD7${c.h} ft`;
          if (c.action === "move") return `Moved ${name} to (${c.x}, ${c.y})`;
          if (c.action === "resize_and_move") return `Resized & moved ${name} to ${c.w}\xD7${c.h} ft`;
          return `Updated ${name}`;
        }).join(", ") : `Applied: ${instruction}`;
        setPlanSvg(data.svg);
        setPlanSpec(data.planSpec);
        if (data.galleryId) setGalleryId(data.galleryId);
        setRefinementHistory((prev) => [...prev, { role: "assistant", content: summary }]);
        setRefinementsLeft((prev) => prev - 1);
        setStatus("plan-ready");
      } catch (err) {
        console.error("[refine]", err);
        setRefinementHistory((prev) => [...prev, { role: "error", content: err.message }]);
        setStatus("plan-ready");
      }
    };
    const downloadBlueprint = async () => {
      try {
        const pngUrl = await svgToPngDataUrl(planSvg, {
          background: "#F6F4EF",
          exportWidth: 4096
        });
        const l = document.createElement("a");
        l.href = pngUrl;
        l.download = "Keystone_Blueprint_4K.png";
        document.body.appendChild(l);
        l.click();
        l.remove();
      } catch (err) {
        console.error("[downloadBlueprint]", err);
        alert("Download failed.");
      }
    };
    const isLoading = status === "loading-plan" || status === "refining";
    return /* @__PURE__ */ React.createElement("section", { id: "generator", className: "py-16 md:py-24 px-4 md:px-10", style: { background: "linear-gradient(180deg, #ECE3D3 0%, #F7F2E9 58%, #F3EEE6 100%)" } }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto max-w-7xl" }, /* @__PURE__ */ React.createElement(AnimatePresence, null, zoomImage && /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: () => setZoomImage(null),
        className: "fixed inset-0 z-[200] bg-ink/93 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out"
      },
      typeof zoomImage === "string" && zoomImage.startsWith("<svg") ? /* @__PURE__ */ React.createElement("div", { className: "bg-white p-4 md:p-8 max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl rounded-sm", dangerouslySetInnerHTML: { __html: zoomImage } }) : /* @__PURE__ */ React.createElement("img", { src: zoomImage, className: "max-h-[90vh] max-w-full object-contain rounded-sm", alt: "Zoom" }),
      /* @__PURE__ */ React.createElement("button", { className: "absolute top-4 right-4 text-white/40 hover:text-white text-4xl font-light" }, "\xD7")
    )), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-[minmax(0,1fr)_290px] gap-8 items-end mb-10" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "section-label", style: { color: "rgba(10,10,12,0.44)" } }, "Live studio"), /* @__PURE__ */ React.createElement("h2", { className: "cg mt-6", style: { fontSize: "clamp(2.8rem, 6vw, 5rem)", letterSpacing: "-0.06em", textTransform: "uppercase", lineHeight: 0.9 } }, "Open the workflow your clients will actually feel."), /* @__PURE__ */ React.createElement("p", { className: "text-mid mt-4 text-base max-w-2xl leading-relaxed" }, "Five guided steps become a floor plan, a refinement trail, and a 3D exterior study. The goal is not novelty. It is a stronger first meeting.")), /* @__PURE__ */ React.createElement("div", { className: "dream-panel p-5 md:p-6" }, /* @__PURE__ */ React.createElement("div", { className: "mono text-[10px] uppercase tracking-[0.24em]", style: { color: "rgba(244,239,230,0.46)" } }, "Session promise"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3 mt-5" }, /* @__PURE__ */ React.createElement("div", { className: "studio-metric" }, /* @__PURE__ */ React.createElement("strong", null, "<60s"), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] uppercase tracking-[0.18em]", style: { color: "rgba(244,239,230,0.5)" } }, "first plan")), /* @__PURE__ */ React.createElement("div", { className: "studio-metric" }, /* @__PURE__ */ React.createElement("strong", null, "10"), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] uppercase tracking-[0.18em]", style: { color: "rgba(244,239,230,0.5)" } }, "refinements"))))), !isUnlocked && /* @__PURE__ */ React.createElement("div", { className: "dream-panel max-w-xl mx-auto mb-8 p-8 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-11 h-11 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4" }, /* @__PURE__ */ React.createElement("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }))), /* @__PURE__ */ React.createElement("h3", { className: "cg text-2xl mb-1 text-white", style: { letterSpacing: "-0.05em", textTransform: "uppercase" } }, "Private access"), /* @__PURE__ */ React.createElement("p", { className: "mono text-[8px] uppercase tracking-widest mb-5", style: { color: "rgba(244,239,230,0.46)" } }, "Passkey required"), /* @__PURE__ */ React.createElement("form", { onSubmit: handleUnlock, className: "space-y-3" }, /* @__PURE__ */ React.createElement("input", { type: "password", placeholder: "Enter passkey", className: "text-center tracking-[0.2em]", value: passkeyInput, onChange: (e) => setPasskeyInput(e.target.value), required: true, style: { background: "rgba(255,255,255,0.92)", borderColor: "rgba(255,255,255,0.2)" } }), /* @__PURE__ */ React.createElement("button", { type: "submit", disabled: unlockStatus === "loading", className: "cta-hero cta-glow w-full" }, unlockStatus === "loading" ? "Verifying..." : "Unlock Live Studio")), unlockStatus.startsWith("error:") && /* @__PURE__ */ React.createElement("p", { className: "mt-3 mono text-[9px] uppercase font-bold text-red" }, unlockStatus.replace("error:", "")), /* @__PURE__ */ React.createElement("div", { className: "mt-5 pt-4 border-t border-white/10" }, /* @__PURE__ */ React.createElement("p", { className: "text-[11px]", style: { color: "rgba(244,239,230,0.6)" } }, "Need a passkey first?"), /* @__PURE__ */ React.createElement("button", { onClick: onOpenModal, className: "mt-3 cta-hero cta-glow-soft" }, "Request Access"))), /* @__PURE__ */ React.createElement("div", { className: `grid lg:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start transition-all ${!isUnlocked ? "opacity-15 pointer-events-none blur-sm select-none" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "paper-panel w-full p-6 md:p-7" }, /* @__PURE__ */ React.createElement(SurveyForm, { formData, setFormData, onSubmit: handleGeneratePlan, isLoading })), /* @__PURE__ */ React.createElement("div", { className: "dream-panel w-full flex flex-col overflow-hidden", style: { minHeight: "520px" } }, status === "idle" && /* @__PURE__ */ React.createElement("div", { className: "flex-1 flex flex-col items-center justify-center p-12 text-center", style: { color: "rgba(244,239,230,0.42)" } }, /* @__PURE__ */ React.createElement("svg", { className: "w-16 h-16 mb-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1", d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" })), /* @__PURE__ */ React.createElement("p", { className: "cg text-2xl text-white", style: { letterSpacing: "-0.05em", textTransform: "uppercase" } }, "Awaiting your brief"), /* @__PURE__ */ React.createElement("p", { className: "mono text-[9px] uppercase tracking-widest mt-2" }, "Complete the survey to generate the first plan")), isLoading && /* @__PURE__ */ React.createElement("div", { className: "flex-1 flex flex-col items-center justify-center p-12 text-white" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 border-[3px] border-blue border-t-transparent rounded-full animate-spin mb-6" }), /* @__PURE__ */ React.createElement("p", { className: "mono text-[10px] uppercase tracking-widest animate-pulse text-blue" }, status === "refining" ? "Applying refinement..." : "Generating floor plan..."), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] mt-2", style: { color: "rgba(244,239,230,0.5)" } }, "Usually under 5 seconds")), (status === "plan-ready" || status === "refining") && planSvg && /* @__PURE__ */ React.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 border-b border-white/8", style: { background: "rgba(255,255,255,0.04)" } }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-2.5" }, /* @__PURE__ */ React.createElement("span", { className: "mono text-[7px] uppercase tracking-widest bg-white border border-black/6 px-2 py-1 rounded-sm" }, "2D Blueprint"), /* @__PURE__ */ React.createElement("button", { onClick: downloadBlueprint, className: "mono text-[7px] uppercase tracking-widest bg-blue text-white px-2 py-1 rounded-sm hover:bg-ink transition-colors" }, "Download"), alternatives.length > 0 && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setShowAlternatives(true),
        className: "mono text-[7px] uppercase tracking-widest bg-white border border-black/15 px-2 py-1 rounded-sm hover:border-blue hover:text-blue transition-colors"
      },
      "See Other Generations (",
      alternatives.length,
      ")"
    ), /* @__PURE__ */ React.createElement("button", { onClick: () => setZoomImage(planSvg), className: "ml-auto mono text-[7px] uppercase tracking-widest text-mid hover:text-ink" }, "Expand")), footprintInfo && /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "mono text-[7px] text-mid" }, "Best of ", 1 + alternatives.length, " - ", footprintInfo.widthFt, " x ", footprintInfo.heightFt, " ft - ratio ", footprintInfo.aspectRatio.toFixed(2), planScore !== null && /* @__PURE__ */ React.createElement("span", { className: "ml-2 text-blue" }, "score ", planScore, "/110"))), /* @__PURE__ */ React.createElement("div", { className: "w-full overflow-auto cursor-zoom-in bg-white rounded-[14px]", onClick: () => setZoomImage(planSvg), dangerouslySetInnerHTML: { __html: planSvg } })), /* @__PURE__ */ React.createElement("div", { className: "px-5" }, /* @__PURE__ */ React.createElement(PlanSummaryPanel, { planSpec })), /* @__PURE__ */ React.createElement(RefinementPanel, { planSpec, formData, refinementsLeft, refinementHistory, onRefine: handleRefine, isLoading }), /* @__PURE__ */ React.createElement("div", { className: "p-5 border-t border-white/8", style: { background: "rgba(255,255,255,0.04)" } }, /* @__PURE__ */ React.createElement(Render3DPanel, { planSpec, formData, planSvg, galleryId, onRenderReady: (img) => setZoomImage(img) }))), showAlternatives && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[200] flex items-center justify-center p-4", style: { background: "rgba(0,0,0,0.7)" } }, /* @__PURE__ */ React.createElement("div", { className: "bg-paper rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between p-4 border-b border-black/10" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-semibold text-sm" }, "Other Generated Plans"), /* @__PURE__ */ React.createElement("p", { className: "mono text-[8px] text-mid mt-0.5 uppercase tracking-widest" }, alternatives.length, " alternative footprints - click any to use it")), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowAlternatives(false), className: "w-8 h-8 flex items-center justify-center rounded hover:bg-black/8 text-mid hover:text-ink transition-colors" }, /* @__PURE__ */ React.createElement("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })))), /* @__PURE__ */ React.createElement("div", { className: "overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-4" }, alternatives.map((alt, i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        className: "border border-black/10 rounded-lg overflow-hidden cursor-pointer hover:border-blue hover:shadow-md transition-all group",
        onClick: () => {
          setPlanSvg(alt.svg);
          setPlanSpec(alt.planSpec);
          setPlanScore(alt.score);
          setFootprintInfo(alt.footprintInfo);
          const newAlts = [
            { svg: planSvg, planSpec, score: planScore, footprintInfo },
            ...alternatives.filter((_, j) => j !== i)
          ].filter((a) => a.svg);
          setAlternatives(newAlts);
          setShowAlternatives(false);
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "bg-white p-2 overflow-hidden", style: { maxHeight: "180px" }, dangerouslySetInnerHTML: { __html: alt.svg || '<p style="padding:20px;color:#999;font-size:11px">Preview unavailable</p>' } }),
      /* @__PURE__ */ React.createElement("div", { className: "p-2 bg-paper/60 border-t border-black/5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "mono text-[7px] text-mid" }, alt.footprintInfo ? `${alt.footprintInfo.widthFt} x ${alt.footprintInfo.heightFt} ft` : `Option ${i + 2}`), alt.footprintInfo && /* @__PURE__ */ React.createElement("span", { className: "mono text-[7px] text-mid" }, "ratio ", alt.footprintInfo.aspectRatio?.toFixed(2))), alt.score !== void 0 && /* @__PURE__ */ React.createElement("div", { className: "mt-1 h-1 bg-black/8 rounded-full overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "h-full bg-blue/60 rounded-full transition-all", style: { width: `${Math.min(100, alt.score / 110 * 100)}%` } })), /* @__PURE__ */ React.createElement("p", { className: "mono text-[7px] text-blue mt-1 group-hover:text-ink" }, alt.score !== void 0 ? `Score ${alt.score}/110` : "", " - Click to use"))
    ))), /* @__PURE__ */ React.createElement("div", { className: "p-3 border-t border-black/10 bg-paper/40" }, /* @__PURE__ */ React.createElement("p", { className: "mono text-[7px] text-mid text-center" }, "The first plan shown is the highest-scoring design. Others are alternative footprints."))))))));
  };
  const DreamApp = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [heroVisible, setHeroVisible] = useState(true);
    const featuredWorks = [
      {
        eyebrow: "Selected output 01",
        title: "House warmth, visualized early.",
        body: "Keystone gives a residential brief enough atmosphere to feel real before the first billable session begins.",
        image: ASSETS.exampleRender,
        alt: "Keystone generated exterior concept"
      },
      {
        eyebrow: "Selected output 02",
        title: "Plans that start conversations.",
        body: "Room priorities, area targets, and site cues become a working plan your team can critique instead of sketch from zero.",
        image: ASSETS.exampleBlueprint,
        alt: "Keystone generated blueprint"
      },
      {
        eyebrow: "Selected output 03",
        title: "Client taste, translated cleanly.",
        body: "The intake experience captures mood, material, light, and footprint intent in a way clients actually enjoy completing.",
        image: ASSETS.phase3[4],
        alt: "Keystone client experience preview"
      }
    ];
    const outcomeCards = [
      {
        eyebrow: "Before the meeting",
        title: "A clearer client arrives.",
        body: "Taste, light, priorities, and rough footprint intent are already translated into something your team can react to together.",
        stat: "1 intake"
      },
      {
        eyebrow: "Inside the studio",
        title: "The blank page disappears.",
        body: "Instead of starting from a vague conversation, your team begins with a plan, a mood study, and a refinement trail worth discussing.",
        stat: "<60s"
      },
      {
        eyebrow: "Across the pipeline",
        title: "Early hours stay protected.",
        body: "Keystone helps firms qualify seriousness faster, save unpaid exploration time, and move active leads into real design momentum.",
        stat: "10 rounds"
      }
    ];
    const marqueeItems = [
      "Architect-first discovery",
      "Live floor plan generation",
      "Fast 3D exterior studies",
      "10 refinement rounds included",
      "Pay-as-you-go for firms",
      "Client-ready visual anchors"
    ];
    const serviceCards = [
      {
        number: "01",
        title: "Client-facing discovery",
        body: "Send a passkey-backed link before the first meeting. Keystone captures taste, footprint, room priorities, and lot cues with surprising clarity."
      },
      {
        number: "02",
        title: "Generative floor planning",
        body: "Survey answers become a scored footprint, a room schedule, and a blueprint PNG your team can refine instead of invent from scratch."
      },
      {
        number: "03",
        title: "Atmospheric visualization",
        body: "Every strong concept deserves mood. Keystone pairs the plan with a quick exterior study so clients react to something tangible, not abstraction."
      }
    ];
    const studioMetrics = [
      { value: "<60s", label: "to a first plan" },
      { value: "10", label: "refinements included" },
      { value: "2D + 3D", label: "paired outputs every session" },
      { value: "Pay as needed", label: "no dead-month subscription" }
    ];
    const sessionStack = [
      "Five-step residential intake",
      "Scored footprint alternatives",
      "Blueprint PNG export",
      "Room-by-room refinement log",
      "Lighting and mood variations",
      "Recent-session gallery proof"
    ];
    const studioTeam = [
      {
        name: "Sujan Acharya",
        role: "Founder and CEO",
        image: ASSETS.team.sujan,
        bio: "Civil engineering and construction management background. Built Keystone after watching firms lose weekends to unpaid discovery work."
      },
      {
        name: "Rhythm Bhattarai",
        role: "CTO",
        image: ASSETS.team.rhythm,
        bio: "Civil engineer, researcher, and full-stack builder shaping the system that turns survey logic into plan logic."
      },
      {
        name: "Subrat Acharya",
        role: "CFO",
        image: ASSETS.team.subrat,
        bio: "Financial operator focused on keeping Keystone rigorous, durable, and built for steady studio adoption."
      }
    ];
    const roadmapCards = [
      "DWG export for downstream drafting",
      "White-label studio branding",
      "CRM handoff for qualified leads",
      "Preliminary cost range overlays"
    ];
    const quoteCards = [
      {
        quote: "I've been waiting for something like this for years. Showing a client a visual anchor before our first meeting changes the entire tone of discovery.",
        name: "M. Torres",
        firm: "Principal, residential studio in Austin"
      },
      {
        quote: "The floor plan quality surprised me. It already feels like a smarter way to qualify taste, space, and seriousness before we ever open our notebooks.",
        name: "R. Patel",
        firm: "Senior architect in Dallas"
      }
    ];
    const pricingTiers = [
      {
        tag: "Free demo",
        price: "$0",
        unit: "for qualified firms",
        desc: "One guided session, 10 refinements, and a full exterior study so your team can feel the workflow in a real project context.",
        cta: "Request Access",
        featured: false
      },
      {
        tag: "Single session",
        price: "$149",
        unit: "per live run",
        desc: "A complete Keystone session for an active lead. Fast enough for early qualification, strong enough for a serious first meeting.",
        cta: "Open Live Studio",
        featured: true
      },
      {
        tag: "Studio pack",
        price: "$1,199",
        unit: "10 sessions",
        desc: "For studios turning Keystone into part of their intake rhythm. Lower per-session cost and a cleaner pipeline for active projects.",
        cta: "Request Access",
        featured: false
      }
    ];
    useEffect(() => {
      const hero = document.getElementById("hero");
      if (!hero) return;
      const obs = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0.1 });
      obs.observe(hero);
      return () => obs.disconnect();
    }, []);
    return /* @__PURE__ */ React.createElement("div", { className: "selection:bg-blue selection:text-white pb-[60px] md:pb-0" }, /* @__PURE__ */ React.createElement(JoinModal, { isOpen: isModalOpen, onClose: () => setModalOpen(false) }), /* @__PURE__ */ React.createElement(MobileNavBar, { onOpenMenu: () => setMenuOpen(true) }), /* @__PURE__ */ React.createElement(MobileMenuOverlay, { isOpen: isMenuOpen, onClose: () => setMenuOpen(false), onJoin: () => setModalOpen(true) }), /* @__PURE__ */ React.createElement(AnimatePresence, null, !heroVisible && /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
        className: "mobile-cta-float md:hidden"
      },
      /* @__PURE__ */ React.createElement("button", { onClick: () => scrollTo("generator"), className: "cta-hero cta-glow px-6 py-3 text-sm" }, "Open Live Studio")
    )), /* @__PURE__ */ React.createElement(motion.main, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.45 } }, /* @__PURE__ */ React.createElement(
      "nav",
      {
        className: "fixed top-0 w-full z-40 h-[64px] flex items-center justify-between px-5 md:px-10",
        style: { background: "rgba(245,240,233,0.84)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(9,9,9,0.08)" }
      },
      /* @__PURE__ */ React.createElement("a", { href: "#hero", className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("img", { src: ASSETS.icon, alt: "Keystone", style: { width: "30px", height: "30px" } }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "cg text-[1.2rem] leading-none uppercase tracking-[-0.05em]", style: { color: "var(--ink)" } }, "Keystone"), /* @__PURE__ */ React.createElement("div", { className: "mono text-[8px] uppercase tracking-[0.22em] mt-1", style: { color: "rgba(9,9,9,0.42)" } }, "AI studio"))),
      /* @__PURE__ */ React.createElement("div", { className: "hidden md:flex items-center gap-8 mono text-[11px] uppercase tracking-[0.26em]", style: { color: "rgba(9,9,9,0.54)" } }, [["Work", "work"], ["Services", "services"], ["Pricing", "pricing"], ["Studio", "studio"], ["Live Studio", "generator"], ["Sessions", "gallery"]].map(([label, id]) => /* @__PURE__ */ React.createElement("a", { key: id, href: `#${id}`, className: "transition-colors hover:text-black" }, label)), /* @__PURE__ */ React.createElement("button", { onClick: () => setModalOpen(true), className: "cta-hero cta-glow-soft px-5 py-3 text-[11px]" }, "Request Access"))
    ), /* @__PURE__ */ React.createElement("section", { id: "hero", className: "relative overflow-hidden", style: { minHeight: "92svh", paddingTop: "74px", background: "linear-gradient(180deg, #FFFDF9 0%, #F5F0E9 100%)" } }, /* @__PURE__ */ React.createElement("div", { className: "hero-video-shell" }, /* @__PURE__ */ React.createElement("div", { className: "hero-video-base" }), /* @__PURE__ */ React.createElement("div", { className: "hero-video-wave orange" }), /* @__PURE__ */ React.createElement("div", { className: "hero-video-wave soft" }), /* @__PURE__ */ React.createElement("div", { className: "hero-video-wave sand" }), /* @__PURE__ */ React.createElement("div", { className: "hero-video-mesh" }), /* @__PURE__ */ React.createElement("div", { className: "hero-video-scan" })), /* @__PURE__ */ React.createElement("div", { className: "dream-grid absolute inset-0 opacity-80" }), /* @__PURE__ */ React.createElement("div", { className: "hero-glow", style: { top: "-12%", width: "780px", height: "780px", background: "radial-gradient(circle, rgba(255,106,55,0.14), transparent 72%)" } }), /* @__PURE__ */ React.createElement("div", { className: "hero-glow-red", style: { bottom: "10%", right: "4%", width: "520px", height: "520px", background: "radial-gradient(circle, rgba(216,208,196,0.52), transparent 72%)" } }), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto max-w-7xl px-5 md:px-10 relative z-10" }, /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-[minmax(0,1.08fr)_380px] gap-8 lg:gap-10 items-start min-h-[calc(72svh-64px)] pt-3 pb-10 md:pt-5 md:pb-16" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(motion.span, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, className: "section-label" }, "Keystone AI Studio / architect-first discovery"), /* @__PURE__ */ React.createElement(
      motion.h1,
      {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.24 },
        className: "cg mt-5 leading-[0.84]",
        style: { fontSize: "clamp(3.45rem, 8vw, 7.2rem)", letterSpacing: "-0.06em", textTransform: "uppercase", color: "var(--ink)" }
      },
      /* @__PURE__ */ React.createElement("span", { className: "block" }, "Build the"),
      /* @__PURE__ */ React.createElement("span", { className: "block", style: { color: "var(--ink)" } }, "feeling of home"),
      /* @__PURE__ */ React.createElement("span", { className: "block", style: { color: "rgba(78,69,61,0.62)" } }, "before the first meeting.")
    ), /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.56 },
        className: "mt-7 flex flex-col sm:flex-row gap-3 items-start"
      },
      /* @__PURE__ */ React.createElement("button", { onClick: () => scrollTo("generator"), className: "cta-hero cta-glow cta-live" }, /* @__PURE__ */ React.createElement("span", null, "Open Live Studio"), /* @__PURE__ */ React.createElement("span", { className: "cta-live-mark" }, /* @__PURE__ */ React.createElement("span", { className: "cta-live-dot" }), "Try it now")),
      /* @__PURE__ */ React.createElement("button", { onClick: () => setModalOpen(true), className: "cta-hero cta-glow-soft" }, "Request Access")
    ), /* @__PURE__ */ React.createElement(
      motion.p,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { delay: 0.4 },
        className: "mt-5 max-w-[46rem] leading-relaxed",
        style: { fontSize: "clamp(1rem, 1.9vw, 1.16rem)", color: "rgba(32,26,21,0.72)" }
      },
      "Keystone turns an early, half-formed client dream into a generated floor plan, a cinematic exterior study, and a clearer place for your studio to begin."
    ), /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { delay: 0.72 },
        className: "mt-5 flex flex-wrap gap-3"
      },
      ["Architect intake that feels premium", "First plan in under a minute", "3D study included"].map((item) => /* @__PURE__ */ React.createElement("span", { key: item, className: "marquee-pill", style: { animation: "none", background: "rgba(255,255,255,0.68)", borderColor: "rgba(10,10,12,0.08)", color: "rgba(10,10,12,0.72)" } }, item))
    )), /* @__PURE__ */ React.createElement(
      motion.aside,
      {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        transition: { delay: 0.42 },
        className: "dream-panel p-5 md:p-6 relative overflow-hidden"
      },
      /* @__PURE__ */ React.createElement("div", { className: "absolute inset-x-0 top-0 h-px", style: { background: "rgba(255,255,255,0.12)" } }),
      /* @__PURE__ */ React.createElement("span", { className: "section-label", style: { color: "rgba(245,240,233,0.58)" } }, "Inside the room"),
      /* @__PURE__ */ React.createElement("h2", { className: "cg text-white mt-4", style: { fontSize: "clamp(1.9rem,3.4vw,2.8rem)", lineHeight: 0.92, textTransform: "uppercase", letterSpacing: "-0.05em" } }, "A first pass that already feels worth discussing."),
      /* @__PURE__ */ React.createElement("p", { className: "mt-3 text-sm leading-relaxed", style: { color: "rgba(244,239,230,0.64)" } }, "Clients arrive with something they can point to. Your team arrives with something they can shape."),
      /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3 mt-6" }, studioMetrics.map((metric) => /* @__PURE__ */ React.createElement("div", { key: metric.label, className: "studio-metric" }, /* @__PURE__ */ React.createElement("strong", null, metric.value), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] uppercase tracking-[0.18em]", style: { color: "rgba(244,239,230,0.5)" } }, metric.label)))),
      /* @__PURE__ */ React.createElement("div", { className: "mt-5 pt-4 border-t border-white/10" }, /* @__PURE__ */ React.createElement("p", { className: "mono text-[10px] uppercase tracking-[0.22em]", style: { color: "rgba(244,239,230,0.5)" } }, "What a session holds"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 mt-3" }, ["2D blueprint", "3D exterior study", "Refinement history", "Passkey access"].map((item) => /* @__PURE__ */ React.createElement("span", { key: item, className: "stack-pill text-[12px]" }, item))))
    )))), /* @__PURE__ */ React.createElement("section", { className: "proof-shelf" }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto max-w-7xl px-5 md:px-10" }, /* @__PURE__ */ React.createElement("div", { className: "proof-frame p-4 md:p-6" }, /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-[300px_minmax(0,1fr)] gap-5 items-start" }, /* @__PURE__ */ React.createElement("div", { className: "p-2 md:p-4" }, /* @__PURE__ */ React.createElement("span", { className: "section-label", style: { color: "rgba(10,10,12,0.44)" } }, "Sample session"), /* @__PURE__ */ React.createElement("h2", { className: "cg mt-5", style: { fontSize: "clamp(2.1rem, 4.6vw, 3.8rem)", lineHeight: 0.92, letterSpacing: "-0.05em", textTransform: "uppercase" } }, "Real output. No imagination tax."), /* @__PURE__ */ React.createElement("p", { className: "mt-4 text-sm md:text-base leading-relaxed", style: { color: "rgba(10,10,12,0.62)" } }, "The quickest way to trust Keystone is to watch one intake become the plan and the mood study side by side. This is the proof layer the hero was missing."), /* @__PURE__ */ React.createElement("div", { className: "grid gap-3 mt-5" }, ["One intake becomes two outputs", "Enough detail to react to before the paid meeting", "A stronger first conversation for both firm and client"].map((item) => /* @__PURE__ */ React.createElement("div", { key: item, className: "proof-mini-tile" }, /* @__PURE__ */ React.createElement("div", { className: "mono text-[10px] uppercase tracking-[0.22em]", style: { color: "rgba(10,10,12,0.44)" } }, "Why it lands"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-sm leading-relaxed", style: { color: "rgba(10,10,12,0.78)" } }, item)))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 flex flex-wrap gap-3" }, /* @__PURE__ */ React.createElement("button", { onClick: () => scrollTo("generator"), className: "cta-hero cta-glow" }, "Open Live Studio"), /* @__PURE__ */ React.createElement("button", { onClick: () => setModalOpen(true), className: "cta-secondary" }, "Request Access"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-[1.02fr_0.98fr] gap-4" }, /* @__PURE__ */ React.createElement(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.3 } }, /* @__PURE__ */ React.createElement("div", { className: "proof-browser" }, /* @__PURE__ */ React.createElement("div", { className: "proof-browser-top" }, /* @__PURE__ */ React.createElement("div", { className: "bc-dot", style: { background: "#FF5F57" } }), /* @__PURE__ */ React.createElement("div", { className: "bc-dot", style: { background: "#FFBD2E" } }), /* @__PURE__ */ React.createElement("div", { className: "bc-dot", style: { background: "#28C840" } }), /* @__PURE__ */ React.createElement("span", { className: "mono text-[8px] ml-3", style: { color: "rgba(255,255,255,0.32)", letterSpacing: "0.16em" } }, "KEYSTONE AI / 2D FLOOR PLAN")), /* @__PURE__ */ React.createElement("div", { className: "proof-browser-screen plan" }, /* @__PURE__ */ React.createElement("div", { className: "diagonal-accent" }), /* @__PURE__ */ React.createElement("img", { src: ASSETS.exampleBlueprint, alt: "Keystone sample floor plan", style: { width: "100%", display: "block", objectFit: "contain" } })), /* @__PURE__ */ React.createElement("div", { className: "proof-caption" }, /* @__PURE__ */ React.createElement("span", { className: "proof-dot", style: { background: "var(--blue)" } }), "Client footprint translated into a working blueprint"))), /* @__PURE__ */ React.createElement(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.3 }, transition: { delay: 0.08 } }, /* @__PURE__ */ React.createElement("div", { className: "proof-browser" }, /* @__PURE__ */ React.createElement("div", { className: "proof-browser-top" }, /* @__PURE__ */ React.createElement("div", { className: "bc-dot", style: { background: "#FF5F57" } }), /* @__PURE__ */ React.createElement("div", { className: "bc-dot", style: { background: "#FFBD2E" } }), /* @__PURE__ */ React.createElement("div", { className: "bc-dot", style: { background: "#28C840" } }), /* @__PURE__ */ React.createElement("span", { className: "mono text-[8px] ml-3", style: { color: "rgba(255,255,255,0.32)", letterSpacing: "0.16em" } }, "KEYSTONE AI / 3D EXTERIOR STUDY")), /* @__PURE__ */ React.createElement("div", { className: "proof-browser-screen", style: { minHeight: "100%" } }, /* @__PURE__ */ React.createElement("img", { src: ASSETS.exampleRender, alt: "Keystone sample exterior study", style: { width: "100%", height: "100%", minHeight: "320px", objectFit: "cover", display: "block" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(9,9,9,0.02) 0%, rgba(9,9,9,0.48) 100%)" } }), /* @__PURE__ */ React.createElement("div", { className: "proof-caption", style: { position: "absolute", left: 0, right: 0, bottom: 0, borderTop: "none", color: "rgba(255,255,255,0.72)", background: "linear-gradient(180deg, transparent, rgba(9,9,9,0.58))" } }, /* @__PURE__ */ React.createElement("span", { className: "proof-dot", style: { background: "var(--gold)" } }), "The same brief, now felt as atmosphere"))))), /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-3 gap-3 mt-4" }, featuredWorks.map((item, index) => /* @__PURE__ */ React.createElement(
      motion.article,
      {
        key: item.eyebrow,
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { delay: index * 0.08 },
        className: "proof-mini-tile"
      },
      /* @__PURE__ */ React.createElement("div", { className: "mono text-[10px] uppercase tracking-[0.22em]", style: { color: "rgba(10,10,12,0.44)" } }, item.eyebrow),
      /* @__PURE__ */ React.createElement("h3", { className: "cg mt-3 text-[1.3rem] leading-[0.98]", style: { color: "var(--ink)" } }, item.title),
      /* @__PURE__ */ React.createElement("p", { className: "mt-3 text-sm leading-relaxed", style: { color: "rgba(10,10,12,0.62)" } }, item.body)
    )))))))), /* @__PURE__ */ React.createElement("section", { className: "py-14 md:py-16", style: { background: "var(--paper)" } }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto max-w-6xl px-5 md:px-10" }, /* @__PURE__ */ React.createElement("div", { className: "paper-panel p-7 md:p-10" }, /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-[minmax(0,1fr)_220px] gap-8 items-end" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "section-label", style: { color: "rgba(9,9,9,0.42)" } }, "Live studio"), /* @__PURE__ */ React.createElement("h2", { className: "cg mt-6", style: { fontSize: "clamp(2.6rem, 6vw, 4.8rem)", lineHeight: 0.9, letterSpacing: "-0.05em", textTransform: "uppercase", color: "var(--ink)" } }, "Try the real workflow, not a teaser."), /* @__PURE__ */ React.createElement("p", { className: "mt-5 max-w-2xl text-base leading-relaxed", style: { color: "rgba(9,9,9,0.62)" } }, "The same product logic behind the hero is right below. Open the live studio, shape a plan, refine it, and compare it against recent sessions from the server.")), /* @__PURE__ */ React.createElement("button", { onClick: () => scrollTo("generator"), className: "cta-hero cta-glow cta-live w-full lg:w-auto justify-self-start lg:justify-self-end" }, /* @__PURE__ */ React.createElement("span", null, "Open Live Studio"), /* @__PURE__ */ React.createElement("span", { className: "cta-live-mark" }, /* @__PURE__ */ React.createElement("span", { className: "cta-live-dot" }), "Try it now")))))), /* @__PURE__ */ React.createElement(DesignGenerator, { onOpenModal: () => setModalOpen(true) }), /* @__PURE__ */ React.createElement(Gallery, { onOpenModal: () => setModalOpen(true) }), /* @__PURE__ */ React.createElement("section", { className: "relative py-5 border-y", style: { background: "var(--paper)", borderColor: "rgba(9,9,9,0.08)" } }, /* @__PURE__ */ React.createElement("div", { className: "marquee-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "marquee-track px-5 md:px-10" }, [...marqueeItems, ...marqueeItems].map((item, index) => /* @__PURE__ */ React.createElement("span", { key: `${item}-${index}`, className: "marquee-pill" }, item))))), /* @__PURE__ */ React.createElement("section", { id: "work", className: "py-16 md:py-20", style: { background: "var(--paper)" } }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto max-w-7xl px-5 md:px-10" }, /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 items-end mb-10 md:mb-12" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "section-label" }, "What changes"), /* @__PURE__ */ React.createElement("h2", { className: "cg mt-6", style: { fontSize: "clamp(2.8rem, 7vw, 5.8rem)", lineHeight: 0.9, letterSpacing: "-0.05em", textTransform: "uppercase", color: "var(--ink)" } }, "The point is not more content. It is better first conversations.")), /* @__PURE__ */ React.createElement("p", { className: "text-sm md:text-base leading-relaxed", style: { color: "rgba(9,9,9,0.58)" } }, "Keystone works when the client, the architect, and the next decision all feel less vague. These are the shifts the product is built to create.")), /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-3 gap-4" }, outcomeCards.map((item, index) => /* @__PURE__ */ React.createElement(
      motion.article,
      {
        key: item.eyebrow,
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { delay: index * 0.08 },
        className: "paper-panel p-6 md:p-7 flex flex-col justify-between min-h-[300px]"
      },
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "mono text-[10px] uppercase tracking-[0.22em]", style: { color: "rgba(10,10,12,0.44)" } }, item.eyebrow), /* @__PURE__ */ React.createElement("h3", { className: "cg mt-5 text-[2rem] leading-[0.94]", style: { color: "var(--ink)" } }, item.title), /* @__PURE__ */ React.createElement("p", { className: "mt-5 text-sm leading-relaxed", style: { color: "rgba(10,10,12,0.66)" } }, item.body)),
      /* @__PURE__ */ React.createElement("div", { className: "mt-10 pt-5", style: { borderTop: "1px solid rgba(10,10,12,0.08)" } }, /* @__PURE__ */ React.createElement("div", { className: "mono text-[10px] uppercase tracking-[0.22em]", style: { color: "rgba(27,79,130,0.72)" } }, "Keystone signal"), /* @__PURE__ */ React.createElement("div", { className: "cg mt-3 text-[2.4rem] leading-none", style: { letterSpacing: "-0.06em", color: "var(--ink)" } }, item.stat))
    ))))), /* @__PURE__ */ React.createElement("section", { id: "services", className: "py-16 md:py-20", style: { background: "linear-gradient(180deg, #ECE3D3 0%, #F7F2E9 60%, #F0EBE1 100%)", color: "var(--ink)" } }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto max-w-7xl px-5 md:px-10" }, /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-[minmax(0,1fr)_320px] gap-12 items-end" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "section-label", style: { color: "rgba(10,10,12,0.45)" } }, "Services"), /* @__PURE__ */ React.createElement("h2", { className: "cg mt-6", style: { fontSize: "clamp(2.8rem, 7vw, 5.4rem)", lineHeight: 0.9, letterSpacing: "-0.05em", textTransform: "uppercase" } }, "A calmer way to move from curiosity to design intent.")), /* @__PURE__ */ React.createElement("p", { className: "text-sm md:text-base leading-relaxed text-mid" }, "Keystone is not trying to replace architectural judgment. It removes the blank page at the exact moment firms are most exposed to wasted time.")), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 mt-10 items-start" }, /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-3 gap-5 self-start" }, serviceCards.map((card, index) => /* @__PURE__ */ React.createElement(
      motion.div,
      {
        key: card.number,
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { delay: index * 0.08 },
        className: "service-card-dream p-6 md:p-7 self-start"
      },
      /* @__PURE__ */ React.createElement("div", { className: "mono text-[10px] uppercase tracking-[0.24em]", style: { color: "rgba(27,79,130,0.7)" } }, card.number),
      /* @__PURE__ */ React.createElement("h3", { className: "cg mt-5 text-[2rem] leading-[0.96]" }, card.title),
      /* @__PURE__ */ React.createElement("p", { className: "mt-4 text-sm leading-relaxed", style: { color: "var(--mid)" } }, card.body)
    ))), /* @__PURE__ */ React.createElement("div", { className: "paper-panel p-6 md:p-7 self-start" }, /* @__PURE__ */ React.createElement("div", { className: "mono text-[10px] uppercase tracking-[0.24em]", style: { color: "rgba(27,79,130,0.7)" } }, "Inside every session"), /* @__PURE__ */ React.createElement("h3", { className: "cg mt-5 text-[2.1rem] leading-[0.95]" }, "The studio stack clients never see, but your team will feel."), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 mt-6" }, sessionStack.map((item) => /* @__PURE__ */ React.createElement("span", { key: item, className: "px-4 py-3 rounded-full text-sm", style: { border: "1px solid rgba(10,10,12,0.08)", background: "rgba(255,255,255,0.7)", color: "var(--mid)", borderRadius: "999px" } }, item))), /* @__PURE__ */ React.createElement("div", { className: "mt-8 pt-6", style: { borderTop: "1px solid rgba(10,10,12,0.08)" } }, /* @__PURE__ */ React.createElement("div", { className: "mono text-[10px] uppercase tracking-[0.24em]", style: { color: "rgba(110,106,102,0.68)" } }, "Coming next"), /* @__PURE__ */ React.createElement("div", { className: "grid gap-3 mt-4" }, roadmapCards.map((item) => /* @__PURE__ */ React.createElement("div", { key: item, className: "flex items-center gap-3 text-sm", style: { color: "var(--mid)" } }, /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 rounded-full bg-blue flex-shrink-0" }), /* @__PURE__ */ React.createElement("span", null, item))))))))), /* @__PURE__ */ React.createElement("section", { id: "pricing", className: "py-16 md:py-20", style: { background: "var(--paper)", color: "var(--ink)" } }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto max-w-7xl px-5 md:px-10" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-3xl" }, /* @__PURE__ */ React.createElement("span", { className: "section-label", style: { color: "rgba(10,10,12,0.45)" } }, "Pricing"), /* @__PURE__ */ React.createElement("h2", { className: "cg mt-6", style: { fontSize: "clamp(2.4rem, 5.6vw, 4.5rem)", lineHeight: 0.9, letterSpacing: "-0.05em", textTransform: "uppercase" } }, "Clear pricing before your team commits the hours."), /* @__PURE__ */ React.createElement("p", { className: "mt-5 text-base leading-relaxed", style: { color: "var(--mid)" } }, "Start with a guided demo, try a live session for an active lead, or turn Keystone into a repeatable studio rhythm without a dead-month subscription.")), /* @__PURE__ */ React.createElement("div", { className: "grid xl:grid-cols-[minmax(0,1fr)_300px] gap-6 mt-10 items-start" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-3 gap-4" }, pricingTiers.map((tier, index) => /* @__PURE__ */ React.createElement(
      motion.div,
      {
        key: tier.tag,
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { delay: index * 0.08 },
        className: "p-6 md:p-7 rounded-[14px] flex flex-col min-h-[360px]",
        style: tier.featured ? { background: "linear-gradient(180deg, #171717 0%, #0A0A0A 100%)", border: "1px solid rgba(255,255,255,0.06)", color: "white" } : { background: "rgba(255,255,255,0.62)", border: "1px solid rgba(10,10,12,0.08)", color: "var(--ink)" }
      },
      /* @__PURE__ */ React.createElement("div", { className: "mono text-[10px] uppercase tracking-[0.22em]", style: { color: tier.featured ? "rgba(232,238,244,0.58)" : "rgba(10,10,12,0.4)" } }, tier.tag),
      /* @__PURE__ */ React.createElement("div", { className: "cg mt-5", style: { fontSize: "3rem", lineHeight: 0.88, letterSpacing: "-0.06em" } }, tier.price),
      /* @__PURE__ */ React.createElement("div", { className: "mono text-[10px] uppercase tracking-[0.22em] mt-2", style: { color: tier.featured ? "rgba(232,238,244,0.46)" : "rgba(10,10,12,0.42)" } }, tier.unit),
      /* @__PURE__ */ React.createElement("p", { className: "mt-5 text-sm leading-relaxed flex-1", style: { color: tier.featured ? "rgba(244,239,230,0.72)" : "var(--mid)" } }, tier.desc),
      /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => tier.featured ? scrollTo("generator") : setModalOpen(true),
          className: `cta-hero w-full mt-6 min-h-[58px] flex items-center justify-center ${tier.featured ? "cta-glow" : tier.tag === "Free demo" ? "cta-glow-soft" : ""}`
        },
        tier.cta
      )
    )))), /* @__PURE__ */ React.createElement("div", { className: "grid gap-4" }, quoteCards.map((quote, index) => /* @__PURE__ */ React.createElement(
      motion.div,
      {
        key: quote.name,
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { delay: index * 0.08 },
        className: "quote-card p-5"
      },
      /* @__PURE__ */ React.createElement("p", { className: "cg text-[1.2rem] leading-[1.1]", style: { color: "var(--ink)" } }, '"', quote.quote, '"'),
      /* @__PURE__ */ React.createElement("div", { className: "mt-4 pt-4", style: { borderTop: "1px solid rgba(10,10,12,0.08)" } }, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-sm" }, quote.name), /* @__PURE__ */ React.createElement("p", { className: "mono text-[10px] uppercase tracking-[0.2em] mt-2", style: { color: "var(--mid)" } }, quote.firm))
    )))))), /* @__PURE__ */ React.createElement("section", { id: "studio", className: "py-16 md:py-20 relative overflow-hidden", style: { background: "linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(23,23,23,1) 100%)" } }, /* @__PURE__ */ React.createElement("div", { className: "hero-glow", style: { top: "12%", left: "18%", width: "540px", height: "540px", background: "radial-gradient(circle, rgba(255,106,55,0.1), transparent 70%)" } }), /* @__PURE__ */ React.createElement("div", { className: "container mx-auto max-w-7xl px-5 md:px-10 relative z-10" }, /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-[minmax(0,1fr)_360px] gap-10 items-start" }, /* @__PURE__ */ React.createElement("div", { className: "dream-panel p-7 md:p-10" }, /* @__PURE__ */ React.createElement("span", { className: "section-label", style: { color: "rgba(232,238,244,0.65)" } }, "Studio"), /* @__PURE__ */ React.createElement("h2", { className: "cg text-white mt-6", style: { fontSize: "clamp(2.8rem, 7vw, 5.2rem)", lineHeight: 0.9, letterSpacing: "-0.05em", textTransform: "uppercase" } }, "Built by people who have felt the discovery gap up close."), /* @__PURE__ */ React.createElement("p", { className: "mt-6 max-w-2xl text-base leading-relaxed", style: { color: "rgba(244,239,230,0.72)" } }, "Keystone began from a simple frustration: talented architects were burning unpaid hours trying to pull clarity out of clients who had not yet learned how to describe what they wanted."), /* @__PURE__ */ React.createElement("p", { className: "mt-4 max-w-2xl text-base leading-relaxed", style: { color: "rgba(244,239,230,0.72)" } }, "The product is designed to make that first conversation feel more like design and less like interrogation. Not colder. Not more automated. Just clearer."), /* @__PURE__ */ React.createElement("div", { className: "mt-8 pt-6 border-t border-white/10" }, /* @__PURE__ */ React.createElement("p", { className: "cg text-white", style: { fontSize: "clamp(1.6rem, 3vw, 2.6rem)", lineHeight: 1.08 } }, '"Architects should spend their energy shaping ideas, not extracting them one exhausted question at a time."'), /* @__PURE__ */ React.createElement("p", { className: "mono mt-4 text-[10px] uppercase tracking-[0.24em]", style: { color: "rgba(244,239,230,0.5)" } }, "Founder note / Keystone AI"))), /* @__PURE__ */ React.createElement("div", { className: "grid gap-4" }, studioMetrics.map((metric) => /* @__PURE__ */ React.createElement("div", { key: metric.label, className: "studio-metric" }, /* @__PURE__ */ React.createElement("strong", null, metric.value), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] uppercase tracking-[0.18em]", style: { color: "rgba(244,239,230,0.5)" } }, metric.label))))), /* @__PURE__ */ React.createElement("div", { className: "grid md:grid-cols-3 gap-4 mt-8" }, studioTeam.map((member, index) => /* @__PURE__ */ React.createElement(
      motion.article,
      {
        key: member.name,
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.25 },
        transition: { delay: index * 0.08 },
        className: "dream-panel p-4 md:p-5 flex items-start gap-4"
      },
      /* @__PURE__ */ React.createElement("div", { className: "rounded-[20px] overflow-hidden flex-shrink-0", style: { width: "88px", height: "104px", background: "rgba(255,255,255,0.03)" } }, /* @__PURE__ */ React.createElement("img", { src: member.image, alt: member.name, style: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" } })),
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "mono text-[10px] uppercase tracking-[0.24em]", style: { color: "rgba(244,239,230,0.46)" } }, member.role), /* @__PURE__ */ React.createElement("h3", { className: "cg text-white text-[1.6rem] mt-2 leading-[0.96]" }, member.name), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-[13px] leading-relaxed", style: { color: "rgba(244,239,230,0.68)" } }, member.bio))
    ))))), /* @__PURE__ */ React.createElement("section", { className: "py-16 md:py-20", style: { background: "linear-gradient(180deg, #FFFDFC 0%, #F5F0E9 100%)" } }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto max-w-5xl px-5 md:px-10 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "section-label justify-center", style: { color: "rgba(9,9,9,0.42)" } }, "Final invitation"), /* @__PURE__ */ React.createElement("h2", { className: "cg mt-6", style: { fontSize: "clamp(3rem, 7vw, 5.8rem)", lineHeight: 0.88, letterSpacing: "-0.06em", textTransform: "uppercase", color: "var(--ink)" } }, "Give the first meeting a little wonder."), /* @__PURE__ */ React.createElement("p", { className: "mt-5 max-w-2xl mx-auto text-base md:text-lg leading-relaxed", style: { color: "rgba(9,9,9,0.62)" } }, "If the goal is to make residential clients feel seen faster while protecting your studio's time, Keystone is ready for a real conversation."), /* @__PURE__ */ React.createElement("div", { className: "mt-10 flex flex-col sm:flex-row gap-3 justify-center" }, /* @__PURE__ */ React.createElement("button", { onClick: () => scrollTo("generator"), className: "cta-hero cta-glow cta-live" }, /* @__PURE__ */ React.createElement("span", null, "Open Live Studio"), /* @__PURE__ */ React.createElement("span", { className: "cta-live-mark" }, /* @__PURE__ */ React.createElement("span", { className: "cta-live-dot" }), "Try it now")), /* @__PURE__ */ React.createElement("button", { onClick: () => setModalOpen(true), className: "cta-hero cta-glow-soft" }, "Request Access")))), /* @__PURE__ */ React.createElement("footer", { style: { background: "var(--night)", padding: "3.5rem 0", borderTop: "1px solid rgba(255,255,255,0.08)" } }, /* @__PURE__ */ React.createElement("div", { className: "container mx-auto max-w-7xl px-5 md:px-10" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row justify-between items-center gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("img", { src: ASSETS.icon, alt: "Keystone", style: { width: "30px", height: "30px", filter: "brightness(0) invert(1)" } }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "cg text-[1.1rem] uppercase tracking-[-0.05em] text-white" }, "Keystone AI"), /* @__PURE__ */ React.createElement("p", { className: "mono text-[10px] uppercase tracking-[0.22em] mt-1", style: { color: "rgba(244,239,230,0.36)" } }, "Dream spaces, drawn fast"))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap justify-center gap-6 mono text-[10px] uppercase tracking-[0.22em]" }, [["Work", "work"], ["Services", "services"], ["Pricing", "pricing"], ["Studio", "studio"], ["Live Studio", "generator"], ["Sessions", "gallery"]].map(([label, id]) => /* @__PURE__ */ React.createElement("a", { key: id, href: `#${id}`, className: "footer-link" }, label))), /* @__PURE__ */ React.createElement("p", { className: "mono text-[10px] uppercase tracking-[0.22em]", style: { color: "rgba(244,239,230,0.3)" } }, "Copyright 2026 Keystone AI Studio"))))));
  };
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(/* @__PURE__ */ React.createElement(DreamApp, null));
})();
