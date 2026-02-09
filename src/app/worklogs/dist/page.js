'use client';
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var I18nProvider_1 = require("../components/I18nProvider");
var dayjs_1 = require("dayjs");
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var XLSX = require("xlsx");
var antd_2 = require("antd");
var icons_2 = require("@ant-design/icons");
var columns = function (handleEdit, handleDelete, currentUserId, dateLocale) { return [
    { title: '使用者', dataIndex: 'userName', key: 'userName', width: 100 },
    {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        render: function (date) {
            return date
                ? new Date(date)
                    .toLocaleDateString(dateLocale, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                })
                : '';
        }
    },
    { title: '工作事項', dataIndex: 'task', key: 'task' },
    { title: '作業內容', dataIndex: 'content', key: 'content' },
    { title: '工時', dataIndex: 'hours', key: 'hours' },
    {
        title: '操作',
        key: 'action',
        width: 120,
        render: function (_, record) {
            // 如果 currentUserId 未定義或與 record.userId 不符，則不顯示操作按鈕 record.userId是 WorkLog 的 userId currentUserId 是當前登入者的 userId 存放在 localStorage
            if (!currentUserId || record.userId !== currentUserId)
                return null;
            return (React.createElement(antd_1.Space, null,
                React.createElement(antd_1.Button, { icon: React.createElement(icons_2.EditOutlined, null), size: "small", onClick: function () { return handleEdit(record); } }, "\u7DE8\u8F2F"),
                React.createElement(antd_1.Button, { icon: React.createElement(icons_2.DeleteOutlined, null), size: "small", danger: true, onClick: function () { return handleDelete(record.id); } }, "\u522A\u9664")));
        }
    },
]; };
function WorkLogBlock() {
    var _this = this;
    var locale = I18nProvider_1.useI18n().locale;
    var dateLocale = locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'zh-TW';
    // 取得登入者 userId（teamMemberId）
    var _a = react_1.useState(undefined), loginUserId = _a[0], setLoginUserId = _a[1];
    var _b = react_1.useState(undefined), userDept = _b[0], setUserDept = _b[1];
    react_1.useEffect(function () {
        if (typeof window !== 'undefined') {
            var userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    var user = JSON.parse(userStr);
                    if (user.teamMemberId)
                        setLoginUserId(Number(user.teamMemberId));
                    if (user.department)
                        setUserDept(String(user.department));
                }
                catch (_a) { }
            }
        }
    }, []);
    // 編輯日誌 Modal 狀態
    var _c = react_1.useState(false), editModalOpen = _c[0], setEditModalOpen = _c[1];
    var _d = react_1.useState(null), editingLog = _d[0], setEditingLog = _d[1];
    var _e = react_1.useState({
        date: '',
        task: '',
        content: '',
        hours: 0
    }), editForm = _e[0], setEditForm = _e[1];
    // 編輯日誌
    var handleEdit = function (record) {
        setEditingLog(record);
        setEditForm({
            date: record.date,
            task: record.task,
            content: record.content,
            hours: record.hours
        });
        setEditModalOpen(true);
    };
    var handleEditSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var hoursNum, result, res, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!editingLog)
                        return [2 /*return*/];
                    hoursNum = parseFloat(editForm.hours);
                    if (isNaN(hoursNum) || hoursNum <= 0) {
                        antd_1.message.error('請輸入正確工時');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/worklogs', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(__assign(__assign({ id: editingLog.id, userId: editingLog.userId }, editForm), { hours: hoursNum }))
                        })];
                case 2:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    result = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    antd_1.message.error('伺服器回應格式錯誤，請聯絡管理員');
                    return [2 /*return*/];
                case 5:
                    if (result.success) {
                        setData(function (prev) {
                            return prev.map(function (log) { return (log.id === editingLog.id ? result.data : log); });
                        });
                        setEditModalOpen(false);
                        setEditingLog(null);
                        antd_1.message.success('編輯成功');
                    }
                    else {
                        antd_1.message.error(result.error || '編輯失敗');
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    // 刪除日誌
    var handleDelete = function (id) {
        antd_2.Modal.confirm({
            title: '確定要刪除此日誌嗎？',
            onOk: function () { return __awaiter(_this, void 0, void 0, function () {
                var res, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("/api/worklogs?id=" + id, { method: 'DELETE' })];
                        case 1:
                            res = _a.sent();
                            return [4 /*yield*/, res.json()];
                        case 2:
                            result = _a.sent();
                            if (result.success) {
                                setData(function (prev) { return prev.filter(function (log) { return log.id !== id; }); });
                                antd_1.message.success('刪除成功');
                            }
                            else {
                                antd_1.message.error(result.error || '刪除失敗');
                            }
                            return [2 /*return*/];
                    }
                });
            }); }
        });
    };
    var router = navigation_1.useRouter();
    react_1.useEffect(function () {
        if (typeof window !== 'undefined') {
            var isLogin = localStorage.getItem('isLogin') === '1';
            if (!isLogin) {
                router.replace('/login');
                return;
            }
            // 僅允許 IT 相關部門使用
            var dept = userDept || (function () { try {
                var u = JSON.parse(localStorage.getItem('user') || '{}');
                return u.department;
            }
            catch (_a) {
                return undefined;
            } })();
            var isIT = !!dept && /資訊|系統|資安|IT/i.test(dept);
            if (!isIT) {
                // 導回首頁或顯示 403
                router.replace('/');
            }
        }
    }, []);
    var _f = react_1.useState([]), data = _f[0], setData = _f[1];
    var form = antd_1.Form.useForm()[0];
    var _g = react_1.useState(undefined), userId = _g[0], setUserId = _g[1];
    var _h = react_1.useState([]), users = _h[0], setUsers = _h[1];
    // 查詢條件狀態
    var _j = react_1.useState(''), searchContent = _j[0], setSearchContent = _j[1];
    var _k = react_1.useState(null), searchDateRange = _k[0], setSearchDateRange = _k[1];
    var _l = react_1.useState(''), searchTask = _l[0], setSearchTask = _l[1];
    var _m = react_1.useState(false), searchCollapsed = _m[0], setSearchCollapsed = _m[1];
    var _o = react_1.useState(false), loading = _o[0], setLoading = _o[1];
    var _p = react_1.useState({
        current: 1,
        pageSize: 10,
        total: 0
    }), pagination = _p[0], setPagination = _p[1];
    var _q = react_1.useState({}), sorter = _q[0], setSorter = _q[1];
    // 查詢日誌
    var fetchLogs = function (paramsOverride) {
        if (paramsOverride === void 0) { paramsOverride = {}; }
        return __awaiter(_this, void 0, void 0, function () {
            var params, page, pageSize, res, json_1, logs_1, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setLoading(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        params = new URLSearchParams();
                        page = paramsOverride.current || pagination.current;
                        pageSize = paramsOverride.pageSize || pagination.pageSize;
                        params.append('page', String(page));
                        params.append('pageSize', String(pageSize));
                        if (userId)
                            params.append('userId', String(userId));
                        if (searchContent)
                            params.append('content', searchContent);
                        if (searchTask)
                            params.append('task', searchTask);
                        if (searchDateRange &&
                            searchDateRange.length === 2 &&
                            searchDateRange[0] &&
                            searchDateRange[1]) {
                            params.append('startDate', searchDateRange[0].format('YYYY-MM-DD'));
                            params.append('endDate', searchDateRange[1].format('YYYY-MM-DD'));
                        }
                        if (sorter.field && sorter.order) {
                            params.append('sortField', sorter.field);
                            params.append('sortOrder', sorter.order === 'ascend' ? 'asc' : 'desc');
                        }
                        return [4 /*yield*/, fetch("/api/worklogs?" + params.toString())];
                    case 2:
                        res = _a.sent();
                        return [4 /*yield*/, res.json()];
                    case 3:
                        json_1 = _a.sent();
                        logs_1 = json_1.data || [];
                        logs_1 = logs_1.map(function (log) {
                            var _a;
                            return (__assign(__assign({}, log), { userName: log.userName || ((_a = users.find(function (u) { return u.id === log.userId; })) === null || _a === void 0 ? void 0 : _a.name) ||
                                    log.userId ||
                                    '' }));
                        });
                        setData(logs_1);
                        setPagination(function (prev) { return (__assign(__assign({}, prev), { total: json_1.total || logs_1.length })); });
                        return [3 /*break*/, 6];
                    case 4:
                        e_1 = _a.sent();
                        antd_1.message.error('取得日誌失敗');
                        return [3 /*break*/, 6];
                    case 5:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // 查詢條件清除
    var handleClearSearch = function () {
        setSearchContent('');
        setSearchDateRange(null);
        setSearchTask('');
        setPagination(function (prev) { return (__assign(__assign({}, prev), { current: 1 })); });
    };
    // 查詢條件變動時查詢
    // 頁面初始不自動查詢，僅在使用者點查詢時才查詢
    // useEffect(() => {
    //   fetchLogs({ current: 1 });
    //   // eslint-disable-next-line
    // }, [userId, users, searchContent, searchDateRange, searchTask, sorter]);
    // 取得所有使用者
    react_1.useEffect(function () {
        fetch('/api/team')
            .then(function (res) { return res.json(); })
            .then(function (res) {
            if (res.success)
                setUsers(res.data.map(function (u) { return ({ id: u.id, name: u.name }); }));
        });
    }, []);
    // Excel 日期轉字串
    // const excelDateToString = (excelDate: number | string) => {
    //   if (typeof excelDate === 'number') {
    //     const date = new Date((excelDate - 25569) * 86400 * 1000);
    //     return date.toISOString().slice(0, 10);
    //   }
    //   if (typeof excelDate === 'string' && excelDate.length >= 8) {
    //     // yyyy-mm-dd or yyyy/mm/dd
    //     return excelDate.replace(/\//g, '-');
    //   }
    //   return excelDate;
    // };
    var excelDateToString = function (excelDate) {
        if (typeof excelDate === 'number') {
            var date = new Date((excelDate - 25569) * 86400 * 1000);
            return date.toISOString().slice(0, 10);
        }
        if (typeof excelDate === 'string') {
            var s = excelDate.trim();
            // 支援 20250102 → 2025-01-02
            if (/^\d{8}$/.test(s)) {
                return s.slice(0, 4) + "-" + s.slice(4, 6) + "-" + s.slice(6, 8);
            }
            // yyyy-mm-dd, yyyy/mm/dd, yyyy.mm.dd
            if (/^\d{4}[-/.]\d{2}[-/.]\d{2}$/.test(s)) {
                return s.replace(/[/.]/g, '-');
            }
            // fallback: dayjs parse
            var d = dayjs_1["default"](s);
            if (d.isValid())
                return d.format('YYYY-MM-DD');
        }
        return excelDate;
    };
    // 匯入 Excel
    var _r = react_1.useState(false), importing = _r[0], setImporting = _r[1];
    var handleImport = function (file) {
        if (!userId) {
            antd_1.message.error('請先選擇使用者');
            return false;
        }
        setImporting(true);
        var reader = new FileReader();
        reader.onload = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var workbook, sheet, json, lastDate, rows, _i, _a, row, dateVal, parsedDate, dayOfWeek, successCount, failedIdx, i, row, res, json_2, e_2, res, j, _b;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        workbook = XLSX.read((_c = e.target) === null || _c === void 0 ? void 0 : _c.result, { type: 'binary' });
                        sheet = workbook.Sheets[workbook.SheetNames[0]];
                        json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                        lastDate = '';
                        rows = [];
                        for (_i = 0, _a = json.slice(1); _i < _a.length; _i++) {
                            row = _a[_i];
                            dateVal = row[0];
                            parsedDate = '';
                            if (dateVal === undefined || dateVal === null || dateVal === '') {
                                parsedDate = lastDate;
                            }
                            else {
                                parsedDate = excelDateToString(dateVal);
                                // 檢查是否為有效日期
                                if (parsedDate && dayjs_1["default"](parsedDate).isValid()) {
                                    lastDate = parsedDate;
                                }
                                else {
                                    // 無效日期，略過這一行
                                    continue;
                                }
                            }
                            // 檢查日期是否有效
                            if (!parsedDate || !dayjs_1["default"](parsedDate).isValid())
                                continue;
                            dayOfWeek = dayjs_1["default"](parsedDate).day();
                            if (dayOfWeek === 0 || dayOfWeek === 6)
                                continue;
                            rows.push({
                                userId: userId,
                                userName: ((_d = users.find(function (u) { return u.id === userId; })) === null || _d === void 0 ? void 0 : _d.name) || '',
                                date: parsedDate,
                                task: row[1] != null ? String(row[1]) : '',
                                content: row[2] != null ? String(row[2]) : '',
                                hours: row[3] !== undefined && row[3] !== null && row[3] !== ''
                                    ? Number(row[3])
                                    : 0
                            });
                        }
                        successCount = 0;
                        failedIdx = [];
                        i = 0;
                        _e.label = 1;
                    case 1:
                        if (!(i < rows.length)) return [3 /*break*/, 7];
                        row = rows[i];
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, fetch('/api/worklogs', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(row)
                            })];
                    case 3:
                        res = _e.sent();
                        return [4 /*yield*/, res.json()];
                    case 4:
                        json_2 = _e.sent();
                        if (json_2 && json_2.success)
                            successCount++;
                        else
                            failedIdx.push(i);
                        return [3 /*break*/, 6];
                    case 5:
                        e_2 = _e.sent();
                        failedIdx.push(i);
                        return [3 /*break*/, 6];
                    case 6:
                        i++;
                        return [3 /*break*/, 1];
                    case 7:
                        _e.trys.push([7, 10, , 11]);
                        return [4 /*yield*/, fetch("/api/worklogs?userId=" + userId)];
                    case 8:
                        res = _e.sent();
                        return [4 /*yield*/, res.json()];
                    case 9:
                        j = _e.sent();
                        setData(j.data || []);
                        return [3 /*break*/, 11];
                    case 10:
                        _b = _e.sent();
                        return [3 /*break*/, 11];
                    case 11:
                        setImporting(false);
                        if (failedIdx.length > 0) {
                            antd_1.message.warning("\u532F\u5165\u5B8C\u6210\uFF1A\u6210\u529F " + successCount + " \u7B46\uFF0C\u5931\u6557 " + failedIdx.length + " \u7B46");
                        }
                        else {
                            antd_1.message.success('匯入成功，已寫入資料庫');
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        reader.readAsBinaryString(file);
        return false;
    };
    // 新增日誌
    var handleAdd = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var res, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId) {
                        antd_1.message.error('請先選擇使用者');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch('/api/worklogs', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(__assign(__assign({}, values), { userId: userId, hours: parseFloat(values.hours) }))
                        })];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        setData(function (prev) { return __spreadArrays([result.data], prev); });
                        form.resetFields();
                        antd_1.message.success('新增成功');
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    // 狀態：多筆日誌填寫  陣列包裝多筆日誌資料 [{}] 代表多筆日誌的資料結構
    // 每一筆日誌包含日期、工作事項、作業內容、工時
    var _s = react_1.useState([
        { date: '', task: '', content: '', hours: '' },
    ]), multiLogs = _s[0], setMultiLogs = _s[1];
    // 欄位錯誤提示  使用<{ [k: number]: { [key: string]: string } }>來表示每一行的錯誤訊息
    // k: number 用於表示行索引，key: string 用於表示欄位名稱，value: string 用於表示錯誤訊息
    // 實際上的JS 是物件的形式，類似於 { 0: { date: '錯誤訊息' }, 1: { task: '錯誤訊息' } }
    // {K: number} 用於表示索引，{[key: string]: string} 用於表示欄位錯誤訊息
    // 這樣可以讓我們在物件中使用動態的鍵名，實際上存取時，會使用 rowErrors[idx][key] 來存取每一行的錯誤訊息
    var _t = react_1.useState({}), rowErrors = _t[0], setRowErrors = _t[1];
    // 新增一行
    var addLogRow = function () {
        return setMultiLogs(function (prev) { return __spreadArrays(prev, [
            { date: '', task: '', content: '', hours: '' },
        ]); });
    };
    // 刪除一行
    var removeLogRow = function (idx) {
        return setMultiLogs(function (prev) {
            return prev.length === 1 ? prev : prev.filter(function (_, i) { return i !== idx; });
        });
    };
    // 修改欄位
    var updateLogRow = function (idx, key, value) {
        setMultiLogs(function (prev) {
            return prev.map(function (row, i) {
                var _a;
                return (i === idx ? __assign(__assign({}, row), (_a = {}, _a[key] = value, _a)) : row);
            });
        });
        setRowErrors(function (prev) {
            var next = __assign({}, prev);
            if (next[idx]) {
                next[idx][key] = '';
            }
            return next;
        });
    };
    // 複製上一行（包含日期）
    var copyPrevRow = function (idx) {
        if (idx === 0)
            return;
        setMultiLogs(function (prev) {
            return prev.map(function (row, i) { return (i === idx ? __assign({}, prev[idx - 1]) : row); });
        });
    };
    // 鍵盤 Enter 快速跳欄/新增行
    var handleKeyDown = function (e, idx, key) {
        if (e.key === 'Enter') {
            if (key === 'hours' && idx === multiLogs.length - 1) {
                addLogRow();
            }
        }
    };
    // 批次送出
    var handleMultiAdd = function () { return __awaiter(_this, void 0, void 0, function () {
        var hasError, errors, success, failedRows, i, row, res, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!userId) {
                        antd_1.message.error('請先選擇使用者');
                        return [2 /*return*/];
                    }
                    hasError = false;
                    errors = {};
                    multiLogs.forEach(function (row, idx) {
                        var err = {};
                        if (!row.date)
                            err.date = '請選擇日期';
                        if (!row.task)
                            err.task = '請輸入工作事項';
                        if (!row.content)
                            err.content = '請輸入作業內容';
                        if (!row.hours || isNaN(Number(row.hours)) || Number(row.hours) <= 0)
                            err.hours = '請輸入正確工時';
                        if (Object.keys(err).length) {
                            errors[idx] = err;
                            hasError = true;
                        }
                    });
                    setRowErrors(errors);
                    if (hasError) {
                        antd_1.message.error('請修正紅色欄位錯誤');
                        return [2 /*return*/];
                    }
                    success = 0;
                    failedRows = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < multiLogs.length)) return [3 /*break*/, 5];
                    row = multiLogs[i];
                    return [4 /*yield*/, fetch('/api/worklogs', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(__assign(__assign({}, row), { userId: userId, hours: row.hours !== undefined && row.hours !== null && row.hours !== ''
                                    ? Number(row.hours)
                                    : 0 }))
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    result = _a.sent();
                    if (result.success)
                        success++;
                    else
                        failedRows.push(i + 1);
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5:
                    // 重新查詢
                    // fetch API寫法 : fetch(`/api/worklogs?userId=${userId}`)
                    // 這裡的 userId 是從狀態中取得的
                    // 這樣可以確保查詢到正確的使用者日誌
                    // .then((res) => res.json()) 表示將回應轉換為 JSON 格式 res是 fetch 的回應物件
                    fetch("/api/worklogs?userId=" + userId)
                        .then(function (res) { return res.json(); })
                        .then(function (res) {
                        var logs = res.data || [];
                        logs = logs.map(function (log) {
                            var _a;
                            return (__assign(__assign({}, log), { userName: log.userName || ((_a = users.find(function (u) { return u.id === log.userId; })) === null || _a === void 0 ? void 0 : _a.name) ||
                                    log.userId ||
                                    '' }));
                        });
                        setData(logs);
                    });
                    // 只清空成功的行
                    setMultiLogs(function (prev) {
                        return prev.filter(function (_, i) { return failedRows.includes(i + 1); }).length
                            ? prev.filter(function (_, i) { return failedRows.includes(i + 1); })
                            : [{ date: '', task: '', content: '', hours: '' }];
                    });
                    if (failedRows.length) {
                        antd_1.message.warning("\u6709 " + failedRows.length + " \u7B46\u5931\u6557\uFF0C\u8ACB\u6AA2\u67E5\u8CC7\u6599");
                    }
                    else {
                        antd_1.message.success("\u6210\u529F\u65B0\u589E " + success + " \u7B46\u65E5\u8A8C");
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    // 一周模式：自動產生本周一到五的日期（自動跳過六日）
    var fillWeek = function () {
        var today = new Date();
        var day = today.getDay();
        // 0:日, 1:一, ..., 6:六
        var monday = new Date(today);
        monday.setDate(today.getDate() - ((day + 6) % 7));
        var weekRows = [];
        for (var i = 0; i < 7; i++) {
            var d = new Date(monday);
            d.setDate(monday.getDate() + i);
            if (d.getDay() === 0 || d.getDay() === 6)
                continue;
            weekRows.push({
                date: d.toISOString().slice(0, 10),
                task: '',
                content: '',
                hours: ''
            });
            if (weekRows.length === 5)
                break;
        }
        setMultiLogs(weekRows);
    };
    // 本日快速填寫
    var fillToday = function () {
        var today = new Date();
        setMultiLogs([
            {
                date: today.toISOString().slice(0, 10),
                task: '',
                content: '',
                hours: ''
            },
        ]);
    };
    return (React.createElement("div", { style: {
            maxWidth: 1250,
            margin: '0 auto',
            padding: 36,
            background: 'linear-gradient(135deg, #f8fafc 70%, #e3e9f7 100%)',
            borderRadius: 18,
            boxShadow: '0 4px 32px #0002',
            fontFamily: "'Noto Sans TC', 'Segoe UI', 'Microsoft JhengHei', Arial, sans-serif",
            letterSpacing: 0.5
        } },
        React.createElement(antd_1.Collapse, { activeKey: searchCollapsed ? [] : ['1'], onChange: function () { return setSearchCollapsed(function (prev) { return !prev; }); }, style: {
                marginBottom: 28,
                background: 'transparent',
                borderRadius: 12,
                fontFamily: "'Noto Sans TC', 'Segoe UI', 'Microsoft JhengHei', Arial, sans-serif"
            }, expandIconPosition: "end" },
            React.createElement(antd_1.Collapse.Panel, { header: React.createElement("span", { style: { fontWeight: 700, fontSize: 18, letterSpacing: 1 } }, "\u67E5\u8A62\u689D\u4EF6"), key: "1", style: {
                    background: '#f4f6fa',
                    borderRadius: 12,
                    border: 'none',
                    margin: 0,
                    fontFamily: "'Noto Sans TC', 'Segoe UI', 'Microsoft JhengHei', Arial, sans-serif"
                } },
                React.createElement(antd_1.Space, { wrap: true, size: [18, 18], align: "center" },
                    React.createElement(antd_1.Select, { style: { width: 180, fontSize: 16, fontFamily: 'inherit' }, placeholder: "\u9078\u64C7\u4F7F\u7528\u8005", value: userId, onChange: setUserId, options: users.map(function (u) { return ({ value: u.id, label: u.name }); }), allowClear: true }),
                    React.createElement(antd_1.DatePicker.RangePicker, { style: { width: 240, fontSize: 16, fontFamily: 'inherit' }, allowClear: true, value: searchDateRange, onChange: setSearchDateRange, placeholder: ['開始日期', '結束日期'], inputReadOnly: true }),
                    React.createElement(antd_1.Input, { style: { width: 200, fontSize: 16, fontFamily: 'inherit' }, allowClear: true, value: searchTask, onChange: function (e) { return setSearchTask(e.target.value); }, placeholder: "\u5DE5\u4F5C\u4E8B\u9805\u95DC\u9375\u5B57" }),
                    React.createElement(antd_1.Input, { style: { width: 200, fontSize: 16, fontFamily: 'inherit' }, allowClear: true, value: searchContent, onChange: function (e) { return setSearchContent(e.target.value); }, placeholder: "\u4F5C\u696D\u5167\u5BB9\u95DC\u9375\u5B57" }),
                    React.createElement(antd_1.Button, { type: "primary", onClick: function () { return fetchLogs({ current: 1 }); }, style: {
                            fontWeight: 600,
                            fontSize: 16,
                            height: 40,
                            borderRadius: 8,
                            letterSpacing: 1
                        } }, "\u67E5\u8A62"),
                    React.createElement(antd_1.Button, { onClick: handleClearSearch, style: {
                            fontWeight: 500,
                            fontSize: 16,
                            height: 40,
                            borderRadius: 8,
                            marginLeft: 2
                        } }, "\u6E05\u9664\u689D\u4EF6"),
                    React.createElement("div", { style: {
                            background: '#f4f6fa',
                            borderRadius: 12,
                            padding: 18,
                            marginBottom: 32,
                            boxShadow: '0 2px 8px #0001'
                        } },
                        React.createElement("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 8 } }, "\u591A\u7B46\u65E5\u8A8C\u586B\u5BEB"),
                        multiLogs.map(function (row, idx) { return (React.createElement(antd_1.Space, { key: idx, style: { marginBottom: 8, flexWrap: 'wrap' } },
                            React.createElement(antd_1.DatePicker, { style: { width: 120 }, placeholder: "\u65E5\u671F", value: row.date ? dayjs_1["default"](row.date) : undefined, onChange: function (d) {
                                    return updateLogRow(idx, 'date', d ? d.format('YYYY-MM-DD') : '');
                                }, inputReadOnly: true }),
                            React.createElement(antd_1.Input, { style: { width: 120 }, placeholder: "\u5DE5\u4F5C\u4E8B\u9805", value: row.task, onChange: function (e) { return updateLogRow(idx, 'task', e.target.value); }, onKeyDown: function (e) { return handleKeyDown(e, idx, 'task'); } }),
                            React.createElement(antd_1.Input, { style: { width: 220 }, placeholder: "\u4F5C\u696D\u5167\u5BB9", value: row.content, onChange: function (e) {
                                    return updateLogRow(idx, 'content', e.target.value);
                                }, onKeyDown: function (e) { return handleKeyDown(e, idx, 'content'); } }),
                            React.createElement(antd_1.Input, { type: "number", min: 0.5, step: 0.5, style: { width: 80 }, placeholder: "\u5DE5\u6642", value: row.hours, onChange: function (e) { return updateLogRow(idx, 'hours', e.target.value); }, onKeyDown: function (e) { return handleKeyDown(e, idx, 'hours'); } }),
                            React.createElement(antd_1.Button, { onClick: function () { return copyPrevRow(idx); }, icon: React.createElement(icons_1.PlusOutlined, null), size: "small", style: { marginLeft: 2 } }, "\u8907\u88FD"),
                            React.createElement(antd_1.Button, { onClick: function () { return removeLogRow(idx); }, danger: true, size: "small", style: { marginLeft: 2 }, disabled: multiLogs.length === 1 }, "\u522A\u9664"),
                            rowErrors[idx] && (React.createElement("span", { style: { color: 'red', fontSize: 13, marginLeft: 4 } }, Object.values(rowErrors[idx]).join('、'))))); }),
                        React.createElement("div", { style: { marginTop: 8 } },
                            React.createElement(antd_1.Button, { onClick: addLogRow, icon: React.createElement(icons_1.PlusOutlined, null), style: { marginRight: 8 } }, "\u65B0\u589E\u4E00\u884C"),
                            React.createElement(antd_1.Button, { onClick: fillToday, style: { marginRight: 8 } }, "\u672C\u65E5\u5FEB\u901F\u586B\u5BEB"),
                            React.createElement(antd_1.Button, { onClick: fillWeek, style: { marginRight: 8 } }, "\u672C\u9031\u5FEB\u901F\u586B\u5BEB"),
                            React.createElement(antd_1.Button, { type: "primary", onClick: handleMultiAdd, style: { fontWeight: 600, borderRadius: 8 } }, "\u6279\u6B21\u9001\u51FA"))),
                    React.createElement(antd_1.Upload, { beforeUpload: handleImport, showUploadList: false, accept: ".xlsx,.xls", disabled: importing },
                        React.createElement(antd_1.Button, { icon: React.createElement(icons_1.UploadOutlined, null), loading: importing, style: {
                                fontWeight: 500,
                                fontSize: 16,
                                height: 40,
                                borderRadius: 8
                            } }, "\u532F\u5165 Excel")),
                    importing && (React.createElement("span", { style: {
                            color: '#1677ff',
                            fontWeight: 600,
                            fontSize: 15,
                            marginLeft: 8
                        } }, "\u532F\u5165\u4E2D\uFF0C\u8ACB\u7A0D\u5019..."))))),
        React.createElement(antd_1.Spin, { spinning: loading, tip: "\u67E5\u8A62\u4E2D..." },
            React.createElement("div", { style: {
                    background: 'rgba(255,255,255,0.98)',
                    borderRadius: 16,
                    boxShadow: '0 4px 32px #0001',
                    padding: 28,
                    marginTop: 12,
                    fontFamily: "'Noto Sans TC', 'Segoe UI', 'Microsoft JhengHei', Arial, sans-serif",
                    fontSize: 17,
                    color: '#1a1a1a',
                    border: '1.5px solid #e3e9f7'
                } },
                React.createElement(antd_1.Table, { columns: columns(handleEdit, handleDelete, loginUserId, dateLocale).map(function (col) { return (__assign(__assign({}, col), { onCell: function () { return ({
                            style: {
                                fontFamily: "'Noto Sans TC', 'Segoe UI', 'Microsoft JhengHei', Arial, sans-serif",
                                fontSize: 17,
                                color: '#1a1a1a',
                                padding: '12px 10px',
                                background: 'transparent',
                                borderBottom: '1.5px solid #e3e9f7'
                            }
                        }); }, onHeaderCell: function () { return ({
                            style: {
                                fontFamily: "'Noto Sans TC', 'Segoe UI', 'Microsoft JhengHei', Arial, sans-serif",
                                fontWeight: 800,
                                fontSize: 18,
                                background: 'linear-gradient(90deg, #f4f6fa 80%, #e3e9f7 100%)',
                                color: '#1a237e',
                                padding: '14px 10px',
                                borderBottom: '2.5px solid #bfcbe6',
                                letterSpacing: 1
                            }
                        }); } })); }), dataSource: data, rowKey: function (r) {
                        return r.id != null ? r.id : "row-" + r.date + "-" + r.task + "-" + r.content;
                    }, bordered: true, size: "middle", style: {
                        background: 'transparent',
                        borderRadius: 8,
                        boxShadow: 'none'
                    }, pagination: {
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: function (total) { return "\u5171 " + total + " \u7B46"; },
                        onChange: function (page, pageSize) {
                            setPagination(function (prev) { return (__assign(__assign({}, prev), { current: page, pageSize: pageSize })); });
                            fetchLogs({ current: page, pageSize: pageSize });
                        }
                    }, loading: false, onChange: function (pagination, filters, sorterObj) {
                        setPagination(function (prev) { return (__assign(__assign({}, prev), { current: pagination.current || 1, pageSize: pagination.pageSize || 10 })); });
                        if (sorterObj && sorterObj.field) {
                            setSorter({ field: sorterObj.field, order: sorterObj.order });
                        }
                        else {
                            setSorter({});
                        }
                    } }),
                React.createElement(antd_2.Modal, { open: editModalOpen, title: "\u7DE8\u8F2F\u65E5\u8A8C", onCancel: function () { return setEditModalOpen(false); }, onOk: handleEditSave, okText: "\u5132\u5B58", cancelText: "\u53D6\u6D88" },
                    React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
                        React.createElement(antd_1.DatePicker, { style: { width: 160 }, value: editForm.date ? dayjs_1["default"](editForm.date) : undefined, onChange: function (d) {
                                return setEditForm(function (f) { return (__assign(__assign({}, f), { date: d ? d.format('YYYY-MM-DD') : '' })); });
                            } }),
                        React.createElement(antd_1.Input, { style: { width: 160 }, placeholder: "\u5DE5\u4F5C\u4E8B\u9805", value: editForm.task, onChange: function (e) {
                                return setEditForm(function (f) { return (__assign(__assign({}, f), { task: e.target.value })); });
                            } }),
                        React.createElement(antd_1.Input, { style: { width: 260 }, placeholder: "\u4F5C\u696D\u5167\u5BB9", value: editForm.content, onChange: function (e) {
                                return setEditForm(function (f) { return (__assign(__assign({}, f), { content: e.target.value })); });
                            } }),
                        React.createElement(antd_1.Input, { type: "number", min: 0.5, step: 0.5, style: { width: 100 }, placeholder: "\u5DE5\u6642", value: editForm.hours, onChange: function (e) {
                                return setEditForm(function (f) { return (__assign(__assign({}, f), { hours: Number(e.target.value || 0) })); });
                            } })))))));
}
exports["default"] = WorkLogBlock;
