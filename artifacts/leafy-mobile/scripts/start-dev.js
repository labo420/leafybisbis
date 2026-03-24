#!/usr/bin/env node
/**
 * start-dev.js — Leafy Mobile dev launcher
 *
 * Strategy (no ngrok required):
 *   1. Metro runs on METRO_PORT (artifactPort + 1, e.g. 23547) — internal only.
 *   2. A manifest-rewriting HTTP/WebSocket proxy runs on PROXY_PORT (artifactPort, e.g. 23546).
 *      - For manifest responses (JSON): rewrites every "localhost:METRO_PORT" reference
 *        to REPLIT_DEV_DOMAIN (no port) so Expo Go fetches assets through Replit's proxy.
 *      - For WebSocket upgrade requests: proxies transparently to Metro.
 *      - For everything else: pipes through unchanged.
 *   3. The exp:// URL written to TUNNEL_FILE is exp://REPLIT_DEV_DOMAIN (no port).
 *      Expo Go connects on port 80/443 → Replit reverse-proxy → our proxy → Metro.
 *
 * If REPLIT_DEV_DOMAIN is not set (local dev), falls back to plain LAN mode.
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
            console.log(`Killing previous start-dev.js instance (PID ${oldPid})...`);
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

// ── Read artifact port from artifact.toml ───────────────────────────────────
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
const REPLIT_DOMAIN = process.env.REPLIT_DEV_DOMAIN || process.env.EXPO_PUBLIC_DOMAIN || "";

// CLI args: strip --tunnel (we manage connectivity ourselves) and --port (we set it)
const rawArgs  = process.argv.slice(2);
const cliPortIdx = rawArgs.indexOf("--port");
const cliPort    = cliPortIdx !== -1 && rawArgs[cliPortIdx + 1] ? Number(rawArgs[cliPortIdx + 1]) : null;
const tunnelIdx  = rawArgs.indexOf("--tunnel");

// Remove --tunnel and --port flags; we add --port ourselves below
let expoArgs = rawArgs.filter((_, i) =>
  i !== tunnelIdx &&
  i !== cliPortIdx &&
  !(cliPortIdx !== -1 && i === cliPortIdx + 1)
);

// Ports:
//   PROXY_PORT  = artifact port (23546) — Replit exposes this externally
//   METRO_PORT  = internal Metro port   (23547)
const PROXY_PORT = ARTIFACT_PORT || cliPort || 23546;
const METRO_PORT = PROXY_PORT + 1;

expoArgs.push("--port", String(METRO_PORT), "--lan");

console.log(`[start-dev] Proxy port : ${PROXY_PORT}  (Replit-visible)`);
console.log(`[start-dev] Metro port : ${METRO_PORT}  (internal)`);
console.log(`[start-dev] Replit domain: ${REPLIT_DOMAIN || "(not set — LAN fallback)"}`);

// ── Kill stale processes ─────────────────────────────────────────────────────
function killStaleProcesses() {
  for (const pat of ["ngrok", "'expo start'", "metro", "@react-native-community/cli-server-api"]) {
    try { execSync(`pkill -f ${pat} || true`, { stdio: "ignore" }); } catch {}
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
      if (pids.length) console.log(`[start-dev] Killed stale PIDs on port ${port}: ${pids.join(", ")}`);
    } catch {}
  }
}
killStaleProcesses();

if (fs.existsSync(TUNNEL_FILE)) fs.unlinkSync(TUNNEL_FILE);

// ── Manifest-rewriting proxy ─────────────────────────────────────────────────
// Rewrites Metro's local addresses in JSON manifests to the public Replit domain.
function rewriteManifest(body) {
  if (!REPLIT_DOMAIN) return body;
  return body
    .replace(new RegExp(`localhost:${METRO_PORT}`, "g"), REPLIT_DOMAIN)
    .replace(new RegExp(`127\\.0\\.0\\.1:${METRO_PORT}`, "g"), REPLIT_DOMAIN)
    // Also cover IPs that Metro might advertise (LAN IP)
    .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{4,5}/g, REPLIT_DOMAIN);
}

function startProxy() {
  const proxyServer = http.createServer((req, res) => {
    const options = {
      hostname: "127.0.0.1",
      port: METRO_PORT,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `localhost:${METRO_PORT}` },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      const ct = proxyRes.headers["content-type"] || "";
      const isJson = ct.includes("json") || ct.includes("javascript");

      if (isJson) {
        let body = "";
        proxyRes.on("data", (chunk) => { body += chunk.toString(); });
        proxyRes.on("end", () => {
          const rewritten = rewriteManifest(body);
          const buf = Buffer.from(rewritten, "utf8");
          const headers = { ...proxyRes.headers, "content-length": buf.length };
          delete headers["transfer-encoding"];
          res.writeHead(proxyRes.statusCode, headers);
          res.end(buf);
        });
      } else {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    });

    proxyReq.on("error", (err) => {
      if (!res.headersSent) res.writeHead(502);
      res.end(`Proxy error: ${err.message}`);
    });
    req.pipe(proxyReq);
  });

  // WebSocket passthrough
  proxyServer.on("upgrade", (req, socket, head) => {
    const target = net.connect(METRO_PORT, "127.0.0.1", () => {
      const headers = Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join("\r\n");
      target.write(`${req.method} ${req.url} HTTP/1.1\r\n${headers}\r\n\r\n`);
      if (head && head.length) target.write(head);
      socket.pipe(target);
      target.pipe(socket);
    });
    target.on("error", () => { try { socket.destroy(); } catch {} });
    socket.on("error", () => { try { target.destroy(); } catch {} });
  });

  proxyServer.listen(PROXY_PORT, "0.0.0.0", () => {
    console.log(`[start-dev] Manifest proxy listening on :${PROXY_PORT}`);
    if (REPLIT_DOMAIN) {
      const expUrl = `exp://${REPLIT_DOMAIN}`;
      fs.writeFileSync(TUNNEL_FILE, expUrl, "utf8");
      console.log(`\n[start-dev] ► Expo Go URL: ${expUrl}\n`);
    }
  });

  proxyServer.on("error", (err) => {
    console.error(`[start-dev] Proxy error: ${err.message}`);
  });
}

startProxy();

// ── Expo / Metro launcher ────────────────────────────────────────────────────
let intentionalExit  = false;
let restartAttempts  = 0;
const MAX_RESTARTS   = 8;

function cleanupAndExit(code) {
  intentionalExit = true;
  try { fs.unlinkSync(LOCK_FILE); } catch {}
  process.exit(code ?? 0);
}
process.on("SIGTERM", () => cleanupAndExit(0));
process.on("SIGINT",  () => cleanupAndExit(0));

function startExpo() {
  console.log(`[start-dev] Starting Expo on internal port ${METRO_PORT}... (attempt ${restartAttempts + 1})`);

  const spawnEnv = Object.assign({}, process.env);
  delete spawnEnv.CI;

  // Force tunnel subdomain field (unused but harmless)
  if (!spawnEnv.EXPO_TUNNEL_SUBDOMAIN) {
    const replId = (spawnEnv.REPL_ID || "leafymobile").replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 20);
    spawnEnv.EXPO_TUNNEL_SUBDOMAIN = `leafy${replId}`;
  }

  // Set REACT_NATIVE_PACKAGER_HOSTNAME so Metro embeds the Replit domain in the manifest
  if (REPLIT_DOMAIN) {
    spawnEnv.REACT_NATIVE_PACKAGER_HOSTNAME = REPLIT_DOMAIN;
  }

  const child = spawn("pnpm", ["exec", "expo", "start", ...expoArgs], {
    stdio: ["inherit", "pipe", "pipe"],
    env: spawnEnv,
    cwd: path.join(__dirname, ".."),
  });

  function fwd(data) { process.stdout.write(data); }
  child.stdout.on("data", fwd);
  child.stderr.on("data", (data) => { process.stderr.write(data); });

  child.on("close", (code) => {
    if (intentionalExit || code === 0) { process.exit(code ?? 0); return; }
    restartAttempts++;
    if (restartAttempts <= MAX_RESTARTS) {
      const delay = Math.min(3000 * restartAttempts, 15000);
      console.warn(`\n[start-dev] Expo exited (code ${code}). Restarting in ${delay / 1000}s... (${restartAttempts}/${MAX_RESTARTS})`);
      setTimeout(startExpo, delay);
    } else {
      console.error(`[start-dev] Expo failed after ${MAX_RESTARTS} attempts. Giving up.`);
      process.exit(code ?? 1);
    }
  });
}

// Give the proxy a moment to bind before Metro starts
setTimeout(startExpo, 500);
