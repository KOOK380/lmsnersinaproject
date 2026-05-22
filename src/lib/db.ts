import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || "postgresql://postgres.kesaqpisyoljqacpnezk:31MSFr6gKxzj@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

export const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString && connectionString.includes('localhost') ? false : {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
});

export async function query(text: string, params?: any[], silent = false) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err: any) {
    if (!silent) {
       console.error('DATABASE QUERY ERROR:', { text, error: err.message });
    }
    throw err;
  }
}
