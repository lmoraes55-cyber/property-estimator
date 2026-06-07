"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UnitSize, UnitType, ViewType, FurnishedStatus,
  VIEW_PREMIUMS, BUILDING_DIRECTORY, getLTRWarning, LTRAreaWarning,
} from "@/lib/estimator";
import { colors } from "@/lib/colors";
import GroundWorksLogo from "@/components/GroundWorksLogo";

const UNIT_SIZES: { label: UnitSize; type: UnitType }[] = [
  { label: "STU", type: "Apartment" },
  { label: "1BR", type: "Apartment" },
  { label: "2BR", type: "Apartment" },
  { label: "3BR", type: "Apartment" },
  { label: "4BR APT", type: "Apartment" },
  { label: "5BR APT", type: "Apartment" },
  { label: "6BR APT", type: "Apartment" },
  { label: "4BR VILLA", type: "Villa" },
  { label: "5BR VILLA", type: "Villa" },
  { label: "6BR VILLA", type: "Villa" },
  { label: "7BR VILLA", type: "Villa" },
  { label: "8BR VILLA", type: "Villa" },
  { label: "9BR VILLA", type: "Villa" },
];

const VIEWS: ViewType[] = [
  "Burj Khalifa View",
  "Sea View",
  "Full Marina View",
  "Pool View",
  "City View",
  "Garden / Park View",
  "Standard View",
];


