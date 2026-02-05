'use client';
// import { useEffect, useMemo, useState } from 'react';
// import { Card, Typography, Row, Col, Table, Tag, Space, Statistic, Divider, Progress, Badge, Button } from 'antd';
// import { Hammer, Wrench, Gauge, AlertTriangle, Activity, MousePointerClick } from 'lucide-react';
// import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';

// // ===== 假資料（可日後改為 API 串接） =====
// const seededRand = (seed: number) => {
//   // 簡單可重現亂數（展示用）
//   const x = Math.sin(seed) * 10000;
//   return x - Math.floor(x);
// };
// const makeTrend = (seed = 1, days = 14, start = 95, slope = -2) =>
//   Array.from({ length: days }).map((_, i) => ({
//     day: `D${i + 1}`,
//     health: Math.max(0, start + slope * i + (seededRand(seed + i) - 0.5) * 3),
//     temp: 35 + seededRand(seed + i * 2) * 10,
//     force: 12 + seededRand(seed + i * 3) * 4,
//   }));

// // 取樣自你提供的清單，節錄幾筆示意
// const workOrders = [
//   { key: 1, process: '打頭', machine: 'A101', order: 'J512-25080228', toolName: 'A_主模具', toolNo: 'MISCXA03', moldId: 'MISCXA03_02', life: 1000000, start: 23058, prod: 0, total: 23058 },
//   { key: 2, process: '打頭', machine: 'A104', order: 'J512-25060262', toolName: 'A_主模具', toolNo: 'MISCZ0813', moldId: 'MISCZ0813_08', life: 1000000, start: 94267, prod: 0, total: 94267 },
//   { key: 3, process: '搓牙', machine: 'B104', order: 'J512-25060212', toolName: 'M_牙板(下牙板)', toolNo: 'MISCT552', moldId: 'MISCT552_05', life: 1000000, start: 99376, prod: 0, total: 99376 },
//   { key: 4, process: '搓牙', machine: 'C107', order: 'J512-25060102', toolName: 'M_牙板(下牙板)', toolNo: 'MISCZ0823', moldId: 'MISCZ0823_04', life: 1000000, start: 55574, prod: 0, total: 55574 },
//   { key: 5, process: '打頭', machine: 'D106', order: 'J512-25070475', toolName: 'A_主模具', toolNo: 'MISCZ0813', moldId: 'MISCZ0813_06', life: 1000000, start: 76377, prod: 0, total: 76377 },
// ];

// // === 主要失效模式（FMECA）定義：避免 ReferenceError ===
// const failureModes = [
//   { mode: '崩角/裂紋', weight: 0.42, contrib: ['峰值打擊力', '週期溫升', '材料硬度偏差'] },
//   { mode: '磨耗超限', weight: 0.35, contrib: ['總衝次(Shots)', '潤滑不良', '切屑堵塞'] },
//   { mode: '咬模',   weight: 0.23, contrib: ['進刀速度', '牙型負載', '表面粗糙度'] },
// ] as const;

// // 由工單行產生 RUL/健康度估計（展示用簡化公式）
// const deriveMetrics = (row: any) => {
//   if (!row) return null;
//   const usedRatio = row.total / Math.max(1, row.life);
//   const baseHealth = Math.max(0, 100 - usedRatio * 100 * 1.05); // 使用越多健康度越低
//   const seed = row.machine.charCodeAt(0) + row.machine.charCodeAt(row.machine.length - 1);
//   const trend = makeTrend(seed, 14, baseHealth, -2 + (seededRand(seed) - 0.5));
//   const rulShots = Math.max(0, Math.round(row.life - row.total));
//   const shotsPerHour = 500; // 假設 500 shots/hr（展示用）
//   const rulHours = Math.round(rulShots / shotsPerHour);
//   const conf = 0.82 + seededRand(seed) * 0.15; // 0.82~0.97
//   return { trend, rulShots, rulHours, conf, health: trend.at(-1)?.health ?? baseHealth };
// };

// // ===== 表格欄位：整合 RUL / 健康度 / 使用比例 =====
// const buildColumns = (getHealthForRow: (r: any)=>number, getRULForRow: (r: any)=>number) => [
//   { title: '製程', dataIndex: 'process', key: 'process', render: (t: string) => <Tag color={t==='打頭'? 'blue':'volcano'}>{t}</Tag> },
//   { title: '機台', dataIndex: 'machine', key: 'machine' },
//   { title: '工單單號', dataIndex: 'order', key: 'order' },
//   { title: '模具品項名稱', dataIndex: 'toolName', key: 'toolName' },
//   { title: '模具料號', dataIndex: 'toolNo', key: 'toolNo' },
//   { title: '模具編號', dataIndex: 'moldId', key: 'moldId' },
//   { title: '壽命數量', dataIndex: 'life', key: 'life', render: (v: number) => v?.toLocaleString?.() ?? v },
//   { title: '開始數量', dataIndex: 'start', key: 'start', render: (v: number) => v?.toLocaleString?.() ?? v },
//   { title: '生產數量', dataIndex: 'prod', key: 'prod', render: (v: number) => v?.toLocaleString?.() ?? v },
//   { title: '合計', dataIndex: 'total', key: 'total', render: (v: number) => v?.toLocaleString?.() ?? v },
//   { title: '使用比例(%)', key: 'ratio', render: (_: any, r: any) => ((r.total / r.life) * 100).toFixed(2) },
//   { title: '健康度', key: 'health', render: (_: any, r: any) => {
//       const h = getHealthForRow(r);
//       return <HealthBar value={h} compact />
//     }
//   },
//   { title: '預測剩餘壽命(衝次)', key: 'rul', render: (_: any, r: any) => getRULForRow(r) },
// ];

// // === 遊戲血條樣式健康度元件（街機格鬥風） ===
// function HealthBar({ value, compact=false, recent=0 }: { value: number; compact?: boolean; recent?: number }) {
//   const v = Math.max(0, Math.min(100, value || 0));
//   const r = Math.max(0, Math.min(100, recent || 0)); // 代表「延遲掉血」或 chip damage 視覺
//   const height = compact ? 12 : 18;
//   const radius = compact ? 6 : 8;

