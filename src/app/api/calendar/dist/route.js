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
if (typeof window !== 'undefined') {
    throw new Error('`calendar/route.ts` should only be used on the server side.');
}
var server_1 = require("next/server");
var db_1 = require("@/lib/db");
function GET(request) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, startDate, endDate, type, sqlQuery, params, conditions, raw, events, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    searchParams = new URL(request.url).searchParams;
                    startDate = searchParams.get('startDate');
                    endDate = searchParams.get('endDate');
                    type = searchParams.get('type');
                    sqlQuery = "\n      SELECT \n        e.id,\n        e.title,\n        e.description,\n        e.startDate,\n        e.endDate,\n        e.type,\n        e.projectId,\n        e.taskId,\n        p.name as projectName,\n        t.title as taskName,\n        e.createdAt,\n        e.updatedAt\n      FROM CalendarEvents e\n      LEFT JOIN Projects p ON e.projectId = p.id\n      LEFT JOIN Tasks t ON e.taskId = t.id\n    ";
                    params = [];
                    conditions = [];
                    if (startDate) {
                        conditions.push('e.startDate >= @param' + params.length);
                        params.push(startDate);
                    }
                    if (endDate) {
                        conditions.push('e.endDate <= @param' + params.length);
                        params.push(endDate);
                    }
                    if (type) {
                        conditions.push('e.type = @param' + params.length);
                        params.push(type);
                    }
                    if (conditions.length > 0) {
                        sqlQuery += ' WHERE ' + conditions.join(' AND ');
                    }
                    sqlQuery += ' ORDER BY e.startDate ASC';
                    return [4 /*yield*/, db_1.query(sqlQuery, params)];
                case 1:
                    raw = _b.sent();
                    events = Array.isArray(raw) ? raw : (Array.isArray((_a = raw) === null || _a === void 0 ? void 0 : _a.recordset) ? raw.recordset : []);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: events
                        })];
                case 2:
                    error_1 = _b.sent();
                    console.error('查詢錯誤:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: '獲取行事曆事件失敗'
                        }, { status: 500 })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.GET = GET;
function POST(request) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var body, title, description, startDate, endDate, type, projectId, taskId, sqlQuery, insertResult, insertedId, newEventRaw, newEventArr, error_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _d.sent();
                    title = body.title, description = body.description, startDate = body.startDate, endDate = body.endDate, type = body.type, projectId = body.projectId, taskId = body.taskId;
                    if (!title || !startDate || !endDate || !type) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: '缺少必要參數'
                            }, { status: 400 })];
                    }
                    sqlQuery = "\n      INSERT INTO CalendarEvents (\n        title, description, startDate, endDate, type,\n        projectId, taskId, createdAt, updatedAt\n      )\n      VALUES (\n        @param0, @param1, @param2, @param3, @param4,\n        @param5, @param6, GETDATE(), GETDATE()\n      );\n      \n      SELECT SCOPE_IDENTITY() as id;\n    ";
                    return [4 /*yield*/, db_1.query(sqlQuery, [
                            title,
                            description || '',
                            startDate,
                            endDate,
                            type,
                            projectId || null,
                            taskId || null
                        ])];
                case 2:
                    insertResult = _d.sent();
                    insertedId = void 0;
                    if (Array.isArray(insertResult)) {
                        insertedId = (_a = insertResult[0]) === null || _a === void 0 ? void 0 : _a.id;
                    }
                    else if (insertResult && Array.isArray(insertResult.recordset)) {
                        insertedId = (_b = insertResult.recordset[0]) === null || _b === void 0 ? void 0 : _b.id;
                    }
                    else if (insertResult && typeof insertResult.id === 'number') {
                        insertedId = insertResult.id;
                    }
                    if (!insertedId) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '無法取得新事件 ID' }, { status: 500 })];
                    }
                    return [4 /*yield*/, db_1.query("SELECT \n        e.id,\n        e.title,\n        e.description,\n        e.startDate,\n        e.endDate,\n        e.type,\n        e.projectId,\n        e.taskId,\n        p.name as projectName,\n        t.title as taskName,\n        e.createdAt,\n        e.updatedAt\n       FROM CalendarEvents e\n       LEFT JOIN Projects p ON e.projectId = p.id\n       LEFT JOIN Tasks t ON e.taskId = t.id\n  WHERE e.id = @param0", [insertedId])];
                case 3:
                    newEventRaw = _d.sent();
                    newEventArr = Array.isArray(newEventRaw) ? newEventRaw : (Array.isArray((_c = newEventRaw) === null || _c === void 0 ? void 0 : _c.recordset) ? newEventRaw.recordset : []);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: newEventArr[0]
                        })];
                case 4:
                    error_2 = _d.sent();
                    console.error('創建錯誤:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: '創建行事曆事件失敗'
                        }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
