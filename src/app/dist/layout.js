"use client";
"use strict";
exports.__esModule = true;
// src/app/layout.tsx (Client Component)
var google_1 = require("next/font/google");
var antd_1 = require("antd");
var zh_TW_1 = require("antd/locale/zh_TW");
var Layout_1 = require("./components/Layout");
require("./globals.css");
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var Navbar_1 = require("./components/Navbar");
var inter = google_1.Inter({ subsets: ['latin'] });
function RootLayout(_a) {
    var children = _a.children;
    var _b = react_1.useState(false), darkMode = _b[0], setDarkMode = _b[1];
    var _c = react_1.useState(undefined), isLogin = _c[0], setIsLogin = _c[1];
    var pathname = (navigation_1.usePathname === null || navigation_1.usePathname === void 0 ? void 0 : navigation_1.usePathname()) || '';
    // 僅 client 檢查登入狀態
    require('react').useEffect(function () {
        if (typeof window !== 'undefined') {
            setIsLogin(localStorage.getItem('isLogin') === '1');
        }
    }, []);
    return (React.createElement(antd_1.ConfigProvider, { locale: zh_TW_1["default"], theme: {
            algorithm: darkMode ? antd_1.theme.darkAlgorithm : antd_1.theme.defaultAlgorithm
        } },
        React.createElement("html", { lang: "zh-TW" },
            React.createElement("body", { className: inter.className },
                pathname.startsWith('/AIv2') ? null : (isLogin === true && React.createElement(Navbar_1["default"], { darkMode: darkMode })),
                React.createElement(Layout_1["default"], null, children)))));
}
exports["default"] = RootLayout;