//   // 顏色規則：高 → 綠，中 → 黃，低 → 紅
//   const barColor = v > 66 ? '#16a34a' : v > 33 ? '#eab308' : '#ef4444';
//   const borderColor = '#1f2937';
//   const trackColor = 'linear-gradient(180deg, #0b0f1a, #121826)';

//   // 參考街機血條：先畫「延遲掉血/傷害殘影」(較亮黃)，再畫目前 HP
//   const chipWidth = Math.min(100, v + r);

//   // 刻度（25/50/75%）
//   const ticks = [25, 50, 75];

//   return (
//     <div className="w-full flex items-center gap-2" style={{minWidth:120}}>
//       <div
//         style={{
//           position: 'relative',
//           height,
//           width: '100%',
//           background: trackColor,
//           border: `1px solid ${borderColor}`,
//           borderRadius: radius,
//           boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.08), 0 1px 1px rgba(0,0,0,0.4)'
//         }}
//       >
//         {/* 延遲掉血（chip / damage lag） */}
//         <div
//           style={{
//             position: 'absolute',
//             left: 0,
//             top: 0,
//             bottom: 0,
//             width: `${chipWidth}%`,
//             background: 'linear-gradient(180deg,#facc15,#d4af37)',
//             borderRadius: radius,
//             transition: 'width 300ms ease-out',
//             opacity: 0.6
//           }}
//         />
//         {/* 目前血量 */}
//         <div
//           style={{
//             position: 'absolute',
//             left: 0,
//             top: 0,
//             bottom: 0,
//             width: `${v}%`,
//             background: `linear-gradient(180deg, ${barColor}, ${barColor}90)`,
//             borderRadius: radius,
//             transition: 'width 250ms ease-in',
//             boxShadow: 'inset 0 0 6px rgba(0,0,0,0.35)'
//           }}
//         />
//         {/* 刻度線 */}
//         {ticks.map(t => (
//           <div key={t}
//             style={{
//               position: 'absolute',
//               left: `${t}%`,
//               top: 0,
//               bottom: 0,
//               width: 2,
//               background: 'rgba(255,255,255,0.12)'
//             }}
//           />
//         ))}
//         {/* 邊框高光 */}
//         <div
//           style={{
//             position: 'absolute',
//             left: 2,
//             right: 2,
//             top: 1,
//             height: 1,
//             background: 'rgba(255,255,255,0.45)',
//             borderRadius: radius
//           }}
//         />
//       </div>
//       <span className="text-xs" style={{minWidth:42,textAlign:'right'}}>{Math.round(v)}%</span>
//     </div>
//   );
// }

// // === Dev 測試（簡易斷言）===
// function devAsserts() {
//   const isArray = Array.isArray;
//   const ok = (cond: boolean, msg: string) => { if (!cond) console.error(`[TEST FAILED] ${msg}`); };
//   // 測試 1：failureModes 需存在且格式正確
//   ok(isArray(failureModes), 'failureModes 應為陣列');
//   ok(failureModes.every(m => m && typeof m.mode==='string' && typeof m.weight==='number' && isArray(m.contrib)), 'failureModes 內容格式錯誤');
//   // 測試 2：workOrders 至少有一筆，且數值欄位為數字
//   ok(isArray(workOrders) && workOrders.length>0, 'workOrders 應至少一筆');
//   ok(workOrders.every(w => typeof w.life==='number' && typeof w.total==='number'), 'workOrders 數值欄位格式錯誤');
//   // 測試 3：deriveMetrics 需可回傳預期欄位
//   const sample = deriveMetrics(workOrders[0]);
//   ok(!!sample && typeof sample.rulShots==='number' && typeof sample.health==='number', 'deriveMetrics 回傳內容不完整');
// }
// if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
//   devAsserts();
// }

// export default function AIForgingThreadingSuite() {
//   const [selectedKey, setSelectedKey] = useState<number | null>(workOrders[0]?.key ?? null);
//   const selectedRow = useMemo(() => workOrders.find(w => w.key === selectedKey) ?? null, [selectedKey]);
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => { setMounted(true); }, []);

//   // 針對「打頭」與「搓牙」各別決定要用誰的資料：
//   const headingRow = useMemo(() => selectedRow?.process === '打頭' ? selectedRow : workOrders.find(w => w.process === '打頭'), [selectedRow]);
//   const threadingRow = useMemo(() => selectedRow?.process === '搓牙' ? selectedRow : workOrders.find(w => w.process === '搓牙'), [selectedRow]);

//   const headingMetrics = useMemo(() => deriveMetrics(headingRow), [headingRow]);
//   const threadingMetrics = useMemo(() => deriveMetrics(threadingRow), [threadingRow]);

//   const columns = useMemo(() => buildColumns(
//     (r) => deriveMetrics(r)?.health ?? 0,
//     (r) => deriveMetrics(r)?.rulShots ?? 0
//   ), []);

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <Typography.Title level={2}>AI 智能製程套件 — 打頭/搓牙（RUL + 工單整合）</Typography.Title>
//       <Typography.Paragraph>
//         點選下方 <b>工單/機台</b> 任一列，上方的 <b>RUL 總覽</b> 與 <b>趨勢圖</b> 將自動切換為該筆機台/模具的即時視圖。
//       </Typography.Paragraph>

