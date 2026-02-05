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
var react_1 = require("react");
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var dayjs_1 = require("dayjs");
var icons_2 = require("@ant-design/icons");
function NotesPage() {
    var _this = this;
    var _a = react_1.useState([]), data = _a[0], setData = _a[1];
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(false), modalOpen = _c[0], setModalOpen = _c[1];
    var _d = react_1.useState(null), editing = _d[0], setEditing = _d[1];
    var form = antd_1.Form.useForm()[0];
    var _e = react_1.useState(''), search = _e[0], setSearch = _e[1];
    var searchRef = react_1.useRef();
    var fetchNotes = function (q) { return __awaiter(_this, void 0, void 0, function () { var url, res, json, _a; return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                setLoading(true);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, 5, 6]);
                url = '/api/notes' + (q ? "?q=" + encodeURIComponent(q) : '');
                return [4 /*yield*/, fetch(url)];
            case 2:
                res = _b.sent();
                return [4 /*yield*/, res.json()];
            case 3:
                json = _b.sent();
                if (json.success)
                    setData(json.data);
                else
                    antd_1.message.error(json.error || '載入失敗');
                return [3 /*break*/, 6];
            case 4:
                _a = _b.sent();
                antd_1.message.error('取得會議記錄失敗');
                return [3 /*break*/, 6];
            case 5:
                setLoading(false);
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    }); }); };
    react_1.useEffect(function () { fetchNotes(); }, []);
    // debounce search
    react_1.useEffect(function () { var h = setTimeout(function () { return fetchNotes(search.trim()); }, 400); return function () { return clearTimeout(h); }; }, [search]);
    var openCreate = function () { setEditing(null); form.resetFields(); setModalOpen(true); };
    var openEdit = function (record) {
        setEditing(record);
        form.setFieldsValue({
            meetingDate: record.meetingDate ? dayjs_1["default"](record.meetingDate) : null,
            title: record.title,
            summary: record.summary,
            items: (record.items || []).map(function (it) { return ({
                unitName: it.unitName,
                responsibility: it.responsibility,
                dueDate: it.dueDate ? dayjs_1["default"](it.dueDate) : null,
                status: it.status
            }); })
        });
        setModalOpen(true);
    };
    var save = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var payload, createTempId_1, res, json_1, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    payload = {
                        id: editing === null || editing === void 0 ? void 0 : editing.id,
                        meetingDate: ((_b = values.meetingDate) === null || _b === void 0 ? void 0 : _b.format('YYYY-MM-DD')) || null,
                        title: values.title,
                        summary: values.summary || '',
                        items: (values.items || []).map(function (it, idx) { return ({
                            unitName: it.unitName,
                            responsibility: it.responsibility || '',
                            dueDate: it.dueDate ? it.dueDate.format('YYYY-MM-DD') : null,
                            status: it.status || null,
                            orderIndex: idx
                        }); })
                    };
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    // 樂觀更新：先更新前端
                    if (editing) {
                        setData(function (prev) { return prev.map(function (n) { return n.id === editing.id ? __assign(__assign(__assign({}, n), payload), { items: payload.items }) : n; }); });
                    }
                    createTempId_1 = Date.now();
                    if (!editing) {
                        setData(function (prev) { return __spreadArrays([{ id: createTempId_1, meetingDate: payload.meetingDate || '', title: payload.title, summary: payload.summary, createdAt: '', updatedAt: '', items: payload.items }], prev); });
                    }
                    return [4 /*yield*/, fetch('/api/notes', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    json_1 = _c.sent();
                    if (json_1.success) {
                        antd_1.message.success(editing ? '已更新' : '已建立');
                        setModalOpen(false);
                        form.resetFields();
                        if (!editing) {
                            // 取代暫時 id
                            setData(function (prev) { return prev.map(function (n) { return n.id === createTempId_1 ? json_1.data : n; }); });
                        }
                        else {
                            setData(function (prev) { return prev.map(function (n) { return n.id === json_1.data.id ? json_1.data : n; }); });
                        }
                    }
                    else {
                        antd_1.message.error(json_1.error || '保存失敗');
                        fetchNotes(search);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    antd_1.message.error('保存失敗');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var remove = function (record) { return __awaiter(_this, void 0, void 0, function () { var backup, res, json, _a; return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                backup = data;
                setData(function (prev) { return prev.filter(function (n) { return n.id !== record.id; }); });
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, fetch('/api/notes?id=' + record.id, { method: 'DELETE' })];
            case 2:
                res = _b.sent();
                return [4 /*yield*/, res.json()];
            case 3:
                json = _b.sent();
                if (json.success) {
                    antd_1.message.success('已刪除');
                }
                else {
                    antd_1.message.error(json.error || '刪除失敗');
                    setData(backup);
                }
                return [3 /*break*/, 5];
            case 4:
                _a = _b.sent();
                antd_1.message.error('刪除失敗');
                setData(backup);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    }); }); };
    var statusTag = function (s) { if (!s)
        return React.createElement(antd_1.Tag, null, "\u672A\u8A2D\u5B9A"); var color = s === '完成' ? 'green' : s === '進行中' ? 'blue' : s === '延遲' ? 'red' : 'default'; return React.createElement(antd_1.Tag, { color: color }, s); };
    var columns = [
        { title: '會議日期', dataIndex: 'meetingDate', render: function (d) { return d ? dayjs_1["default"](d).format('YYYY-MM-DD') : '-'; } },
        { title: '標題', dataIndex: 'title' },
        { title: '摘要', dataIndex: 'summary', ellipsis: true },
        { title: '單位項目數', render: function (_, r) { var _a; return ((_a = r.items) === null || _a === void 0 ? void 0 : _a.length) || 0; } },
        { title: '進度概要', render: function (_, r) { return (r.items || []).slice(0, 3).map(function (it) { return React.createElement(antd_1.Tag, { key: it.unitName + it.orderIndex },
                it.unitName,
                ":",
                it.status || '—'); }); } },
        { title: '操作', key: 'actions', fixed: 'right', render: function (_, r) { return (React.createElement(antd_1.Space, null,
                React.createElement(antd_1.Button, { size: "small", icon: React.createElement(icons_2.EditOutlined, null), onClick: function () { return openEdit(r); } }),
                React.createElement(antd_1.Popconfirm, { title: "\u78BA\u5B9A\u522A\u9664?", onConfirm: function () { return remove(r); } },
                    React.createElement(antd_1.Button, { size: "small", danger: true, icon: React.createElement(icons_2.DeleteOutlined, null) })))); } }
    ];
    return (React.createElement("div", { style: { padding: 24 } },
        React.createElement(antd_1.Card, { title: "\u6703\u8B70\u7D00\u9304 (Notes)", extra: React.createElement(antd_1.Space, null,
                " ",
                React.createElement(antd_1.Input.Search, { allowClear: true, placeholder: "\u641C\u5C0B\u6A19\u984C / \u6458\u8981 / \u55AE\u4F4D / \u884C\u52D5\u9805...", style: { width: 320 }, onChange: function (e) { return setSearch(e.target.value); } }),
                " ",
                React.createElement(antd_1.Button, { type: "primary", icon: React.createElement(icons_2.PlusOutlined, null), onClick: openCreate }, "\u65B0\u589E\u7D00\u9304")) },
            React.createElement(antd_1.Table, { dataSource: data, scroll: { x: 1000 }, columns: columns, rowKey: "id", loading: loading, pagination: { pageSize: 10 }, expandable: { expandedRowRender: function (record) { return (React.createElement("div", null,
                        (record.items || []).map(function (it) { return (React.createElement("div", { key: it.unitName + it.orderIndex, style: { display: 'flex', gap: 8, padding: '4px 0', alignItems: 'center', flexWrap: 'wrap' } },
                            React.createElement(antd_1.Tag, { color: "geekblue" }, it.unitName),
                            React.createElement("span", { style: { flex: 1 } }, it.responsibility),
                            it.dueDate && React.createElement(antd_1.Tag, { color: "purple" }, dayjs_1["default"](it.dueDate).format('MM/DD')),
                            statusTag(it.status || null))); }),
                        !(record.items || []).length && React.createElement("i", { style: { color: '#999' } }, "\u7121\u9805\u76EE"))); } } })),
        React.createElement(antd_1.Modal, { width: 880, title: editing ? '編輯會議紀錄' : '新增會議紀錄', open: modalOpen, onCancel: function () { return setModalOpen(false); }, footer: null, destroyOnClose: true },
            React.createElement(antd_1.Form, { form: form, layout: "vertical", onFinish: save, initialValues: { items: [{ unitName: 'A單位', responsibility: '' }, { unitName: 'B單位', responsibility: '' }] } },
                React.createElement(antd_1.Form.Item, { name: "meetingDate", label: "\u6703\u8B70\u65E5\u671F", rules: [{ required: true, message: '請選擇日期' }] },
                    React.createElement(antd_1.DatePicker, { style: { width: '100%' } })),
                React.createElement(antd_1.Form.Item, { name: "title", label: "\u6A19\u984C", rules: [{ required: true }] },
                    React.createElement(antd_1.Input, { placeholder: "\u5982\uFF1A\u5C08\u6848\u555F\u52D5\u6703 / \u4F8B\u884C\u9031\u6703" })),
                React.createElement(antd_1.Form.Item, { name: "summary", label: "\u6458\u8981" },
                    React.createElement(antd_1.Input.TextArea, { rows: 3, placeholder: "\u672C\u6B21\u91CD\u9EDE\u3001\u6C7A\u8B70\u3001\u98A8\u96AA..." })),
                React.createElement(antd_1.Divider, { orientation: "left" }, "\u55AE\u4F4D / \u4EFB\u52D9\u9805\u76EE"),
                React.createElement(antd_1.Form.List, { name: "items" }, function (fields, _a) {
                    var add = _a.add, remove = _a.remove;
                    return (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
                        fields.map(function (field, index) { return (React.createElement(antd_1.Card, { size: "small", key: field.key, bodyStyle: { padding: 12 }, title: React.createElement(antd_1.Space, { style: { cursor: 'move' }, draggable: true, onDragStart: function (e) { e.dataTransfer.setData('text/plain', String(index)); }, onDragOver: function (e) { return e.preventDefault(); }, onDrop: function (e) { var from = Number(e.dataTransfer.getData('text/plain')); if (from === index)
                                    return; var items = __spreadArrays((form.getFieldValue('items') || [])); var moved = items.splice(from, 1)[0]; items.splice(index, 0, moved); form.setFieldsValue({ items: items }); } },
                                React.createElement(icons_1.HolderOutlined, null),
                                React.createElement(antd_1.Form.Item, __assign({}, field, { name: [field.name, 'unitName'], noStyle: true, rules: [{ required: true, message: '請輸入單位名稱' }] }),
                                    React.createElement(antd_1.Input, { placeholder: "\u55AE\u4F4D / \u7D44\u5225 / \u89D2\u8272" }))), extra: React.createElement(antd_1.Popconfirm, { title: "\u522A\u9664\u6B64\u9805\u76EE?", onConfirm: function () { return remove(field.name); } },
                                React.createElement(antd_1.Button, { size: "small", danger: true }, "\u79FB\u9664")) },
                            React.createElement(antd_1.Space, { direction: "vertical", style: { width: '100%' }, size: "small" },
                                React.createElement(antd_1.Form.Item, { name: [field.name, 'responsibility'], label: "\u8CA0\u8CAC\u5167\u5BB9", rules: [{ required: true, message: '請輸入負責內容' }] },
                                    React.createElement(antd_1.Input.TextArea, { autoSize: true, placeholder: "\u4EA4\u4ED8\u9805 / \u884C\u52D5\u9805 (Action Item)" })),
                                React.createElement(antd_1.Space, { wrap: true },
                                    React.createElement(antd_1.Form.Item, { name: [field.name, 'dueDate'], label: "\u5B8C\u6210\u65E5" },
                                        React.createElement(antd_1.DatePicker, null)),
                                    React.createElement(antd_1.Form.Item, { name: [field.name, 'status'], label: "\u72C0\u614B" },
                                        React.createElement(antd_1.Select, { style: { width: 140 }, allowClear: true, placeholder: "\u9078\u64C7", options: ['未開始', '進行中', '完成', '延遲', '阻塞'].map(function (v) { return ({ value: v, label: v }); }) })))))); }),
                        React.createElement(antd_1.Button, { type: "dashed", icon: React.createElement(icons_1.PlusCircleOutlined, null), onClick: function () { return add({ unitName: '', responsibility: '' }); } }, "\u65B0\u589E\u55AE\u4F4D / \u9805\u76EE")));
                }),
                React.createElement(antd_1.Form.Item, { style: { marginTop: 24 } },
                    React.createElement(antd_1.Space, { style: { width: '100%', justifyContent: 'space-between' } },
                        editing && (React.createElement(antd_1.Popconfirm, { title: "\u78BA\u5B9A\u522A\u9664\u6B64\u6703\u8B70\u7D00\u9304?", onConfirm: function () { return __awaiter(_this, void 0, void 0, function () { var r, j, _a; return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!editing)
                                            return [2 /*return*/];
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 4, , 5]);
                                        return [4 /*yield*/, fetch('/api/notes?id=' + editing.id, { method: 'DELETE' })];
                                    case 2:
                                        r = _b.sent();
                                        return [4 /*yield*/, r.json()];
                                    case 3:
                                        j = _b.sent();
                                        if (j.success) {
                                            antd_1.message.success('已刪除');
                                            setModalOpen(false);
                                            fetchNotes();
                                        }
                                        else
                                            antd_1.message.error(j.error || '刪除失敗');
                                        return [3 /*break*/, 5];
                                    case 4:
                                        _a = _b.sent();
                                        antd_1.message.error('刪除失敗');
                                        return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            }); }); } },
                            React.createElement(antd_1.Button, { danger: true }, "\u522A\u9664\u7D00\u9304"))),
                        React.createElement(antd_1.Button, { type: "primary", htmlType: "submit", style: { minWidth: 160 } }, editing ? '更新紀錄' : '建立紀錄')))))));
}
exports["default"] = NotesPage;
