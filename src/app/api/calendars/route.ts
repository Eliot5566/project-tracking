import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 支援 GET（查詢）、POST（新增）、PUT（編輯）、DELETE（刪除）
export async function GET() {
  try {
    const tasksRaw = await query(`
      SELECT id, title, startDate, dueDate FROM Tasks
    `);
    const projectsRaw = await query(`
      SELECT id, name, startDate, endDate FROM Projects
    `);

    // 將各種可能的回傳型別（array 或 mssql 的 recordset）正規化為陣列
    const tasks: any[] = Array.isArray(tasksRaw)
      ? tasksRaw
      : (Array.isArray((tasksRaw as any)?.recordset) ? (tasksRaw as any).recordset : []);
    const projects: any[] = Array.isArray(projectsRaw)
      ? projectsRaw
      : (Array.isArray((projectsRaw as any)?.recordset) ? (projectsRaw as any).recordset : []);

    const events = [
      ...tasks.map((t: any) => ({
        id: `task-${t.id}`,
        type: 'task',
        title: `[任務] ${t.title}`,
        start: t.startDate,
        end: t.dueDate || t.startDate,
        allDay: true,
      })),
      ...projects.map((p: any) => ({
        id: `project-${p.id}`,
        type: 'project',
        title: `[專案] ${p.name}`,
        start: p.startDate,
        end: p.endDate || p.startDate,
        allDay: true,
      })),
    ];

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return NextResponse.json({ success: false, error: '載入日曆資料失敗' }, { status: 500 });
  }
}

// 新增事件（僅示範任務）
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, start, end, type } = body;
    if (!title || !start) {
      return NextResponse.json({ success: false, error: '缺少必要欄位' }, { status: 400 });
    }
    if (type === 'task') {
      await query(
        `INSERT INTO Tasks (title, startDate, dueDate) VALUES (@param0, @param1, @param2)`,
        [title, start, end || start]
      );
    } else if (type === 'project') {
      await query(
        `INSERT INTO Projects (name, startDate, endDate) VALUES (@param0, @param1, @param2)`,
        [title, start, end || start]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: '新增事件失敗' }, { status: 500 });
  }
}

// 編輯事件（僅示範任務）
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, start, end, type } = body;
    if (!id || !start) {
      return NextResponse.json({ success: false, error: '缺少必要欄位' }, { status: 400 });
    }
    if (type === 'task') {
      await query(
        `UPDATE Tasks SET title=@param0, startDate=@param1, dueDate=@param2 WHERE id=@param3`,
        [title, start, end || start, id.replace('task-', '')]
      );
    } else if (type === 'project') {
      await query(
        `UPDATE Projects SET name=@param0, startDate=@param1, endDate=@param2 WHERE id=@param3`,
        [title, start, end || start, id.replace('project-', '')]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: '更新事件失敗' }, { status: 500 });
  }
}

// 刪除事件（僅示範任務）
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    if (!id || !type) {
      return NextResponse.json({ success: false, error: '缺少必要參數' }, { status: 400 });
    }
    if (type === 'task') {
      await query(`DELETE FROM Tasks WHERE id=@param0`, [id.replace('task-', '')]);
    } else if (type === 'project') {
      await query(`DELETE FROM Projects WHERE id=@param0`, [id.replace('project-', '')]);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: '刪除事件失敗' }, { status: 500 });
  }
}