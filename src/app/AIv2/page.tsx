"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Row, Col, Table, Tag, Space, Statistic, Divider, Progress, Badge, Button, Segmented } from 'antd';
import { Hammer, Wrench, Gauge, AlertTriangle, Activity, MousePointerClick, Clock, CalendarDays } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar, Legend } from 'recharts';

// ===== 假資料（可日後改為 API 串接） =====
const now = new Date();
const seededRand = (seed: number) => {
  // 簡單可重現亂數（展示用）
  const x = Math.sin(seed) * 10000;
  // sin代表值範圍在 -1 到 1 之間 .sin會回傳一個介於 -1 和 1 之間的值
  return x - Math.floor(x);
};
// makeTrend 假資料
const makeTrend = (seed = 1, days = 14, start = 95, slope = -2) =>
  Array.from({ length: days }).map((_, i) => ({
    day: `D${i + 1}`,
    health: Math.max(0, start + slope * i + (seededRand(seed + i) - 0.5) * 3),
    temp: 35 + seededRand(seed + i * 2) * 10,
    force: 12 + seededRand(seed + i * 3) * 4,
  }));

// 主要失效模式描述
const failureModes = [
  { mode: '崩角/裂紋', weight: 0.42, contrib: ['起牙處彎曲', '底屑毛邊', '牙長超出'] },
  { mode: '磨耗超限', weight: 0.35, contrib: ['總衝次(Shots)', '潤滑不良', '切屑堵塞'] },
  { mode: '部分變形', weight: 0.23, contrib: ['出牙距不足', '牙型負載', '攻速異常'] },
];

// RawWO 型別定義   定義機台、狀態和訂單號
type RawWO = { machine: string; status: number; orderNo: string };
type EnrichedWO = {
  key: number;
  process: '打頭' | '搓牙';
  machine: string;
  order: string;
  toolName: string;
  toolNo: string;
  moldId: string;
  life: number;
  start: number;
  prod: number;
  total: number;
};

const inferProcess = (machine: string): '打頭' | '搓牙' => {
  // 範例：A/D 打頭、B/C 搓牙（可依實際規則調整）
  const c = machine?.[0]?.toUpperCase?.() || 'A';
  return (c === 'A' || c === 'D') ? '打頭' : '搓牙';
};

const fakeCatalog = [
  { toolName: 'A_主模具', toolNo: 'MISCZ0813' },
  { toolName: 'M_牙板(下牙板)', toolNo: 'MISCT552' },
  { toolName: 'A_主模具', toolNo: 'MISCXA03' },
  { toolName: 'M_牙板(上牙板)', toolNo: 'MISCU777' },
];

// enrich 函數 用於擴充 RawWO 資料
const enrich = (rows: RawWO[]): EnrichedWO[] => rows.map((r, idx) => {
  const catalog = fakeCatalog[(idx + r.machine.length) % fakeCatalog.length];
//   const life = 1_000_000; // 假壽命
 const life = 1_073_127; // 假壽命 
  const start = Math.floor(20_000 + (idx * 7_000) % 100_000);
  const prod = Math.floor( (idx * 1_337) % 3_000 );
  const total = start + prod;

  // 模具編號
  const moldId = `${catalog.toolNo}_${String(((idx % 12) + 1)).padStart(2,'0')}`;
  return {
    key: idx + 1,
    process: inferProcess(r.machine),
    machine: r.machine,
    order: r.orderNo,
    toolName: catalog.toolName,
    toolNo: catalog.toolNo,
    moldId,
    life,
    start,
    prod,
    total,
  };
});

