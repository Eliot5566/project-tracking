import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 稽核資料型別
interface AuditItem {
  id: number;
  startDate: string;
  endDate: string;
  department: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// 取得所有稽核清單
export async function GET() {
  try {
    const sql = `SELECT * FROM Audit ORDER BY createdAt DESC`;
    const result = await query<AuditItem[]>(sql);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: '取得稽核清單失敗' }, { status: 500 });
  }
}

// 新增稽核項目
export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate, department, content } = await request.json();
    if (!startDate || !endDate || !department || !content) {
      return NextResponse.json({ success: false, error: '缺少必要欄位' }, { status: 400 });
    }
    const sql = `INSERT INTO Audit (startDate, endDate, department, content, createdAt, updatedAt)
                 VALUES (@param0, @param1, @param2, @param3, GETDATE(), GETDATE())`;
    await query(sql, [startDate, endDate, department, content]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: '新增稽核項目失敗' }, { status: 500 });
  }
}

// 取得部門清單
export async function GET_DEPARTMENTS() {
  try {
    const sql = `SELECT DISTINCT 部門名稱  FROM [JCYDB].[dbo].[人員對照檔]`;
    const result = await query<{ department: string }[]>(sql);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: '取得部門清單失敗' }, { status: 500 });
  }
}