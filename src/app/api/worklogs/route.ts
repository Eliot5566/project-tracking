import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

function getUserIdFromRequest(request: Request): number | null {
  try {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/(?:userId|teamMemberId)=([^;]+)/);
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
}

function safeDecimal(val: any): number {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function safeDate(val: any): string {
  const d =
    typeof val === 'string'
      ? new Date(val)
      : val instanceof Date
      ? val
      : new Date(val);
  if (isNaN(d.getTime())) throw new Error('Invalid date');
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const loginUserId = getUserIdFromRequest(request);
  const url = new URL(request.url);
  const p = url.searchParams;
  const targetUserIdParam = p.get('userId');
  const isAdmin = false; // 後續可透過查 /api/auth/me 或 DB 角色，暫時 false，改為允許僅看自己
  const filters: any[] = [];
  let sqlText = 'SELECT * FROM WorkLogs WHERE 1=1';

  const effectiveUserId =
    isAdmin && targetUserIdParam ? Number(targetUserIdParam) : loginUserId;
  if (!effectiveUserId) {
    return NextResponse.json(
      { success: false, error: '未登入' },
      { status: 401 }
    );
  }
  sqlText += ` AND userId = @param${filters.length}`;
  filters.push(effectiveUserId);

  if (p.get('startDate')) {
    sqlText += ` AND date >= @param${filters.length}`;
    filters.push(p.get('startDate'));
  }
  if (p.get('endDate')) {
    sqlText += ` AND date <= @param${filters.length}`;
    filters.push(p.get('endDate'));
  }
  if (p.get('task')) {
    sqlText += ` AND task LIKE @param${filters.length}`;
    filters.push(`%${p.get('task')}%`);
  }
  if (p.get('content')) {
    sqlText += ` AND content LIKE @param${filters.length}`;
    filters.push(`%${p.get('content')}%`);
  }
  sqlText += ' ORDER BY date DESC';
  const data = await query(sqlText, filters);
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: '未授權' },
      { status: 403 }
    );
  }
  const { date, task, content, hours } = await request.json();

  const result = (await query<any>(
    `INSERT INTO WorkLogs (userId, date, task, content, hours)
     OUTPUT INSERTED.*
     VALUES (@param0, @param1, @param2, @param3, @param4)`,
    [userId, safeDate(date), task, content, safeDecimal(hours)]
  )) as any[];
  return NextResponse.json({ success: true, data: result[0] });
}

export async function PUT(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: '未授權' },
      { status: 403 }
    );
  }
  const { id, date, task, content, hours } = await request.json();
  if (!id) {
    return NextResponse.json(
      { success: false, error: '缺少日誌 ID' },
      { status: 400 }
    );
  }

  const existing = (await query<any>(
    'SELECT * FROM WorkLogs WHERE id=@param0',
    [Number(id)]
  )) as any[];
  if (!existing.length) {
    return NextResponse.json(
      { success: false, error: '日誌不存在' },
      { status: 404 }
    );
  }
  if (existing[0].userId !== userId) {
    return NextResponse.json(
      { success: false, error: '未授權' },
      { status: 403 }
    );
  }

  await query(
    `UPDATE WorkLogs
       SET date    = @param0,
           task    = @param1,
           content = @param2,
           hours   = @param3
     WHERE id      = ${Number(id)}`,
    [safeDate(date), task, content, safeDecimal(hours)]
  );

  const updated = (await query<any>('SELECT * FROM WorkLogs WHERE id=@param0', [
    Number(id),
  ])) as any[];

  return NextResponse.json({ success: true, data: updated[0] });
}

export async function DELETE(request: Request) {
  const userId = getUserIdFromRequest(request);
  const idParam = new URL(request.url).searchParams.get('id');
  if (!idParam) {
    return NextResponse.json(
      { success: false, error: '缺少日誌 ID' },
      { status: 400 }
    );
  }
  const id = Number(idParam);

  const existing = (await query<any>(
    'SELECT * FROM WorkLogs WHERE id=@param0',
    [id]
  )) as any[];
  if (!existing.length) {
    return NextResponse.json(
      { success: false, error: '日誌不存在' },
      { status: 404 }
    );
  }
  if (existing[0].userId !== userId) {
    return NextResponse.json(
      { success: false, error: '未授權' },
      { status: 403 }
    );
  }

  await query('DELETE FROM WorkLogs WHERE id=@param0', [id]);
  return NextResponse.json({ success: true, data: existing[0] });
}
