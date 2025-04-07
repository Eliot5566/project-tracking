import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  projectId: number | null;
  taskId: number | null;
  projectName?: string;
  taskName?: string;
  createdAt: string;
  updatedAt: string;
}

// 獲取所有通知
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get('isRead');
    const type = searchParams.get('type');

    let sqlQuery = `
      SELECT 
        n.id,
        n.title,
        n.content,
        n.type,
        n.isRead,
        n.projectId,
        n.taskId,
        p.name as projectName,
        t.name as taskName,
        n.createdAt,
        n.updatedAt
      FROM Notifications n
      LEFT JOIN Projects p ON n.projectId = p.id
      LEFT JOIN Tasks t ON n.taskId = t.id
    `;

    const params: (string | number | null)[] = [];
    const conditions: string[] = [];

    if (isRead !== null) {
      conditions.push('n.isRead = @param' + params.length);
      params.push(isRead === 'true' ? 1 : 0);
    }

    if (type) {
      conditions.push('n.type = @param' + params.length);
      params.push(type);
    }

    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ');
    }

    sqlQuery += ' ORDER BY n.createdAt DESC';

    const notifications = await query<Notification[]>(sqlQuery, params);

    return NextResponse.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('查詢錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '獲取通知列表失敗'
    }, { status: 500 });
  }
}

// 創建新通知
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, type, projectId, taskId } = body;

    const sqlQuery = `
      INSERT INTO Notifications (
        title, content, type, isRead,
        projectId, taskId, createdAt, updatedAt
      )
      VALUES (
        @param0, @param1, @param2, 0,
        @param3, @param4, GETDATE(), GETDATE()
      );
      
      SELECT SCOPE_IDENTITY() as id;
    `;

    const result = await query<{ id: number }[]>(sqlQuery, [
      title,
      content,
      type,
      projectId,
      taskId
    ]);

    const newNotification = await query<Notification[]>(
      `SELECT 
        n.id,
        n.title,
        n.content,
        n.type,
        n.isRead,
        n.projectId,
        n.taskId,
        p.name as projectName,
        t.name as taskName,
        n.createdAt,
        n.updatedAt
       FROM Notifications n
       LEFT JOIN Projects p ON n.projectId = p.id
       LEFT JOIN Tasks t ON n.taskId = t.id
       WHERE n.id = @param0`,
      [result[0].id]
    );

    return NextResponse.json({
      success: true,
      data: newNotification[0]
    });
  } catch (error) {
    console.error('創建錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '創建通知失敗'
    }, { status: 500 });
  }
}

// 更新通知狀態
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, content, type, isRead, projectId, taskId } = body;

    const sqlQuery = `
      UPDATE Notifications
      SET 
        title = @param0,
        content = @param1,
        type = @param2,
        isRead = @param3,
        projectId = @param4,
        taskId = @param5,
        updatedAt = GETDATE()
      WHERE id = @param6;
      
      SELECT 
        n.id,
        n.title,
        n.content,
        n.type,
        n.isRead,
        n.projectId,
        n.taskId,
        p.name as projectName,
        t.name as taskName,
        n.createdAt,
        n.updatedAt
      FROM Notifications n
      LEFT JOIN Projects p ON n.projectId = p.id
      LEFT JOIN Tasks t ON n.taskId = t.id
      WHERE n.id = @param6;
    `;

    const updatedNotification = await query<Notification[]>(sqlQuery, [
      title,
      content,
      type,
      isRead ? 1 : 0,
      projectId,
      taskId,
      id
    ]);

    if (updatedNotification.length === 0) {
      return NextResponse.json({
        success: false,
        error: '找不到指定的通知'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedNotification[0]
    });
  } catch (error) {
    console.error('更新錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '更新通知失敗'
    }, { status: 500 });
  }
}

// 刪除通知
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少通知 ID'
      }, { status: 400 });
    }

    // 先獲取要刪除的通知資訊
    const notificationToDelete = await query<Notification[]>(
      `SELECT 
        n.id,
        n.title,
        n.content,
        n.type,
        n.isRead,
        n.projectId,
        n.taskId,
        p.name as projectName,
        t.name as taskName,
        n.createdAt,
        n.updatedAt
       FROM Notifications n
       LEFT JOIN Projects p ON n.projectId = p.id
       LEFT JOIN Tasks t ON n.taskId = t.id
       WHERE n.id = @param0`,
      [id]
    );

    if (notificationToDelete.length === 0) {
      return NextResponse.json({
        success: false,
        error: '找不到指定的通知'
      }, { status: 404 });
    }

    // 執行刪除操作
    await query(
      `DELETE FROM Notifications WHERE id = @param0`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: notificationToDelete[0]
    });
  } catch (error) {
    console.error('刪除錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '刪除通知失敗'
    }, { status: 500 });
  }
} 