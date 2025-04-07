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
exports.useTaskContext = exports.TaskProvider = void 0;
var react_1 = require("react");
var TaskReducer_1 = require("./TaskReducer");
var TaskContext = react_1.createContext(undefined);
exports.TaskProvider = function (_a) {
    var children = _a.children;
    var _b = react_1.useReducer(TaskReducer_1.taskReducer, TaskReducer_1.initialTaskState), state = _b[0], dispatch = _b[1];
    // 取得任務
    var fetchTasks = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dispatch({ type: 'FETCH_TASKS_REQUEST' });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/tasks')];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    dispatch({ type: 'FETCH_TASKS_SUCCESS', payload: data.tasks });
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    dispatch({ type: 'FETCH_TASKS_FAILURE', payload: '取得任務失敗' });
                    console.error(err_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // 新增任務
    var createTask = function (task) { return __awaiter(void 0, void 0, void 0, function () {
        var res, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/tasks', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(task)
                        })];
                case 1:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error('新增失敗');
                    // 可以再呼叫 fetchTasks() 或根據回傳結果更新 state
                    return [4 /*yield*/, fetchTasks()];
                case 2:
                    // 可以再呼叫 fetchTasks() 或根據回傳結果更新 state
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error(err_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // 更新任務
    var updateTask = function (id, updates) { return __awaiter(void 0, void 0, void 0, function () {
        var res, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/tasks/" + id, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updates)
                        })];
                case 1:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error('更新失敗');
                    return [4 /*yield*/, fetchTasks()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    console.error(err_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // 刪除任務
    var deleteTask = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var res, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/tasks/" + id, { method: 'DELETE' })];
                case 1:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error('刪除失敗');
                    return [4 /*yield*/, fetchTasks()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_4 = _a.sent();
                    console.error(err_4);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // 可以在這裡決定是否一進入頁面就要自動 fetchTasks
    react_1.useEffect(function () {
        fetchTasks();
    }, []);
    var value = __assign(__assign({}, state), { fetchTasks: fetchTasks,
        createTask: createTask,
        updateTask: updateTask,
        deleteTask: deleteTask });
    return react_1["default"].createElement(TaskContext.Provider, { value: value }, children);
};
exports.useTaskContext = function () {
    var ctx = react_1.useContext(TaskContext);
    if (!ctx) {
        throw new Error('useTaskContext 必須在 TaskProvider 中使用');
    }
    return ctx;
};
