"use client";
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
var icons_1 = require("@ant-design/icons");
var antd_2 = require("antd");
var I18nProvider_1 = require("../components/I18nProvider");
function TeamPage() {
    var _this = this;
    var router = navigation_1.useRouter();
    var locale = I18nProvider_1.useI18n().locale;
    var dateLocale = locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'zh-TW';
    react_1.useEffect(function () {
        if (typeof window !== 'undefined') {
            var isLogin = localStorage.getItem('isLogin') === '1';
            if (!isLogin) {
                router.replace('/login');
                return;
            }
            try {
                var u = JSON.parse(localStorage.getItem('user') || '{}');
                var dept = u === null || u === void 0 ? void 0 : u.department;
                var isIT = !!dept && /資訊|系統|資安|IT/i.test(dept);
                if (!isIT)
                    router.replace('/');
            }
            catch (_a) { }
        }
    }, []);
    var _a = react_1.useState([]), members = _a[0], setMembers = _a[1];
    var _b = react_1.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(false), modalVisible = _c[0], setModalVisible = _c[1];
    var _d = react_1.useState(false), darkMode = _d[0], setDarkMode = _d[1];
    var form = antd_1.Form.useForm()[0];
    var fetchMembers = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/team')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        setMembers(result.data);
                    }
                    else {
                        antd_1.message.error('獲取團隊成員失敗');
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('獲取團隊成員失敗:', error_1);
                    antd_1.message.error('獲取團隊成員失敗');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        fetchMembers();
    }, []);
    var handleAddMember = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/team', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(values)
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        antd_1.message.success('添加團隊成員成功');
                        setModalVisible(false);
                        form.resetFields();
                        fetchMembers();
                    }
                    else {
                        antd_1.message.error(result.error || '添加團隊成員失敗');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('添加團隊成員失敗:', error_2);
                    antd_1.message.error('添加團隊成員失敗');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: '職位',
            dataIndex: 'role',
            key: 'role'
        },
        {
            title: '部門',
            dataIndex: 'department',
            key: 'department'
        },
        {
            title: '狀態',
            dataIndex: 'status',
            key: 'status'
        },
        {
            title: '負責專案數',
            dataIndex: 'projectCount',
            key: 'projectCount'
        },
        {
            title: '負責任務數',
            dataIndex: 'taskCount',
            key: 'taskCount'
        },
        {
            title: '平均完成進度',
            dataIndex: 'averageProgress',
            key: 'averageProgress',
            render: function (progress) { return (React.createElement(antd_1.Tooltip, { title: "\u5E73\u5747\u5B8C\u6210\u9032\u5EA6\u70BA " + (progress !== null && progress !== void 0 ? progress : 0).toFixed(2) + "%" },
                (progress !== null && progress !== void 0 ? progress : 0).toFixed(2),
                "%")); }
        },
        {
            title: '電子郵件',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: '加入時間',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: function (date) {
                if (!date)
                    return '';
                // 嘗試解析為 Date 並使用本地語系顯示日期時間
                var d = new Date(date);
                if (!isNaN(d.getTime())) {
                    return d.toLocaleString(dateLocale, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                }
                // 回退：保留原始字串
                return date;
            }
        },
    ];
    return (React.createElement(antd_2.ConfigProvider, { theme: {
            algorithm: darkMode ? antd_2.theme.darkAlgorithm : antd_2.theme.defaultAlgorithm
        } },
        React.createElement("div", { style: { padding: '24px' } },
            React.createElement(antd_1.Card, { title: React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                    React.createElement("span", null, "\u5718\u968A\u7BA1\u7406")), extra: React.createElement(antd_1.Button, { type: "primary", icon: React.createElement(icons_1.PlusOutlined, null), onClick: function () { return setModalVisible(true); } }, "\u6DFB\u52A0\u6210\u54E1"), style: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' } },
                React.createElement(antd_1.Table, { columns: columns, dataSource: members, rowKey: "id", loading: loading, pagination: {
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: function (total) { return "\u5171 " + total + " \u4F4D\u6210\u54E1"; }
                    }, style: { borderRadius: '8px', overflow: 'hidden' } })),
            React.createElement(antd_1.Modal, { title: "\u6DFB\u52A0\u5718\u968A\u6210\u54E1", open: modalVisible, onCancel: function () { return setModalVisible(false); }, footer: null },
                React.createElement(antd_1.Form, { form: form, layout: "vertical", onFinish: handleAddMember },
                    React.createElement(antd_1.Form.Item, { name: "name", label: "\u59D3\u540D", rules: [{ required: true, message: '請輸入姓名' }] },
                        React.createElement(antd_1.Input, { placeholder: "\u8F38\u5165\u6210\u54E1\u59D3\u540D" })),
                    React.createElement(antd_1.Form.Item, { name: "role", label: "\u8077\u4F4D", rules: [{ required: true, message: '請輸入職位' }] },
                        React.createElement(antd_1.Select, { placeholder: "\u9078\u64C7\u8077\u4F4D", onChange: function (value) {
                                if (value === 'security_officer') {
                                    form.setFieldsValue({ department: '資安課' });
                                }
                                else if (value === 'developer') {
                                    form.setFieldsValue({ department: '系統課' });
                                }
                                else if (value === 'project_manager') {
                                    form.setFieldsValue({ department: '資訊部' });
                                }
                            } },
                            React.createElement(antd_1.Select.Option, { value: "frontend_developer" }, "\u524D\u7AEF\u958B\u767C"),
                            React.createElement(antd_1.Select.Option, { value: "backend_developer" }, "\u5F8C\u7AEF\u958B\u767C"),
                            React.createElement(antd_1.Select.Option, { value: "developer" }, "\u8CC7\u8A0A\u5DE5\u7A0B\u5E2B"),
                            React.createElement(antd_1.Select.Option, { value: "security_officer" }, "\u8CC7\u5B89\u5DE5\u7A0B\u5E2B"),
                            React.createElement(antd_1.Select.Option, { value: "project_manager" }, "\u7D93\u7406"))),
                    React.createElement(antd_1.Form.Item, { name: "department", label: "\u90E8\u9580", rules: [{ required: true, message: '請輸入部門' }] },
                        React.createElement(antd_1.Select, { placeholder: "\u9078\u64C7\u90E8\u9580" },
                            React.createElement(antd_1.Select.Option, { value: "\u8CC7\u8A0A\u90E8" }, "\u8CC7\u8A0A\u90E8"),
                            React.createElement(antd_1.Select.Option, { value: "\u7CFB\u7D71\u8AB2" }, "\u7CFB\u7D71\u8AB2"),
                            React.createElement(antd_1.Select.Option, { value: "\u8CC7\u5B89\u8AB2" }, "\u8CC7\u5B89\u8AB2"))),
                    React.createElement(antd_1.Form.Item, { name: "email", label: "\u96FB\u5B50\u90F5\u4EF6", rules: [
                            { required: true, message: '請輸入電子郵件' },
                            { type: 'email', message: '請輸入有效的電子郵件地址' },
                        ] },
                        React.createElement(antd_1.Input, { placeholder: "\u8F38\u5165\u96FB\u5B50\u90F5\u4EF6" })),
                    React.createElement(antd_1.Form.Item, null,
                        React.createElement(antd_1.Button, { type: "primary", htmlType: "submit", block: true }, "\u78BA\u5B9A")))))));
}
exports["default"] = TeamPage;
