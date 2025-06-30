import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 專案進度資料型別
// 包含專案ID、名稱、描述、狀態、開始日期、結束日期、總任務數、已完成任務數、進度百分比等
// 定義的型別 可以幫助 TypeScript 檢查資料結構的正確性
// 這樣可以確保在使用這些資料時，能夠獲得正確的屬性和類型提示
// 這對於大型應用程式特別有用，因為它可以幫助開發者更容易地理解和維護代碼
// 這樣的定義也有助於在編譯時捕捉錯誤，從而提高代碼的穩定性和可讀性
// 這裡的專案進度資料型別包含了專案的基本資訊以及任務的統計數據
// 這些資訊可以用來顯示專案的進度和狀態，並且可以用於後續的分析和報告
interface ProjectProgress {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// 獲取專案進度資訊
// 這個 API 端點用於獲取專案的進度資訊
// 可以根據狀態過濾專案，例如：active, completed, delayed 等
// 返回的資料包含專案的基本資訊以及任務的統計數據
// 這些資訊可以用來顯示專案的進度和狀態，並且可以用於後續的分析和報告
// 這個 API 可以用於前端顯示專案進度，或者用於後端分析專案績效
// 這樣的設計可以提高系統的靈活性和可擴展性，並且可以更好地滿足業務需求
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
        COUNT(DISTINCT t.id) as totalTasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
        CASE 
          WHEN COUNT(DISTINCT t.id) = 0 THEN 0
          ELSE CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(DISTINCT t.id) * 100
        END as progress
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

    sqlQuery +=
      ' GROUP BY p.id, p.name, p.description, p.status, p.startDate, p.endDate, p.createdAt, p.updatedAt';
    sqlQuery += ' ORDER BY p.createdAt DESC';

    const progress = await query<ProjectProgress[]>(sqlQuery, params);

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('查詢錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: '獲取進度資訊失敗',
      },
      { status: 500 }
    );
  }
}
