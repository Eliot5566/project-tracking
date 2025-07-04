import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 取得日誌
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const date = searchParams.get('date');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const task = searchParams.get('task');
  const content = searchParams.get('content');
  const minHours = searchParams.get('minHours');
  const maxHours = searchParams.get('maxHours');
  let sql = 'SELECT * FROM WorkLogs WHERE 1=1';
  const params: any[] = [];
  let paramIdx = 0;
  if (userId) {
    sql += ` AND userId = @param${paramIdx}`;
    params.push(userId);
    paramIdx++;
  }
  if (date) {
    sql += ` AND date = @param${paramIdx}`;
    params.push(date);
    paramIdx++;
  }
  if (startDate && endDate) {
    sql += ` AND date BETWEEN @param${paramIdx} AND @param${paramIdx + 1}`;
    params.push(startDate, endDate);
    paramIdx += 2;
  } else if (startDate) {
    sql += ` AND date >= @param${paramIdx}`;
    params.push(startDate);
    paramIdx++;
  } else if (endDate) {
    sql += ` AND date <= @param${paramIdx}`;
    params.push(endDate);
    paramIdx++;
  }
  if (task) {
    sql += ` AND task LIKE @param${paramIdx}`;
    params.push(`%${task}%`);
    paramIdx++;
  }
  if (content) {
    sql += ` AND content LIKE @param${paramIdx}`;
    params.push(`%${content}%`);
    paramIdx++;
  }
  if (minHours) {
    sql += ` AND hours >= @param${paramIdx}`;
    params.push(minHours);
    paramIdx++;
  }
  if (maxHours) {
    sql += ` AND hours <= @param${paramIdx}`;
    params.push(maxHours);
    paramIdx++;
  }
  sql += ' ORDER BY date DESC';
  const logs = await query(sql, params);
  return NextResponse.json({ success: true, data: logs });
}

// 新增日誌
export async function POST(request: Request) {
  const { userId, date, task, content, hours } = await request.json();
  const result = await query(
    `INSERT INTO WorkLogs (userId, date, task, content, hours) OUTPUT INSERTED.* VALUES (@param0, @param1, @param2, @param3, @param4)`,
    [userId, date, task, content, parseFloat(hours)] // 👈 強制轉數字
  );
  return NextResponse.json({ success: true, data: result[0] });
}

// 可擴充 PUT/DELETE/批次匯入
