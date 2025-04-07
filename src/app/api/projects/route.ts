import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  averageProgress?: number;
}

// 獲取所有專案
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let sqlQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.startDate,
        p.endDate,
        p.createdAt,
        p.updatedAt,
        COUNT(t.id) as taskCount,
        AVG(CAST(t.progress AS FLOAT)) as averageProgress
      FROM Projects p
      LEFT JOIN Tasks t ON p.id = t.projectId
    `;

    const params: (string | number | null)[] = [];
    const conditions: string[] = [];

    if (status) {
      conditions.push('p.status = @param0');
      params.push(status);
    }

    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ');
    }

    sqlQuery += ' GROUP BY p.id, p.name, p.description, p.status, p.startDate, p.endDate, p.createdAt, p.updatedAt';
    sqlQuery += ' ORDER BY p.createdAt DESC';

    const projects = await query<Project[]>(sqlQuery, params);

    return NextResponse.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('查詢錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '獲取專案列表失敗'
    }, { status: 500 });
  }
}

// 創建新專案
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, status, startDate, endDate } = body;

    const sqlQuery = `
      INSERT INTO Projects (
        name, description, status, startDate, endDate,
        createdAt, updatedAt
      )
      VALUES (
        @param0, @param1, @param2, @param3, @param4,
        GETDATE(), GETDATE()
      );
      
      SELECT SCOPE_IDENTITY() as id;
    `;

    const result = await query<{ id: number }[]>(sqlQuery, [
      name,
      description,
      status,
      startDate,
      endDate
    ]);

    const newProject = await query<Project[]>(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.startDate,
        p.endDate,
        p.createdAt,
        p.updatedAt,
        COUNT(t.id) as taskCount,
        AVG(CAST(t.progress AS FLOAT)) as averageProgress
       FROM Projects p
       LEFT JOIN Tasks t ON p.id = t.projectId
       WHERE p.id = @param0
       GROUP BY p.id, p.name, p.description, p.status, p.startDate, p.endDate, p.createdAt, p.updatedAt`,
      [result[0].id]
    );

    return NextResponse.json({
      success: true,
      data: newProject[0]
    });
  } catch (error) {
    console.error('創建錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '創建專案失敗'
    }, { status: 500 });
  }
}

// 更新專案
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, status, startDate, endDate } = body;

    const sqlQuery = `
      UPDATE Projects
      SET 
        name = @param0,
        description = @param1,
        status = @param2,
        startDate = @param3,
        endDate = @param4,
        updatedAt = GETDATE()
      WHERE id = @param5;
      
      SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.startDate,
        p.endDate,
        p.createdAt,
        p.updatedAt,
        COUNT(t.id) as taskCount,
        AVG(CAST(t.progress AS FLOAT)) as averageProgress
      FROM Projects p
      LEFT JOIN Tasks t ON p.id = t.projectId
      WHERE p.id = @param5
      GROUP BY p.id, p.name, p.description, p.status, p.startDate, p.endDate, p.createdAt, p.updatedAt;
    `;

    const updatedProject = await query<Project[]>(sqlQuery, [
      name,
      description,
      status,
      startDate,
      endDate,
      id
    ]);

    if (updatedProject.length === 0) {
      return NextResponse.json({
        success: false,
        error: '找不到指定的專案'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedProject[0]
    });
  } catch (error) {
    console.error('更新錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '更新專案失敗'
    }, { status: 500 });
  }
}

// 刪除專案
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少專案 ID'
      }, { status: 400 });
    }

    // 先獲取要刪除的專案資訊
    const projectToDelete = await query<Project[]>(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.startDate,
        p.endDate,
        p.createdAt,
        p.updatedAt,
        COUNT(t.id) as taskCount,
        AVG(CAST(t.progress AS FLOAT)) as averageProgress
      FROM Projects p
      LEFT JOIN Tasks t ON p.id = t.projectId
      WHERE p.id = @param0
      GROUP BY p.id, p.name, p.description, p.status, p.startDate, p.endDate, p.createdAt, p.updatedAt`,
      [id]
    );

    if (projectToDelete.length === 0) {
      return NextResponse.json({
        success: false,
        error: '找不到指定的專案'
      }, { status: 404 });
    }

    // 執行刪除操作
    await query(
      `DELETE FROM Projects WHERE id = @param0`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: projectToDelete[0]
    });
  } catch (error) {
    console.error('刪除錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '刪除專案失敗'
    }, { status: 500 });
  }
} 