//       {/* ===== RUL 總覽（上排） ===== */}
//       <Row gutter={[16,16]}>
//         <Col xs={24} lg={12}>
//           <Card title={<Space><Hammer size={18}/>打頭模具 RUL 總覽</Space>} extra={<Space><Tag color="blue">Heading</Tag>{headingRow && <Tag>{headingRow.machine}</Tag>}</Space>}>
//             <Row gutter={12}>
//               <Col span={8}><Statistic title="估計剩餘衝次" value={headingMetrics?.rulShots ?? 0} /></Col>
//               <Col span={8}><Statistic title="估計剩餘小時" value={headingMetrics?.rulHours ?? 0} /></Col>
//               <Col span={8}><Statistic title="信心度" value={Math.round((headingMetrics?.conf ?? 0)*100)} suffix="%" /></Col>
//             </Row>
//             <Divider/>
//             <Row gutter={12}>
//               <Col span={12}>
//                 <Typography.Text type="secondary">健康度趨勢（14 天）</Typography.Text>
//                 <div style={{height:200}}>
//                   {mounted ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart data={headingMetrics?.trend ?? []} margin={{left:0,right:0,top:10,bottom:0}}>
//                         <defs>
//                           <linearGradient id="h" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="5%" stopColor="#8884d8" stopOpacity={0.6}/>
//                             <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
//                           </linearGradient>
//                         </defs>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="day" tick={{ fontSize: 12 }} />
//                         <YAxis tick={{ fontSize: 12 }} domain={[0,100]} />
//                         <Tooltip />
//                         <Area type="monotone" dataKey="health" stroke="#8884d8" fillOpacity={1} fill="url(#h)" />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <div style={{height:'100%', borderRadius:6, background:'linear-gradient(90deg, #f5f5f5, #e9e9e9)'}} />
//                   )}
//                 </div>
//               </Col>
//               <Col span={12}>
//                 <Typography.Text type="secondary">打擊力/溫度（特徵漂移）</Typography.Text>
//                 <div style={{height:200}}>
//                   {mounted ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <LineChart data={headingMetrics?.trend ?? []} margin={{left:0,right:0,top:10,bottom:0}}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="day" tick={{ fontSize: 12 }} />
//                         <YAxis tick={{ fontSize: 12 }} />
//                         <Tooltip />
//                         <Legend />
//                         <Line type="monotone" dataKey="force" stroke="#82ca9d" dot={false} name="打擊力(kN)" />
//                         <Line type="monotone" dataKey="temp" stroke="#8884d8" dot={false} name="溫度(°C)" />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <div style={{height:'100%', borderRadius:6, background:'linear-gradient(90deg, #f5f5f5, #e9e9e9)'}} />
//                   )}
//                 </div>
//               </Col>
//             </Row>
//             <Divider/>
//             <Space direction="vertical" style={{width:'100%'}}>
//               <div>
//                 <Typography.Text type="secondary">健康度</Typography.Text>
//                 <HealthBar value={headingMetrics?.health ?? 0} />
//               </div>
//               {headingRow && <Tag>工單 {headingRow.order}</Tag>}
//               {headingRow && <Tag>模具 {headingRow.moldId}</Tag>}
//               {mounted && <Tag color="geekblue">資料更新 {new Date().toLocaleDateString()}</Tag>}
//               <Tag color="purple">模型：LSTM + XGBoost</Tag>
//             </Space>
//           </Card>
//         </Col>

//         <Col xs={24} lg={12}>
//           <Card title={<Space><Wrench size={18}/>搓牙模具 RUL 總覽</Space>} extra={<Space><Tag color="volcano">Threading</Tag>{threadingRow && <Tag>{threadingRow.machine}</Tag>}</Space>}>
//             <Row gutter={12}>
//               <Col span={8}><Statistic title="估計剩餘衝次" value={threadingMetrics?.rulShots ?? 0} /></Col>
//               <Col span={8}><Statistic title="估計剩餘小時" value={threadingMetrics?.rulHours ?? 0} /></Col>
//               <Col span={8}><Statistic title="信心度" value={Math.round((threadingMetrics?.conf ?? 0)*100)} suffix="%" /></Col>
//             </Row>
//             <Divider/>
//             <Row gutter={12}>
//               <Col span={12}>
//                 <Typography.Text type="secondary">健康度趨勢（14 天）</Typography.Text>
//                 <div style={{height:200}}>
//                   {mounted ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart data={threadingMetrics?.trend ?? []} margin={{left:0,right:0,top:10,bottom:0}}>
//                         <defs>
//                           <linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.6}/>
//                             <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
//                           </linearGradient>
//                         </defs>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="day" tick={{ fontSize: 12 }} />
//                         <YAxis tick={{ fontSize: 12 }} domain={[0,100]} />
//                         <Tooltip />
//                         <Area type="monotone" dataKey="health" stroke="#82ca9d" fillOpacity={1} fill="url(#t)" />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <div style={{height:'100%', borderRadius:6, background:'linear-gradient(90deg, #f5f5f5, #e9e9e9)'}} />
//                   )}
//                 </div>
//               </Col>
//               <Col span={12}>
//                 <Typography.Text type="secondary">進刀負載/溫度（特徵漂移）</Typography.Text>
//                 <div style={{height:200}}>
//                   {mounted ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <LineChart data={threadingMetrics?.trend ?? []} margin={{left:0,right:0,top:10,bottom:0}}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="day" tick={{ fontSize: 12 }} />
//                         <YAxis tick={{ fontSize: 12 }} />
//                         <Tooltip />
//                         <Legend />
//                         <Line type="monotone" dataKey="force" stroke="#82ca9d" dot={false} name="進刀負載(kN)" />
//                         <Line type="monotone" dataKey="temp" stroke="#8884d8" dot={false} name="溫度(°C)" />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <div style={{height:'100%', borderRadius:6, background:'linear-gradient(90deg, #f5f5f5, #e9e9e9)'}} />
//                   )}
//                 </div>
//               </Col>
//             </Row>
//             <Divider/>
//             <Space direction="vertical" style={{width:'100%'}}>
//               <div>
//                 <Typography.Text type="secondary">健康度</Typography.Text>
//                 <HealthBar value={threadingMetrics?.health ?? 0} />
//               </div>
//               {threadingRow && <Tag>工單 {threadingRow.order}</Tag>}
//               {threadingRow && <Tag>模具 {threadingRow.moldId}</Tag>}
//               {mounted && <Tag color="geekblue">資料更新 {new Date().toLocaleDateString()}</Tag>}
//               <Tag color="purple">模型：Prophet + LightGBM</Tag>
//             </Space>
//           </Card>
//         </Col>
//       </Row>

