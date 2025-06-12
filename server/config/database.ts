import mysql from "mysql2/promise";

// Configurazione del database
const dbConfig = {
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "root",
  database: process.env.MYSQLDATABASE || "your_local_db_name",
  port: process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Creazione del pool di connessioni
const pool = mysql.createPool(dbConfig);

// Test della connessione
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connesso con successo!");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Errore di connessione al database:", error);
    return false;
  }
}

export { pool, testConnection };
