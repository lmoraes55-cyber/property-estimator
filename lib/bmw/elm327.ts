/**
 * Minimal ELM327 client over Web Bluetooth (BLE).
 *
 * Works with BLE ELM327 adapters (e.g. Vgate iCar Pro BLE, OBDLink CX, Veepeak
 * BLE). Classic-Bluetooth-only adapters (most cheap green/blue "ELM327 v1.5"
 * clones) are NOT visible to browsers and cannot be used.
 *
 * Only standard SAE J1979 Mode 01 / Mode 03 requests are made. Nothing is ever
 * written to the car (no clear-codes, no coding).
 */

// ─── Minimal Web Bluetooth typings (not in lib.dom) ──────────────────────────
interface BtCharacteristic extends EventTarget {
  value?: DataView;
  properties: { write: boolean; writeWithoutResponse: boolean; notify: boolean };
  startNotifications(): Promise<BtCharacteristic>;
  writeValue(v: BufferSource): Promise<void>;
  writeValueWithoutResponse(v: BufferSource): Promise<void>;
}
interface BtService {
  getCharacteristics(): Promise<BtCharacteristic[]>;
}
interface BtServer {
  connected: boolean;
  connect(): Promise<BtServer>;
  disconnect(): void;
  getPrimaryService(uuid: string): Promise<BtService>;
}
interface BtDevice extends EventTarget {
  name?: string;
  gatt?: BtServer;
}
interface BtNavigator {
  bluetooth?: {
    requestDevice(o: {
      acceptAllDevices: boolean;
      optionalServices: string[];
    }): Promise<BtDevice>;
  };
}

export function bluetoothSupported(): boolean {
  return typeof navigator !== "undefined" && !!(navigator as unknown as BtNavigator).bluetooth;
}

// Service UUIDs that common BLE ELM327 adapters expose.
const SERVICE_UUIDS = [
  "0000fff0-0000-1000-8000-00805f9b34fb",
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "000018f0-0000-1000-8000-00805f9b34fb",
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // OBDLink CX / MX+
];

// ─── PID table ───────────────────────────────────────────────────────────────
export type PidKey =
  | "rpm"
  | "speed"
  | "coolant"
  | "oil"
  | "intake"
  | "ambient"
  | "load"
  | "throttle"
  | "fuel"
  | "voltage";

interface PidDef {
  key: PidKey;
  pid: string;
  decode: (b: number[]) => number;
}

export const PIDS: PidDef[] = [
  { key: "rpm", pid: "0C", decode: (b) => (b[0] * 256 + b[1]) / 4 },
  { key: "speed", pid: "0D", decode: (b) => b[0] },
  { key: "coolant", pid: "05", decode: (b) => b[0] - 40 },
  { key: "oil", pid: "5C", decode: (b) => b[0] - 40 },
  { key: "intake", pid: "0F", decode: (b) => b[0] - 40 },
  { key: "ambient", pid: "46", decode: (b) => b[0] - 40 },
  { key: "load", pid: "04", decode: (b) => (b[0] * 100) / 255 },
  { key: "throttle", pid: "11", decode: (b) => (b[0] * 100) / 255 },
  { key: "fuel", pid: "2F", decode: (b) => (b[0] * 100) / 255 },
  { key: "voltage", pid: "42", decode: (b) => (b[0] * 256 + b[1]) / 1000 },
];

export type Reading = Partial<Record<PidKey, number>>;

/** Extract data bytes for a Mode 01 reply, tolerant of spaces/headers/multiple ECUs. */
export function parseMode01(raw: string, pid: string): number[] | null {
  const lines = raw
    .toUpperCase()
    .split(/[\r\n]+/)
    .map((l) => l.replace(/[^0-9A-F]/g, ""))
    .filter(Boolean);
  const marker = "41" + pid.toUpperCase();
  for (const line of lines) {
    const i = line.indexOf(marker);
    if (i === -1) continue;
    const hex = line.slice(i + marker.length);
    const bytes: number[] = [];
    for (let k = 0; k + 1 < hex.length; k += 2) bytes.push(parseInt(hex.slice(k, k + 2), 16));
    if (bytes.length) return bytes;
  }
  return null;
}

