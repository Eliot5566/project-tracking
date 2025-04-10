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

    const events = await query<CalendarEvent[]>(sqlQuery, params);

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

    const result = await query<{ id: number }[]>(sqlQuery, [
      title,
      description || '',
      startDate,
      endDate,
      type,
      projectId || null,
      taskId || null
    ]);

    const newEvent = await query<CalendarEvent[]>(
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
      [result[0].id]
    );

    return NextResponse.json({
      success: true,
      data: newEvent[0]
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

    const updatedEvent = await query<CalendarEvent[]>(sqlQuery, [
      title,
      description || '',
      startDate,
      endDate,
      type,
      projectId || null,
      taskId || null,
      id
    ]);

    if (updatedEvent.length === 0) {
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
    const eventToDelete = await query<CalendarEvent[]>(
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

    if (eventToDelete.length === 0) {
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