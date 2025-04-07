"use client";
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
var react_1 = require("react");
var antd_1 = require("antd");
var dayjs_1 = require("dayjs");
var ProgressPage = function () {
    var _a = react_1.useState(true), loading = _a[0], setLoading = _a[1];
    var _b = react_1.useState([]), progressData = _b[0], setProgressData = _b[1];
    var fetchProgressData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/progress')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        setProgressData(result.data);
                    }
                    else {
                        antd_1.message.error('獲取進度資料失敗');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('獲取進度資料錯誤:', error_1);
                    antd_1.message.error('獲取進度資料失敗');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        fetchProgressData();
    }, []);
    var getStatusColor = function (status) {
        switch (status) {
            case '進行中':
                return 'processing';
            case '已完成':
                return 'success';
            case '已延期':
                return 'warning';
            case '已取消':
                return 'error';
            default:
                return 'default';
        }
    };
    var columns = [
        {
            title: '專案名稱',
            dataIndex: 'name',
            key: 'name',
            width: 200
        },
        {
            title: '狀態',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: function (status) { return (React.createElement(antd_1.Tag, { color: getStatusColor(status) }, status)); }
        },
        {
            title: '進度',
            dataIndex: 'progress',
            key: 'progress',
            width: 200,
            render: function (progress) { return (React.createElement(antd_1.Progress, { percent: Math.round(progress), size: "small" })); }
        },
        {
            title: '任務統計',
            key: 'tasks',
            width: 150,
            render: function (_, record) { return (React.createElement("span", null,
                record.completedTasks,
                " / ",
                record.totalTasks)); }
        },
        {
            title: '開始日期',
            dataIndex: 'startDate',
            key: 'startDate',
            width: 120,
            render: function (date) { return dayjs_1["default"](date).format('YYYY-MM-DD'); }
        },
        {
            title: '結束日期',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 120,
            render: function (date) { return dayjs_1["default"](date).format('YYYY-MM-DD'); }
        },
    ];
    return (React.createElement("div", { className: "p-6" },
        React.createElement(antd_1.Card, { title: "\u5C08\u6848\u9032\u5EA6\u8FFD\u8E64", className: "mb-6" },
            React.createElement(antd_1.Table, { columns: columns, dataSource: progressData, rowKey: "id", loading: loading, pagination: {
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: function (total) { return "\u5171 " + total + " \u500B\u5C08\u6848"; }
                }, scroll: { x: 800 } }))));
};
exports["default"] = ProgressPage;
