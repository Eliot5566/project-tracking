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
var dayjs_1 = require("dayjs");
var icons_1 = require("@ant-design/icons");
var react_big_calendar_1 = require("react-big-calendar");
require("react-big-calendar/lib/css/react-big-calendar.css");
var localizer = react_big_calendar_1.dayjsLocalizer(dayjs_1["default"]);
function CalendarPage() {
    var _this = this;
    var _a = react_1.useState(false), mounted = _a[0], setMounted = _a[1];
    var _b = react_1.useState([]), events = _b[0], setEvents = _b[1];
    var _c = react_1.useState(false), loading = _c[0], setLoading = _c[1];
    var _d = react_1.useState(false), modalVisible = _d[0], setModalVisible = _d[1];
    var _e = react_1.useState(null), editingEvent = _e[0], setEditingEvent = _e[1];
    var form = antd_1.Form.useForm()[0];
    var _f = react_1.useState(false), submitting = _f[0], setSubmitting = _f[1];
    var tempIdRef = react_1.useRef(null);
    var _g = react_1.useState(new Date()), viewDate = _g[0], setViewDate = _g[1];
    // IME/輸入追蹤
    var composingRef = react_1.useRef(false);
    var composingDescRef = react_1.useRef(false);
    var titleInputRef = react_1.useRef(null);
    var descInputRef = react_1.useRef(null);
    react_1.useEffect(function () { setMounted(true); }, []);
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
        var v, rawTitle, title, date, type, description, d, startDate_1, endDate_1, eventPayload_1, tempId_1, res, result_1, tid_1, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, 4, 5]);
                    setSubmitting(true);
                    v = values !== null && values !== void 0 ? values : form.getFieldsValue(true);
                    rawTitle = v.title;
                    title = typeof rawTitle === 'string' ? rawTitle.trim() : '';
                    date = v.date;
                    type = ((_a = v.type) !== null && _a !== void 0 ? _a : '').toString();
                    description = (_b = v.description) !== null && _b !== void 0 ? _b : '';
                    d = (date && typeof date.format === 'function') ? date : (date ? dayjs_1["default"](date) : null);
                    startDate_1 = d ? d.format('YYYY-MM-DD') : '';
                    endDate_1 = startDate_1;
                    // 前置檢查，避免送出不完整 payload 造成 400
                    if (!title || !startDate_1 || !endDate_1 || !type) {
                        console.warn('缺少必要欄位，取消送出', { title: title, startDate: startDate_1, endDate: endDate_1, type: type });
                        form.setFields(__spreadArrays((title ? [] : [{ name: 'title', errors: ['請輸入標題'] }]), (d ? [] : [{ name: 'date', errors: ['請選擇日期'] }]), (type ? [] : [{ name: 'type', errors: ['請選擇類型'] }])));
                        antd_1.message.error('請完整填寫表單');
                        return [2 /*return*/];
                    }
                    eventPayload_1 = { title: title, description: description, type: type, startDate: startDate_1, endDate: endDate_1 };
                    console.debug('送出事件 payload:', eventPayload_1);
                    // 樂觀更新：編輯→立即覆蓋；新增→先推暫時事件
                    if (editingEvent) {
                        setEvents(function (prev) { return prev.map(function (ev) { return ev.id === editingEvent.id ? __assign(__assign(__assign({}, editingEvent), eventPayload_1), { start: new Date(startDate_1), end: new Date(endDate_1) }) : ev; }); });
                    }
                    else {
                        tempId_1 = Date.now();
                        tempIdRef.current = tempId_1;
                        setEvents(function (prev) { return __spreadArrays([{ id: tempId_1, description: eventPayload_1.description || '', type: eventPayload_1.type, title: eventPayload_1.title, startDate: startDate_1, endDate: endDate_1, start: new Date(startDate_1), end: new Date(endDate_1), projectId: null, taskId: null, createdAt: '', updatedAt: '' }], prev); });
                    }
                    return [4 /*yield*/, fetch('/api/calendar', { method: editingEvent ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingEvent ? __assign({ id: editingEvent.id }, eventPayload_1) : eventPayload_1) })];
                case 1:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    result_1 = _c.sent();
                    if (result_1.success) {
                        antd_1.message.success(editingEvent ? '事件更新成功' : '事件建立成功');
                        setModalVisible(false);
                        form.resetFields();
                        // 用正式資料取代暫時事件 / 或更新編輯後資料（再確保時間戳同步）
                        if (editingEvent) {
                            setEvents(function (prev) { return prev.map(function (ev) { return ev.id === editingEvent.id ? __assign(__assign(__assign({}, ev), result_1.data), { start: new Date(result_1.data.startDate), end: new Date(result_1.data.endDate) }) : ev; }); });
                        }
                        else if (tempIdRef.current) {
                            tid_1 = tempIdRef.current;
                            setEvents(function (prev) { return prev.map(function (ev) { return ev.id === tid_1 ? __assign(__assign({}, result_1.data), { start: new Date(result_1.data.startDate), end: new Date(result_1.data.endDate) }) : ev; }); });
                            tempIdRef.current = null;
                        }
                    }
                    else {
                        antd_1.message.error(result_1.error || '保存事件失敗');
                        // 回滾：重新抓取（簡化處理）
                        fetchCalendarEvents();
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _c.sent();
                    console.error('保存事件錯誤:', error_2);
                    antd_1.message.error('保存事件失敗');
                    return [3 /*break*/, 5];
                case 4:
                    setSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteEvent = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var backup, response, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    backup = events;
                    setEvents(function (prev) { return prev.filter(function (e) { return e.id !== id; }); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/calendar?id=" + id, { method: 'DELETE' })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (result.success) {
                        antd_1.message.success('事件刪除成功');
                    }
                    else {
                        antd_1.message.error(result.error || '刪除事件失敗');
                        setEvents(backup);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    console.error('刪除事件錯誤:', error_3);
                    antd_1.message.error('刪除事件失敗');
                    setEvents(backup);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var eventPropGetter = function (event) {
        var color = event.type === 'project' ? '#1677ff' : event.type === 'task' ? '#52c41a' : '#faad14';
        return { style: { backgroundColor: color, border: 'none', color: '#fff' } };
    };
    var onSelectSlot = function (slotInfo) {
        console.log('[Calendar] onSelectSlot:', slotInfo);
        // 僅在從編輯轉成新增時重置
        if (editingEvent)
            form.resetFields();
        setEditingEvent(null);
        form.setFieldsValue({ date: dayjs_1["default"](slotInfo.start), type: 'other' });
        setModalVisible(true);
    };
    var onSelectEvent = function (e) {
        console.log('[Calendar] onSelectEvent:', e);
        setEditingEvent(e);
        form.resetFields();
        form.setFieldsValue({
            title: e.title,
            description: e.description,
            type: e.type,
            date: dayjs_1["default"](e.startDate)
        });
        setModalVisible(true);
    };
    return (React.createElement("div", { style: { padding: 24 } }, !mounted ? null : (React.createElement(React.Fragment, null,
        React.createElement(antd_1.Card, { title: "\u884C\u4E8B\u66C6 (\u6708)", extra: React.createElement(antd_1.Space, null,
                React.createElement(antd_1.Button, { type: "primary", icon: React.createElement(icons_1.PlusOutlined, null), onClick: function () { if (editingEvent)
                        form.resetFields(); setEditingEvent(null); form.setFieldsValue({ type: 'other', date: dayjs_1["default"]() }); setModalVisible(true); } }, "\u65B0\u589E\u4E8B\u4EF6")) },
            React.createElement("div", { style: { height: 640 } },
                React.createElement(react_big_calendar_1.Calendar, { localizer: localizer, events: events, startAccessor: "start", endAccessor: "end", selectable: true, popup: true, views: ['month'], date: viewDate, onNavigate: function (d) { return setViewDate(d); }, onSelectSlot: onSelectSlot, onSelectEvent: onSelectEvent, eventPropGetter: eventPropGetter, messages: { today: '今天', previous: '上一頁', next: '下一頁', month: '月', week: '週', day: '日', agenda: '列表' } }))),
        React.createElement(antd_1.Modal, { title: editingEvent ? '編輯事件' : '新增事件', open: modalVisible, onCancel: function () { return setModalVisible(false); }, footer: null },
            React.createElement(antd_1.Form, { form: form, layout: "vertical", onValuesChange: function (changed, all) {
                    if (Object.prototype.hasOwnProperty.call(changed, 'title')) {
                        console.log('[Form] title changed:', changed.title, { length: typeof changed.title === 'string' ? changed.title.length : undefined });
                    }
                    if (Object.prototype.hasOwnProperty.call(changed, 'description')) {
                        var dv = changed.description;
                        console.log('[Form] description changed:', dv, { length: typeof dv === 'string' ? dv.length : undefined });
                    }
                }, onFinish: function (vals) {
                    var _a, _b;
                    console.log('[Form] onFinish raw vals:', vals);
                    var _c = form.getFieldsValue(['title', 'date', 'type', 'description']), fvTitle = _c.title, fvDate = _c.date, fvType = _c.type, fvDescription = _c.description;
                    console.log('[Form] getFieldsValue snapshot:', { fvTitle: fvTitle, fvDate: fvDate, fvType: fvType, fvDescription: fvDescription, composingTitle: composingRef.current, composingDesc: composingDescRef.current });
                    var rawTitle = (typeof fvTitle !== 'undefined') ? fvTitle : vals === null || vals === void 0 ? void 0 : vals.title;
                    var title = (rawTitle !== null && rawTitle !== void 0 ? rawTitle : '').toString().trim();
                    var errs = [];
                    if (!title)
                        errs.push({ name: 'title', errors: ['請輸入標題'] });
                    if (!(vals === null || vals === void 0 ? void 0 : vals.date))
                        errs.push({ name: 'date', errors: ['請選擇日期'] });
                    if (!(vals === null || vals === void 0 ? void 0 : vals.type))
                        errs.push({ name: 'type', errors: ['請選擇類型'] });
                    if (errs.length) {
                        form.setFields(errs);
                        var first = (_b = (_a = errs[0]) === null || _a === void 0 ? void 0 : _a.errors) === null || _b === void 0 ? void 0 : _b[0];
                        if (first)
                            antd_1.message.error(first);
                        return;
                    }
                    handleSaveEvent(__assign(__assign({}, vals), { title: title, description: typeof fvDescription !== 'undefined' ? fvDescription : vals === null || vals === void 0 ? void 0 : vals.description }));
                }, onFinishFailed: function (info) {
                    var _a, _b, _c;
                    var first = (_c = (_b = (_a = info.errorFields) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.errors) === null || _c === void 0 ? void 0 : _c[0];
                    if (first)
                        antd_1.message.error(first);
                    else
                        antd_1.message.error('請檢查表單欄位');
                } },
                React.createElement(antd_1.Form.Item, { name: "title", label: "\u6A19\u984C" },
                    React.createElement(antd_1.Input, { ref: titleInputRef, autoComplete: "off", allowClear: true, onCompositionStart: function () { composingRef.current = true; console.log('[Input.title] composition start'); }, onCompositionEnd: function (e) { composingRef.current = false; console.log('[Input.title] composition end:', e.target.value); }, onChange: function (e) { var _a; console.log('[Input.title] onChange:', e.target.value, { length: (_a = e.target.value) === null || _a === void 0 ? void 0 : _a.length }); }, onBlur: function (e) { console.log('[Input.title] onBlur:', e.target.value); } })),
                React.createElement(antd_1.Form.Item, { name: "description", label: "\u63CF\u8FF0" },
                    React.createElement(antd_1.Input.TextArea, { ref: descInputRef, rows: 3, onCompositionStart: function () { composingDescRef.current = true; console.log('[Input.description] composition start'); }, onCompositionEnd: function (e) { composingDescRef.current = false; console.log('[Input.description] composition end:', e.target.value); }, onChange: function (e) { var _a; console.log('[Input.description] onChange:', e.target.value, { length: (_a = e.target.value) === null || _a === void 0 ? void 0 : _a.length }); }, onBlur: function (e) { console.log('[Input.description] onBlur:', e.target.value); } })),
                React.createElement(antd_1.Form.Item, { name: "date", label: "\u65E5\u671F", rules: [{ required: true, message: '請選擇日期' }] },
                    React.createElement(antd_1.DatePicker, { style: { width: '100%' } })),
                React.createElement(antd_1.Form.Item, { name: "type", label: "\u985E\u578B", rules: [{ required: true, message: '請選擇類型' }] },
                    React.createElement(antd_1.Select, { options: [{ value: 'project', label: '專案' }, { value: 'task', label: '任務' }, { value: 'other', label: '其他' }] })),
                editingEvent && (React.createElement(antd_1.Popconfirm, { title: "\u78BA\u5B9A\u522A\u9664\u6B64\u4E8B\u4EF6?", onConfirm: function () { return handleDeleteEvent(editingEvent.id); } },
                    React.createElement(antd_1.Button, { danger: true, icon: React.createElement(icons_1.DeleteOutlined, null) }, "\u522A\u9664\u4E8B\u4EF6"))),
                React.createElement(antd_1.Form.Item, { style: { marginTop: 16 } },
                    React.createElement(antd_1.Button, { type: "primary", htmlType: "submit", block: true, loading: submitting, onClick: function () {
                            var _a, _b, _c, _d, _e;
                            try {
                                // 送出前強制結束輸入並 blur，避免 IME 尚在組字造成值未提交
                                (_b = (_a = titleInputRef.current) === null || _a === void 0 ? void 0 : _a.blur) === null || _b === void 0 ? void 0 : _b.call(_a);
                                (_d = (_c = descInputRef.current) === null || _c === void 0 ? void 0 : _c.blur) === null || _d === void 0 ? void 0 : _d.call(_c);
                                if (typeof window !== 'undefined') {
                                    var ae = document.activeElement;
                                    (_e = ae === null || ae === void 0 ? void 0 : ae.blur) === null || _e === void 0 ? void 0 : _e.call(ae);
                                }
                                var curr = form.getFieldValue('title');
                                var currDesc = form.getFieldValue('description');
                                console.log('[Button.save] before submit title:', curr, 'desc:', currDesc);
                            }
                            catch (_f) { }
                        } }, "\u4FDD\u5B58"))))))));
}
exports["default"] = CalendarPage;
