"use client";
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
var react_1 = require("react");
var antd_1 = require("antd");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
// ===== 假資料（可日後改為 API 串接） =====
var now = new Date();
var seededRand = function (seed) {
    // 簡單可重現亂數（展示用）
    var x = Math.sin(seed) * 10000;
    // sin代表值範圍在 -1 到 1 之間 .sin會回傳一個介於 -1 和 1 之間的值
    return x - Math.floor(x);
};
// makeTrend 假資料
var makeTrend = function (seed, days, start, slope) {
    if (seed === void 0) { seed = 1; }
    if (days === void 0) { days = 14; }
    if (start === void 0) { start = 95; }
    if (slope === void 0) { slope = -2; }
    return Array.from({ length: days }).map(function (_, i) { return ({
        day: "D" + (i + 1),
        health: Math.max(0, start + slope * i + (seededRand(seed + i) - 0.5) * 3),
        temp: 35 + seededRand(seed + i * 2) * 10,
        force: 12 + seededRand(seed + i * 3) * 4
    }); });
};
// 主要失效模式描述
var failureModes = [
    { mode: '崩角/裂紋', weight: 0.42, contrib: ['起牙處彎曲', '底屑毛邊', '牙長超出'] },
    { mode: '磨耗超限', weight: 0.35, contrib: ['總衝次(Shots)', '潤滑不良', '切屑堵塞'] },
    { mode: '部分變形', weight: 0.23, contrib: ['出牙距不足', '牙型負載', '攻速異常'] },
];
var inferProcess = function (machine) {
    var _a, _b;
    // 範例：A/D 打頭、B/C 搓牙（可依實際規則調整）
    var c = ((_b = (_a = machine === null || machine === void 0 ? void 0 : machine[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase) === null || _b === void 0 ? void 0 : _b.call(_a)) || 'A';
    return (c === 'A' || c === 'D') ? '打頭' : '搓牙';
};
var fakeCatalog = [
    { toolName: 'A_主模具', toolNo: 'MISCZ0813' },
    { toolName: 'M_牙板(下牙板)', toolNo: 'MISCT552' },
    { toolName: 'A_主模具', toolNo: 'MISCXA03' },
    { toolName: 'M_牙板(上牙板)', toolNo: 'MISCU777' },
];
// enrich 函數 用於擴充 RawWO 資料
var enrich = function (rows) { return rows.map(function (r, idx) {
    var catalog = fakeCatalog[(idx + r.machine.length) % fakeCatalog.length];
    //   const life = 1_000_000; // 假壽命
    var life = 1073127; // 假壽命 
    var start = Math.floor(20000 + (idx * 7000) % 100000);
    var prod = Math.floor((idx * 1337) % 3000);
    var total = start + prod;
    // 模具編號
    var moldId = catalog.toolNo + "_" + String(((idx % 12) + 1)).padStart(2, '0');
    return {
        key: idx + 1,
        process: inferProcess(r.machine),
        machine: r.machine,
        order: r.orderNo,
        toolName: catalog.toolName,
        toolNo: catalog.toolNo,
        moldId: moldId,
        life: life,
        start: start,
        prod: prod,
        total: total
    };
}); };
// 依健康度/趨勢/RUL 產生保養/更換建議
var getAdvice = function (row, metrics) {
    var _a, _b, _c, _d;
    if (!row || !metrics)
        return null;
    var maxHours = row.process === '搓牙' ? 672 : 672; //預設壽命上限 打頭、搓牙672小時
    var d14 = Math.max(0, Math.min(100, (_a = metrics.health) !== null && _a !== void 0 ? _a : 0)); // .health
    var d1 = Math.max(0, Math.min(100, (_d = (_c = (_b = metrics.trend) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.health) !== null && _d !== void 0 ? _d : d14));
    var dailyDrop = (d1 - d14) / 13; // 每日下降幅度 avg
    var reasons = [];
    // 閾值（可微調）
    var urgentHourThresh = Math.max(16, Math.floor(maxHours * 0.15)); // 最低 16 小時或 15% 用於緊急更換
    var planHourThresh = Math.floor(maxHours * 0.4); // 最低 40% 或 16 小時 用於計畫保養
    var action = '正常巡檢';
    var priority = '低';
    var window = '依排程巡檢';
    // 如果D14 壽命低於 25%  或是 RUL 小於緊急閾值 或 日降幅過大
    if (d14 <= 25 || metrics.rulHours <= urgentHourThresh || dailyDrop >= 8) {
        action = '立即更換';
        priority = '高';
        window = '24–48 小時內';
        if (d14 <= 25)
            reasons.push('健康度低於 25%');
        if (metrics.rulHours <= urgentHourThresh)
            reasons.push("\u5269\u9918\u5C0F\u6642 \u2264 " + urgentHourThresh + "h");
        if (dailyDrop >= 8)
            reasons.push('健康度日降幅 ≥ 8%');
    }
    else if (d14 <= 60 || metrics.rulHours <= planHourThresh || dailyDrop >= 3) {
        action = '計畫保養';
        priority = '中';
        window = '本週內安排';
        if (d14 <= 60)
            reasons.push('健康度低於 60%');
        if (metrics.rulHours <= planHourThresh)
            reasons.push("\u5269\u9918\u5C0F\u6642 \u2264 " + planHourThresh + "h");
        if (dailyDrop >= 3)
            reasons.push('健康度日降幅 ≥ 3%');
    }
    return {
        action: action,
        priority: priority,
        window: window,
        reasons: reasons,
        spares: [
            "" + row.toolName,
            "\u6599\u865F " + row.toolNo,
            "\u6A21\u5177 " + row.moldId,
        ]
    };
};
// 信心度區間：依 conf 給出 D14 健康度與 RUL 的區間
var getConfidenceBands = function (row, metrics) {
    var _a, _b;
    if (!row || !metrics)
        return null;
    var life = Math.max(1, row.life);
    var maxHours = row.process === '搓牙' ? 672 : 672;
    var centerHealth = Math.max(0, Math.min(100, (_a = metrics.health) !== null && _a !== void 0 ? _a : 0));
    var conf = Math.max(0, Math.min(1, (_b = metrics.conf) !== null && _b !== void 0 ? _b : 0.85));
    // conf 越高，區間越窄（±5% ~ ±10%）
    var halfWidth = 0.10 - (conf - 0.8) * 0.1; // conf=0.8→±10%，conf=0.9→±0%
    var hw = Math.max(0.03, Math.min(0.10, halfWidth));
    var lowH = Math.max(0, centerHealth - hw * 100);
    var highH = Math.min(100, centerHealth + hw * 100);
    var lowRatio = lowH / 100;
    var highRatio = highH / 100;
    return {
        healthLow: Math.round(lowH),
        healthHigh: Math.round(highH),
        shotsLow: Math.round(life * lowRatio),
        shotsHigh: Math.round(life * highRatio),
        hoursLow: Math.round(maxHours * lowRatio),
        hoursHigh: Math.round(maxHours * highRatio)
    };
};
// 理由 Top3（風險貢獻因子）：以 FMECA 三大失效模式 + 基準權重，結合即時訊號分數
var getTopReasons = function (row, metrics) {
    var _a, _b;
    if (!row || !metrics)
        return [];
    var tr = ((_a = metrics.trend) !== null && _a !== void 0 ? _a : []);
    var n = tr.length;
    var k = Math.max(1, Math.min(5, n));
    var tail = tr.slice(-k);
    var avg = function (arr) { return (arr.length ? arr.reduce(function (a, b) { return a + b; }, 0) / arr.length : 0); };
    var avgForce = avg(tail.map(function (d) { return d.force; })); // 期望在 12~16
    var avgTemp = avg(tail.map(function (d) { return d.temp; })); // 期望在 35~45
    var avgHealth = avg(tail.map(function (d) { return d.health; }));
    var avgNG = Math.max(0, 5 - avgHealth / 25); // 與圖表一致的粗略 NG 估計
    var usedRatio = Math.min(1, Math.max(0, ((_b = row.total) !== null && _b !== void 0 ? _b : 0) / Math.max(1, row.life))); // 使用比例
    // 訊號風險分數（0~1）
    var forceScore = Math.min(1, Math.max(0, (avgForce - 12) / 4)); // 峰值力/負載
    var tempScore = Math.min(1, Math.max(0, (avgTemp - 35) / 10)); // 週期溫升
    var wearScore = usedRatio; // 磨耗（使用比例）
    var roughScore = Math.min(1, avgNG / 5); // 表面粗糙度（以 NG 近似）
    // 以提供的三大失效模式為核心，並將基準權重與即時訊號做加權融合
    // 融合方式：final = clamp( baseWeight*0.6 + proxyScore*0.4 )
    var clamp01 = function (x) { return Math.max(0, Math.min(1, x)); };
    var modes = failureModes.map(function (fm) {
        var proxy = 0;
        switch (fm.mode) {
            case '崩角/裂紋':
                // 與打擊力尖峰、表面破壞相關
                proxy = (forceScore + roughScore) / 2;
                break;
            case '磨耗超限':
                // 與總衝次累積、潤滑與溫升相關
                proxy = (wearScore + tempScore) / 2;
                break;
            case '部分變形':
                // 與負載/對位、攻速引發之熱機械效應相關
                proxy = (forceScore + tempScore) / 2;
                break;
            default:
                proxy = 0;
        }
        var final = clamp01(fm.weight * 0.6 + proxy * 0.4);
        return {
            name: fm.mode + "\uFF08\u56E0\u5B50\uFF1A" + fm.contrib.join('、') + "\uFF09",
            score: final
        };
    });
    // 取 Top3 後進行正規化，讓百分比加總為 100%
    var top3 = modes.sort(function (a, b) { return b.score - a.score; }).slice(0, 3);
    var sum = top3.reduce(function (acc, cur) { return acc + cur.score; }, 0);
    if (sum <= 0) {
        // 全為 0 時，平均分配（34/33/33）
        var base_1 = [34, 33, 33];
        return top3.map(function (r, i) { return ({ name: r.name, score: 1 / 3, pct: base_1[i] }); });
    }
    var normalized = top3.map(function (r) { return ({ name: r.name, score: r.score / sum }); });
    var floors = normalized.map(function (r) { return (__assign(__assign({}, r), { pct: Math.floor(r.score * 100), frac: (r.score * 100) - Math.floor(r.score * 100) })); });
    var remain = 100 - floors.reduce(function (a, b) { return a + b.pct; }, 0);
    // 依小數部分由大到小補齊 100%
    floors.sort(function (a, b) { return b.frac - a.frac; });
    for (var i = 0; i < floors.length && remain > 0; i++) {
        floors[i].pct += 1;
        remain -= 1;
    }
    // 回復原順序（以名稱配對）
    var pctMap = new Map(floors.map(function (f) { return [f.name, f.pct]; }));
    return top3.map(function (r) { var _a; return ({ name: r.name, score: (r.score / sum), pct: (_a = pctMap.get(r.name)) !== null && _a !== void 0 ? _a : Math.round((r.score / sum) * 100) }); });
};
// 由工單行產生 RUL/健康度估計（展示用簡化公式，健康度與 RUL 勾稽）
var deriveMetrics = function (row) {
    var _a, _b;
    if (!row)
        return null;
    var life = Math.max(1, row.life); // 壽命
    var remainingShots = Math.max(0, row.life - row.total); // 剩餘衝次
    var remainRatio = Math.max(0, Math.min(1, remainingShots / life)); // 剩餘比例
    // 勾稽：健康度 = (剩餘衝次 / 壽命) * 100
    var baseHealth = Math.round(remainRatio * 100);
    var seed = row.machine.charCodeAt(0) + row.machine.charCodeAt(row.machine.length - 1);
    // 趨勢校正：第 14 天健康度 = 第 1 天健康度 × factor（factor ∈ [0.5, 0.6]）
    var days = 14;
    var factor = 0.5 + seededRand(seed * 13) * 0.1; // 0.5 ~ 0.6
    var targetEnd = Math.max(0, Math.min(100, baseHealth * factor));
    var slope = (targetEnd - baseHealth) / (days - 1);
    var trend = makeTrend(seed, days, baseHealth, slope);
    // 以第 14 天的健康度比例勾稽 RUL，確保 75% => 750,000 隻
    var lastHealth = Math.max(0, Math.min(100, (_b = (_a = trend.at(-1)) === null || _a === void 0 ? void 0 : _a.health) !== null && _b !== void 0 ? _b : baseHealth));
    // 使用最後一天健康度 .Math.min(100, trend.at(-1):.health ?? baseHealth)
    var finalRemainRatio = lastHealth / 100;
    var rulShots = Math.round(life * finalRemainRatio);
    // 調整：以製程分流估算剩餘小時，並加入合理上限（搓牙<=120h，打頭<=240h），同樣用第 14 天比例
    var maxHours = row.process === '搓牙' ? 672 : 672;
    var rulHours = Math.round(maxHours * finalRemainRatio);
    var conf = 0.82 + seededRand(seed) * 0.15; // 0.82~0.97
    return { trend: trend, rulShots: rulShots, rulHours: rulHours, conf: conf, health: lastHealth };
};
// ===== 表格欄位：整合 RUL / 健康度 / 使用比例 =====
var buildColumns = function (getHealthForRow, getRULForRow) { return [
    { title: '製程', dataIndex: 'process', key: 'process', render: function (t) { return React.createElement(antd_1.Tag, { color: t === '打頭' ? 'blue' : 'volcano' }, t); } },
    { title: '機台', dataIndex: 'machine', key: 'machine' },
    { title: '工單單號', dataIndex: 'order', key: 'order' },
    { title: '模具品項名稱', dataIndex: 'toolName', key: 'toolName' },
    { title: '模具料號', dataIndex: 'toolNo', key: 'toolNo' },
    { title: '模具編號', dataIndex: 'moldId', key: 'moldId' },
    //   { title: '壽命數量', dataIndex: 'life', key: 'life', render: (v: number) => v?.toLocaleString?.() ?? v },
    //   { title: '開始數量', dataIndex: 'start', key: 'start', render: (v: number) => v?.toLocaleString?.() ?? v },
    //   { title: '生產數量', dataIndex: 'prod', key: 'prod', render: (v: number) => v?.toLocaleString?.() ?? v },
    //   { title: '合計', dataIndex: 'total', key: 'total', render: (v: number) => v?.toLocaleString?.() ?? v },
    //   { title: '使用比例(%)', key: 'ratio', render: (_: any, r: any) => ((r.total / r.life) * 100).toFixed(2) },
    { title: '健康度', key: 'health', render: function (_, r) {
            var h = getHealthForRow(r); // 健康度
            return React.createElement(antd_1.Progress, { percent: Math.round(h), size: "small", status: h > 30 ? 'active' : 'exception' });
        }
    },
    { title: '預測剩餘壽命(衝次)', key: 'rul', render: function (_, r) { return getRULForRow(r); } },
]; };
function AIForgingThreadingSuite() {
    var _this = this;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var _p = react_1.useState(true), loading = _p[0], setLoading = _p[1];
    var _q = react_1.useState([]), workOrders = _q[0], setWorkOrders = _q[1];
    // 表格高亮的最後點選列（僅用於 UI 高亮，不影響面板資料）
    var _r = react_1.useState(null), selectedKey = _r[0], setSelectedKey = _r[1];
    // 打頭/搓牙各自獨立的選取鍵，避免點選一方影響另一方的面板
    var _s = react_1.useState(null), selectedHeadingKey = _s[0], setSelectedHeadingKey = _s[1];
    var _t = react_1.useState(null), selectedThreadingKey = _t[0], setSelectedThreadingKey = _t[1];
    // 載入：從 API 取得清單並補充假欄位
    react_1.useEffect(function () {
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var res, json, base, enriched, e_1, fallback;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
            return __generator(this, function (_w) {
                switch (_w.label) {
                    case 0:
                        _w.trys.push([0, 3, 4, 5]);
                        return [4 /*yield*/, fetch('/api/ai/workorders', { cache: 'no-store' })];
                    case 1:
                        res = _w.sent();
                        return [4 /*yield*/, res.json()];
                    case 2:
                        json = _w.sent();
                        base = (json === null || json === void 0 ? void 0 : json.data) || [];
                        enriched = enrich(base);
                        setWorkOrders(enriched);
                        setSelectedKey((_b = (_a = enriched[0]) === null || _a === void 0 ? void 0 : _a.key) !== null && _b !== void 0 ? _b : null);
                        setSelectedHeadingKey((_f = (_d = (_c = enriched.find(function (w) { return w.process === '打頭'; })) === null || _c === void 0 ? void 0 : _c.key) !== null && _d !== void 0 ? _d : (_e = enriched[0]) === null || _e === void 0 ? void 0 : _e.key) !== null && _f !== void 0 ? _f : null);
                        setSelectedThreadingKey((_k = (_h = (_g = enriched.find(function (w) { return w.process === '搓牙'; })) === null || _g === void 0 ? void 0 : _g.key) !== null && _h !== void 0 ? _h : (_j = enriched[0]) === null || _j === void 0 ? void 0 : _j.key) !== null && _k !== void 0 ? _k : null);
                        return [3 /*break*/, 5];
                    case 3:
                        e_1 = _w.sent();
                        fallback = enrich([
                            { machine: 'A101', status: 1, orderNo: 'J512-25080228' },
                            { machine: 'A104', status: 1, orderNo: 'J512-25060262' },
                            { machine: 'B104', status: 3, orderNo: 'J512-25060212' },
                            { machine: 'C107', status: 3, orderNo: 'J512-25060102' },
                            { machine: 'D106', status: 1, orderNo: 'J512-25070475' },
                        ]);
                        setWorkOrders(fallback);
                        setSelectedKey((_m = (_l = fallback[0]) === null || _l === void 0 ? void 0 : _l.key) !== null && _m !== void 0 ? _m : null);
                        setSelectedHeadingKey((_r = (_p = (_o = fallback.find(function (w) { return w.process === '打頭'; })) === null || _o === void 0 ? void 0 : _o.key) !== null && _p !== void 0 ? _p : (_q = fallback[0]) === null || _q === void 0 ? void 0 : _q.key) !== null && _r !== void 0 ? _r : null);
                        //  setSelectedHeadingKey(fallback.find(w=>w.process==='打頭')?.key ?? fallback[0]?.key ?? null);
                        setSelectedThreadingKey((_v = (_t = (_s = fallback.find(function (w) { return w.process === '搓牙'; })) === null || _s === void 0 ? void 0 : _s.key) !== null && _t !== void 0 ? _t : (_u = fallback[0]) === null || _u === void 0 ? void 0 : _u.key) !== null && _v !== void 0 ? _v : null);
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); })();
    }, []);
    var headingRow = react_1.useMemo(function () {
        var _a, _b;
        return ((_b = (_a = workOrders.find(function (w) { return w.key === selectedHeadingKey; })) !== null && _a !== void 0 ? _a : workOrders.find(function (w) { return w.process === '打頭'; })) !== null && _b !== void 0 ? _b : null);
    }, [selectedHeadingKey]);
    var threadingRow = react_1.useMemo(function () {
        var _a, _b;
        return ((_b = (_a = workOrders.find(function (w) { return w.key === selectedThreadingKey; })) !== null && _a !== void 0 ? _a : workOrders.find(function (w) { return w.process === '搓牙'; })) !== null && _b !== void 0 ? _b : null);
    }, [selectedThreadingKey]);
    var headingMetrics = react_1.useMemo(function () { return deriveMetrics(headingRow); }, [headingRow]);
    var threadingMetrics = react_1.useMemo(function () { return deriveMetrics(threadingRow); }, [threadingRow]);
    var columns = react_1.useMemo(function () { return buildColumns(function (r) { var _a, _b; return (_b = (_a = deriveMetrics(r)) === null || _a === void 0 ? void 0 : _a.health) !== null && _b !== void 0 ? _b : 0; }, function (r) { var _a, _b; return (_b = (_a = deriveMetrics(r)) === null || _a === void 0 ? void 0 : _a.rulShots) !== null && _b !== void 0 ? _b : 0; }); }, []);
    return (React.createElement("div", { className: "p-6 bg-gray-50 min-h-screen" },
        React.createElement(antd_1.Typography.Title, { level: 2 }, "AI \u667A\u80FD\u88FD\u7A0B\u5957\u4EF6 \u2014 \u6253\u982D/\u6413\u7259\uFF08RUL + \u5DE5\u55AE\u6574\u5408\uFF09"),
        React.createElement(antd_1.Typography.Paragraph, null,
            "\u9EDE\u9078\u4E0B\u65B9 ",
            React.createElement("b", null, "\u5DE5\u55AE/\u6A5F\u53F0"),
            " \u4EFB\u4E00\u5217\uFF0C\u4E0A\u65B9\u7684 ",
            React.createElement("b", null, "RUL \u7E3D\u89BD"),
            " \u8207 ",
            React.createElement("b", null, "\u8DA8\u52E2\u5716"),
            " \u5C07\u81EA\u52D5\u5207\u63DB\u70BA\u8A72\u7B46\u6A5F\u53F0/\u6A21\u5177\u7684\u5373\u6642\u8996\u5716\u3002"),
        React.createElement(antd_1.Row, { gutter: [16, 16] },
            React.createElement(antd_1.Col, { xs: 24, lg: 12 },
                React.createElement(antd_1.Card, { title: React.createElement(antd_1.Space, null,
                        React.createElement(lucide_react_1.Hammer, { size: 18 }),
                        "\u6253\u982D\u6A21\u5177 RUL \u7E3D\u89BD"), extra: React.createElement(antd_1.Space, null,
                        React.createElement(antd_1.Tag, { color: "blue" }, "Heading"),
                        headingRow && React.createElement(antd_1.Tag, null, headingRow.machine)) },
                    React.createElement(antd_1.Row, { gutter: 12 },
                        React.createElement(antd_1.Col, { span: 8 },
                            React.createElement(antd_1.Statistic, { title: "\u4F30\u8A08\u5269\u9918\u885D\u6B21", value: (_a = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.rulShots) !== null && _a !== void 0 ? _a : 0 })),
                        React.createElement(antd_1.Col, { span: 8 },
                            React.createElement(antd_1.Statistic, { title: "\u4F30\u8A08\u5269\u9918\u5C0F\u6642", value: (_b = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.rulHours) !== null && _b !== void 0 ? _b : 0 })),
                        React.createElement(antd_1.Col, { span: 8 },
                            React.createElement(antd_1.Statistic, { title: "\u4FE1\u5FC3\u5EA6", value: Math.round(((_c = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.conf) !== null && _c !== void 0 ? _c : 0) * 100), suffix: "%" }))),
                    (function () {
                        var bands = getConfidenceBands(headingRow, headingMetrics);
                        var reasons = getTopReasons(headingRow, headingMetrics);
                        return bands ? (React.createElement(React.Fragment, null,
                            React.createElement(antd_1.Divider, null),
                            React.createElement(antd_1.Row, { gutter: 12 },
                                React.createElement(antd_1.Col, { span: 12 },
                                    React.createElement(antd_1.Typography.Text, { type: "secondary" }, "\u6A21\u5177\u7570\u5E38\u4E3B\u8981\u539F\u56E0 Top3"),
                                    React.createElement("ul", { className: "text-sm mt-1", style: { paddingLeft: 20 } }, reasons.map(function (r) { return (React.createElement("li", { key: r.name },
                                        r.name,
                                        "\uFF08",
                                        r.pct,
                                        "%\uFF09")); })))))) : null;
                    })(),
                    React.createElement(antd_1.Divider, null),
                    React.createElement(antd_1.Row, { gutter: 12 },
                        React.createElement(antd_1.Col, { span: 12 },
                            React.createElement(antd_1.Typography.Text, { type: "secondary" }, "\u5065\u5EB7\u5EA6\u8DA8\u52E2\uFF0814 \u5929\uFF09"),
                            React.createElement("div", { style: { height: 200 } },
                                React.createElement(recharts_1.ResponsiveContainer, { width: "200%", height: "100%" },
                                    React.createElement(recharts_1.AreaChart, { data: (_d = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.trend) !== null && _d !== void 0 ? _d : [], margin: { left: 0, right: 0, top: 10, bottom: 0 } },
                                        React.createElement("defs", null,
                                            React.createElement("linearGradient", { id: "h", x1: "0", y1: "0", x2: "0", y2: "1" },
                                                React.createElement("stop", { offset: "5%", stopColor: "#8884d8", stopOpacity: 0.6 }),
                                                React.createElement("stop", { offset: "95%", stopColor: "#8884d8", stopOpacity: 0.1 }))),
                                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                        React.createElement(recharts_1.XAxis, { dataKey: "day", tick: { fontSize: 12 } }),
                                        React.createElement(recharts_1.YAxis, { tick: { fontSize: 12 }, domain: [0, 100] }),
                                        React.createElement(recharts_1.Tooltip, null),
                                        React.createElement(recharts_1.Area, { type: "monotone", dataKey: "health", stroke: "#8884d8", fillOpacity: 1, fill: "url(#h)" })))))),
                    React.createElement(antd_1.Divider, null),
                    React.createElement(antd_1.Space, { wrap: true },
                        React.createElement(antd_1.Tag, { color: ((_e = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.health) !== null && _e !== void 0 ? _e : 0) > 70 ? 'green' : 'orange' },
                            "\u5065\u5EB7\u5EA6 ",
                            ((_f = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.health) !== null && _f !== void 0 ? _f : 0).toFixed(1),
                            " / 100"),
                        headingRow && React.createElement(antd_1.Tag, null,
                            "\u5DE5\u55AE ",
                            headingRow.order),
                        headingRow && React.createElement(antd_1.Tag, null,
                            "\u6A21\u5177 ",
                            headingRow.moldId),
                        React.createElement(antd_1.Tag, { color: "geekblue" },
                            "\u8CC7\u6599\u66F4\u65B0 ",
                            now.toLocaleDateString())))),
            React.createElement(antd_1.Col, { xs: 24, lg: 12 },
                React.createElement(antd_1.Card, { title: React.createElement(antd_1.Space, null,
                        React.createElement(lucide_react_1.Wrench, { size: 18 }),
                        "\u6413\u7259\u6A21\u5177 RUL \u7E3D\u89BD"), extra: React.createElement(antd_1.Space, null,
                        React.createElement(antd_1.Tag, { color: "volcano" }, "Threading"),
                        threadingRow && React.createElement(antd_1.Tag, null, threadingRow.machine)) },
                    React.createElement(antd_1.Row, { gutter: 12 },
                        React.createElement(antd_1.Col, { span: 8 },
                            React.createElement(antd_1.Statistic, { title: "\u4F30\u8A08\u5269\u9918\u885D\u6B21", value: (_g = threadingMetrics === null || threadingMetrics === void 0 ? void 0 : threadingMetrics.rulShots) !== null && _g !== void 0 ? _g : 0 })),
                        React.createElement(antd_1.Col, { span: 8 },
                            React.createElement(antd_1.Statistic, { title: "\u4F30\u8A08\u5269\u9918\u5C0F\u6642", value: (_h = threadingMetrics === null || threadingMetrics === void 0 ? void 0 : threadingMetrics.rulHours) !== null && _h !== void 0 ? _h : 0 })),
                        React.createElement(antd_1.Col, { span: 8 },
                            React.createElement(antd_1.Statistic, { title: "\u4FE1\u5FC3\u5EA6", value: Math.round(((_j = threadingMetrics === null || threadingMetrics === void 0 ? void 0 : threadingMetrics.conf) !== null && _j !== void 0 ? _j : 0) * 100), suffix: "%" }))),
                    (function () {
                        var bands = getConfidenceBands(threadingRow, threadingMetrics);
                        var reasons = getTopReasons(threadingRow, threadingMetrics);
                        return bands ? (React.createElement(React.Fragment, null,
                            React.createElement(antd_1.Divider, null),
                            React.createElement(antd_1.Row, { gutter: 12 },
                                React.createElement(antd_1.Col, { span: 12 },
                                    React.createElement(antd_1.Typography.Text, { type: "secondary" }, "\u6A21\u5177\u7570\u5E38\u4E3B\u8981\u539F\u56E0 Top3"),
                                    React.createElement("ul", { className: "text-sm mt-1", style: { paddingLeft: 20 } }, reasons.map(function (r) { return (React.createElement("li", { key: r.name },
                                        r.name,
                                        "\uFF08",
                                        r.pct,
                                        "%\uFF09")); })))))) : null;
                    })(),
                    React.createElement(antd_1.Divider, null),
                    React.createElement(antd_1.Row, { gutter: 12 },
                        React.createElement(antd_1.Col, { span: 12 },
                            React.createElement(antd_1.Typography.Text, { type: "secondary" }, "\u5065\u5EB7\u5EA6\u8DA8\u52E2\uFF0814 \u5929\uFF09"),
                            React.createElement("div", { style: { height: 200 } },
                                React.createElement(recharts_1.ResponsiveContainer, { width: "200%", height: "100%" },
                                    React.createElement(recharts_1.AreaChart, { data: (_k = threadingMetrics === null || threadingMetrics === void 0 ? void 0 : threadingMetrics.trend) !== null && _k !== void 0 ? _k : [], margin: { left: 0, right: 0, top: 10, bottom: 0 } },
                                        React.createElement("defs", null,
                                            React.createElement("linearGradient", { id: "t", x1: "0", y1: "0", x2: "0", y2: "1" },
                                                React.createElement("stop", { offset: "5%", stopColor: "#82ca9d", stopOpacity: 0.6 }),
                                                React.createElement("stop", { offset: "95%", stopColor: "#82ca9d", stopOpacity: 0.1 }))),
                                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                        React.createElement(recharts_1.XAxis, { dataKey: "day", tick: { fontSize: 12 } }),
                                        React.createElement(recharts_1.YAxis, { tick: { fontSize: 12 }, domain: [0, 100] }),
                                        React.createElement(recharts_1.Tooltip, null),
                                        React.createElement(recharts_1.Area, { type: "monotone", dataKey: "health", stroke: "#82ca9d", fillOpacity: 1, fill: "url(#t)" })))))),
                    React.createElement(antd_1.Divider, null),
                    React.createElement(antd_1.Space, { wrap: true },
                        React.createElement(antd_1.Tag, { color: ((_l = threadingMetrics === null || threadingMetrics === void 0 ? void 0 : threadingMetrics.health) !== null && _l !== void 0 ? _l : 0) > 70 ? 'green' : 'orange' },
                            "\u5065\u5EB7\u5EA6 ",
                            ((_m = threadingMetrics === null || threadingMetrics === void 0 ? void 0 : threadingMetrics.health) !== null && _m !== void 0 ? _m : 0).toFixed(1),
                            " / 100"),
                        threadingRow && React.createElement(antd_1.Tag, null,
                            "\u5DE5\u55AE ",
                            threadingRow.order),
                        threadingRow && React.createElement(antd_1.Tag, null,
                            "\u6A21\u5177 ",
                            threadingRow.moldId),
                        React.createElement(antd_1.Tag, { color: "geekblue" },
                            "\u8CC7\u6599\u66F4\u65B0 ",
                            now.toLocaleDateString()))))),
        React.createElement(antd_1.Row, { gutter: [16, 16], className: "mt-4" },
            React.createElement(antd_1.Col, { xs: 24, lg: 12 },
                React.createElement(antd_1.Card, { title: React.createElement(antd_1.Space, null,
                        React.createElement(lucide_react_1.CalendarDays, { size: 18 }),
                        "\u6253\u982D \u2014 \u4FDD\u990A/\u66F4\u63DB\u5EFA\u8B70") }, (function () {
                    var adv = getAdvice(headingRow, headingMetrics);
                    return adv ? (React.createElement(React.Fragment, null,
                        React.createElement(antd_1.Space, { wrap: true },
                            React.createElement(antd_1.Tag, { color: adv.priority === '高' ? 'red' : adv.priority === '中' ? 'orange' : 'green' },
                                adv.priority,
                                " \u512A\u5148"),
                            React.createElement(antd_1.Tag, { color: "blue" },
                                "\u5EFA\u8B70\uFF1A",
                                adv.action),
                            React.createElement(antd_1.Tag, { icon: React.createElement(lucide_react_1.Clock, { size: 14 }) }, adv.window)),
                        React.createElement(antd_1.Divider, null),
                        React.createElement(antd_1.Typography.Text, { strong: true }, "\u7406\u7531"),
                        React.createElement("ul", { style: { marginTop: 8, paddingLeft: 20 } }, adv.reasons.map(function (r) { return React.createElement("li", { key: r, className: "text-gray-600" }, r); })),
                        React.createElement(antd_1.Divider, null),
                        React.createElement(antd_1.Typography.Text, { strong: true }, "\u5099\u4EF6/\u6A21\u5177"),
                        React.createElement(antd_1.Space, { wrap: true, style: { marginTop: 8 } }, adv.spares.map(function (s) { return React.createElement(antd_1.Tag, { key: s }, s); })))) : React.createElement(antd_1.Typography.Text, { type: "secondary" }, "\u5C1A\u7121\u5EFA\u8B70");
                })())),
            React.createElement(antd_1.Col, { xs: 24, lg: 12 },
                React.createElement(antd_1.Card, { title: React.createElement(antd_1.Space, null,
                        React.createElement(lucide_react_1.CalendarDays, { size: 18 }),
                        "\u6413\u7259 \u2014 \u4FDD\u990A/\u66F4\u63DB\u5EFA\u8B70") }, (function () {
                    var adv = getAdvice(threadingRow, threadingMetrics);
                    return adv ? (React.createElement(React.Fragment, null,
                        React.createElement(antd_1.Space, { wrap: true },
                            React.createElement(antd_1.Tag, { color: adv.priority === '高' ? 'red' : adv.priority === '中' ? 'orange' : 'green' },
                                adv.priority,
                                " \u512A\u5148"),
                            React.createElement(antd_1.Tag, { color: "blue" },
                                "\u5EFA\u8B70\uFF1A",
                                adv.action),
                            React.createElement(antd_1.Tag, { icon: React.createElement(lucide_react_1.Clock, { size: 14 }) }, adv.window)),
                        React.createElement(antd_1.Divider, null),
                        React.createElement(antd_1.Typography.Text, { strong: true }, "\u7406\u7531"),
                        React.createElement("ul", { style: { marginTop: 8, paddingLeft: 20 } }, adv.reasons.map(function (r) { return React.createElement("li", { key: r, className: "text-gray-600" }, r); })),
                        React.createElement(antd_1.Divider, null),
                        React.createElement(antd_1.Typography.Text, { strong: true }, "\u5099\u4EF6/\u6A21\u5177"),
                        React.createElement(antd_1.Space, { wrap: true, style: { marginTop: 8 } }, adv.spares.map(function (s) { return React.createElement(antd_1.Tag, { key: s }, s); })))) : React.createElement(antd_1.Typography.Text, { type: "secondary" }, "\u5C1A\u7121\u5EFA\u8B70");
                })()))),
        React.createElement(antd_1.Row, { gutter: [16, 16], className: "mt-4" },
            React.createElement(antd_1.Col, { xs: 24, lg: 10 },
                React.createElement(antd_1.Card, { title: React.createElement(antd_1.Space, null,
                        React.createElement(lucide_react_1.AlertTriangle, { size: 18 }),
                        "\u6A21\u5177\u4E3B\u8981\u5931\u6548\u6A21\u5F0F\uFF08FMECA\uFF09") }, ['崩角/裂紋', '磨耗超限', '變形'].map(function (m, idx) {
                    var item = failureModes[idx];
                    return (React.createElement("div", { key: m, className: "mb-3" },
                        React.createElement(antd_1.Space, { align: "center" },
                            React.createElement(antd_1.Badge, { color: "red" }),
                            React.createElement(antd_1.Typography.Text, { strong: true }, item.mode),
                            React.createElement(antd_1.Tag, { color: "red" },
                                "\u98A8\u96AA\u6B0A\u91CD ",
                                (item.weight * 100).toFixed(0),
                                "%")),
                        React.createElement("div", { className: "text-gray-500 text-sm mt-1" },
                            "\u4E3B\u8981\u5F71\u97FF\u56E0\u5B50\uFF1A",
                            item.contrib.join('、')),
                        React.createElement(antd_1.Progress, { percent: Math.round(item.weight * 100), status: item.weight > 0.4 ? 'exception' : 'active' })));
                }))),
            React.createElement(antd_1.Col, { xs: 24, lg: 14 },
                React.createElement(antd_1.Card, { title: React.createElement(antd_1.Space, null,
                        React.createElement(lucide_react_1.Activity, { size: 18 }),
                        "\u54C1\u8CEA vs \u6CE2\u578B\u7279\u5FB5") },
                    React.createElement("div", { style: { height: 260 } },
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: "100%" },
                            React.createElement(recharts_1.BarChart, { data: ((_o = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.trend) !== null && _o !== void 0 ? _o : []).map(function (d) { return ({ day: d.day, NG: Math.max(0, 5 - d.health / 25), Load: d.force }); }) },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                React.createElement(recharts_1.XAxis, { dataKey: "day" }),
                                React.createElement(recharts_1.YAxis, null),
                                React.createElement(recharts_1.Tooltip, null),
                                React.createElement(recharts_1.Legend, null),
                                React.createElement(recharts_1.Bar, { dataKey: "NG", fill: "#ff7f7f", name: "\u4E0D\u826F\u7387(%)" }),
                                React.createElement(recharts_1.Bar, { dataKey: "Load", fill: "#82ca9d", name: "\u6CE2\u578B\u7279\u5FB5(\u55AE\u4F4D\u5316)" }))))))),
        React.createElement(antd_1.Row, { gutter: [16, 16], className: "mt-4" },
            React.createElement(antd_1.Col, { xs: 24 },
                React.createElement(antd_1.Card, { title: React.createElement(antd_1.Space, null,
                        React.createElement(lucide_react_1.Gauge, { size: 18 }),
                        "\u73FE\u884C\u751F\u7522\u4E2D \u2014 \u5DE5\u55AE/\u6A5F\u53F0/\u6A21\u5177\uFF08\u9EDE\u9078\u5207\u63DB\u4E0A\u65B9\u8996\u5716\uFF09"), extra: React.createElement(antd_1.Space, null,
                        React.createElement(lucide_react_1.MousePointerClick, { size: 16 }),
                        "\u9EDE\u9078\u4EFB\u4E00\u5217") },
                    React.createElement(antd_1.Table, { columns: columns, dataSource: workOrders, pagination: { pageSize: 8 }, size: "small", rowClassName: function (record) { return record.key === selectedKey ? 'bg-blue-50' : ''; }, onRow: function (record) { return ({
                            onClick: function () {
                                setSelectedKey(record.key);
                                if (record.process === '打頭') {
                                    setSelectedHeadingKey(record.key);
                                }
                                else if (record.process === '搓牙') {
                                    setSelectedThreadingKey(record.key);
                                }
                            }
                        }); }, loading: loading })))),
        React.createElement(antd_1.Typography.Paragraph, { className: "text-gray-400 text-xs mt-4" }, "\u8A3B\uFF1ARUL\uFF08Remaining Useful Life\uFF09= \u9810\u6E2C\u5269\u9918\u53EF\u7528\u58FD\u547D\uFF1B\u5065\u5EB7\u5EA6\u4EE5 0\u2013100 \u986F\u793A\u3002")));
}
exports["default"] = AIForgingThreadingSuite;