// 依健康度/趨勢/RUL 產生保養/更換建議
const getAdvice = (row: EnrichedWO | null, metrics: any) => {
  if (!row || !metrics) return null;
  const maxHours = row.process === '搓牙' ? 672 : 672; //預設壽命上限 打頭、搓牙672小時
  const d14 = Math.max(0, Math.min(100, metrics.health ?? 0)); // .health
  const d1 = Math.max(0, Math.min(100, metrics.trend?.[0]?.health ?? d14));
  const dailyDrop = (d1 - d14) / 13; // 每日下降幅度 avg
  const reasons: string[] = [];

  // 閾值（可微調）
  const urgentHourThresh = Math.max(16, Math.floor(maxHours * 0.15)); // 最低 16 小時或 15% 用於緊急更換
  const planHourThresh = Math.floor(maxHours * 0.4); // 最低 40% 或 16 小時 用於計畫保養

  let action: '立即更換' | '計畫保養' | '正常巡檢' = '正常巡檢';
  let priority: '高' | '中' | '低' = '低';
  let window = '依排程巡檢';

  // 如果D14 壽命低於 25%  或是 RUL 小於緊急閾值 或 日降幅過大
  if (d14 <= 25 || metrics.rulHours <= urgentHourThresh || dailyDrop >= 8) {
    action = '立即更換';
    priority = '高';
    window = '24–48 小時內';
    if (d14 <= 25) reasons.push('健康度低於 25%');
    if (metrics.rulHours <= urgentHourThresh) reasons.push(`剩餘小時 ≤ ${urgentHourThresh}h`);
    if (dailyDrop >= 8) reasons.push('健康度日降幅 ≥ 8%');
  } else if (d14 <= 60 || metrics.rulHours <= planHourThresh || dailyDrop >= 3) {
    action = '計畫保養';
    priority = '中';
    window = '本週內安排';
    if (d14 <= 60) reasons.push('健康度低於 60%');
    if (metrics.rulHours <= planHourThresh) reasons.push(`剩餘小時 ≤ ${planHourThresh}h`);
    if (dailyDrop >= 3) reasons.push('健康度日降幅 ≥ 3%');
  }

  return {
    action,
    priority,
    window,
    reasons,
    spares: [
      `${row.toolName}`,
      `料號 ${row.toolNo}`,
      `模具 ${row.moldId}`,
    ],
  };
};

// 信心度區間：依 conf 給出 D14 健康度與 RUL 的區間
const getConfidenceBands = (row: EnrichedWO | null, metrics: any) => {
  if (!row || !metrics) return null;
  const life = Math.max(1, row.life);
  const maxHours = row.process === '搓牙' ? 672 : 672;
  const centerHealth = Math.max(0, Math.min(100, metrics.health ?? 0));
  const conf = Math.max(0, Math.min(1, metrics.conf ?? 0.85));
  // conf 越高，區間越窄（±5% ~ ±10%）
  const halfWidth = 0.10 - (conf - 0.8) * 0.1; // conf=0.8→±10%，conf=0.9→±0%
  const hw = Math.max(0.03, Math.min(0.10, halfWidth));
  const lowH = Math.max(0, centerHealth - hw * 100);
  const highH = Math.min(100, centerHealth + hw * 100);
  const lowRatio = lowH / 100;
  const highRatio = highH / 100;
  return {
    healthLow: Math.round(lowH),
    healthHigh: Math.round(highH),
    shotsLow: Math.round(life * lowRatio),
    shotsHigh: Math.round(life * highRatio),
    hoursLow: Math.round(maxHours * lowRatio),
    hoursHigh: Math.round(maxHours * highRatio),
  };
};

// 理由 Top3（風險貢獻因子）：以 FMECA 三大失效模式 + 基準權重，結合即時訊號分數
const getTopReasons = (row: EnrichedWO | null, metrics: any) => {
  if (!row || !metrics) return [] as Array<{ name: string; score: number; pct: number }>;
  const tr = (metrics.trend ?? []) as Array<{ health: number; temp: number; force: number; day: string }>;
  const n = tr.length;
  const k = Math.max(1, Math.min(5, n));
  const tail = tr.slice(-k);
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : 0);
  const avgForce = avg(tail.map(d=>d.force)); // 期望在 12~16
  const avgTemp = avg(tail.map(d=>d.temp));   // 期望在 35~45
  const avgHealth = avg(tail.map(d=>d.health));
  const avgNG = Math.max(0, 5 - avgHealth/25); // 與圖表一致的粗略 NG 估計
  const usedRatio = Math.min(1, Math.max(0, (row.total ?? 0) / Math.max(1, row.life))); // 使用比例

  // 訊號風險分數（0~1）
  const forceScore = Math.min(1, Math.max(0, (avgForce - 12) / 4)); // 峰值力/負載
  const tempScore  = Math.min(1, Math.max(0, (avgTemp  - 35) / 10)); // 週期溫升
  const wearScore  = usedRatio;                                      // 磨耗（使用比例）
  const roughScore = Math.min(1, avgNG / 5);                         // 表面粗糙度（以 NG 近似）

  // 以提供的三大失效模式為核心，並將基準權重與即時訊號做加權融合
  // 融合方式：final = clamp( baseWeight*0.6 + proxyScore*0.4 )
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  const modes = failureModes.map((fm) => {
    let proxy = 0;
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
    const final = clamp01(fm.weight * 0.6 + proxy * 0.4);
    return {
      name: `${fm.mode}（因子：${fm.contrib.join('、')}）`,
      score: final,
    };
  });

  // 取 Top3 後進行正規化，讓百分比加總為 100%
  const top3 = modes.sort((a,b)=>b.score-a.score).slice(0,3);
  const sum = top3.reduce((acc, cur) => acc + cur.score, 0);

  if (sum <= 0) {
    // 全為 0 時，平均分配（34/33/33）
    const base = [34, 33, 33];
    return top3.map((r, i) => ({ name: r.name, score: 1/3, pct: base[i] }));
  }

  const normalized = top3.map(r => ({ name: r.name, score: r.score / sum }));
  const floors = normalized.map(r => ({ ...r, pct: Math.floor(r.score * 100), frac: (r.score * 100) - Math.floor(r.score * 100) }));
  let remain = 100 - floors.reduce((a,b)=>a + b.pct, 0);
  // 依小數部分由大到小補齊 100%
  floors.sort((a,b)=> b.frac - a.frac);
  for (let i=0; i<floors.length && remain>0; i++) { floors[i].pct += 1; remain -= 1; }
  // 回復原順序（以名稱配對）
  const pctMap = new Map(floors.map(f => [f.name, f.pct] as const));
  return top3.map(r => ({ name: r.name, score: (r.score / sum), pct: pctMap.get(r.name) ?? Math.round((r.score/sum)*100) }));
};

