"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  BatteryCharging,
  Bluetooth,
  Car,
  Fan,
  Fuel,
  Gauge as GaugeIcon,
  KeyRound,
  Lock,
  Thermometer,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import {
  Elm327,
  PIDS,
  bluetoothSupported,
  type PidKey,
  type Reading,
} from "@/lib/bmw/elm327";

type Tab = "vehicle" | "drive" | "service" | "faults";
type Link = "idle" | "connecting" | "live" | "demo";

interface Trip {
  distanceKm: number;
  maxSpeed: number;
  speedSum: number;
  samples: number;
  elapsedMs: number;
}
const emptyTrip = (): Trip => ({
  distanceKm: 0,
  maxSpeed: 0,
  speedSum: 0,
  samples: 0,
  elapsedMs: 0,
});

interface Vehicle {
  odometer: string;
  nextServiceKm: string;
  nextServiceDate: string;
  notes: string;
}
const EMPTY_VEHICLE: Vehicle = { odometer: "", nextServiceKm: "", nextServiceDate: "", notes: "" };
const VEHICLE_KEY = "bmw-520i:vehicle";
const VEHICLE_EVENT = "bmw-520i:vehicle-changed";

// localStorage as an external store so SSR/hydration stay consistent.
function subscribeVehicle(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(VEHICLE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(VEHICLE_EVENT, cb);
  };
}
const subscribeNever = () => () => {};
function readVehicleRaw(): string {
  try {
    return localStorage.getItem(VEHICLE_KEY) ?? "";
  } catch {
    return "";
  }
}
function useVehicle(): [Vehicle, (v: Vehicle) => void] {
  const raw = useSyncExternalStore(subscribeVehicle, readVehicleRaw, () => "");
  const vehicle = useMemo<Vehicle>(() => {
    try {
      return raw ? { ...EMPTY_VEHICLE, ...JSON.parse(raw) } : EMPTY_VEHICLE;
    } catch {
      return EMPTY_VEHICLE;
    }
  }, [raw]);
  const save = useCallback((v: Vehicle) => {
    try {
      localStorage.setItem(VEHICLE_KEY, JSON.stringify(v));
      window.dispatchEvent(new Event(VEHICLE_EVENT));
    } catch {
      /* storage unavailable (private mode) — ignore */
    }
  }, []);
  return [vehicle, save];
}

// ─── Demo data ───────────────────────────────────────────────────────────────
function demoReading(t: number): Reading {
  const speed = Math.max(0, 70 + 50 * Math.sin(t / 9) + 12 * Math.sin(t / 2.3));
  const rpm = 800 + speed * 22 + 250 * Math.abs(Math.sin(t / 3));
  return {
    speed: Math.round(speed),
    rpm: Math.round(rpm),
    coolant: 88 + Math.sin(t / 30) * 2,
    oil: 96 + Math.sin(t / 40) * 3,
    intake: 34 + Math.sin(t / 20) * 3,
    ambient: 31,
    load: 25 + (speed / 160) * 45,
    throttle: 12 + (speed / 160) * 40,
    fuel: 62,
    voltage: 14.1 + Math.sin(t / 5) * 0.1,
  };
}

// ─── Gauge ───────────────────────────────────────────────────────────────────
function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
function arc(cx: number, cy: number, r: number, from: number, to: number) {
  const [x1, y1] = polar(cx, cy, r, from);
  const [x2, y2] = polar(cx, cy, r, to);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
}