const ALL_BUILDINGS = Object.keys(BUILDING_DIRECTORY).sort();

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [ltrWarning, setLtrWarning] = useState<LTRAreaWarning | null>(null);
  const [buildingSearch, setBuildingSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const buildingRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    buildingName: "",
    unitSize: "" as UnitSize | "",
    unitType: "" as UnitType | "",
    floor: "",
    view: "" as ViewType | "",
    furnished: "" as FurnishedStatus | "",
    managementFee: "20",
    propertyValue: "",
    propertyValueDisplay: "", // comma-formatted display value
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (buildingRef.current && !buildingRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredBuildings = ALL_BUILDINGS.filter(b =>
    b.toLowerCase().includes(buildingSearch.toLowerCase())
  ).slice(0, 8);

  const buildingInfo = BUILDING_DIRECTORY[form.buildingName];

  const canNext = () => {
    if (step === 0) return form.buildingName && form.unitSize && form.unitType;
    if (step === 1) return form.floor && Number(form.floor) >= 1 && form.view && form.furnished;
    if (step === 2) return true;
    return true;
  };

  const buildParams = () => new URLSearchParams({
    propertyName: `${form.buildingName} · ${form.unitSize} · Floor ${form.floor}`,
    buildingName: form.buildingName,
    unitSize: form.unitSize,
    unitType: form.unitType,
    floor: form.floor,
    view: form.view,
    furnished: form.furnished,
    managementFee: String(Number(form.managementFee) / 100),
    ...(form.propertyValue ? { propertyValue: form.propertyValue } : {}),
  });

  const handleGenerate = () => {
    const warning = getLTRWarning(form.buildingName);
    if (warning) {
      setLtrWarning(warning);
      return; // show interstitial instead
    }
    router.push(`/report?${buildParams().toString()}`);
  };

  const proceedWithSTR = () => {
    router.push(`/report?${buildParams().toString()}`);
  };

  const STEPS = [
    { label: "The Property" },
    { label: "Floor & View" },
    { label: "Financials" },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: `linear-gradient(135deg, #FFFFFF 0%, ${colors.bgMain} 40%, ${colors.bgSection} 100%)` }}>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex flex-col items-center gap-3 mb-6">
          <GroundWorksLogo size={120} />
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl font-bold tracking-tight" style={{ color: colors.textMain }}>Ground</span>
              <span className="text-2xl font-bold tracking-tight" style={{ color: colors.primary }}>Works</span>
            </div>
            <p className="text-xs tracking-widest uppercase" style={{ color: colors.textMuted, letterSpacing: "0.18em" }}>We work, You Decide</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border text-xs font-medium tracking-widest uppercase"
          style={{ borderColor: colors.primary + "44", color: colors.primary, background: colors.primary + "0D" }}>
          Dubai Short-Term Rental Estimator
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 leading-tight" style={{ color: colors.textMain }}>
          How much can your<br />
          <span style={{ color: colors.primary }}>Dubai property earn?</span>
        </h1>
        <p className="text-sm" style={{ color: colors.textMuted }}>
          Answer 3 questions. Get a data-driven 12-month rental forecast.
        </p>
      </div>

{/* Step pills + Progress indicator */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="flex items-center gap-1 p-1 rounded-full"
          style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>
          {STEPS.map((s, i) => (
            <button key={s.label}
              onClick={() => i < step && setStep(i)}
              disabled={i >= step}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all"
              style={{
                background: i === step ? colors.primary : "transparent",
                color: i === step ? "#000" : i < step ? colors.primary : colors.textLight,
                cursor: i < step ? "pointer" : i === step ? "default" : "not-allowed",
                opacity: i <= step ? 1 : 0.5,
              }}>
              <span className="hidden sm:block">{i + 1}. {s.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          ))}
        </div>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="text-xs px-3 py-1 rounded-lg transition hover:bg-white/5"
            style={{ color: colors.primary, background: "transparent", border: "1px solid #C9A84C44" }}>
            ← Back to {STEPS[step - 1].label}
          </button>
        )}
      </div>

      {/* Card */}
      <div className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: colors.bgSection, border: "1px solid " + colors.primary }}>

        {/* Progress bar */}
        <div className="h-0.5" style={{ background: colors.border }}>
          <div className="h-full transition-all duration-500"
            style={{ width: `${((step + 1) / 3) * 100}%`, background: "linear-gradient(90deg, #C9A84C, #E8D5A3)" }} />
        </div>

        <div className="p-8">

          {/* ── STEP 0: Building + Bedrooms ── */}
          {step === 0 && (
            <div className="space-y-7">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: colors.primary }}>Question 1 of 3</p>
                <h2 className="text-2xl font-bold" style={{ color: colors.secondary }}>What building is your property in?</h2>
                <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Building name tells us the location, community tier, and demand profile.</p>
              </div>

              {/* Building autocomplete */}
              <div ref={buildingRef} className="relative">
                <label className="block text-xs font-medium mb-2 tracking-wider" style={{ color: colors.textMuted }}>BUILDING NAME</label>
                <input
                  className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition"
                  style={{ background: colors.bgMain, border: `1px solid ${form.buildingName ? "#C9A84C55" : colors.border}`, color: colors.textMain }}
                  placeholder="e.g. Marina Gate, Burj Khalifa, Forte..."
                  value={buildingSearch || form.buildingName}
                  onChange={e => {
                    setBuildingSearch(e.target.value);
                    set("buildingName", "");
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {form.buildingName && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-lg font-medium"
                      style={{ background: "#C9A84C22", color: colors.primary, border: "1px solid " + colors.primary }}>
                      {form.buildingName}
                    </span>
                    {buildingInfo && (
                      <span className="text-xs" style={{ color: colors.textMuted }}>
                        {buildingInfo.community} · {buildingInfo.tier}
                      </span>
                    )}
                  </div>
                )}
                {showSuggestions && buildingSearch && filteredBuildings.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden shadow-2xl"
                    style={{ background: colors.bgSection, border: "1px solid " + colors.border }}>
                    {filteredBuildings.map(b => (
                      <button key={b}
                        className="w-full text-left px-4 py-3 text-sm transition hover:bg-white/5 flex items-center justify-between"
                        style={{ color: colors.textMain, borderBottom: "1px solid " + colors.border }}
                        onMouseDown={() => {
                          set("buildingName", b);
                          setBuildingSearch("");
                          setShowSuggestions(false);
                        }}>
                        <span>{b}</span>
                        {BUILDING_DIRECTORY[b] && (
                          <span className="text-xs" style={{ color: colors.textMuted }}>
                            {BUILDING_DIRECTORY[b].community}
                          </span>
                        )}
                      </button>
                    ))}
                    <button
                      className="w-full text-left px-4 py-3 text-xs transition"
                      style={{ color: colors.textMuted }}
                      onMouseDown={() => {
                        set("buildingName", buildingSearch);
                        setBuildingSearch("");
                        setShowSuggestions(false);
                      }}>
                      + Use &ldquo;{buildingSearch}&rdquo; anyway
                    </button>
                  </div>
                )}
              </div>

              {/* Unit size */}
              <div>
                <label className="block text-xs font-medium mb-3 tracking-wider" style={{ color: colors.textMuted }}>NUMBER OF BEDROOMS</label>
                <div className="grid grid-cols-4 gap-2">
                  {UNIT_SIZES.map(s => (
                    <button key={s.label}
                      onClick={() => { set("unitSize", s.label); set("unitType", s.type); }}
                      className="py-3 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: form.unitSize === s.label ? colors.secondary : colors.bgMain,
                        color: form.unitSize === s.label ? "#FFF" : colors.textMuted,
                        border: `1px solid ${form.unitSize === s.label ? colors.secondary : colors.border}`,
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: Floor + View ── */}
          {step === 1 && (
            <div className="space-y-7">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: colors.primary }}>Question 2 of 3</p>
                <h2 className="text-2xl font-bold" style={{ color: colors.secondary }}>Which floor and what&apos;s the view?</h2>
                <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Higher floors and premium views command significantly higher nightly rates.</p>
              </div>

              {/* Floor number */}
              <div>
                <label className="block text-xs font-medium mb-2 tracking-wider" style={{ color: colors.textMuted }}>
                  FLOOR NUMBER
                  {form.floor && (
                    <span className="ml-2 font-normal" style={{ color: colors.primary }}>
                      {Number(form.floor) >= 40 ? "+18% ADR premium" :
                       Number(form.floor) >= 30 ? "+12% ADR premium" :
                       Number(form.floor) >= 20 ? "+8% ADR premium" :
                       Number(form.floor) >= 10 ? "+4% ADR premium" :
                       Number(form.floor) >= 5  ? "+2% ADR premium" : "No floor premium"}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1} max={200}
                    className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition"
                    style={{ background: colors.bgMain, border: `1px solid ${form.floor ? "#C9A84C55" : colors.border}`, color: colors.textMain }}
                    placeholder="e.g. 15"
                    value={form.floor}
                    onChange={e => set("floor", e.target.value)}
                  />
                </div>
                {/* Floor visual scale */}
                <div className="mt-3 grid grid-cols-5 gap-1.5">
                  {[
                    { range: "1–4", label: "Low", premium: "+0%" },
                    { range: "5–9", label: "Mid-Low", premium: "+2%" },
                    { range: "10–19", label: "Mid", premium: "+4%" },
                    { range: "20–29", label: "High", premium: "+8%" },
                    { range: "30+", label: "Sky", premium: "+12–18%" },
                  ].map(t => {
                    const fl = Number(form.floor);
                    const active =
                      (t.range === "1–4" && fl >= 1 && fl <= 4) ||
                      (t.range === "5–9" && fl >= 5 && fl <= 9) ||
                      (t.range === "10–19" && fl >= 10 && fl <= 19) ||
                      (t.range === "20–29" && fl >= 20 && fl <= 29) ||
                      (t.range === "30+" && fl >= 30);
                    return (
                      <div key={t.range} className="text-center p-2 rounded-lg"
                        style={{ background: active ? "colors.bgSection" : colors.bgMain, border: `1px solid ${active ? "#C9A84C44" : colors.bgSection}` }}>
                        <p className="text-xs font-semibold" style={{ color: active ? colors.primary : colors.textLight }}>{t.premium}</p>
                        <p className="text-xs mt-0.5" style={{ color: active ? colors.textLight : colors.textLight }}>{t.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* View type */}
              <div>
                <label className="block text-xs font-medium mb-3 tracking-wider" style={{ color: colors.textMuted }}>PROPERTY VIEW</label>
                <div className="grid grid-cols-2 gap-2">
                  {VIEWS.map(v => {
                    const pct = Math.round(VIEW_PREMIUMS[v] * 100);
                    return (
                      <button key={v}
                        onClick={() => set("view", v)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left"
                        style={{
                          background: form.view === v ? "colors.bgSection" : colors.bgMain,
                          border: `1px solid ${form.view === v ? colors.primary : colors.border}`,
                        }}>
                        <span className="text-xs font-medium" style={{ color: form.view === v ? colors.primaryHover : colors.textLight }}>{v}</span>
                        {pct > 0 && (
                          <span className="text-xs font-semibold" style={{ color: form.view === v ? colors.primary : colors.textLight }}>
                            +{pct}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Furnished status */}
              <div>
                <label className="block text-xs font-medium mb-3 tracking-wider" style={{ color: colors.textMuted }}>FURNISHING STATUS</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["Furnished", "Unfurnished"] as FurnishedStatus[]).map(f => (
                    <button key={f}
                      onClick={() => set("furnished", f)}
                      className="py-4 rounded-xl transition-all text-left px-4"
                      style={{
                        background: form.furnished === f ? "colors.bgSection" : colors.bgMain,
                        border: `1px solid ${form.furnished === f ? colors.primary : colors.border}`,
                      }}>
                      <p className="text-sm font-semibold" style={{ color: form.furnished === f ? colors.primaryHover : colors.textLight }}>{f}</p>
                      <p className="text-xs mt-0.5" style={{ color: form.furnished === f ? "#C9A84C99" : colors.textLight }}>
                        {f === "Furnished" ? "Ready for short-term rental" : "Furnishing package required"}
                      </p>
                    </button>
                  ))}
                </div>
                {form.furnished === "Unfurnished" && (
                  <p className="text-xs mt-2 px-1" style={{ color: colors.primary }}>
                    We will suggest furnishing packages tailored to your property in the next section.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 2: Financials ── */}
          {step === 2 && (
            <div className="space-y-7">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: colors.primary }}>Question 3 of 3</p>
                <h2 className="text-2xl font-bold" style={{ color: colors.secondary }}>One last detail</h2>
                <p className="text-sm mt-1" style={{ color: colors.textMuted }}>We handle the rental benchmarks — just tell us the property value if you want yield metrics.</p>
              </div>

              {/* Market data notice */}
              <div className="rounded-xl p-4" style={{ background: colors.bgSection, border: "1px solid colors.primary" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: colors.mutedGreen }}>Long-term rent sourced from market data</p>
                <p className="text-xs leading-relaxed" style={{ color: colors.textMuted }}>
                  We benchmark your property against current listings on Property Finder, Bayut, and DXB Interact to determine the long-term rental value — no manual input needed.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2 tracking-wider" style={{ color: colors.textMuted }}>
                  PROPERTY VALUE (AED) <span style={{ color: colors.textLight }}>— optional, unlocks gross & net yield</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: colors.primary }}>AED</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full rounded-xl pl-14 pr-4 py-3.5 text-sm outline-none transition"
                    style={{ background: colors.bgMain, border: "1px solid #252525", color: colors.textMain }}
                    placeholder="2,500,000"
                    value={form.propertyValueDisplay}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "").replace(/[^0-9]/g, "");
                      const display = raw ? Number(raw).toLocaleString("en-AE") : "";
                      setForm(f => ({ ...f, propertyValue: raw, propertyValueDisplay: display }));
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl p-4" style={{ background: colors.bgMain, border: "1px solid colors.primary" }}>
                <div className="flex items-start justify-between mb-2">
                  <label className="text-xs font-medium tracking-wider" style={{ color: colors.textMuted }}>
                    MANAGEMENT FEE
                  </label>
                  <span className="text-sm font-semibold" style={{ color: colors.primary }}>20%</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#777" }}>
                  Standard operator management fee is <span className="font-medium" style={{ color: colors.secondary }}>20% of gross rental income</span>. This typically covers booking management, guest communication, cleaning coordination, and maintenance.
                </p>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: colors.textMuted }}>
                  Different operators offer varied service packages — premium full-service operators may charge 22–25%, while streamlined platforms may offer 15–18%. Your final fee will depend on which operator you partner with.
                </p>
              </div>

              {/* Premium preview card */}
              <div className="rounded-xl p-4" style={{ background: colors.bgMain, border: "1px solid colors.primary" }}>
                <p className="text-xs font-medium mb-3 tracking-wider" style={{ color: colors.textMuted }}>STR PREMIUM BREAKDOWN</p>
                <div className="space-y-2">
                  {[
                    ["Floor Premium", form.floor ? `+${Math.round(
                      (Number(form.floor) >= 40 ? 0.08 :
                       Number(form.floor) >= 30 ? 0.06 :
                       Number(form.floor) >= 20 ? 0.04 :
                       Number(form.floor) >= 10 ? 0.02 :
                       Number(form.floor) >= 5  ? 0.01 : 0) * 100
                    )}%` : "+0%"],
                    [form.view ? `${form.view}` : "View Premium", form.view ? `+${Math.round((VIEW_PREMIUMS[form.view as ViewType] ?? 0) * 100)}%` : "+0%"],
                    ["Base STR Uplift", "+15%"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span style={{ color: colors.textMuted }}>{k}</span>
                      <span style={{ color: colors.primary }}>{v}</span>
                    </div>
                  ))}
                  <div className="h-px my-1" style={{ background: colors.border }} />
                  <div className="flex justify-between text-sm font-semibold">
                    <span style={{ color: colors.textLight }}>Total STR Uplift</span>
                    <span style={{ color: colors.primary }}>
                      +{15 + Math.round(
                        (Number(form.floor) >= 40 ? 8 :
                         Number(form.floor) >= 30 ? 6 :
                         Number(form.floor) >= 20 ? 4 :
                         Number(form.floor) >= 10 ? 2 :
                         Number(form.floor) >= 5  ? 1 : 0)
                      ) + Math.round((VIEW_PREMIUMS[form.view as ViewType] ?? 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="px-6 py-3.5 rounded-xl text-sm font-medium transition hover:bg-white/10"
                style={{ background: colors.bgSection, border: "1px solid #333", color: colors.primary }}>
                ← Back
              </button>
            )}
            {step < 2 ? (
              <button onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-25"
                style={{ background: colors.primary, color: "#000" }}>
                Continue →
              </button>
            ) : (
              <button onClick={handleGenerate}
                disabled={!canNext()}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-25"
                style={{ background: "linear-gradient(135deg, #C9A84C, #E8D5A3)", color: "#000" }}>
                Generate My Report
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-center" style={{ color: colors.textLight }}>
        Projections based on Dubai market data · indicative only
      </p>

      {/* LTR Area Warning Interstitial */}
      {ltrWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "#000000CC", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: colors.bgSection, border: "1px solid #2A2A2A" }}>

            {/* Amber top strip */}
            <div className="h-1" style={{ background: "linear-gradient(90deg, #C9A84C, #E8D5A3, #C9A84C)" }} />

            <div className="p-8 space-y-6">
              {/* Heading */}
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.primary }}>
                  Our Recommendation
                </p>
                <h2 className="text-xl font-bold leading-snug" style={{ color: colors.secondary }}>
                  Long-term rental may be the stronger option here
                </h2>
              </div>

              {/* Reason */}
              <div className="rounded-xl p-4" style={{ background: colors.bgMain, border: "1px solid colors.primary" }}>
                <p className="text-sm leading-relaxed" style={{ color: "#999" }}>
                  {ltrWarning.reason}
                </p>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: "#999" }}>
                  In this area, short-term rental income is likely to <span className="font-medium" style={{ color: colors.secondary }}>match — not significantly exceed</span> your
                  long-term rent, after management fees and seasonal vacancy are factored in.
                </p>
              </div>

              {/* Trade-off table */}
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: colors.textMuted }}>The Trade-off</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-4" style={{ background: colors.bgSection, border: "1px solid colors.primary" }}>
                    <p className="text-xs font-bold mb-2" style={{ color: colors.mutedGreen }}>Long-Term Rental</p>
                    <ul className="space-y-1.5">
                      {["Guaranteed monthly income", "No vacancy risk", "Zero management hassle", "Lower operating costs"].map(p => (
                        <li key={p} className="flex items-start gap-1.5 text-xs" style={{ color: colors.textLight }}>
                          <span style={{ color: colors.mutedGreen, marginTop: "1px" }}>—</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "colors.bgSection", border: "1px solid colors.primary" }}>
                    <p className="text-xs font-bold mb-2" style={{ color: colors.primary }}>Short-Term Rental</p>
                    <ul className="space-y-1.5">
                      {["Full flexibility — use it anytime", "Similar net income in this area", "Option to switch operators", "No fixed tenant commitment"].map(p => (
                        <li key={p} className="flex items-start gap-1.5 text-xs" style={{ color: colors.textLight }}>
                          <span style={{ color: colors.primary, marginTop: "1px" }}>✓</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Question */}
              <div className="rounded-xl p-4 text-center" style={{ background: "#111", border: "1px solid colors.primary" }}>
                <p className="text-sm font-medium mb-1" style={{ color: colors.secondary }}>
                  Would you still like to see the short-term projection?
                </p>
                <p className="text-xs" style={{ color: colors.textMuted }}>
                  You&apos;ll earn similar revenue but keep full flexibility over your property.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button onClick={proceedWithSTR}
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #E8D5A3)", color: "#000" }}>
                  Yes — show me the STR projection anyway ✦
                </button>
                <button
                  onClick={() => {
                    setLtrWarning(null);
                    router.push(`/agents?${buildParams().toString()}&ltrRecommended=true`);
                  }}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold transition"
                  style={{ background: colors.bgMain, border: "1px solid #2A2A2A", color: colors.textLight }}>
                  Find me a long-term leasing agent
                </button>
                <button onClick={() => setLtrWarning(null)}
                  className="text-xs transition" style={{ color: colors.textLight }}>
                  ← Go back and change my property
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
