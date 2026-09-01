"use strict";

require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const db = require("./db");
const { BRANCHES, makeBranch } = require("./seedData");

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB per file — keeps the free Postgres tier happy
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE_BYTES } });

const app = express();
const PORT = process.env.PORT || 3000;
const APP_PASSWORD = process.env.APP_PASSWORD || "";
const COOKIE_SECRET = process.env.COOKIE_SECRET || "";
const COOKIE_NAME = "bmc_session";
const TABLES = ["branches", "benefits", "calendar", "assets"];

if (!APP_PASSWORD) {
  console.warn("WARNING: APP_PASSWORD is not set — nobody will be able to log in. Set it in your environment.");
}
if (!COOKIE_SECRET) {
  console.warn("WARNING: COOKIE_SECRET is not set — using an insecure default. Set it in your environment.");
}
const SESSION_SECRET = COOKIE_SECRET || "insecure-default-please-set-COOKIE_SECRET";

app.use(express.json());
app.use(cookieParser());

// ===================== Auth =====================
// A single shared password protects the whole app (this is a solo/internal
// tool, not a multi-user system). The session is a signed cookie — no
// server-side session store needed, so it survives restarts/redeploys.

function makeSessionToken() {
  const payload = "authed";
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return payload + "." + sig;
}

function isValidSessionToken(token) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2 || parts[0] !== "authed") return false;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(parts[0]).digest("hex");
  try {
    const a = Buffer.from(parts[1]);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
}

function requireAuth(req, res, next) {
  if (isValidSessionToken(req.cookies[COOKIE_NAME])) return next();
  res.status(401).json({ error: "unauthorized" });
}

app.post("/api/login", (req, res) => {
  if (!APP_PASSWORD) {
    return res.status(500).json({ error: "Server not configured: APP_PASSWORD is not set." });
  }
  const supplied = String((req.body && req.body.password) || "");
  const a = Buffer.from(supplied);
  const b = Buffer.from(APP_PASSWORD);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) return res.status(401).json({ error: "Incorrect password" });
  res.cookie(COOKIE_NAME, makeSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
  res.json({ ok: true });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

app.get("/api/session", (req, res) => {
  res.json({ authenticated: isValidSessionToken(req.cookies[COOKIE_NAME]) });
});

// ===================== Data API =====================
function validTable(req, res, next) {
  if (!TABLES.includes(req.params.entity)) return res.status(404).json({ error: "unknown entity" });
  next();
}

function makeId(entity) {
  if (entity === "branches") return "B" + String(Date.now()).slice(-6);
  const prefixes = { benefits: "L", calendar: "C", assets: "A" };
  return prefixes[entity] + Math.random().toString(36).slice(2, 9);
}

app.get("/api/state", requireAuth, async (req, res) => {
  try {
    const state = {};
    for (const t of TABLES) state[t] = await db.listRows(t);
    res.json(state);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load data" });
  }
});

app.get("/api/export", requireAuth, async (req, res) => {
  try {
    const state = {};
    for (const t of TABLES) state[t] = await db.listRows(t);
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Disposition", 'attachment; filename="branch-marketing-backup-' + stamp + '.json"');
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(state, null, 2));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Export failed" });
  }
});

// Bulk-create benefits in one call — used by the Branch Workspace's tick-box
// capture flow, which can save several Standard Default benefits for one
// branch at once instead of one form submission per benefit.
app.post("/api/benefits/bulk", requireAuth, async (req, res) => {
  try {
    const items = Array.isArray(req.body && req.body.items) ? req.body.items : [];
    if (!items.length) return res.status(400).json({ error: "No items provided" });
    const created = [];
    for (const item of items) {
      const row = Object.assign({}, item, { id: makeId("benefits") });
      created.push(await db.insertRow("benefits", row));
    }
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Bulk create failed" });
  }
});

// ===================== Files (rate card PDFs, asset proofs, etc.) =====================
// Registered BEFORE the generic /api/:entity routes below — otherwise Express
// would match "/api/files" as entity="files" on those routes first and this
// section would never be reached.
app.post("/api/files", requireAuth, function (req, res) {
  upload.single("file")(req, res, async function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "File is larger than the 10MB limit." });
      }
      console.error(err);
      return res.status(400).json({ error: "Upload failed" });
    }
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    try {
      var id = "F" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
      var saved = await db.insertFile({
        id: id,
        filename: req.file.originalname || "file",
        mimetype: req.file.mimetype || "application/octet-stream",
        size: req.file.size,
        data: req.file.buffer,
        entityType: req.body.entityType || null,
        entityId: req.body.entityId || null
      });
      res.status(201).json(saved);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Upload failed" });
    }
  });
});

app.get("/api/files/:id/meta", requireAuth, async (req, res) => {
  try {
    const meta = await db.getFileMeta(req.params.id);
    if (!meta) return res.status(404).json({ error: "Not found" });
    res.json(meta);
  } catch (err) {
    res.status(500).json({ error: "Failed to load file info" });
  }
});

app.get("/api/files/:id", requireAuth, async (req, res) => {
  try {
    const file = await db.getFile(req.params.id);
    if (!file) return res.status(404).json({ error: "Not found" });
    res.setHeader("Content-Type", file.mimetype);
    res.setHeader("Content-Disposition", 'inline; filename="' + file.filename.replace(/"/g, "") + '"');
    res.send(file.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load file" });
  }
});

app.delete("/api/files/:id", requireAuth, async (req, res) => {
  try {
    await db.deleteFile(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// ===================== Generic entity CRUD (branches/benefits/calendar/assets) =====================
app.post("/api/:entity", requireAuth, validTable, async (req, res) => {
  try {
    const row = Object.assign({}, req.body, { id: makeId(req.params.entity) });
    const created = await db.insertRow(req.params.entity, row);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Create failed" });
  }
});

app.put("/api/:entity/:id", requireAuth, validTable, async (req, res) => {
  try {
    const updated = await db.updateRow(req.params.entity, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/api/:entity/:id", requireAuth, validTable, async (req, res) => {
  try {
    await db.deleteRow(req.params.entity, req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// ===================== Static pages =====================
// Static assets (css/js) are not sensitive on their own, so they're served
// unauthenticated; the actual data only ever comes from the /api/* routes above.
app.use(express.static(path.join(__dirname, "public"), { index: false }));

app.get("/", (req, res) => {
  if (!isValidSessionToken(req.cookies[COOKIE_NAME])) return res.redirect("/login.html");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/health", (req, res) => res.json({ ok: true }));

// ===================== Boot =====================
async function start() {
  await db.initDb();
  await db.seedBranchesIfEmpty(BRANCHES.map(makeBranch));
  app.listen(PORT, () => console.log("Branch Marketing Console listening on port " + PORT));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
