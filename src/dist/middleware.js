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
exports.config = exports.middleware = void 0;
var server_1 = require("next/server");
var jwt_1 = require("@/lib/jwt");
// 不需要驗證的路由
var publicRoutes = ['/login', '/api/auth/login'];
// 權限配置
var permissions = {
    admin: {
        projects: ['create', 'read', 'update', 'delete'],
        tasks: ['create', 'read', 'update', 'delete'],
        team: ['create', 'read', 'update', 'delete']
    },
    user: {
        projects: ['read'],
        tasks: ['read'],
        team: ['read']
    }
};
function middleware(request) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var pathname, token, decoded, role, resource, action, hasPermission, requestHeaders, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pathname = request.nextUrl.pathname;
                    // 檢查是否為公開路由
                    if (publicRoutes.includes(pathname)) {
                        return [2 /*return*/, server_1.NextResponse.next()];
                    }
                    token = (_a = request.cookies.get('token')) === null || _a === void 0 ? void 0 : _a.value;
                    if (!token) {
                        return [2 /*return*/, server_1.NextResponse.redirect(new URL('/login', request.url))];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, jwt_1.jwtVerify(token)];
                case 2:
                    decoded = _b.sent();
                    role = decoded.role;
                    resource = pathname.split('/')[1];
                    action = request.method.toLowerCase();
                    // 如果是 API 請求，檢查權限
                    if (pathname.startsWith('/api')) {
                        hasPermission = checkPermission(role, resource, action);
                        if (!hasPermission) {
                            return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '權限不足' }, { status: 403 })];
                        }
                    }
                    requestHeaders = new Headers(request.headers);
                    requestHeaders.set('x-user-id', decoded.employeeId);
                    requestHeaders.set('x-user-role', decoded.role);
                    return [2 /*return*/, server_1.NextResponse.next({
                            request: {
                                headers: requestHeaders
                            }
                        })];
                case 3:
                    error_1 = _b.sent();
                    console.error('權限驗證錯誤:', error_1);
                    return [2 /*return*/, server_1.NextResponse.redirect(new URL('/login', request.url))];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.middleware = middleware;
// 配置需要驗證的路由
exports.config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ]
};
// 檢查權限
function checkPermission(role, resource, action) {
    var rolePermissions = permissions[role];
    if (!rolePermissions)
        return false;
    var resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions)
        return false;
    return resourcePermissions.includes(action);
}
