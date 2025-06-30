"use client";

import { Table, Button, Upload, message, DatePicker, Input, Form, Select } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';


interface WorkLog {
  id?: number;
  userId?: number;
  userName?: string;
  date: string;
  task: string;
  content: string;
  hours: number;
}

const columns = [
  { title: '使用者', dataIndex: 'userName', key: 'userName' },
  { 
    title: '日期', 
    dataIndex: 'date', 
    key: 'date',
    //針對日期格式進行處理 如果 date 有值，則將其轉換為台灣地區的日期格式
    // 使用 toLocaleDateString 方法將日期格式化為 yyyy/mm/dd  numeric是數字格式，month是兩位數格式，day是兩位數格式
    // replace 方法將斜線替換為斜線 /\//g, 這裡的 g 是全局匹配的意思  /\//代表正則表達式中的斜線字符
    // 這樣可以確保日期格式為 yyyy/mm/dd
    render: (date: string) => date ? new Date(date).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/') : '',
 },
  { title: '工作事項', dataIndex: 'task', key: 'task' },
  { title: '作業內容', dataIndex: 'content', key: 'content' },
  { title: '工時', dataIndex: 'hours', key: 'hours' },
];

export default function WorkLogBlock() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLogin = localStorage.getItem('isLogin') === '1';
      if (!isLogin) {
        router.replace('/login');
      }
    }
  }, []);
  const [data, setData] = useState<WorkLog[]>([]);
  const [form] = Form.useForm();
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [users, setUsers] = useState<{id: number, name: string}[]>([]);

  // 取得所有使用者
  useEffect(() => {
    fetch('/api/team')
      .then(res => res.json())
      .then(res => {
        if (res.success) setUsers(res.data.map((u: any) => ({ id: u.id, name: u.name })));
      });
  }, []);

  // 頁面載入時自動取得前30筆資料，並補姓名
  useEffect(() => {
    fetch(`/api/worklogs?limit=30`)
      .then(res => res.json())
      .then(res => {
        let logs = res.data || [];
        // 若有 userId 但沒有 userName，補上 userName
        logs = logs.map((log: any) => ({
          ...log,
          userName: log.userName || users.find(u => u.id === log.userId)?.name || log.userId || '',
        }));
        setData(logs);
      });
  }, [users]);

  // 切換使用者時查詢該使用者日誌，並補姓名
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/worklogs?userId=${userId}`)
      .then(res => res.json())
      .then(res => {
        let logs = res.data || [];
        logs = logs.map((log: any) => ({
          ...log,
          userName: log.userName || users.find(u => u.id === log.userId)?.name || log.userId || '',
        }));
        setData(logs);
      });
  }, [userId, users]);

  // Excel 日期轉字串
  const excelDateToString = (excelDate: number | string) => {
    if (typeof excelDate === 'number') {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString().slice(0, 10);
    }
    if (typeof excelDate === 'string' && excelDate.length >= 8) {
      // yyyy-mm-dd or yyyy/mm/dd
      return excelDate.replace(/\//g, '-');
    }
    return excelDate;
  };

  // 匯入 Excel
  const [importing, setImporting] = useState(false);
  const handleImport = (file: File) => {
    if (!userId) {
      message.error('請先選擇使用者');
      return false;
    }
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const workbook = XLSX.read(e.target?.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      let lastDate = '';
      // 檢查第一行是否為標題 json.slice(1) 用於跳過第一行標題 map(row => row) 用於將每一行轉換為物件
      const rows = json.slice(1).map((row: any[]) => {
        // 設置dateVal 為第一列的值，若為空則使用上次的日期 
        let dateVal = row[0];
        // 如果 dateVal 為 undefined null 或空值則使用上次的日期 ；用於處理 excel中 跨欄置中的問題
        if (dateVal === undefined || dateVal === null || dateVal === '') {
          dateVal = lastDate;
        } else {
            // 將 Excel 日期轉為字串格式  excelDateToString是將 Excel 日期轉為字串格式 內建於 XLSX 庫
          dateVal = excelDateToString(dateVal);
          // 如果 dateVal 不是有效日期，則使用上次的日期
          lastDate = dateVal;
        }
        return {
          userId,
          userName: users.find(u => u.id === userId)?.name || '',
          date: dateVal,
          task: row[1],
          content: row[2],
          hours: parseFloat(row[3]),
        };
      }).filter(r => r.date && new Date(r.date).getDay() !== 0 && new Date(r.date).getDay() !== 6);

      // 寫入後端
      for (const row of rows) {
        await fetch('/api/worklogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row),
        });
      }
      // 重新取得資料
      fetch(`/api/worklogs?userId=${userId}`)
        .then(res => res.json())
        .then(res => setData(res.data || []));
      setImporting(false);
      message.success('匯入成功，已寫入資料庫');
    };
    reader.readAsBinaryString(file);
    return false;
  };

  // 新增日誌
  const handleAdd = async (values: any) => {
    if (!userId) {
      message.error('請先選擇使用者');
      return;
    }
    const res = await fetch('/api/worklogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, userId }),
    });
    const result = await res.json();
    if (result.success) {
      setData(prev => [result.data, ...prev]);
      form.resetFields();
      message.success('新增成功');
    }
  };


  // 狀態：多筆日誌填寫
  const [multiLogs, setMultiLogs] = useState([
    { date: '', task: '', content: '', hours: '' }
  ]);
  // 欄位錯誤提示
  const [rowErrors, setRowErrors] = useState<{[k: number]: { [key: string]: string }}>({});

  // 新增一行
  const addLogRow = () => setMultiLogs(prev => ([...prev, { date: '', task: '', content: '', hours: '' }]));
  // 刪除一行
  const removeLogRow = (idx: number) => setMultiLogs(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));
  // 修改欄位
  const updateLogRow = (idx: number, key: string, value: any) => {
    setMultiLogs(prev => prev.map((row, i) => i === idx ? { ...row, [key]: value } : row));
    setRowErrors(prev => {
      const next = { ...prev };
      if (next[idx]) {
        next[idx][key] = '';
      }
      return next;
    });
  };
  // 複製上一行（包含日期）
  const copyPrevRow = (idx: number) => {
    if (idx === 0) return;
    setMultiLogs(prev => prev.map((row, i) => i === idx ? { ...prev[idx - 1] } : row));
  };

  // 鍵盤 Enter 快速跳欄/新增行
  const handleKeyDown = (e: React.KeyboardEvent, idx: number, key: string) => {
    if (e.key === 'Enter') {
      if (key === 'hours' && idx === multiLogs.length - 1) {
        addLogRow();
      }
    }
  };

  // 批次送出
  const handleMultiAdd = async () => {
    if (!userId) {
      message.error('請先選擇使用者');
      return;
    }
    // 驗證
    let hasError = false;
    const errors: {[k: number]: { [key: string]: string }} = {};
    multiLogs.forEach((row, idx) => {
      const err: any = {};
      if (!row.date) err.date = '請選擇日期';
      if (!row.task) err.task = '請輸入工作事項';
      if (!row.content) err.content = '請輸入作業內容';
      if (!row.hours || isNaN(Number(row.hours)) || Number(row.hours) <= 0) err.hours = '請輸入正確工時';
      if (Object.keys(err).length) {
        errors[idx] = err;
        hasError = true;
      }
    });
    setRowErrors(errors);
    if (hasError) {
      message.error('請修正紅色欄位錯誤');
      return;
    }
    let success = 0;
    let failedRows: number[] = [];
    for (let i = 0; i < multiLogs.length; i++) {
      const row = multiLogs[i];
      const res = await fetch('/api/worklogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...row, userId, hours: parseFloat(row.hours) }),
      });
      const result = await res.json();
      if (result.success) success++;
      else failedRows.push(i + 1);
    }
    // 重新查詢
    fetch(`/api/worklogs?userId=${userId}`)
      .then(res => res.json())
      .then(res => {
        let logs = res.data || [];
        logs = logs.map((log: any) => ({
          ...log,
          userName: log.userName || users.find(u => u.id === log.userId)?.name || log.userId || '',
        }));
        setData(logs);
      });
    // 只清空成功的行
    setMultiLogs(prev => prev.filter((_, i) => failedRows.includes(i + 1)).length ? prev.filter((_, i) => failedRows.includes(i + 1)) : [{ date: '', task: '', content: '', hours: '' }]);
    if (failedRows.length) {
      message.warning(`有 ${failedRows.length} 筆失敗，請檢查資料`);
    } else {
      message.success(`成功新增 ${success} 筆日誌`);
    }
  };

  // 一周模式：自動產生本周一到五的日期（自動跳過六日）
  const fillWeek = () => {
    const today = new Date();
    const day = today.getDay();
    // 0:日, 1:一, ..., 6:六
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7));
    const weekRows = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      weekRows.push({
        date: d.toISOString().slice(0, 10),
        task: '',
        content: '',
        hours: ''
      });
      if (weekRows.length === 5) break;
    }
    setMultiLogs(weekRows);
  };

  // 本日快速填寫
  const fillToday = () => {
    const today = new Date();
    setMultiLogs([{ date: today.toISOString().slice(0, 10), task: '', content: '', hours: '' }]);
  };

  return (
    <div style={{ maxWidth: 950, margin: '0 auto', padding: 32, background: '#f8fafc', borderRadius: 12, boxShadow: '0 2px 12px #0001' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#1677ff', letterSpacing: 2 }}>每日工作日誌</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Select
          style={{ width: 220 }}
          placeholder="選擇使用者"
          value={userId}
          onChange={setUserId}
          options={users.map(u => ({ value: u.id, label: u.name }))}
        />
        <Upload beforeUpload={handleImport} showUploadList={false} accept='.xlsx,.xls' disabled={importing}>
          <Button icon={<UploadOutlined />} loading={importing}>匯入 Excel</Button>
        </Upload>
        {importing && <span style={{ color: '#1677ff', fontWeight: 500 }}>匯入中，請稍候...</span>}
      </div>

      {/* 多筆日誌填寫區塊 */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, marginBottom: 32, boxShadow: '0 1px 4px #0001' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 500, fontSize: 18 }}>快速填寫</span>
          <div>
            <Button onClick={fillToday} style={{ marginRight: 8 }}>本日快速填寫</Button>
            <Button onClick={fillWeek} style={{ marginRight: 8 }}>本週一至五</Button>
            <Button onClick={addLogRow} type="dashed">新增一行</Button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f9fbfd' }}>
            <thead>
              <tr style={{ background: '#e6f4ff' }}>
                <th style={{ padding: 8, border: '1px solid #e0e0e0' }}>日期</th>
                <th style={{ padding: 8, border: '1px solid #e0e0e0' }}>工作事項</th>
                <th style={{ padding: 8, border: '1px solid #e0e0e0' }}>作業內容</th>
                <th style={{ padding: 8, border: '1px solid #e0e0e0' }}>工時</th>
                <th style={{ padding: 8, border: '1px solid #e0e0e0' }}></th>
              </tr>
            </thead>
            <tbody>
              {multiLogs.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ padding: 6, border: '1px solid #e0e0e0', background: rowErrors[idx]?.date ? '#fff1f0' : undefined }}>
                    <input
                      type="date"
                      value={row.date}
                      onChange={e => updateLogRow(idx, 'date', e.target.value)}
                      style={{ width: 130, borderRadius: 4, border: rowErrors[idx]?.date ? '1.5px solid #ff4d4f' : '1px solid #d0d0d0', padding: 4 }}
                      onKeyDown={e => handleKeyDown(e, idx, 'date')}
                    />
                    {rowErrors[idx]?.date && <div style={{ color: '#ff4d4f', fontSize: 12 }}>{rowErrors[idx].date}</div>}
                  </td>
                  <td style={{ padding: 6, border: '1px solid #e0e0e0', background: rowErrors[idx]?.task ? '#fff1f0' : undefined }}>
                    <input
                      value={row.task}
                      onChange={e => updateLogRow(idx, 'task', e.target.value)}
                      style={{ width: 160, borderRadius: 4, border: rowErrors[idx]?.task ? '1.5px solid #ff4d4f' : '1px solid #d0d0d0', padding: 4 }}
                      placeholder="工作事項"
                      onKeyDown={e => handleKeyDown(e, idx, 'task')}
                    />
                    {rowErrors[idx]?.task && <div style={{ color: '#ff4d4f', fontSize: 12 }}>{rowErrors[idx].task}</div>}
                  </td>
                  <td style={{ padding: 6, border: '1px solid #e0e0e0', background: rowErrors[idx]?.content ? '#fff1f0' : undefined }}>
                    <input
                      value={row.content}
                      onChange={e => updateLogRow(idx, 'content', e.target.value)}
                      style={{ width: 220, borderRadius: 4, border: rowErrors[idx]?.content ? '1.5px solid #ff4d4f' : '1px solid #d0d0d0', padding: 4 }}
                      placeholder="作業內容"
                      onKeyDown={e => handleKeyDown(e, idx, 'content')}
                    />
                    {rowErrors[idx]?.content && <div style={{ color: '#ff4d4f', fontSize: 12 }}>{rowErrors[idx].content}</div>}
                  </td>
                  <td style={{ padding: 6, border: '1px solid #e0e0e0', background: rowErrors[idx]?.hours ? '#fff1f0' : undefined }}>
                    <input
                      value={row.hours}
                      onChange={e => updateLogRow(idx, 'hours', e.target.value)}
                      style={{ width: 80, borderRadius: 4, border: rowErrors[idx]?.hours ? '1.5px solid #ff4d4f' : '1px solid #d0d0d0', padding: 4 }}
                      placeholder="工時"
                      type="number"
                      min="0"
                      step="0.5"
                      // step時間單位為小時，允許小數點
                      onKeyDown={e => handleKeyDown(e, idx, 'hours')}
                    />
                    {rowErrors[idx]?.hours && <div style={{ color: '#ff4d4f', fontSize: 12 }}>{rowErrors[idx].hours}</div>}
                  </td>
                  <td style={{ padding: 6, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                    <Button size="small" onClick={() => copyPrevRow(idx)} disabled={idx === 0} style={{ marginRight: 4 }}>複製上一行</Button>
                    <Button danger size="small" onClick={() => removeLogRow(idx)} disabled={multiLogs.length === 1}>刪除</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleMultiAdd}>批次新增</Button>
        </div>
      </div>

      <Table columns={columns} dataSource={data} rowKey={(r, i) => r.id ?? i} bordered size="middle" style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #0001' }} />
    </div>
  );
}
