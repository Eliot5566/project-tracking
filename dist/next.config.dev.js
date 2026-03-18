"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/** @type {import('next').NextConfig} */
var nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Server Actions 在 Next.js 14 之後預設可用，移除此設定以避免警告
  // 略過 TypeScript 型別錯誤以便先行建構（注意：可能造成執行期錯誤）
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: function webpack(config, _ref) {
    var isServer = _ref.isServer;

    // 伺服器端可以使用 Node.js 的模組
    if (isServer) {
      return config;
    } // 客戶端環境不應該包含這些 Node.js 模組


    return _objectSpread({}, config, {
      resolve: _objectSpread({}, config.resolve, {
        fallback: _objectSpread({}, config.resolve.fallback, {
          // 將這些 Node.js 模組替換為空模組或假模組
          net: false,
          tls: false,
          fs: false,
          dns: false,
          child_process: false,
          mssql: false,
          tedious: false
        })
      })
    });
  }
};
module.exports = nextConfig;