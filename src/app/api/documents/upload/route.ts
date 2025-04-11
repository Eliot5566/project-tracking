import { promises as fs } from 'fs';
import path from 'path';
import { query } from '@/lib/db';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'general');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;
    const uploadedBy = formData.get('uploadedBy') as string;
    const projectId = formData.get('projectId') as string | null;
    const taskId = formData.get('taskId') as string | null;

    if (!file || !uploadedBy) {
      return NextResponse.json({ error: 'File and uploadedBy are required' }, { status: 400 });
    }

    const fileName = file.name;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const fileType = file.type;
    const fileSize = file.size;

    // 確保目標目錄存在
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // 檢查是否存在同名文件
    let versionNumber = 1;
    let newFilePath = filePath;
    let parentDocumentId = null;
    while (await fileExists(newFilePath)) {
      const ext = path.extname(fileName);
      const baseName = path.basename(fileName, ext);
      newFilePath = path.join(UPLOAD_DIR, `${baseName}_v${versionNumber}${ext}`);
      versionNumber++;
    }

    // 保存文件
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(newFilePath, Buffer.from(arrayBuffer));

    // 更新資料庫
  const result = await query(
      `INSERT INTO Documents (fileName, originalName, fileType, fileSize, filePath, description, uploadedBy, projectId, taskId, isLatestVersion, parentDocumentId, versionNumber, createdAt, updatedAt)
       VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13)`,
      [
        path.basename(newFilePath),
        fileName,
        fileType,
        fileSize,
        newFilePath,
        description,
        uploadedBy,
        projectId,
        taskId,
        1,
        parentDocumentId,
        versionNumber,
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    );

    // 更新舊版本的 isLatestVersion
    if (parentDocumentId) {
      await query(
        `UPDATE Documents SET isLatestVersion = 0 WHERE id = ?`,
        [parentDocumentId]
      );
    }

    return NextResponse.json({ message: 'File uploaded successfully', documentId: result.insertId });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    const versions = await query(
      `SELECT version, uploadedAt FROM FileVersions WHERE fileName LIKE ? ORDER BY version ASC`,
      [`${fileName}%`]
    );

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching file versions:', error);
    return NextResponse.json({ error: 'Failed to fetch file versions' }, { status: 500 });
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
