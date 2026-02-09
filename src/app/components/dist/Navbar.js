'use client';
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var GlobalReminders_1 = require("./GlobalReminders"); // 假設這是全域提醒組件的路徑
var I18nProvider_1 = require("./I18nProvider");
var icons_2 = require("@ant-design/icons");
var Header = antd_1.Layout.Header;
function Navbar(_a) {
    var darkMode = _a.darkMode;
    var router = navigation_1.useRouter();
    var pathname = navigation_1.usePathname();
    var t = I18nProvider_1.useI18n().t;
    var baseMenuItems = [
        {
            key: '/',
            icon: React.createElement(icons_2.DashboardOutlined, null),
            label: t('navbar.home')
        },
        {
            key: '/projects',
            icon: React.createElement(icons_2.ProjectOutlined, null),
            label: t('navbar.projects')
        },
        {
            key: '/task',
            icon: React.createElement(icons_2.ProjectOutlined, null),
            label: t('navbar.tasks')
        },
        // 依權限再決定是否加入 worklogs / team
        {
            key: '/calendar',
            icon: React.createElement(icons_2.CalendarOutlined, null),
            label: t('navbar.calendar')
        },
        // {
        //   key: '/notifications',
        //   icon: <BellOutlined />,
        //   label: '通知'
        // },
        {
            key: '/progress',
            icon: React.createElement(icons_2.BarChartOutlined, null),
            label: t('navbar.progress')
        },
        {
            key: '/dashboard',
            icon: React.createElement(icons_2.ProjectOutlined, null),
            label: t('navbar.dashboard')
        },
        {
            key: '/documents',
            icon: React.createElement(icons_2.ProjectOutlined, null),
            label: t('navbar.documents')
        },
        {
            key: '/notes',
            icon: React.createElement(icons_1.FileTextOutlined, null),
            label: t('navbar.notes')
        },
        {
            key: '/audit',
            icon: React.createElement(icons_2.TeamOutlined, null),
            label: t('navbar.audit')
        },
    ];
    // 取得登入者資訊
    var _b = react_1.useState(null), user = _b[0], setUser = _b[1];
    react_1.useEffect(function () {
        if (typeof window !== 'undefined') {
            try {
                var userStr = localStorage.getItem('user');
                if (userStr) {
                    var u = JSON.parse(userStr);
                    setUser({ name: u.name, position: u.position, department: u.department, role: u.role });
                }
            }
            catch (_a) { }
        }
    }, []);
    var isIT = !!(user === null || user === void 0 ? void 0 : user.department) && /資訊|系統|資安|IT/i.test(user.department);
    var menuItems = __spreadArrays(baseMenuItems, (isIT ? [
        { key: '/worklogs', icon: React.createElement(icons_2.BulbOutlined, null), label: t('navbar.worklogs') },
        { key: '/team', icon: React.createElement(icons_2.TeamOutlined, null), label: t('navbar.team') },
    ] : []));
    // 登出
    var handleLogout = function () {
        localStorage.removeItem('isLogin');
        localStorage.removeItem('user');
        router.replace('/login');
        window.location.reload();
    };
    var userMenu = (React.createElement(antd_1.Menu, null,
        React.createElement(antd_1.Menu.Item, { key: "logout", icon: React.createElement(icons_1.LogoutOutlined, null), onClick: handleLogout }, t('navbar.logout'))));
    return (React.createElement(Header, { style: {
            padding: 0,
            background: darkMode ? '#1f1f1f' : '#fff',
            borderBottom: '1px solid #f0f0f0'
        } },
        React.createElement("div", { style: {
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                padding: '0 24px'
            } },
            React.createElement("div", { style: {
                    marginRight: '24px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: darkMode ? '#ffffff' : '#000000'
                } }, t('app.headerTitle')),
            React.createElement(antd_1.Menu, { mode: "horizontal", selectedKeys: [pathname], items: menuItems, onClick: function (_a) {
                    var key = _a.key;
                    return router.push(key);
                }, style: { flex: 1, color: darkMode ? '#ffffff' : '#000000' } }),
            React.createElement(GlobalReminders_1["default"], null),
            user && (React.createElement(antd_1.Dropdown, { overlay: userMenu, placement: "bottomRight" },
                React.createElement(antd_1.Button, { icon: React.createElement(icons_1.UserOutlined, null), style: { marginLeft: 16 } },
                    React.createElement(antd_1.Space, null,
                        user.name,
                        "\uFF08",
                        user.position,
                        "\uFF09")))))));
}
exports["default"] = Navbar;
