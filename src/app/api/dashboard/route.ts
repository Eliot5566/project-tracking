import { getConnection, query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
 
export const dynamic = 'force-dynamic'; // 確保不緩存API響應
 
export async function GET() {
  try {
    const taskStatsQuery = `
      SELECT
        COUNT(*) AS totalTasks,
        SUM(CASE WHEN LOWER(status) = 'completed' THEN 1 ELSE 0 END) AS completedTasks,
        SUM(CASE WHEN LOWER(status) = 'in_progress' THEN 1 ELSE 0 END) AS inProgressTasks,
        SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END) AS pendingTasks,
        SUM(CASE WHEN dueDate < GETDATE() AND LOWER(status) != 'completed' THEN 1 ELSE 0 END) AS overdueTasks,
        CAST(SUM(CASE WHEN LOWER(status) = 'completed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5, 2)) AS completionRate
      FROM Tasks
    `;
    const taskStats = await query<any[]>(taskStatsQuery);
 
    const projectStatsQuery = `
      SELECT
        COUNT(*) AS totalProjects,
        SUM(CASE WHEN LOWER(status) = '進行中' THEN 1 ELSE 0 END) AS activeProjects,
        SUM(CASE WHEN LOWER(status) = '已完成' THEN 1 ELSE 0 END) AS completedProjects,
        SUM(CASE WHEN LOWER(status) = '已暫停' THEN 1 ELSE 0 END) AS delayedProjects
      FROM Projects
    `;
    const projectStats = await query<any[]>(projectStatsQuery);
 
    const teamStatsQuery = `
      SELECT
        COUNT(*) AS totalMembers,
        SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) AS activeMembers
      FROM TeamMembers
    `;
    const teamStats = await query<any[]>(teamStatsQuery);
 
    const recentProjectsQuery = `
      SELECT TOP 5
        id AS id,
        name AS projectName,
        progress AS progress,
        FORMAT(startDate, 'yyyy-MM-dd') AS startDate,
        FORMAT(endDate, 'yyyy-MM-dd') AS endDate,
        status AS status
      FROM Projects
      WHERE endDate IS NOT NULL
      ORDER BY createdAt DESC
    `;
    const recentProjects = await query<any[]>(recentProjectsQuery);
 
    const recentTasksQuery = `
      SELECT TOP 5
        t.id AS id,
        t.title AS title,
        tm.name AS assignee,
        FORMAT(t.dueDate, 'yyyy-MM-dd') AS dueDate,
        t.status AS status,
        t.priority AS priority
      FROM Tasks t
      LEFT JOIN TeamMembers tm ON t.assignedTo = tm.id
      WHERE t.dueDate IS NOT NULL
      ORDER BY t.createdAt DESC
    `;
    const recentTasks = await query<any[]>(recentTasksQuery);
 
    const projectProgressQuery = `
      SELECT
        name AS projectName,
        progress AS progress
      FROM Projects
      WHERE status = '進行中'
      ORDER BY progress DESC
    `;
    const projectProgress = await query<any[]>(projectProgressQuery);
 
    const taskDistributionQuery = `
      SELECT
        status AS category,
        COUNT(*) AS count
      FROM Tasks
      GROUP BY status
    `;
    const taskDistribution = await query<any[]>(taskDistributionQuery);
 
    const upcomingDeadlinesQuery = `
      SELECT TOP 5
        id AS id,
        title AS title,
        'Task' AS type,
        FORMAT(dueDate, 'yyyy-MM-dd') AS dueDate,
        DATEDIFF(day, GETDATE(), dueDate) AS daysLeft
      FROM Tasks
      WHERE status != '已完成' AND dueDate >= GETDATE()
      ORDER BY dueDate
    `;
    const upcomingDeadlines = await query<any[]>(upcomingDeadlinesQuery);
 
    const weeklyProgressQuery = `
      SELECT
        CONVERT(varchar(10), createdAt, 120) AS day,
        COUNT(*) AS created,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
      FROM Tasks
      WHERE createdAt >= DATEADD(day, -6, CAST(GETDATE() AS DATE))
      GROUP BY CONVERT(varchar(10), createdAt, 120)
      ORDER BY day;
    `;
    const weeklyProgress = await query<any[]>(weeklyProgressQuery);
 
    const teamWorkloadQuery = `
      SELECT
        tm.name,
        COUNT(DISTINCT p.id) AS activeProjects,
        COUNT(t.id) AS activeTasks,
        CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) * 1.0 / NULLIF(COUNT(t.id), 0) * 100 AS INT) AS completionRate
      FROM TeamMembers tm
      LEFT JOIN Tasks t ON t.assignedTo = tm.id
      LEFT JOIN Projects p ON p.id = t.projectId AND p.status = '進行中'
      GROUP BY tm.name;
    `;
    const teamWorkload = await query<any[]>(teamWorkloadQuery);
 
    const recentActivitiesQuery = `
      SELECT TOP 5
        p.name AS project,
        t.title AS activity,
        t.status,
        FORMAT(t.updatedAt, 'yyyy-MM-dd') AS date
      FROM Tasks t
      LEFT JOIN Projects p ON p.id = t.projectId
      ORDER BY t.updatedAt DESC;
    `;
    const recentActivities = await query<any[]>(recentActivitiesQuery);
 
 
 
    const taskStatusColorMap: Record<string, string> = {
      completed: '#52c41a',
      in_progress: '#1890ff',
      delayed: '#ff4d4f',
      pending: '#faad14'
    };
 
    const taskByStatus = taskDistribution.map(t => ({
      name: t.category,
      value: t.count,
      color: taskStatusColorMap[t.category] || '#8884d8'
    }));
 
    // 計算整體任務完成率
    const overallCompletionRate = teamWorkload.length > 0
      ? teamWorkload.reduce((sum, member) => sum + (member.completionRate || 0), 0) / teamWorkload.length
      : 0;
 
    const dashboardData: DashboardData = {
      projectStats: {
        totalProjects: projectStats[0]?.totalProjects || 0,
        activeProjects: projectStats[0]?.activeProjects || 0,
        completedProjects: projectStats[0]?.completedProjects || 0,
        delayedProjects: projectStats[0]?.delayedProjects || 0,
      },
      taskStats: {
        totalTasks: taskStats[0]?.totalTasks || 0,
        completedTasks: taskStats[0]?.completedTasks || 0,
        pendingTasks: taskStats[0]?.pendingTasks || 0,
        overdueTasks: taskStats[0]?.overdueTasks || 0,
        completionRate: overallCompletionRate,
      },
      teamStats: {
        totalMembers: teamStats[0]?.totalMembers || 0,
        activeMembers: teamStats[0]?.activeMembers || 0,
        averageTaskCompletion: overallCompletionRate,
      },
      recentProjects: recentProjects || [],
      recentTasks: recentTasks || [],
      projectProgress: projectProgress || [],
      taskDistribution: taskDistribution || [],
      upcomingDeadlines: upcomingDeadlines || [],
      weeklyProgress: weeklyProgress || [],
      teamWorkload: teamWorkload || [],
      recentActivities: recentActivities || [],
      taskByStatus: taskByStatus || []
    };
 
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('獲取儀表板數據時發生錯誤:', error);
    return NextResponse.json(
      { error: '獲取儀表板數據失敗', details: error.message },
      { status: 500 }
    );
  }
}