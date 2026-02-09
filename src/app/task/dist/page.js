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
var Option = antd_1.Select.Option;
var icons_1 = require("@ant-design/icons");
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var TaskForm_1 = require("@/app/components/TaskForm");
var TaskDependencyModal_1 = require("@/app/components/TaskDependencyModal");
var GanttChart_1 = require("@/app/components/GanttChart");
var ImportTaskModal_1 = require("@/app/components/ImportTaskModal");
var I18nProvider_1 = require("../components/I18nProvider");
var Title = antd_1.Typography.Title;
var confirm = antd_1.Modal.confirm;
function TaskPage() {
    var _this = this;
    var router = navigation_1.useRouter();
    var _a = I18nProvider_1.useI18n(), t = _a.t, locale = _a.locale;
    var dateLocale = locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'zh-TW';
    react_1.useEffect(function () {
        if (typeof window !== 'undefined') {
            var isLogin = localStorage.getItem('isLogin') === '1';
            if (!isLogin) {
                router.replace('/login');
            }
        }
    }, []);
    var _b = react_1.useState([]), tasks = _b[0], setTasks = _b[1];
    var _c = react_1.useState(false), openDialog = _c[0], setOpenDialog = _c[1];
    var _d = react_1.useState(), selectedTask = _d[0], setSelectedTask = _d[1];
    var _e = react_1.useState(false), loading = _e[0], setLoading = _e[1];
    var _f = react_1.useState(false), dependencyModalVisible = _f[0], setDependencyModalVisible = _f[1];
    var _g = react_1.useState('list'), viewMode = _g[0], setViewMode = _g[1];
    var _h = react_1.useState([]), dependencies = _h[0], setDependencies = _h[1]; // 所有依賴關係
    var _j = react_1.useState(false), importModalVisible = _j[0], setImportModalVisible = _j[1];
    var _k = react_1.useState([]), projects = _k[0], setProjects = _k[1];
    var _l = react_1.useState([]), teamMembers = _l[0], setTeamMembers = _l[1];
    var _m = react_1.useState([]), selectedProjects = _m[0], setSelectedProjects = _m[1];
    var _o = react_1.useState([]), selectedMembers = _o[0], setSelectedMembers = _o[1];
    var _p = react_1.useState(''), search = _p[0], setSearch = _p[1];
    // 取得專案與人員選項
    var fetchProjects = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, data, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/projects')];
                case 1:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _b.sent();
                    if (data.success)
                        setProjects(data.data);
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var fetchTeamMembers = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, data, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/team')];
                case 1:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _b.sent();
                    if (data.success)
                        setTeamMembers(data.data);
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // 同時獲取任務與依賴，支援篩選
    var fetchTasksAndDependencies = function () { return __awaiter(_this, void 0, void 0, function () {
        var url, params, _a, tasksRes, depRes, tasksJson, depJson, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, 6, 7]);
                    url = '/api/tasks?';
                    params = [];
                    if (selectedProjects.length > 0)
                        params.push("projectId=" + selectedProjects.join(','));
                    if (selectedMembers.length > 0)
                        params.push("assignedTo=" + selectedMembers.join(','));
                    if (search)
                        params.push("search=" + encodeURIComponent(search));
                    if (params.length > 0)
                        url += params.join('&');
                    return [4 /*yield*/, Promise.all([
                            fetch(url),
                            fetch('/api/tasks/dependencies/all'),
                        ])];
                case 2:
                    _a = _b.sent(), tasksRes = _a[0], depRes = _a[1];
                    return [4 /*yield*/, tasksRes.json()];
                case 3:
                    tasksJson = _b.sent();
                    return [4 /*yield*/, depRes.json()];
                case 4:
                    depJson = _b.sent();
                    if (tasksJson.success)
                        setTasks(tasksJson.data);
                    else
                        antd_1.message.error(t('tasks.error.fetch') || '獲取任務列表失敗');
                    if (depJson.success)
                        setDependencies(depJson.data);
                    else
                        antd_1.message.error(t('tasks.error.fetchDependencies') || '獲取依賴關係失敗');
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _b.sent();
                    antd_1.message.error(t('tasks.error.fetchAll') || '獲取任務或依賴失敗');
                    console.error('獲取任務或依賴失敗:', error_1);
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        fetchProjects();
        fetchTeamMembers();
    }, []);
    react_1.useEffect(function () {
        fetchTasksAndDependencies();
    }, [selectedProjects, selectedMembers, search]);
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
                        antd_1.message.success(t('tasks.create.success') || '任務創建成功');
                        handleCloseDialog();
                    }
                    else {
                        antd_1.message.error(t('tasks.create.fail') || '創建任務失敗');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    antd_1.message.error(t('tasks.create.fail') || '創建任務失敗');
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
                        setTasks(function (prev) {
                            return prev.map(function (t) { return (t.id === selectedTask.id ? result_2.data : t); });
                        });
                        antd_1.message.success(t('tasks.update.success') || '任務更新成功');
                        handleCloseDialog();
                    }
                    else {
                        antd_1.message.error(t('tasks.update.fail') || '更新任務失敗');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_3 = _a.sent();
                    antd_1.message.error(t('tasks.update.fail') || '更新任務失敗');
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
                title: t('common.delete.confirmTitle') || '確認刪除',
                content: t('common.delete.confirmContent') || '確定要刪除這個任務嗎？',
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
                                        antd_1.message.success(t('tasks.delete.success') || '任務刪除成功');
                                    }
                                    else {
                                        antd_1.message.error(t('tasks.delete.fail') || '刪除任務失敗');
                                    }
                                    return [3 /*break*/, 6];
                                case 4:
                                    error_4 = _a.sent();
                                    antd_1.message.error(t('tasks.delete.fail') || '刪除任務失敗');
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
    // 處理打開依賴關係管理
    var handleDependencyManage = function (task) {
        setSelectedTask(task);
        setDependencyModalVisible(true);
    };
    // 建立依賴查詢 Map
    var depByTaskId = new Map();
    dependencies.forEach(function (dep) {
        if (!depByTaskId.has(dep.taskId))
            depByTaskId.set(dep.taskId, { pre: [], post: [] });
        if (!depByTaskId.has(dep.dependsOnTaskId))
            depByTaskId.set(dep.dependsOnTaskId, { pre: [], post: [] });
        depByTaskId.get(dep.taskId).pre.push(dep); // 此任務的前置依賴
        depByTaskId.get(dep.dependsOnTaskId).post.push(dep); // 被依賴
    });
    // 定義表格列
    var columns = [
        // 依賴關係列
        {
            title: t('tasks.columns.dependencies'),
            key: 'dependencies',
            render: function (_, record) {
                var _a, _b;
                var pre = ((_a = depByTaskId.get(record.id)) === null || _a === void 0 ? void 0 : _a.pre) || [];
                var post = ((_b = depByTaskId.get(record.id)) === null || _b === void 0 ? void 0 : _b.post) || [];
                return (React.createElement(antd_1.Space, { size: "small" },
                    pre.length > 0 && (React.createElement(antd_1.Tooltip, { title: pre.map(function (d) { return d.dependsOnTaskTitle; }).join(', ') },
                        React.createElement(antd_1.Tag, { color: "blue" },
                            t('tasks.dependencies.pre'),
                            ":",
                            pre.length))),
                    post.length > 0 && (React.createElement(antd_1.Tooltip, { title: post.map(function (d) { return d.taskTitle; }).join(', ') },
                        React.createElement(antd_1.Tag, { color: "purple" },
                            t('tasks.dependencies.post'),
                            ":",
                            post.length))),
                    pre.length === 0 && post.length === 0 && (React.createElement(antd_1.Tag, { color: "default" }, t('tasks.dependencies.none')))));
            }
        },
        {
            title: t('tasks.columns.name'),
            dataIndex: 'title',
            key: 'title'
        },
        {
            title: t('tasks.columns.project'),
            dataIndex: 'projectName',
            key: 'projectName'
        },
        {
            title: t('tasks.columns.status'),
            dataIndex: 'status',
            key: 'status',
            render: function (status) { return (React.createElement(antd_1.Tag, { color: getStatusColor(status) }, status === 'pending'
                ? t('tasks.status.pending')
                : status === 'in_progress'
                    ? t('tasks.status.in_progress')
                    : status === 'completed'
                        ? t('tasks.status.completed')
                        : status)); }
        },
        {
            title: t('tasks.columns.priority'),
            dataIndex: 'priority',
            key: 'priority',
            render: function (priority) { return (React.createElement(antd_1.Tag, { color: getPriorityColor(priority) }, priority === 'high'
                ? t('tasks.priority.high')
                : priority === 'medium'
                    ? t('tasks.priority.medium')
                    : priority === 'low'
                        ? t('tasks.priority.low')
                        : priority)); }
        },
        //{
        //  title: '進度',
        //  dataIndex: 'progress',
        //  key: 'progress',
        //  render: (progress: number) => `${progress}%`,
        //},
        {
            title: t('tasks.columns.startDate'),
            dataIndex: 'startDate',
            key: 'startDate',
            render: function (date) {
                var d = new Date(date);
                return isNaN(d.getTime())
                    ? ''
                    : d.toLocaleDateString(dateLocale, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
            }
        },
        {
            title: t('tasks.columns.dueDate'),
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: function (date) {
                var d = new Date(date);
                return isNaN(d.getTime())
                    ? ''
                    : d.toLocaleDateString(dateLocale, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
            }
        },
        {
            title: t('tasks.columns.assignee'),
            dataIndex: 'assignedToName',
            key: 'assignedToName'
        },
        {
            title: t('tasks.columns.actions'),
            key: 'action',
            render: function (_, record) { return (React.createElement(antd_1.Space, { size: "middle" },
                React.createElement(antd_1.Button, { type: "text", icon: React.createElement(icons_1.EditOutlined, null), onClick: function () { return handleOpenDialog(record); } }),
                React.createElement(antd_1.Button, { type: "text", icon: React.createElement(icons_1.NodeIndexOutlined, null), onClick: function () { return handleDependencyManage(record); } }),
                React.createElement(antd_1.Button, { type: "text", danger: true, icon: React.createElement(icons_1.DeleteOutlined, null), onClick: function () { return handleDeleteTask(record.id); } }))); }
        },
    ];
    // 將任務轉換為 Gantt chart 格式，帶入 dependencies
    var ganttTasks = tasks.map(function (task) {
        // 找出此任務的所有前置依賴（dependsOnTaskId）
        var pre = dependencies.filter(function (dep) { return dep.taskId === task.id; });
        return {
            id: String(task.id),
            name: task.projectName + " - " + task.title,
            start: new Date(task.startDate),
            end: new Date(task.dueDate),
            progress: task.progress || 0,
            type: 'task',
            project: String(task.projectId),
            styles: {
                backgroundColor: task.status === 'completed'
                    ? '#52c41a'
                    : task.status === 'in_progress'
                        ? '#1890ff'
                        : '#faad14',
                progressColor: '#1890ff'
            },
            dependencies: pre.map(function (dep) { return String(dep.dependsOnTaskId); }),
            isDisabled: false,
            hideChildren: false,
            displayOrder: task.id
        };
    });
    return (React.createElement("div", { style: { maxWidth: 1600, margin: '0 auto', padding: '2rem' } },
        React.createElement(antd_1.Card, null,
            React.createElement("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                } },
                React.createElement(Title, { level: 3, style: { margin: 0 } }, t('tasks.title')),
                React.createElement(antd_1.Space, null,
                    React.createElement(antd_1.Button, { type: "default", onClick: function () { return setImportModalVisible(true); } }, t('tasks.actions.import')),
                    React.createElement(ImportTaskModal_1["default"], { open: importModalVisible, onClose: function () { return setImportModalVisible(false); }, onSuccess: fetchTasksAndDependencies }),
                    React.createElement(antd_1.Button, { type: viewMode === 'list' ? 'primary' : 'default', onClick: function () { return setViewMode('list'); } }, t('tasks.actions.view.list')),
                    React.createElement(antd_1.Button, { type: viewMode === 'gantt' ? 'primary' : 'default', onClick: function () { return setViewMode('gantt'); } }, t('tasks.actions.view.gantt')),
                    React.createElement(antd_1.Button, { type: "primary", icon: React.createElement(icons_1.PlusOutlined, null), onClick: function () { return handleOpenDialog(); } }, t('tasks.actions.add')))),
            React.createElement(antd_1.Space, { style: { marginBottom: 16 } },
                React.createElement(antd_1.Select, { mode: "multiple", allowClear: true, style: { minWidth: 180 }, placeholder: t('tasks.filter.project'), value: selectedProjects, onChange: setSelectedProjects }, projects.map(function (project) { return (React.createElement(Option, { key: project.id, value: project.id }, project.name)); })),
                React.createElement(antd_1.Select, { mode: "multiple", allowClear: true, style: { minWidth: 180 }, placeholder: t('tasks.filter.assignee'), value: selectedMembers, onChange: setSelectedMembers }, teamMembers.map(function (member) { return (React.createElement(Option, { key: member.id, value: member.id }, member.name)); })),
                React.createElement(antd_1.Input.Search, { placeholder: t('tasks.search.placeholder'), allowClear: true, onSearch: setSearch, style: { width: 220 } })),
            viewMode === 'list' ? (React.createElement(antd_1.Table, { columns: columns, dataSource: tasks, rowKey: "id", loading: loading })) : (React.createElement(GanttChart_1["default"], { tasks: ganttTasks })),
            React.createElement(TaskForm_1["default"], { open: openDialog, onClose: handleCloseDialog, onSubmit: selectedTask ? handleUpdateTask : handleCreateTask, initialData: selectedTask }),
            React.createElement(TaskDependencyModal_1["default"], { visible: dependencyModalVisible, task: selectedTask !== null && selectedTask !== void 0 ? selectedTask : null, onClose: function () { return setDependencyModalVisible(false); } }))));
}
exports["default"] = TaskPage;
