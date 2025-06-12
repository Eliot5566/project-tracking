import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 非同步確保目錄存在
async function ensureDirectoryExists(dirPath: string) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    // 1. 設定上傳目錄：public/uploads/general
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'general');
    await ensureDirectoryExists(uploadDir);

    // 2. 解析前端傳來的 FormData

    const formData = await request.formData();
    const file = formData.get('file');
    const description = formData.get('description')?.toString() || '';
    // 新增密碼欄位
    const password = formData.get('password')?.toString() || '';

    // 可選：讀取 projectId 與 taskId（如果有傳）
    const projectId = formData.get('projectId') ? Number(formData.get('projectId')) : null;
    const taskId = formData.get('taskId') ? Number(formData.get('taskId')) : null;

    // 讀取 parentDocumentId 與 versionNumber（如有傳遞）
    const parentDocumentIdRaw = formData.get('parentDocumentId');
    const versionNumberRaw = formData.get('versionNumber');
    const parentDocumentId = parentDocumentIdRaw !== null && parentDocumentIdRaw !== undefined && parentDocumentIdRaw !== '' ? Number(parentDocumentIdRaw) : null;
    const versionNumber = versionNumberRaw !== null && versionNumberRaw !== undefined && versionNumberRaw !== '' ? Number(versionNumberRaw) : 1;

    // 3. 檢查是否有上傳檔案，並確認 file 為 File 物件
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: '未提供或非合法文件' },
        { status: 400 }
      );
    }

    // 4. 取得檔案資訊與產生唯一檔案名稱
    const originalName = file.name || `file_${Date.now()}`;
    const fileExtension = path.extname(originalName) || '';
    const fileType = file.type || 'application/octet-stream';
    const fileSize = file.size || 0;
    const uniqueName = `${path.basename(originalName, fileExtension)}_${uuidv4()}${fileExtension}`;

    // 5. 設定儲存在資料庫中的 filePath（帶有前置斜線，以符合資料表）
    const filePath = `/uploads/general/${uniqueName}`;
    // 實際存檔的完整路徑 (移除前置斜線)
    const fullPath = path.join(process.cwd(), 'public', filePath.replace(/^\/+/, ''));

    // 6. 寫入檔案到硬碟
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(fullPath, Buffer.from(arrayBuffer));


    // 7. 密碼 hash 儲存（簡單範例，實際應用請用 bcrypt 等）
    const crypto = await import('crypto');
    const passwordHash = password ? crypto.createHash('sha256').update(password).digest('hex') : '';

    // 8. 組成 SQL 查詢與參數陣列，新增 passwordHash 欄位
    const sql = `
      INSERT INTO Documents (
        fileName,
        originalName,
        fileType,
        fileSize,
        filePath,
        description,
        uploadedBy,
        projectId,
        taskId,
        isLatestVersion,
        parentDocumentId,
        versionNumber,
        passwordHash,
        createdAt,
        updatedAt
      )
      VALUES (
        @param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8,
        1,    -- isLatestVersion: 1 表示最新版本
        @param9, -- parentDocumentId
        @param10, -- versionNumber
        @param11, -- passwordHash
        GETDATE(),
        GETDATE()
      )
    `;
    const params = [
      uniqueName,
      originalName,
      fileType,
      fileSize,
      filePath,
      description,
      1, // 假設上傳者 userId 為 1，請依實際登入者調整
      projectId,
      taskId,
      parentDocumentId,
      versionNumber,
      passwordHash
    ];

    // 8. 執行 SQL 查詢
    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertId ?? null,
        filePath,
        originalName,
        fileSize,
        description,
      },
    });
  } catch (error) {
    console.error('文件上傳失敗:', error);
    return NextResponse.json(
      { success: false, error: '文件上傳失敗: ' + (error instanceof Error ? error.message : '未知錯誤') },
      { status: 500 }
    );
  }
}
