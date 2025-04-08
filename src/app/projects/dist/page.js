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
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var dayjs_1 = require("dayjs");
var Option = antd_1.Select.Option;
function ProjectsPage() {
    var _this = this;
    var _a = react_1.useState([]), projects = _a[0], setProjects = _a[1];
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(false), modalVisible = _c[0], setModalVisible = _c[1];
    var form = antd_1.Form.useForm()[0];
    var _d = react_1.useState(null), editingId = _d[0], setEditingId = _d[1];
    var _e = react_1.useState([]), teamMembers = _e[0], setTeamMembers = _e[1];
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
                        antd_1.message.error('獲取團隊成員列表失敗');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('獲取團隊成員列表錯誤:', err_1);
                    antd_1.message.error('獲取團隊成員列表失敗');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var fetchProjects = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/projects')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.success) {
                        setProjects(data.data);
                    }
                    else {
                        antd_1.message.error('獲取專案列表失敗');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    console.error('獲取專案列表錯誤:', err_2);
                    antd_1.message.error('獲取專案列表失敗');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        fetchProjects();
        fetchTeamMembers();
    }, []);
    var handleAdd = function () {
        setEditingId(null);
        form.resetFields();
        setModalVisible(true);
    };
    var handleEdit = function (record) {
        setEditingId(record.id);
        form.setFieldsValue(__assign(__assign({}, record), { startDate: dayjs_1["default"](record.startDate), endDate: dayjs_1["default"](record.endDate) }));
        setModalVisible(true);
    };
    var handleDelete = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_3;
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
                        antd_1.message.success('刪除成功');
                        fetchProjects();
                    }
                    else {
                        antd_1.message.error('刪除失敗');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    console.error('刪除專案錯誤:', err_3);
                    antd_1.message.error('刪除失敗');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var values, projectData, url, method, body, response, data, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, form.validateFields()];
                case 1:
                    values = _a.sent();
                    projectData = __assign(__assign({}, values), { startDate: values.startDate.format('YYYY-MM-DD'), endDate: values.endDate.format('YYYY-MM-DD') });
                    url = editingId ? '/api/projects' : '/api/projects';
                    method = editingId ? 'PUT' : 'POST';
                    body = editingId ? __assign(__assign({}, projectData), { id: editingId }) : projectData;
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
                        antd_1.message.success(editingId ? '更新成功' : '創建成功');
                        setModalVisible(false);
                        fetchProjects();
                    }
                    else {
                        antd_1.message.error(editingId ? '更新失敗' : '創建失敗');
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_4 = _a.sent();
                    console.error('提交表單錯誤:', err_4);
                    antd_1.message.error('提交失敗');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var columns = [
        {
            title: '專案名稱',
            dataIndex: 'name',
            key: 'name',
            render: function (text, record) { return (React.createElement(antd_1.Space, { direction: "vertical", size: "small" },
                React.createElement("span", null, text),
                React.createElement("span", { style: { color: '#666', fontSize: '12px' } }, record.description))); }
        },
        {
            title: '負責人',
            dataIndex: 'managerId',
            key: 'managerId',
            render: function (text, record) {
                var _a;
                return (React.createElement("span", null, ((_a = teamMembers.find(function (member) { return member.id === record.managerId; })) === null || _a === void 0 ? void 0 : _a.name) || '未指定'));
            }
        },
        {
            title: '狀態',
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
                        var response, data, err_5;
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
                                        antd_1.message.success('狀態更新成功');
                                        fetchProjects();
                                    }
                                    else {
                                        antd_1.message.error('狀態更新失敗');
                                    }
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_5 = _a.sent();
                                    console.error('更新狀態錯誤:', err_5);
                                    antd_1.message.error('狀態更新失敗');
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); } },
                    React.createElement(Option, { value: "\u9032\u884C\u4E2D" }, "\u9032\u884C\u4E2D"),
                    React.createElement(Option, { value: "\u5DF2\u5B8C\u6210" }, "\u5DF2\u5B8C\u6210"),
                    React.createElement(Option, { value: "\u5DF2\u66AB\u505C" }, "\u5DF2\u66AB\u505C"),
                    React.createElement(Option, { value: "\u5DF2\u53D6\u6D88" }, "\u5DF2\u53D6\u6D88")));
            }
        },
        {
            title: '進度',
            key: 'progress',
            render: function (_, record) { return (React.createElement(antd_1.Space, { direction: "vertical", size: "small", style: { width: '100%' } },
                React.createElement(antd_1.Progress, { percent: Math.round(record.averageProgress || 0), size: "small", status: record.averageProgress === 100 ? 'success' : 'active' }),
                React.createElement("span", { style: { fontSize: '12px', color: '#666' } },
                    record.taskCount || 0,
                    " \u500B\u4EFB\u52D9"))); }
        },
        {
            title: '時間',
            key: 'time',
            render: function (_, record) { return (React.createElement(antd_1.Space, { direction: "vertical", size: "small" },
                React.createElement("span", null,
                    "\u958B\u59CB\uFF1A",
                    dayjs_1["default"](record.startDate).format('YYYY-MM-DD')),
                React.createElement("span", null,
                    "\u7D50\u675F\uFF1A",
                    dayjs_1["default"](record.endDate).format('YYYY-MM-DD')))); }
        },
        {
            title: '操作',
            key: 'action',
            render: function (_, record) { return (React.createElement(antd_1.Space, null,
                React.createElement(antd_1.Button, { type: "text", icon: React.createElement(icons_1.EditOutlined, null), onClick: function () { return handleEdit(record); } }, "\u7DE8\u8F2F"),
                React.createElement(antd_1.Button, { type: "text", danger: true, icon: React.createElement(icons_1.DeleteOutlined, null), onClick: function () { return handleDelete(record.id); } }, "\u522A\u9664"))); }
        }
    ];
    return (React.createElement("div", { style: { padding: '24px' } },
        React.createElement(antd_1.Card, { title: "\u5C08\u6848\u7BA1\u7406", extra: React.createElement(antd_1.Button, { type: "primary", icon: React.createElement(icons_1.PlusOutlined, null), onClick: handleAdd }, "\u65B0\u589E\u5C08\u6848") },
            React.createElement(antd_1.Table, { columns: columns, dataSource: projects, rowKey: "id", loading: loading })),
        React.createElement(antd_1.Modal, { title: editingId ? '編輯專案' : '新增專案', open: modalVisible, onOk: handleSubmit, onCancel: function () { return setModalVisible(false); } },
            React.createElement(antd_1.Form, { form: form, layout: "vertical" },
                React.createElement(antd_1.Form.Item, { name: "name", label: "\u5C08\u6848\u540D\u7A31", rules: [{ required: true, message: '請輸入專案名稱' }] },
                    React.createElement(antd_1.Input, null)),
                React.createElement(antd_1.Form.Item, { name: "managerId", label: "\u8CA0\u8CAC\u4EBA", rules: [{ required: true, message: '請選擇負責人' }] },
                    React.createElement(antd_1.Select, null, teamMembers.map(function (member) { return (React.createElement(Option, { key: member.id, value: member.id }, member.name)); }))),
                React.createElement(antd_1.Form.Item, { name: "description", label: "\u5C08\u6848\u63CF\u8FF0" },
                    React.createElement(antd_1.Input.TextArea, null)),
                React.createElement(antd_1.Form.Item, { name: "status", label: "\u72C0\u614B", rules: [{ required: true, message: '請選擇狀態' }] },
                    React.createElement(antd_1.Select, null,
                        React.createElement(Option, { value: "\u9032\u884C\u4E2D" }, "\u9032\u884C\u4E2D"),
                        React.createElement(Option, { value: "\u5DF2\u5B8C\u6210" }, "\u5DF2\u5B8C\u6210"),
                        React.createElement(Option, { value: "\u5DF2\u66AB\u505C" }, "\u5DF2\u66AB\u505C"),
                        React.createElement(Option, { value: "\u5DF2\u53D6\u6D88" }, "\u5DF2\u53D6\u6D88"))),
                React.createElement(antd_1.Form.Item, { name: "startDate", label: "\u958B\u59CB\u65E5\u671F", rules: [{ required: true, message: '請選擇開始日期' }] },
                    React.createElement(antd_1.DatePicker, { style: { width: '100%' } })),
                React.createElement(antd_1.Form.Item, { name: "endDate", label: "\u7D50\u675F\u65E5\u671F", rules: [{ required: true, message: '請選擇結束日期' }] },
                    React.createElement(antd_1.DatePicker, { style: { width: '100%' } }))))));
}
exports["default"] = ProjectsPage;
