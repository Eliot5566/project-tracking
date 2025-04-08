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
var antd_1 = require("antd");
var dayjs_1 = require("dayjs");
var icons_1 = require("@ant-design/icons");
var RangePicker = antd_1.DatePicker.RangePicker;
var CalendarPage = function () {
    var _a = react_1.useState(true), loading = _a[0], setLoading = _a[1];
    var _b = react_1.useState([]), events = _b[0], setEvents = _b[1];
    var _c = react_1.useState(false), isModalVisible = _c[0], setIsModalVisible = _c[1];
    var _d = react_1.useState(null), editingEvent = _d[0], setEditingEvent = _d[1];
    var form = antd_1.Form.useForm()[0];
    var fetchEvents = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/calendar')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        setEvents(result.data);
                    }
                    else {
                        antd_1.message.error('獲取行事曆事件失敗');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('獲取行事曆事件錯誤:', error_1);
                    antd_1.message.error('獲取行事曆事件失敗');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        fetchEvents();
    }, []);
    var handleAddEvent = function (values) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, startDate, endDate, response, result, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    _a = values.dateRange, startDate = _a[0], endDate = _a[1];
                    return [4 /*yield*/, fetch('/api/calendar', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                title: values.title,
                                description: values.description,
                                type: values.type,
                                startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
                                endDate: endDate.format('YYYY-MM-DD HH:mm:ss')
                            })
                        })];
                case 1:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _b.sent();
                    if (result.success) {
                        antd_1.message.success('新增事件成功');
                        setIsModalVisible(false);
                        form.resetFields();
                        fetchEvents();
                    }
                    else {
                        antd_1.message.error('新增事件失敗');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _b.sent();
                    console.error('新增事件錯誤:', error_2);
                    antd_1.message.error('新增事件失敗');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleEditEvent = function (values) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, startDate, endDate, response, result, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!editingEvent)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    _a = values.dateRange, startDate = _a[0], endDate = _a[1];
                    return [4 /*yield*/, fetch('/api/calendar', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                id: editingEvent.id,
                                title: values.title,
                                description: values.description,
                                type: values.type,
                                startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
                                endDate: endDate.format('YYYY-MM-DD HH:mm:ss')
                            })
                        })];
                case 2:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _b.sent();
                    if (result.success) {
                        antd_1.message.success('更新事件成功');
                        setIsModalVisible(false);
                        setEditingEvent(null);
                        form.resetFields();
                        fetchEvents();
                    }
                    else {
                        antd_1.message.error('更新事件失敗');
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _b.sent();
                    console.error('更新事件錯誤:', error_3);
                    antd_1.message.error('更新事件失敗');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteEvent = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var response, result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/calendar?id=" + id, {
                            method: 'DELETE'
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        antd_1.message.success('刪除事件成功');
                        fetchEvents();
                    }
                    else {
                        antd_1.message.error('刪除事件失敗');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('刪除事件錯誤:', error_4);
                    antd_1.message.error('刪除事件失敗');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getEventTypeColor = function (type) {
        switch (type) {
            case '會議':
                return 'blue';
            case '任務':
                return 'green';
            case '提醒':
                return 'orange';
            case '其他':
                return 'gray';
            default:
                return 'default';
        }
    };
    var showEditModal = function (event) {
        setEditingEvent(event);
        form.setFieldsValue({
            title: event.title,
            type: event.type,
            dateRange: [
                dayjs_1["default"](event.startDate),
                dayjs_1["default"](event.endDate)
            ],
            description: event.description
        });
        setIsModalVisible(true);
    };
    var columns = [
        {
            title: '事件標題',
            dataIndex: 'title',
            key: 'title',
            width: 200
        },
        {
            title: '類型',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: function (type) { return (React.createElement(antd_1.Tag, { color: getEventTypeColor(type) }, type)); }
        },
        {
            title: '開始時間',
            dataIndex: 'startDate',
            key: 'startDate',
            width: 180,
            render: function (date) { return dayjs_1["default"](date).format('YYYY-MM-DD HH:mm'); }
        },
        {
            title: '結束時間',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 180,
            render: function (date) { return dayjs_1["default"](date).format('YYYY-MM-DD HH:mm'); }
        },
        {
            title: '關聯專案',
            dataIndex: 'projectName',
            key: 'projectName',
            width: 150
        },
        {
            title: '關聯任務',
            dataIndex: 'taskName',
            key: 'taskName',
            width: 150
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            render: function (_, record) { return (React.createElement("div", { className: "flex gap-2" },
                React.createElement(antd_1.Button, { type: "link", icon: React.createElement(icons_1.EditOutlined, null), onClick: function () { return showEditModal(record); } }, "\u7DE8\u8F2F"),
                React.createElement(antd_1.Popconfirm, { title: "\u78BA\u5B9A\u8981\u522A\u9664\u9019\u500B\u4E8B\u4EF6\u55CE\uFF1F", onConfirm: function () { return handleDeleteEvent(record.id); }, okText: "\u78BA\u5B9A", cancelText: "\u53D6\u6D88" },
                    React.createElement(antd_1.Button, { type: "link", danger: true, icon: React.createElement(icons_1.DeleteOutlined, null) }, "\u522A\u9664")))); }
        },
    ];
    return (React.createElement("div", { className: "p-6" },
        React.createElement(antd_1.Card, { title: "\u884C\u4E8B\u66C6", className: "mb-6", extra: React.createElement(antd_1.Button, { type: "primary", icon: React.createElement(icons_1.PlusOutlined, null), onClick: function () {
                    setEditingEvent(null);
                    form.resetFields();
                    setIsModalVisible(true);
                } }, "\u65B0\u589E\u4E8B\u4EF6") },
            React.createElement(antd_1.Table, { columns: columns, dataSource: events, rowKey: "id", loading: loading, pagination: {
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: function (total) { return "\u5171 " + total + " \u500B\u4E8B\u4EF6"; }
                }, scroll: { x: 1000 } })),
        React.createElement(antd_1.Modal, { title: editingEvent ? '編輯事件' : '新增事件', open: isModalVisible, onCancel: function () {
                setIsModalVisible(false);
                setEditingEvent(null);
                form.resetFields();
            }, onOk: function () { return form.submit(); } },
            React.createElement(antd_1.Form, { form: form, layout: "vertical", onFinish: editingEvent ? handleEditEvent : handleAddEvent },
                React.createElement(antd_1.Form.Item, { name: "title", label: "\u4E8B\u4EF6\u6A19\u984C", rules: [{ required: true, message: '請輸入事件標題' }] },
                    React.createElement(antd_1.Input, null)),
                React.createElement(antd_1.Form.Item, { name: "type", label: "\u4E8B\u4EF6\u985E\u578B", rules: [{ required: true, message: '請選擇事件類型' }] },
                    React.createElement(antd_1.Select, null,
                        React.createElement(antd_1.Select.Option, { value: "\u6703\u8B70" }, "\u6703\u8B70"),
                        React.createElement(antd_1.Select.Option, { value: "\u4EFB\u52D9" }, "\u4EFB\u52D9"),
                        React.createElement(antd_1.Select.Option, { value: "\u63D0\u9192" }, "\u63D0\u9192"),
                        React.createElement(antd_1.Select.Option, { value: "\u5176\u4ED6" }, "\u5176\u4ED6"))),
                React.createElement(antd_1.Form.Item, { name: "dateRange", label: "\u6642\u9593\u7BC4\u570D", rules: [{ required: true, message: '請選擇時間範圍' }] },
                    React.createElement(RangePicker, { showTime: true, format: "YYYY-MM-DD HH:mm:ss" })),
                React.createElement(antd_1.Form.Item, { name: "description", label: "\u4E8B\u4EF6\u63CF\u8FF0" },
                    React.createElement(antd_1.Input.TextArea, { rows: 4 }))))));
};
exports["default"] = CalendarPage;
