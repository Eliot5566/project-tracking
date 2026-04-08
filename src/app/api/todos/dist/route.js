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
function ensureTodoTable() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.query("\n    IF OBJECT_ID(N'dbo.UserTodos', N'U') IS NULL\n    BEGIN\n      CREATE TABLE dbo.UserTodos (\n        id INT IDENTITY(1,1) PRIMARY KEY,\n        userId INT NOT NULL,\n        title NVARCHAR(200) NOT NULL,\n        content NVARCHAR(MAX) NULL,\n        dueDate DATE NULL,\n        status NVARCHAR(20) NOT NULL CONSTRAINT DF_UserTodos_Status DEFAULT 'pending',\n        priority NVARCHAR(20) NOT NULL CONSTRAINT DF_UserTodos_Priority DEFAULT 'medium',\n        createdAt DATETIME NOT NULL CONSTRAINT DF_UserTodos_CreatedAt DEFAULT GETDATE(),\n        updatedAt DATETIME NOT NULL CONSTRAINT DF_UserTodos_UpdatedAt DEFAULT GETDATE()\n      );\n\n      CREATE INDEX IX_UserTodos_UserId ON dbo.UserTodos(userId);\n      CREATE INDEX IX_UserTodos_DueDate ON dbo.UserTodos(dueDate);\n      CREATE INDEX IX_UserTodos_Status ON dbo.UserTodos(status);\n    END\n  ")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, userId, userIds, keyword, status, priority, startDate, endDate, sql, conditions, params, idx_1, ids, rows, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ensureTodoTable()];
                case 1:
                    _a.sent();
                    searchParams = new URL(request.url).searchParams;
                    userId = searchParams.get('userId');
                    userIds = searchParams.get('userIds');
                    keyword = searchParams.get('keyword');
                    status = searchParams.get('status');
                    priority = searchParams.get('priority');
                    startDate = searchParams.get('startDate');
                    endDate = searchParams.get('endDate');
                    sql = "\n      SELECT t.*, tm.name AS userName\n      FROM UserTodos t\n      LEFT JOIN TeamMembers tm ON tm.id = t.userId\n    ";
                    conditions = [];
                    params = [];
                    idx_1 = 0;
                    if (userId) {
                        conditions.push("t.userId = @param" + idx_1);
                        params.push(Number(userId));
                        idx_1++;
                    }
                    if (userIds) {
                        ids = userIds.split(',').map(function (s) { return s.trim(); }).filter(Boolean).map(Number);
                        if (ids.length > 0) {
                            conditions.push("t.userId IN (" + ids.map(function (_, i) { return "@param" + (idx_1 + i); }).join(',') + ")");
                            params.push.apply(params, ids);
                            idx_1 += ids.length;
                        }
                    }
                    if (keyword) {
                        conditions.push("(t.title LIKE @param" + idx_1 + " OR t.content LIKE @param" + idx_1 + ")");
                        params.push("%" + keyword + "%");
                        idx_1++;
                    }
                    if (status) {
                        conditions.push("t.status = @param" + idx_1);
                        params.push(status);
                        idx_1++;
                    }
                    if (priority) {
                        conditions.push("t.priority = @param" + idx_1);
                        params.push(priority);
                        idx_1++;
                    }
                    if (startDate && endDate) {
                        conditions.push("CAST(t.dueDate AS date) BETWEEN @param" + idx_1 + " AND @param" + (idx_1 + 1));
                        params.push(startDate, endDate);
                        idx_1 += 2;
                    }
                    else if (startDate) {
                        conditions.push("CAST(t.dueDate AS date) >= @param" + idx_1);
                        params.push(startDate);
                        idx_1++;
                    }
                    else if (endDate) {
                        conditions.push("CAST(t.dueDate AS date) <= @param" + idx_1);
                        params.push(endDate);
                        idx_1++;
                    }
                    if (conditions.length > 0) {
                        sql += " WHERE " + conditions.join(' AND ');
                    }
                    sql += ' ORDER BY t.createdAt DESC';
                    return [4 /*yield*/, db_1.query(sql, params)];
                case 2:
                    rows = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: rows })];
                case 3:
                    error_1 = _a.sent();
                    console.error('查詢代辦失敗:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '查詢代辦失敗' }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.GET = GET;
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, _a, userId, title, content, dueDate, _b, status, _c, priority, rows, error_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, ensureTodoTable()];
                case 1:
                    _d.sent();
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _d.sent();
                    _a = body || {}, userId = _a.userId, title = _a.title, content = _a.content, dueDate = _a.dueDate, _b = _a.status, status = _b === void 0 ? 'pending' : _b, _c = _a.priority, priority = _c === void 0 ? 'medium' : _c;
                    if (!userId || !title) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少必要參數' }, { status: 400 })];
                    }
                    return [4 /*yield*/, db_1.query("\n      INSERT INTO UserTodos (userId, title, content, dueDate, status, priority, createdAt, updatedAt)\n      VALUES (@param0, @param1, @param2, @param3, @param4, @param5, GETDATE(), GETDATE());\n\n      SELECT TOP 1 t.*, tm.name AS userName\n      FROM UserTodos t\n      LEFT JOIN TeamMembers tm ON tm.id = t.userId\n      WHERE t.id = SCOPE_IDENTITY();\n      ", [Number(userId), title, content || '', dueDate || null, status, priority])];
                case 3:
                    rows = _d.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: rows[0] })];
                case 4:
                    error_2 = _d.sent();
                    console.error('新增代辦失敗:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '新增代辦失敗' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, _a, id, userId, title, content, dueDate, status, priority, owner, rows, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, ensureTodoTable()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _b.sent();
                    _a = body || {}, id = _a.id, userId = _a.userId, title = _a.title, content = _a.content, dueDate = _a.dueDate, status = _a.status, priority = _a.priority;
                    if (!id || !userId || !title) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少必要參數' }, { status: 400 })];
                    }
                    return [4 /*yield*/, db_1.query('SELECT userId FROM UserTodos WHERE id = @param0', [Number(id)])];
                case 3:
                    owner = _b.sent();
                    if (!owner.length) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '找不到該代辦事項' }, { status: 404 })];
                    }
                    if (Number(owner[0].userId) !== Number(userId)) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '不可修改其他使用者代辦事項' }, { status: 403 })];
                    }
                    return [4 /*yield*/, db_1.query("\n      UPDATE UserTodos\n      SET title = @param0,\n          content = @param1,\n          dueDate = @param2,\n          status = @param3,\n          priority = @param4,\n          updatedAt = GETDATE()\n      WHERE id = @param5;\n\n      SELECT t.*, tm.name AS userName\n      FROM UserTodos t\n      LEFT JOIN TeamMembers tm ON tm.id = t.userId\n      WHERE t.id = @param5;\n      ", [title, content || '', dueDate || null, status || 'pending', priority || 'medium', Number(id)])];
                case 4:
                    rows = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: rows[0] })];
                case 5:
                    error_3 = _b.sent();
                    console.error('更新代辦失敗:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '更新代辦失敗' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.PUT = PUT;
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, id, userId, owner, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, ensureTodoTable()];
                case 1:
                    _a.sent();
                    searchParams = new URL(request.url).searchParams;
                    id = searchParams.get('id');
                    userId = searchParams.get('userId');
                    if (!id || !userId) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少必要參數' }, { status: 400 })];
                    }
                    return [4 /*yield*/, db_1.query('SELECT userId FROM UserTodos WHERE id = @param0', [Number(id)])];
                case 2:
                    owner = _a.sent();
                    if (!owner.length) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '找不到該代辦事項' }, { status: 404 })];
                    }
                    if (Number(owner[0].userId) !== Number(userId)) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '不可刪除其他使用者代辦事項' }, { status: 403 })];
                    }
                    return [4 /*yield*/, db_1.query('DELETE FROM UserTodos WHERE id = @param0', [Number(id)])];
                case 3:
                    _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true })];
                case 4:
                    error_4 = _a.sent();
                    console.error('刪除代辦失敗:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '刪除代辦失敗' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.DELETE = DELETE;
