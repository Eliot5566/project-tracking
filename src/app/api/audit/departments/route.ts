import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 取得部門清單（從人員對照檔）
export async function GET() {
  try {
    const sql = `SELECT DISTINCT 部門名稱 as department FROM [JCYDB].[dbo].[人員對照檔] WHERE 部門名稱 IS NOT NULL AND 部門名稱 <> ''
    and 職位名稱 !='螺絲廠' and 離職日期 IS NULL`;
    const result: any = await query(sql);
    // result 應為陣列
    const departments = Array.isArray(result) ? result.map((r: any) => r.department) : [];
    return NextResponse.json({ success: true, data: departments });
  } catch (error) {
    return NextResponse.json({ success: false, error: '取得部門清單失敗' }, { status: 500 });
  }
}
