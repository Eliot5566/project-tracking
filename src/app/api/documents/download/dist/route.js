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
exports.GET = void 0;
// src/app/api/documents/download/route.ts
var server_1 = require("next/server");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
/**
 * 下載文件 API
 *
 * 根據 filePath 參數下載指定的文件
 *
 * @param request - 包含 filePath 參數的請求
 * @returns 返回文件內容或錯誤信息
 */
var db_1 = require("@/lib/db");
function GET(request) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, filePath, password, docsRaw, docs, passwordHashDb, crypto_1, inputHash, relativePath, fullPath, fileBuffer, ext, contentType, baseName, encodedName, body, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    searchParams = new URL(request.url).searchParams;
                    filePath = searchParams.get('filePath');
                    password = searchParams.get('password') || '';
                    if (!filePath) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '缺少 filePath 參數' }, { status: 400 })];
                    }
                    return [4 /*yield*/, db_1.query('SELECT passwordHash FROM Documents WHERE filePath = @param0', [filePath])];
                case 1:
                    docsRaw = _c.sent();
                    docs = Array.isArray(docsRaw)
                        ? docsRaw
                        : (Array.isArray((_a = docsRaw) === null || _a === void 0 ? void 0 : _a.recordset) ? docsRaw.recordset : []);
                    if (!docs || docs.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '文件不存在' }, { status: 404 })];
                    }
                    passwordHashDb = ((_b = docs[0]) === null || _b === void 0 ? void 0 : _b.passwordHash) || '';
                    if (!passwordHashDb) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('crypto'); })];
                case 2:
                    crypto_1 = _c.sent();
                    inputHash = crypto_1.createHash('sha256').update(password).digest('hex');
                    if (inputHash !== passwordHashDb) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '密碼錯誤，無法下載' }, { status: 403 })];
                    }
                    _c.label = 3;
                case 3:
                    relativePath = filePath.replace(/^\/+/, '');
                    fullPath = path_1["default"].join(process.cwd(), 'public', relativePath);
                    // 檢查檔案是否存在
                    if (!fs_1["default"].existsSync(fullPath)) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '文件不存在' }, { status: 404 })];
                    }
                    return [4 /*yield*/, promises_1["default"].readFile(fullPath)];
                case 4:
                    fileBuffer = _c.sent();
                    ext = path_1["default"].extname(fullPath).toLowerCase();
                    contentType = 'application/octet-stream';
                    switch (ext) {
                        case '.pdf':
                            contentType = 'application/pdf';
                            break;
                        case '.txt':
                            contentType = 'text/plain';
                            break;
                        case '.jpg':
                        case '.jpeg':
                            contentType = 'image/jpeg';
                            break;
                        case '.png':
                            contentType = 'image/png';
                            break;
                        case '.doc':
                        case '.docx':
                            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                            break;
                        case '.xls':
                        case '.xlsx':
                            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                            break;
                        case '.ppt':
                        case '.pptx':
                            contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                            break;
                    }
                    baseName = path_1["default"].basename(fullPath);
                    encodedName = encodeURIComponent(baseName);
                    body = new Uint8Array(fileBuffer.length);
                    body.set(fileBuffer);
                    return [2 /*return*/, new server_1.NextResponse(body, {
                            headers: {
                                'Content-Type': contentType,
                                'Content-Disposition': "attachment; filename*=UTF-8''" + encodedName
                            }
                        })];
                case 5:
                    error_1 = _c.sent();
                    console.error('下載文件失敗:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ success: false, error: '下載文件失敗: ' + (error_1 instanceof Error ? error_1.message : '未知錯誤') }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.GET = GET;