// 由工單行產生 RUL/健康度估計（展示用簡化公式，健康度與 RUL 勾稽）
const deriveMetrics = (row: any) => {
  if (!row) return null;
  const life = Math.max(1, row.life); // 壽命
  const remainingShots = Math.max(0, row.life - row.total); // 剩餘衝次
  const remainRatio = Math.max(0, Math.min(1, remainingShots / life)); // 剩餘比例
  // 勾稽：健康度 = (剩餘衝次 / 壽命) * 100
  const baseHealth = Math.round(remainRatio * 100);
  const seed = row.machine.charCodeAt(0) + row.machine.charCodeAt(row.machine.length - 1);
  // 趨勢校正：第 14 天健康度 = 第 1 天健康度 × factor（factor ∈ [0.5, 0.6]）
  const days = 14;
  const factor = 0.5 + seededRand(seed * 13) * 0.1; // 0.5 ~ 0.6
  const targetEnd = Math.max(0, Math.min(100, baseHealth * factor));
  const slope = (targetEnd - baseHealth) / (days - 1);
  const trend = makeTrend(seed, days, baseHealth, slope);
  // 以第 14 天的健康度比例勾稽 RUL，確保 75% => 750,000 隻
  const lastHealth = Math.max(0, Math.min(100, trend.at(-1)?.health ?? baseHealth));
  // 使用最後一天健康度 .Math.min(100, trend.at(-1):.health ?? baseHealth)
  const finalRemainRatio = lastHealth / 100;
  const rulShots = Math.round(life * finalRemainRatio);
  // 調整：以製程分流估算剩餘小時，並加入合理上限（搓牙<=120h，打頭<=240h），同樣用第 14 天比例
  const maxHours = row.process === '搓牙' ? 672 : 672;
  const rulHours = Math.round(maxHours * finalRemainRatio);
  const conf = 0.82 + seededRand(seed) * 0.15; // 0.82~0.97
  return { trend, rulShots, rulHours, conf, health: lastHealth };
};

// ===== 表格欄位：整合 RUL / 健康度 / 使用比例 =====
const buildColumns = (getHealthForRow: (r: any)=>number, getRULForRow: (r: any)=>number) => [
  { title: '製程', dataIndex: 'process', key: 'process', render: (t: string) => <Tag color={t==='打頭'? 'blue':'volcano'}>{t}</Tag> },
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
  { title: '健康度', key: 'health', render: (_: any, r: any) => {
      const h = getHealthForRow(r); // 健康度
      return <Progress percent={Math.round(h)} size="small" status={h>30? 'active':'exception'} />
    }
  },
  { title: '預測剩餘壽命(衝次)', key: 'rul', render: (_: any, r: any) => getRULForRow(r) },
];

