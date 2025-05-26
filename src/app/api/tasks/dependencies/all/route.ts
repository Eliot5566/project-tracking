import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const all = await query<any[]>(
      `SELECT td.*, t1.title AS taskTitle, t2.title AS dependsOnTaskTitle
       FROM TaskDependencies td
       JOIN Tasks t1 ON td.taskId = t1.id
       JOIN Tasks t2 ON td.dependsOnTaskId = t2.id`
    );
    return NextResponse.json({ success: true, data: all });
  } catch (error) {
    console.error('獲取所有依賴關係錯誤:', error);
    return NextResponse.json({ success: false, error: '獲取所有依賴關係失敗' }, { status: 500 });
  }
}
