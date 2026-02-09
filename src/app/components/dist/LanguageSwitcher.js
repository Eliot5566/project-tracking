"use client";
"use strict";
exports.__esModule = true;
var antd_1 = require("antd");
var react_1 = require("react");
var I18nProvider_1 = require("./I18nProvider");
function LanguageSwitcher() {
    var _a = I18nProvider_1.useI18n(), locale = _a.locale, setLocale = _a.setLocale, t = _a.t;
    return (react_1["default"].createElement("div", { style: { position: 'fixed', top: 12, right: 12, zIndex: 1000 } },
        react_1["default"].createElement(antd_1.Select, { size: "small", value: locale, style: { width: 140 }, onChange: function (val) { return setLocale(val); }, options: [
                { value: 'zh-TW', label: t('common.language.zh') },
                { value: 'en', label: t('common.language.en') },
                { value: 'ja', label: t('common.language.ja') },
            ] })));
}
exports["default"] = LanguageSwitcher;
