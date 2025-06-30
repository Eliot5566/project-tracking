// src/app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Task {
  id: number;
  title: string;
  description: string;
  projectId: number;
  assignedTo: number;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  projectName?: string;
  assignedToName?: string;
}

interface TaskQueryParams {
  projectId?: number;
  assignedTo?: number;
  status?: string;
  priority?: string;
}

/**
 * GET /api/tasks
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const projectId = searchParams.get('projectId');
    const assignedTo = searchParams.get('assignedTo');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    let sqlQuery = `
      SELECT t.*, 
             p.name as projectName,
             tm.name as assignedToName
      FROM Tasks t
      LEFT JOIN Projects p ON t.projectId = p.id
      LEFT JOIN TeamMembers tm ON t.assignedTo = tm.id
    `;

    const params: (string | number | null)[] = [];
    const conditions: string[] = [];
    let paramIdx = 0;

    if (projectId) {
      const ids = projectId.split(',').map((id) => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        conditions.push(`t.projectId IN (${ids.map((_, i) => `@param${paramIdx + i}`).join(',')})`);
        params.push(...ids.map(Number));
        paramIdx += ids.length;
      }
    }
    if (assignedTo) {
      const ids = assignedTo.split(',').map((id) => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        conditions.push(`t.assignedTo IN (${ids.map((_, i) => `@param${paramIdx + i}`).join(',')})`);
        params.push(...ids.map(Number));
        paramIdx += ids.length;
      }
    }
    if (status) {
      conditions.push(`t.status = @param${paramIdx}`);
      params.push(status);
      paramIdx++;
    }
    if (priority) {
      conditions.push(`t.priority = @param${paramIdx}`);
      params.push(priority);
      paramIdx++;
    }
    if (search) {
      conditions.push(`(t.title LIKE @param${paramIdx} OR t.description LIKE @param${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ');
    }

    sqlQuery += ' ORDER BY t.createdAt DESC';

    const tasks = await query<Task[]>(sqlQuery, params);

    return NextResponse.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('查詢錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '獲取任務列表失敗'
    }, { status: 500 });
  }
}

/**
 * POST /api/tasks
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, projectId, assignedTo, status, priority, startDate, dueDate } = body;

    const sqlQuery = `
      INSERT INTO Tasks (
        title, description, projectId, assignedTo, status, priority, startDate, dueDate,
        createdAt, updatedAt
      )
      VALUES (
        @param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7,
        GETDATE(), GETDATE()
      );
      
      SELECT SCOPE_IDENTITY() as id;
    `;

    const result = await query<{ id: number }[]>(sqlQuery, [
      title,
      description,
      projectId,
      assignedTo,
      status,
      priority,
      startDate,
      dueDate
    ]);

    const newTask = await query<Task[]>(
      `SELECT t.*, p.name as projectName, tm.name as assignedToName
       FROM Tasks t
       LEFT JOIN Projects p ON t.projectId = p.id
       LEFT JOIN TeamMembers tm ON t.assignedTo = tm.id
       WHERE t.id = @param0`,
      [result[0].id]
    );

    return NextResponse.json({
      success: true,
      data: newTask[0]
    });
  } catch (error) {
    console.error('創建任務失敗:', error);
    return NextResponse.json({
      success: false,
      error: '創建任務失敗'
    }, { status: 500 });
  }
}

// 更新任務
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, projectId, assignedTo, status, priority, startDate, dueDate, progress } = body;

    // 如果任務狀態為已完成，自動設置進度為 100
    const finalProgress = status === 'completed' ? 100 : progress || 0;

    const sqlQuery = `
      UPDATE Tasks
      SET 
        title = @param0,
        description = @param1,
        projectId = @param2,
        assignedTo = @param3,
        status = @param4,
        priority = @param5,
        startDate = @param6,
        dueDate = @param7,
        progress = @param8,
        updatedAt = GETDATE()
      WHERE id = @param9;
      
      SELECT 
        t.id,
        t.title,
        t.description,
        t.projectId,
        t.assignedTo,
        t.status,
        t.priority,
        t.startDate,
        t.dueDate,
        t.progress,
        t.createdAt,
        t.updatedAt,
        p.name as projectName,
        tm.name as assignedToName
      FROM Tasks t
      LEFT JOIN Projects p ON t.projectId = p.id
      LEFT JOIN TeamMembers tm ON t.assignedTo = tm.id
      WHERE t.id = @param9;
    `;

    const updatedTask = await query<Task[]>(sqlQuery, [
      title,
      description,
      projectId,
      assignedTo,
      status,
      priority,
      startDate,
      dueDate,
      finalProgress,
      id
    ]);

    if (updatedTask.length === 0) {
      return NextResponse.json({
        success: false,
        error: '找不到指定的任務'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedTask[0]
    });
  } catch (error) {
    console.error('更新錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '更新任務失敗'
    }, { status: 500 });
  }
}

// 刪除任務
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少任務 ID'
      }, { status: 400 });
    }



    // 先查詢要刪除的任務
    const taskToDelete = await query<Task[]>(`
      SELECT t.*, p.name as projectName, tm.name as assignedToName
      FROM Tasks t
      LEFT JOIN Projects p ON t.projectId = p.id
      LEFT JOIN TeamMembers tm ON t.assignedTo = tm.id
      WHERE t.id = @param0;
    `, [id]);

    if (!taskToDelete.length) {
      return NextResponse.json({
        success: false,
        error: '找不到指定的任務'
      }, { status: 404 });
    }

    // 執行刪除
    await query(`DELETE FROM Tasks WHERE id = @param0;`, [id]);

    return NextResponse.json({
      success: true,
      data: taskToDelete[0]
    });
  } catch (error) {
    console.error('刪除任務失敗:', error);
    return NextResponse.json({
      success: false,
      error: '刪除任務失敗'
    }, { status: 500 });
  }
}

