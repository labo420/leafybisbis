#!/usr/bin/env node
/**
 * start-dev.js — Leafy Mobile dev launcher (DEFINITIVO v3)
 *
 * Architettura:
 *   METRO_PORT  (ARTIFACT_PORT+1, e.g. 23547) — Metro bundler (interno)
 *   PROXY_PORT  (ARTIFACT_PORT,   e.g. 23546) — Proxy HTTP/WS + manifest rewriting
 *
 * Tunnel:
 *   Usa @ngrok/ngrok (SDK ufficiale v3) — compatibile con i token ngrok v3.
 *   Evita completamente @expo/ngrok e il binario ngrok v2 (rotti con token v3).
 *
 * Flusso Expo Go:
 *   Expo Go → exp://xxx.ngrok-free.app:443
 *   → ngrok HTTPS (443) → proxy:PROXY_PORT
 *   → manifest rewriting → Metro:METRO_PORT
 *
 * Manifest rewriting:
 *   Il proxy intercetta le risposte JSON di Metro e sostituisce
 *   "http://localhost:METRO_PORT" con "https://ngrok-hostname"
 *   così Expo Go scarica bundle e asset attraverso ngrok.
 *
 * Fallback: se NGROK_AUTH_TOKEN è assente → usa REPLIT_DEV_DOMAIN.
 */

const { spawn, execSync } = require("child_process");
const fs   = require("fs");
const http = require("http");
const net  = require("net");
const path = require("path");

const TUNNEL_FILE = "/tmp/expo-tunnel-url.txt";
const LOCK_FILE   = "/tmp/expo-start-dev.pid";

// ── Single-instance guard ────────────────────────────────────────────────────
function ensureSingleInstance() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const oldPid = Number(fs.readFileSync(LOCK_FILE, "utf8").trim());
      if (oldPid && oldPid !== process.pid) {
        try {
          process.kill(oldPid, 0);
          let cmdline = "";
          try { cmdline = fs.readFileSync(`/proc/${oldPid}/cmdline`, "utf8"); } catch {}
          if (cmdline.includes("start-dev")) {
            console.log(`[dev] Killing previous instance (PID ${oldPid})...`);
            process.kill(oldPid, "SIGTERM");
            try { execSync(`pkill -P ${oldPid} || true`, { stdio: "ignore" }); } catch {}
          }
        } catch {}
      }
    }
  } catch {}
  fs.writeFileSync(LOCK_FILE, String(process.pid), "utf8");
}
ensureSingleInstance();

// ── Ports & env ──────────────────────────────────────────────────────────────
function readArtifactPort() {
  try {
    const tomlPath = path.join(__dirname, "..", ".replit-artifact", "artifact.toml");
    const content  = fs.readFileSync(tomlPath, "utf8");
    const match    = content.match(/^PORT\s*=\s*"(\d+)"/m);
    if (match) return Number(match[1]);
  } catch {}
  return null;
}

const ARTIFACT_PORT = readArtifactPort();
const PROXY_PORT    = ARTIFACT_PORT || 23546;
const METRO_PORT    = PROXY_PORT + 1;
const REPLIT_DOMAIN = process.env.REPLIT_DEV_DOMAIN || process.env.EXPO_PUBLIC_DOMAIN || "";
const NGROK_TOKEN   = process.env.NGROK_AUTH_TOKEN  || "";

console.log(`[dev] Proxy port  : ${PROXY_PORT}  (ngrok target / Replit-visible)`);
console.log(`[dev] Metro port  : ${METRO_PORT}  (internal Metro)`);
console.log(`[dev] ngrok token : ${NGROK_TOKEN ? "✓ present" : "✗ missing — will use Replit domain"}`);

