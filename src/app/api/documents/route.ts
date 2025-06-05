// /src/app/api/documents/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { ConsoleSqlOutlined } from '@ant-design/icons';

// 取得文件列表
export async function GET(request) {
  try {
    const documents = await query(`SELECT * FROM Documents ORDER BY createdAt DESC`);
    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error('獲取文件列表失敗:', error);
    return NextResponse.json(
      { success: false, error: '獲取文件列表失敗' },
      { status: 500 }
    );
  }
}

// POST 請求用於重定向到文件上傳端點
export async function POST(request) {
  return NextResponse.json(
    { success: false, message: '文件上傳請使用 /api/documents/upload 端點' },
    { status: 307, headers: { Location: '/api/documents/upload' } }
  );
}

// 刪除文件
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少文件 ID' },
        { status: 400 }
      );
    }

    // 專案名稱  --- 開始日期  --- 結束日期
    // 任務名稱  --- 任務描述  --- 任務狀態  --- 優先級(低/中/高) --- 開始日期 --- 結束日期  --- 負責人
    // 任務名稱  --- 任務描述  --- 任務狀態  --- 優先級(低/中/高) --- 開始日期 --- 結束日期  --- 負責人
    // 任務名稱  --- 任務描述  --- 任務狀態  --- 優先級(低/中/高) --- 開始日期 --- 結束日期  --- 負責人

    const document = await query(`SELECT * FROM Documents WHERE id = ?`, [id]);

    if (!document.length) {
      return NextResponse.json(
        { success: false, error: '文件不存在' },
        { status: 404 }
      );
    }

    const filePath = document[0].filePath;
    if (fs.existsSync(path.join(process.cwd(), 'public', filePath))) {
      fs.unlinkSync(path.join(process.cwd(), 'public', filePath));
    }

    await query(`DELETE FROM Documents WHERE id = ?`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('刪除文件失敗:', error);
    // 如果刪除文件失敗，返回錯誤信息 NexrResopnse是 Next.js 中的響應對象 用於構建 HTTP 響應
    return NextResponse.json(
      { success: false, error: '刪除文件失敗' },
      { status: 500 }
    );
  }
}
