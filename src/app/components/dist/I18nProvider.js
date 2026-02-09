"use client";
"use strict";
exports.__esModule = true;
exports.useI18n = exports.I18nProvider = void 0;
var react_1 = require("react");
var zh_TW_json_1 = require("../../i18n/messages/zh-TW.json");
var en_json_1 = require("../../i18n/messages/en.json");
var ja_json_1 = require("../../i18n/messages/ja.json");
var I18nContext = react_1.createContext(null);
var allMessages = {
    'zh-TW': zh_TW_json_1["default"],
    en: en_json_1["default"],
    ja: ja_json_1["default"]
};
function I18nProvider(_a) {
    var children = _a.children;
    var _b = react_1.useState('zh-TW'), locale = _b[0], setLocaleState = _b[1];
    react_1.useEffect(function () {
        var saved = (typeof window !== 'undefined' && localStorage.getItem('locale')) || 'zh-TW';
        setLocaleState(saved);
    }, []);
    var setLocale = function (l) {
        setLocaleState(l);
        if (typeof window !== 'undefined') {
            localStorage.setItem('locale', l);
            // 同步 <html lang>
            try {
                document.documentElement.lang = l;
            }
            catch (_a) { }
        }
    };
    var t = react_1.useMemo(function () {
        var messages = allMessages[locale] || allMessages['zh-TW'];
        return function (key) { var _a; return (_a = messages[key]) !== null && _a !== void 0 ? _a : key; };
    }, [locale]);
    var value = { locale: locale, setLocale: setLocale, t: t };
    return react_1["default"].createElement(I18nContext.Provider, { value: value }, children);
}
exports.I18nProvider = I18nProvider;
function useI18n() {
    var ctx = react_1.useContext(I18nContext);
    if (!ctx)
        throw new Error('useI18n must be used within I18nProvider');
    return ctx;
}
exports.useI18n = useI18n;
