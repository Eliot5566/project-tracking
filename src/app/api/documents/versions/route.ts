import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json({ error: '必須提供文件名稱' }, { status: 400 });
    }

    // 查詢原始文件及其所有版本
    const versions = await query(
      `SELECT id, originalName, versionNumber, createdAt AS uploadedAt 
       FROM Documents 
       WHERE originalName = @p0
       ORDER BY versionNumber ASC`,
      [fileName]
    );

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching file versions:', error);
    return NextResponse.json({ error: '獲取版本歷史失敗' }, { status: 500 });
  }
}
