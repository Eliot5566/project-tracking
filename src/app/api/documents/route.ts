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
    const password = searchParams.get('password') || '';

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少文件 ID' },
        { status: 400 }
      );
    }

    const document = await query(`SELECT * FROM Documents WHERE id = @param0`, [id]);
    if (!document.length) {
      return NextResponse.json(
        { success: false, error: '文件不存在' },
        { status: 404 }
      );
    }

    // 密碼驗證
    const passwordHashDb = document[0].passwordHash || '';
    if (passwordHashDb) {
      const crypto = await import('crypto');
      const inputHash = crypto.createHash('sha256').update(password).digest('hex');
      if (inputHash !== passwordHashDb) {
        return NextResponse.json({ success: false, error: '密碼錯誤，無法刪除' }, { status: 403 });
      }
    } else {
      // 沒有密碼不允許刪除
      return NextResponse.json({ success: false, error: '此文件未設置密碼，無法刪除' }, { status: 403 });
    }

    const filePath = document[0].filePath;
    if (fs.existsSync(path.join(process.cwd(), 'public', filePath))) {
      fs.unlinkSync(path.join(process.cwd(), 'public', filePath));
    }

    await query(`DELETE FROM Documents WHERE id = @param0`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('刪除文件失敗:', error);
    return NextResponse.json(
      { success: false, error: '刪除文件失敗' },
      { status: 500 }
    );
  }
}
