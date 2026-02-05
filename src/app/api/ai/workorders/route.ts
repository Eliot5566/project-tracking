import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/ai/workorders
export async function GET() {
  try {
    const sql = `
      SELECT TOP (1000)
        [機台]      AS machine,
        [狀態]      AS status,
        [工單單號]  AS orderNo
      FROM [Screws].[dbo].[即時狀態]
      WHERE [狀態] IN (1,3) AND [工單單號] IS NOT NULL
      ORDER BY [機台]
    `;
    const rows = await query<any>(sql);
    return NextResponse.json({ success: true, data: rows || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'DB query failed' }, { status: 500 });
  }
}
