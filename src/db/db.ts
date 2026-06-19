import { Pool, PoolConfig } from 'pg';
import 'dotenv/config';

// ==========================================
// DATABASE VERBINDING - AREA52
// Lokaal: DB_HOST + DB_PASSWORD in .env
// Cloud Run: INSTANCE_CONNECTION_NAME + DB_PASSWORD (Cloud SQL connector)
// ==========================================

const baseConfig: PoolConfig = {
  user: 'postgres',
  database: 'area52_db',
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 5000,
};

const pool = new Pool(
  process.env.INSTANCE_CONNECTION_NAME
    ? {
        ...baseConfig,
        host: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
      }
    : {
        ...baseConfig,
        host: process.env.DB_HOST || '34.178.141.108',
        port: 5432,
        ssl: { rejectUnauthorized: false },
      }
);

export default pool;
