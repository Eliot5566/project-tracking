'use client';
"use strict";
exports.__esModule = true;
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var GlobalReminders_1 = require("./GlobalReminders"); // 假設這是全域提醒組件的路徑
var icons_2 = require("@ant-design/icons");
var Header = antd_1.Layout.Header;
function Navbar(_a) {
    var darkMode = _a.darkMode;
    var router = navigation_1.useRouter();
    var pathname = navigation_1.usePathname();
    var menuItems = [
        {
            key: '/',
            icon: React.createElement(icons_2.DashboardOutlined, null),
            label: '首頁'
        },
        {
            key: '/projects',
            icon: React.createElement(icons_2.ProjectOutlined, null),
            label: '專案管理'
        },
        {
            key: '/task',
            icon: React.createElement(icons_2.ProjectOutlined, null),
            label: '任務管理'
        },
        {
            key: '/worklogs',
            icon: React.createElement(icons_2.BulbOutlined, null),
            label: '工作日誌'
        },
        {
            key: '/team',
            icon: React.createElement(icons_2.TeamOutlined, null),
            label: '團隊管理'
        },
        {
            key: '/calendar',
            icon: React.createElement(icons_2.CalendarOutlined, null),
            label: '行事曆'
        },
        // {
        //   key: '/notifications',
        //   icon: <BellOutlined />,
        //   label: '通知'
        // },
        {
            key: '/progress',
            icon: React.createElement(icons_2.BarChartOutlined, null),
            label: '進度追蹤'
        },
        {
            key: '/dashboard',
            icon: React.createElement(icons_2.ProjectOutlined, null),
            label: '儀錶板'
        },
        {
            key: '/documents',
            icon: React.createElement(icons_2.ProjectOutlined, null),
            label: '文件管理'
        },
        {
            key: '/notes',
            icon: React.createElement(icons_1.FileTextOutlined, null),
            label: '會議記錄'
        },
        {
            key: '/audit',
            icon: React.createElement(icons_2.TeamOutlined, null),
            label: '稽核專區'
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
                    setUser({ name: u.name, position: u.position });
                }
            }
            catch (_a) { }
        }
    }, []);
    // 登出
    var handleLogout = function () {
        localStorage.removeItem('isLogin');
        localStorage.removeItem('user');
        router.replace('/login');
        window.location.reload();
    };
    var userMenu = (React.createElement(antd_1.Menu, null,
        React.createElement(antd_1.Menu.Item, { key: "logout", icon: React.createElement(icons_1.LogoutOutlined, null), onClick: handleLogout }, "\u767B\u51FA")));
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
                } }, "\u5C08\u6848\u8FFD\u8E64\u7CFB\u7D71"),
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