//       {/* ===== 中排：失效模式 & 品質 vs 負載 ===== */}
//       <Row gutter={[16,16]} className="mt-4">
//         <Col xs={24} lg={10}>
//           <Card title={<Space><AlertTriangle size={18}/>主要失效模式（FMECA）</Space>}>
//             {failureModes.map((item)=> (
//               <div key={item.mode} className="mb-3">
//                 <Space align="center">
//                   <Badge color="red" />
//                   <Typography.Text strong>{item.mode}</Typography.Text>
//                   <Tag color="red">風險權重 {(item.weight*100).toFixed(0)}%</Tag>
//                 </Space>
//                 <div className="text-gray-500 text-sm mt-1">主要影響因子：{item.contrib.join('、')}</div>
//                 <Progress percent={Math.round(item.weight*100)} status={item.weight>0.4? 'exception':'active'} />
//               </div>
//             ))}
//           </Card>
//         </Col>
//         <Col xs={24} lg={14}>
//           <Card title={<Space><Activity size={18}/>品質 vs 負載（示意）</Space>}>
//             <div style={{height:260}}>
//               {mounted ? (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={(deriveMetrics(workOrders[0])?.trend ?? []).map(d=>({ day:d.day, NG: Math.max(0, 5 - d.health/25), Load: d.force }))}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="day" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend />
//                     <Bar dataKey="NG" fill="#ff7f7f" name="不良率(%)" />
//                     <Bar dataKey="Load" fill="#82ca9d" name="負載(kN)" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               ) : (
//                 <div style={{height:'100%', borderRadius:6, background:'linear-gradient(90deg, #f5f5f5, #e9e9e9)'}} />
//               )}
//             </div>
//           </Card>
//         </Col>
//       </Row>

//       {/* ===== 下排：工單/機台/模具與 RUL 整合表（點選互動） ===== */}
//       <Row gutter={[16,16]} className="mt-4">
//         <Col xs={24}>
//           <Card title={<Space><Gauge size={18}/>現行生產中 — 工單/機台/模具（點選切換上方視圖）</Space>} extra={<Space><MousePointerClick size={16}/>點選任一列</Space>}>
//             <Table
//               columns={columns}
//               dataSource={workOrders}
//               pagination={{ pageSize: 8 }}
//               size="small"
//               rowClassName={(record)=> record.key===selectedKey? 'bg-blue-50' : ''}
//               onRow={(record)=> ({ onClick: ()=> setSelectedKey(record.key) })}
//             />
//           </Card>
//         </Col>
//       </Row>

//       <Typography.Paragraph className="text-gray-400 text-xs mt-4">
//         註：RUL（Remaining Useful Life）= 預測剩餘可用壽命；健康度以 0–100 顯示。示意資料僅供畫面與流程規劃。
//       </Typography.Paragraph>
//     </div>
//   );
// }
import { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Row, Col, Table, Tag, Space, Statistic, Divider, Progress, Badge, Button } from 'antd';
import { Hammer, Wrench, Gauge, AlertTriangle, Activity, MousePointerClick, Flame, Zap, Trophy } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';

// ===== 假資料（可日後改為 API 串接） =====
const seededRand = (seed: number) => {
  // 簡單可重現亂數（展示用）
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};
const makeTrend = (seed = 1, days = 14, start = 95, slope = -2) =>
  Array.from({ length: days }).map((_, i) => ({
    day: `D${i + 1}`,
    health: Math.max(0, start + slope * i + (seededRand(seed + i) - 0.5) * 3),
    temp: 35 + seededRand(seed + i * 2) * 10,
    force: 12 + seededRand(seed + i * 3) * 4,
  }));

// 取樣自你提供的清單，節錄幾筆示意
const workOrders = [
  { key: 1, process: '打頭', machine: 'A101', order: 'J512-25080228', toolName: 'A_主模具', toolNo: 'MISCXA03', moldId: 'MISCXA03_02', life: 1000000, start: 23058, prod: 0, total: 23058 },
  { key: 2, process: '打頭', machine: 'A104', order: 'J512-25060262', toolName: 'A_主模具', toolNo: 'MISCZ0813', moldId: 'MISCZ0813_08', life: 1000000, start: 94267, prod: 0, total: 94267 },
  { key: 3, process: '搓牙', machine: 'B104', order: 'J512-25060212', toolName: 'M_牙板(下牙板)', toolNo: 'MISCT552', moldId: 'MISCT552_05', life: 1000000, start: 99376, prod: 0, total: 99376 },
  { key: 4, process: '搓牙', machine: 'C107', order: 'J512-25060102', toolName: 'M_牙板(下牙板)', toolNo: 'MISCZ0823', moldId: 'MISCZ0823_04', life: 1000000, start: 55574, prod: 0, total: 55574 },
  { key: 5, process: '打頭', machine: 'D106', order: 'J512-25070475', toolName: 'A_主模具', toolNo: 'MISCZ0813', moldId: 'MISCZ0813_06', life: 1000000, start: 76377, prod: 0, total: 76377 },
];

// === 主要失效模式（FMECA）定義：避免 ReferenceError ===
const failureModes = [
  { mode: '崩角/裂紋', weight: 0.42, contrib: ['峰值打擊力', '週期溫升', '材料硬度偏差'] },
  { mode: '磨耗超限', weight: 0.35, contrib: ['總衝次(Shots)', '潤滑不良', '切屑堵塞'] },
  { mode: '咬模',   weight: 0.23, contrib: ['進刀速度', '牙型負載', '表面粗糙度'] },
] as const;

// 由工單行產生 RUL/健康度估計（展示用簡化公式）
const deriveMetrics = (row: any) => {
  if (!row) return null;
  const usedRatio = row.total / Math.max(1, row.life);
  const baseHealth = Math.max(0, 100 - usedRatio * 100 * 1.05); // 使用越多健康度越低
  const seed = row.machine.charCodeAt(0) + row.machine.charCodeAt(row.machine.length - 1);
  const trend = makeTrend(seed, 14, baseHealth, -2 + (seededRand(seed) - 0.5));
  const rulShots = Math.max(0, Math.round(row.life - row.total));
  const shotsPerHour = 500; // 假設 500 shots/hr（展示用）
  const rulHours = Math.round(rulShots / shotsPerHour);
  const conf = 0.82 + seededRand(seed) * 0.15; // 0.82~0.97
  return { trend, rulShots, rulHours, conf, health: trend.at(-1)?.health ?? baseHealth };
};

// 衍生：街機風 Super Meter（依健康度與信心度估算，僅示意）
const calcSuper = (metrics: ReturnType<typeof deriveMetrics> | null) => {
  if (!metrics) return 0;
  const fatigue = 100 - Math.max(0, Math.min(100, metrics.health ?? 0)); // 越疲勞越快充
  const confidence = Math.max(0, Math.min(1, (metrics.conf ?? 0))); // 0~1
  const base = fatigue * 0.6 + confidence * 40; // 0~100
  return Math.max(0, Math.min(100, Math.round(base)));
};

