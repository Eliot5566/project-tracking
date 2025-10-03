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
    throw new Error('`notes/route.ts` 僅能在伺服端執行');
}
var server_1 = require("next/server");
var db_1 = require("@/lib/db");
// GET /api/notes?start=2025-01-01&end=2025-01-31&id=1
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, id, start, end, sqlText, conditions, params, rows, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    searchParams = new URL(request.url).searchParams;
                    id = searchParams.get('id');
                    start = searchParams.get('start');
                    end = searchParams.get('end');
                    sqlText = "SELECT id, meetingDate, title, summary,\n      unitAResponsibility, unitADueDate, unitAStatus,\n      unitBResponsibility, unitBDueDate, unitBStatus,\n      createdAt, updatedAt\n      FROM MeetingNotes";
                    conditions = [];
                    params = [];
                    if (id) {
                        conditions.push('id = @param' + params.length);
                        params.push(id);
                    }
                    if (start) {
                        conditions.push('meetingDate >= @param' + params.length);
                        params.push(start);
                    }
                    if (end) {
                        conditions.push('meetingDate <= @param' + params.length);
                        params.push(end);
                    }
                    if (conditions.length) {
                        sqlText += ' WHERE ' + conditions.join(' AND ');
                    }
                    sqlText += ' ORDER BY meetingDate DESC, id DESC';
                    return [4 /*yield*/, db_1.query(sqlText, params)];
                case 1:
                    rows = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: rows })];
                case 2:
                    err_1 = _a.sent();
                    console.error('[NOTES][GET] 錯誤', err_1);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '取得會議記錄失敗' }, { status: 500 })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.GET = GET;
// POST /api/notes  body:{meetingDate,title,summary,unitAResponsibility,unitADueDate,unitAStatus,unitBResponsibility,unitBDueDate,unitBStatus}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, meetingDate, title, _a, summary, unitAResponsibility, unitADueDate, unitAStatus, unitBResponsibility, unitBDueDate, unitBStatus, insertSql, inserted, id, row, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _b.sent();
                    meetingDate = body.meetingDate, title = body.title, _a = body.summary, summary = _a === void 0 ? '' : _a, unitAResponsibility = body.unitAResponsibility, unitADueDate = body.unitADueDate, unitAStatus = body.unitAStatus, unitBResponsibility = body.unitBResponsibility, unitBDueDate = body.unitBDueDate, unitBStatus = body.unitBStatus;
                    if (!meetingDate || !title) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少 meetingDate 或 title' }, { status: 400 })];
                    }
                    insertSql = "INSERT INTO MeetingNotes (\n      meetingDate, title, summary,\n      unitAResponsibility, unitADueDate, unitAStatus,\n      unitBResponsibility, unitBDueDate, unitBStatus,\n      createdAt, updatedAt\n    ) VALUES (\n      @param0, @param1, @param2,\n      @param3, @param4, @param5,\n      @param6, @param7, @param8,\n      GETDATE(), GETDATE()\n    ); SELECT SCOPE_IDENTITY() as id;";
                    return [4 /*yield*/, db_1.query(insertSql, [
                            meetingDate, title, summary,
                            unitAResponsibility || null, unitADueDate || null, unitAStatus || null,
                            unitBResponsibility || null, unitBDueDate || null, unitBStatus || null
                        ])];
                case 2:
                    inserted = _b.sent();
                    id = inserted[0].id;
                    return [4 /*yield*/, db_1.query("SELECT * FROM MeetingNotes WHERE id = @param0", [id])];
                case 3:
                    row = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: row[0] })];
                case 4:
                    err_2 = _b.sent();
                    console.error('[NOTES][POST] 錯誤', err_2);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '建立會議記錄失敗' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
// PUT /api/notes  body:{id,...fields}
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, id, meetingDate, title, _a, summary, unitAResponsibility, unitADueDate, unitAStatus, unitBResponsibility, unitBDueDate, unitBStatus, updateSql, rows, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _b.sent();
                    id = body.id, meetingDate = body.meetingDate, title = body.title, _a = body.summary, summary = _a === void 0 ? '' : _a, unitAResponsibility = body.unitAResponsibility, unitADueDate = body.unitADueDate, unitAStatus = body.unitAStatus, unitBResponsibility = body.unitBResponsibility, unitBDueDate = body.unitBDueDate, unitBStatus = body.unitBStatus;
                    if (!id) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 })];
                    }
                    updateSql = "UPDATE MeetingNotes SET\n      meetingDate=@param0,\n      title=@param1,\n      summary=@param2,\n      unitAResponsibility=@param3,\n      unitADueDate=@param4,\n      unitAStatus=@param5,\n      unitBResponsibility=@param6,\n      unitBDueDate=@param7,\n      unitBStatus=@param8,\n      updatedAt=GETDATE()\n      WHERE id=@param9; SELECT * FROM MeetingNotes WHERE id=@param9;";
                    return [4 /*yield*/, db_1.query(updateSql, [
                            meetingDate || null,
                            title || null,
                            summary || '',
                            unitAResponsibility || null,
                            unitADueDate || null,
                            unitAStatus || null,
                            unitBResponsibility || null,
                            unitBDueDate || null,
                            unitBStatus || null,
                            id
                        ])];
                case 2:
                    rows = _b.sent();
                    if (!rows.length) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '找不到記錄' }, { status: 404 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: rows[0] })];
                case 3:
                    err_3 = _b.sent();
                    console.error('[NOTES][PUT] 錯誤', err_3);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '更新會議記錄失敗' }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.PUT = PUT;
// DELETE /api/notes?id=1
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, id, row, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    searchParams = new URL(request.url).searchParams;
                    id = searchParams.get('id');
                    if (!id) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 })];
                    }
                    return [4 /*yield*/, db_1.query("SELECT * FROM MeetingNotes WHERE id = @param0", [id])];
                case 1:
                    row = _a.sent();
                    if (!row.length) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '找不到記錄' }, { status: 404 })];
                    }
                    return [4 /*yield*/, db_1.query("DELETE FROM MeetingNotes WHERE id = @param0", [id])];
                case 2:
                    _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: row[0] })];
                case 3:
                    err_4 = _a.sent();
                    console.error('[NOTES][DELETE] 錯誤', err_4);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '刪除會議記錄失敗' }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.DELETE = DELETE;
