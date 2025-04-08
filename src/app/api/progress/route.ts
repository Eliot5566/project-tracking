import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
        COUNT(t.id) as totalTasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(t.id) * 100
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

    sqlQuery += ' GROUP BY p.id, p.name, p.description, p.status, p.startDate, p.endDate, p.createdAt, p.updatedAt';
    sqlQuery += ' ORDER BY p.createdAt DESC';

    const progress = await query<ProjectProgress[]>(sqlQuery, params);

    return NextResponse.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('查詢錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '獲取進度資訊失敗'
    }, { status: 500 });
  }
} 