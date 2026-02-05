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
exports.POST = void 0;
var server_1 = require("next/server");
var db_1 = require("@/lib/db");
var mssql_1 = require("mssql");
if (typeof window !== 'undefined') {
    throw new Error('`auth/login/route.ts` should only be used on the server side.');
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, employeeId, password, pool, result, user_1, teamMemberResult, teamMemberId, response, cookieOptions, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    _a = _b.sent(), employeeId = _a.employeeId, password = _a.password;
                    if (!employeeId || !password) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '請輸入工號和密碼' }, { status: 400 })];
                    }
                    return [4 /*yield*/, db_1.getConnection()];
                case 2:
                    pool = _b.sent();
                    return [4 /*yield*/, pool.request()
                            .input('employeeId', mssql_1["default"].NVarChar, employeeId)
                            .input('password', mssql_1["default"].NVarChar, password)
                            .query("\n        SELECT \n          [\u90E8\u9580\u4EE3\u78BC] as departmentCode,\n          [\u90E8\u9580\u540D\u7A31] as departmentName,\n          [\u5DE5\u865F] as employeeId,\n          [\u59D3\u540D] as name,\n          [\u8077\u4F4D\u540D\u7A31] as position,\n          [\u5BC6\u78BC] as password,\n          [\u570B\u7C4D] as nationality,\n          [\u54E1\u5DE5\u4FE1\u7BB1] as email,\n          [\u4E3B\u7BA1\u59D3\u540D] as supervisorName,\n          [\u96E2\u8077\u65E5\u671F] as resignationDate,\n          [\u767B\u5165\u6B21\u6578] as loginCount,\n          [\u6700\u5F8C\u767B\u5165\u6642\u9593] as lastLoginTime\n        FROM [JCYDB].[dbo].[\u4EBA\u54E1\u5C0D\u7167\u6A94]\n        WHERE [\u5DE5\u865F] = @employeeId AND [\u5BC6\u78BC] = @password\n      ")];
                case 3:
                    result = _b.sent();
                    if (result.recordset.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '工號或密碼錯誤' }, { status: 401 })];
                    }
                    user_1 = result.recordset[0];
                    // 檢查是否已離職
                    if (user_1.resignationDate) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '該帳號已離職' }, { status: 403 })];
                    }
                    return [4 /*yield*/, pool.request()
                            .input('employeeId', mssql_1["default"].NVarChar, employeeId)
                            .query("\n        SELECT TOP 1 id FROM [ProjectTracking].[dbo].[TeamMembers] WHERE employeeId = @employeeId\n      ")];
                case 4:
                    teamMemberResult = _b.sent();
                    teamMemberId = teamMemberResult.recordset.length > 0 ? teamMemberResult.recordset[0].id : null;
                    // 更新登入資訊
                    return [4 /*yield*/, pool.request()
                            .input('employeeId', mssql_1["default"].NVarChar, employeeId)
                            .query("\n        UPDATE [JCYDB].[dbo].[\u4EBA\u54E1\u5C0D\u7167\u6A94]\n        SET \n          [\u767B\u5165\u6B21\u6578] = [\u767B\u5165\u6B21\u6578] + 1,\n          [\u6700\u5F8C\u767B\u5165\u6642\u9593] = GETDATE()\n        WHERE [\u5DE5\u865F] = @employeeId\n      ")];
                case 5:
                    // 更新登入資訊
                    _b.sent();
                    response = server_1.NextResponse.json({
                        success: true,
                        data: {
                            user: {
                                employeeId: user_1.employeeId,
                                name: user_1.name,
                                department: user_1.departmentName,
                                position: user_1.position,
                                role: ['經理', '副理', '總經理', '董事長', '課長'].some(function (pos) {
                                    return user_1.position.includes(pos);
                                }) || user_1.departmentCode.startsWith('IT')
                                    ? 'admin'
                                    : 'user',
                                email: user_1.email,
                                teamMemberId: teamMemberId
                            }
                        }
                    });
                    // 設置用於後端 API 授權的 cookie（讓 /api/worklogs 能取得登入者）
                    if (teamMemberId) {
                        cookieOptions = {
                            httpOnly: true,
                            sameSite: 'lax',
                            path: '/',
                            maxAge: 7 * 24 * 60 * 360
                        };
                        response.cookies.set('teamMemberId', String(teamMemberId), cookieOptions);
                        // 兼容舊版 userId 名稱
                        response.cookies.set('userId', String(teamMemberId), cookieOptions);
                    }
                    return [2 /*return*/, response];
                case 6:
                    error_1 = _b.sent();
                    console.error('登入錯誤:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '登入失敗' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
