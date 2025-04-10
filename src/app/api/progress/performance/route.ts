// 使用此API提供進度與績效數據
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 定義績效數據接口
interface PerformanceData {
  personalPerformance: PersonalPerformance[];
  projectCompletionRate: ProjectCompletionRate[];
  overallStats: OverallStats;
  timeTracking: TimeTracking[];
}

interface PersonalPerformance {
  memberId: number;
  name: string;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number;
  onTimeRate: number;
  averageDelay: number; // 單位: 天
}

interface ProjectCompletionRate {
  projectId: number;
  name: string;
  plannedDuration: number; // 單位: 天
  actualDuration: number; // 單位: 天
  efficiency: number; // 實際/計畫
  tasksOnTime: number;
  tasksDelayed: number;
  onTimeRate: number;
}

interface OverallStats {
  totalProjects: number;
  completedProjects: number;
  delayedProjects: number;
  projectCompletionRate: number;
  taskCompletionRate: number;
  averageTeamPerformance: number;
}

interface TimeTracking {
  date: string;
  tasksCompleted: number;
  hoursLogged: number;
  efficiency: number; // 任務完成數/工時
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || 'month'; // 'week', 'month', 'quarter', 'year'    // 設定時間範圍
    let taskDateFilter: string;
    let projectDateFilter: string;
    switch (timeRange) {
      case 'week':
        taskDateFilter = "DATEDIFF(day, t.createdAt, GETDATE()) <= 7";
        projectDateFilter = "DATEDIFF(day, p.createdAt, GETDATE()) <= 7";
        break;
      case 'month':
        taskDateFilter = "DATEDIFF(day, t.createdAt, GETDATE()) <= 30";
        projectDateFilter = "DATEDIFF(day, p.createdAt, GETDATE()) <= 30";
        break;
      case 'quarter':
        taskDateFilter = "DATEDIFF(day, t.createdAt, GETDATE()) <= 90";
        projectDateFilter = "DATEDIFF(day, p.createdAt, GETDATE()) <= 90";
        break;
      case 'year':
        taskDateFilter = "DATEDIFF(day, t.createdAt, GETDATE()) <= 365";
        projectDateFilter = "DATEDIFF(day, p.createdAt, GETDATE()) <= 365";
        break;
      default:
        taskDateFilter = "DATEDIFF(day, t.createdAt, GETDATE()) <= 30";
        projectDateFilter = "DATEDIFF(day, p.createdAt, GETDATE()) <= 30";
    }    // 獲取個人績效
    const personalPerformance = await query<PersonalPerformance[]>(`
      SELECT 
        t.assignedTo as memberId,
        m.name,
        COUNT(*) as tasksAssigned,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as tasksCompleted,
        CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as DECIMAL(5,2)) as completionRate,
        CAST(SUM(CASE WHEN t.status = 'completed' AND DATEDIFF(day, t.dueDate, t.updatedAt) <= 0 THEN 1 ELSE 0 END) * 100.0 / 
             NULLIF(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) as DECIMAL(5,2)) as onTimeRate,
        AVG(CASE WHEN t.status = 'completed' AND DATEDIFF(day, t.dueDate, t.updatedAt) > 0 
          THEN DATEDIFF(day, t.dueDate, t.updatedAt) ELSE 0 END) as averageDelay
      FROM Tasks t
      JOIN TeamMembers m ON t.assignedTo = m.id
      WHERE ${taskDateFilter}
      GROUP BY t.assignedTo, m.name
      ORDER BY completionRate DESC
    `);    // 獲取專案完成率數據
    const projectCompletionRate = await query<ProjectCompletionRate[]>(`
      SELECT 
        p.id as projectId,
        p.name,
        DATEDIFF(day, p.startDate, p.endDate) as plannedDuration,
        DATEDIFF(day, p.startDate, CASE WHEN p.status = 'completed' THEN p.updatedAt ELSE GETDATE() END) as actualDuration,
        CAST(DATEDIFF(day, p.startDate, CASE WHEN p.status = 'completed' THEN p.updatedAt ELSE GETDATE() END) * 100.0 / 
             NULLIF(DATEDIFF(day, p.startDate, p.endDate), 0) as DECIMAL(5,2)) as efficiency,
        SUM(CASE WHEN t.status = 'completed' AND DATEDIFF(day, t.dueDate, t.updatedAt) <= 0 THEN 1 ELSE 0 END) as tasksOnTime,
        SUM(CASE WHEN t.status = 'completed' AND DATEDIFF(day, t.dueDate, t.updatedAt) > 0 THEN 1 ELSE 0 END) as tasksDelayed,
        CAST(SUM(CASE WHEN t.status = 'completed' AND DATEDIFF(day, t.dueDate, t.updatedAt) <= 0 THEN 1 ELSE 0 END) * 100.0 / 
             NULLIF(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) as DECIMAL(5,2)) as onTimeRate
      FROM Projects p
      LEFT JOIN Tasks t ON p.id = t.projectId
      WHERE ${projectDateFilter}
      GROUP BY p.id, p.name, p.startDate, p.endDate, p.status, p.updatedAt
      ORDER BY onTimeRate DESC
    `);    // 獲取總體統計數據
    const overallStats = await query<OverallStats[]>(`
      SELECT
        (SELECT COUNT(*) FROM Projects p WHERE ${projectDateFilter}) as totalProjects,
        (SELECT COUNT(*) FROM Projects p WHERE p.status = 'completed' AND ${projectDateFilter}) as completedProjects,
        (SELECT COUNT(*) FROM Projects p WHERE p.status = 'delayed' AND ${projectDateFilter}) as delayedProjects,
        (SELECT CAST(COUNT(CASE WHEN p.status = 'completed' THEN 1 ELSE NULL END) * 100.0 / 
                 NULLIF(COUNT(*), 0) as DECIMAL(5,2))
         FROM Projects p WHERE ${projectDateFilter}) as projectCompletionRate,
        (SELECT CAST(COUNT(CASE WHEN t.status = 'completed' THEN 1 ELSE NULL END) * 100.0 / 
                 NULLIF(COUNT(*), 0) as DECIMAL(5,2))
         FROM Tasks t WHERE ${taskDateFilter}) as taskCompletionRate,
        (SELECT CAST(AVG(completionRate) as DECIMAL(5,2))
         FROM (
           SELECT 
             t.assignedTo,
             CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as DECIMAL(5,2)) as completionRate
           FROM Tasks t
           WHERE ${taskDateFilter}
           GROUP BY t.assignedTo
         ) as TeamPerformance) as averageTeamPerformance
    `);

    // 獲取時間追蹤數據（假設有工時記錄表）
    // 注意：由於範例中未提供實際的工時記錄表，我們使用模擬數據
    const timeTracking: TimeTracking[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - 29 + i);
      
      // 生成假數據
      const tasksCompleted = Math.floor(Math.random() * 5) + 1;
      const hoursLogged = Math.floor(Math.random() * 8) + 4;
      
      timeTracking.push({
        date: date.toISOString().split('T')[0],
        tasksCompleted,
        hoursLogged,
        efficiency: parseFloat((tasksCompleted / hoursLogged).toFixed(2))
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        personalPerformance,
        projectCompletionRate,
        overallStats: overallStats[0],
        timeTracking
      }
    });
  } catch (error) {
    console.error('獲取績效數據錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '獲取績效數據失敗'
    }, { status: 500 });
  }
}