// ── Kill stale processes ─────────────────────────────────────────────────────
function killStaleProcesses() {
  for (const pat of ["ngrok", "expo start", "metro", "@react-native-community/cli-server-api"]) {
    try { execSync(`pkill -f "${pat}" || true`, { stdio: "ignore" }); } catch {}
  }
  try { execSync("sleep 1", { stdio: "ignore" }); } catch {}
  for (const port of [PROXY_PORT, METRO_PORT]) {
    try {
      const pids = execSync(`lsof -ti :${port} 2>/dev/null`, { encoding: "utf8" })
        .trim().split("\n").filter(Boolean);
      for (const pid of pids) {
        if (pid !== String(process.pid)) {
          try { process.kill(Number(pid), "SIGKILL"); } catch {}
        }
      }
      if (pids.length) console.log(`[dev] Freed port ${port}: PIDs ${pids.join(", ")}`);
    } catch {}
  }
}
killStaleProcesses();
if (fs.existsSync(TUNNEL_FILE)) try { fs.unlinkSync(TUNNEL_FILE); } catch {}

// ── Cleanup ──────────────────────────────────────────────────────────────────
let intentionalExit = false;
let expoChild = null;

function cleanupAndExit(code) {
  intentionalExit = true;
  try { if (expoChild) expoChild.kill("SIGTERM"); } catch {}
  try { fs.unlinkSync(LOCK_FILE); } catch {}
  // Let @ngrok/ngrok SDK clean up its own connections
  try {
    const ngrok = require("@ngrok/ngrok");
    ngrok.kill().catch(() => {});
  } catch {}
  setTimeout(() => process.exit(code ?? 0), 600);
}
process.on("SIGTERM", () => cleanupAndExit(0));
process.on("SIGINT",  () => cleanupAndExit(0));

// ── Public hostname (set once tunnel is up) ──────────────────────────────────
let publicHostname = ""; // e.g. "xxx.ngrok-free.app"
let publicScheme   = "http"; // "http" or "https"

function onTunnelReady(listenerUrl) {
  if (publicHostname) return;
  // listenerUrl e.g. "http://xxx.ngrok-free.app" (HTTP) or "https://..." (HTTPS)
  const isHttps  = listenerUrl.startsWith("https://");
  publicScheme   = isHttps ? "https" : "http";
  publicHostname = listenerUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  // For HTTP (port 80): use no explicit port → Expo Go defaults to 80
  // For HTTPS (port 443): use :443 explicitly
  const expUrl   = isHttps
    ? `exp://${publicHostname}:443`
    : `exp://${publicHostname}`;
  fs.writeFileSync(TUNNEL_FILE, expUrl, "utf8");
  console.log(`\n[dev] ► Tunnel URL : ${listenerUrl}`);
  console.log(`[dev] ► Expo Go URL: ${expUrl}`);
  console.log(`[dev]   Inserisci in Expo Go → "Enter URL manually":\n      ${expUrl}\n`);
}

// ── Manifest-rewriting proxy ─────────────────────────────────────────────────
function escRx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function rewriteBody(body) {
  if (!publicHostname) return body;
  const proto  = publicScheme; // "http" or "https"
  const target = `${proto}://${publicHostname}`;

  return body
    // Full URL with localhost:PORT  →  target
    .replace(new RegExp(`https?://localhost:${METRO_PORT}`, "g"), target)
    .replace(new RegExp(`https?://127\\.0\\.0\\.1:${METRO_PORT}`, "g"), target)
    // Full URL with ngrok-hostname:PORT  →  target  (when PACKAGER_HOSTNAME already set)
    .replace(new RegExp(`https?://${escRx(publicHostname)}:${METRO_PORT}`, "g"), target)
    // Bare host:port references  →  publicHostname only (strip port)
    .replace(new RegExp(`localhost:${METRO_PORT}`, "g"), publicHostname)
    .replace(new RegExp(`127\\.0\\.0\\.1:${METRO_PORT}`, "g"), publicHostname)
    .replace(new RegExp(`${escRx(publicHostname)}:${METRO_PORT}`, "g"), publicHostname)
    // LAN IP:PORT that Metro may advertise
    .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{4,5}/g, publicHostname);
}

