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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var react_1 = require("react");
var antd_1 = require("antd");
var dayjs_1 = require("dayjs");
var icons_1 = require("@ant-design/icons");
var react_big_calendar_1 = require("react-big-calendar");
require("react-big-calendar/lib/css/react-big-calendar.css");
var localizer = react_big_calendar_1.dayjsLocalizer(dayjs_1["default"]);
// 移除直接導入伺服器端 API 路由
// import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../api/calendar/route';
var RangePicker = antd_1.DatePicker.RangePicker;
function CalendarPage() {
    var _this = this;
    var _a = react_1.useState([]), events = _a[0], setEvents = _a[1];
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(false), modalVisible = _c[0], setModalVisible = _c[1];
    var _d = react_1.useState(null), editingEvent = _d[0], setEditingEvent = _d[1];
    var form = antd_1.Form.useForm()[0];
    var _e = react_1.useState(new Date()), viewDate = _e[0], setViewDate = _e[1];
    var _f = react_1.useState(react_big_calendar_1.Views.MONTH), view = _f[0], setView = _f[1];
    // 使用 fetch API 替換直接導入的函數
    var fetchCalendarEvents = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, mapped, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch('/api/calendar')];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (result.success) {
                        mapped = result.data.map(function (e) { return (__assign(__assign({}, e), { start: new Date(e.startDate), end: new Date(e.endDate) })); });
                        setEvents(mapped);
                    }
                    else {
                        antd_1.message.error('無法加載日曆事件');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('獲取事件發生錯誤:', error_1);
                    antd_1.message.error('無法加載日曆事件');
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, []);
    react_1.useEffect(function () { fetchCalendarEvents(); }, [fetchCalendarEvents]);
    var handleSaveEvent = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var dateRange, eventData, startDate, endDate, eventPayload, response, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    dateRange = values.dateRange, eventData = __rest(values, ["dateRange"]);
                    startDate = dateRange[0].format('YYYY-MM-DD');
                    endDate = dateRange[1].format('YYYY-MM-DD');
                    eventPayload = __assign(__assign({}, eventData), { startDate: startDate,
                        endDate: endDate });
                    response = void 0;
                    if (!editingEvent) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetch("/api/calendar", {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(__assign({ id: editingEvent.id }, eventPayload))
                        })];
                case 1:
                    // 更新事件
                    response = _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, fetch('/api/calendar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(eventPayload)
                    })];
                case 3:
                    // 創建事件
                    response = _a.sent();
                    _a.label = 4;
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    result = _a.sent();
                    if (result.success) {
                        antd_1.message.success(editingEvent ? '事件更新成功' : '事件創建成功');
                        setModalVisible(false);
                        form.resetFields();
                        fetchCalendarEvents();
                    }
                    else {
                        antd_1.message.error(result.error || '保存事件失敗');
                    }
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error('保存事件錯誤:', error_2);
                    antd_1.message.error('保存事件失敗');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteEvent = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_3;
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
                        antd_1.message.success('事件刪除成功');
                        fetchCalendarEvents();
                    }
                    else {
                        antd_1.message.error(result.error || '刪除事件失敗');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('刪除事件錯誤:', error_3);
                    antd_1.message.error('刪除事件失敗');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var eventPropGetter = function (event) {
        var base = { style: {} };
        var color = event.type === 'project' ? '#1677ff' : event.type === 'task' ? '#52c41a' : '#faad14';
        base.style.backgroundColor = color;
        base.style.border = 'none';
        base.style.color = '#fff';
        return base;
    };
    var onSelectSlot = function (slotInfo) {
        setEditingEvent(null);
        form.resetFields();
        form.setFieldsValue({
            dateRange: [dayjs_1["default"](slotInfo.start), dayjs_1["default"](slotInfo.end)]
        });
        setModalVisible(true);
    };
    var onSelectEvent = function (e) {
        setEditingEvent(e);
        form.resetFields();
        form.setFieldsValue({
            title: e.title,
            description: e.description,
            type: e.type,
            dateRange: [dayjs_1["default"](e.startDate), dayjs_1["default"](e.endDate)]
        });
        setModalVisible(true);
    };
    return (React.createElement("div", { style: { padding: '24px' } },
        React.createElement(antd_1.Card, { title: "\u884C\u4E8B\u66C6 (\u6708/\u9031/\u65E5)", extra: React.createElement(antd_1.Space, null,
                React.createElement(antd_1.Button, { type: "primary", icon: React.createElement(icons_1.PlusOutlined, null), onClick: function () {
                        setEditingEvent(null);
                        form.resetFields();
                        setModalVisible(true);
                    } }, "\u65B0\u589E\u4E8B\u4EF6"),
                React.createElement(antd_1.Select, { size: "small", value: view, onChange: function (v) { return setView(v); }, options: [{ value: react_big_calendar_1.Views.MONTH, label: '月' }, { value: react_big_calendar_1.Views.WEEK, label: '週' }, { value: react_big_calendar_1.Views.DAY, label: '日' }] })) },
            React.createElement("div", { style: { height: 600 } },
                React.createElement(react_big_calendar_1.Calendar, { localizer: localizer, events: events, startAccessor: "start", endAccessor: "end", selectable: true, popup: true, view: view, onView: function (v) { return setView(v); }, date: viewDate, onNavigate: function (d) { return setViewDate(d); }, onSelectSlot: onSelectSlot, onSelectEvent: onSelectEvent, eventPropGetter: eventPropGetter, messages: { today: '今天', previous: '上一頁', next: '下一頁', month: '月', week: '週', day: '日', agenda: '列表' } }))),
        React.createElement(antd_1.Modal, { title: editingEvent ? '編輯事件' : '新增事件', open: modalVisible, onCancel: function () { return setModalVisible(false); }, footer: null, destroyOnClose: true },
            React.createElement(antd_1.Form, { form: form, layout: "vertical", onFinish: handleSaveEvent },
                React.createElement(antd_1.Form.Item, { name: "title", label: "\u6A19\u984C", rules: [{ required: true, message: '請輸入標題' }] },
                    React.createElement(antd_1.Input, { placeholder: "\u8F38\u5165\u4E8B\u4EF6\u6A19\u984C" })),
                React.createElement(antd_1.Form.Item, { name: "description", label: "\u63CF\u8FF0" },
                    React.createElement(antd_1.Input.TextArea, { placeholder: "\u8F38\u5165\u4E8B\u4EF6\u63CF\u8FF0" })),
                React.createElement(antd_1.Form.Item, { name: "dateRange", label: "\u65E5\u671F\u7BC4\u570D", rules: [{ required: true, message: '請選擇日期範圍' }] },
                    React.createElement(RangePicker, null)),
                React.createElement(antd_1.Form.Item, { name: "type", label: "\u985E\u578B", rules: [{ required: true, message: '請選擇類型' }] },
                    React.createElement(antd_1.Select, { placeholder: "\u9078\u64C7\u4E8B\u4EF6\u985E\u578B" },
                        React.createElement(antd_1.Select.Option, { value: "project" }, "\u5C08\u6848"),
                        React.createElement(antd_1.Select.Option, { value: "task" }, "\u4EFB\u52D9"),
                        React.createElement(antd_1.Select.Option, { value: "other" }, "\u5176\u4ED6"))),
                editingEvent && (React.createElement(antd_1.Popconfirm, { title: "\u522A\u9664\u6B64\u4E8B\u4EF6?", onConfirm: function () { return handleDeleteEvent(editingEvent.id); } },
                    React.createElement(antd_1.Button, { danger: true, icon: React.createElement(icons_1.DeleteOutlined, null) }, "\u522A\u9664"))),
                React.createElement(antd_1.Form.Item, null,
                    React.createElement(antd_1.Button, { type: "primary", htmlType: "submit", block: true }, "\u4FDD\u5B58"))))));
}
exports["default"] = CalendarPage;
