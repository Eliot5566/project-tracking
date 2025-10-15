if (typeof window !== 'undefined') {
  throw new Error('`notes/route.ts` 僅能在伺服端執行');
}
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface MeetingNoteItem { id: number; meetingNoteId: number; unitName: string; responsibility: string; dueDate: string | null; status: string | null; orderIndex: number | null; }
interface MeetingNote { id: number; meetingDate: string; title: string; summary: string; unitAResponsibility: string | null; unitADueDate: string | null; unitAStatus: string | null; unitBResponsibility: string | null; unitBDueDate: string | null; unitBStatus: string | null; createdAt: string; updatedAt: string; items?: MeetingNoteItem[]; }
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const q = searchParams.get('q');
    let sqlText = `SELECT id, meetingDate, title, summary, unitAResponsibility, unitADueDate, unitAStatus, unitBResponsibility, unitBDueDate, unitBStatus, createdAt, updatedAt FROM MeetingNotes`;
    const conditions: string[] = []; const params: (string | number | null)[] = [];
    if (id) { conditions.push('id = @param' + params.length); params.push(id); }
    if (start) { conditions.push('meetingDate >= @param' + params.length); params.push(start); }
    if (end) { conditions.push('meetingDate <= @param' + params.length); params.push(end); }
    if (q) {
      const like = '%' + q + '%';
      conditions.push(`(title LIKE @param${params.length} OR summary LIKE @param${params.length} OR unitAResponsibility LIKE @param${params.length} OR unitBResponsibility LIKE @param${params.length})`);
      params.push(like);
    }
    if (conditions.length) sqlText += ' WHERE ' + conditions.join(' AND ');
    sqlText += ' ORDER BY meetingDate DESC, id DESC';
    const notes = await query<any>(sqlText, params) as any[];
    if (!notes.length) return NextResponse.json({ success: true, data: [] });
    const ids = notes.map(n => n.id).join(',');
    let itemsByNote: Record<number, MeetingNoteItem[]> = {};
    try {
      const items = await query<any>(`SELECT id, meetingNoteId, unitName, responsibility, dueDate, status, orderIndex FROM MeetingNoteItems WHERE meetingNoteId IN (${ids}) ORDER BY meetingNoteId, ISNULL(orderIndex,0), id`);
      (items as any[]).forEach(it => {
        if (!itemsByNote[it.meetingNoteId]) itemsByNote[it.meetingNoteId] = [];
        itemsByNote[it.meetingNoteId].push(it);
      });
    } catch (e) {
      // 若子表不存在，略過
    }
    // 將舊 A/B 欄位轉成 items (僅在沒有新 items 時)
    let result = notes.map(n => {
      const enriched = { ...n, items: itemsByNote[n.id] || [] };
      if (!enriched.items.length) {
        const legacy: MeetingNoteItem[] = [];
        if (n.unitAResponsibility || n.unitADueDate || n.unitAStatus) legacy.push({ id: -1, meetingNoteId: n.id, unitName: 'A單位', responsibility: n.unitAResponsibility || '', dueDate: n.unitADueDate, status: n.unitAStatus, orderIndex: 0 });
        if (n.unitBResponsibility || n.unitBDueDate || n.unitBStatus) legacy.push({ id: -2, meetingNoteId: n.id, unitName: 'B單位', responsibility: n.unitBResponsibility || '', dueDate: n.unitBDueDate, status: n.unitBStatus, orderIndex: 1 });
        enriched.items = legacy;
      }
      return enriched;
    });
    // 若 q 存在，針對 items 也做二次過濾
    if (q) {
      const low = q.toLowerCase();
      result = result.filter(r => r.title?.toLowerCase().includes(low) || r.summary?.toLowerCase().includes(low) || (r.items||[]).some((it: any) => (it.unitName+it.responsibility+ (it.status||'')).toLowerCase().includes(low)));
    }
    return NextResponse.json({ success: true, data: result });
  } catch (err) { console.error('[NOTES][GET] 錯誤', err); return NextResponse.json({ success: false, error: '取得會議記錄失敗' }, { status: 500 }); }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { meetingDate, title, summary = '', items = [], unitAResponsibility, unitADueDate, unitAStatus, unitBResponsibility, unitBDueDate, unitBStatus } = body;
    if (!meetingDate || !title) return NextResponse.json({ success: false, error: '缺少 meetingDate 或 title' }, { status: 400 });
    const insertSql = `INSERT INTO MeetingNotes ( meetingDate, title, summary, unitAResponsibility, unitADueDate, unitAStatus, unitBResponsibility, unitBDueDate, unitBStatus, createdAt, updatedAt ) VALUES ( @param0, @param1, @param2, NULL, NULL, NULL, NULL, NULL, NULL, GETDATE(), GETDATE() ); SELECT SCOPE_IDENTITY() as id;`;
    const inserted = await query<any>(insertSql, [ meetingDate, title, summary ]);
    const id = (inserted as any[])[0].id;
    // 插入 items
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it || !it.unitName) continue;
      await query<any>(`INSERT INTO MeetingNoteItems (meetingNoteId, unitName, responsibility, dueDate, status, orderIndex, createdAt, updatedAt) VALUES (@param0,@param1,@param2,@param3,@param4,@param5,GETDATE(),GETDATE())`, [id, it.unitName, it.responsibility || '', it.dueDate || null, it.status || null, i]);
    }
    const row = await query<any>(`SELECT id, meetingDate, title, summary, unitAResponsibility, unitADueDate, unitAStatus, unitBResponsibility, unitBDueDate, unitBStatus, createdAt, updatedAt FROM MeetingNotes WHERE id = @param0`, [id]);
    const itemsInserted = await query<any>(`SELECT id, meetingNoteId, unitName, responsibility, dueDate, status, orderIndex FROM MeetingNoteItems WHERE meetingNoteId=@param0 ORDER BY ISNULL(orderIndex,0), id`, [id]);
    return NextResponse.json({ success: true, data: { ...(row as any[])[0], items: itemsInserted } });
  } catch (err) { console.error('[NOTES][POST] 錯誤', err); return NextResponse.json({ success: false, error: '建立會議記錄失敗' }, { status: 500 }); }
}
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, meetingDate, title, summary = '', items = [] } = body;
    if (!id) return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });
    const updateSql = `UPDATE MeetingNotes SET meetingDate=@param0, title=@param1, summary=@param2, updatedAt=GETDATE() WHERE id=@param3; SELECT id, meetingDate, title, summary, unitAResponsibility, unitADueDate, unitAStatus, unitBResponsibility, unitBDueDate, unitBStatus, createdAt, updatedAt FROM MeetingNotes WHERE id=@param3;`;
    const rows = await query<any>(updateSql, [ meetingDate || null, title || null, summary || '', id ]);
    if (!(rows as any[]).length) return NextResponse.json({ success: false, error: '找不到記錄' }, { status: 404 });
    // 重新寫入 items: 先刪除再插入
    await query<any>('DELETE FROM MeetingNoteItems WHERE meetingNoteId = ' + id, []);
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it || !it.unitName) continue;
      await query<any>(`INSERT INTO MeetingNoteItems (meetingNoteId, unitName, responsibility, dueDate, status, orderIndex, createdAt, updatedAt) VALUES (@param0,@param1,@param2,@param3,@param4,@param5,GETDATE(),GETDATE())`, [id, it.unitName, it.responsibility || '', it.dueDate || null, it.status || null, i]);
    }
    const itemsInserted = await query<any>(`SELECT id, meetingNoteId, unitName, responsibility, dueDate, status, orderIndex FROM MeetingNoteItems WHERE meetingNoteId=@param0 ORDER BY ISNULL(orderIndex,0), id`, [id]);
    return NextResponse.json({ success: true, data: { ...(rows as any[])[0], items: itemsInserted } });
  } catch (err) { console.error('[NOTES][PUT] 錯誤', err); return NextResponse.json({ success: false, error: '更新會議記錄失敗' }, { status: 500 }); }
}
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url); const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 });
    const row = await query<any>(`SELECT id, meetingDate, title FROM MeetingNotes WHERE id = @param0`, [id]);
    if (!(row as any[]).length) return NextResponse.json({ success: false, error: '找不到記錄' }, { status: 404 });
    await query<any>('DELETE FROM MeetingNoteItems WHERE meetingNoteId = ' + id, []);
    await query(`DELETE FROM MeetingNotes WHERE id = @param0`, [id]);
    return NextResponse.json({ success: true, data: (row as any[])[0] });
  } catch (err) { console.error('[NOTES][DELETE] 錯誤', err); return NextResponse.json({ success: false, error: '刪除會議記錄失敗' }, { status: 500 }); }
}