/** Decode Mode 03 stored DTCs (CAN framing: 43 <count> <pairs…>). Best-effort. */
export function parseDtcs(raw: string): string[] {
  const text = raw
    .toUpperCase()
    .replace(/^\s*\d:/gm, "") // multi-frame line numbers "0:" "1:"
    .replace(/[^0-9A-F\r\n]/g, "");
  const joined = text
    .split(/[\r\n]+/)
    .filter((l) => l && !/^(NODATA|SEARCHING|OK)/.test(l))
    .join("");
  const start = joined.indexOf("43");
  if (start === -1) return [];
  const body = joined.slice(start + 4); // skip "43" + count byte
  const out: string[] = [];
  const letters = ["P", "C", "B", "U"];
  for (let i = 0; i + 3 < body.length; i += 4) {
    const word = parseInt(body.slice(i, i + 4), 16);
    if (!word) continue;
    const l = letters[(word >> 14) & 3];
    const d1 = (word >> 12) & 3;
    const rest = (word & 0x0fff).toString(16).toUpperCase().padStart(3, "0");
    const code = `${l}${d1}${rest}`;
    if (!out.includes(code)) out.push(code);
  }
  return out;
}

// ─── Transport ───────────────────────────────────────────────────────────────
export class Elm327 {
  private device: BtDevice | null = null;
  private rx: BtCharacteristic | null = null;
  private tx: BtCharacteristic | null = null;
  private buffer = "";
  private waiter: ((s: string) => void) | null = null;
  private chain: Promise<unknown> = Promise.resolve();
  private enc = new TextEncoder();
  private dec = new TextDecoder();
  onDisconnect: (() => void) | null = null;

  get name(): string {
    return this.device?.name ?? "OBD adapter";
  }

  async connect(): Promise<void> {
    const bt = (navigator as unknown as BtNavigator).bluetooth;
    if (!bt) throw new Error("Web Bluetooth is not supported in this browser.");
    const device = await bt.requestDevice({
      acceptAllDevices: true,
      optionalServices: SERVICE_UUIDS,
    });
    this.device = device;
    device.addEventListener("gattserverdisconnected", () => this.onDisconnect?.());
    const server = await device.gatt!.connect();

    for (const uuid of SERVICE_UUIDS) {
      let svc: BtService;
      try {
        svc = await server.getPrimaryService(uuid);
      } catch {
        continue;
      }
      const chars = await svc.getCharacteristics();
      const rx = chars.find((c) => c.properties.notify);
      const tx = chars.find((c) => c.properties.write || c.properties.writeWithoutResponse);
      if (rx && tx) {
        this.rx = rx;
        this.tx = tx;
        break;
      }
    }
    if (!this.rx || !this.tx) {
      server.disconnect();
      throw new Error("This device does not look like a BLE ELM327 adapter.");
    }

    this.rx.addEventListener("characteristicvaluechanged", (e) => {
      const v = (e.target as unknown as BtCharacteristic).value;
      if (!v) return;
      this.buffer += this.dec.decode(v);
      if (this.buffer.includes(">") && this.waiter) {
        const out = this.buffer.replace(/>/g, "").trim();
        this.buffer = "";
        const w = this.waiter;
        this.waiter = null;
        w(out);
      }
    });
    await this.rx.startNotifications();

    await this.send("ATZ", 4000);
    for (const c of ["ATE0", "ATL0", "ATS0", "ATH0", "ATSP0"]) await this.send(c);
  }

  disconnect(): void {
    this.device?.gatt?.disconnect();
    this.device = null;
    this.rx = this.tx = null;
  }

  /** Serialised command/response. Resolves with text up to the '>' prompt. */
  send(cmd: string, timeoutMs = 3000): Promise<string> {
    const run = () =>
      new Promise<string>((resolve, reject) => {
        const tx = this.tx;
        if (!tx) return reject(new Error("Not connected"));
        this.buffer = "";
        const timer = setTimeout(() => {
          this.waiter = null;
          reject(new Error(`Timeout on ${cmd}`));
        }, timeoutMs);
        this.waiter = (s) => {
          clearTimeout(timer);
          resolve(s);
        };
        const bytes = this.enc.encode(cmd + "\r");
        (async () => {
          try {
            for (let i = 0; i < bytes.length; i += 20) {
              const chunk = bytes.slice(i, i + 20);
              if (tx.properties.writeWithoutResponse) await tx.writeValueWithoutResponse(chunk);
              else await tx.writeValue(chunk);
            }
          } catch (err) {
            clearTimeout(timer);
            this.waiter = null;
            reject(err);
          }
        })();
      });
    const next = this.chain.then(run, run);
    this.chain = next.catch(() => undefined);
    return next;
  }

  /** Read one PID. Returns undefined when the car does not answer for it. */
  async readPid(def: PidDef): Promise<number | undefined> {
    const raw = await this.send("01" + def.pid);
    const bytes = parseMode01(raw, def.pid);
    if (!bytes) return undefined;
    const need = def.pid === "0C" || def.pid === "42" ? 2 : 1;
    if (bytes.length < need) return undefined;
    return def.decode(bytes);
  }

  async readDtcs(): Promise<string[]> {
    return parseDtcs(await this.send("03", 5000));
  }
}
