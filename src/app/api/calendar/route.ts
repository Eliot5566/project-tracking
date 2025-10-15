if (typeof window !== 'undefined') {
  throw new Error('`calendar/route.ts` should only be used on the server side.');
}

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
  projectId: number | null;
  taskId: number | null;
  projectName?: string;
  taskName?: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');

    let sqlQuery = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.startDate,
        e.endDate,
        e.type,
        e.projectId,
        e.taskId,
        p.name as projectName,
        t.title as taskName,
        e.createdAt,
        e.updatedAt
      FROM CalendarEvents e
      LEFT JOIN Projects p ON e.projectId = p.id
      LEFT JOIN Tasks t ON e.taskId = t.id
    `;

    const params: (string | number | null)[] = [];
    const conditions: string[] = [];

    if (startDate) {
      conditions.push('e.startDate >= @param' + params.length);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('e.endDate <= @param' + params.length);
      params.push(endDate);
    }

    if (type) {
      conditions.push('e.type = @param' + params.length);
      params.push(type);
    }

    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ');
    }

    sqlQuery += ' ORDER BY e.startDate ASC';

  const raw = await query<CalendarEvent[] | any>(sqlQuery, params);
  const events: CalendarEvent[] = Array.isArray(raw) ? raw : (Array.isArray((raw as any)?.recordset) ? (raw as any).recordset : []);

    return NextResponse.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('查詢錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '獲取行事曆事件失敗'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, startDate, endDate, type, projectId, taskId } = body;

    if (!title || !startDate || !endDate || !type) {
      return NextResponse.json({
        success: false,
        error: '缺少必要參數'
      }, { status: 400 });
    }

    const sqlQuery = `
      INSERT INTO CalendarEvents (
        title, description, startDate, endDate, type,
        projectId, taskId, createdAt, updatedAt
      )
      VALUES (
        @param0, @param1, @param2, @param3, @param4,
        @param5, @param6, GETDATE(), GETDATE()
      );
      
      SELECT SCOPE_IDENTITY() as id;
    `;

    const insertResult: any = await query<any>(sqlQuery, [
      title,
      description || '',
      startDate,
      endDate,
      type,
      projectId || null,
      taskId || null
    ]);

    // 從可能的回傳型別安全地取得新 ID（recordset 或 array）
    let insertedId: number | undefined;
    if (Array.isArray(insertResult)) {
      insertedId = insertResult[0]?.id;
    } else if (insertResult && Array.isArray(insertResult.recordset)) {
      insertedId = insertResult.recordset[0]?.id;
    } else if (insertResult && typeof insertResult.id === 'number') {
      insertedId = insertResult.id;
    }

    if (!insertedId) {
      return NextResponse.json({ success: false, error: '無法取得新事件 ID' }, { status: 500 });
    }

    const newEventRaw = await query<CalendarEvent[] | any>(
      `SELECT 
        e.id,
        e.title,
        e.description,
        e.startDate,
        e.endDate,
        e.type,
        e.projectId,
        e.taskId,
        p.name as projectName,
        t.title as taskName,
        e.createdAt,
        e.updatedAt
       FROM CalendarEvents e
       LEFT JOIN Projects p ON e.projectId = p.id
       LEFT JOIN Tasks t ON e.taskId = t.id
  WHERE e.id = @param0`,
      [insertedId]
    );
    const newEventArr: CalendarEvent[] = Array.isArray(newEventRaw) ? newEventRaw : (Array.isArray((newEventRaw as any)?.recordset) ? (newEventRaw as any).recordset : []);

    return NextResponse.json({
      success: true,
      data: newEventArr[0]
    });
  } catch (error) {
    console.error('創建錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '創建行事曆事件失敗'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, startDate, endDate, type, projectId, taskId } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少事件 ID'
      }, { status: 400 });
    }

    const sqlQuery = `
      UPDATE CalendarEvents
      SET 
        title = @param0,
        description = @param1,
        startDate = @param2,
        endDate = @param3,
        type = @param4,
        projectId = @param5,
        taskId = @param6,
        updatedAt = GETDATE()
      WHERE id = @param7;
      
      SELECT 
        e.id,
        e.title,
        e.description,
        e.startDate,
        e.endDate,
        e.type,
        e.projectId,
        e.taskId,
        p.name as projectName,
        t.title as taskName,
        e.createdAt,
        e.updatedAt
      FROM CalendarEvents e
      LEFT JOIN Projects p ON e.projectId = p.id
      LEFT JOIN Tasks t ON e.taskId = t.id
      WHERE e.id = @param7;
    `;

  const updatedEventRaw = await query<CalendarEvent[] | any>(sqlQuery, [
      title,
      description || '',
      startDate,
      endDate,
      type,
      projectId || null,
      taskId || null,
      id
    ]);
  const updatedEvent: CalendarEvent[] = Array.isArray(updatedEventRaw) ? updatedEventRaw : (Array.isArray((updatedEventRaw as any)?.recordset) ? (updatedEventRaw as any).recordset : []);

  if (!updatedEvent || updatedEvent.length === 0) {
      return NextResponse.json({
        success: false,
        error: '找不到指定的事件'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedEvent[0]
    });
  } catch (error) {
    console.error('更新錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '更新行事曆事件失敗'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少事件 ID'
      }, { status: 400 });
    }

    // 先獲取要刪除的事件資訊
  const eventToDeleteRaw = await query<CalendarEvent[] | any>(
      `SELECT 
        e.id,
        e.title,
        e.description,
        e.startDate,
        e.endDate,
        e.type,
        e.projectId,
        e.taskId,
        p.name as projectName,
        t.title as taskName,
        e.createdAt,
        e.updatedAt
       FROM CalendarEvents e
       LEFT JOIN Projects p ON e.projectId = p.id
       LEFT JOIN Tasks t ON e.taskId = t.id
       WHERE e.id = @param0`,
      [id]
    );
  const eventToDelete: CalendarEvent[] = Array.isArray(eventToDeleteRaw) ? eventToDeleteRaw : (Array.isArray((eventToDeleteRaw as any)?.recordset) ? (eventToDeleteRaw as any).recordset : []);

  if (!eventToDelete || eventToDelete.length === 0) {
      return NextResponse.json({
        success: false,
        error: '找不到指定的事件'
      }, { status: 404 });
    }

    // 執行刪除操作
    await query(
      'DELETE FROM CalendarEvents WHERE id = @param0',
      [id]
    );

    return NextResponse.json({
      success: true,
      data: eventToDelete[0]
    });
  } catch (error) {
    console.error('刪除錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '刪除行事曆事件失敗'
    }, { status: 500 });
  }
}