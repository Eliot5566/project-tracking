import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 獲取所有事件
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');

    let sql = `
      SELECT *
      FROM Events
      WHERE 1=1
    `;
    const params: any[] = [];

    if (startDate) {
      sql += ` AND startDate >= @startDate`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND startDate <= @endDate`;
      params.push(endDate);
    }
    if (type) {
      sql += ` AND type = @type`;
      params.push(type);
    }

    sql += ` ORDER BY startDate ASC`;

    const events = await query(sql, params);
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error('獲取事件列表失敗:', error);
    return NextResponse.json({ 
      success: false, 
      message: '獲取事件列表失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}

// 創建新事件
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, type, startDate, endDate } = body;

    const result = await query(`
      INSERT INTO Events (title, description, type, startDate, endDate)
      OUTPUT INSERTED.*
      VALUES (@title, @description, @type, @startDate, @endDate)
    `, [title, description, type, startDate, endDate]);

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('創建事件失敗:', error);
    return NextResponse.json({ 
      success: false, 
      message: '創建事件失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}

// 更新事件
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, type, startDate, endDate } = body;

    const result = await query(`
      UPDATE Events
      SET 
        title = @title,
        description = @description,
        type = @type,
        startDate = @startDate,
        endDate = @endDate,
        updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id
    `, [id, title, description, type, startDate, endDate]);

    if (!result[0]) {
      return NextResponse.json({ 
        success: false, 
        message: '事件不存在' 
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('更新事件失敗:', error);
    return NextResponse.json({ 
      success: false, 
      message: '更新事件失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}

// 刪除事件
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少事件 ID' 
      }, { status: 400 });
    }

    const result = await query(`
      DELETE FROM Events
      OUTPUT DELETED.*
      WHERE id = @id
    `, [id]);

    if (!result[0]) {
      return NextResponse.json({ 
        success: false, 
        message: '事件不存在' 
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('刪除事件失敗:', error);
    return NextResponse.json({ 
      success: false, 
      message: '刪除事件失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
} 