function startProxy() {
  const server = http.createServer((req, res) => {
    const fwdHeaders = { ...req.headers, host: `localhost:${METRO_PORT}` };
    delete fwdHeaders["accept-encoding"];
    delete fwdHeaders["origin"];
    delete fwdHeaders["referer"];
    const opts = {
      hostname: "127.0.0.1",
      port: METRO_PORT,
      path: req.url,
      method: req.method,
      headers: fwdHeaders,
    };
    const pReq = http.request(opts, (pRes) => {
      const ct = pRes.headers["content-type"] || "";
      // Rewrite manifest / JSON / JS responses
      if (ct.includes("json") || ct.includes("javascript") ||
          req.url === "/" || req.url.startsWith("/_expo") || req.url.startsWith("/manifest")) {
        let body = "";
        pRes.on("data", (c) => { body += c.toString(); });
        pRes.on("end", () => {
          const out = rewriteBody(body);
          const buf = Buffer.from(out, "utf8");
          const hdrs = {
            ...pRes.headers,
            "content-length": buf.length,
            "access-control-allow-origin": "*",
          };
          delete hdrs["transfer-encoding"];
          delete hdrs["content-encoding"];
          res.writeHead(pRes.statusCode, hdrs);
          res.end(buf);
        });
      } else {
        const hdrs = { ...pRes.headers, "access-control-allow-origin": "*" };
        delete hdrs["content-encoding"];
        res.writeHead(pRes.statusCode, hdrs);
        pRes.pipe(res);
      }
    });
    pReq.on("error", (e) => {
      if (!res.headersSent) res.writeHead(502);
      res.end(`proxy error: ${e.message}`);
    });
    req.pipe(pReq);
  });

  // WebSocket passthrough to Metro
  server.on("upgrade", (req, socket, head) => {
    const target = net.connect(METRO_PORT, "127.0.0.1", () => {
      const hdrs = Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join("\r\n");
      target.write(`${req.method} ${req.url} HTTP/1.1\r\n${hdrs}\r\n\r\n`);
      if (head && head.length) target.write(head);
      socket.pipe(target);
      target.pipe(socket);
    });
    target.on("error", () => { try { socket.destroy(); } catch {} });
    socket.on("error", () => { try { target.destroy(); } catch {} });
  });

  server.listen(PROXY_PORT, "0.0.0.0", () => {
    console.log(`[dev] Manifest proxy listening on :${PROXY_PORT}`);
  });
  server.on("error", (e) => { console.error(`[dev] Proxy error: ${e.message}`); });
}

// ── cloudflared tunnel (no account needed) ───────────────────────────────────
const CLOUDFLARED_BIN = "/tmp/cloudflared";

async function ensureCloudflared() {
  if (fs.existsSync(CLOUDFLARED_BIN)) return true;
  console.log("[dev] Downloading cloudflared...");
  try {
    execSync(
      `curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o ${CLOUDFLARED_BIN} && chmod +x ${CLOUDFLARED_BIN}`,
      { stdio: "pipe", timeout: 30000 }
    );
    return true;
  } catch (e) {
    console.warn(`[dev] cloudflared download failed: ${e.message}`);
    return false;
  }
}

