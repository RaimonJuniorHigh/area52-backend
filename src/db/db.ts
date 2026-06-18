import { Pool } from 'pg';
import 'dotenv/config'; 

const pool = new Pool({
  user: 'postgres',
  database: 'area52_db',
  password: process.env.DB_PASSWORD,
  // Gebruik de socket voor Cloud Run, anders de host voor lokaal
  host: process.env.DB_HOST || '34.178.141.108', 
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;