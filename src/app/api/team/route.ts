import { NextRequest, NextResponse } from 'next/server';
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
export async function GET() {
  try {
    const sqlQuery = `
      SELECT 
        tm.id,
        tm.name,
        tm.role,
        tm.email,
        COUNT(DISTINCT p.id) as projectCount,
        COUNT(DISTINCT t.id) as taskCount,
        CASE 
          WHEN COUNT(DISTINCT t.id) = 0 THEN 0
          ELSE CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(DISTINCT t.id) * 100
        END as averageProgress,
        tm.createdAt,
        tm.updatedAt
      FROM TeamMembers tm
      LEFT JOIN Projects p ON tm.id = p.managerId
      LEFT JOIN Tasks t ON tm.id = t.assigneeId
      GROUP BY tm.id, tm.name, tm.role, tm.email, tm.createdAt, tm.updatedAt
      ORDER BY tm.createdAt DESC
    `;
    const result = await query(sqlQuery);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('獲取團隊成員失敗:', error);
    return NextResponse.json({ success: false, error: '獲取團隊成員失敗' }, { status: 500 });
  }
}

// 創建新團隊成員
export async function POST(request: NextRequest) {
  try {
    const { name, role, email } = await request.json();
    
    if (!name || !role || !email) {
      return NextResponse.json({ success: false, error: '缺少必要參數' }, { status: 400 });
    }

    const sqlQuery = `
      INSERT INTO TeamMembers (name, role, email, createdAt, updatedAt)
      VALUES (@param0, @param1, @param2, GETDATE(), GETDATE());
      
      SELECT SCOPE_IDENTITY() as id;
    `;
    
    await query(sqlQuery, [name, role, email]);
    return NextResponse.json({ success: true, message: '添加團隊成員成功' });
  } catch (error) {
    console.error('添加團隊成員失敗:', error);
    return NextResponse.json({ success: false, error: '添加團隊成員失敗' }, { status: 500 });
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