// src/app/api/documents/download/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';


/**
 * 下載文件 API
 * 
 * 根據 filePath 參數下載指定的文件
 * 
 * @param request - 包含 filePath 參數的請求
 * @returns 返回文件內容或錯誤信息
 */

import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let filePath = searchParams.get('filePath');
    const password = searchParams.get('password') || '';
    if (!filePath) {
      return NextResponse.json(
        { success: false, error: '缺少 filePath 參數' },
        { status: 400 }
      );
    }

    // 查詢文件密碼 hash（正規化回傳型別以避免 IResult/IRecordSet 直接取 length 的型別錯誤）
    const docsRaw = await query<any>(
      'SELECT passwordHash FROM Documents WHERE filePath = @param0',
      [filePath]
    );
    const docs: any[] = Array.isArray(docsRaw)
      ? docsRaw
      : (Array.isArray((docsRaw as any)?.recordset) ? (docsRaw as any).recordset : []);
    if (!docs || docs.length === 0) {
      return NextResponse.json({ success: false, error: '文件不存在' }, { status: 404 });
    }
    const passwordHashDb = docs[0]?.passwordHash || '';
    if (passwordHashDb) {
      // 有設密碼，需驗證
      const crypto = await import('crypto');
      const inputHash = crypto.createHash('sha256').update(password).digest('hex');
      if (inputHash !== passwordHashDb) {
        return NextResponse.json({ success: false, error: '密碼錯誤，無法下載' }, { status: 403 });
      }
    }

    // 如果 filePath 開頭有 "/" 則保留，但在拼接時需移除
    const relativePath = filePath.replace(/^\/+/, '');
    const fullPath = path.join(process.cwd(), 'public', relativePath);

    // 檢查檔案是否存在
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { success: false, error: '文件不存在' },
        { status: 404 }
      );
    }

    // 讀取檔案內容
  const fileBuffer = await fsPromises.readFile(fullPath);

    // 設定 Content-Type (根據副檔名判斷)
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream';
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.doc':
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.xls':
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case '.ppt':
      case '.pptx':
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
    }

    const baseName = path.basename(fullPath);
    const encodedName = encodeURIComponent(baseName);
  // 將 Buffer 複製到 Uint8Array，避免 SharedArrayBuffer 型別問題
  const body = new Uint8Array(fileBuffer.length);
  body.set(fileBuffer);
  return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedName}`,
      },
    });
  } catch (error) {
    console.error('下載文件失敗:', error);
    return NextResponse.json(
      { success: false, error: '下載文件失敗: ' + (error instanceof Error ? error.message : '未知錯誤') },
      { status: 500 }
    );
  }
}
