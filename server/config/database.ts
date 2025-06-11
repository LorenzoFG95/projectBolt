import mysql from 'mysql2/promise';

// Configurazione del database
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'nuova_password_sicura',
  database: process.env.DB_NAME || 'portale_appalti',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Creazione del pool di connessioni
const pool = mysql.createPool(dbConfig);

// Test della connessione
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connesso con successo!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Errore di connessione al database:', error);
    return false;
  }
}

export { pool, testConnection };