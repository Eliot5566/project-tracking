'use client';
"use strict";
exports.__esModule = true;
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
var react_1 = require("react");
var antd_1 = require("antd");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
// ===== 假資料（可日後改為 API 串接） =====
var seededRand = function (seed) {
    // 簡單可重現亂數（展示用）
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};
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
// 取樣自你提供的清單，節錄幾筆示意
var workOrders = [
    { key: 1, process: '打頭', machine: 'A101', order: 'J512-25080228', toolName: 'A_主模具', toolNo: 'MISCXA03', moldId: 'MISCXA03_02', life: 1000000, start: 23058, prod: 0, total: 23058 },
    { key: 2, process: '打頭', machine: 'A104', order: 'J512-25060262', toolName: 'A_主模具', toolNo: 'MISCZ0813', moldId: 'MISCZ0813_08', life: 1000000, start: 94267, prod: 0, total: 94267 },
    { key: 3, process: '搓牙', machine: 'B104', order: 'J512-25060212', toolName: 'M_牙板(下牙板)', toolNo: 'MISCT552', moldId: 'MISCT552_05', life: 1000000, start: 99376, prod: 0, total: 99376 },
    { key: 4, process: '搓牙', machine: 'C107', order: 'J512-25060102', toolName: 'M_牙板(下牙板)', toolNo: 'MISCZ0823', moldId: 'MISCZ0823_04', life: 1000000, start: 55574, prod: 0, total: 55574 },
    { key: 5, process: '打頭', machine: 'D106', order: 'J512-25070475', toolName: 'A_主模具', toolNo: 'MISCZ0813', moldId: 'MISCZ0813_06', life: 1000000, start: 76377, prod: 0, total: 76377 },
];
// === 主要失效模式（FMECA）定義：避免 ReferenceError ===
var failureModes = [
    { mode: '崩角/裂紋', weight: 0.42, contrib: ['峰值打擊力', '週期溫升', '材料硬度偏差'] },
    { mode: '磨耗超限', weight: 0.35, contrib: ['總衝次(Shots)', '潤滑不良', '切屑堵塞'] },
    { mode: '咬模', weight: 0.23, contrib: ['進刀速度', '牙型負載', '表面粗糙度'] },
];
// 由工單行產生 RUL/健康度估計（展示用簡化公式）
var deriveMetrics = function (row) {
    var _a, _b;
    if (!row)
        return null;
    var usedRatio = row.total / Math.max(1, row.life);
    var baseHealth = Math.max(0, 100 - usedRatio * 100 * 1.05); // 使用越多健康度越低
    var seed = row.machine.charCodeAt(0) + row.machine.charCodeAt(row.machine.length - 1);
    var trend = makeTrend(seed, 14, baseHealth, -2 + (seededRand(seed) - 0.5));
    var rulShots = Math.max(0, Math.round(row.life - row.total));
    var shotsPerHour = 500; // 假設 500 shots/hr（展示用）
    var rulHours = Math.round(rulShots / shotsPerHour);
    var conf = 0.82 + seededRand(seed) * 0.15; // 0.82~0.97
    return { trend: trend, rulShots: rulShots, rulHours: rulHours, conf: conf, health: (_b = (_a = trend.at(-1)) === null || _a === void 0 ? void 0 : _a.health) !== null && _b !== void 0 ? _b : baseHealth };
};
// 衍生：街機風 Super Meter（依健康度與信心度估算，僅示意）
var calcSuper = function (metrics) {
    var _a, _b;
    if (!metrics)
        return 0;
    var fatigue = 100 - Math.max(0, Math.min(100, (_a = metrics.health) !== null && _a !== void 0 ? _a : 0)); // 越疲勞越快充
    var confidence = Math.max(0, Math.min(1, ((_b = metrics.conf) !== null && _b !== void 0 ? _b : 0))); // 0~1
    var base = fatigue * 0.6 + confidence * 40; // 0~100
    return Math.max(0, Math.min(100, Math.round(base)));
};
// ===== 表格欄位：整合 RUL / 健康度 / 使用比例 =====
var buildColumns = function (getHealthForRow, getRULForRow) { return [
    { title: '製程', dataIndex: 'process', key: 'process', render: function (t) { return React.createElement(antd_1.Tag, { color: t === '打頭' ? 'blue' : 'volcano' }, t); } },
    { title: '機台', dataIndex: 'machine', key: 'machine' },
    { title: '工單單號', dataIndex: 'order', key: 'order' },
    { title: '模具品項名稱', dataIndex: 'toolName', key: 'toolName' },
    { title: '模具料號', dataIndex: 'toolNo', key: 'toolNo' },
    { title: '模具編號', dataIndex: 'moldId', key: 'moldId' },
    { title: '壽命數量', dataIndex: 'life', key: 'life', render: function (v) { var _a, _b; return (_b = (_a = v === null || v === void 0 ? void 0 : v.toLocaleString) === null || _a === void 0 ? void 0 : _a.call(v)) !== null && _b !== void 0 ? _b : v; } },
    { title: '開始數量', dataIndex: 'start', key: 'start', render: function (v) { var _a, _b; return (_b = (_a = v === null || v === void 0 ? void 0 : v.toLocaleString) === null || _a === void 0 ? void 0 : _a.call(v)) !== null && _b !== void 0 ? _b : v; } },
    { title: '生產數量', dataIndex: 'prod', key: 'prod', render: function (v) { var _a, _b; return (_b = (_a = v === null || v === void 0 ? void 0 : v.toLocaleString) === null || _a === void 0 ? void 0 : _a.call(v)) !== null && _b !== void 0 ? _b : v; } },
    { title: '合計', dataIndex: 'total', key: 'total', render: function (v) { var _a, _b; return (_b = (_a = v === null || v === void 0 ? void 0 : v.toLocaleString) === null || _a === void 0 ? void 0 : _a.call(v)) !== null && _b !== void 0 ? _b : v; } },
    { title: '使用比例(%)', key: 'ratio', render: function (_, r) { return ((r.total / r.life) * 100).toFixed(2); } },
    { title: '健康度', key: 'health', render: function (_, r) {
            var h = getHealthForRow(r);
            var theory = 100 - (r.total / Math.max(1, r.life)) * 100;
            return React.createElement(HealthBar, { value: h, theory: theory, compact: true, hudRight: r.machine + " \u2022 " + r.order });
        }
    },
    { title: '預測剩餘壽命(衝次)', key: 'rul', render: function (_, r) { return getRULForRow(r); } },
]; };
// === 遊戲血條樣式健康度元件（街機格鬥風） ===
function HealthBar(_a) {
    var value = _a.value, _b = _a.compact, compact = _b === void 0 ? false : _b, _c = _a.recent, recent = _c === void 0 ? 0 : _c, _d = _a.theory, theory = _d === void 0 ? 100 : _d, hudRight = _a.hudRight;
    var v = Math.max(0, Math.min(100, value || 0));
    var r = Math.max(0, Math.min(100, recent || 0));
    var t = Math.max(0, Math.min(100, theory || 0));
    var height = compact ? 12 : 18;
    var radius = compact ? 6 : 8;
    var barColor = v > 66 ? '#16a34a' : v > 33 ? '#eab308' : '#ef4444';
    var borderColor = '#1f2937';
    var trackColor = 'linear-gradient(180deg, #0b0f1a, #121826)';
    var chipWidth = Math.min(100, v + r);
    var ticks = [25, 50, 75];
    var critical = v < 30;
    return (React.createElement("div", { className: "w-full flex items-center gap-2", style: { minWidth: 140 } },
        React.createElement("div", { style: { position: 'relative', height: height, width: '100%' } },
            React.createElement("div", { style: { position: 'absolute', inset: 0, background: trackColor, border: "1px solid " + borderColor, borderRadius: radius, boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.08), 0 1px 1px rgba(0,0,0,0.4)' } }),
            React.createElement("div", { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: t + "%", borderRadius: radius, border: '1px solid rgba(88,199,250,0.75)', boxShadow: 'inset 0 0 6px rgba(88,199,250,0.35)', pointerEvents: 'none' } }),
            React.createElement("div", { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: chipWidth + "%", background: 'linear-gradient(180deg,#facc15,#d4af37)', borderRadius: radius, transition: 'width 300ms ease-out', opacity: 0.6 } }),
            React.createElement("div", { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: v + "%", background: "linear-gradient(180deg, " + barColor + ", " + barColor + "90)", borderRadius: radius, transition: 'width 250ms ease-in', boxShadow: 'inset 0 0 6px rgba(0,0,0,0.35)', animation: critical ? 'pulse 0.8s ease-in-out infinite' : undefined } }),
            ticks.map(function (tk) { return (React.createElement("div", { key: tk, style: { position: 'absolute', left: tk + "%", top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.12)' } })); }),
            React.createElement("div", { style: { position: 'absolute', left: 2, right: 2, top: 1, height: 1, background: 'rgba(255,255,255,0.45)', borderRadius: radius } }),
            hudRight && (React.createElement("div", { style: { position: 'absolute', right: -4, top: -22, background: 'rgba(15,23,42,0.9)', color: '#e5e7eb', fontSize: 10, padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(2px)' } }, hudRight))),
        React.createElement("span", { className: "text-xs", style: { minWidth: 42, textAlign: 'right' } },
            Math.round(v),
            "%")));
}
// === Super Meter（必殺計量條）===
function SuperMeter(_a) {
    var _b = _a.value, value = _b === void 0 ? 0 : _b, _c = _a.label, label = _c === void 0 ? 'SUPER' : _c;
    var v = Math.max(0, Math.min(100, value));
    var filled = v >= 100;
    return (React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        React.createElement("span", { style: { fontSize: 12, letterSpacing: 1, color: '#60a5fa' } }, label),
        React.createElement("div", { style: { flex: 1, height: 10, position: 'relative', background: 'linear-gradient(180deg,#0b1020,#0f172a)', border: '1px solid #1d4ed8', borderRadius: 6, overflow: 'hidden', boxShadow: 'inset 0 0 8px rgba(29,78,216,0.35)' } },
            React.createElement("div", { style: { position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg, rgba(96,165,250,0.08) 0 8px, rgba(59,130,246,0.08) 8px 16px)', pointerEvents: 'none' } }),
            React.createElement("div", { style: { height: '100%', width: v + "%", background: 'linear-gradient(90deg,#3b82f6,#22d3ee)', transition: 'width 220ms ease-out', boxShadow: '0 0 12px rgba(56,189,248,0.45)' } }),
            React.createElement("div", { style: { position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, pointerEvents: 'none' } })),
        filled ? (React.createElement(antd_1.Tag, { color: "cyan", style: { marginLeft: 4 } },
            React.createElement(lucide_react_1.Zap, { size: 14, style: { marginRight: 4 } }),
            "ULTRA READY")) : (React.createElement(antd_1.Tag, { color: "geekblue", style: { marginLeft: 4 } },
            v,
            "%"))));
}
// 角色頭像卡（機台/模具視為角色）
function AvatarCard(_a) {
    var _b = _a.side, side = _b === void 0 ? 'left' : _b, title = _a.title, subtitle = _a.subtitle, extra = _a.extra;
    return (React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, justifyContent: side === 'right' ? 'flex-end' : 'flex-start' } },
        side === 'left' && React.createElement("div", { style: { width: 40, height: 40, borderRadius: 8, background: 'linear-gradient(135deg,#1f2937,#0b1020)', border: '1px solid rgba(255,255,255,0.12)' } }),
        React.createElement("div", { style: { lineHeight: 1.1 } },
            React.createElement("div", { style: { fontWeight: 700, color: '#e5e7eb' } }, title),
            React.createElement("div", { style: { fontSize: 12, color: '#93a3b8' } }, subtitle),
            extra && React.createElement("div", { style: { fontSize: 11, color: '#9ca3af' } }, extra)),
        side === 'right' && React.createElement("div", { style: { width: 40, height: 40, borderRadius: 8, background: 'linear-gradient(135deg,#1f2937,#0b1020)', border: '1px solid rgba(255,255,255,0.12)' } })));
}
// 極端值浮動徽章（KO/Perfect）
function SideBadges(_a) {
    var _b, _c, _d;
    var metrics = _a.metrics, trigger = _a.trigger;
    var _e = react_1.useState(false), visible = _e[0], setVisible = _e[1];
    var ko = ((_b = metrics === null || metrics === void 0 ? void 0 : metrics.health) !== null && _b !== void 0 ? _b : 0) <= 10;
    var perfect = ((_c = metrics === null || metrics === void 0 ? void 0 : metrics.health) !== null && _c !== void 0 ? _c : 0) >= 95 && ((_d = metrics === null || metrics === void 0 ? void 0 : metrics.conf) !== null && _d !== void 0 ? _d : 0) >= 0.9;
    react_1.useEffect(function () {
        if (ko || perfect) {
            setVisible(true);
            var t_1 = setTimeout(function () { return setVisible(false); }, 1200);
            return function () { return clearTimeout(t_1); };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger, ko, perfect]);
    if (!visible)
        return null;
    return (React.createElement("div", { className: "badge-float" },
        ko && React.createElement(antd_1.Tag, { color: "red", style: { fontWeight: 800, letterSpacing: 1 } }, "KO"),
        perfect && React.createElement(antd_1.Tag, { color: "green", style: { fontWeight: 800, letterSpacing: 1, marginLeft: 8 } }, "PERFECT")));
}
// === Dev 測試（簡易斷言）===
function devAsserts() {
    var isArray = Array.isArray;
    var ok = function (cond, msg) { if (!cond)
        console.error("[TEST FAILED] " + msg); };
    // 測試 1：failureModes 需存在且格式正確
    ok(isArray(failureModes), 'failureModes 應為陣列');
    ok(failureModes.every(function (m) { return m && typeof m.mode === 'string' && typeof m.weight === 'number' && isArray(m.contrib); }), 'failureModes 內容格式錯誤');
    // 測試 2：workOrders 至少有一筆，且數值欄位為數字
    ok(isArray(workOrders) && workOrders.length > 0, 'workOrders 應至少一筆');
    ok(workOrders.every(function (w) { return typeof w.life === 'number' && typeof w.total === 'number'; }), 'workOrders 數值欄位格式錯誤');
    // 測試 3：deriveMetrics 需可回傳預期欄位
    var sample = deriveMetrics(workOrders[0]);
    ok(!!sample && typeof sample.rulShots === 'number' && typeof sample.health === 'number', 'deriveMetrics 回傳內容不完整');
}
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    devAsserts();
}
function AIForgingThreadingSuite() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
    var _12 = react_1.useState((_b = (_a = workOrders[0]) === null || _a === void 0 ? void 0 : _a.key) !== null && _b !== void 0 ? _b : null), selectedKey = _12[0], setSelectedKey = _12[1];
    var selectedRow = react_1.useMemo(function () { var _a; return (_a = workOrders.find(function (w) { return w.key === selectedKey; })) !== null && _a !== void 0 ? _a : null; }, [selectedKey]);
    var _13 = react_1.useState(false), mounted = _13[0], setMounted = _13[1];
    react_1.useEffect(function () { setMounted(true); }, []);
    var _14 = react_1.useState(true), arcade = _14[0], setArcade = _14[1];
    var _15 = react_1.useState(0), combo = _15[0], setCombo = _15[1];
    react_1.useEffect(function () {
        if (combo <= 0)
            return;
        var t = setTimeout(function () { return setCombo(0); }, 1800);
        return function () { return clearTimeout(t); };
    }, [combo]);
    // 針對「打頭」與「搓牙」各別決定要用誰的資料：
    var headingRow = react_1.useMemo(function () { return (selectedRow === null || selectedRow === void 0 ? void 0 : selectedRow.process) === '打頭' ? selectedRow : workOrders.find(function (w) { return w.process === '打頭'; }); }, [selectedRow]);
    var threadingRow = react_1.useMemo(function () { return (selectedRow === null || selectedRow === void 0 ? void 0 : selectedRow.process) === '搓牙' ? selectedRow : workOrders.find(function (w) { return w.process === '搓牙'; }); }, [selectedRow]);
    var headingMetrics = react_1.useMemo(function () { return deriveMetrics(headingRow); }, [headingRow]);
    var threadingMetrics = react_1.useMemo(function () { return deriveMetrics(threadingRow); }, [threadingRow]);
    var headingSuper = react_1.useMemo(function () { return calcSuper(headingMetrics); }, [headingMetrics]);
    var threadingSuper = react_1.useMemo(function () { return calcSuper(threadingMetrics); }, [threadingMetrics]);
    var columns = react_1.useMemo(function () { return buildColumns(function (r) { var _a, _b; return (_b = (_a = deriveMetrics(r)) === null || _a === void 0 ? void 0 : _a.health) !== null && _b !== void 0 ? _b : 0; }, function (r) { var _a, _b; return (_b = (_a = deriveMetrics(r)) === null || _a === void 0 ? void 0 : _a.rulShots) !== null && _b !== void 0 ? _b : 0; }); }, []);
    // 圖表切換 FX
    var _16 = react_1.useState(false), fxShake = _16[0], setFxShake = _16[1];
    var _17 = react_1.useState(false), fxFlash = _17[0], setFxFlash = _17[1];
    react_1.useEffect(function () {
        if (selectedKey == null)
            return;
        setFxShake(true);
        setFxFlash(true);
        var a = setTimeout(function () { return setFxShake(false); }, 380);
        var b = setTimeout(function () { return setFxFlash(false); }, 320);
        return function () { clearTimeout(a); clearTimeout(b); };
    }, [selectedKey]);
    react_1.useEffect(function () {
        if (headingSuper >= 100 || threadingSuper >= 100) {
            setFxFlash(true);
            var t_2 = setTimeout(function () { return setFxFlash(false); }, 420);
            return function () { return clearTimeout(t_2); };
        }
    }, [headingSuper, threadingSuper]);
    return (React.createElement(React.Fragment, null,
        React.createElement("style", null, "\n        @keyframes pulse{0%{filter:brightness(1)}50%{filter:brightness(1.35)}100%{filter:brightness(1)}}\n        @keyframes scan { 0% { background-position: 0 0; } 100% { background-position: 0 100vh; } }\n        .crt-scanlines::after {\n          content: '';\n          position: fixed; left:0; top:0; right:0; bottom:0; pointer-events:none; z-index: 0;\n          background: repeating-linear-gradient( to bottom, rgba(255,255,255,0.03) 0 2px, rgba(0,0,0,0.03) 2px 4px );\n          animation: scan 8s linear infinite;\n        }\n        .neon-title { text-shadow: 0 0 8px rgba(99,102,241,0.65), 0 0 18px rgba(56,189,248,0.45); }\n  .vs-chip { background: linear-gradient(90deg,#111827,#0b1020); border:1px solid rgba(255,255,255,0.08); box-shadow: inset 0 0 24px rgba(99,102,241,0.12); }\n  @keyframes shake { 0%{transform:translate(0,0)} 20%{transform:translate(-2px,1px)} 40%{transform:translate(2px,-1px)} 60%{transform:translate(-1px,2px)} 80%{transform:translate(1px,-2px)} 100%{transform:translate(0,0)} }\n  .fx-shake { animation: shake .35s ease-in-out; }\n  @keyframes flash { 0%{filter:brightness(1)} 40%{filter:brightness(1.35)} 100%{filter:brightness(1)} }\n  .fx-flash { animation: flash .35s ease-in-out; }\n  @keyframes pop { 0%{transform:scale(.7); opacity:0} 60%{transform:scale(1.08); opacity:1} 100%{transform:scale(1); opacity:1} }\n  .badge-float { position:absolute; left:50%; top:14%; transform:translate(-50%,-50%); z-index:2; padding:8px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.22); background: rgba(0,0,0,0.35); backdrop-filter: blur(2px); animation: pop .28s ease-out; pointer-events:none; }\n      "),
        React.createElement("div", { className: "p-6 min-h-screen " + (arcade ? 'crt-scanlines' : ''), style: { background: 'radial-gradient(1200px 600px at 20% -10%, #0b1020 0%, #0a0f1f 35%, #060a16 60%, #04070f 100%)' } },
            React.createElement(antd_1.Typography.Title, { level: 2, className: "neon-title" }, "AI \u667A\u80FD\u88FD\u7A0B\u5957\u4EF6 \u2014 \u6253\u982D/\u6413\u7259\uFF08RUL + \u5DE5\u55AE\u6574\u5408\uFF09"),
            React.createElement(antd_1.Typography.Paragraph, null,
                "\u9EDE\u9078\u4E0B\u65B9 ",
                React.createElement("b", null, "\u5DE5\u55AE/\u6A5F\u53F0"),
                " \u4EFB\u4E00\u5217\uFF0C\u4E0A\u65B9\u7684 ",
                React.createElement("b", null, "RUL \u7E3D\u89BD"),
                " \u8207 ",
                React.createElement("b", null, "\u8DA8\u52E2\u5716"),
                " \u5C07\u81EA\u52D5\u5207\u63DB\u70BA\u8A72\u7B46\u6A5F\u53F0/\u6A21\u5177\u7684\u5373\u6642\u8996\u5716\u3002"),
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, background: 'linear-gradient(180deg, rgba(17,24,39,0.9), rgba(2,6,23,0.85))', boxShadow: 'inset 0 0 24px rgba(99,102,241,0.12), 0 1px 8px rgba(0,0,0,0.35)' } },
                React.createElement(antd_1.Space, { size: 12, align: "center" },
                    React.createElement(lucide_react_1.Gauge, { size: 16, color: "#60a5fa" }),
                    React.createElement(antd_1.Tag, { color: "purple" }, "STAGE 1"),
                    React.createElement(antd_1.Tag, { color: "geekblue" }, "ROUND 1"),
                    React.createElement(antd_1.Tag, { color: "gold" },
                        "SCORE ",
                        React.createElement("b", null, (headingSuper + threadingSuper) * 10))),
                React.createElement(antd_1.Space, { size: 12, align: "center" },
                    combo > 0 && (React.createElement(antd_1.Tag, { color: "red", style: { fontSize: 14, fontWeight: 700, letterSpacing: 1 } },
                        React.createElement(lucide_react_1.Flame, { size: 14, style: { marginRight: 6 } }),
                        "COMBO x",
                        combo)),
                    React.createElement(antd_1.Button, { size: "small", type: arcade ? 'primary' : 'default', onClick: function () { return setArcade(function (v) { return !v; }); }, icon: React.createElement(lucide_react_1.Trophy, { size: 14 }) }, arcade ? 'Arcade Mode: ON' : 'Arcade Mode: OFF'))),
            React.createElement("div", { className: "vs-chip", style: { marginTop: 12, padding: '10px 12px', borderRadius: 10 } },
                React.createElement(antd_1.Row, { gutter: [12, 12], align: "middle" },
                    React.createElement(antd_1.Col, { xs: 10, style: { display: 'flex', gap: 8, alignItems: 'center' } },
                        React.createElement(lucide_react_1.Hammer, { size: 18, color: "#93c5fd" }),
                        React.createElement("b", null, (_c = headingRow === null || headingRow === void 0 ? void 0 : headingRow.machine) !== null && _c !== void 0 ? _c : '—'),
                        React.createElement(antd_1.Tag, { color: "blue" }, "\u6253\u982D"),
                        React.createElement(SuperMeter, { value: headingSuper, label: "SUPER" })),
                    React.createElement(antd_1.Col, { xs: 4, style: { textAlign: 'center' } },
                        React.createElement(antd_1.Typography.Title, { level: 4, style: { margin: 0, color: '#e5e7eb', textShadow: '0 0 10px rgba(255,255,255,0.25)' } }, "VS")),
                    React.createElement(antd_1.Col, { xs: 10, style: { display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' } },
                        React.createElement(antd_1.Tag, { color: "volcano" }, "\u6413\u7259"),
                        React.createElement("b", null, (_d = threadingRow === null || threadingRow === void 0 ? void 0 : threadingRow.machine) !== null && _d !== void 0 ? _d : '—'),
                        React.createElement(lucide_react_1.Wrench, { size: 18, color: "#fda4af" }),
                        React.createElement(SuperMeter, { value: threadingSuper, label: "SUPER" })))),
            React.createElement(antd_1.Row, { gutter: [16, 16], style: { marginTop: 12 } },
                React.createElement(antd_1.Col, { xs: 24, lg: 12 },
                    React.createElement(antd_1.Card, { style: { position: 'relative' }, title: React.createElement(antd_1.Space, null,
                            React.createElement(lucide_react_1.Hammer, { size: 18 }),
                            "\u6253\u982D\u6A21\u5177 RUL \u7E3D\u89BD"), extra: React.createElement(antd_1.Space, null,
                            React.createElement(antd_1.Tag, { color: "blue" }, "Heading"),
                            headingRow && React.createElement(antd_1.Tag, null, headingRow.machine)) },
                        React.createElement(AvatarCard, { side: "left", title: (_e = headingRow === null || headingRow === void 0 ? void 0 : headingRow.machine) !== null && _e !== void 0 ? _e : '—', subtitle: (_f = headingRow === null || headingRow === void 0 ? void 0 : headingRow.moldId) !== null && _f !== void 0 ? _f : '', extra: (_g = headingRow === null || headingRow === void 0 ? void 0 : headingRow.toolName) !== null && _g !== void 0 ? _g : '' }),
                        React.createElement(antd_1.Row, { gutter: 12 },
                            React.createElement(antd_1.Col, { span: 8 },
                                React.createElement(antd_1.Statistic, { title: "\u4F30\u8A08\u5269\u9918\u885D\u6B21", value: (_h = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.rulShots) !== null && _h !== void 0 ? _h : 0 })),
                            React.createElement(antd_1.Col, { span: 8 },
                                React.createElement(antd_1.Statistic, { title: "\u4F30\u8A08\u5269\u9918\u5C0F\u6642", value: (_j = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.rulHours) !== null && _j !== void 0 ? _j : 0 })),
                            React.createElement(antd_1.Col, { span: 8 },
                                React.createElement(antd_1.Statistic, { title: "\u4FE1\u5FC3\u5EA6", value: Math.round(((_k = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.conf) !== null && _k !== void 0 ? _k : 0) * 100), suffix: "%" }))),
                        React.createElement("div", { style: { marginTop: 8 } },
                            React.createElement(SuperMeter, { value: headingSuper })),
                        React.createElement(antd_1.Divider, null),
                        React.createElement(antd_1.Row, { gutter: 12 },
                            React.createElement(antd_1.Col, { span: 12 },
                                React.createElement(antd_1.Typography.Text, { type: "secondary" }, "\u5065\u5EB7\u5EA6\u8DA8\u52E2\uFF0814 \u5929\uFF09"),
                                React.createElement("div", { style: { height: 200 }, className: (fxShake ? 'fx-shake ' : '') + (fxFlash ? 'fx-flash' : '') }, mounted ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: "100%" },
                                    React.createElement(recharts_1.AreaChart, { data: (_l = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.trend) !== null && _l !== void 0 ? _l : [], margin: { left: 0, right: 0, top: 10, bottom: 0 } },
                                        React.createElement("defs", null,
                                            React.createElement("linearGradient", { id: "h", x1: "0", y1: "0", x2: "0", y2: "1" },
                                                React.createElement("stop", { offset: "5%", stopColor: "#8884d8", stopOpacity: 0.6 }),
                                                React.createElement("stop", { offset: "95%", stopColor: "#8884d8", stopOpacity: 0.1 }))),
                                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                        React.createElement(recharts_1.XAxis, { dataKey: "day", tick: { fontSize: 12 } }),
                                        React.createElement(recharts_1.YAxis, { tick: { fontSize: 12 }, domain: [0, 100] }),
                                        React.createElement(recharts_1.Tooltip, null),
                                        React.createElement(recharts_1.Area, { type: "monotone", dataKey: "health", stroke: "#8884d8", fillOpacity: 1, fill: "url(#h)" })))) : (React.createElement("div", { style: { height: '100%', borderRadius: 6, background: 'linear-gradient(90deg, #f5f5f5, #e9e9e9)' } })))),
                            React.createElement(antd_1.Col, { span: 12 },
                                React.createElement(antd_1.Typography.Text, { type: "secondary" }, "\u6253\u64CA\u529B/\u6EAB\u5EA6\uFF08\u7279\u5FB5\u6F02\u79FB\uFF09"),
                                React.createElement("div", { style: { height: 200 }, className: (fxShake ? 'fx-shake ' : '') + (fxFlash ? 'fx-flash' : '') }, mounted ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: "100%" },
                                    React.createElement(recharts_1.LineChart, { data: (_m = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.trend) !== null && _m !== void 0 ? _m : [], margin: { left: 0, right: 0, top: 10, bottom: 0 } },
                                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                        React.createElement(recharts_1.XAxis, { dataKey: "day", tick: { fontSize: 12 } }),
                                        React.createElement(recharts_1.YAxis, { tick: { fontSize: 12 } }),
                                        React.createElement(recharts_1.Tooltip, null),
                                        React.createElement(recharts_1.Legend, null),
                                        React.createElement(recharts_1.Line, { type: "monotone", dataKey: "force", stroke: "#82ca9d", dot: false, name: "\u6253\u64CA\u529B(kN)" }),
                                        React.createElement(recharts_1.Line, { type: "monotone", dataKey: "temp", stroke: "#8884d8", dot: false, name: "\u6EAB\u5EA6(\u00B0C)" })))) : (React.createElement("div", { style: { height: '100%', borderRadius: 6, background: 'linear-gradient(90deg, #f5f5f5, #e9e9e9)' } }))))),
                        React.createElement(antd_1.Divider, null),
                        React.createElement(antd_1.Space, { direction: "vertical", style: { width: '100%' } },
                            React.createElement("div", null,
                                React.createElement(antd_1.Typography.Text, { type: "secondary" }, "\u5065\u5EB7\u5EA6"),
                                React.createElement(HealthBar, { value: (_o = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.health) !== null && _o !== void 0 ? _o : 0, theory: 100 - (Math.max(0, ((_p = headingRow === null || headingRow === void 0 ? void 0 : headingRow.total) !== null && _p !== void 0 ? _p : 0)) / Math.max(1, ((_q = headingRow === null || headingRow === void 0 ? void 0 : headingRow.life) !== null && _q !== void 0 ? _q : 1))) * 100, hudRight: ((_r = headingRow === null || headingRow === void 0 ? void 0 : headingRow.machine) !== null && _r !== void 0 ? _r : '') + " \u2022 " + ((_s = headingRow === null || headingRow === void 0 ? void 0 : headingRow.order) !== null && _s !== void 0 ? _s : '') })),
                            headingRow && React.createElement(antd_1.Tag, null,
                                "\u5DE5\u55AE ",
                                headingRow.order),
                            headingRow && React.createElement(antd_1.Tag, null,
                                "\u6A21\u5177 ",
                                headingRow.moldId),
                            mounted && React.createElement(antd_1.Tag, { color: "geekblue" },
                                "\u8CC7\u6599\u66F4\u65B0 ",
                                new Date().toLocaleDateString()),
                            React.createElement(antd_1.Tag, { color: "purple" }, "\u6A21\u578B\uFF1ALSTM + XGBoost")),
                        React.createElement(SideBadges, { metrics: headingMetrics, trigger: selectedKey + "-" + ((_t = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.health) !== null && _t !== void 0 ? _t : '') + "-" + ((_u = headingMetrics === null || headingMetrics === void 0 ? void 0 : headingMetrics.conf) !== null && _u !== void 0 ? _u : '') }))),
                React.createElement(antd_1.Col, { xs: 24, lg: 12 },
                    React.createElement(antd_1.Card, { style: { position: 'relative' }, title: React.createElement(antd_1.Space, null,
                            React.createElement(lucide_react_1.Wrench, { size: 18 }),
                            "\u6413\u7259\u6A21\u5177 RUL \u7E3D\u89BD"), extra: React.createElement(antd_1.Space, null,
                            React.createElement(antd_1.Tag, { color: "volcano" }, "Threading"),
                            threadingRow && React.createElement(antd_1.Tag, null, threadingRow.machine)) },
                        React.createElement(AvatarCard, { side: "right", title: (_v = threadingRow === null || threadingRow === void 0 ? void 0 : threadingRow.machine) !== null && _v !== void 0 ? _v : '—', subtitle: (_w = threadingRow === null || threadingRow === void 0 ? void 0 : threadingRow.moldId) !== null && _w !== void 0 ? _w : '', extra: (_x = threadingRow === null || threadingRow === void 0 ? void 0 : threadingRow.toolName) !== null && _x !== void 0 ? _x : '' }),
                        React.createElement(antd_1.Row, { gutter: 12 },
                            React.createElement(antd_1.Col, { span: 8 },
                                React.createElement(antd_1.Statistic, { title: "\u4F30\u8A08\u5269\u9918\u885D\u6B21", value: (_y = threadingMetrics === null || threadingMetrics === void 0 ? void 0 : threadingMetrics.rulShots) !== null && _y !== void 0 ? _y : 0 })),
                            React.createElement(antd_1.Col, { span: 8 },
                                React.createElement(antd_1.Statistic, { title: "\u4F30\u8A08\u5269\u9918\u5C0F\u6642", value: (_z = threadingMetrics === null || threadingMetrics === void 0 ? void 0 : threadingMetrics.rulHours) !== null && _z !== void 0 ? _z : 0 })),
                            React.createElement(antd_1.Col, { span: 8 },
                                React.createElement(antd_1.Statistic, { title: "\u4FE1\u5FC3\u5EA6", value: Math.round(((_0 = threadingMetrics === null || threadingMetrics === void 0 ? void 0 : threadingMetrics.conf) !== null && _0 !== void 0 ? _0 : 0) * 100), suffix: "%" }))),
                        React.createElement("div", { style: { marginTop: 8 } },
                            React.createElement(SuperMeter, { value: threadingSuper })),
                        React.createElement(antd_1.Divider, null),
                        React.createElement(antd_1.Row, { gutter: 12 },
                            React.createElement(antd_1.Col, { span: 12 },
                                React.createElement(antd_1.Typography.Text, { type: "secondary" }, "\u5065\u5EB7\u5EA6\u8DA8\u52E2\uFF0814 \u5929\uFF09"),
                                React.createElement("div", { style: { height: 200 }, className: (fxShake ? 'fx-shake ' : '') + (fxFlash ? 'fx-flash' : '') }, mounted ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: "100%" },
                                    React.createElement(recharts_1.AreaChart, { data: (_1 = threadingMetrics === null || threadingMetrics === void 0 ? void 0 : threadingMetrics.trend) !== null && _1 !== void 0 ? _1 : [], margin: { left: 0, right: 0, top: 10, bottom: 0 } },
                                        React.createElement("defs", null,
                                            React.createElement("linearGradient", { id: "t", x1: "0", y1: "0", x2: "0", y2: "1" },
                                                React.createElement("stop", { offset: "5%", stopColor: "#82ca9d", stopOpacity: 0.6 }),
                                                React.createElement("stop", { offset: "95%", stopColor: "#82ca9d", stopOpacity: 0.1 }))),
                                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                        React.createElement(recharts_1.XAxis, { dataKey: "day", tick: { fontSize: 12 } }),
                                        React.createElement(recharts_1.YAxis, { tick: { fontSize: 12 }, domain: [0, 100] }),
                                        React.createElement(recharts_1.Tooltip, null),
                                        React.createElement(recharts_1.Area, { type: "monotone", dataKey: "health", stroke: "#82ca9d", fillOpacity: 1, fill: "url(#t)" })))) : (React.createElement("div", { style: { height: '100%', borderRadius: 6, background: 'linear-gradient(90deg, #f5f5f5, #e9e9e9)' } })))),
                            React.createElement(antd_1.Col, { span: 12 },
                                React.createElement(antd_1.Typography.Text, { type: "secondary" }, "\u9032\u5200\u8CA0\u8F09/\u6EAB\u5EA6\uFF08\u7279\u5FB5\u6F02\u79FB\uFF09"),
                                React.createElement("div", { style: { height: 200 }, className: (fxShake ? 'fx-shake ' : '') + (fxFlash ? 'fx-flash' : '') }, mounted ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: "100%" },
                                    React.createElement(recharts_1.LineChart, { data: (_2 = threadingMetrics === null || threadingMetrics === void 0 ? void 0 : threadingMetrics.trend) !== null && _2 !== void 0 ? _2 : [], margin: { left: 0, right: 0, top: 10, bottom: 0 } },
                                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                        React.createElement(recharts_1.XAxis, { dataKey: "day", tick: { fontSize: 12 } }),
                                        React.createElement(recharts_1.YAxis, { tick: { fontSize: 12 } }),
                                        React.createElement(recharts_1.Tooltip, null),
                                        React.createElement(recharts_1.Legend, null),
                                        React.createElement(recharts_1.Line, { type: "monotone", dataKey: "force", stroke: "#82ca9d", dot: false, name: "\u9032\u5200\u8CA0\u8F09(kN)" }),
                                        React.createElement(recharts_1.Line, { type: "monotone", dataKey: "temp", stroke: "#8884d8", dot: false, name: "\u6EAB\u5EA6(\u00B0C)" })))) : (React.createElement("div", { style: { height: '100%', borderRadius: 6, background: 'linear-gradient(90deg, #f5f5f5, #e9e9e9)' } }))))),
                        React.createElement(antd_1.Divider, null),
                        React.createElement(antd_1.Space, { direction: "vertical", style: { width: '100%' } },
                            React.createElement("div", null,
                                React.createElement(antd_1.Typography.Text, { type: "secondary" }, "\u5065\u5EB7\u5EA6"),
                                React.createElement(HealthBar, { value: (_3 = threadingMetrics === null || threadingMetrics === void 0 ? void 0 : threadingMetrics.health) !== null && _3 !== void 0 ? _3 : 0, theory: 100 - (Math.max(0, ((_4 = threadingRow === null || threadingRow === void 0 ? void 0 : threadingRow.total) !== null && _4 !== void 0 ? _4 : 0)) / Math.max(1, ((_5 = threadingRow === null || threadingRow === void 0 ? void 0 : threadingRow.life) !== null && _5 !== void 0 ? _5 : 1))) * 100, hudRight: ((_6 = threadingRow === null || threadingRow === void 0 ? void 0 : threadingRow.machine) !== null && _6 !== void 0 ? _6 : '') + " \u2022 " + ((_7 = threadingRow === null || threadingRow === void 0 ? void 0 : threadingRow.order) !== null && _7 !== void 0 ? _7 : '') })),
                            threadingRow && React.createElement(antd_1.Tag, null,
                                "\u5DE5\u55AE ",
                                threadingRow.order),
                            threadingRow && React.createElement(antd_1.Tag, null,
                                "\u6A21\u5177 ",
                                threadingRow.moldId),
                            mounted && React.createElement(antd_1.Tag, { color: "geekblue" },
                                "\u8CC7\u6599\u66F4\u65B0 ",
                                new Date().toLocaleDateString()),
                            React.createElement(antd_1.Tag, { color: "purple" }, "\u6A21\u578B\uFF1AProphet + LightGBM")),
                        React.createElement(SideBadges, { metrics: threadingMetrics, trigger: selectedKey + "-" + ((_8 = threadingMetrics === null || threadingMetrics === void 0 ? void 0 : threadingMetrics.health) !== null && _8 !== void 0 ? _8 : '') + "-" + ((_9 = threadingMetrics === null || threadingMetrics === void 0 ? void 0 : threadingMetrics.conf) !== null && _9 !== void 0 ? _9 : '') })))),
            React.createElement(antd_1.Row, { gutter: [16, 16], className: "mt-4" },
                React.createElement(antd_1.Col, { xs: 24, lg: 10 },
                    React.createElement(antd_1.Card, { title: React.createElement(antd_1.Space, null,
                            React.createElement(lucide_react_1.AlertTriangle, { size: 18 }),
                            "\u4E3B\u8981\u5931\u6548\u6A21\u5F0F\uFF08FMECA\uFF09") }, failureModes.map(function (item) { return (React.createElement("div", { key: item.mode, className: "mb-3" },
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
                        React.createElement(antd_1.Progress, { percent: Math.round(item.weight * 100), status: item.weight > 0.4 ? 'exception' : 'active' }))); }))),
                React.createElement(antd_1.Col, { xs: 24, lg: 14 },
                    React.createElement(antd_1.Card, { title: React.createElement(antd_1.Space, null,
                            React.createElement(lucide_react_1.Activity, { size: 18 }),
                            "\u54C1\u8CEA vs \u8CA0\u8F09\uFF08\u793A\u610F\uFF09") },
                        React.createElement("div", { style: { height: 260 }, className: (fxShake ? 'fx-shake ' : '') + (fxFlash ? 'fx-flash' : '') }, mounted ? (React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: "100%" },
                            React.createElement(recharts_1.BarChart, { data: ((_11 = (_10 = deriveMetrics(workOrders[0])) === null || _10 === void 0 ? void 0 : _10.trend) !== null && _11 !== void 0 ? _11 : []).map(function (d) { return ({ day: d.day, NG: Math.max(0, 5 - d.health / 25), Load: d.force }); }) },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                React.createElement(recharts_1.XAxis, { dataKey: "day" }),
                                React.createElement(recharts_1.YAxis, null),
                                React.createElement(recharts_1.Tooltip, null),
                                React.createElement(recharts_1.Legend, null),
                                React.createElement(recharts_1.Bar, { dataKey: "NG", fill: "#ff7f7f", name: "\u4E0D\u826F\u7387(%)" }),
                                React.createElement(recharts_1.Bar, { dataKey: "Load", fill: "#82ca9d", name: "\u8CA0\u8F09(kN)" })))) : (React.createElement("div", { style: { height: '100%', borderRadius: 6, background: 'linear-gradient(90deg, #f5f5f5, #e9e9e9)' } })))))),
            React.createElement(antd_1.Row, { gutter: [16, 16], className: "mt-4" },
                React.createElement(antd_1.Col, { xs: 24 },
                    React.createElement(antd_1.Card, { title: React.createElement(antd_1.Space, null,
                            React.createElement(lucide_react_1.Gauge, { size: 18 }),
                            "\u73FE\u884C\u751F\u7522\u4E2D \u2014 \u5DE5\u55AE/\u6A5F\u53F0/\u6A21\u5177\uFF08\u9EDE\u9078\u5207\u63DB\u4E0A\u65B9\u8996\u5716\uFF09"), extra: React.createElement(antd_1.Space, null,
                            React.createElement(lucide_react_1.MousePointerClick, { size: 16 }),
                            "\u9EDE\u9078\u4EFB\u4E00\u5217") },
                        React.createElement(antd_1.Table, { columns: columns, dataSource: workOrders, pagination: { pageSize: 8 }, size: "small", rowClassName: function (record) { return record.key === selectedKey ? 'bg-blue-50' : ''; }, onRow: function (record) { return ({ onClick: function () { setSelectedKey(record.key); setCombo(function (c) { return c + 1; }); } }); } })))),
            React.createElement(antd_1.Typography.Paragraph, { className: "text-gray-400 text-xs mt-4" }, "\u8A3B\uFF1ARUL\uFF08Remaining Useful Life\uFF09= \u9810\u6E2C\u5269\u9918\u53EF\u7528\u58FD\u547D\uFF1B\u5065\u5EB7\u5EA6\u4EE5 0\u2013100 \u986F\u793A\u3002\u793A\u610F\u8CC7\u6599\u50C5\u4F9B\u756B\u9762\u8207\u6D41\u7A0B\u898F\u5283\u3002"))));
}
exports["default"] = AIForgingThreadingSuite;
