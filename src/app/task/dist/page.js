"use client";
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
var react_1 = require("react");
var TaskForm_1 = require("../components/TaskForm");
var Title = antd_1.Typography.Title;
var confirm = antd_1.Modal.confirm;
function TaskPage() {
    var _this = this;
    var _a = react_1.useState([]), tasks = _a[0], setTasks = _a[1];
    var _b = react_1.useState(false), openDialog = _b[0], setOpenDialog = _b[1];
    var _c = react_1.useState(), selectedTask = _c[0], setSelectedTask = _c[1];
    var _d = react_1.useState(false), loading = _d[0], setLoading = _d[1];
    // 獲取任務列表
    var fetchTasks = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/tasks')];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (result.success) {
                        setTasks(result.data);
                    }
                    else {
                        antd_1.message.error('獲取任務列表失敗');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    antd_1.message.error('獲取任務列表失敗');
                    console.error('獲取任務列表失敗:', error_1);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        fetchTasks();
    }, []);
    var handleOpenDialog = function (task) {
        setSelectedTask(task);
        setOpenDialog(true);
    };
    var handleCloseDialog = function () {
        setSelectedTask(undefined);
        setOpenDialog(false);
    };
    var handleCreateTask = function (taskData) { return __awaiter(_this, void 0, void 0, function () {
        var response, result_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/tasks', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(__assign(__assign({}, taskData), { status: 'pending', progress: 0 }))
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result_1 = _a.sent();
                    if (result_1.success) {
                        setTasks(function (prev) { return __spreadArrays(prev, [result_1.data]); });
                        antd_1.message.success('任務創建成功');
                        handleCloseDialog();
                    }
                    else {
                        antd_1.message.error('創建任務失敗');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    antd_1.message.error('創建任務失敗');
                    console.error('創建任務失敗:', error_2);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdateTask = function (taskData) { return __awaiter(_this, void 0, void 0, function () {
        var response, result_2, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedTask)
                        return [2 /*return*/];
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/tasks', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(__assign({ id: selectedTask.id }, taskData))
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result_2 = _a.sent();
                    if (result_2.success) {
                        setTasks(function (prev) { return prev.map(function (t) { return t.id === selectedTask.id ? result_2.data : t; }); });
                        antd_1.message.success('任務更新成功');
                        handleCloseDialog();
                    }
                    else {
                        antd_1.message.error('更新任務失敗');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_3 = _a.sent();
                    antd_1.message.error('更新任務失敗');
                    console.error('更新任務失敗:', error_3);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteTask = function (taskId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            confirm({
                title: '確認刪除',
                content: '確定要刪除這個任務嗎？',
                onOk: function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var response, result, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setLoading(true);
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, 5, 6]);
                                    return [4 /*yield*/, fetch("/api/tasks?id=" + taskId, {
                                            method: 'DELETE'
                                        })];
                                case 2:
                                    response = _a.sent();
                                    return [4 /*yield*/, response.json()];
                                case 3:
                                    result = _a.sent();
                                    if (result.success) {
                                        setTasks(function (prev) { return prev.filter(function (t) { return t.id !== taskId; }); });
                                        antd_1.message.success('任務刪除成功');
                                    }
                                    else {
                                        antd_1.message.error('刪除任務失敗');
                                    }
                                    return [3 /*break*/, 6];
                                case 4:
                                    error_4 = _a.sent();
                                    antd_1.message.error('刪除任務失敗');
                                    console.error('刪除任務失敗:', error_4);
                                    return [3 /*break*/, 6];
                                case 5:
                                    setLoading(false);
                                    return [7 /*endfinally*/];
                                case 6: return [2 /*return*/];
                            }
                        });
                    });
                }
            });
            return [2 /*return*/];
        });
    }); };
    var getStatusColor = function (status) {
        switch (status) {
            case 'pending':
                return 'default';
            case 'in_progress':
                return 'processing';
            case 'completed':
                return 'success';
            default:
                return 'default';
        }
    };
    var getPriorityColor = function (priority) {
        switch (priority) {
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            case 'low':
                return 'success';
            default:
                return 'default';
        }
    };
    var columns = [
        {
            title: '任務名稱',
            dataIndex: 'title',
            key: 'title'
        },
        {
            title: '專案',
            dataIndex: 'projectName',
            key: 'projectName'
        },
        {
            title: '狀態',
            dataIndex: 'status',
            key: 'status',
            render: function (status) { return (React.createElement(antd_1.Tag, { color: getStatusColor(status) }, status === 'pending' ? '待處理' :
                status === 'in_progress' ? '進行中' :
                    status === 'completed' ? '已完成' : status)); }
        },
        {
            title: '優先級',
            dataIndex: 'priority',
            key: 'priority',
            render: function (priority) { return (React.createElement(antd_1.Tag, { color: getPriorityColor(priority) }, priority === 'high' ? '高' :
                priority === 'medium' ? '中' :
                    priority === 'low' ? '低' : priority)); }
        },
        //{
        //  title: '進度',
        //  dataIndex: 'progress',
        //  key: 'progress',
        //  render: (progress: number) => `${progress}%`,
        //},
        {
            title: '截止日期',
            dataIndex: 'dueDate',
            key: 'dueDate'
        },
        {
            title: '負責人',
            dataIndex: 'assignedToName',
            key: 'assignedToName'
        },
        {
            title: '操作',
            key: 'action',
            render: function (_, record) { return (React.createElement(antd_1.Space, { size: "middle" },
                React.createElement(antd_1.Button, { type: "text", icon: React.createElement(icons_1.EditOutlined, null), onClick: function () { return handleOpenDialog(record); } }),
                React.createElement(antd_1.Button, { type: "text", danger: true, icon: React.createElement(icons_1.DeleteOutlined, null), onClick: function () { return handleDeleteTask(record.id); } }))); }
        },
    ];
    return (React.createElement("div", { style: { maxWidth: 1200, margin: '0 auto', padding: '2rem' } },
        React.createElement(antd_1.Card, null,
            React.createElement("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                } },
                React.createElement(Title, { level: 3, style: { margin: 0 } }, "\u4EFB\u52D9\u7BA1\u7406"),
                React.createElement(antd_1.Button, { type: "primary", icon: React.createElement(icons_1.PlusOutlined, null), onClick: function () { return handleOpenDialog(); } }, "\u65B0\u589E\u4EFB\u52D9")),
            React.createElement(antd_1.Table, { columns: columns, dataSource: tasks, rowKey: "id", loading: loading }),
            React.createElement(TaskForm_1["default"], { open: openDialog, onClose: handleCloseDialog, onSubmit: selectedTask ? handleUpdateTask : handleCreateTask, initialData: selectedTask }))));
}
exports["default"] = TaskPage;
