'use client';
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
var navigation_1 = require("next/navigation");
var antd_1 = require("antd");
var dayjs_1 = require("dayjs");
var icons_1 = require("@ant-design/icons");
var statusColorMap = {
    pending: 'default',
    in_progress: 'processing',
    completed: 'success'
};
var priorityColorMap = {
    high: 'error',
    medium: 'warning',
    low: 'default'
};
var statusLabelMap = {
    pending: '待處理',
    in_progress: '進行中',
    completed: '已完成'
};
var priorityLabelMap = {
    high: '高',
    medium: '中',
    low: '低'
};
function TodosPage() {
    var _this = this;
    var router = navigation_1.useRouter();
    var _a = react_1.useState(false), loading = _a[0], setLoading = _a[1];
    var _b = react_1.useState([]), rows = _b[0], setRows = _b[1];
    var _c = react_1.useState([]), users = _c[0], setUsers = _c[1];
    var _d = react_1.useState('others'), selectedUserId = _d[0], setSelectedUserId = _d[1];
    var _e = react_1.useState(''), keyword = _e[0], setKeyword = _e[1];
    var _f = react_1.useState(null), dateRange = _f[0], setDateRange = _f[1];
    var _g = react_1.useState(undefined), status = _g[0], setStatus = _g[1];
    var _h = react_1.useState(undefined), priority = _h[0], setPriority = _h[1];
    var _j = react_1.useState(null), currentUserId = _j[0], setCurrentUserId = _j[1];
    var createForm = antd_1.Form.useForm()[0];
    var _k = react_1.useState(false), createLoading = _k[0], setCreateLoading = _k[1];
    var _l = react_1.useState(false), editVisible = _l[0], setEditVisible = _l[1];
    var _m = react_1.useState(null), editingItem = _m[0], setEditingItem = _m[1];
    var editForm = antd_1.Form.useForm()[0];
    react_1.useEffect(function () {
        if (typeof window === 'undefined')
            return;
        var isLogin = localStorage.getItem('isLogin') === '1';
        if (!isLogin) {
            router.replace('/login');
            return;
        }
        try {
            var userStr = localStorage.getItem('user');
            if (userStr) {
                var user = JSON.parse(userStr);
                var id = Number(user.teamMemberId || user.id || user.userId);
                if (!Number.isNaN(id))
                    setCurrentUserId(id);
            }
        }
        catch (_a) {
            // ignore
        }
    }, [router]);
    var userOptions = react_1.useMemo(function () {
        var base = [
            { value: 'all', label: '全部使用者' },
        ];
        return base.concat(users.map(function (u) { return ({ value: String(u.id), label: u.name }); }));
    }, [users]);
    var fetchUsers = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, json, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/team')];
                case 1:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    json = _b.sent();
                    if (json.success) {
                        setUsers((json.data || []).map(function (u) { return ({ id: Number(u.id), name: u.name }); }));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    antd_1.message.error('取得使用者清單失敗');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var fetchTodos = function () { return __awaiter(_this, void 0, void 0, function () {
        var params, others, res2, json, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    params = new URLSearchParams();
                    if (selectedUserId === 'others') {
                        others = users
                            .filter(function (u) { return currentUserId == null || u.id !== currentUserId; })
                            .map(function (u) { return u.id; });
                        if (others.length > 0)
                            params.set('userIds', others.join(','));
                    }
                    else if (selectedUserId !== 'all') {
                        params.set('userId', selectedUserId);
                    }
                    if (keyword.trim())
                        params.set('keyword', keyword.trim());
                    if (status)
                        params.set('status', status);
                    if (priority)
                        params.set('priority', priority);
                    if (dateRange && dateRange[0] && dateRange[1]) {
                        params.set('startDate', dateRange[0].format('YYYY-MM-DD'));
                        params.set('endDate', dateRange[1].format('YYYY-MM-DD'));
                    }
                    return [4 /*yield*/, fetch("/api/todos?" + params.toString())];
                case 2:
                    res2 = _b.sent();
                    return [4 /*yield*/, res2.json()];
                case 3:
                    json = _b.sent();
                    if (json.success) {
                        setRows(json.data || []);
                    }
                    else {
                        antd_1.message.error(json.error || '查詢代辦事項失敗');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    _a = _b.sent();
                    antd_1.message.error('查詢代辦事項失敗');
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        fetchUsers();
    }, []);
    react_1.useEffect(function () {
        if (users.length > 0)
            fetchTodos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users, currentUserId]);
    var handleClear = function () {
        setSelectedUserId('others');
        setKeyword('');
        setDateRange(null);
        setStatus(undefined);
        setPriority(undefined);
    };
    var handleCreate = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var res, json, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!currentUserId) {
                        antd_1.message.error('無法取得登入者資訊');
                        return [2 /*return*/];
                    }
                    setCreateLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/todos', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: currentUserId,
                                title: values.title,
                                content: values.content || '',
                                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
                                status: values.status,
                                priority: values.priority
                            })
                        })];
                case 2:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    json = _b.sent();
                    if (json.success) {
                        antd_1.message.success('新增代辦成功');
                        createForm.resetFields();
                        fetchTodos();
                    }
                    else {
                        antd_1.message.error(json.error || '新增代辦失敗');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    _a = _b.sent();
                    antd_1.message.error('新增代辦失敗');
                    return [3 /*break*/, 6];
                case 5:
                    setCreateLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var openEdit = function (row) {
        setEditingItem(row);
        editForm.setFieldsValue({
            title: row.title,
            content: row.content,
            dueDate: row.dueDate ? dayjs_1["default"](row.dueDate) : null,
            status: row.status,
            priority: row.priority
        });
        setEditVisible(true);
    };
    var handleEditSave = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var res, json, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!editingItem || !currentUserId)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/todos', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id: editingItem.id,
                                userId: currentUserId,
                                title: values.title,
                                content: values.content || '',
                                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
                                status: values.status,
                                priority: values.priority
                            })
                        })];
                case 2:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    json = _b.sent();
                    if (json.success) {
                        antd_1.message.success('更新成功');
                        setEditVisible(false);
                        setEditingItem(null);
                        fetchTodos();
                    }
                    else {
                        antd_1.message.error(json.error || '更新失敗');
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    antd_1.message.error('更新失敗');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (row) {
        antd_1.Modal.confirm({
            title: '確定刪除此代辦？',
            onOk: function () { return __awaiter(_this, void 0, void 0, function () {
                var res, json;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!currentUserId)
                                return [2 /*return*/];
                            return [4 /*yield*/, fetch("/api/todos?id=" + row.id + "&userId=" + currentUserId, { method: 'DELETE' })];
                        case 1:
                            res = _a.sent();
                            return [4 /*yield*/, res.json()];
                        case 2:
                            json = _a.sent();
                            if (json.success) {
                                antd_1.message.success('刪除成功');
                                fetchTodos();
                            }
                            else {
                                antd_1.message.error(json.error || '刪除失敗');
                            }
                            return [2 /*return*/];
                    }
                });
            }); }
        });
    };
    var columns = [
        {
            title: '使用者',
            dataIndex: 'userName',
            key: 'userName',
            width: 120,
            render: function (_, r) { return r.userName || r.userId; }
        },
        {
            title: '代辦事項',
            dataIndex: 'title',
            key: 'title',
            width: 220,
            ellipsis: true
        },
        {
            title: '內容',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true
        },
        {
            title: '狀態',
            dataIndex: 'status',
            key: 'status',
            width: 110,
            render: function (v) { return React.createElement(antd_1.Tag, { color: statusColorMap[v] || 'default' }, statusLabelMap[v] || v); }
        },
        {
            title: '優先級',
            dataIndex: 'priority',
            key: 'priority',
            width: 100,
            render: function (v) { return React.createElement(antd_1.Tag, { color: priorityColorMap[v] || 'default' }, priorityLabelMap[v] || v); }
        },
        {
            title: '截止日',
            dataIndex: 'dueDate',
            key: 'dueDate',
            width: 120,
            render: function (v) { return (v ? dayjs_1["default"](v).format('YYYY/MM/DD') : '-'); }
        },
        {
            title: '操作',
            key: 'action',
            width: 140,
            render: function (_, row) {
                if (currentUserId !== row.userId)
                    return null;
                return (React.createElement(antd_1.Space, null,
                    React.createElement(antd_1.Button, { size: "small", icon: React.createElement(icons_1.EditOutlined, null), onClick: function () { return openEdit(row); } }, "\u7DE8\u8F2F"),
                    React.createElement(antd_1.Button, { size: "small", danger: true, icon: React.createElement(icons_1.DeleteOutlined, null), onClick: function () { return handleDelete(row); } }, "\u522A\u9664")));
            }
        },
    ];
    return (React.createElement("div", { style: { padding: 24 } },
        React.createElement(antd_1.Card, { style: { marginBottom: 16 } },
            React.createElement(antd_1.Collapse, { defaultActiveKey: ['query', 'create'], items: [
                    {
                        key: 'create',
                        label: '新增代辦事項',
                        children: (React.createElement(antd_1.Form, { form: createForm, layout: "inline", onFinish: handleCreate },
                            React.createElement(antd_1.Form.Item, { name: "title", rules: [{ required: true, message: '請輸入代辦事項' }] },
                                React.createElement(antd_1.Input, { style: { width: 220 }, placeholder: "\u4EE3\u8FA6\u4E8B\u9805" })),
                            React.createElement(antd_1.Form.Item, { name: "content" },
                                React.createElement(antd_1.Input, { style: { width: 260 }, placeholder: "\u5167\u5BB9" })),
                            React.createElement(antd_1.Form.Item, { name: "dueDate" },
                                React.createElement(antd_1.DatePicker, { placeholder: "\u622A\u6B62\u65E5" })),
                            React.createElement(antd_1.Form.Item, { name: "status", initialValue: "pending" },
                                React.createElement(antd_1.Select, { style: { width: 120 }, options: [
                                        { value: 'pending', label: '待處理' },
                                        { value: 'in_progress', label: '進行中' },
                                        { value: 'completed', label: '已完成' },
                                    ] })),
                            React.createElement(antd_1.Form.Item, { name: "priority", initialValue: "medium" },
                                React.createElement(antd_1.Select, { style: { width: 120 }, options: [
                                        { value: 'high', label: '高' },
                                        { value: 'medium', label: '中' },
                                        { value: 'low', label: '低' },
                                    ] })),
                            React.createElement(antd_1.Form.Item, null,
                                React.createElement(antd_1.Button, { type: "primary", icon: React.createElement(icons_1.PlusOutlined, null), htmlType: "submit", loading: createLoading }, "\u65B0\u589E"))))
                    },
                    {
                        key: 'query',
                        label: '查詢條件',
                        children: (React.createElement(antd_1.Space, { wrap: true },
                            React.createElement(antd_1.Select, { style: { width: 220 }, placeholder: "\u9078\u64C7\u4F7F\u7528\u8005", value: selectedUserId, onChange: setSelectedUserId, options: userOptions }),
                            React.createElement(antd_1.DatePicker.RangePicker, { value: dateRange, onChange: function (v) { return setDateRange(v || null); } }),
                            React.createElement(antd_1.Input, { style: { width: 240 }, placeholder: "\u4EE3\u8FA6\u95DC\u9375\u5B57", value: keyword, onChange: function (e) { return setKeyword(e.target.value); } }),
                            React.createElement(antd_1.Select, { style: { width: 140 }, allowClear: true, placeholder: "\u72C0\u614B", value: status, onChange: setStatus, options: [
                                    { value: 'pending', label: '待處理' },
                                    { value: 'in_progress', label: '進行中' },
                                    { value: 'completed', label: '已完成' },
                                ] }),
                            React.createElement(antd_1.Select, { style: { width: 140 }, allowClear: true, placeholder: "\u512A\u5148\u7D1A", value: priority, onChange: setPriority, options: [
                                    { value: 'high', label: '高' },
                                    { value: 'medium', label: '中' },
                                    { value: 'low', label: '低' },
                                ] }),
                            React.createElement(antd_1.Button, { type: "primary", onClick: fetchTodos }, "\u67E5\u8A62"),
                            React.createElement(antd_1.Button, { onClick: handleClear }, "\u6E05\u9664\u689D\u4EF6")))
                    },
                ] })),
        React.createElement(antd_1.Card, { title: "\u4ED6\u4EBA\u4EE3\u8FA6\u4E8B\u9805" },
            React.createElement(antd_1.Table, { rowKey: "id", loading: loading, columns: columns, dataSource: rows, pagination: { pageSize: 10, showSizeChanger: true }, scroll: { x: 1000 } })),
        React.createElement(antd_1.Modal, { title: "\u7DE8\u8F2F\u4EE3\u8FA6\u4E8B\u9805", open: editVisible, onCancel: function () { return setEditVisible(false); }, onOk: function () { return editForm.submit(); } },
            React.createElement(antd_1.Form, { form: editForm, layout: "vertical", onFinish: handleEditSave },
                React.createElement(antd_1.Form.Item, { name: "title", label: "\u4EE3\u8FA6\u4E8B\u9805", rules: [{ required: true, message: '請輸入代辦事項' }] },
                    React.createElement(antd_1.Input, null)),
                React.createElement(antd_1.Form.Item, { name: "content", label: "\u5167\u5BB9" },
                    React.createElement(antd_1.Input.TextArea, { rows: 3 })),
                React.createElement(antd_1.Form.Item, { name: "dueDate", label: "\u622A\u6B62\u65E5" },
                    React.createElement(antd_1.DatePicker, { style: { width: '100%' } })),
                React.createElement(antd_1.Form.Item, { name: "status", label: "\u72C0\u614B", rules: [{ required: true, message: '請選擇狀態' }] },
                    React.createElement(antd_1.Select, { options: [
                            { value: 'pending', label: '待處理' },
                            { value: 'in_progress', label: '進行中' },
                            { value: 'completed', label: '已完成' },
                        ] })),
                React.createElement(antd_1.Form.Item, { name: "priority", label: "\u512A\u5148\u7D1A", rules: [{ required: true, message: '請選擇優先級' }] },
                    React.createElement(antd_1.Select, { options: [
                            { value: 'high', label: '高' },
                            { value: 'medium', label: '中' },
                            { value: 'low', label: '低' },
                        ] }))))));
}
exports["default"] = TodosPage;
