// src/lib/db.ts
import sql from 'mssql';

const config: sql.config = {
  user: process.env.DB_USER,           // 確保環境變數正確設定
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,         // 例如 '192.168.0.250'
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,                     // 如果是本機或內部網路，通常設為 false；若連線 Azure，請設為 true
    trustServerCertificate: true,       // 若無正式憑證，可先設為 true
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getConnectionPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}
// src/app/api/tasks/route.ts