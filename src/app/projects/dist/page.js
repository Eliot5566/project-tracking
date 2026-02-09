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
exports.__esModule = true;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var dayjs_1 = require("dayjs");
var GanttChart_1 = require("../components/GanttChart");
var ExportButton_1 = require("../components/ExportButton");
var ProjectTasksTable_1 = require("./ProjectTasksTable");
var I18nProvider_1 = require("../components/I18nProvider");
var Option = antd_1.Select.Option;
function ProjectsPage() {
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
    var _b = react_1.useState([]), projects = _b[0], setProjects = _b[1];
    var _c = react_1.useState(false), loading = _c[0], setLoading = _c[1];
    var _d = react_1.useState(false), modalVisible = _d[0], setModalVisible = _d[1];
    var _e = react_1.useState(null), editingProject = _e[0], setEditingProject = _e[1];
    var form = antd_1.Form.useForm()[0];
    var _f = react_1.useState('list'), viewMode = _f[0], setViewMode = _f[1]; // 'list' or 'gantt'
    // 篩選狀態
    var _g = react_1.useState([]), selectedManagers = _g[0], setSelectedManagers = _g[1];
    var _h = react_1.useState([]), selectedProjects = _h[0], setSelectedProjects = _h[1];
    // 甘特圖任務數據
    var _j = react_1.useState([]), ganttTasks = _j[0], setGanttTasks = _j[1];
    var _k = react_1.useState([]), teamMembers = _k[0], setTeamMembers = _k[1];
    var fetchTeamMembers = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/team')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setTeamMembers(data.data);
                    }
                    else {
                        antd_1.message.error(t('projects.error.fetchTeamMembers') || '獲取團隊成員列表失敗');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('獲取團隊成員列表錯誤:', err_1);
                    antd_1.message.error(t('projects.error.fetchTeamMembers') || '獲取團隊成員列表失敗');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // 獲取專案數據
    var fetchProjects = function (managerIds, projectIds) { return __awaiter(_this, void 0, void 0, function () {
        var url, params, response, result, ganttData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    url = '/api/projects';
                    params = [];
                    if (managerIds && managerIds.length > 0)
                        params.push("managerId=" + managerIds.join(','));
                    if (projectIds && projectIds.length > 0)
                        params.push("projectId=" + projectIds.join(','));
                    if (params.length > 0)
                        url += '?' + params.join('&');
                    return [4 /*yield*/, fetch(url)];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (result.success) {
                        setProjects(result.data);
                        ganttData = result.data.map(function (project) { return ({
                            id: "Project-" + project.id,
                            name: project.name,
                            start: new Date(project.startDate),
                            end: new Date(project.endDate),
                            progress: project.averageProgress ? project.averageProgress / 100 : 0,
                            type: 'project',
                            hideChildren: false,
                            displayOrder: project.id,
                            styles: {
                                backgroundColor: getStatusColor(project.status),
                                progressColor: '#1890ff'
                            }
                        }); });
                        setGanttTasks(ganttData);
                    }
                    else {
                        antd_1.message.error(t('projects.error.fetch') || '獲取專案數據失敗');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('獲取專案失敗:', error_1);
                    antd_1.message.error(t('projects.error.fetch') || '獲取專案數據失敗');
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // 獲取狀態顏色
    var getStatusColor = function (status) {
        switch (status) {
            case '進行中': return '#1890ff';
            case '已完成': return '#52c41a';
            case '延遲': return '#ff4d4f';
            case '等待中': return '#faad14';
            default: return '#d9d9d9';
        }
    };
    // 渲染狀態標籤
    var renderStatusTag = function (status) {
        var color = getStatusColor(status);
        return React.createElement(antd_1.Tag, { color: color }, status);
    };
    react_1.useEffect(function () {
        fetchProjects(selectedManagers, selectedProjects);
        fetchTeamMembers();
    }, [selectedManagers, selectedProjects]);
    var handleAdd = function () {
        setEditingProject(null);
        form.resetFields();
        setModalVisible(true);
    };
    var handleEdit = function (record) {
        setEditingProject(record);
        form.setFieldsValue(__assign(__assign({}, record), { startDate: dayjs_1["default"](record.startDate), endDate: dayjs_1["default"](record.endDate) }));
        setModalVisible(true);
    };
    var handleDelete = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/projects?id=" + id, {
                            method: 'DELETE'
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        antd_1.message.success(t('common.delete.success') || '刪除成功');
                        fetchProjects();
                    }
                    else {
                        antd_1.message.error(t('common.delete.fail') || '刪除失敗');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error('刪除專案錯誤:', err_2);
                    antd_1.message.error(t('common.delete.fail') || '刪除失敗');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var values, projectData, url, method, body, response, data, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, form.validateFields()];
                case 1:
                    values = _a.sent();
                    projectData = __assign(__assign({}, values), { startDate: values.startDate.format('YYYY-MM-DD'), endDate: values.endDate.format('YYYY-MM-DD') });
                    url = editingProject ? '/api/projects' : '/api/projects';
                    method = editingProject ? 'PUT' : 'POST';
                    body = editingProject ? __assign(__assign({}, projectData), { id: editingProject.id }) : projectData;
                    return [4 /*yield*/, fetch(url, {
                            method: method,
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(body)
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        antd_1.message.success(editingProject ? (t('common.update.success') || '更新成功') : (t('common.create.success') || '創建成功'));
                        setModalVisible(false);
                        fetchProjects();
                    }
                    else {
                        antd_1.message.error(editingProject ? (t('common.update.fail') || '更新失敗') : (t('common.create.fail') || '創建失敗'));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _a.sent();
                    console.error('提交表單錯誤:', err_3);
                    antd_1.message.error(t('common.submit.fail') || '提交失敗');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var columns = [
        {
            title: t('projects.columns.name'),
            dataIndex: 'name',
            key: 'name',
            render: function (text, record) { return (React.createElement(antd_1.Space, { direction: "vertical", size: "small" },
                React.createElement("span", null, text),
                React.createElement("span", { style: { color: '#666', fontSize: '12px' } }, record.description))); }
        },
        {
            title: t('projects.columns.manager'),
            dataIndex: 'managerId',
            key: 'managerId',
            render: function (text, record) {
                var _a;
                return (React.createElement("span", null, ((_a = teamMembers.find(function (member) { return member.id === record.managerId; })) === null || _a === void 0 ? void 0 : _a.name) || '未指定'));
            }
        },
        {
            title: t('projects.columns.status'),
            dataIndex: 'status',
            key: 'status',
            render: function (status) {
                var statusColors = {
                    '進行中': 'processing',
                    '已完成': 'success',
                    '已暫停': 'warning',
                    '已取消': 'default'
                };
                return (React.createElement(antd_1.Select, { value: status, style: { width: 100 }, onChange: function (value) { return __awaiter(_this, void 0, void 0, function () {
                        var response, data, err_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    return [4 /*yield*/, fetch('/api/projects', {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({ id: status, status: value })
                                        })];
                                case 1:
                                    response = _a.sent();
                                    return [4 /*yield*/, response.json()];
                                case 2:
                                    data = _a.sent();
                                    if (data.success) {
                                        antd_1.message.success(t('common.update.success') || '狀態更新成功');
                                        fetchProjects();
                                    }
                                    else {
                                        antd_1.message.error(t('common.update.fail') || '狀態更新失敗');
                                    }
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_4 = _a.sent();
                                    console.error('更新狀態錯誤:', err_4);
                                    antd_1.message.error(t('common.update.fail') || '狀態更新失敗');
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); } },
                    React.createElement(Option, { value: "\u9032\u884C\u4E2D" }, t('projects.status.inProgress')),
                    React.createElement(Option, { value: "\u5DF2\u5B8C\u6210" }, t('projects.status.completed')),
                    React.createElement(Option, { value: "\u5DF2\u66AB\u505C" }, t('projects.status.paused')),
                    React.createElement(Option, { value: "\u5DF2\u53D6\u6D88" }, t('projects.status.canceled'))));
            }
        },
        {
            title: t('projects.columns.progress'),
            key: 'progress',
            render: function (_, record) { return (React.createElement(antd_1.Space, { direction: "vertical", size: "small", style: { width: '100%' } },
                React.createElement(antd_1.Progress, { percent: Math.round(record.averageProgress || 0), size: "small", status: record.averageProgress === 100 ? 'success' : 'active' }),
                React.createElement("span", { style: { fontSize: '12px', color: '#666' } },
                    record.taskCount || 0,
                    " ",
                    t('tasks.title')))); }
        },
        {
            title: t('projects.columns.time'),
            key: 'time',
            render: function (_, record) { return (React.createElement(antd_1.Space, { direction: "vertical", size: "small" },
                React.createElement("span", null,
                    t('projects.time.start'),
                    new Date(record.startDate).toLocaleDateString(dateLocale, { year: 'numeric', month: '2-digit', day: '2-digit' })),
                React.createElement("span", null,
                    t('projects.time.end'),
                    new Date(record.endDate).toLocaleDateString(dateLocale, { year: 'numeric', month: '2-digit', day: '2-digit' })))); }
        },
        {
            title: t('projects.columns.actions'),
            key: 'action',
            render: function (_, record) { return (React.createElement(antd_1.Space, null,
                React.createElement(antd_1.Button, { type: "text", icon: React.createElement(icons_1.EditOutlined, null), onClick: function () { return handleEdit(record); } }, t('common.edit') || '編輯'),
                React.createElement(antd_1.Button, { type: "text", danger: true, icon: React.createElement(icons_1.DeleteOutlined, null), onClick: function () { return handleDelete(record.id); } }, t('common.delete') || '刪除'))); }
        }
    ];
    // 準備匯出數據
    var exportColumns = [
        { title: '專案名稱', dataIndex: 'name' },
        { title: '描述', dataIndex: 'description' },
        { title: '狀態', dataIndex: 'status' },
        { title: '進度', dataIndex: 'averageProgress' },
        { title: '開始日期', dataIndex: 'startDateFormatted' },
        { title: '結束日期', dataIndex: 'endDateFormatted' },
        { title: '任務數量', dataIndex: 'taskCount' },
    ];
    var exportData = projects.map(function (project) { return (__assign(__assign({}, project), { startDateFormatted: dayjs_1["default"](project.startDate).format('YYYY-MM-DD'), endDateFormatted: dayjs_1["default"](project.endDate).format('YYYY-MM-DD'), averageProgress: (project.averageProgress || 0) + "%" })); });
    return (React.createElement("div", { style: { padding: '24px' } },
        React.createElement(antd_1.Card, { title: t('projects.title'), extra: React.createElement(antd_1.Space, null,
                React.createElement(ExportButton_1["default"], { data: exportData, columns: exportColumns, fileName: t('projects.actions.exportReport'), buttonText: t('projects.actions.exportButton') }),
                React.createElement(antd_1.Button, { type: viewMode === 'list' ? 'primary' : 'default', onClick: function () { return setViewMode('list'); }, icon: React.createElement(icons_1.BarsOutlined, null) }, t('projects.actions.view.list')),
                React.createElement(antd_1.Button, { type: viewMode === 'gantt' ? 'primary' : 'default', onClick: function () { return setViewMode('gantt'); }, icon: React.createElement(icons_1.ScheduleOutlined, null) }, t('projects.actions.view.gantt')),
                React.createElement(antd_1.Button, { type: "primary", icon: React.createElement(icons_1.PlusOutlined, null), onClick: function () {
                        setEditingProject(null);
                        form.resetFields();
                        setModalVisible(true);
                    } }, t('projects.actions.add'))) },
            React.createElement(antd_1.Space, { style: { marginBottom: 16 } },
                React.createElement(antd_1.Select, { mode: "multiple", allowClear: true, style: { minWidth: 180 }, placeholder: t('projects.filter.manager'), value: selectedManagers, onChange: setSelectedManagers }, teamMembers.map(function (member) { return (React.createElement(Option, { key: member.id, value: member.id }, member.name)); })),
                React.createElement(antd_1.Select, { mode: "multiple", allowClear: true, style: { minWidth: 180 }, placeholder: t('projects.filter.project'), value: selectedProjects, onChange: setSelectedProjects }, projects.map(function (project) { return (React.createElement(Option, { key: project.id, value: project.id }, project.name)); }))),
            viewMode === 'list' ? (React.createElement(antd_1.Table, { columns: columns, dataSource: projects, rowKey: "id", loading: loading, expandable: {
                    expandedRowRender: function (record) { return React.createElement(ProjectTasksTable_1["default"], { projectId: record.id }); },
                    expandRowByClick: true
                } })) : (React.createElement(GanttChart_1["default"], { tasks: ganttTasks }))),
        React.createElement(antd_1.Modal, { title: editingProject ? t('projects.modal.edit') : t('projects.modal.add'), open: modalVisible, onCancel: function () { return setModalVisible(false); }, footer: null },
            React.createElement(antd_1.Form, { form: form, layout: "vertical" },
                React.createElement(antd_1.Form.Item, { name: "name", label: t('projects.form.name'), rules: [{ required: true, message: t('projects.form.name.required') }] },
                    React.createElement(antd_1.Input, null)),
                React.createElement(antd_1.Form.Item, { name: "managerId", label: t('projects.form.manager'), rules: [{ required: true, message: t('projects.form.manager.required') }] },
                    React.createElement(antd_1.Select, null, teamMembers.map(function (member) { return (React.createElement(Option, { key: member.id, value: member.id }, member.name)); }))),
                React.createElement(antd_1.Form.Item, { name: "description", label: t('projects.form.description') },
                    React.createElement(antd_1.Input.TextArea, null)),
                React.createElement(antd_1.Form.Item, { name: "status", label: t('projects.form.status'), rules: [{ required: true, message: t('projects.form.status.required') }] },
                    React.createElement(antd_1.Select, null,
                        React.createElement(Option, { value: "\u9032\u884C\u4E2D" }, t('projects.status.inProgress')),
                        React.createElement(Option, { value: "\u5DF2\u5B8C\u6210" }, t('projects.status.completed')),
                        React.createElement(Option, { value: "\u5DF2\u66AB\u505C" }, t('projects.status.paused')),
                        React.createElement(Option, { value: "\u5DF2\u53D6\u6D88" }, t('projects.status.canceled')))),
                React.createElement(antd_1.Form.Item, { name: "startDate", label: t('projects.form.startDate'), rules: [{ required: true, message: t('projects.form.startDate.required') }] },
                    React.createElement(antd_1.DatePicker, { style: { width: '100%' } })),
                React.createElement(antd_1.Form.Item, { name: "endDate", label: t('projects.form.endDate'), rules: [{ required: true, message: t('projects.form.endDate.required') }] },
                    React.createElement(antd_1.DatePicker, { style: { width: '100%' } })),
                React.createElement(antd_1.Form.Item, null,
                    React.createElement(antd_1.Button, { type: "primary", onClick: handleSubmit, block: true }, editingProject ? t('projects.actions.update') : t('projects.actions.add')))))));
}
exports["default"] = ProjectsPage;