async function startCloudflaredTunnel() {
  const ok = await ensureCloudflared();
  if (!ok) {
    useFallback();
    return;
  }

  return new Promise((resolve) => {
    console.log("[dev] Starting cloudflared tunnel (no NGROK_AUTH_TOKEN)...");
    let cfChild;
    try {
      cfChild = spawn(CLOUDFLARED_BIN, ["tunnel", "--url", `http://localhost:${PROXY_PORT}`, "--protocol", "http2"], {
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (e) {
      console.warn(`[dev] cloudflared spawn failed: ${e.message}`);
      useFallback();
      resolve();
      return;
    }

    let resolved = false;
    const tryResolve = () => { if (!resolved) { resolved = true; resolve(); } };

    const handleOutput = (d) => {
      const line = d.toString();
      process.stderr.write(`[cf] ${line}`);
      const match = line.match(/(https:\/\/[a-z0-9-]+\.trycloudflare\.com)/i);
      if (match && !publicHostname) {
        onTunnelReady(match[1].trim());
        tryResolve();
      }
    };

    cfChild.stdout.on("data", handleOutput);
    cfChild.stderr.on("data", handleOutput);

    cfChild.on("close", (code) => {
      if (!publicHostname) {
        console.warn(`[dev] cloudflared exited (${code}) — using Replit domain fallback.`);
        useFallback();
      }
      tryResolve();
    });
    cfChild.on("error", (e) => {
      console.warn(`[dev] cloudflared error: ${e.message} — using Replit domain fallback.`);
      useFallback();
      tryResolve();
    });

    setTimeout(() => {
      if (!publicHostname) {
        console.warn("[dev] cloudflared timeout — using Replit domain fallback.");
        useFallback();
      }
      tryResolve();
    }, 30000);
  });
}

// ── ngrok tunnel (SDK v3) ────────────────────────────────────────────────────
async function startNgrokTunnel() {
  if (!NGROK_TOKEN) {
    await startCloudflaredTunnel();
    return;
  }

  let ngrok;
  try {
    ngrok = require("@ngrok/ngrok");
  } catch (e) {
    console.warn(`[dev] @ngrok/ngrok not loadable: ${e.message} — trying cloudflared.`);
    await startCloudflaredTunnel();
    return;
  }

  console.log("[dev] Connecting ngrok tunnel...");
  try {
    const listener = await ngrok.forward({
      addr: PROXY_PORT,
      authtoken: NGROK_TOKEN,
      schemes: "HTTP",
    });
    const url = listener.url ? listener.url() : String(listener);
    if (url) {
      onTunnelReady(url);
    } else {
      throw new Error("listener.url() returned empty");
    }
  } catch (e) {
    console.warn(`[dev] ngrok tunnel failed: ${e.message} — trying cloudflared.`);
    await startCloudflaredTunnel();
  }
}

function useFallback() {
  if (REPLIT_DOMAIN) {
    publicHostname = REPLIT_DOMAIN;
    publicScheme   = "https";
    const expUrl   = `exp://${REPLIT_DOMAIN}`;
    fs.writeFileSync(TUNNEL_FILE, expUrl, "utf8");
    console.log(`[dev] ► Expo Go URL (Replit fallback): ${expUrl}`);
  } else {
    console.warn("[dev] No tunnel URL available. Expo Go on physical device won't connect.");
  }
}

// ── Expo / Metro launcher ────────────────────────────────────────────────────
let restartAttempts = 0;
const MAX_RESTARTS  = 8;

// Strip --tunnel and --port from CLI args passed by pnpm run dev
const rawArgs = process.argv.slice(2).filter((a, i, arr) => {
  if (a === "--tunnel") return false;
  if (a === "--port")   return false;
  if (i > 0 && arr[i - 1] === "--port") return false;
  return true;
});
const expoArgs = [...rawArgs, "--port", String(METRO_PORT), "--lan"];

function startExpo() {
  console.log(`[dev] Starting Expo on :${METRO_PORT} (attempt ${restartAttempts + 1})`);
  const env = Object.assign({}, process.env);
  delete env.CI;
  if (publicHostname) env.REACT_NATIVE_PACKAGER_HOSTNAME = publicHostname;

  expoChild = spawn("pnpm", ["exec", "expo", "start", ...expoArgs], {
    stdio: ["inherit", "pipe", "pipe"],
    env,
    cwd: path.join(__dirname, ".."),
  });
  expoChild.stdout.on("data", (d) => { process.stdout.write(d); });
  expoChild.stderr.on("data", (d) => { process.stderr.write(d); });
  expoChild.on("close", (code) => {
    if (intentionalExit || code === 0) { process.exit(code ?? 0); return; }
    restartAttempts++;
    if (restartAttempts <= MAX_RESTARTS) {
      const delay = Math.min(3000 * restartAttempts, 15000);
      console.warn(`[dev] Expo exited (${code}). Restart in ${delay / 1000}s... (${restartAttempts}/${MAX_RESTARTS})`);
      setTimeout(startExpo, delay);
    } else {
      console.error(`[dev] Expo failed after ${MAX_RESTARTS} attempts.`);
      process.exit(code ?? 1);
    }
  });
}

// ── Boot sequence ─────────────────────────────────────────────────────────────
startProxy();
startNgrokTunnel(); // async — populates publicHostname when ready
setTimeout(startExpo, 1500); // give proxy + ngrok a head start
