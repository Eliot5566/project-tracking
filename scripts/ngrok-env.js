#!/usr/bin/env node
/**
 * 自動偵測本機執行中的 ngrok http 3000，將 public_url 寫入 .env.local：
 * RP_ID / ORIGIN 都設為該 host。
 * 若未啟動 ngrok，可選擇自動啟動 (需要本機已全域安裝 ngrok 或在 devDependencies)。
 */
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  let apiJSON = null;
  try {
    const raw = execSync('curl -s http://127.0.0.1:4040/api/tunnels');
    apiJSON = JSON.parse(raw.toString());
  } catch {
    console.log('[ngrok-env] 無法連線 4040，可能尚未啟動 ngrok。');
  }
  if (!apiJSON || !apiJSON.tunnels || !apiJSON.tunnels.length) {
    console.log(
      '[ngrok-env] 尚未偵測到 tunnels。請先手動執行: npx ngrok http 3000'
    );
    process.exit(0);
  }
  const httpTunnel =
    apiJSON.tunnels.find((t) => t.proto === 'https') || apiJSON.tunnels[0];
  if (!httpTunnel || !httpTunnel.public_url) {
    console.log('[ngrok-env] 找不到 public_url');
    process.exit(1);
  }
  const publicUrl = httpTunnel.public_url; // e.g. https://xxxx.ngrok-free.app
  const host = publicUrl.replace(/^https?:\/\//, '');
  const envPath = path.join(process.cwd(), '.env.local');
  let lines = [];
  if (fs.existsSync(envPath)) {
    lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  }
  const kv = Object.fromEntries(lines.filter(Boolean).map((l) => l.split('=')));
  kv.RP_ID = host;
  kv.ORIGIN = publicUrl;
  const out = Object.entries(kv)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  fs.writeFileSync(envPath, out + '\n', 'utf8');
  console.log('[ngrok-env] 已更新 .env.local:');
  console.log(out);
}
main();