// ===== 表格欄位：整合 RUL / 健康度 / 使用比例 =====
const buildColumns = (getHealthForRow: (r: any)=>number, getRULForRow: (r: any)=>number) => [
  { title: '製程', dataIndex: 'process', key: 'process', render: (t: string) => <Tag color={t==='打頭'? 'blue':'volcano'}>{t}</Tag> },
  { title: '機台', dataIndex: 'machine', key: 'machine' },
  { title: '工單單號', dataIndex: 'order', key: 'order' },
  { title: '模具品項名稱', dataIndex: 'toolName', key: 'toolName' },
  { title: '模具料號', dataIndex: 'toolNo', key: 'toolNo' },
  { title: '模具編號', dataIndex: 'moldId', key: 'moldId' },
  { title: '壽命數量', dataIndex: 'life', key: 'life', render: (v: number) => v?.toLocaleString?.() ?? v },
  { title: '開始數量', dataIndex: 'start', key: 'start', render: (v: number) => v?.toLocaleString?.() ?? v },
  { title: '生產數量', dataIndex: 'prod', key: 'prod', render: (v: number) => v?.toLocaleString?.() ?? v },
  { title: '合計', dataIndex: 'total', key: 'total', render: (v: number) => v?.toLocaleString?.() ?? v },
  { title: '使用比例(%)', key: 'ratio', render: (_: any, r: any) => ((r.total / r.life) * 100).toFixed(2) },
  { title: '健康度', key: 'health', render: (_: any, r: any) => {
      const h = getHealthForRow(r);
      const theory = 100 - (r.total / Math.max(1,r.life)) * 100;
      return <HealthBar value={h} theory={theory} compact hudRight={`${r.machine} • ${r.order}`} />
    }
  },
  { title: '預測剩餘壽命(衝次)', key: 'rul', render: (_: any, r: any) => getRULForRow(r) },
];

