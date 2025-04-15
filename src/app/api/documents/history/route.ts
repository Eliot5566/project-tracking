import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 取得某文件的所有歷史版本（依 parentDocumentId 或 id）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    if (!parentId) {
      return NextResponse.json({ success: false, error: '缺少 parentId 參數' }, { status: 400 });
    }
    // 查詢所有同一 parentDocumentId 的版本，或自己本身
    const versions = await query(
      `SELECT * FROM Documents WHERE parentDocumentId = @param0 OR id = @param0 ORDER BY versionNumber DESC`,
      [parentId]
    );
    return NextResponse.json({ success: true, data: versions });
  } catch (error) {
    return NextResponse.json({ success: false, error: '查詢歷史版本失敗' }, { status: 500 });
  }
}
