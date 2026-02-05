"use strict";
// import { NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// import jwt from 'jsonwebtoken';
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
// // 取得登入者 userId（teamMemberId）
// function getUserIdFromRequest(request: Request): number | null {
//   try {
//     const cookie = request.headers.get('cookie') || '';
//     const match = cookie.match(/token=([^;]+)/);
//     if (!match) return null;
//     const token = match[1];
//     const SECRET = process.env.JWT_SECRET || 'your-secret-key';
//     const payload = jwt.verify(token, SECRET) as any;
//     // 你登入時回傳的 user.teamMemberId
//     return payload.teamMemberId || payload.userId || null;
//   } catch {
//     return null;
//   }
// }
// // 取得日誌
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get('userId');
//   const date = searchParams.get('date');
//   const startDate = searchParams.get('startDate');
//   const endDate = searchParams.get('endDate');
//   const task = searchParams.get('task');
//   const content = searchParams.get('content');
//   const minHours = searchParams.get('minHours');
//   const maxHours = searchParams.get('maxHours');
//   let sql = 'SELECT * FROM WorkLogs WHERE 1=1';
//   const params: any[] = [];
//   let paramIdx = 0;
//   if (userId) {
//     sql += ` AND userId = @param${paramIdx}`;
//     params.push(userId);
//     paramIdx++;
//   }
//   if (date) {
//     sql += ` AND date = @param${paramIdx}`;
//     params.push(date);
//     paramIdx++;
//   }
//   if (startDate && endDate) {
//     sql += ` AND date BETWEEN @param${paramIdx} AND @param${paramIdx + 1}`;
//     params.push(startDate, endDate);
//     paramIdx += 2;
//   } else if (startDate) {
//     sql += ` AND date >= @param${paramIdx}`;
//     params.push(startDate);
//     paramIdx++;
//   } else if (endDate) {
//     sql += ` AND date <= @param${paramIdx}`;
//     params.push(endDate);
//     paramIdx++;
//   }
//   if (task) {
//     sql += ` AND task LIKE @param${paramIdx}`;
//     params.push(`%${task}%`);
//     paramIdx++;
//   }
//   if (content) {
//     sql += ` AND content LIKE @param${paramIdx}`;
//     params.push(`%${content}%`);
//     paramIdx++;
//   }
//   if (minHours) {
//     sql += ` AND hours >= @param${paramIdx}`;
//     params.push(minHours);
//     paramIdx++;
//   }
//   if (maxHours) {
//     sql += ` AND hours <= @param${paramIdx}`;
//     params.push(maxHours);
//     paramIdx++;
//   }
//   sql += ' ORDER BY date DESC';
//   const logs = await query(sql, params);
//   return NextResponse.json({ success: true, data: logs });
// }
// // 新增日誌
// export async function POST(request: Request) {
//   const loginUserId = getUserIdFromRequest(request);
//   const { userId, date, task, content, hours } = await request.json();
//   if (!loginUserId || Number(userId) !== Number(loginUserId)) {
//     return NextResponse.json(
//       { success: false, error: '未授權' },
//       { status: 403 }
//     );
//   }
//   const result = await query(
//     `INSERT INTO WorkLogs (userId, date, task, content, hours) OUTPUT INSERTED.* VALUES (@param0, @param1, @param2, @param3, @param4)`,
//     [userId, date, task, content, parseFloat(hours)]
//   );
//   return NextResponse.json({ success: true, data: result[0] });
// }
// // 編輯日誌
// export async function PUT(request: Request) {
//   const loginUserId = getUserIdFromRequest(request);
//   const { id, userId, date, task, content, hours } = await request.json();
//   if (!id) {
//     return NextResponse.json(
//       { success: false, error: '缺少日誌 ID' },
//       { status: 400 }
//     );
//   }
//   // 查詢該日誌的 userId
//   const logs = await query('SELECT * FROM WorkLogs WHERE id=@param0', [id]);
//   if (!logs.length) {
//     return NextResponse.json(
//       { success: false, error: '日誌不存在' },
//       { status: 404 }
//     );
//   }
//   if (!loginUserId || Number(logs[0].userId) !== Number(loginUserId)) {
//     return NextResponse.json(
//       { success: false, error: '未授權' },
//       { status: 403 }
//     );
//   }
//   const result = await query(
//     `UPDATE WorkLogs SET userId=@param0, date=@param1, task=@param2, content=@param3, hours=@param4 WHERE id=@param5; SELECT * FROM WorkLogs WHERE id=@param5`,
//     [userId, date, task, content, parseFloat(hours), id]
//   );
//   const data = Array.isArray(result)
//     ? result[0]
//     : result && result.recordset
//     ? result.recordset[0]
//     : undefined;
//   return NextResponse.json({ success: true, data });
// }
// // 刪除日誌
// export async function DELETE(request: Request) {
//   const loginUserId = getUserIdFromRequest(request);
//   const { searchParams } = new URL(request.url);
//   const id = searchParams.get('id');
//   if (!id) {
//     return NextResponse.json(
//       { success: false, error: '缺少日誌 ID' },
//       { status: 400 }
//     );
//   }
//   // 查詢該日誌
//   const logs = await query('SELECT * FROM WorkLogs WHERE id=@param0', [id]);
//   if (!logs.length) {
//     return NextResponse.json(
//       { success: false, error: '日誌不存在' },
//       { status: 404 }
//     );
//   }
//   if (!loginUserId || Number(logs[0].userId) !== Number(loginUserId)) {
//     return NextResponse.json(
//       { success: false, error: '未授權' },
//       { status: 403 }
//     );
//   }
//   await query('DELETE FROM WorkLogs WHERE id=@param0', [id]);
//   return NextResponse.json({ success: true, data: logs[0] });
// }
// import { NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// // 取得日誌
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get('userId');
//   const date = searchParams.get('date');
//   const startDate = searchParams.get('startDate');
//   const endDate = searchParams.get('endDate');
//   const task = searchParams.get('task');
//   const content = searchParams.get('content');
//   const minHours = searchParams.get('minHours');
//   const maxHours = searchParams.get('maxHours');
//   // 分頁參數
//   const page = parseInt(searchParams.get('page') || '1', 10);
//   const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
//   let sql = 'SELECT * FROM WorkLogs WHERE 1=1';
//   const params: any[] = [];
//   let paramIdx = 0;
//   if (userId) {
//     sql += ` AND userId = @param${paramIdx}`;
//     params.push(userId);
//     paramIdx++;
//   }
//   if (date) {
//     sql += ` AND date = @param${paramIdx}`;
//     params.push(date);
//     paramIdx++;
//   }
//   if (startDate && endDate) {
//     sql += ` AND date BETWEEN @param${paramIdx} AND @param${paramIdx + 1}`;
//     params.push(startDate, endDate);
//     paramIdx += 2;
//   } else if (startDate) {
//     sql += ` AND date >= @param${paramIdx}`;
//     params.push(startDate);
//     paramIdx++;
//   } else if (endDate) {
//     sql += ` AND date <= @param${paramIdx}`;
//     params.push(endDate);
//     paramIdx++;
//   }
//   if (task) {
//     sql += ` AND task LIKE @param${paramIdx}`;
//     params.push(`%${task}%`);
//     paramIdx++;
//   }
//   if (content) {
//     sql += ` AND content LIKE @param${paramIdx}`;
//     params.push(`%${content}%`);
//     paramIdx++;
//   }
//   if (minHours) {
//     sql += ` AND hours >= @param${paramIdx}`;
//     params.push(minHours);
//     paramIdx++;
//   }
//   if (maxHours) {
//     sql += ` AND hours <= @param${paramIdx}`;
//     params.push(maxHours);
//     paramIdx++;
//   }
//   sql += ' ORDER BY date DESC';
//   // 分頁查詢
//   const pagedSql = `${sql} OFFSET ${(page - 1) * pageSize} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
//   const logs = await query(pagedSql, params);
//   // 查詢總數（需移除 ORDER BY，避免 GROUP BY 錯誤）
//   const countSql = sql.replace(/ORDER BY[\s\S]*/i, '').replace('SELECT *', 'SELECT COUNT(*) as total');
//   const countResult = await query(countSql, params);
//   const total = countResult[0]?.total || 0;
//   return NextResponse.json({ success: true, data: logs, total });
// }
// // 新增日誌
// export async function POST(request: Request) {
//   const { userId, date, task, content, hours } = await request.json();
//   const result = await query(
//     `INSERT INTO WorkLogs (userId, date, task, content, hours) OUTPUT INSERTED.* VALUES (@param0, @param1, @param2, @param3, @param4)`,
//     [userId, date, task, content, hours]
//   );
//   return NextResponse.json({ success: true, data: result[0] });
// }
// // 可擴充 PUT/DELETE/批次匯入
// import { NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// // 取得登入者 userId（teamMemberId），直接從 cookie 取
// function getUserIdFromRequest(request: Request): number | null {
//   try {
//     const cookie = request.headers.get('cookie') || '';
//     // 支援 userId 或 teamMemberId
//     const match = cookie.match(/(?:userId|teamMemberId)=([^;]+)/);
//     if (!match) return null;
//     return Number(match[1]);
//   } catch {
//     return null;
//   }
// }
// // 取得日誌
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get('userId');
//   const date = searchParams.get('date');
//   const startDate = searchParams.get('startDate');
//   const endDate = searchParams.get('endDate');
//   const task = searchParams.get('task');
//   const content = searchParams.get('content');
//   const minHours = searchParams.get('minHours');
//   const maxHours = searchParams.get('maxHours');
//   let sql = 'SELECT * FROM WorkLogs WHERE 1=1';
//   const params: any[] = [];
//   let paramIdx = 0;
//   if (userId) {
//     sql += ` AND userId = @param${paramIdx}`;
//     params.push(userId);
//     paramIdx++;
//   }
//   if (date) {
//     sql += ` AND date = @param${paramIdx}`;
//     params.push(date);
//     paramIdx++;
//   }
//   if (startDate && endDate) {
//     sql += ` AND date BETWEEN @param${paramIdx} AND @param${paramIdx + 1}`;
//     params.push(startDate, endDate);
//     paramIdx += 2;
//   } else if (startDate) {
//     sql += ` AND date >= @param${paramIdx}`;
//     params.push(startDate);
//     paramIdx++;
//   } else if (endDate) {
//     sql += ` AND date <= @param${paramIdx}`;
//     params.push(endDate);
//     paramIdx++;
//   }
//   if (task) {
//     sql += ` AND task LIKE @param${paramIdx}`;
//     params.push(`%${task}%`);
//     paramIdx++;
//   }
//   if (content) {
//     sql += ` AND content LIKE @param${paramIdx}`;
//     params.push(`%${content}%`);
//     paramIdx++;
//   }
//   if (minHours) {
//     sql += ` AND hours >= @param${paramIdx}`;
//     params.push(minHours);
//     paramIdx++;
//   }
//   if (maxHours) {
//     sql += ` AND hours <= @param${paramIdx}`;
//     params.push(maxHours);
//     paramIdx++;
//   }
//   sql += ' ORDER BY date DESC';
//   const logs = await query(sql, params);
//   return NextResponse.json({ success: true, data: logs });
// }
// // 新增日誌
// export async function POST(request: Request) {
//   const loginUserId = getUserIdFromRequest(request);
//   const { date, task, content, hours } = await request.json();
//   if (!loginUserId) {
//     return NextResponse.json(
//       { success: false, error: '未授權' },
//       { status: 403 }
//     );
//   }
//   const result = await query(
//     `INSERT INTO WorkLogs (userId, date, task, content, hours) OUTPUT INSERTED.* VALUES (@param0, @param1, @param2, @param3, @param4)`,
//     [loginUserId, date, task, content, parseFloat(hours)]
//   );
//   return NextResponse.json({ success: true, data: result[0] });
// }
// // 編輯日誌
// export async function PUT(request: Request) {
//   const loginUserId = getUserIdFromRequest(request);
//   const { id, date, task, content, hours } = await request.json();
//   if (!id) {
//     return NextResponse.json(
//       { success: false, error: '缺少日誌 ID' },
//       { status: 400 }
//     );
//   }
//   // 查詢該日誌的 userId
//   const logs = await query('SELECT * FROM WorkLogs WHERE id=@param0', [id]);
//   if (!logs.length) {
//     return NextResponse.json(
//       { success: false, error: '日誌不存在' },
//       { status: 404 }
//     );
//   }
//   if (!loginUserId || Number(logs[0].userId) !== Number(loginUserId)) {
//     return NextResponse.json(
//       { success: false, error: '未授權' },
//       { status: 403 }
//     );
//   }
//   const result = await query(
//     `UPDATE WorkLogs SET date=@param0, task=@param1, content=@param2, hours=@param3 WHERE id=@param4; SELECT * FROM WorkLogs WHERE id=@param4`,
//     [date, task, content, parseFloat(hours), id]
//   );
//   const data = Array.isArray(result)
//     ? result[0]
//     : result && result.recordset
//     ? result.recordset[0]
//     : undefined;
//   return NextResponse.json({ success: true, data });
// }
// // 刪除日誌
// export async function DELETE(request: Request) {
//   const loginUserId = getUserIdFromRequest(request);
//   const { searchParams } = new URL(request.url);
//   const id = searchParams.get('id');
//   if (!id) {
//     return NextResponse.json(
//       { success: false, error: '缺少日誌 ID' },
//       { status: 400 }
//     );
//   }
//   // 查詢該日誌
//   const logs = await query('SELECT * FROM WorkLogs WHERE id=@param0', [id]);
//   if (!logs.length) {
//     return NextResponse.json(
//       { success: false, error: '日誌不存在' },
//       { status: 404 }
//     );
//   }
//   if (!loginUserId || Number(logs[0].userId) !== Number(loginUserId)) {
//     return NextResponse.json(
//       { success: false, error: '未授權' },
//       { status: 403 }
//     );
//   }
//   await query('DELETE FROM WorkLogs WHERE id=@param0', [id]);
//   return NextResponse.json({ success: true, data: logs[0] });
// }
//2025 0715
// import { NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// // 取得日誌
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get('userId');
//   const date = searchParams.get('date');
//   const startDate = searchParams.get('startDate');
//   const endDate = searchParams.get('endDate');
//   const task = searchParams.get('task');
//   const content = searchParams.get('content');
//   const minHours = searchParams.get('minHours');
//   const maxHours = searchParams.get('maxHours');
//   // 分頁參數
//   const page = parseInt(searchParams.get('page') || '1', 10);
//   const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
//   let sql = 'SELECT * FROM WorkLogs WHERE 1=1';
//   const params: any[] = [];
//   let paramIdx = 0;
//   if (userId) {
//     sql += ` AND userId = @param${paramIdx}`;
//     params.push(userId);
//     paramIdx++;
//   }
//   if (date) {
//     sql += ` AND date = @param${paramIdx}`;
//     params.push(date);
//     paramIdx++;
//   }
//   if (startDate && endDate) {
//     sql += ` AND date BETWEEN @param${paramIdx} AND @param${paramIdx + 1}`;
//     params.push(startDate, endDate);
//     paramIdx += 2;
//   } else if (startDate) {
//     sql += ` AND date >= @param${paramIdx}`;
//     params.push(startDate);
//     paramIdx++;
//   } else if (endDate) {
//     sql += ` AND date <= @param${paramIdx}`;
//     params.push(endDate);
//     paramIdx++;
//   }
//   if (task) {
//     sql += ` AND task LIKE @param${paramIdx}`;
//     params.push(`%${task}%`);
//     paramIdx++;
//   }
//   if (content) {
//     sql += ` AND content LIKE @param${paramIdx}`;
//     params.push(`%${content}%`);
//     paramIdx++;
//   }
//   if (minHours) {
//     sql += ` AND hours >= @param${paramIdx}`;
//     params.push(minHours);
//     paramIdx++;
//   }
//   if (maxHours) {
//     sql += ` AND hours <= @param${paramIdx}`;
//     params.push(maxHours);
//     paramIdx++;
//   }
//   sql += ' ORDER BY date DESC';
//   // 分頁查詢
//   const pagedSql = `${sql} OFFSET ${(page - 1) * pageSize} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
//   const logs = await query(pagedSql, params);
//   // 查詢總數（需移除 ORDER BY，避免 GROUP BY 錯誤）
//   const countSql = sql.replace(/ORDER BY[\s\S]*/i, '').replace('SELECT *', 'SELECT COUNT(*) as total');
//   const countResult = await query(countSql, params);
//   const total = countResult[0]?.total || 0;
//   return NextResponse.json({ success: true, data: logs, total });
// }
// // 新增日誌
// export async function POST(request: Request) {
//   const { userId, date, task, content, hours } = await request.json();
//   const result = await query(
//     `INSERT INTO WorkLogs (userId, date, task, content, hours) OUTPUT INSERTED.* VALUES (@param0, @param1, @param2, @param3, @param4)`,
//     [userId, date, task, content, hours]
//   );
//   return NextResponse.json({ success: true, data: result[0] });
// }
// // 可擴充 PUT/DELETE/批次匯入
var server_1 = require("next/server");
var db_1 = require("@/lib/db");
function getUserIdFromRequest(request) {
    try {
        var cookie = request.headers.get('cookie') || '';
        var match = cookie.match(/(?:userId|teamMemberId)=([^;]+)/);
        return match ? Number(match[1]) : null;
    }
    catch (_a) {
        return null;
    }
}
function safeDecimal(val) {
    var n = parseFloat(val);
    return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}
