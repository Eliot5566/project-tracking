// 通知系統 API 路由
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '缺少用戶ID參數'
      }, { status: 400 });
    }

    const notifications = await query<Notification[]>(
      `SELECT * FROM Notifications 
      WHERE userId = @param0 
      ORDER BY createdAt DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('查詢通知錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '獲取通知失敗'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, content, type } = body;

    if (!userId || !title || !type) {
      return NextResponse.json({
        success: false,
        error: '缺少必要參數'
      }, { status: 400 });
    }

    await query(
      `INSERT INTO Notifications (userId, title, content, type, isRead, createdAt)
      VALUES (@param0, @param1, @param2, @param3, 0, GETDATE())`,
      [userId, title, content || '', type]
    );

    return NextResponse.json({
      success: true,
      message: '創建通知成功'
    });
  } catch (error) {
    console.error('創建通知錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '創建通知失敗'
    }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, isRead } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少通知ID'
      }, { status: 400 });
    }

    await query(
      `UPDATE Notifications 
      SET isRead = @param1
      WHERE id = @param0`,
      [id, isRead ? 1 : 0]
    );

    return NextResponse.json({
      success: true,
      message: '更新通知狀態成功'
    });
  } catch (error) {
    console.error('更新通知狀態錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '更新通知狀態失敗'
    }, { status: 500 });
  }
}
