import { Pool } from 'pg';
import 'dotenv/config'; 

const pool = new Pool({
  user: 'postgres',          // Gebruik de user die je in GCP hebt aangemaakt
  host: '34.178.141.108',        // Het Public IP adres uit je console
  database: 'area52_db',
  password: process.env.DB_PASSWORD, // Leest veilig je wachtwoord uit .env
  port: 5432,
  ssl: {
    rejectUnauthorized: false // Dit lost de 'no encryption' fout op
  }
});

export default pool;