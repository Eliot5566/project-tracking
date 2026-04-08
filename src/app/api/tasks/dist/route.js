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
exports.DELETE = exports.PUT = exports.POST = exports.GET = void 0;
// src/app/api/tasks/route.ts
var server_1 = require("next/server");
var db_1 = require("@/lib/db");
/**
 * GET /api/tasks
 */
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, projectId, assignedTo, status, priority, search, startDate, endDate, sqlQuery, params, conditions, paramIdx_1, ids, ids, tasks, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    searchParams = new URL(request.url).searchParams;
                    projectId = searchParams.get('projectId');
                    assignedTo = searchParams.get('assignedTo');
                    status = searchParams.get('status');
                    priority = searchParams.get('priority');
                    search = searchParams.get('search');
                    startDate = searchParams.get('startDate');
                    endDate = searchParams.get('endDate');
                    sqlQuery = "\n      SELECT t.*, \n             p.name as projectName,\n             tm.name as assignedToName\n      FROM Tasks t\n      LEFT JOIN Projects p ON t.projectId = p.id\n      LEFT JOIN TeamMembers tm ON t.assignedTo = tm.id\n    ";
                    params = [];
                    conditions = [];
                    paramIdx_1 = 0;
                    if (projectId) {
                        ids = projectId.split(',').map(function (id) { return id.trim(); }).filter(Boolean);
                        if (ids.length > 0) {
                            conditions.push("t.projectId IN (" + ids.map(function (_, i) { return "@param" + (paramIdx_1 + i); }).join(',') + ")");
                            params.push.apply(params, ids.map(Number));
                            paramIdx_1 += ids.length;
                        }
                    }
                    if (assignedTo) {
                        ids = assignedTo.split(',').map(function (id) { return id.trim(); }).filter(Boolean);
                        if (ids.length > 0) {
                            conditions.push("t.assignedTo IN (" + ids.map(function (_, i) { return "@param" + (paramIdx_1 + i); }).join(',') + ")");
                            params.push.apply(params, ids.map(Number));
                            paramIdx_1 += ids.length;
                        }
                    }
                    if (status) {
                        conditions.push("t.status = @param" + paramIdx_1);
                        params.push(status);
                        paramIdx_1++;
                    }
                    if (priority) {
                        conditions.push("t.priority = @param" + paramIdx_1);
                        params.push(priority);
                        paramIdx_1++;
                    }
                    if (search) {
                        conditions.push("(t.title LIKE @param" + paramIdx_1 + " OR t.description LIKE @param" + paramIdx_1 + ")");
                        params.push("%" + search + "%");
                        paramIdx_1++;
                    }
                    if (startDate && endDate) {
                        conditions.push("CAST(t.dueDate AS date) BETWEEN @param" + paramIdx_1 + " AND @param" + (paramIdx_1 + 1));
                        params.push(startDate, endDate);
                        paramIdx_1 += 2;
                    }
                    else if (startDate) {
                        conditions.push("CAST(t.dueDate AS date) >= @param" + paramIdx_1);
                        params.push(startDate);
                        paramIdx_1++;
                    }
                    else if (endDate) {
                        conditions.push("CAST(t.dueDate AS date) <= @param" + paramIdx_1);
                        params.push(endDate);
                        paramIdx_1++;
                    }
                    if (conditions.length > 0) {
                        sqlQuery += ' WHERE ' + conditions.join(' AND ');
                    }
                    sqlQuery += ' ORDER BY t.createdAt DESC';
                    return [4 /*yield*/, db_1.query(sqlQuery, params)];
                case 1:
                    tasks = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: tasks
                        })];
                case 2:
                    error_1 = _a.sent();
                    console.error('查詢錯誤:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: '獲取任務列表失敗'
                        }, { status: 500 })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.GET = GET;
