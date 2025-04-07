import { query } from './db';
import { readFileSync } from 'fs';
import { join } from 'path';

async function initDatabase() {
  try {
    console.log('開始初始化資料庫...');
    
    // 讀取 schema.sql 檔案
    const schemaPath = join(__dirname, 'schema.sql');
    console.log('讀取 schema 檔案:', schemaPath);
    
    const schema = readFileSync(schemaPath, 'utf-8');
    console.log('Schema 內容:', schema);
    
    // 執行 SQL 腳本
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('執行 SQL:', statement);
        await query(statement);
      }
    }
    
    console.log('資料庫初始化完成！');
  } catch (error) {
    console.error('資料庫初始化失敗:', error);
    process.exit(1);
  }
}

// 如果直接執行此檔案，則執行初始化
if (process.argv[1] === __filename) {
  initDatabase();
}

export default initDatabase; 