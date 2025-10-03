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
var dayjs_1 = require("dayjs");
var icons_1 = require("@ant-design/icons");
function NotesPage() {
    var _this = this;
    var _a = react_1.useState([]), data = _a[0], setData = _a[1];
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(false), modalOpen = _c[0], setModalOpen = _c[1];
    var _d = react_1.useState(null), editing = _d[0], setEditing = _d[1];
    var form = antd_1.Form.useForm()[0];
    var fetchNotes = function () { return __awaiter(_this, void 0, void 0, function () {
        var res, json, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/notes')];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    json = _a.sent();
                    if (json.success)
                        setData(json.data);
                    else
                        antd_1.message.error(json.error || '載入失敗');
                    return [3 /*break*/, 6];
                case 4:
                    e_1 = _a.sent();
                    antd_1.message.error('取得會議記錄失敗');
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () { fetchNotes(); }, []);
    var openCreate = function () { setEditing(null); form.resetFields(); setModalOpen(true); };
    var openEdit = function (record) {
        setEditing(record);
        form.setFieldsValue(__assign(__assign({}, record), { meetingDate: record.meetingDate ? dayjs_1["default"](record.meetingDate) : null, unitADueDate: record.unitADueDate ? dayjs_1["default"](record.unitADueDate) : null, unitBDueDate: record.unitBDueDate ? dayjs_1["default"](record.unitBDueDate) : null }));
        setModalOpen(true);
    };
    var save = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var payload, res, json, _a;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    payload = __assign(__assign({}, values), { meetingDate: ((_b = values.meetingDate) === null || _b === void 0 ? void 0 : _b.format('YYYY-MM-DD')) || null, unitADueDate: ((_c = values.unitADueDate) === null || _c === void 0 ? void 0 : _c.format('YYYY-MM-DD')) || null, unitBDueDate: ((_d = values.unitBDueDate) === null || _d === void 0 ? void 0 : _d.format('YYYY-MM-DD')) || null, id: editing === null || editing === void 0 ? void 0 : editing.id });
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/notes' + (editing ? '' : ''), {
                            method: editing ? 'PUT' : 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        })];
                case 2:
                    res = _e.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    json = _e.sent();
                    if (json.success) {
                        antd_1.message.success(editing ? '已更新' : '已建立');
                        setModalOpen(false);
                        form.resetFields();
                        fetchNotes();
                    }
                    else
                        antd_1.message.error(json.error || '保存失敗');
                    return [3 /*break*/, 5];
                case 4:
                    _a = _e.sent();
                    antd_1.message.error('保存失敗');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var remove = function (record) { return __awaiter(_this, void 0, void 0, function () {
        var res, json, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/notes?id=' + record.id, { method: 'DELETE' })];
                case 1:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    json = _b.sent();
                    if (json.success) {
                        antd_1.message.success('已刪除');
                        fetchNotes();
                    }
                    else
                        antd_1.message.error(json.error || '刪除失敗');
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    antd_1.message.error('刪除失敗');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var statusTag = function (s) {
        if (!s)
            return React.createElement(antd_1.Tag, null, "\u672A\u8A2D\u5B9A");
        var color = s === '完成' ? 'green' : s === '進行中' ? 'blue' : s === '延遲' ? 'red' : 'default';
        return React.createElement(antd_1.Tag, { color: color }, s);
    };
    var columns = [
        { title: '會議日期', dataIndex: 'meetingDate', render: function (d) { return d ? dayjs_1["default"](d).format('YYYY-MM-DD') : '-'; } },
        { title: '標題', dataIndex: 'title' },
        { title: '摘要', dataIndex: 'summary', ellipsis: true },
        { title: 'A單位內容', dataIndex: 'unitAResponsibility', width: 160, ellipsis: true },
        { title: 'A完成日', dataIndex: 'unitADueDate', render: function (d) { return d ? dayjs_1["default"](d).format('YYYY-MM-DD') : '-'; } },
        { title: 'A狀態', dataIndex: 'unitAStatus', render: statusTag },
        { title: 'B單位內容', dataIndex: 'unitBResponsibility', width: 160, ellipsis: true },
        { title: 'B完成日', dataIndex: 'unitBDueDate', render: function (d) { return d ? dayjs_1["default"](d).format('YYYY-MM-DD') : '-'; } },
        { title: 'B狀態', dataIndex: 'unitBStatus', render: statusTag },
        { title: '操作', key: 'actions', fixed: 'right', render: function (_, r) { return (React.createElement(antd_1.Space, null,
                React.createElement(antd_1.Button, { size: "small", icon: React.createElement(icons_1.EditOutlined, null), onClick: function () { return openEdit(r); } }),
                React.createElement(antd_1.Popconfirm, { title: "\u78BA\u5B9A\u522A\u9664?", onConfirm: function () { return remove(r); } },
                    React.createElement(antd_1.Button, { size: "small", danger: true, icon: React.createElement(icons_1.DeleteOutlined, null) })))); } }
    ];
    return (React.createElement("div", { style: { padding: 24 } },
        React.createElement(antd_1.Card, { title: "\u6703\u8B70\u7D00\u9304 (Notes)", extra: React.createElement(antd_1.Button, { type: "primary", icon: React.createElement(icons_1.PlusOutlined, null), onClick: openCreate }, "\u65B0\u589E\u7D00\u9304") },
            React.createElement(antd_1.Table, { dataSource: data, scroll: { x: 1300 }, columns: columns, rowKey: "id", loading: loading, pagination: { pageSize: 10 } })),
        React.createElement(antd_1.Modal, { title: editing ? '編輯會議紀錄' : '新增會議紀錄', open: modalOpen, onCancel: function () { return setModalOpen(false); }, footer: null, destroyOnClose: true },
            React.createElement(antd_1.Form, { form: form, layout: "vertical", onFinish: save },
                React.createElement(antd_1.Form.Item, { name: "meetingDate", label: "\u6703\u8B70\u65E5\u671F", rules: [{ required: true, message: '請選擇日期' }] },
                    React.createElement(antd_1.DatePicker, { style: { width: '100%' } })),
                React.createElement(antd_1.Form.Item, { name: "title", label: "\u6A19\u984C", rules: [{ required: true }] },
                    React.createElement(antd_1.Input, null)),
                React.createElement(antd_1.Form.Item, { name: "summary", label: "\u6458\u8981" },
                    React.createElement(antd_1.Input.TextArea, { rows: 3 })),
                React.createElement(antd_1.Card, { size: "small", title: "A \u55AE\u4F4D" },
                    React.createElement(antd_1.Form.Item, { name: "unitAResponsibility", label: "\u8CA0\u8CAC\u5167\u5BB9" },
                        React.createElement(antd_1.Input, null)),
                    React.createElement(antd_1.Form.Item, { name: "unitADueDate", label: "\u5B8C\u6210\u65E5" },
                        React.createElement(antd_1.DatePicker, { style: { width: '100%' } })),
                    React.createElement(antd_1.Form.Item, { name: "unitAStatus", label: "\u72C0\u614B" },
                        React.createElement(antd_1.Input, { placeholder: "\u4F8B\u5982: \u9032\u884C\u4E2D / \u5B8C\u6210 / \u5EF6\u9072" }))),
                React.createElement(antd_1.Card, { size: "small", title: "B \u55AE\u4F4D", style: { marginTop: 12 } },
                    React.createElement(antd_1.Form.Item, { name: "unitBResponsibility", label: "\u8CA0\u8CAC\u5167\u5BB9" },
                        React.createElement(antd_1.Input, null)),
                    React.createElement(antd_1.Form.Item, { name: "unitBDueDate", label: "\u5B8C\u6210\u65E5" },
                        React.createElement(antd_1.DatePicker, { style: { width: '100%' } })),
                    React.createElement(antd_1.Form.Item, { name: "unitBStatus", label: "\u72C0\u614B" },
                        React.createElement(antd_1.Input, { placeholder: "\u4F8B\u5982: \u9032\u884C\u4E2D / \u5B8C\u6210 / \u5EF6\u9072" }))),
                React.createElement(antd_1.Form.Item, { style: { marginTop: 16 } },
                    React.createElement(antd_1.Button, { type: "primary", htmlType: "submit", block: true }, editing ? '更新' : '建立'))))));
}
exports["default"] = NotesPage;
