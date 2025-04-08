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
var server_1 = require("next/server");
var db_1 = require("@/lib/db");
// 獲取所有專案
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, status, sqlQuery, params, conditions, projects, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    searchParams = new URL(request.url).searchParams;
                    status = searchParams.get('status');
                    sqlQuery = "\n      SELECT \n        p.id,\n        p.name,\n        p.description,\n        p.status,\n        p.startDate,\n        p.endDate,\n        p.managerId,\n        tm.name as managerName,\n        p.createdAt,\n        p.updatedAt,\n        COUNT(t.id) as taskCount,\n        CASE \n          WHEN COUNT(t.id) = 0 THEN 0\n          ELSE CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(t.id) * 100\n        END as averageProgress\n      FROM Projects p\n      LEFT JOIN TeamMembers tm ON p.managerId = tm.id\n      LEFT JOIN Tasks t ON p.id = t.projectId\n    ";
                    params = [];
                    conditions = [];
                    if (status) {
                        conditions.push('p.status = @param0');
                        params.push(status);
                    }
                    if (conditions.length > 0) {
                        sqlQuery += ' WHERE ' + conditions.join(' AND ');
                    }
                    sqlQuery += ' GROUP BY p.id, p.name, p.description, p.status, p.startDate, p.endDate, p.managerId, tm.name, p.createdAt, p.updatedAt';
                    sqlQuery += ' ORDER BY p.createdAt DESC';
                    return [4 /*yield*/, db_1.query(sqlQuery, params)];
                case 1:
                    projects = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: projects
                        })];
                case 2:
                    error_1 = _a.sent();
                    console.error('查詢錯誤:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: '獲取專案列表失敗'
                        }, { status: 500 })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.GET = GET;
// 創建新專案
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, name, description, status, startDate, endDate, managerId, sqlQuery, result, newProject, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _a.sent();
                    name = body.name, description = body.description, status = body.status, startDate = body.startDate, endDate = body.endDate, managerId = body.managerId;
                    sqlQuery = "\n      INSERT INTO Projects (\n        name, description, status, startDate, endDate, managerId,\n        createdAt, updatedAt\n      )\n      VALUES (\n        @param0, @param1, @param2, @param3, @param4, @param5,\n        GETDATE(), GETDATE()\n      );\n      \n      SELECT SCOPE_IDENTITY() as id;\n    ";
                    return [4 /*yield*/, db_1.query(sqlQuery, [
                            name,
                            description,
                            status,
                            startDate,
                            endDate,
                            managerId
                        ])];
                case 2:
                    result = _a.sent();
                    return [4 /*yield*/, db_1.query("SELECT \n        p.id,\n        p.name,\n        p.description,\n        p.status,\n        p.startDate,\n        p.endDate,\n        p.managerId,\n        tm.name as managerName,\n        p.createdAt,\n        p.updatedAt,\n        COUNT(t.id) as taskCount,\n        CASE \n          WHEN COUNT(t.id) = 0 THEN 0\n          ELSE CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(t.id) * 100\n        END as averageProgress\n       FROM Projects p\n       LEFT JOIN TeamMembers tm ON p.managerId = tm.id\n       LEFT JOIN Tasks t ON p.id = t.projectId\n       WHERE p.id = @param0\n       GROUP BY p.id, p.name, p.description, p.status, p.startDate, p.endDate, p.managerId, tm.name, p.createdAt, p.updatedAt", [result[0].id])];
                case 3:
                    newProject = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: newProject[0]
                        })];
                case 4:
                    error_2 = _a.sent();
                    console.error('創建錯誤:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: '創建專案失敗'
                        }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
// 更新專案
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, id, name, description, status, startDate, endDate, managerId, sqlQuery, updatedProject, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _a.sent();
                    id = body.id, name = body.name, description = body.description, status = body.status, startDate = body.startDate, endDate = body.endDate, managerId = body.managerId;
                    sqlQuery = "\n      UPDATE Projects\n      SET \n        name = @param0,\n        description = @param1,\n        status = @param2,\n        startDate = @param3,\n        endDate = @param4,\n        managerId = @param5,\n        updatedAt = GETDATE()\n      WHERE id = @param6;\n      \n      SELECT \n        p.id,\n        p.name,\n        p.description,\n        p.status,\n        p.startDate,\n        p.endDate,\n        p.managerId,\n        tm.name as managerName,\n        p.createdAt,\n        p.updatedAt,\n        COUNT(t.id) as taskCount,\n        CASE \n          WHEN COUNT(t.id) = 0 THEN 0\n          ELSE CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(t.id) * 100\n        END as averageProgress\n      FROM Projects p\n      LEFT JOIN TeamMembers tm ON p.managerId = tm.id\n      LEFT JOIN Tasks t ON p.id = t.projectId\n      WHERE p.id = @param6\n      GROUP BY p.id, p.name, p.description, p.status, p.startDate, p.endDate, p.managerId, tm.name, p.createdAt, p.updatedAt;\n    ";
                    return [4 /*yield*/, db_1.query(sqlQuery, [
                            name,
                            description,
                            status,
                            startDate,
                            endDate,
                            managerId,
                            id
                        ])];
                case 2:
                    updatedProject = _a.sent();
                    if (updatedProject.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: '找不到指定的專案'
                            }, { status: 404 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: updatedProject[0]
                        })];
                case 3:
                    error_3 = _a.sent();
                    console.error('更新錯誤:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: '更新專案失敗'
                        }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.PUT = PUT;
// 刪除專案
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, id, projectToDelete, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    searchParams = new URL(request.url).searchParams;
                    id = searchParams.get('id');
                    if (!id) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: '缺少專案 ID'
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, db_1.query("SELECT \n        p.id,\n        p.name,\n        p.description,\n        p.status,\n        p.startDate,\n        p.endDate,\n        p.createdAt,\n        p.updatedAt,\n        COUNT(t.id) as taskCount,\n        CASE \n          WHEN COUNT(t.id) = 0 THEN 0\n          ELSE CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(t.id) * 100\n        END as averageProgress\n      FROM Projects p\n      LEFT JOIN Tasks t ON p.id = t.projectId\n      WHERE p.id = @param0\n      GROUP BY p.id, p.name, p.description, p.status, p.startDate, p.endDate, p.createdAt, p.updatedAt", [id])];
                case 1:
                    projectToDelete = _a.sent();
                    if (projectToDelete.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: '找不到指定的專案'
                            }, { status: 404 })];
                    }
                    // 執行刪除操作
                    return [4 /*yield*/, db_1.query("DELETE FROM Projects WHERE id = @param0", [id])];
                case 2:
                    // 執行刪除操作
                    _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: projectToDelete[0]
                        })];
                case 3:
                    error_4 = _a.sent();
                    console.error('刪除錯誤:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: '刪除專案失敗'
                        }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.DELETE = DELETE;
