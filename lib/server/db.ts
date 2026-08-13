import mysql, { type Pool, type PoolOptions, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

let pool: Pool | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getDbConfig(): PoolOptions {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    return {
      host: requireEnv("DB_HOST"),
      port: Number(process.env.DB_PORT || "3306"),
      user: requireEnv("DB_USER"),
      password: requireEnv("DB_PASSWORD"),
      database: requireEnv("DB_NAME"),
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
      timezone: "Z",
      dateStrings: false,
    };
  }

  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "cma_portfolio",
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    timezone: "Z",
    dateStrings: false,
  };
}

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool(getDbConfig());
  }
  return pool;
}

export async function query<T extends RowDataPacket[]>(
  sql: string,
  params?: object | unknown[],
): Promise<T> {
  const [rows] = await getPool().query(sql, params as never);
  return rows as T;
}

export async function execute(
  sql: string,
  params?: object | unknown[],
): Promise<ResultSetHeader> {
  const [result] = await getPool().execute(sql, params as never);
  return result as ResultSetHeader;
}

export type { RowDataPacket, ResultSetHeader };
