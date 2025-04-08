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
// 獲取所有團隊成員
function GET() {
    return __awaiter(this, void 0, void 0, function () {
        var sqlQuery, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    sqlQuery = "\n      SELECT \n        tm.id,\n        tm.name,\n        tm.role,\n        tm.email,\n        COUNT(DISTINCT p.id) as projectCount,\n        COUNT(DISTINCT t.id) as taskCount,\n        CASE \n          WHEN COUNT(DISTINCT t.id) = 0 THEN 0\n          ELSE CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(DISTINCT t.id) * 100\n        END as averageProgress,\n        tm.createdAt,\n        tm.updatedAt\n      FROM TeamMembers tm\n      LEFT JOIN Projects p ON tm.id = p.managerId\n      LEFT JOIN Tasks t ON tm.id = t.assigneeId\n      GROUP BY tm.id, tm.name, tm.role, tm.email, tm.createdAt, tm.updatedAt\n      ORDER BY tm.createdAt DESC\n    ";
                    return [4 /*yield*/, db_1.query(sqlQuery)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: result })];
                case 2:
                    error_1 = _a.sent();
                    console.error('獲取團隊成員失敗:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '獲取團隊成員失敗' }, { status: 500 })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.GET = GET;
// 創建新團隊成員
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, name, role, email, sqlQuery, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    _a = _b.sent(), name = _a.name, role = _a.role, email = _a.email;
                    if (!name || !role || !email) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少必要參數' }, { status: 400 })];
                    }
                    sqlQuery = "\n      INSERT INTO TeamMembers (name, role, email, createdAt, updatedAt)\n      VALUES (@param0, @param1, @param2, GETDATE(), GETDATE());\n      \n      SELECT SCOPE_IDENTITY() as id;\n    ";
                    return [4 /*yield*/, db_1.query(sqlQuery, [name, role, email])];
                case 2:
                    _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, message: '添加團隊成員成功' })];
                case 3:
                    error_2 = _b.sent();
                    console.error('添加團隊成員失敗:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '添加團隊成員失敗' }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
// 更新團隊成員
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, id, name, role, department, email, sqlQuery, updatedMember, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _a.sent();
                    id = body.id, name = body.name, role = body.role, department = body.department, email = body.email;
                    sqlQuery = "\n      UPDATE TeamMembers\n      SET \n        name = @param0,\n        role = @param1,\n        department = @param2,\n        email = @param3,\n        updatedAt = GETDATE()\n      WHERE id = @param4;\n      \n      SELECT * FROM TeamMembers WHERE id = @param4;\n    ";
                    return [4 /*yield*/, db_1.query(sqlQuery, [
                            name,
                            role,
                            department,
                            email,
                            id
                        ])];
                case 2:
                    updatedMember = _a.sent();
                    if (updatedMember.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: '找不到指定的團隊成員'
                            }, { status: 404 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: updatedMember[0]
                        })];
                case 3:
                    error_3 = _a.sent();
                    console.error('更新團隊成員失敗:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: '更新團隊成員失敗'
                        }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.PUT = PUT;
// 刪除團隊成員
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, id, sqlQuery, deletedMember, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    searchParams = new URL(request.url).searchParams;
                    id = searchParams.get('id');
                    if (!id) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: '缺少團隊成員 ID'
                            }, { status: 400 })];
                    }
                    sqlQuery = "\n      DELETE FROM TeamMembers\n      WHERE id = @param0;\n      \n      SELECT * FROM TeamMembers WHERE id = @param0;\n    ";
                    return [4 /*yield*/, db_1.query(sqlQuery, [id])];
                case 1:
                    deletedMember = _a.sent();
                    if (deletedMember.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: '找不到指定的團隊成員'
                            }, { status: 404 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: deletedMember[0]
                        })];
                case 2:
                    error_4 = _a.sent();
                    console.error('刪除團隊成員失敗:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: '刪除團隊成員失敗'
                        }, { status: 500 })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.DELETE = DELETE;