/**
 * POST /api/tasks
 */
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, title, description, projectId, assignedTo, status, priority, startDate, dueDate, sqlQuery, result, newTask, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _a.sent();
                    title = body.title, description = body.description, projectId = body.projectId, assignedTo = body.assignedTo, status = body.status, priority = body.priority, startDate = body.startDate, dueDate = body.dueDate;
                    sqlQuery = "\n      INSERT INTO Tasks (\n        title, description, projectId, assignedTo, status, priority, startDate, dueDate,\n        createdAt, updatedAt\n      )\n      VALUES (\n        @param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7,\n        GETDATE(), GETDATE()\n      );\n      \n      SELECT SCOPE_IDENTITY() as id;\n    ";
                    return [4 /*yield*/, db_1.query(sqlQuery, [
                            title,
                            description,
                            projectId,
                            assignedTo,
                            status,
                            priority,
                            startDate,
                            dueDate
                        ])];
                case 2:
                    result = _a.sent();
                    return [4 /*yield*/, db_1.query("SELECT t.*, p.name as projectName, tm.name as assignedToName\n       FROM Tasks t\n       LEFT JOIN Projects p ON t.projectId = p.id\n       LEFT JOIN TeamMembers tm ON t.assignedTo = tm.id\n       WHERE t.id = @param0", [result[0].id])];
                case 3:
                    newTask = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: newTask[0]
                        })];
                case 4:
                    error_2 = _a.sent();
                    console.error('創建任務失敗:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: '創建任務失敗'
                        }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
// 更新任務
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, id, title, description, projectId, assignedTo, status, priority, startDate, dueDate, progress, finalProgress, sqlQuery, updatedTask, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _a.sent();
                    id = body.id, title = body.title, description = body.description, projectId = body.projectId, assignedTo = body.assignedTo, status = body.status, priority = body.priority, startDate = body.startDate, dueDate = body.dueDate, progress = body.progress;
                    finalProgress = status === 'completed' ? 100 : progress || 0;
                    sqlQuery = "\n      UPDATE Tasks\n      SET \n        title = @param0,\n        description = @param1,\n        projectId = @param2,\n        assignedTo = @param3,\n        status = @param4,\n        priority = @param5,\n        startDate = @param6,\n        dueDate = @param7,\n        progress = @param8,\n        updatedAt = GETDATE()\n      WHERE id = @param9;\n      \n      SELECT \n        t.id,\n        t.title,\n        t.description,\n        t.projectId,\n        t.assignedTo,\n        t.status,\n        t.priority,\n        t.startDate,\n        t.dueDate,\n        t.progress,\n        t.createdAt,\n        t.updatedAt,\n        p.name as projectName,\n        tm.name as assignedToName\n      FROM Tasks t\n      LEFT JOIN Projects p ON t.projectId = p.id\n      LEFT JOIN TeamMembers tm ON t.assignedTo = tm.id\n      WHERE t.id = @param9;\n    ";
                    return [4 /*yield*/, db_1.query(sqlQuery, [
                            title,
                            description,
                            projectId,
                            assignedTo,
                            status,
                            priority,
                            startDate,
                            dueDate,
                            finalProgress,
                            id
                        ])];
                case 2:
                    updatedTask = _a.sent();
                    if (updatedTask.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: '找不到指定的任務'
                            }, { status: 404 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: updatedTask[0]
                        })];
                case 3:
                    error_3 = _a.sent();
                    console.error('更新錯誤:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: '更新任務失敗'
                        }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.PUT = PUT;
// 刪除任務
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, id, taskToDelete, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    searchParams = new URL(request.url).searchParams;
                    id = searchParams.get('id');
                    if (!id) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: '缺少任務 ID'
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, db_1.query("\n      SELECT t.*, p.name as projectName, tm.name as assignedToName\n      FROM Tasks t\n      LEFT JOIN Projects p ON t.projectId = p.id\n      LEFT JOIN TeamMembers tm ON t.assignedTo = tm.id\n      WHERE t.id = @param0;\n    ", [id])];
                case 1:
                    taskToDelete = _a.sent();
                    if (!taskToDelete.length) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: '找不到指定的任務'
                            }, { status: 404 })];
                    }
                    // 執行刪除
                    return [4 /*yield*/, db_1.query("DELETE FROM Tasks WHERE id = @param0;", [id])];
                case 2:
                    // 執行刪除
                    _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: taskToDelete[0]
                        })];
                case 3:
                    error_4 = _a.sent();
                    console.error('刪除任務失敗:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: '刪除任務失敗'
                        }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.DELETE = DELETE;
