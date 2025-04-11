import sql from 'mssql';

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong@Passw0rd',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'ProjectTracking',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

export async function getConnection() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (error) {
    console.error('資料庫連接錯誤:', error);
    throw error;
  }
}

export async function query<T>(sqlQuery: string, params: (string | number | null)[] = []) {
  try {
    const pool = await getConnection();
    const request = pool.request();

    params.forEach((param, index) => {
      if (param === null) {
        request.input(`param${index}`, sql.VarChar, null);
      } else if (typeof param === 'number') {
        request.input(`param${index}`, sql.Int, param);
      } else {
        request.input(`param${index}`, sql.NVarChar, param);
      }
    });

    const result = await request.query(sqlQuery);
    return result.recordset as T;
  } catch (error) {
    console.error('查詢錯誤:', error);
    throw error;
  }
}

export async function execute<T>(sqlQuery: string, params: Record<string, string | number | null> = {}) {
  try {
    const pool = await getConnection();
    const request = pool.request();

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        request.input(key, sql.VarChar, null);
      } else if (typeof value === 'number') {
        request.input(key, sql.Int, value);
      } else {
        request.input(key, sql.NVarChar, value);
      }
    });

    const result = await request.query(sqlQuery);
    return result.recordset as T;
  } catch (error) {
    console.error('執行錯誤:', error);
    throw error;
  }
} 