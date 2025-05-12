// src/app/api/documents/download/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let filePath = searchParams.get('filePath');
    if (!filePath) {
      return NextResponse.json(
        { success: false, error: '缺少 filePath 參數' },
        { status: 400 }
      );
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
    // 使用 fsPromises 讀取檔案，這樣可以避免使用 fs.readFileSync 造成的阻塞問題,因為fs.readFileSync 是同步的 fs.readFile 是非同步的
    // fsPromises.readFile 是 Promise 版本的 fs.readFile，這樣可以使用 async/await 語法
    // 這裡的 fullPath 是從 public 資料夾開始的相對路徑
    const fileBuffer = await fsPromises.readFile(fullPath);

    // 設定 Content-Type (根據副檔名判斷)
    // ext 用於取得副檔名，toLowerCase() 用於將副檔名轉為小寫，這樣可以避免大小寫問題
    // path.extname(fullPath) 取得副檔名，toLowerCase() 將其轉為小寫 
    const ext = path.extname(fullPath).toLowerCase();
    // 根據副檔名設定 Content-Type，預設為 application/octet-stream（一般二進位檔案） 
    let contentType = 'application/octet-stream';
    // switch 用於根據副檔名設定不同的 Content-Type 
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
      // 可依需要增加其他格式
    }

    // 回傳檔案內容，設定好下載檔名（支援中文與特殊字元）
    const baseName = path.basename(fullPath);
    const encodedName = encodeURIComponent(baseName);
    // 只設置 filename*，避免 ByteString 錯誤
    return new NextResponse(fileBuffer, {
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
