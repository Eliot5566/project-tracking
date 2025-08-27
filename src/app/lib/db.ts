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

// 依據 SQL 語句與參數位置，正確處理 WorkLogs 的 hours 欄位型別
export async function query<T>(sqlQuery: string, params: (string | number | null)[] = []) {
  const pool = await getConnectionPool();
  const request = pool.request();
  params.forEach((param, index) => {
    if (param === null || param === undefined) {
      request.input(`param${index}`, sql.NVarChar, null);
    } else if (typeof param === 'number') {
      // WorkLogs INSERT: hours 在 @param4
      // WorkLogs UPDATE: hours = @param3
      if (
        sqlQuery.includes('WorkLogs') &&
        (
          (sqlQuery.includes('VALUES') && index === 4) ||
          (sqlQuery.includes('SET') && sqlQuery.match(/hours\s*=\s*@param(\d+)/)?.[1] === String(index))
        )
      ) {
        request.input(`param${index}`, sql.Decimal(5, 2), param);
      } else {
        request.input(`param${index}`, sql.Int, param);
      }
    } else {
      request.input(`param${index}`, sql.NVarChar, param);
    }
  });
  const result = await request.query(sqlQuery);
  return result.recordset ? result.recordset : result;
}


export async function getConnectionPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}
// src/app/api/tasks/route.ts