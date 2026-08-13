/**
 * Non-destructive DB init: CREATE TABLE IF NOT EXISTS from database/schema.sql
 * Usage: node --env-file=.env.local scripts/db-init.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const schemaPath = path.join(root, "database", "schema.sql");

function loadEnvFile(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return;
  const text = fs.readFileSync(full, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const host = process.env.DB_HOST || "127.0.0.1";
const port = Number(process.env.DB_PORT || "3306");
const user = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD || "";
const database = process.env.DB_NAME || "cma_portfolio";

const raw = fs.readFileSync(schemaPath, "utf8");
// Strip comments and split statements; skip CREATE UNIQUE INDEX IF NOT EXISTS
// for older MySQL — we run it separately with a fallback.
const statements = raw
  .split(";")
  .map((s) =>
    s
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim(),
  )
  .filter(Boolean);

async function main() {
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await conn.query(`USE \`${database}\``);

  for (const sql of statements) {
    try {
      await conn.query(sql);
      console.log("OK:", sql.slice(0, 60).replace(/\s+/g, " ") + "…");
    } catch (err) {
      // MySQL < 8.0.13 may not support CREATE INDEX IF NOT EXISTS
      if (
        sql.includes("CREATE UNIQUE INDEX") &&
        (err.code === "ER_DUP_KEYNAME" || err.errno === 1061)
      ) {
        console.log("SKIP (index exists): uq_portfolio_service_slug");
        continue;
      }
      if (sql.includes("CREATE UNIQUE INDEX") && err.code === "ER_PARSE_ERROR") {
        try {
          await conn.query(
            "CREATE UNIQUE INDEX uq_portfolio_service_slug ON portfolio_items (service, slug)",
          );
          console.log("OK (fallback): uq_portfolio_service_slug");
        } catch (e2) {
          if (e2.errno === 1061) {
            console.log("SKIP (index exists): uq_portfolio_service_slug");
          } else {
            throw e2;
          }
        }
        continue;
      }
      throw err;
    }
  }

  await conn.end();
  console.log(`Database ready: ${database}@${host}:${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
