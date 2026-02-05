"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, id, start, end, q, sqlText, conditions, params, like, notes, ids, itemsByNote_1, items, e_1, result, low_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    searchParams = new URL(request.url).searchParams;
                    id = searchParams.get('id');
                    start = searchParams.get('start');
                    end = searchParams.get('end');
                    q = searchParams.get('q');
                    sqlText = "SELECT id, meetingDate, title, summary, unitAResponsibility, unitADueDate, unitAStatus, unitBResponsibility, unitBDueDate, unitBStatus, createdAt, updatedAt FROM MeetingNotes";
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
                    if (q) {
                        like = '%' + q + '%';
                        conditions.push("(title LIKE @param" + params.length + " OR summary LIKE @param" + params.length + " OR unitAResponsibility LIKE @param" + params.length + " OR unitBResponsibility LIKE @param" + params.length + ")");
                        params.push(like);
                    }
                    if (conditions.length)
                        sqlText += ' WHERE ' + conditions.join(' AND ');
                    sqlText += ' ORDER BY meetingDate DESC, id DESC';
                    return [4 /*yield*/, db_1.query(sqlText, params)];
                case 1:
                    notes = _a.sent();
                    if (!notes.length)
                        return [2 /*return*/, server_1.NextResponse.json({ success: true, data: [] })];
                    ids = notes.map(function (n) { return n.id; }).join(',');
                    itemsByNote_1 = {};
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db_1.query("SELECT id, meetingNoteId, unitName, responsibility, dueDate, status, orderIndex FROM MeetingNoteItems WHERE meetingNoteId IN (" + ids + ") ORDER BY meetingNoteId, ISNULL(orderIndex,0), id")];
                case 3:
                    items = _a.sent();
                    items.forEach(function (it) {
                        if (!itemsByNote_1[it.meetingNoteId])
                            itemsByNote_1[it.meetingNoteId] = [];
                        itemsByNote_1[it.meetingNoteId].push(it);
                    });
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 5:
                    result = notes.map(function (n) {
                        var enriched = __assign(__assign({}, n), { items: itemsByNote_1[n.id] || [] });
                        if (!enriched.items.length) {
                            var legacy = [];
                            if (n.unitAResponsibility || n.unitADueDate || n.unitAStatus)
                                legacy.push({ id: -1, meetingNoteId: n.id, unitName: 'A單位', responsibility: n.unitAResponsibility || '', dueDate: n.unitADueDate, status: n.unitAStatus, orderIndex: 0 });
                            if (n.unitBResponsibility || n.unitBDueDate || n.unitBStatus)
                                legacy.push({ id: -2, meetingNoteId: n.id, unitName: 'B單位', responsibility: n.unitBResponsibility || '', dueDate: n.unitBDueDate, status: n.unitBStatus, orderIndex: 1 });
                            enriched.items = legacy;
                        }
                        return enriched;
                    });
                    // 若 q 存在，針對 items 也做二次過濾
                    if (q) {
                        low_1 = q.toLowerCase();
                        result = result.filter(function (r) { var _a, _b; return ((_a = r.title) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(low_1)) || ((_b = r.summary) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(low_1)) || (r.items || []).some(function (it) { return (it.unitName + it.responsibility + (it.status || '')).toLowerCase().includes(low_1); }); });
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: result })];
                case 6:
                    err_1 = _a.sent();
                    console.error('[NOTES][GET] 錯誤', err_1);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '取得會議記錄失敗' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.GET = GET;
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, meetingDate, title, _a, summary, _b, items, unitAResponsibility, unitADueDate, unitAStatus, unitBResponsibility, unitBDueDate, unitBStatus, insertSql, inserted, id, i, it, row, itemsInserted, err_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _c.sent();
                    meetingDate = body.meetingDate, title = body.title, _a = body.summary, summary = _a === void 0 ? '' : _a, _b = body.items, items = _b === void 0 ? [] : _b, unitAResponsibility = body.unitAResponsibility, unitADueDate = body.unitADueDate, unitAStatus = body.unitAStatus, unitBResponsibility = body.unitBResponsibility, unitBDueDate = body.unitBDueDate, unitBStatus = body.unitBStatus;
                    if (!meetingDate || !title)
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少 meetingDate 或 title' }, { status: 400 })];
                    insertSql = "INSERT INTO MeetingNotes ( meetingDate, title, summary, unitAResponsibility, unitADueDate, unitAStatus, unitBResponsibility, unitBDueDate, unitBStatus, createdAt, updatedAt ) VALUES ( @param0, @param1, @param2, NULL, NULL, NULL, NULL, NULL, NULL, GETDATE(), GETDATE() ); SELECT SCOPE_IDENTITY() as id;";
                    return [4 /*yield*/, db_1.query(insertSql, [meetingDate, title, summary])];
                case 2:
                    inserted = _c.sent();
                    id = inserted[0].id;
                    i = 0;
                    _c.label = 3;
                case 3:
                    if (!(i < items.length)) return [3 /*break*/, 6];
                    it = items[i];
                    if (!it || !it.unitName)
                        return [3 /*break*/, 5];
                    return [4 /*yield*/, db_1.query("INSERT INTO MeetingNoteItems (meetingNoteId, unitName, responsibility, dueDate, status, orderIndex, createdAt, updatedAt) VALUES (@param0,@param1,@param2,@param3,@param4,@param5,GETDATE(),GETDATE())", [id, it.unitName, it.responsibility || '', it.dueDate || null, it.status || null, i])];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, db_1.query("SELECT id, meetingDate, title, summary, unitAResponsibility, unitADueDate, unitAStatus, unitBResponsibility, unitBDueDate, unitBStatus, createdAt, updatedAt FROM MeetingNotes WHERE id = @param0", [id])];
                case 7:
                    row = _c.sent();
                    return [4 /*yield*/, db_1.query("SELECT id, meetingNoteId, unitName, responsibility, dueDate, status, orderIndex FROM MeetingNoteItems WHERE meetingNoteId=@param0 ORDER BY ISNULL(orderIndex,0), id", [id])];
                case 8:
                    itemsInserted = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: __assign(__assign({}, row[0]), { items: itemsInserted }) })];
                case 9:
                    err_2 = _c.sent();
                    console.error('[NOTES][POST] 錯誤', err_2);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '建立會議記錄失敗' }, { status: 500 })];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, id, meetingDate, title, _a, summary, _b, items, updateSql, rows, i, it, itemsInserted, err_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _c.sent();
                    id = body.id, meetingDate = body.meetingDate, title = body.title, _a = body.summary, summary = _a === void 0 ? '' : _a, _b = body.items, items = _b === void 0 ? [] : _b;
                    if (!id)
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 })];
                    updateSql = "UPDATE MeetingNotes SET meetingDate=@param0, title=@param1, summary=@param2, updatedAt=GETDATE() WHERE id=@param3; SELECT id, meetingDate, title, summary, unitAResponsibility, unitADueDate, unitAStatus, unitBResponsibility, unitBDueDate, unitBStatus, createdAt, updatedAt FROM MeetingNotes WHERE id=@param3;";
                    return [4 /*yield*/, db_1.query(updateSql, [meetingDate || null, title || null, summary || '', id])];
                case 2:
                    rows = _c.sent();
                    if (!rows.length)
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '找不到記錄' }, { status: 404 })];
                    // 重新寫入 items: 先刪除再插入
                    return [4 /*yield*/, db_1.query('DELETE FROM MeetingNoteItems WHERE meetingNoteId = ' + id, [])];
                case 3:
                    // 重新寫入 items: 先刪除再插入
                    _c.sent();
                    i = 0;
                    _c.label = 4;
                case 4:
                    if (!(i < items.length)) return [3 /*break*/, 7];
                    it = items[i];
                    if (!it || !it.unitName)
                        return [3 /*break*/, 6];
                    return [4 /*yield*/, db_1.query("INSERT INTO MeetingNoteItems (meetingNoteId, unitName, responsibility, dueDate, status, orderIndex, createdAt, updatedAt) VALUES (@param0,@param1,@param2,@param3,@param4,@param5,GETDATE(),GETDATE())", [id, it.unitName, it.responsibility || '', it.dueDate || null, it.status || null, i])];
                case 5:
                    _c.sent();
                    _c.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 4];
                case 7: return [4 /*yield*/, db_1.query("SELECT id, meetingNoteId, unitName, responsibility, dueDate, status, orderIndex FROM MeetingNoteItems WHERE meetingNoteId=@param0 ORDER BY ISNULL(orderIndex,0), id", [id])];
                case 8:
                    itemsInserted = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: __assign(__assign({}, rows[0]), { items: itemsInserted }) })];
                case 9:
                    err_3 = _c.sent();
                    console.error('[NOTES][PUT] 錯誤', err_3);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '更新會議記錄失敗' }, { status: 500 })];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.PUT = PUT;
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, id, row, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    searchParams = new URL(request.url).searchParams;
                    id = searchParams.get('id');
                    if (!id)
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 })];
                    return [4 /*yield*/, db_1.query("SELECT id, meetingDate, title FROM MeetingNotes WHERE id = @param0", [id])];
                case 1:
                    row = _a.sent();
                    if (!row.length)
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '找不到記錄' }, { status: 404 })];
                    return [4 /*yield*/, db_1.query('DELETE FROM MeetingNoteItems WHERE meetingNoteId = ' + id, [])];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db_1.query("DELETE FROM MeetingNotes WHERE id = @param0", [id])];
                case 3:
                    _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: row[0] })];
                case 4:
                    err_4 = _a.sent();
                    console.error('[NOTES][DELETE] 錯誤', err_4);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '刪除會議記錄失敗' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.DELETE = DELETE;
