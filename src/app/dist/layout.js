"use client";
"use strict";
exports.__esModule = true;
// src/app/layout.tsx (Client Component)
var google_1 = require("next/font/google");
var antd_1 = require("antd");
var zh_TW_1 = require("antd/locale/zh_TW");
var en_US_1 = require("antd/locale/en_US");
var ja_JP_1 = require("antd/locale/ja_JP");
var Layout_1 = require("./components/Layout");
var I18nProvider_1 = require("./components/I18nProvider");
var LanguageSwitcher_1 = require("./components/LanguageSwitcher");
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
    var AppShell = function (_a) {
        var children = _a.children;
        var locale = I18nProvider_1.useI18n().locale;
        var antdLocale = locale === 'zh-TW' ? zh_TW_1["default"] : locale === 'en' ? en_US_1["default"] : ja_JP_1["default"];
        return (React.createElement(antd_1.ConfigProvider, { locale: antdLocale, theme: {
                algorithm: darkMode ? antd_1.theme.darkAlgorithm : antd_1.theme.defaultAlgorithm
            } },
            pathname.startsWith('/AIv2') ? null : (isLogin === true && React.createElement(Navbar_1["default"], { darkMode: darkMode })),
            React.createElement(LanguageSwitcher_1["default"], null),
            React.createElement(Layout_1["default"], null, children)));
    };
    return (React.createElement("html", { lang: "zh-TW" },
        React.createElement("body", { className: inter.className },
            React.createElement(I18nProvider_1.I18nProvider, null,
                React.createElement(AppShell, null, children)))));
}
exports["default"] = RootLayout;
