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
var antd_1 = require("antd");
var react_1 = require("react");
var dayjs_1 = require("dayjs");
function TaskForm(_a) {
    var _this = this;
    var open = _a.open, onClose = _a.onClose, onSubmit = _a.onSubmit, initialData = _a.initialData;
    var form = antd_1.Form.useForm()[0];
    var _b = react_1.useState([]), projects = _b[0], setProjects = _b[1];
    var _c = react_1.useState([]), teamMembers = _c[0], setTeamMembers = _c[1];
    var _d = react_1.useState(false), loading = _d[0], setLoading = _d[1];
    // 獲取專案列表
    var fetchProjects = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/projects')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        setProjects(result.data);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('獲取專案列表失敗:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // 獲取團隊成員列表
    var fetchTeamMembers = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/team')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        setTeamMembers(result.data);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('獲取團隊成員列表失敗:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        fetchProjects();
        fetchTeamMembers();
    }, []);
    react_1.useEffect(function () {
        if (open && initialData) {
            form.setFieldsValue(__assign(__assign({}, initialData), { dueDate: dayjs_1["default"](initialData.dueDate) }));
        }
        else {
            form.resetFields();
        }
    }, [open, initialData, form]);
    var handleSubmit = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var taskData, response, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    taskData = __assign(__assign({}, values), { dueDate: values.dueDate.format('YYYY-MM-DD'), progress: values.status === 'completed' ? 100 : values.progress || 0 });
                    return [4 /*yield*/, fetch('/api/tasks', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(taskData)
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        antd_1.message.success('任務創建成功');
                        onClose();
                    }
                    else {
                        antd_1.message.error('創建任務失敗');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('創建任務錯誤:', error_3);
                    antd_1.message.error('創建任務失敗');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement(antd_1.Modal, { title: initialData ? '編輯任務' : '新增任務', open: open, onOk: function () { return form.submit(); }, onCancel: onClose, confirmLoading: loading },
        React.createElement(antd_1.Form, { form: form, layout: "vertical", onFinish: handleSubmit },
            React.createElement(antd_1.Form.Item, { name: "title", label: "\u4EFB\u52D9\u540D\u7A31", rules: [{ required: true, message: '請輸入任務名稱' }] },
                React.createElement(antd_1.Input, null)),
            React.createElement(antd_1.Form.Item, { name: "description", label: "\u4EFB\u52D9\u63CF\u8FF0" },
                React.createElement(antd_1.Input.TextArea, { rows: 4 })),
            React.createElement(antd_1.Form.Item, { name: "projectId", label: "\u6240\u5C6C\u5C08\u6848", rules: [{ required: true, message: '請選擇所屬專案' }] },
                React.createElement(antd_1.Select, null, projects.map(function (project) { return (React.createElement(antd_1.Select.Option, { key: project.id, value: project.id }, project.name)); }))),
            React.createElement(antd_1.Form.Item, { name: "assignedTo", label: "\u8CA0\u8CAC\u4EBA", rules: [{ required: true, message: '請選擇負責人' }] },
                React.createElement(antd_1.Select, null, teamMembers.map(function (member) { return (React.createElement(antd_1.Select.Option, { key: member.id, value: member.id }, member.name)); }))),
            React.createElement(antd_1.Form.Item, { name: "status", label: "\u72C0\u614B", rules: [{ required: true, message: '請選擇狀態' }] },
                React.createElement(antd_1.Select, null,
                    React.createElement(antd_1.Select.Option, { value: "pending" }, "\u5F85\u8655\u7406"),
                    React.createElement(antd_1.Select.Option, { value: "in_progress" }, "\u9032\u884C\u4E2D"),
                    React.createElement(antd_1.Select.Option, { value: "completed" }, "\u5DF2\u5B8C\u6210"))),
            React.createElement(antd_1.Form.Item, { name: "priority", label: "\u512A\u5148\u7D1A", rules: [{ required: true, message: '請選擇優先級' }] },
                React.createElement(antd_1.Select, null,
                    React.createElement(antd_1.Select.Option, { value: "high" }, "\u9AD8"),
                    React.createElement(antd_1.Select.Option, { value: "medium" }, "\u4E2D"),
                    React.createElement(antd_1.Select.Option, { value: "low" }, "\u4F4E"))),
            React.createElement(antd_1.Form.Item, { name: "dueDate", label: "\u622A\u6B62\u65E5\u671F", rules: [{ required: true, message: '請選擇截止日期' }] },
                React.createElement(antd_1.DatePicker, { style: { width: '100%' } })))));
}
exports["default"] = TaskForm;
