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
exports.execute = exports.query = exports.getConnection = void 0;
var mssql_1 = require("mssql");
var config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'YourStrong@Passw0rd',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'ProjectTracking',
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};
function getConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var pool, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, mssql_1["default"].connect(config)];
                case 1:
                    pool = _a.sent();
                    return [2 /*return*/, pool];
                case 2:
                    error_1 = _a.sent();
                    console.error('資料庫連接錯誤:', error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getConnection = getConnection;
function query(sqlQuery, params) {
    if (params === void 0) { params = []; }
    return __awaiter(this, void 0, void 0, function () {
        var pool, request_1, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getConnection()];
                case 1:
                    pool = _a.sent();
                    request_1 = pool.request();
                    params.forEach(function (param, index) {
                        if (param === null) {
                            request_1.input("param" + index, mssql_1["default"].VarChar, null);
                        }
                        else if (typeof param === 'number') {
                            request_1.input("param" + index, mssql_1["default"].Int, param);
                        }
                        else {
                            request_1.input("param" + index, mssql_1["default"].NVarChar, param);
                        }
                    });
                    return [4 /*yield*/, request_1.query(sqlQuery)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.recordset];
                case 3:
                    error_2 = _a.sent();
                    console.error('查詢錯誤:', error_2);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.query = query;
function execute(sqlQuery, params) {
    if (params === void 0) { params = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var pool, request_2, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getConnection()];
                case 1:
                    pool = _a.sent();
                    request_2 = pool.request();
                    Object.entries(params).forEach(function (_a) {
                        var key = _a[0], value = _a[1];
                        if (value === null) {
                            request_2.input(key, mssql_1["default"].VarChar, null);
                        }
                        else if (typeof value === 'number') {
                            request_2.input(key, mssql_1["default"].Int, value);
                        }
                        else {
                            request_2.input(key, mssql_1["default"].NVarChar, value);
                        }
                    });
                    return [4 /*yield*/, request_2.query(sqlQuery)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.recordset];
                case 3:
                    error_3 = _a.sent();
                    console.error('執行錯誤:', error_3);
                    throw error_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.execute = execute;