function PUT(request) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var body, id, title, description, startDate, endDate, type, projectId, taskId, sqlQuery, updatedEventRaw, updatedEvent, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _b.sent();
                    id = body.id, title = body.title, description = body.description, startDate = body.startDate, endDate = body.endDate, type = body.type, projectId = body.projectId, taskId = body.taskId;
                    if (!id) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: '缺少事件 ID'
                            }, { status: 400 })];
                    }
                    sqlQuery = "\n      UPDATE CalendarEvents\n      SET \n        title = @param0,\n        description = @param1,\n        startDate = @param2,\n        endDate = @param3,\n        type = @param4,\n        projectId = @param5,\n        taskId = @param6,\n        updatedAt = GETDATE()\n      WHERE id = @param7;\n      \n      SELECT \n        e.id,\n        e.title,\n        e.description,\n        e.startDate,\n        e.endDate,\n        e.type,\n        e.projectId,\n        e.taskId,\n        p.name as projectName,\n        t.title as taskName,\n        e.createdAt,\n        e.updatedAt\n      FROM CalendarEvents e\n      LEFT JOIN Projects p ON e.projectId = p.id\n      LEFT JOIN Tasks t ON e.taskId = t.id\n      WHERE e.id = @param7;\n    ";
                    return [4 /*yield*/, db_1.query(sqlQuery, [
                            title,
                            description || '',
                            startDate,
                            endDate,
                            type,
                            projectId || null,
                            taskId || null,
                            id
                        ])];
                case 2:
                    updatedEventRaw = _b.sent();
                    updatedEvent = Array.isArray(updatedEventRaw) ? updatedEventRaw : (Array.isArray((_a = updatedEventRaw) === null || _a === void 0 ? void 0 : _a.recordset) ? updatedEventRaw.recordset : []);
                    if (!updatedEvent || updatedEvent.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: '找不到指定的事件'
                            }, { status: 404 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: updatedEvent[0]
                        })];
                case 3:
                    error_3 = _b.sent();
                    console.error('更新錯誤:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: '更新行事曆事件失敗'
                        }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.PUT = PUT;
function DELETE(request) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, id, eventToDeleteRaw, eventToDelete, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    searchParams = new URL(request.url).searchParams;
                    id = searchParams.get('id');
                    if (!id) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: '缺少事件 ID'
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, db_1.query("SELECT \n        e.id,\n        e.title,\n        e.description,\n        e.startDate,\n        e.endDate,\n        e.type,\n        e.projectId,\n        e.taskId,\n        p.name as projectName,\n        t.title as taskName,\n        e.createdAt,\n        e.updatedAt\n       FROM CalendarEvents e\n       LEFT JOIN Projects p ON e.projectId = p.id\n       LEFT JOIN Tasks t ON e.taskId = t.id\n       WHERE e.id = @param0", [id])];
                case 1:
                    eventToDeleteRaw = _b.sent();
                    eventToDelete = Array.isArray(eventToDeleteRaw) ? eventToDeleteRaw : (Array.isArray((_a = eventToDeleteRaw) === null || _a === void 0 ? void 0 : _a.recordset) ? eventToDeleteRaw.recordset : []);
                    if (!eventToDelete || eventToDelete.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: '找不到指定的事件'
                            }, { status: 404 })];
                    }
                    // 執行刪除操作
                    return [4 /*yield*/, db_1.query('DELETE FROM CalendarEvents WHERE id = @param0', [id])];
                case 2:
                    // 執行刪除操作
                    _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: eventToDelete[0]
                        })];
                case 3:
                    error_4 = _b.sent();
                    console.error('刪除錯誤:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: '刪除行事曆事件失敗'
                        }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.DELETE = DELETE;
