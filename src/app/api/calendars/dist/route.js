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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.DELETE = exports.PUT = exports.POST = exports.GET = void 0;
var server_1 = require("next/server");
var db_1 = require("@/lib/db");
// 支援 GET（查詢）、POST（新增）、PUT（編輯）、DELETE（刪除）
function GET() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var tasksRaw, projectsRaw, tasks, projects, events, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, db_1.query("\n      SELECT id, title, startDate, dueDate FROM Tasks\n    ")];
                case 1:
                    tasksRaw = _c.sent();
                    return [4 /*yield*/, db_1.query("\n      SELECT id, name, startDate, endDate FROM Projects\n    ")];
                case 2:
                    projectsRaw = _c.sent();
                    tasks = Array.isArray(tasksRaw)
                        ? tasksRaw
                        : (Array.isArray((_a = tasksRaw) === null || _a === void 0 ? void 0 : _a.recordset) ? tasksRaw.recordset : []);
                    projects = Array.isArray(projectsRaw)
                        ? projectsRaw
                        : (Array.isArray((_b = projectsRaw) === null || _b === void 0 ? void 0 : _b.recordset) ? projectsRaw.recordset : []);
                    events = __spreadArrays(tasks.map(function (t) { return ({
                        id: "task-" + t.id,
                        type: 'task',
                        title: "[\u4EFB\u52D9] " + t.title,
                        start: t.startDate,
                        end: t.dueDate || t.startDate,
                        allDay: true
                    }); }), projects.map(function (p) { return ({
                        id: "project-" + p.id,
                        type: 'project',
                        title: "[\u5C08\u6848] " + p.name,
                        start: p.startDate,
                        end: p.endDate || p.startDate,
                        allDay: true
                    }); }));
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: events })];
                case 3:
                    error_1 = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '載入日曆資料失敗' }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.GET = GET;
// 新增事件（僅示範任務）
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, title, start, end, type, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _a.sent();
                    title = body.title, start = body.start, end = body.end, type = body.type;
                    if (!title || !start) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少必要欄位' }, { status: 400 })];
                    }
                    if (!(type === 'task')) return [3 /*break*/, 3];
                    return [4 /*yield*/, db_1.query("INSERT INTO Tasks (title, startDate, dueDate) VALUES (@param0, @param1, @param2)", [title, start, end || start])];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    if (!(type === 'project')) return [3 /*break*/, 5];
                    return [4 /*yield*/, db_1.query("INSERT INTO Projects (name, startDate, endDate) VALUES (@param0, @param1, @param2)", [title, start, end || start])];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/, server_1.NextResponse.json({ success: true })];
                case 6:
                    error_2 = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '新增事件失敗' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
// 編輯事件（僅示範任務）
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, id, title, start, end, type, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _a.sent();
                    id = body.id, title = body.title, start = body.start, end = body.end, type = body.type;
                    if (!id || !start) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少必要欄位' }, { status: 400 })];
                    }
                    if (!(type === 'task')) return [3 /*break*/, 3];
                    return [4 /*yield*/, db_1.query("UPDATE Tasks SET title=@param0, startDate=@param1, dueDate=@param2 WHERE id=@param3", [title, start, end || start, id.replace('task-', '')])];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    if (!(type === 'project')) return [3 /*break*/, 5];
                    return [4 /*yield*/, db_1.query("UPDATE Projects SET name=@param0, startDate=@param1, endDate=@param2 WHERE id=@param3", [title, start, end || start, id.replace('project-', '')])];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/, server_1.NextResponse.json({ success: true })];
                case 6:
                    error_3 = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '更新事件失敗' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.PUT = PUT;
// 刪除事件（僅示範任務）
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, id, type, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    searchParams = new URL(request.url).searchParams;
                    id = searchParams.get('id');
                    type = searchParams.get('type');
                    if (!id || !type) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少必要參數' }, { status: 400 })];
                    }
                    if (!(type === 'task')) return [3 /*break*/, 2];
                    return [4 /*yield*/, db_1.query("DELETE FROM Tasks WHERE id=@param0", [id.replace('task-', '')])];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    if (!(type === 'project')) return [3 /*break*/, 4];
                    return [4 /*yield*/, db_1.query("DELETE FROM Projects WHERE id=@param0", [id.replace('project-', '')])];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, server_1.NextResponse.json({ success: true })];
                case 5:
                    error_4 = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '刪除事件失敗' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.DELETE = DELETE;
