// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

import sql from 'mssql';


import { getConnectionPool } from '@/app/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pool = await getConnectionPool();
    const { id } = params;  // 動態路由參數
    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .query('SELECT * FROM [ProjectTracking].[dbo].[Tasks] WHERE task_id = @id');

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: '找不到任務' }, { status: 404 });
    }
    return NextResponse.json({ task: result.recordset[0] }, { status: 200 });
  } catch (error) {
    console.error('取得單一任務失敗:', error);
    return NextResponse.json({ error: '取得單一任務失敗' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { title, description, status, priority } = body;

    const pool = await getConnectionPool();
    await pool.request()
      .input('id', sql.Int, Number(id))
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description)
      .input('status', sql.NVarChar, status)
      .input('priority', sql.NVarChar, priority)
      .query(`
        UPDATE [ProjectTracking].[dbo].[Tasks]
        SET title = @title,
            description = @description,
            status = @status,
            priority = @priority,
            updated_at = GETDATE()
        WHERE task_id = @id
      `);

    return NextResponse.json({ message: '更新成功' }, { status: 200 });
  } catch (error) {
    console.error('更新任務失敗:', error);
    return NextResponse.json({ error: '更新任務失敗' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pool = await getConnectionPool();
    const { id } = params;
    await pool.request()
      .input('id', sql.Int, Number(id))
      .query('DELETE FROM [ProjectTracking].[dbo].[Tasks] WHERE task_id = @id');

    return NextResponse.json({ message: '刪除成功' }, { status: 200 });
  } catch (error) {
    console.error('刪除任務失敗:', error);
    return NextResponse.json({ error: '刪除任務失敗' }, { status: 500 });
  }
}