function Gauge({
  value,
  max,
  label,
  unit,
  size = 150,
  color = "#1C69D4",
  redFrom,
}: {
  value: number | undefined;
  max: number;
  label: string;
  unit: string;
  size?: number;
  color?: string;
  redFrom?: number;
}) {
  const START = 225;
  const SWEEP = 270;
  const frac = Math.min(1, Math.max(0, (value ?? 0) / max));
  const end = START + SWEEP * frac;
  const hot = redFrom !== undefined && (value ?? 0) >= redFrom;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden>
        <path d={arc(60, 60, 50, START, START + SWEEP)} stroke="#1f2733" strokeWidth="9" fill="none" strokeLinecap="round" />
        {frac > 0 && (
          <path
            d={arc(60, 60, 50, START, end)}
            stroke={hot ? "#E7222E" : color}
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums">
          {value === undefined ? "–" : Math.round(value)}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-slate-400">{unit}</span>
        <span className="text-[10px] text-slate-500 mt-0.5">{label}</span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  warn,
}: {
  label: string;
  value: number | undefined;
  unit: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl bg-[#121923] border border-white/5 p-3">
      <div className="text-[11px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${warn ? "text-[#ff6b73]" : ""}`}>
        {value === undefined ? "–" : value.toFixed(unit === "V" ? 1 : 0)}
        <span className="ml-1 text-xs font-normal text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function BmwApp() {
  const [tab, setTab] = useState<Tab>("vehicle");
  const [link, setLink] = useState<Link>("idle");
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<Reading>({});
  const [trip, setTrip] = useState<Trip>(emptyTrip);
  const [dtcs, setDtcs] = useState<string[] | null>(null);
  const [dtcBusy, setDtcBusy] = useState(false);
  const [vehicle, saveVehicle] = useVehicle();
  const btOk = useSyncExternalStore(subscribeNever, bluetoothSupported, () => true);

  const elm = useRef<Elm327 | null>(null);
  const stop = useRef<(() => void) | null>(null);
  const lastTick = useRef(0);

  const ingest = useCallback((r: Reading) => {
    const now = Date.now();
    const dtMs = lastTick.current ? now - lastTick.current : 0;
    const dt = dtMs / 3.6e6; // hours
    lastTick.current = now;
    setReading((prev) => ({ ...prev, ...r }));
    const sp = r.speed;
    setTrip((t) => ({ ...t, elapsedMs: t.elapsedMs + dtMs }));
    if (sp !== undefined) {
      setTrip((t) => ({
        ...t,
        distanceKm: t.distanceKm + sp * dt,
        maxSpeed: Math.max(t.maxSpeed, sp),
        speedSum: t.speedSum + sp,
        samples: t.samples + 1,
      }));
    }
  }, []);

  const halt = useCallback(() => {
    stop.current?.();
    stop.current = null;
    elm.current?.disconnect();
    elm.current = null;
    lastTick.current = 0;
    setLink("idle");
  }, []);

  useEffect(() => () => {
    stop.current?.();
    elm.current?.disconnect();
  }, []);

  const startDemo = useCallback(() => {
    setError(null);
    setTrip(emptyTrip());
    setDtcs(null);
    const t0 = Date.now();
    const id = setInterval(() => ingest(demoReading((Date.now() - t0) / 1000)), 500);
    stop.current = () => clearInterval(id);
    setLink("demo");
  }, [ingest]);

  const startLive = useCallback(async () => {
    setError(null);
    setLink("connecting");
    const client = new Elm327();
    try {
      await client.connect();
    } catch (e) {
      setLink("idle");
      // User dismissing the device chooser is not an error worth showing.
      const msg = e instanceof Error ? e.message : String(e);
      if (!/cancel|chosen/i.test(msg)) setError(msg);
      return;
    }
    elm.current = client;
    client.onDisconnect = () => {
      stop.current?.();
      stop.current = null;
      elm.current = null;
      setLink("idle");
      setError("Adapter disconnected.");
    };
    setTrip(emptyTrip());
    setDtcs(null);
    setLink("live");

    let running = true;
    stop.current = () => {
      running = false;
    };
    const active = new Set<PidKey>(PIDS.map((p) => p.key));
    (async () => {
      let answered = false;
      let rounds = 0;
      while (running) {
        const out: Reading = {};
        for (const def of PIDS) {
          if (!running) break;
          if (!active.has(def.key)) continue;
          try {
            const v = await client.readPid(def);
            if (v === undefined) {
              // Drop PIDs the car doesn't support after the first few passes.
              if (rounds >= 2) active.delete(def.key);
            } else {
              out[def.key] = v;
              answered = true;
            }
          } catch {
            if (!running) break;
          }
        }
        rounds++;
        if (running) {
          if (Object.keys(out).length) ingest(out);
          else if (rounds >= 3 && !answered) {
            setError(
              "Adapter connected but the car isn't answering. Switch the ignition on (or start the engine) and reconnect.",
            );
            running = false;
            halt();
          }
        }
      }
    })();
  }, [halt, ingest]);

  const readFaults = useCallback(async () => {
    if (!elm.current) return;
    setDtcBusy(true);
    try {
      setDtcs(await elm.current.readDtcs());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read fault codes.");
    } finally {
      setDtcBusy(false);
    }
  }, []);

  const connected = link === "live" || link === "demo";
  const avg = trip.samples ? trip.speedSum / trip.samples : 0;
  const mins = Math.floor(trip.elapsedMs / 60000);
  const odo = Number(vehicle.odometer) || 0;
  const nextKm = Number(vehicle.nextServiceKm) || 0;
  const kmToService = nextKm && odo ? nextKm - odo : null;

  return (
    <div className="min-h-dvh bg-[#0d1015] text-white">
      <div className="mx-auto max-w-md pb-28">
        {error && (
          <div role="alert" className="mx-4 mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* VEHICLE (home) */}
        {tab === "vehicle" && (
          <main className="px-4 pt-6 space-y-4">
            <section className="overflow-hidden rounded-[28px] bg-gradient-to-b from-[#1b2230] to-[#12161d] border border-white/5">
              <div className="flex items-start justify-between px-5 pt-5">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight !text-white">520i M Sport</h1>
                  <p className="mt-0.5 text-sm text-slate-400">2023 · Saloon</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    link === "live"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : link === "demo"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-white/5 text-slate-400"
                  }`}
                >
                  {link === "live" ? "Live" : link === "demo" ? "Demo" : link === "connecting" ? "Connecting…" : "Not connected"}
                </span>
              </div>
              <CarArt />
              <div className="grid grid-cols-3 gap-px bg-white/5 border-t border-white/5 text-center">
                {[
                  [Fuel, "Fuel", reading.fuel, "%"],
                  [BatteryCharging, "Battery", reading.voltage, "V"],
                  [Thermometer, "Coolant", reading.coolant, "°C"],
                ].map(([Icon, label, val, unit]) => {
                  const I = Icon as typeof Fuel;
                  const v = val as number | undefined;
                  return (
                    <div key={label as string} className="bg-[#14181f] py-3">
                      <I className="mx-auto h-4 w-4 text-[#81C4FF]" />
                      <div className="mt-1 text-base font-semibold tabular-nums">
                        {v === undefined ? "–" : v.toFixed(unit === "V" ? 1 : 0)}
                        <span className="ml-0.5 text-[11px] font-normal text-slate-400">{unit as string}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{label as string}</div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Connect */}
            <section className="rounded-[24px] bg-[#171c23] border border-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1C69D4]/15">
                  <Bluetooth className="h-5 w-5 text-[#81C4FF]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">OBD2 adapter</div>
                  <div className="text-xs text-slate-400">
                    {connected ? (link === "demo" ? "Showing simulated data" : "Reading from your car") : "Plug in a Bluetooth LE adapter"}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {connected ? (
                  <button onClick={halt} className="flex-1 rounded-full bg-white/10 py-3 text-sm font-medium">
                    Disconnect
                  </button>
                ) : (
                  <>
                    <button
                      onClick={startLive}
                      disabled={!btOk || link === "connecting"}
                      className="flex-1 rounded-full bg-[#1C69D4] py-3 text-sm font-medium disabled:opacity-40"
                    >
                      {link === "connecting" ? "Connecting…" : "Connect to car"}
                    </button>
                    <button onClick={startDemo} className="rounded-full bg-white/10 px-5 py-3 text-sm">
                      Demo
                    </button>
                  </>
                )}
              </div>
              {!btOk && !connected && (
                <p className="mt-3 text-xs text-amber-300">
                  This browser has no Web Bluetooth. On iPhone, open this page in the Bluefy browser; on Android use Chrome.
                </p>
              )}
            </section>

            {/* Service summary */}
            <button
              onClick={() => setTab("service")}
              className="flex w-full items-center gap-3 rounded-[24px] bg-[#171c23] border border-white/5 p-4 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                <Wrench className="h-5 w-5 text-slate-300" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Service</div>
                <div
                  className={`text-xs ${
                    kmToService === null ? "text-slate-400" : kmToService < 1000 ? "text-amber-300" : "text-emerald-300"
                  }`}
                >
                  {kmToService === null
                    ? "Add your mileage and next service"
                    : kmToService >= 0
                      ? `${kmToService.toLocaleString()} km until next service`
                      : `Overdue by ${Math.abs(kmToService).toLocaleString()} km`}
                </div>
              </div>
              <span className="text-slate-500">›</span>
            </button>

            {/* Not available — shown honestly, not faked */}
            <section className="rounded-[24px] bg-[#171c23]/60 border border-dashed border-white/10 p-4">
              <div className="text-sm font-medium text-slate-300">Remote services</div>
              <p className="mt-1 text-xs text-slate-500">
                Lock, climate and Digital Key need BMW&rsquo;s own connection and can&rsquo;t be done through an OBD2
                adapter. Use the My BMW app once your car&rsquo;s ConnectedDrive is active.
              </p>
              <div className="mt-3 flex gap-2 opacity-40" aria-hidden>
                {[Lock, Fan, KeyRound].map((I, i) => (
                  <div key={i} className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-white/5">
                    <I className="h-5 w-5" />
                  </div>
                ))}
              </div>
            </section>
          </main>
        )}

        {/* DRIVE */}
        {tab === "drive" && (
          <main className="px-4 pt-6 space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight !text-white px-1">Drive</h1>
            <div className="flex items-center justify-center gap-2 rounded-[28px] bg-gradient-to-b from-[#1b2230] to-[#12161d] border border-white/5 py-6">
              <Gauge value={reading.speed} max={240} label="Speed" unit="km/h" />
              <Gauge value={reading.rpm} max={7000} label="Engine" unit="rpm" color="#81C4FF" redFrom={6300} size={130} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat label="Coolant" value={reading.coolant} unit="°C" warn={(reading.coolant ?? 0) > 105} />
              <Stat label="Oil temp" value={reading.oil} unit="°C" warn={(reading.oil ?? 0) > 130} />
              <Stat label="Intake air" value={reading.intake} unit="°C" />
              <Stat label="Outside" value={reading.ambient} unit="°C" />
              <Stat label="Engine load" value={reading.load} unit="%" />
              <Stat label="Throttle" value={reading.throttle} unit="%" />
              <Stat label="Fuel level" value={reading.fuel} unit="%" warn={(reading.fuel ?? 100) < 12} />
              <Stat
                label="Battery"
                value={reading.voltage}
                unit="V"
                warn={reading.voltage !== undefined && (reading.voltage < 11.8 || reading.voltage > 15)}
              />
            </div>

            <section className="rounded-[24px] bg-[#171c23] border border-white/5 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium !text-white">This trip</h2>
                <button
                  onClick={() => {
                    setTrip(emptyTrip());
                    lastTick.current = 0;
                  }}
                  className="text-xs text-[#81C4FF]"
                >
                  Reset
                </button>
              </div>
              <dl className="mt-3 grid grid-cols-4 gap-2 text-center">
                {[
                  ["Distance", trip.distanceKm.toFixed(1), "km"],
                  ["Avg", avg.toFixed(0), "km/h"],
                  ["Max", String(trip.maxSpeed), "km/h"],
                  ["Time", String(mins), "min"],
                ].map(([k, v, u]) => (
                  <div key={k}>
                    <dd className="text-lg font-semibold tabular-nums">{v}</dd>
                    <dt className="text-[10px] text-slate-400">
                      {k} · {u}
                    </dt>
                  </div>
                ))}
              </dl>
            </section>
          </main>
        )}

        {/* SERVICE */}
        {tab === "service" && (
          <main className="px-4 pt-6 space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight !text-white px-1">Service</h1>
            <section className="rounded-[24px] bg-[#171c23] border border-white/5 p-4 space-y-3">
              <p className="text-xs text-slate-400">
                A standard OBD2 adapter can&rsquo;t read BMW&rsquo;s odometer or service counters, so keep them here.
                Saved on this phone only.
              </p>
              {(
                [
                  ["odometer", "Odometer (km)", "number"],
                  ["nextServiceKm", "Next service at (km)", "number"],
                  ["nextServiceDate", "Next service date", "date"],
                ] as const
              ).map(([k, label, type]) => (
                <label key={k} className="block text-xs text-slate-400">
                  {label}
                  <input
                    type={type}
                    inputMode={type === "number" ? "numeric" : undefined}
                    value={vehicle[k]}
                    onChange={(e) => saveVehicle({ ...vehicle, [k]: e.target.value })}
                    className="mt-1 w-full rounded-2xl bg-[#0d1015] border border-white/10 px-4 py-3 text-sm text-white"
                  />
                </label>
              ))}
              <label className="block text-xs text-slate-400">
                Notes
                <textarea
                  rows={3}
                  value={vehicle.notes}
                  onChange={(e) => saveVehicle({ ...vehicle, notes: e.target.value })}
                  className="mt-1 w-full rounded-2xl bg-[#0d1015] border border-white/10 px-4 py-3 text-sm text-white"
                />
              </label>
              {kmToService !== null && (
                <p className={`text-sm ${kmToService < 1000 ? "text-amber-300" : "text-emerald-300"}`}>
                  {kmToService >= 0
                    ? `${kmToService.toLocaleString()} km until next service`
                    : `Service overdue by ${Math.abs(kmToService).toLocaleString()} km`}
                </p>
              )}
            </section>
          </main>
        )}

        {/* FAULTS */}
        {tab === "faults" && (
          <main className="px-4 pt-6 space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight !text-white px-1">Fault codes</h1>
            <section className="rounded-[24px] bg-[#171c23] border border-white/5 p-4">
              <p className="text-xs text-slate-400">
                Reads standard emissions-related codes only. BMW body, chassis and comfort modules need
                BMW-specific tools. This app never clears codes.
              </p>
              <button
                onClick={readFaults}
                disabled={link !== "live" || dtcBusy}
                className="mt-3 rounded-full bg-[#1C69D4] px-5 py-3 text-sm font-medium disabled:opacity-40"
              >
                {dtcBusy ? "Reading…" : "Read codes"}
              </button>
              {link !== "live" && (
                <p className="mt-2 text-xs text-slate-500">Connect to your car (live) to read codes.</p>
              )}
              {dtcs && (
                <ul className="mt-3 space-y-1 text-sm">
                  {dtcs.length === 0 ? (
                    <li className="text-emerald-300">No stored codes</li>
                  ) : (
                    dtcs.map((c) => (
                      <li key={c} className="rounded-xl bg-red-500/10 px-3 py-2 font-mono text-red-200">
                        {c}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </section>
          </main>
        )}

        {/* Tab bar */}
        <nav className="fixed bottom-0 inset-x-0 border-t border-white/10 bg-[#0d1015]/90 backdrop-blur">
          <div className="mx-auto grid max-w-md grid-cols-4 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {(
              [
                ["vehicle", "Vehicle", Car],
                ["drive", "Drive", GaugeIcon],
                ["service", "Service", Wrench],
                ["faults", "Faults", TriangleAlert],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-current={tab === id ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2 text-[11px] ${
                  tab === id ? "text-[#81C4FF] font-semibold" : "text-slate-500"
                }`}
              >
                <Icon className="h-6 w-6" />
                {label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

// Original side-view saloon drawing (not BMW artwork).
function CarArt() {
  return (
    <svg viewBox="0 0 320 120" className="mx-auto my-2 w-full max-w-[340px]" aria-hidden>
      <ellipse cx="160" cy="104" rx="130" ry="7" fill="#000" opacity=".35" />
      <path
        d="M18 88 L24 74 Q32 64 66 60 L104 40 Q126 30 164 30 L204 30 Q238 33 258 52 L290 60 Q306 64 308 78 L308 90 Z"
        fill="#2a3342"
      />
      <path d="M110 44 Q128 36 160 36 L200 36 Q226 39 242 54 L112 54 Z" fill="#0d1015" opacity=".85" />
      <path d="M18 80 H308" stroke="#81C4FF" strokeWidth="2" opacity=".9" />
      <path d="M18 84 H308" stroke="#0166B1" strokeWidth="2" />
      <path d="M18 88 H308" stroke="#E7222E" strokeWidth="2" />
      {[84, 244].map((x) => (
        <g key={x}>
          <circle cx={x} cy="92" r="18" fill="#0d1015" />
          <circle cx={x} cy="92" r="11" fill="#3a4556" />
          <circle cx={x} cy="92" r="3" fill="#0d1015" />
        </g>
      ))}
    </svg>
  );
}
