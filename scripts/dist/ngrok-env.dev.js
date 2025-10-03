#!/usr/bin/env node

/**
 * 自動偵測本機執行中的 ngrok http 3000，將 public_url 寫入 .env.local：
 * RP_ID / ORIGIN 都設為該 host。
 * 若未啟動 ngrok，可選擇自動啟動 (需要本機已全域安裝 ngrok 或在 devDependencies)。
 */
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _require = require('child_process'),
    execSync = _require.execSync,
    spawn = _require.spawn;

var fs = require('fs');

var path = require('path');

function main() {
  var apiJSON, raw, httpTunnel, publicUrl, host, envPath, lines, kv, out;
  return regeneratorRuntime.async(function main$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          apiJSON = null;

          try {
            raw = execSync('curl -s http://127.0.0.1:4040/api/tunnels');
            apiJSON = JSON.parse(raw.toString());
          } catch (_unused) {
            console.log('[ngrok-env] 無法連線 4040，可能尚未啟動 ngrok。');
          }

          if (!apiJSON || !apiJSON.tunnels || !apiJSON.tunnels.length) {
            console.log('[ngrok-env] 尚未偵測到 tunnels。請先手動執行: npx ngrok http 3000');
            process.exit(0);
          }

          httpTunnel = apiJSON.tunnels.find(function (t) {
            return t.proto === 'https';
          }) || apiJSON.tunnels[0];

          if (!httpTunnel || !httpTunnel.public_url) {
            console.log('[ngrok-env] 找不到 public_url');
            process.exit(1);
          }

          publicUrl = httpTunnel.public_url; // e.g. https://xxxx.ngrok-free.app

          host = publicUrl.replace(/^https?:\/\//, '');
          envPath = path.join(process.cwd(), '.env.local');
          lines = [];

          if (fs.existsSync(envPath)) {
            lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
          }

          kv = Object.fromEntries(lines.filter(Boolean).map(function (l) {
            return l.split('=');
          }));
          kv.RP_ID = host;
          kv.ORIGIN = publicUrl;
          out = Object.entries(kv).map(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                k = _ref2[0],
                v = _ref2[1];

            return "".concat(k, "=").concat(v);
          }).join('\n');
          fs.writeFileSync(envPath, out + '\n', 'utf8');
          console.log('[ngrok-env] 已更新 .env.local:');
          console.log(out);

        case 17:
        case "end":
          return _context.stop();
      }
    }
  });
}

main();