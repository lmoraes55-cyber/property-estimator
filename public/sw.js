// Minimal service worker: exists only so the browser treats this site as
// installable (Chrome requires a registered SW with a fetch handler). This
// app is data-driven (live DLD/STR figures), so it deliberately does NOT
// cache responses — every request passes straight through to the network.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
