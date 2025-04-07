import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  status: string;
  email: string;
  taskCount: number;
  averageProgress: number;
  createdAt: string;
  updatedAt: string;
}

// 獲取所有團隊成員
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');

    let sqlQuery = `
      SELECT 
        tm.*,
        COUNT(t.id) as taskCount,
        AVG(t.progress) as averageProgress
      FROM TeamMembers tm
      LEFT JOIN Tasks t ON tm.id = t.assignedTo
    `;

    const params: (string | number | null)[] = [];
    const conditions: string[] = [];

    if (department) {
      conditions.push('tm.department = @param0');
      params.push(department);
    }

    if (status) {
      conditions.push('tm.status = @param1');
      params.push(status);
    }

    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ');
    }

    sqlQuery += `
      GROUP BY tm.id, tm.name, tm.role, tm.department, tm.status, tm.email, tm.createdAt, tm.updatedAt
      ORDER BY tm.createdAt DESC
    `;

    const teamMembers = await query<TeamMember[]>(sqlQuery, params);

    return NextResponse.json({
      success: true,
      data: teamMembers
    });
  } catch (error) {
    console.error('查詢錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '獲取團隊成員列表失敗'
    }, { status: 500 });
  }
}

// 創建新團隊成員
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, department, email } = body;

    const sqlQuery = `
      INSERT INTO TeamMembers (name, role, department, status, email, createdAt, updatedAt)
      VALUES (@param0, @param1, @param2, @param3, @param4, GETDATE(), GETDATE());
      
      SELECT SCOPE_IDENTITY() as id;
    `;

    const result = await query<{ id: number }[]>(sqlQuery, [
      name,
      role,
      department,
      'active',
      email
    ]);

    const newMember = await query<TeamMember[]>(
      `SELECT * FROM TeamMembers WHERE id = @param0`,
      [result[0].id]
    );

    return NextResponse.json({
      success: true,
      data: newMember[0]
    });
  } catch (error) {
    console.error('創建團隊成員失敗:', error);
    return NextResponse.json({
      success: false,
      error: '創建團隊成員失敗'
    }, { status: 500 });
  }
}

// 更新團隊成員
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, role, department, email } = body;

    const sqlQuery = `
      UPDATE TeamMembers
      SET 
        name = @param0,
        role = @param1,
        department = @param2,
        email = @param3,
        updatedAt = GETDATE()
      WHERE id = @param4;
      
      SELECT * FROM TeamMembers WHERE id = @param4;
    `;

    const updatedMember = await query<TeamMember[]>(sqlQuery, [
      name,
      role,
      department,
      email,
      id
    ]);

    if (updatedMember.length === 0) {
      return NextResponse.json({
        success: false,
        error: '找不到指定的團隊成員'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedMember[0]
    });
  } catch (error) {
    console.error('更新團隊成員失敗:', error);
    return NextResponse.json({
      success: false,
      error: '更新團隊成員失敗'
    }, { status: 500 });
  }
}

// 刪除團隊成員
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少團隊成員 ID'
      }, { status: 400 });
    }

    const sqlQuery = `
      DELETE FROM TeamMembers
      WHERE id = @param0;
      
      SELECT * FROM TeamMembers WHERE id = @param0;
    `;

    const deletedMember = await query<TeamMember[]>(sqlQuery, [id]);

    if (deletedMember.length === 0) {
      return NextResponse.json({
        success: false,
        error: '找不到指定的團隊成員'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: deletedMember[0]
    });
  } catch (error) {
    console.error('刪除團隊成員失敗:', error);
    return NextResponse.json({
      success: false,
      error: '刪除團隊成員失敗'
    }, { status: 500 });
  }
} 