// === 遊戲血條樣式健康度元件（街機格鬥風） ===
function HealthBar({ value, compact=false, recent=0, theory=100, hudRight }: { value: number; compact?: boolean; recent?: number; theory?: number; hudRight?: string }) {
  const v = Math.max(0, Math.min(100, value || 0));
  const r = Math.max(0, Math.min(100, recent || 0));
  const t = Math.max(0, Math.min(100, theory || 0));
  const height = compact ? 12 : 18;
  const radius = compact ? 6 : 8;

  const barColor = v > 66 ? '#16a34a' : v > 33 ? '#eab308' : '#ef4444';
  const borderColor = '#1f2937';
  const trackColor = 'linear-gradient(180deg, #0b0f1a, #121826)';
  const chipWidth = Math.min(100, v + r);
  const ticks = [25, 50, 75];
  const critical = v < 30;

  return (
    <div className="w-full flex items-center gap-2" style={{minWidth:140}}>
      <div style={{position:'relative', height, width:'100%'}}>
        <div style={{ position: 'absolute', inset: 0, background: trackColor, border: `1px solid ${borderColor}`, borderRadius: radius, boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.08), 0 1px 1px rgba(0,0,0,0.4)'}} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${t}%`, borderRadius: radius, border: '1px solid rgba(88,199,250,0.75)', boxShadow: 'inset 0 0 6px rgba(88,199,250,0.35)', pointerEvents: 'none'}} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${chipWidth}%`, background: 'linear-gradient(180deg,#facc15,#d4af37)', borderRadius: radius, transition: 'width 300ms ease-out', opacity: 0.6 }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v}%`, background: `linear-gradient(180deg, ${barColor}, ${barColor}90)`, borderRadius: radius, transition: 'width 250ms ease-in', boxShadow: 'inset 0 0 6px rgba(0,0,0,0.35)', animation: critical ? 'pulse 0.8s ease-in-out infinite' : undefined }} />
        {ticks.map(tk => (<div key={tk} style={{position:'absolute', left: `${tk}%`, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.12)'}} />))}
        <div style={{position:'absolute', left:2, right:2, top:1, height:1, background:'rgba(255,255,255,0.45)', borderRadius: radius}} />
        {hudRight && (<div style={{ position:'absolute', right:-4, top:-22, background:'rgba(15,23,42,0.9)', color:'#e5e7eb', fontSize: 10, padding:'2px 6px', borderRadius:4, border:'1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(2px)'}}>{hudRight}</div>)}
      </div>
      <span className="text-xs" style={{minWidth:42,textAlign:'right'}}>{Math.round(v)}%</span>
    </div>
  );
}

// === Super Meter（必殺計量條）===
function SuperMeter({ value=0, label='SUPER' }: { value?: number; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  const filled = v >= 100;
  return (
    <div style={{display:'flex', alignItems:'center', gap:8}}>
      <span style={{fontSize:12, letterSpacing:1, color:'#60a5fa'}}>{label}</span>
      <div style={{flex:1, height:10, position:'relative', background:'linear-gradient(180deg,#0b1020,#0f172a)', border:'1px solid #1d4ed8', borderRadius:6, overflow:'hidden', boxShadow:'inset 0 0 8px rgba(29,78,216,0.35)'}}>
        <div style={{position:'absolute', inset:0, background:'repeating-linear-gradient(135deg, rgba(96,165,250,0.08) 0 8px, rgba(59,130,246,0.08) 8px 16px)', pointerEvents:'none'}} />
        <div style={{height:'100%', width:`${v}%`, background:'linear-gradient(90deg,#3b82f6,#22d3ee)', transition:'width 220ms ease-out', boxShadow:'0 0 12px rgba(56,189,248,0.45)'}} />
        <div style={{position:'absolute', inset:0, border:'1px solid rgba(255,255,255,0.06)', borderRadius:6, pointerEvents:'none'}} />
      </div>
      {filled ? (
        <Tag color="cyan" style={{marginLeft:4}}><Zap size={14} style={{marginRight:4}}/>ULTRA READY</Tag>
      ) : (
        <Tag color="geekblue" style={{marginLeft:4}}>{v}%</Tag>
      )}
    </div>
  );
}

// 角色頭像卡（機台/模具視為角色）
function AvatarCard({ side='left', title, subtitle, extra }: { side?: 'left'|'right'; title: string; subtitle?: string; extra?: string }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8, justifyContent: side==='right'? 'flex-end':'flex-start'}}>
      {side==='left' && <div style={{width:40, height:40, borderRadius:8, background:'linear-gradient(135deg,#1f2937,#0b1020)', border:'1px solid rgba(255,255,255,0.12)'}} />}
      <div style={{lineHeight:1.1}}>
        <div style={{fontWeight:700, color:'#e5e7eb'}}>{title}</div>
        <div style={{fontSize:12, color:'#93a3b8'}}>{subtitle}</div>
        {extra && <div style={{fontSize:11, color:'#9ca3af'}}>{extra}</div>}
      </div>
      {side==='right' && <div style={{width:40, height:40, borderRadius:8, background:'linear-gradient(135deg,#1f2937,#0b1020)', border:'1px solid rgba(255,255,255,0.12)'}} />}
    </div>
  );
}

// 極端值浮動徽章（KO/Perfect）
function SideBadges({ metrics, trigger }: { metrics: ReturnType<typeof deriveMetrics> | null; trigger?: any }) {
  const [visible, setVisible] = useState(false);
  const ko = (metrics?.health ?? 0) <= 10;
  const perfect = (metrics?.health ?? 0) >= 95 && (metrics?.conf ?? 0) >= 0.9;
  useEffect(()=>{
    if (ko || perfect) {
      setVisible(true);
      const t = setTimeout(()=> setVisible(false), 1200);
      return ()=> clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, ko, perfect]);
  if (!visible) return null;
  return (
    <div className="badge-float">
      {ko && <Tag color="red" style={{fontWeight:800, letterSpacing:1}}>KO</Tag>}
      {perfect && <Tag color="green" style={{fontWeight:800, letterSpacing:1, marginLeft:8}}>PERFECT</Tag>}
    </div>
  );
}

// === Dev 測試（簡易斷言）===
function devAsserts() {
  const isArray = Array.isArray;
  const ok = (cond: boolean, msg: string) => { if (!cond) console.error(`[TEST FAILED] ${msg}`); };
  // 測試 1：failureModes 需存在且格式正確
  ok(isArray(failureModes), 'failureModes 應為陣列');
  ok(failureModes.every(m => m && typeof m.mode==='string' && typeof m.weight==='number' && isArray(m.contrib)), 'failureModes 內容格式錯誤');
  // 測試 2：workOrders 至少有一筆，且數值欄位為數字
  ok(isArray(workOrders) && workOrders.length>0, 'workOrders 應至少一筆');
  ok(workOrders.every(w => typeof w.life==='number' && typeof w.total==='number'), 'workOrders 數值欄位格式錯誤');
  // 測試 3：deriveMetrics 需可回傳預期欄位
  const sample = deriveMetrics(workOrders[0]);
  ok(!!sample && typeof sample.rulShots==='number' && typeof sample.health==='number', 'deriveMetrics 回傳內容不完整');
}
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  devAsserts();
}

export default function AIForgingThreadingSuite() {
  const [selectedKey, setSelectedKey] = useState<number | null>(workOrders[0]?.key ?? null);
  const selectedRow = useMemo(() => workOrders.find(w => w.key === selectedKey) ?? null, [selectedKey]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [arcade, setArcade] = useState(true);
  const [combo, setCombo] = useState(0);
  useEffect(()=>{
    if (combo <= 0) return;
    const t = setTimeout(()=> setCombo(0), 1800);
    return ()=> clearTimeout(t);
  }, [combo]);

  // 針對「打頭」與「搓牙」各別決定要用誰的資料：
  const headingRow = useMemo(() => selectedRow?.process === '打頭' ? selectedRow : workOrders.find(w => w.process === '打頭'), [selectedRow]);
  const threadingRow = useMemo(() => selectedRow?.process === '搓牙' ? selectedRow : workOrders.find(w => w.process === '搓牙'), [selectedRow]);

  const headingMetrics = useMemo(() => deriveMetrics(headingRow), [headingRow]);
  const threadingMetrics = useMemo(() => deriveMetrics(threadingRow), [threadingRow]);
  const headingSuper = useMemo(()=> calcSuper(headingMetrics), [headingMetrics]);
  const threadingSuper = useMemo(()=> calcSuper(threadingMetrics), [threadingMetrics]);

  const columns = useMemo(() => buildColumns(
    (r) => deriveMetrics(r)?.health ?? 0,
    (r) => deriveMetrics(r)?.rulShots ?? 0
  ), []);

  // 圖表切換 FX
  const [fxShake, setFxShake] = useState(false);
  const [fxFlash, setFxFlash] = useState(false);
  useEffect(()=>{
    if (selectedKey == null) return;
    setFxShake(true); setFxFlash(true);
    const a = setTimeout(()=> setFxShake(false), 380);
    const b = setTimeout(()=> setFxFlash(false), 320);
    return ()=> { clearTimeout(a); clearTimeout(b); };
  }, [selectedKey]);

  useEffect(()=>{
    if (headingSuper >= 100 || threadingSuper >= 100) {
      setFxFlash(true);
      const t = setTimeout(()=> setFxFlash(false), 420);
      return ()=> clearTimeout(t);
    }
  }, [headingSuper, threadingSuper]);

  return (
    <>
      <style>{`
        @keyframes pulse{0%{filter:brightness(1)}50%{filter:brightness(1.35)}100%{filter:brightness(1)}}
        @keyframes scan { 0% { background-position: 0 0; } 100% { background-position: 0 100vh; } }
        .crt-scanlines::after {
          content: '';
          position: fixed; left:0; top:0; right:0; bottom:0; pointer-events:none; z-index: 0;
          background: repeating-linear-gradient( to bottom, rgba(255,255,255,0.03) 0 2px, rgba(0,0,0,0.03) 2px 4px );
          animation: scan 8s linear infinite;
        }
        .neon-title { text-shadow: 0 0 8px rgba(99,102,241,0.65), 0 0 18px rgba(56,189,248,0.45); }
  .vs-chip { background: linear-gradient(90deg,#111827,#0b1020); border:1px solid rgba(255,255,255,0.08); box-shadow: inset 0 0 24px rgba(99,102,241,0.12); }
  @keyframes shake { 0%{transform:translate(0,0)} 20%{transform:translate(-2px,1px)} 40%{transform:translate(2px,-1px)} 60%{transform:translate(-1px,2px)} 80%{transform:translate(1px,-2px)} 100%{transform:translate(0,0)} }
  .fx-shake { animation: shake .35s ease-in-out; }
  @keyframes flash { 0%{filter:brightness(1)} 40%{filter:brightness(1.35)} 100%{filter:brightness(1)} }
  .fx-flash { animation: flash .35s ease-in-out; }
  @keyframes pop { 0%{transform:scale(.7); opacity:0} 60%{transform:scale(1.08); opacity:1} 100%{transform:scale(1); opacity:1} }
  .badge-float { position:absolute; left:50%; top:14%; transform:translate(-50%,-50%); z-index:2; padding:8px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.22); background: rgba(0,0,0,0.35); backdrop-filter: blur(2px); animation: pop .28s ease-out; pointer-events:none; }
      `}</style>
      <div className={"p-6 min-h-screen " + (arcade ? 'crt-scanlines' : '')} style={{background:'radial-gradient(1200px 600px at 20% -10%, #0b1020 0%, #0a0f1f 35%, #060a16 60%, #04070f 100%)'}}>
      <Typography.Title level={2} className="neon-title">AI 智能製程套件 — 打頭/搓牙（RUL + 工單整合）</Typography.Title>
      <Typography.Paragraph>
        點選下方 <b>工單/機台</b> 任一列，上方的 <b>RUL 總覽</b> 與 <b>趨勢圖</b> 將自動切換為該筆機台/模具的即時視圖。
      </Typography.Paragraph>

      {/* ===== Arcade HUD ===== */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, background:'linear-gradient(180deg, rgba(17,24,39,0.9), rgba(2,6,23,0.85))', boxShadow:'inset 0 0 24px rgba(99,102,241,0.12), 0 1px 8px rgba(0,0,0,0.35)'}}>
        <Space size={12} align="center">
          <Gauge size={16} color="#60a5fa"/>
          <Tag color="purple">STAGE 1</Tag>
          <Tag color="geekblue">ROUND 1</Tag>
          <Tag color="gold">SCORE <b>{(headingSuper + threadingSuper) * 10}</b></Tag>
        </Space>
        <Space size={12} align="center">
          {combo>0 && (
            <Tag color="red" style={{fontSize:14, fontWeight:700, letterSpacing:1}}><Flame size={14} style={{marginRight:6}}/>COMBO x{combo}</Tag>
          )}
          <Button size="small" type={arcade? 'primary':'default'} onClick={()=> setArcade(v=>!v)} icon={<Trophy size={14}/>}>
            {arcade? 'Arcade Mode: ON':'Arcade Mode: OFF'}
          </Button>
        </Space>
      </div>

      {/* ===== VS 橫幅 ===== */}
      <div className="vs-chip" style={{marginTop:12, padding:'10px 12px', borderRadius:10}}>
        <Row gutter={[12,12]} align="middle">
          <Col xs={10} style={{display:'flex', gap:8, alignItems:'center'}}>
            <Hammer size={18} color="#93c5fd"/>
            <b>{headingRow?.machine ?? '—'}</b>
            <Tag color="blue">打頭</Tag>
            <SuperMeter value={headingSuper} label="SUPER"/>
          </Col>
          <Col xs={4} style={{textAlign:'center'}}>
            <Typography.Title level={4} style={{margin:0, color:'#e5e7eb', textShadow:'0 0 10px rgba(255,255,255,0.25)'}}>VS</Typography.Title>
          </Col>
          <Col xs={10} style={{display:'flex', gap:8, alignItems:'center', justifyContent:'flex-end'}}>
            <Tag color="volcano">搓牙</Tag>
            <b>{threadingRow?.machine ?? '—'}</b>
            <Wrench size={18} color="#fda4af"/>
            <SuperMeter value={threadingSuper} label="SUPER"/>
          </Col>
        </Row>
      </div>

      {/* ===== RUL 總覽（上排） ===== */}
      <Row gutter={[16,16]} style={{marginTop:12}}>
        <Col xs={24} lg={12}>
          <Card style={{position:'relative'}} title={<Space><Hammer size={18}/>打頭模具 RUL 總覽</Space>} extra={<Space><Tag color="blue">Heading</Tag>{headingRow && <Tag>{headingRow.machine}</Tag>}</Space>}>
            <AvatarCard side="left" title={headingRow?.machine ?? '—'} subtitle={headingRow?.moldId ?? ''} extra={headingRow?.toolName ?? ''} />
            <Row gutter={12}>
              <Col span={8}><Statistic title="估計剩餘衝次" value={headingMetrics?.rulShots ?? 0} /></Col>
              <Col span={8}><Statistic title="估計剩餘小時" value={headingMetrics?.rulHours ?? 0} /></Col>
              <Col span={8}><Statistic title="信心度" value={Math.round((headingMetrics?.conf ?? 0)*100)} suffix="%" /></Col>
            </Row>
            <div style={{marginTop:8}}>
              <SuperMeter value={headingSuper} />
            </div>
            <Divider/>
            <Row gutter={12}>
              <Col span={12}>
                <Typography.Text type="secondary">健康度趨勢（14 天）</Typography.Text>
                <div style={{height:200}} className={(fxShake? 'fx-shake ':'') + (fxFlash? 'fx-flash':'' )}>
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
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
                  ) : (
                    <div style={{height:'100%', borderRadius:6, background:'linear-gradient(90deg, #f5f5f5, #e9e9e9)'}} />
                  )}
                </div>
              </Col>
              <Col span={12}>
                <Typography.Text type="secondary">打擊力/溫度（特徵漂移）</Typography.Text>
                <div style={{height:200}} className={(fxShake? 'fx-shake ':'') + (fxFlash? 'fx-flash':'' )}>
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={headingMetrics?.trend ?? []} margin={{left:0,right:0,top:10,bottom:0}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="force" stroke="#82ca9d" dot={false} name="打擊力(kN)" />
                        <Line type="monotone" dataKey="temp" stroke="#8884d8" dot={false} name="溫度(°C)" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{height:'100%', borderRadius:6, background:'linear-gradient(90deg, #f5f5f5, #e9e9e9)'}} />
                  )}
                </div>
              </Col>
            </Row>
            <Divider/>
            <Space direction="vertical" style={{width:'100%'}}>
              <div>
                <Typography.Text type="secondary">健康度</Typography.Text>
                <HealthBar value={headingMetrics?.health ?? 0} theory={100 - (Math.max(0, (headingRow?.total ?? 0)) / Math.max(1, (headingRow?.life ?? 1))) * 100} hudRight={`${headingRow?.machine ?? ''} • ${headingRow?.order ?? ''}`} />
              </div>
              {headingRow && <Tag>工單 {headingRow.order}</Tag>}
              {headingRow && <Tag>模具 {headingRow.moldId}</Tag>}
              {mounted && <Tag color="geekblue">資料更新 {new Date().toLocaleDateString()}</Tag>}
              <Tag color="purple">模型：LSTM + XGBoost</Tag>
            </Space>
            <SideBadges metrics={headingMetrics} trigger={`${selectedKey}-${headingMetrics?.health ?? ''}-${headingMetrics?.conf ?? ''}`} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card style={{position:'relative'}} title={<Space><Wrench size={18}/>搓牙模具 RUL 總覽</Space>} extra={<Space><Tag color="volcano">Threading</Tag>{threadingRow && <Tag>{threadingRow.machine}</Tag>}</Space>}>
            <AvatarCard side="right" title={threadingRow?.machine ?? '—'} subtitle={threadingRow?.moldId ?? ''} extra={threadingRow?.toolName ?? ''} />
            <Row gutter={12}>
              <Col span={8}><Statistic title="估計剩餘衝次" value={threadingMetrics?.rulShots ?? 0} /></Col>
              <Col span={8}><Statistic title="估計剩餘小時" value={threadingMetrics?.rulHours ?? 0} /></Col>
              <Col span={8}><Statistic title="信心度" value={Math.round((threadingMetrics?.conf ?? 0)*100)} suffix="%" /></Col>
            </Row>
            <div style={{marginTop:8}}>
              <SuperMeter value={threadingSuper} />
            </div>
            <Divider/>
            <Row gutter={12}>
              <Col span={12}>
                <Typography.Text type="secondary">健康度趨勢（14 天）</Typography.Text>
                <div style={{height:200}} className={(fxShake? 'fx-shake ':'') + (fxFlash? 'fx-flash':'' )}>
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
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
                  ) : (
                    <div style={{height:'100%', borderRadius:6, background:'linear-gradient(90deg, #f5f5f5, #e9e9e9)'}} />
                  )}
                </div>
              </Col>
              <Col span={12}>
                <Typography.Text type="secondary">進刀負載/溫度（特徵漂移）</Typography.Text>
                <div style={{height:200}} className={(fxShake? 'fx-shake ':'') + (fxFlash? 'fx-flash':'' )}>
                  {mounted ? (
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
                  ) : (
                    <div style={{height:'100%', borderRadius:6, background:'linear-gradient(90deg, #f5f5f5, #e9e9e9)'}} />
                  )}
                </div>
              </Col>
            </Row>
            <Divider/>
            <Space direction="vertical" style={{width:'100%'}}>
              <div>
                <Typography.Text type="secondary">健康度</Typography.Text>
                <HealthBar value={threadingMetrics?.health ?? 0} theory={100 - (Math.max(0, (threadingRow?.total ?? 0)) / Math.max(1, (threadingRow?.life ?? 1))) * 100} hudRight={`${threadingRow?.machine ?? ''} • ${threadingRow?.order ?? ''}`} />
              </div>
              {threadingRow && <Tag>工單 {threadingRow.order}</Tag>}
              {threadingRow && <Tag>模具 {threadingRow.moldId}</Tag>}
              {mounted && <Tag color="geekblue">資料更新 {new Date().toLocaleDateString()}</Tag>}
              <Tag color="purple">模型：Prophet + LightGBM</Tag>
            </Space>
            <SideBadges metrics={threadingMetrics} trigger={`${selectedKey}-${threadingMetrics?.health ?? ''}-${threadingMetrics?.conf ?? ''}`} />
          </Card>
        </Col>
      </Row>

      {/* ===== 中排：失效模式 & 品質 vs 負載 ===== */}
      <Row gutter={[16,16]} className="mt-4">
        <Col xs={24} lg={10}>
          <Card title={<Space><AlertTriangle size={18}/>主要失效模式（FMECA）</Space>}>
            {failureModes.map((item)=> (
              <div key={item.mode} className="mb-3">
                <Space align="center">
                  <Badge color="red" />
                  <Typography.Text strong>{item.mode}</Typography.Text>
                  <Tag color="red">風險權重 {(item.weight*100).toFixed(0)}%</Tag>
                </Space>
                <div className="text-gray-500 text-sm mt-1">主要影響因子：{item.contrib.join('、')}</div>
                <Progress percent={Math.round(item.weight*100)} status={item.weight>0.4? 'exception':'active'} />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title={<Space><Activity size={18}/>品質 vs 負載（示意）</Space>}>
            <div style={{height:260}} className={(fxShake? 'fx-shake ':'') + (fxFlash? 'fx-flash':'' )}>
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(deriveMetrics(workOrders[0])?.trend ?? []).map(d=>({ day:d.day, NG: Math.max(0, 5 - d.health/25), Load: d.force }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="NG" fill="#ff7f7f" name="不良率(%)" />
                    <Bar dataKey="Load" fill="#82ca9d" name="負載(kN)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{height:'100%', borderRadius:6, background:'linear-gradient(90deg, #f5f5f5, #e9e9e9)'}} />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ===== 下排：工單/機台/模具與 RUL 整合表（點選互動） ===== */}
      <Row gutter={[16,16]} className="mt-4">
        <Col xs={24}>
          <Card title={<Space><Gauge size={18}/>現行生產中 — 工單/機台/模具（點選切換上方視圖）</Space>} extra={<Space><MousePointerClick size={16}/>點選任一列</Space>}>
            <Table
              columns={columns}
              dataSource={workOrders}
              pagination={{ pageSize: 8 }}
              size="small"
              rowClassName={(record)=> record.key===selectedKey? 'bg-blue-50' : ''}
              onRow={(record)=> ({ onClick: ()=> { setSelectedKey(record.key); setCombo(c=>c+1); } })}
            />
          </Card>
        </Col>
      </Row>

      <Typography.Paragraph className="text-gray-400 text-xs mt-4">
        註：RUL（Remaining Useful Life）= 預測剩餘可用壽命；健康度以 0–100 顯示。示意資料僅供畫面與流程規劃。
      </Typography.Paragraph>
    </div>
    </>
  );
}
