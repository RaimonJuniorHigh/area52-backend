import pool from './db';
async function testConnection() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log("✅ Database verbinding geslaagd! Tijd op server:", res.rows[0].now);
    } catch (err) {
        console.error("❌ Database verbinding gefaald:", err);
    }
}

testConnection();