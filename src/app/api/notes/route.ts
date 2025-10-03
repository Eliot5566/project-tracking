if (typeof window !== 'undefined') {
  throw new Error('`notes/route.ts` 僅能在伺服端執行');
}

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface MeetingNote {
  id: number;
  meetingDate: string;
  title: string;
  summary: string;
  unitAResponsibility: string | null;
  unitADueDate: string | null;
  unitAStatus: string | null;
  unitBResponsibility: string | null;
  unitBDueDate: string | null;
  unitBStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

// GET /api/notes?start=2025-01-01&end=2025-01-31&id=1
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    let sqlText = `SELECT id, meetingDate, title, summary,
      unitAResponsibility, unitADueDate, unitAStatus,
      unitBResponsibility, unitBDueDate, unitBStatus,
      createdAt, updatedAt
      FROM MeetingNotes`;
    const conditions: string[] = [];
    const params: (string | number | null)[] = [];

    if (id) {
      conditions.push('id = @param' + params.length);
      params.push(id);
    }
    if (start) {
      conditions.push('meetingDate >= @param' + params.length);
      params.push(start);
    }
    if (end) {
      conditions.push('meetingDate <= @param' + params.length);
      params.push(end);
    }
    if (conditions.length) {
      sqlText += ' WHERE ' + conditions.join(' AND ');
    }
    sqlText += ' ORDER BY meetingDate DESC, id DESC';

    const rows = await query<MeetingNote[]>(sqlText, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error('[NOTES][GET] 錯誤', err);
    return NextResponse.json({ success: false, error: '取得會議記錄失敗' }, { status: 500 });
  }
}

// POST /api/notes  body:{meetingDate,title,summary,unitAResponsibility,unitADueDate,unitAStatus,unitBResponsibility,unitBDueDate,unitBStatus}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { meetingDate, title, summary = '', unitAResponsibility, unitADueDate, unitAStatus, unitBResponsibility, unitBDueDate, unitBStatus } = body;
    if (!meetingDate || !title) {
      return NextResponse.json({ success: false, error: '缺少 meetingDate 或 title' }, { status: 400 });
    }
    const insertSql = `INSERT INTO MeetingNotes (
      meetingDate, title, summary,
      unitAResponsibility, unitADueDate, unitAStatus,
      unitBResponsibility, unitBDueDate, unitBStatus,
      createdAt, updatedAt
    ) VALUES (
      @param0, @param1, @param2,
      @param3, @param4, @param5,
      @param6, @param7, @param8,
      GETDATE(), GETDATE()
    ); SELECT SCOPE_IDENTITY() as id;`;
  const inserted = await query<any>(insertSql, [
      meetingDate, title, summary,
      unitAResponsibility || null, unitADueDate || null, unitAStatus || null,
      unitBResponsibility || null, unitBDueDate || null, unitBStatus || null
    ]);
  const id = (inserted as any[])[0].id;
  const row = await query<any>(`SELECT * FROM MeetingNotes WHERE id = @param0`, [id]);
  return NextResponse.json({ success: true, data: (row as any[])[0] });
  } catch (err) {
    console.error('[NOTES][POST] 錯誤', err);
    return NextResponse.json({ success: false, error: '建立會議記錄失敗' }, { status: 500 });
  }
}

// PUT /api/notes  body:{id,...fields}
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, meetingDate, title, summary = '', unitAResponsibility, unitADueDate, unitAStatus, unitBResponsibility, unitBDueDate, unitBStatus } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });
    }
    const updateSql = `UPDATE MeetingNotes SET
      meetingDate=@param0,
      title=@param1,
      summary=@param2,
      unitAResponsibility=@param3,
      unitADueDate=@param4,
      unitAStatus=@param5,
      unitBResponsibility=@param6,
      unitBDueDate=@param7,
      unitBStatus=@param8,
      updatedAt=GETDATE()
      WHERE id=@param9; SELECT * FROM MeetingNotes WHERE id=@param9;`;
  const rows = await query<any>(updateSql, [
      meetingDate || null,
      title || null,
      summary || '',
      unitAResponsibility || null,
      unitADueDate || null,
      unitAStatus || null,
      unitBResponsibility || null,
      unitBDueDate || null,
      unitBStatus || null,
      id
    ]);
  if (!(rows as any[]).length) {
      return NextResponse.json({ success: false, error: '找不到記錄' }, { status: 404 });
    }
  return NextResponse.json({ success: true, data: (rows as any[])[0] });
  } catch (err) {
    console.error('[NOTES][PUT] 錯誤', err);
    return NextResponse.json({ success: false, error: '更新會議記錄失敗' }, { status: 500 });
  }
}

// DELETE /api/notes?id=1
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });
    }
  const row = await query<any>(`SELECT * FROM MeetingNotes WHERE id = @param0`, [id]);
  if (!(row as any[]).length) {
      return NextResponse.json({ success: false, error: '找不到記錄' }, { status: 404 });
    }
    await query(`DELETE FROM MeetingNotes WHERE id = @param0`, [id]);
  return NextResponse.json({ success: true, data: (row as any[])[0] });
  } catch (err) {
    console.error('[NOTES][DELETE] 錯誤', err);
    return NextResponse.json({ success: false, error: '刪除會議記錄失敗' }, { status: 500 });
  }
}
