"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.GET = exports.dynamic = void 0;
var db_1 = require("@/lib/db");
var server_1 = require("next/server");
exports.dynamic = 'force-dynamic'; // 確保不緩存API響應
function GET() {
    return __awaiter(this, void 0, void 0, function () {
        var taskStatsQuery, taskStats, projectStatsQuery, projectStats, teamStatsQuery, teamStats, recentProjectsQuery, recentProjects, recentTasksQuery, recentTasks, projectProgressQuery, projectProgress, taskDistributionQuery, taskDistribution, upcomingDeadlinesQuery, upcomingDeadlines, weeklyProgressQuery, weeklyProgress, teamWorkloadQuery, teamWorkload, recentActivitiesQuery, recentActivities, toArray, taskDistributionArr, recentProjectsArr, recentTasksArr, projectProgressArr, upcomingDeadlinesArr, weeklyProgressArr, teamWorkloadArr, recentActivitiesArr, taskStatusColorMap_1, taskByStatus, getFirst, firstTaskStats, firstProjectStats, firstTeamStats, sqlCompletionRate, dashboardData, error_1, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    taskStatsQuery = "\n      SELECT\n        COUNT(*) AS totalTasks,\n        SUM(CASE WHEN LOWER(status) = 'completed' THEN 1 ELSE 0 END) AS completedTasks,\n        SUM(CASE WHEN LOWER(status) = 'in_progress' THEN 1 ELSE 0 END) AS inProgressTasks,\n        SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END) AS pendingTasks,\n        SUM(CASE WHEN dueDate < GETDATE() AND LOWER(status) != 'completed' THEN 1 ELSE 0 END) AS overdueTasks,\n        CAST(SUM(CASE WHEN LOWER(status) = 'completed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5, 2)) AS completionRate\n      FROM Tasks\n    ";
                    return [4 /*yield*/, db_1.query(taskStatsQuery)];
                case 1:
                    taskStats = _a.sent();
                    projectStatsQuery = "\n      SELECT\n        COUNT(*) AS totalProjects,\n        SUM(CASE WHEN LOWER(status) = '\u9032\u884C\u4E2D' THEN 1 ELSE 0 END) AS activeProjects,\n        SUM(CASE WHEN LOWER(status) = '\u5DF2\u5B8C\u6210' THEN 1 ELSE 0 END) AS completedProjects,\n        SUM(CASE WHEN LOWER(status) = '\u5DF2\u66AB\u505C' THEN 1 ELSE 0 END) AS delayedProjects\n      FROM Projects\n    ";
                    return [4 /*yield*/, db_1.query(projectStatsQuery)];
                case 2:
                    projectStats = _a.sent();
                    teamStatsQuery = "\n      SELECT\n        COUNT(*) AS totalMembers,\n        SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) AS activeMembers\n      FROM TeamMembers\n    ";
                    return [4 /*yield*/, db_1.query(teamStatsQuery)];
                case 3:
                    teamStats = _a.sent();
                    recentProjectsQuery = "\n      SELECT TOP 5\n        id AS id,\n        name AS projectName,\n        progress AS progress,\n        FORMAT(startDate, 'yyyy-MM-dd') AS startDate,\n        FORMAT(endDate, 'yyyy-MM-dd') AS endDate,\n        status AS status\n      FROM Projects\n      WHERE endDate IS NOT NULL\n      ORDER BY createdAt DESC\n    ";
                    return [4 /*yield*/, db_1.query(recentProjectsQuery)];
                case 4:
                    recentProjects = _a.sent();
                    recentTasksQuery = "\n      SELECT TOP 5\n        t.id AS id,\n        t.title AS title,\n        tm.name AS assignee,\n        FORMAT(t.dueDate, 'yyyy-MM-dd') AS dueDate,\n        t.status AS status,\n        t.priority AS priority\n      FROM Tasks t\n      LEFT JOIN TeamMembers tm ON t.assignedTo = tm.id\n      WHERE t.dueDate IS NOT NULL\n      ORDER BY t.createdAt DESC\n    ";
                    return [4 /*yield*/, db_1.query(recentTasksQuery)];
                case 5:
                    recentTasks = _a.sent();
                    projectProgressQuery = "\n      SELECT\n        p.name AS projectName,\n        ISNULL(\n          CASE WHEN COUNT(t.id) = 0 THEN 0\n               ELSE CAST(SUM(CASE WHEN LOWER(t.status) = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(t.id) * 100\n          END, 0\n        ) AS progress,\n        p.status\n      FROM Projects p\n      LEFT JOIN Tasks t ON t.projectId = p.id\n      WHERE p.status = '\u9032\u884C\u4E2D'\n      GROUP BY p.id, p.name, p.status\n      ORDER BY progress DESC\n    ";
                    return [4 /*yield*/, db_1.query(projectProgressQuery)];
                case 6:
                    projectProgress = _a.sent();
                    taskDistributionQuery = "\n      SELECT\n        status AS category,\n        COUNT(*) AS count\n      FROM Tasks\n      GROUP BY status\n    ";
                    return [4 /*yield*/, db_1.query(taskDistributionQuery)];
                case 7:
                    taskDistribution = _a.sent();
                    upcomingDeadlinesQuery = "\n      SELECT TOP 5\n        id AS id,\n        title AS title,\n        'Task' AS type,\n        FORMAT(dueDate, 'yyyy-MM-dd') AS dueDate,\n        DATEDIFF(day, GETDATE(), dueDate) AS daysLeft\n      FROM Tasks\n      WHERE status != '\u5DF2\u5B8C\u6210' AND dueDate >= GETDATE()\n      ORDER BY dueDate\n    ";
                    return [4 /*yield*/, db_1.query(upcomingDeadlinesQuery)];
                case 8:
                    upcomingDeadlines = _a.sent();
                    weeklyProgressQuery = "\n      SELECT\n        CONVERT(varchar(10), createdAt, 120) AS day,\n        COUNT(*) AS created,\n        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed\n      FROM Tasks\n      WHERE createdAt >= DATEADD(day, -6, CAST(GETDATE() AS DATE))\n      GROUP BY CONVERT(varchar(10), createdAt, 120)\n      ORDER BY day;\n    ";
                    return [4 /*yield*/, db_1.query(weeklyProgressQuery)];
                case 9:
                    weeklyProgress = _a.sent();
                    teamWorkloadQuery = "\n      SELECT\n        tm.name,\n        COUNT(DISTINCT p.id) AS activeProjects,\n        COUNT(t.id) AS activeTasks,\n        CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) * 1.0 / NULLIF(COUNT(t.id), 0) * 100 AS INT) AS completionRate\n      FROM TeamMembers tm\n      LEFT JOIN Tasks t ON t.assignedTo = tm.id\n      LEFT JOIN Projects p ON p.id = t.projectId AND p.status = '\u9032\u884C\u4E2D'\n      GROUP BY tm.name;\n    ";
                    return [4 /*yield*/, db_1.query(teamWorkloadQuery)];
                case 10:
                    teamWorkload = _a.sent();
                    recentActivitiesQuery = "\n      SELECT TOP 5\n        p.name AS project,\n        t.title AS activity,\n        t.status,\n        FORMAT(t.updatedAt, 'yyyy-MM-dd') AS date\n      FROM Tasks t\n      LEFT JOIN Projects p ON p.id = t.projectId\n      ORDER BY t.updatedAt DESC;\n    ";
                    return [4 /*yield*/, db_1.query(recentActivitiesQuery)];
                case 11:
                    recentActivities = _a.sent();
                    toArray = function (raw) {
                        return Array.isArray(raw) ? raw : (Array.isArray(raw === null || raw === void 0 ? void 0 : raw.recordset) ? raw.recordset : []);
                    };
                    taskDistributionArr = toArray(taskDistribution);
                    recentProjectsArr = toArray(recentProjects);
                    recentTasksArr = toArray(recentTasks);
                    projectProgressArr = toArray(projectProgress);
                    upcomingDeadlinesArr = toArray(upcomingDeadlines);
                    weeklyProgressArr = toArray(weeklyProgress);
                    teamWorkloadArr = toArray(teamWorkload);
                    recentActivitiesArr = toArray(recentActivities);
                    taskStatusColorMap_1 = {
                        completed: '#52c41a',
                        in_progress: '#1890ff',
                        delayed: '#ff4d4f',
                        pending: '#faad14'
                    };
                    taskByStatus = taskDistributionArr.map(function (t) { return ({
                        name: t.category,
                        value: t.count,
                        color: taskStatusColorMap_1[t.category] || '#8884d8'
                    }); });
                    getFirst = function (arr) { return Array.isArray(arr) ? arr[0] : (arr && arr.recordset ? arr.recordset[0] : undefined); };
                    firstTaskStats = getFirst(taskStats) || {};
                    firstProjectStats = getFirst(projectStats) || {};
                    firstTeamStats = getFirst(teamStats) || {};
                    sqlCompletionRate = firstTaskStats.completionRate || 0;
                    dashboardData = {
                        projectStats: {
                            totalProjects: firstProjectStats.totalProjects || 0,
                            activeProjects: firstProjectStats.activeProjects || 0,
                            completedProjects: firstProjectStats.completedProjects || 0,
                            delayedProjects: firstProjectStats.delayedProjects || 0
                        },
                        taskStats: {
                            totalTasks: firstTaskStats.totalTasks || 0,
                            completedTasks: firstTaskStats.completedTasks || 0,
                            pendingTasks: firstTaskStats.pendingTasks || 0,
                            overdueTasks: firstTaskStats.overdueTasks || 0,
                            completionRate: sqlCompletionRate
                        },
                        teamStats: {
                            totalMembers: firstTeamStats.totalMembers || 0,
                            activeMembers: firstTeamStats.activeMembers || 0,
                            averageTaskCompletion: sqlCompletionRate
                        },
                        recentProjects: recentProjectsArr,
                        recentTasks: recentTasksArr,
                        projectProgress: projectProgressArr,
                        taskDistribution: taskDistributionArr,
                        upcomingDeadlines: upcomingDeadlinesArr,
                        weeklyProgress: weeklyProgressArr,
                        teamWorkload: teamWorkloadArr,
                        recentActivities: recentActivitiesArr,
                        taskByStatus: taskByStatus || []
                    };
                    return [2 /*return*/, server_1.NextResponse.json(dashboardData)];
                case 12:
                    error_1 = _a.sent();
                    msg = error_1 instanceof Error ? error_1.message : String(error_1);
                    console.error('獲取儀表板數據時發生錯誤:', msg);
                    return [2 /*return*/, server_1.NextResponse.json({ error: '獲取儀表板數據失敗', details: msg }, { status: 500 })];
                case 13: return [2 /*return*/];
            }
        });
    });
}
exports.GET = GET;
