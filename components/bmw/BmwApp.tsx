"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  BatteryCharging,
  Car,
  ChevronRight,
  CircleCheck,
  Fuel,
  Gauge as GaugeIcon,
  Lightbulb,
  Lock,
  LockOpen,
  MapPin,
  Thermometer,
  TriangleAlert,
  Volume2,
  Wrench,
} from "lucide-react";
import {
  Elm327,
  PIDS,
  bluetoothSupported,
  type PidKey,
  type Reading,
} from "@/lib/bmw/elm327";

type Tab = "vehicle" | "map" | "drive" | "service" | "faults";
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
const STORE_EVENT = "bmw-520i:changed";

interface Parked {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  at: string;
}
const EMPTY_PARKED: Parked = { lat: null, lng: null, accuracy: null, at: "" };
const PARKED_KEY = "bmw-520i:parked";

// localStorage as an external store so SSR/hydration stay consistent.
function subscribeStore(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(STORE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(STORE_EVENT, cb);
  };
}
const subscribeNever = () => () => {};

// `empty` must be a stable module-level constant.
function useLocal<T extends object>(key: string, empty: T): [T, (v: T) => void] {
  const raw = useSyncExternalStore(
    subscribeStore,
    () => {
      try {
        return localStorage.getItem(key) ?? "";
      } catch {
        return "";
      }
    },
    () => "",
  );
  const value = useMemo<T>(() => {
    try {
      return raw ? { ...empty, ...JSON.parse(raw) } : empty;
    } catch {
      return empty;
    }
  }, [raw, empty]);
  const save = useCallback(
    (v: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(v));
        window.dispatchEvent(new Event(STORE_EVENT));
      } catch {
        /* storage unavailable (private mode) — ignore */
      }
    },
    [key],
  );
  return [value, save];
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
  color = "#111",
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
        <path d={arc(60, 60, 50, START, START + SWEEP)} stroke="#dcdcdc" strokeWidth="7" fill="none" strokeLinecap="butt" />
        {frac > 0 && (
          <path
            d={arc(60, 60, 50, START, end)}
            stroke={hot ? "#E7222E" : color}
            strokeWidth="7"
            fill="none"
            strokeLinecap="butt"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums text-[#111]">
          {value === undefined ? "–" : Math.round(value)}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-neutral-500">{unit}</span>
        <span className="text-[10px] text-neutral-400 mt-0.5">{label}</span>
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
    <div className="rounded-[4px] bg-[#f1f1f1] p-4">
      <div className="text-sm font-semibold text-[#111]">{label}</div>
      <div className={`mt-3 text-2xl font-semibold tabular-nums ${warn ? "text-[#E7222E]" : "text-[#111]"}`}>
        {value === undefined ? "–" : value.toFixed(unit === "V" ? 1 : 0)}
        <span className="ml-1 text-xs font-normal text-neutral-500">{unit}</span>
      </div>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <h1 className="px-5 pt-8 pb-4 text-[28px] font-bold uppercase leading-none tracking-tight text-[#111]">{title}</h1>
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
  const [vehicle, saveVehicle] = useLocal(VEHICLE_KEY, EMPTY_VEHICLE);
  const [parked, saveParked] = useLocal(PARKED_KEY, EMPTY_PARKED);
  const [locBusy, setLocBusy] = useState(false);
  const btOk = useSyncExternalStore(subscribeNever, bluetoothSupported, () => true);

  const saveHere = useCallback(() => {
    if (!navigator.geolocation) {
      setError("This browser can't share your location.");
      return;
    }
    setLocBusy(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        saveParked({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          at: new Date().toISOString(),
        });
        setLocBusy(false);
      },
      (err) => {
        setLocBusy(false);
        setError(
          err.code === 1
            ? "Location permission was denied. Allow it in your browser settings and try again."
            : "Couldn't get your location. Try again outside or near a window.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [saveParked]);

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

  // Real warnings from the live readings drive the big headline.
  const warnings: string[] = [];
  if ((reading.coolant ?? 0) > 105) warnings.push("Engine hot");
  if ((reading.oil ?? 0) > 130) warnings.push("Oil hot");
  if ((reading.fuel ?? 100) < 12) warnings.push("Low fuel");
  if (reading.voltage !== undefined && (reading.voltage < 11.8 || reading.voltage > 15))
    warnings.push("Battery voltage");
  const allGood = warnings.length === 0;

  return (
    <div className="min-h-dvh bg-white text-[#111]">
      <div className="mx-auto max-w-md pb-24">
        {error && (
          <div role="alert" className="mx-5 mt-4 rounded-[4px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* VEHICLE — welcome (not connected) */}
        {tab === "vehicle" && !connected && (
          <main>
            <section className="relative h-[440px] overflow-hidden bg-gradient-to-b from-[#2b3a4a] via-[#8fa3b5] via-55% to-white">
              <div className="relative z-20 px-5 pt-14">
                <h1 className="max-w-[260px] text-[40px] font-bold uppercase !leading-[0.95] tracking-tight !text-white">
                  Welcome to your 520i
                </h1>
                <p className="mt-3 max-w-[300px] text-sm text-white/90">
                  Connect your OBD2 adapter to see live data, or try the demo first.
                </p>
              </div>
              <div className="absolute inset-x-0 bottom-0 z-10 pb-5">
                <CarArt className="ml-[3%] w-[94%]" />
              </div>
            </section>
            <div className="space-y-3 px-5 pt-1">
              <button
                onClick={startLive}
                disabled={!btOk || link === "connecting"}
                className="w-full rounded-[4px] bg-black py-4 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-40"
              >
                {link === "connecting" ? "Connecting…" : "Connect to car"}
              </button>
              <button
                onClick={startDemo}
                className="w-full rounded-[4px] border-2 border-black bg-white py-4 text-sm font-bold uppercase tracking-wide"
              >
                Experience demo
              </button>
              {!btOk && (
                <p className="text-xs text-amber-700">
                  This browser has no Web Bluetooth. On iPhone, open this page in the Bluefy browser; on Android use Chrome.
                </p>
              )}
            </div>
            <section className="px-5 pt-8">
              <h2 className="text-lg font-bold uppercase tracking-tight !text-[#111]">Tools</h2>
              <ul className="mt-2 divide-y divide-neutral-200">
                {(
                  [
                    ["service", "Service tracker", Wrench],
                    ["faults", "Fault codes", TriangleAlert],
                    ["drive", "Live drive data", GaugeIcon],
                  ] as const
                ).map(([id, label, Icon]) => (
                  <li key={id}>
                    <button onClick={() => setTab(id)} className="flex w-full items-center gap-4 py-4 text-left">
                      <Icon className="h-5 w-5" />
                      <span className="flex-1 text-sm font-semibold">{label}</span>
                      <ChevronRight className="h-4 w-4 text-neutral-400" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </main>
        )}

        {/* VEHICLE — connected / demo */}
        {tab === "vehicle" && connected && (
          <main>
            <section className="relative h-[360px] overflow-hidden bg-gradient-to-b from-[#566571] via-[#a3aeb7] via-60% to-white">
              <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-5 text-sm text-white">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${link === "live" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {link === "live" ? "Live" : "Demo"}
                </span>
                <span className="font-semibold">520i M Sport</span>
                <button onClick={halt} className="text-xs font-semibold underline">
                  Disconnect
                </button>
              </div>
              <h1 className="absolute left-5 top-[68px] z-0 text-[74px] font-bold uppercase !leading-[0.86] tracking-tighter !text-white">
                {allGood ? (
                  <>
                    All
                    <br />
                    good
                  </>
                ) : (
                  <>
                    Check
                    <br />
                    car
                  </>
                )}
              </h1>
              <div className="absolute inset-x-0 bottom-0 z-10 pb-5">
                <CarArt className="ml-[3%] w-[94%]" />
              </div>
            </section>

            <div className="space-y-3 px-5 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[4px] bg-[#f1f1f1] p-4">
                  <div className="text-sm font-semibold">Status</div>
                  <div className={`text-xs ${allGood ? "text-neutral-500" : "text-[#E7222E]"}`}>
                    {allGood ? "All good" : warnings.join(", ")}
                  </div>
                  <CircleCheck className="mt-5 h-5 w-5" />
                </div>
                <div className="rounded-[4px] bg-[#f1f1f1] p-4">
                  <div className="text-sm font-semibold">Fuel level</div>
                  <div className="text-xs text-neutral-500">Tank</div>
                  <div className="mt-3 flex items-end justify-between">
                    <Fuel className="h-5 w-5" />
                    <span className="text-3xl font-bold tabular-nums">
                      {reading.fuel === undefined ? "–" : Math.round(reading.fuel)}
                      <span className="ml-0.5 text-sm font-semibold">%</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Remote buttons: shown, but disabled — they need BMW's own connection */}
              <div className="grid grid-cols-4 gap-3" aria-label="Remote controls, unavailable">
                {[Lock, LockOpen, Volume2, Lightbulb].map((I, i) => (
                  <div key={i} className="flex h-12 items-center justify-center rounded-[4px] bg-[#f1f1f1] opacity-40">
                    <I className="h-5 w-5" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-neutral-500">
                Lock, horn and lights need BMW&rsquo;s own connection and can&rsquo;t work through an OBD2 adapter.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[4px] bg-[#f1f1f1] p-4">
                  <div className="text-sm font-semibold">Engine</div>
                  <div className="text-xs text-neutral-500">Coolant</div>
                  <div className="mt-3 flex items-end justify-between">
                    <Thermometer className="h-5 w-5" />
                    <span className="text-2xl font-bold tabular-nums">
                      {reading.coolant === undefined ? "–" : Math.round(reading.coolant)}
                      <span className="ml-0.5 text-sm font-semibold">°C</span>
                    </span>
                  </div>
                </div>
                <div className="rounded-[4px] bg-[#f1f1f1] p-4">
                  <div className="text-sm font-semibold">Battery</div>
                  <div className="text-xs text-neutral-500">Voltage</div>
                  <div className="mt-3 flex items-end justify-between">
                    <BatteryCharging className="h-5 w-5" />
                    <span className="text-2xl font-bold tabular-nums">
                      {reading.voltage === undefined ? "–" : reading.voltage.toFixed(1)}
                      <span className="ml-0.5 text-sm font-semibold">V</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setTab("service")}
                className="relative w-full overflow-hidden rounded-[4px] bg-gradient-to-r from-[#1b3f8f] to-[#2f6fd0] p-4 text-left text-white"
              >
                <div className="text-sm font-semibold">Service</div>
                <div className="mt-1 max-w-[240px] text-xs text-white/90">
                  {kmToService === null
                    ? "Add your mileage and next service date."
                    : kmToService >= 0
                      ? `${kmToService.toLocaleString()} km until your next service.`
                      : `Service overdue by ${Math.abs(kmToService).toLocaleString()} km.`}
                </div>
                <div className="mt-4 text-right text-xs font-bold uppercase tracking-wide">
                  {kmToService === null ? "Set up" : "Open"}
                </div>
              </button>
            </div>
          </main>
        )}

        {/* DRIVE */}
        {tab === "drive" && (
          <main>
            <Header title="Drive" />
            <div className="space-y-3 px-5">
              <div className="flex items-center justify-center gap-2 rounded-[4px] bg-[#f1f1f1] py-6">
                <Gauge value={reading.speed} max={240} label="Speed" unit="km/h" />
                <Gauge value={reading.rpm} max={7000} label="Engine" unit="rpm" color="#1C69D4" redFrom={6300} size={130} />
              </div>
              {!connected && (
                <p className="text-xs text-neutral-500">Not connected — go to Vehicle to connect or try the demo.</p>
              )}
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

              <section className="rounded-[4px] bg-[#f1f1f1] p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold !text-[#111]">This trip</h2>
                  <button
                    onClick={() => {
                      setTrip(emptyTrip());
                      lastTick.current = 0;
                    }}
                    className="text-xs font-semibold underline"
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
                      <dd className="text-lg font-bold tabular-nums">{v}</dd>
                      <dt className="text-[10px] text-neutral-500">
                        {k} · {u}
                      </dt>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </main>
        )}

        {/* MAP */}
        {tab === "map" && (
          <main>
            <Header title="Map" />
            <section className="mx-5 space-y-3">
              {parked.lat !== null && parked.lng !== null ? (
                <>
                  <div className="overflow-hidden rounded-[4px] bg-[#f1f1f1]">
                    <iframe
                      title="Where you parked"
                      className="h-72 w-full border-0"
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${parked.lng - 0.004},${parked.lat - 0.003},${parked.lng + 0.004},${parked.lat + 0.003}&layer=mapnik&marker=${parked.lat},${parked.lng}`}
                    />
                  </div>
                  <div className="rounded-[4px] bg-[#f1f1f1] p-4">
                    <div className="text-sm font-semibold">Parked location</div>
                    <div className="mt-1 text-xs text-neutral-600">
                      Saved {new Date(parked.at).toLocaleString()}
                      {parked.accuracy !== null && ` · accurate to about ${parked.accuracy} m`}
                    </div>
                    <div className="mt-1 font-mono text-xs text-neutral-500">
                      {parked.lat.toFixed(5)}, {parked.lng.toFixed(5)}
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${parked.lat},${parked.lng}&travelmode=walking`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-[4px] bg-black py-4 text-center text-sm font-bold uppercase tracking-wide text-white"
                  >
                    Walk to my car
                  </a>
                </>
              ) : (
                <div className="rounded-[4px] bg-[#f1f1f1] p-4">
                  <div className="text-sm font-semibold">No parked location yet</div>
                  <p className="mt-1 text-xs text-neutral-600">
                    Save where you left the car so you can find it later. Your location stays on this phone.
                  </p>
                </div>
              )}
              <button
                onClick={saveHere}
                disabled={locBusy}
                className={`w-full rounded-[4px] py-4 text-sm font-bold uppercase tracking-wide disabled:opacity-40 ${
                  parked.lat === null ? "bg-black text-white" : "border-2 border-black bg-white"
                }`}
              >
                {locBusy ? "Finding you…" : parked.lat === null ? "Save parked location" : "Update to here"}
              </button>
              {parked.lat !== null && (
                <button
                  onClick={() => saveParked(EMPTY_PARKED)}
                  className="w-full py-2 text-xs font-semibold text-neutral-500 underline"
                >
                  Clear saved location
                </button>
              )}
            </section>
          </main>
        )}

        {/* SERVICE */}
        {tab === "service" && (
          <main>
            <Header title="Service" />
            <section className="mx-5 space-y-3 rounded-[4px] bg-[#f1f1f1] p-4">
              <p className="text-xs text-neutral-600">
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
                <label key={k} className="block text-xs font-semibold text-neutral-600">
                  {label}
                  <input
                    type={type}
                    inputMode={type === "number" ? "numeric" : undefined}
                    value={vehicle[k]}
                    onChange={(e) => saveVehicle({ ...vehicle, [k]: e.target.value })}
                    className="mt-1 w-full rounded-[4px] border border-neutral-300 bg-white px-3 py-3 text-sm font-normal text-[#111]"
                  />
                </label>
              ))}
              <label className="block text-xs font-semibold text-neutral-600">
                Notes
                <textarea
                  rows={3}
                  value={vehicle.notes}
                  onChange={(e) => saveVehicle({ ...vehicle, notes: e.target.value })}
                  className="mt-1 w-full rounded-[4px] border border-neutral-300 bg-white px-3 py-3 text-sm font-normal text-[#111]"
                />
              </label>
              {kmToService !== null && (
                <p className={`text-sm font-semibold ${kmToService < 1000 ? "text-amber-700" : "text-emerald-700"}`}>
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
          <main>
            <Header title="Fault codes" />
            <section className="mx-5 rounded-[4px] bg-[#f1f1f1] p-4">
              <p className="text-xs text-neutral-600">
                Reads standard emissions-related codes only. BMW body, chassis and comfort modules need
                BMW-specific tools. This app never clears codes.
              </p>
              <button
                onClick={readFaults}
                disabled={link !== "live" || dtcBusy}
                className="mt-3 w-full rounded-[4px] bg-black py-3.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-40"
              >
                {dtcBusy ? "Reading…" : "Read codes"}
              </button>
              {link !== "live" && (
                <p className="mt-2 text-xs text-neutral-500">Connect to your car (live) to read codes.</p>
              )}
              {dtcs && (
                <ul className="mt-3 space-y-1 text-sm">
                  {dtcs.length === 0 ? (
                    <li className="font-semibold text-emerald-700">No stored codes</li>
                  ) : (
                    dtcs.map((c) => (
                      <li key={c} className="rounded-[4px] bg-red-100 px-3 py-2 font-mono text-red-800">
                        {c}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </section>
          </main>
        )}

        {/* Tab bar — icon with underline for the active tab */}
        <nav className="fixed bottom-0 inset-x-0 border-t border-neutral-200 bg-white">
          <div className="mx-auto grid max-w-md grid-cols-5 pt-3 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
            {(
              [
                ["vehicle", "Vehicle", Car],
                ["map", "Map", MapPin],
                ["drive", "Drive", GaugeIcon],
                ["service", "Service", Wrench],
                ["faults", "Faults", TriangleAlert],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-label={label}
                aria-current={tab === id ? "page" : undefined}
                className="flex flex-col items-center gap-1.5 pb-1"
              >
                <Icon className={`h-6 w-6 ${tab === id ? "text-black" : "text-neutral-500"}`} strokeWidth={1.5} />
                <span className={`h-[3px] w-7 ${tab === id ? "bg-black" : "bg-transparent"}`} />
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

// Photo of the owner's own car, background removed, with a soft ground shadow.
function CarArt({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-x-[4%] bottom-[-2%] z-0 h-[14%] rounded-[50%] bg-black/40 blur-md" aria-hidden />
      <Image
        src="/bmw/car-520i-hd.webp"
        alt="Your BMW 520i M Sport"
        width={1200}
        height={559}
        priority
        className="relative z-10 h-auto w-full"
      />
    </div>
  );
}
