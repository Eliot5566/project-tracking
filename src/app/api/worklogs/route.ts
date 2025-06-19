import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 取得日誌
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const date = searchParams.get('date');
  let sql = 'SELECT * FROM WorkLogs WHERE 1=1';
  const params: any[] = [];
  if (userId) { sql += ' AND userId = @param0'; params.push(userId); }
  if (date) { sql += ' AND date = @param1'; params.push(date); }
  sql += ' ORDER BY date DESC';
  const logs = await query(sql, params);
  return NextResponse.json({ success: true, data: logs });
}

// 新增日誌
export async function POST(request: Request) {
  const { userId, date, task, content, hours } = await request.json();
  const result = await query(
    `INSERT INTO WorkLogs (userId, date, task, content, hours) OUTPUT INSERTED.* VALUES (@param0, @param1, @param2, @param3, @param4)`,
    [userId, date, task, content, hours]
  );
  return NextResponse.json({ success: true, data: result[0] });
}

// 可擴充 PUT/DELETE/批次匯入