export default function AIForgingThreadingSuite() {
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState<EnrichedWO[]>([]);
  const [viewMode, setViewMode] = useState<'visual'|'list'>('visual');
  const [focusProcess, setFocusProcess] = useState<'all' | '打頭' | '搓牙'>('all');
  // 表格高亮的最後點選列（僅用於 UI 高亮，不影響面板資料）
  const [selectedKey, setSelectedKey] = useState<number | null>(null);
  // 打頭/搓牙各自獨立的選取鍵，避免點選一方影響另一方的面板
  const [selectedHeadingKey, setSelectedHeadingKey] = useState<number | null>(null);
  const [selectedThreadingKey, setSelectedThreadingKey] = useState<number | null>(null);


  // 載入：從 API 取得清單並補充假欄位
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/ai/workorders', { cache: 'no-store' });
        const json = await res.json();
        const base: RawWO[] = json?.data || []; //RawWO[]是一個型別定義，表示一個包含機器、狀態和訂單號的物件陣列
        const enriched = enrich(base);
        setWorkOrders(enriched);
        setSelectedKey(enriched[0]?.key ?? null);
        setSelectedHeadingKey(enriched.find(w=>w.process==='打頭')?.key ?? enriched[0]?.key ?? null);
        setSelectedThreadingKey(enriched.find(w=>w.process==='搓牙')?.key ?? enriched[0]?.key ?? null);
      } catch (e) {
        // 若 API 失敗，退回到內建少量假資料
        const fallback = enrich([
          { machine: 'A101', status: 1, orderNo: 'J512-25080228' },
          { machine: 'A104', status: 1, orderNo: 'J512-25060262' },
          { machine: 'B104', status: 3, orderNo: 'J512-25060212' },
          { machine: 'C107', status: 3, orderNo: 'J512-25060102' },
          { machine: 'D106', status: 1, orderNo: 'J512-25070475' },
        ]);
        setWorkOrders(fallback);
        setSelectedKey(fallback[0]?.key ?? null);
        setSelectedHeadingKey(fallback.find(w=>w.process==='打頭')?.key ?? fallback[0]?.key ?? null);
    //  setSelectedHeadingKey(fallback.find(w=>w.process==='打頭')?.key ?? fallback[0]?.key ?? null);
        setSelectedThreadingKey(fallback.find(w=>w.process==='搓牙')?.key ?? fallback[0]?.key ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const headingRow = useMemo(() => (
    workOrders.find(w => w.key === selectedHeadingKey) ?? workOrders.find(w => w.process === '打頭') ?? null
  ), [selectedHeadingKey]);
  const threadingRow = useMemo(() => (
    workOrders.find(w => w.key === selectedThreadingKey) ?? workOrders.find(w => w.process === '搓牙') ?? null
  ), [selectedThreadingKey]);

  const headingMetrics = useMemo(() => deriveMetrics(headingRow), [headingRow]);
  const threadingMetrics = useMemo(() => deriveMetrics(threadingRow), [threadingRow]);

  const columns = useMemo(() => buildColumns(
    (r) => deriveMetrics(r)?.health ?? 0,
    (r) => deriveMetrics(r)?.rulShots ?? 0
  ), []);

  // ===== 視覺化輔助：依區域分組與健康度上色 =====
  const getArea = (machine: string) => (machine?.[0]?.toUpperCase?.() ?? 'A');  
  const colorFromHealth = (h: number | null | undefined) => {
    const v = typeof h === 'number' ? h : -1;
    if (v < 0) return { bg: '#9e9e9e', fg: '#ffffff' }; // 灰：未知
    if (v <= 30) return { bg: '#ff4d4f', fg: '#ffffff' }; // 紅：0~60
    if (v <= 50) return { bg: '#ffeb3b', fg: '#333333' }; // 黃：61~80
    return { bg: '#155724', fg: '#ffffff' };              // 綠：81+
  };
  const areaOrder = ['A','B','C','D'];
  // 產生機台序列（降冪顯示，符合圖示從上到下）
  const gen = (prefix: string, start: number, end: number) => {
    const arr: string[] = [];
    for (let n = end; n >= start; n--) arr.push(`${prefix}${n}`);
    return arr;
  };
  // 完整版位模板（依你提供的正確機台清單）
  const areaTemplates: Record<string, { left: string[]; right: string[] }> = {
    // Area A：左 A212→A201，右 A112→A101
    A: {
      left: ['A212','A211','A210','A209','A208','A207','A206','A205','A204','A203','A202','A201'],
      right:['A112','A111','A110','A109','A108','A107','A106','A105','A104','A103','A102','A101']
    },
    // Area B：左 B214→B202，右側僅 B109 / B107 / B105 / B104 / B103
    B: {
      left: ['B214','B213','B212','B211','B210','B209','B208','B207','B206','B205','B204','B203','B202'],
      right:['B109','B107','B105','B104','B103']
    },
    // Area C：左 C214→C201，右 C114→C101（完整對稱）
    C: {
      left: ['C214','C213','C212','C211','C210','C209','C208','C207','C206','C205','C204','C203','C202','C201'],
      right:['C114','C113','C112','C111','C110','C109','C108','C107','C106','C105','C104','C103','C102','C101']
    },
    // Area D：左側 D209/D208/D207/D204/D203/D202/D201；右側 D110→D101
    D: {
      left: ['D209','D208','D207','D204','D203','D202','D201'],
      right:['D110','D109','D108','D107','D106','D105','D104','D103','D102','D101']
    },
  };
  const getRowByMachine = (code: string): EnrichedWO | null => (
    workOrders.find(w => w.machine === code) ?? null
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Typography.Title level={2}>模具預診系統 — MPDS (Mold Predictive Diagnosis System)</Typography.Title>
      <Typography.Paragraph>
        點選下方 <b>工單/機台</b> 任一列，上方的 <b>MPDS 總覽</b> 與 <b>趨勢圖</b> 將自動切換為該筆機台/模具的即時視圖。
      </Typography.Paragraph>
      {focusProcess !== 'all' && (
        <div style={{marginBottom:12}}>
          <Space>
            <Tag color="processing">目前焦點：{focusProcess}</Tag>
            <Button size="small" onClick={()=> setFocusProcess('all')}>顯示全部製程</Button>
          </Space>
        </div>
      )}

      {/* ===== RUL 總覽（上排） ===== */}
      <Row gutter={[16,16]}>
        {focusProcess !== '搓牙' && (
        <Col xs={24} lg={focusProcess==='打頭'?24:12}>
          <Card title={<Space><Hammer size={18}/>打頭模具 MPDS 總覽</Space>} extra={<Space><Tag color="blue">Heading</Tag>{headingRow && <Tag>{headingRow.machine}</Tag>}</Space>}>
            <Row gutter={12}>
              <Col span={8}><Statistic title="估計剩餘衝次" value={headingMetrics?.rulShots ?? 0} /></Col>
              <Col span={8}><Statistic title="估計剩餘小時" value={headingMetrics?.rulHours ?? 0} /></Col>
              <Col span={8}><Statistic title="信心度" value={Math.round((headingMetrics?.conf ?? 0)*100)} suffix="%" /></Col>
            </Row>
            {(() => {
              const bands = getConfidenceBands(headingRow as any, headingMetrics);
              const reasons = getTopReasons(headingRow as any, headingMetrics);
              return bands ? (
                <>
                  <Divider/>
                  <Row gutter={12}>
                    {/* <Col span={16}>
                      <Typography.Text type="secondary">信心度區間（健康度 / 衝次 / 小時）</Typography.Text>
                      <div className="text-sm mt-1">
                        <Tag>健康度 {bands.healthLow}% ~ {bands.healthHigh}%</Tag>
                        <Tag>衝次 {bands.shotsLow.toLocaleString()} ~ {bands.shotsHigh.toLocaleString()}</Tag>
                        <Tag>小時 {bands.hoursLow} ~ {bands.hoursHigh}</Tag>
                      </div>
                    </Col> */}
                    <Col span={12}>
                      <Typography.Text type="secondary">該模具異常主要原因 Top3</Typography.Text>
                      <ul className="text-sm mt-1" style={{paddingLeft:20}}>
                        {reasons.map(r=> (
                          <li key={r.name}>{r.name}（{r.pct}%）</li>
                        ))}
                      </ul>
                    </Col>
                  </Row> 
                </>
              ) : null;
            })()}
            <Divider/>

            <Row gutter={12}>
              <Col span={12}>
                <Typography.Text type="secondary">健康度趨勢（14 天）</Typography.Text>
                <div style={{height:200}}>
                  <ResponsiveContainer width="200%" height="100%">
                    <AreaChart data={headingMetrics?.trend ?? []} margin={{left:0,right:0,top:10,bottom:0}}>
                      <defs>
                        <linearGradient id="h" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0,100]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="health" stroke="#8884d8" fillOpacity={1} fill="url(#h)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Col>
              {/* <Col span={12}>
     
                <Typography.Text type="secondary">打擊力/溫度（特徵漂移）</Typography.Text>
                <div style={{height:200}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={headingMetrics?.trend ?? []} margin={{left:0,right:0,top:10,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="force" stroke="#111a14ff" dot={false} name="打擊力(kN)" />
                      <Line type="monotone" dataKey="temp" stroke="#8884d8" dot={false} name="溫度(°C)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Col> */}
            </Row>
            <Divider/>
            <Space wrap>
              <Tag color={(headingMetrics?.health ?? 0)>70? 'green':'orange'}>健康度 {(headingMetrics?.health ?? 0).toFixed(1)} / 100</Tag>
              {headingRow && <Tag>工單 {headingRow.order}</Tag>}
              {headingRow && <Tag>模具 {headingRow.moldId}</Tag>}
              <Tag color="geekblue">資料更新 {now.toLocaleDateString()}</Tag>
              {/* <Tag color="purple">模型：LSTM + XGBoost</Tag> */}
            </Space>
            
          </Card>
  </Col>
  )}

  {focusProcess !== '打頭' && (
  <Col xs={24} lg={focusProcess==='搓牙'?24:12}>
          <Card title={<Space><Wrench size={18}/>搓牙模具 MPDS 總覽</Space>} extra={<Space><Tag color="volcano">Threading</Tag>{threadingRow && <Tag>{threadingRow.machine}</Tag>}</Space>}>
            <Row gutter={12}>
              <Col span={8}><Statistic title="估計剩餘衝次" value={threadingMetrics?.rulShots ?? 0} /></Col>
              <Col span={8}><Statistic title="估計剩餘小時" value={threadingMetrics?.rulHours ?? 0} /></Col>
              <Col span={8}><Statistic title="信心度" value={Math.round((threadingMetrics?.conf ?? 0)*100)} suffix="%" /></Col>
            </Row>
            {(() => {
              const bands = getConfidenceBands(threadingRow as any, threadingMetrics);
              const reasons = getTopReasons(threadingRow as any, threadingMetrics);
              return bands ? (
                <>
                  <Divider/>
                  <Row gutter={12}>
                    {/* <Col span={16}>
                      <Typography.Text type="secondary">信心度區間（健康度 / 衝次 / 小時）</Typography.Text>
                      <div className="text-sm mt-1">
                        <Tag>健康度 {bands.healthLow}% ~ {bands.healthHigh}%</Tag>
                        <Tag>衝次 {bands.shotsLow.toLocaleString()} ~ {bands.shotsHigh.toLocaleString()}</Tag>
                        <Tag>小時 {bands.hoursLow} ~ {bands.hoursHigh}</Tag>
                      </div>
                    </Col> */}
                    <Col span={12}>
                      <Typography.Text type="secondary">該模具異常主要原因 Top3</Typography.Text>
                      <ul className="text-sm mt-1" style={{paddingLeft:20}}>
                        {reasons.map(r=> (
                          <li key={r.name}>{r.name}（{r.pct}%）</li>
                        ))}
                      </ul>
                    </Col>
                  </Row>
                </>
              ) : null;
            })()}
            <Divider/>
            <Row gutter={12}>
              <Col span={12}>

                <Typography.Text type="secondary">健康度趨勢（14 天）</Typography.Text>
                <div style={{height:200}}>
                  <ResponsiveContainer width="200%" height="100%">
                    <AreaChart data={threadingMetrics?.trend ?? []} margin={{left:0,right:0,top:10,bottom:0}}>
                      <defs>
                        <linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0,100]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="health" stroke="#82ca9d" fillOpacity={1} fill="url(#t)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Col>
              {/* <Col span={12}>
                <Typography.Text type="secondary">進刀負載/溫度（特徵漂移）</Typography.Text>
                <div style={{height:200}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={threadingMetrics?.trend ?? []} margin={{left:0,right:0,top:10,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="force" stroke="#82ca9d" dot={false} name="進刀負載(kN)" />
                      <Line type="monotone" dataKey="temp" stroke="#8884d8" dot={false} name="溫度(°C)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Col> */}
            </Row>
            <Divider/>
            <Space wrap>
              <Tag color={(threadingMetrics?.health ?? 0)>70? 'green':'orange'}>健康度 {(threadingMetrics?.health ?? 0).toFixed(1)} / 100</Tag>
              {threadingRow && <Tag>工單 {threadingRow.order}</Tag>}
              {threadingRow && <Tag>模具 {threadingRow.moldId}</Tag>}
              <Tag color="geekblue">資料更新 {now.toLocaleDateString()}</Tag>
              {/* <Tag color="purple">模型：Prophet + LightGBM</Tag> */}
            </Space>
          </Card>
  </Col>
  )}
      </Row>

      {/* ===== 保養/更換建議 ===== */}
      <Row gutter={[16,16]} className="mt-4">
        {focusProcess !== '搓牙' && (
        <Col xs={24} lg={focusProcess==='打頭'?24:12}>
          <Card title={<Space><CalendarDays size={18}/>打頭 — 保養/更換建議</Space>}>
            {(() => {
              const adv = getAdvice(headingRow as any, headingMetrics);
              return adv ? (
                <>
                  <Space wrap>
                    <Tag color={adv.priority==='高'?'red':adv.priority==='中'?'orange':'green'}>{adv.priority} 優先</Tag>
                    <Tag color="blue">建議：{adv.action}</Tag>
                    <Tag icon={<Clock size={14}/>}>{adv.window}</Tag>
                  </Space>
                  <Divider/>
                  <Typography.Text strong>理由</Typography.Text>
                  <ul style={{marginTop:8, paddingLeft:18}}>
                    {adv.reasons.map((r: string) => <li key={r} className="text-gray-600">{r}</li>)}
                  </ul>
                  <Divider/>
                  <Typography.Text strong>備件/模具</Typography.Text>
                  <Space wrap style={{marginTop:8}}>
                    {adv.spares.map((s: string) => <Tag key={s}>{s}</Tag>)}
                  </Space>
                </>
              ) : <Typography.Text type="secondary">尚無建議</Typography.Text>;
            })()}
          </Card>
        </Col>
        )}
        {focusProcess !== '打頭' && (
        <Col xs={24} lg={focusProcess==='搓牙'?24:12}>
          <Card title={<Space><CalendarDays size={18}/>搓牙 — 保養/更換建議</Space>}>
            {(() => {
              const adv = getAdvice(threadingRow as any, threadingMetrics);
              return adv ? (
                <>
                  <Space wrap>
                    <Tag color={adv.priority==='高'?'red':adv.priority==='中'?'orange':'green'}>{adv.priority} 優先</Tag>
                    <Tag color="blue">建議：{adv.action}</Tag>
                    <Tag icon={<Clock size={14}/>}>{adv.window}</Tag>
                  </Space>
                  <Divider/>
                  <Typography.Text strong>理由</Typography.Text>
                  <ul style={{marginTop:8, paddingLeft:18}}>
                    {adv.reasons.map((r: string) => <li key={r} className="text-gray-600">{r}</li>)}
                  </ul>
                  <Divider/>
                  <Typography.Text strong>備件/模具</Typography.Text>
                  <Space wrap style={{marginTop:8}}>
                    {adv.spares.map((s: string) => <Tag key={s}>{s}</Tag>)}
                  </Space>
                </>
              ) : <Typography.Text type="secondary">尚無建議</Typography.Text>;
            })()}
          </Card>
        </Col>
        )}
      </Row>

      {/* ===== 中排：失效模式 & 品質 vs 負載 ===== */}
      <Row gutter={[16,16]} className="mt-4">
        <Col xs={24} lg={10}>
          <Card title={<Space><AlertTriangle size={18}/>模具主要失效模式（FMECA）</Space>}>
            <Typography.Paragraph style={{marginTop:4}}>
              Failure Modes, Effects, and Criticality Analysis（失效模式、影響與關鍵度分析）：
              用於系統化識別「會怎麼壞」「影響多大」「優先處理哪裡」，並結合即時趨勢與 MPDS 制定保養/更換策略。
            </Typography.Paragraph>
            {['崩角/裂紋','磨耗超限','變形'].map((m, idx)=> {
              const item = failureModes[idx];
              return (
                <div key={m} className="mb-3">
                  <Space align="center">
                    <Badge color="red" />
                    <Typography.Text strong>{item.mode}</Typography.Text>
                    <Tag color="red">風險權重 {(item.weight*100).toFixed(0)}%</Tag>
                  </Space>
                  <div className="text-gray-500 text-sm mt-1">主要影響因子：{item.contrib.join('、')}</div>
                  <Progress percent={Math.round(item.weight*100)} status={item.weight>0.4? 'exception':'active'} />
                    {/* active會有動畫效果，exception會是紅色  來自 Ant Design */}
                </div>
              );
            })}
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title={<Space><Activity size={18}/>品質 vs 波型特徵</Space>}>
            <div style={{height:260}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(headingMetrics?.trend ?? []).map(d=>({ day:d.day, NG: Math.max(0, 5 - d.health/25), Load: d.force }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {/* <Bar dataKey="NG" fill="#ff7f7f" name="不良率(%)" />
                  <Bar dataKey="Load" fill="#82ca9d" name="負載(kN)" /> */}
                  <Bar dataKey="NG" fill="#ff7f7f" name="不良率(%)" />
                  <Bar dataKey="Load" fill="#82ca9d" name="波型特徵(單位化)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ===== 下排：工單/機台/模具與 RUL 整合表（點選互動） ===== */}
      <Row gutter={[16,16]} className="mt-4">
        <Col xs={24}>
          <Card
            title={<Space><Gauge size={18}/>現行生產中 — 機台總覽（點選方塊切換上方視圖）</Space>}
            extra={
              <Space>
                <Segmented
                  options={[{label:'視覺化', value:'visual'},{label:'列表', value:'list'}]}
                  value={viewMode}
                  onChange={(v)=> setViewMode(v as any)}
                />
              </Space>
            }
          >
            {viewMode === 'list' ? (
              <Table
                columns={columns}
                dataSource={workOrders}
                pagination={{ pageSize: 8 }}
                size="small"
                rowClassName={(record)=> record.key===selectedKey? 'bg-blue-50' : ''}
                onRow={(record)=> ({
                  onClick: ()=> {
                    setSelectedKey(record.key);
                    if (record.process === '打頭') {
                      setSelectedHeadingKey(record.key);
                      setFocusProcess('打頭');
                    } else if (record.process === '搓牙') {
                      setSelectedThreadingKey(record.key);
                      setFocusProcess('搓牙');
                    }
                  }
                })}
                loading={loading}
              />
            ) : (
              <Row gutter={[16,16]}>
                {areaOrder.filter(a=> areaTemplates[a]).map(area => {
                  const tpl = areaTemplates[area];
                  const Block = ({code}:{code:string}) => {
                    const row = getRowByMachine(code);
                    const metrics = row ? deriveMetrics(row) : null;
                    const { bg, fg } = colorFromHealth(metrics?.health ?? null);
                    const isSelected = row && selectedKey === row.key;
                    const clickable = !!row; //!!row 代表將 row 轉換為布林值
                    return (
                      <div
                        onClick={()=>{
                          if (!row) return;
                          setSelectedKey(row.key);
                          if (row.process === '打頭') { setSelectedHeadingKey(row.key); setFocusProcess('打頭'); }
                          else { setSelectedThreadingKey(row.key); setFocusProcess('搓牙'); }
                        }}
                        style={{
                          background: bg,
                          color: fg,
                          borderRadius: 6,
                          padding: '6px 10px',
                          marginBottom: 8,

                          cursor: clickable? 'pointer':'default',
                          border: isSelected? '2px solid #1677ff' : '2px solid #cbd5e1',
                          textAlign: 'center',
                          fontWeight: 600,
                          letterSpacing: 0.5,
                          userSelect: 'none',
                          opacity: clickable? 1 : 0.85
                        }}
                        title={ clickable ? `機台 ${code} / 健康度 ${(metrics?.health ?? 0).toFixed(0)}% / RUL ${metrics?.rulShots?.toLocaleString?.() ?? 0} 次` : `機台 ${code}（未生產）` }
                      >
                        {code}
                      </div>
                    );
                  };
                  return (
                    <Col xs={24} lg={12} xl={6} key={area}>
                      <div style={{border:'1px solid #e5e7eb', borderRadius:8, padding:5}}>
                        <Row gutter={8}>
                          <Col span={10}>
                            {tpl.left.map(code=> <Block key={code} code={code} />)}
                          </Col>
                     <Col span={4}>
                            <div style={{height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6}}>
                            <Typography.Text strong>{(area==='A'||area==='D')? 'Heading' : 'Threading'}</Typography.Text>
                            <Typography.Text type="secondary">Rolling</Typography.Text>
                                        <Divider style={{margin:'8px 0'}}/>
                              <Typography.Text>Area {area}</Typography.Text> 
                            </div>
                          </Col>
                          <Col span={10}>
                            {tpl.right.map(code=> <Block key={code} code={code} />)}
                          </Col>
                        </Row>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            )}
            <Divider style={{margin:'12px 0'}}/>
            <Space wrap size={8}>
              <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                <span style={{width:14,height:14,background:'#155724',display:'inline-block',borderRadius:3}}></span>
                <Typography.Text>綠色：50% 以上</Typography.Text>
              </span>
              <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                <span style={{width:14,height:14,background:'#ffeb3b',display:'inline-block',borderRadius:3,border:'1px solid #d4b106'}}></span>
                <Typography.Text>黃色：31%–49%</Typography.Text>
              </span>
              <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                <span style={{width:14,height:14,background:'#ff4d4f',display:'inline-block',borderRadius:3}}></span>
                <Typography.Text>紅色：0%–30%</Typography.Text>
              </span>
              <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                <span style={{width:14,height:14,background:'#9e9e9e',display:'inline-block',borderRadius:3}}></span>
                <Typography.Text>灰色：未生產/未知</Typography.Text>
              </span>
            </Space>
          </Card>
        </Col>
      </Row>

      <Typography.Paragraph className="text-gray-400 text-xs mt-4">
        {/* 註：RUL（Remaining Useful Life）= 預測剩餘可用壽命；健康度以 0–100 顯示。 */}
      </Typography.Paragraph>
    </div>
  );
}