function safeDate(val) {
    var d = typeof val === 'string'
        ? new Date(val)
        : val instanceof Date
            ? val
            : new Date(val);
    if (isNaN(d.getTime()))
        throw new Error('Invalid date');
    return d.toISOString().slice(0, 10);
}
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var url, p, filters, sqlText, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = new URL(request.url);
                    p = url.searchParams;
                    filters = [];
                    sqlText = 'SELECT * FROM WorkLogs WHERE 1=1';
                    if (p.get('userId')) {
                        sqlText += " AND userId = @param" + filters.length;
                        filters.push(Number(p.get('userId')));
                    }
                    if (p.get('startDate')) {
                        sqlText += " AND date >= @param" + filters.length;
                        filters.push(safeDate(p.get('startDate')));
                    }
                    if (p.get('endDate')) {
                        sqlText += " AND date <= @param" + filters.length;
                        filters.push(safeDate(p.get('endDate')));
                    }
                    if (p.get('task')) {
                        sqlText += " AND task LIKE @param" + filters.length;
                        filters.push("%" + p.get('task') + "%");
                    }
                    if (p.get('content')) {
                        sqlText += " AND content LIKE @param" + filters.length;
                        filters.push("%" + p.get('content') + "%");
                    }
                    sqlText += ' ORDER BY date DESC';
                    return [4 /*yield*/, db_1.query(sqlText, filters)];
                case 1:
                    data = (_a.sent());
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: data })];
            }
        });
    });
}
exports.GET = GET;
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, _a, date, task, content, hours, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    userId = getUserIdFromRequest(request);
                    if (!userId) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '未授權' }, { status: 403 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 1:
                    _a = _b.sent(), date = _a.date, task = _a.task, content = _a.content, hours = _a.hours;
                    return [4 /*yield*/, db_1.query("INSERT INTO WorkLogs (userId, date, task, content, hours)\n     OUTPUT INSERTED.*\n     VALUES (@param0, @param1, @param2, @param3, @param4)", [userId, safeDate(date), task, content, safeDecimal(hours)])];
                case 2:
                    result = (_b.sent());
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: result[0] })];
            }
        });
    });
}
exports.POST = POST;
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, _a, id, date, task, content, hours, existing, updated;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    userId = getUserIdFromRequest(request);
                    if (!userId) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '未授權' }, { status: 403 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 1:
                    _a = _b.sent(), id = _a.id, date = _a.date, task = _a.task, content = _a.content, hours = _a.hours;
                    if (!id) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少日誌 ID' }, { status: 400 })];
                    }
                    return [4 /*yield*/, db_1.query('SELECT * FROM WorkLogs WHERE id=@param0', [
                            Number(id),
                        ])];
                case 2:
                    existing = (_b.sent());
                    if (!existing.length) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '日誌不存在' }, { status: 404 })];
                    }
                    if (existing[0].userId !== userId) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '未授權' }, { status: 403 })];
                    }
                    return [4 /*yield*/, db_1.query("UPDATE WorkLogs\n       SET date    = @param0,\n           task    = @param1,\n           content = @param2,\n           hours   = @param3\n     WHERE id      = @param4", [safeDate(date), task, content, safeDecimal(hours), Number(id)])];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, db_1.query('SELECT * FROM WorkLogs WHERE id=@param0', [
                            Number(id),
                        ])];
                case 4:
                    updated = (_b.sent());
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: updated[0] })];
            }
        });
    });
}
exports.PUT = PUT;
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, idParam, id, existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = getUserIdFromRequest(request);
                    idParam = new URL(request.url).searchParams.get('id');
                    if (!idParam) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少日誌 ID' }, { status: 400 })];
                    }
                    id = Number(idParam);
                    return [4 /*yield*/, db_1.query('SELECT * FROM WorkLogs WHERE id=@param0', [
                            id,
                        ])];
                case 1:
                    existing = (_a.sent());
                    if (!existing.length) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '日誌不存在' }, { status: 404 })];
                    }
                    if (existing[0].userId !== userId) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '未授權' }, { status: 403 })];
                    }
                    return [4 /*yield*/, db_1.query('DELETE FROM WorkLogs WHERE id=@param0', [id])];
                case 2:
                    _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: existing[0] })];
            }
        });
    });
}
exports.DELETE = DELETE;
