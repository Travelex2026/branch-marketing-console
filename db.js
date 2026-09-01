"use strict";

const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. See .env.example / README.md.");
}

// Most managed Postgres hosts (Render included) require SSL, but a local
// Postgres for development usually doesn't support it — so only turn SSL on
// when it looks like we're talking to a remote host.
const useSSL = !!connectionString && !/localhost|127\.0\.0\.1/.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

const TABLES = ["branches", "benefits", "calendar", "assets"];

async function initDb() {
  for (const t of TABLES) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${t} (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }
  // Uploaded files (rate card PDFs, asset proofs, etc.) — stored as bytes
  // directly in Postgres. Simple and works well at solo-tool volume; a size
  // cap is enforced at the upload route to keep the free database tier happy.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      mimetype TEXT NOT NULL,
      size INTEGER NOT NULL,
      data BYTEA NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function seedBranchesIfEmpty(initialBranches) {
  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM branches");
  if (rows[0].n > 0) return;
  for (const b of initialBranches) {
    await pool.query(
      "INSERT INTO branches (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
      [b.id, b]
    );
  }
  console.log("Seeded " + initialBranches.length + " branches.");
}

async function listRows(table) {
  const { rows } = await pool.query(`SELECT data FROM ${table} ORDER BY id`);
  return rows.map((r) => r.data);
}

async function insertRow(table, row) {
  await pool.query(`INSERT INTO ${table} (id, data) VALUES ($1, $2)`, [row.id, row]);
  return row;
}

async function updateRow(table, id, patch) {
  const { rows } = await pool.query(`SELECT data FROM ${table} WHERE id = $1`, [id]);
  if (!rows.length) return null;
  const merged = Object.assign({}, rows[0].data, patch, { id });
  await pool.query(`UPDATE ${table} SET data = $2, updated_at = now() WHERE id = $1`, [id, merged]);
  return merged;
}

async function deleteRow(table, id) {
  await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
}

// ---- Files ----
async function insertFile(file) {
  await pool.query(
    `INSERT INTO files (id, filename, mimetype, size, data, entity_type, entity_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [file.id, file.filename, file.mimetype, file.size, file.data, file.entityType || null, file.entityId || null]
  );
  return { id: file.id, filename: file.filename, mimetype: file.mimetype, size: file.size };
}

async function getFile(id) {
  const { rows } = await pool.query(
    "SELECT id, filename, mimetype, size, data FROM files WHERE id = $1",
    [id]
  );
  return rows[0] || null;
}

async function getFileMeta(id) {
  const { rows } = await pool.query(
    "SELECT id, filename, mimetype, size, entity_type, entity_id, uploaded_at FROM files WHERE id = $1",
    [id]
  );
  return rows[0] || null;
}

async function deleteFile(id) {
  await pool.query("DELETE FROM files WHERE id = $1", [id]);
}

module.exports = {
  pool, TABLES, initDb, seedBranchesIfEmpty, listRows, insertRow, updateRow, deleteRow,
  insertFile, getFile, getFileMeta, deleteFile
};
