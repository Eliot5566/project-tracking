'use client';

import {
  Table,
  Button,
  Upload,
  message,
  DatePicker,
  Input,
  Form,
  Select,
  Space,
  Collapse,
  Spin,
} from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
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

import { Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { error } from 'console';

const columns = (
  handleEdit: (record: WorkLog) => void,
  handleDelete: (id: number) => void,
  currentUserId?: number
) => [
  { title: '使用者', dataIndex: 'userName', key: 'userName', width: 100 },
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
    render: (date: string) =>
      date
        ? new Date(date)
            .toLocaleDateString('zh-TW', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\//g, '/')
        : '',
  },
  { title: '工作事項', dataIndex: 'task', key: 'task' },
  { title: '作業內容', dataIndex: 'content', key: 'content' },
  { title: '工時', dataIndex: 'hours', key: 'hours' },
  {
    title: '操作',
    key: 'action',
    width: 120,
    render: (_: any, record: WorkLog) => {
      // 如果 currentUserId 未定義或與 record.userId 不符，則不顯示操作按鈕 record.userId是 WorkLog 的 userId currentUserId 是當前登入者的 userId 存放在 localStorage
      if (!currentUserId || record.userId !== currentUserId) return null;
      return (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            編輯
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id!)}
          >
            刪除
          </Button>
        </Space>
      );
    },
  },
];

export default function WorkLogBlock() {
  // 取得登入者 userId（teamMemberId）
  const [loginUserId, setLoginUserId] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.teamMemberId) setLoginUserId(Number(user.teamMemberId));
        } catch {}
      }
    }
  }, []);

  // 編輯日誌 Modal 狀態
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
  const [editForm, setEditForm] = useState({
    date: '',
    task: '',
    content: '',
    hours: 0,
  });

  // 編輯日誌
  const handleEdit = (record: WorkLog) => {
    setEditingLog(record);
    setEditForm({
      date: record.date,
      task: record.task,
      content: record.content,
      hours: record.hours,
    });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingLog) return;
    let hoursNum = parseFloat(editForm.hours as any);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      message.error('請輸入正確工時');
      return;
    }
    let result;
    try {
      const res = await fetch('/api/worklogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingLog.id,
          userId: editingLog.userId,
          ...editForm,
          hours: hoursNum,
        }),
      });
      result = await res.json();
    } catch {
      message.error('伺服器回應格式錯誤，請聯絡管理員');

      return;
    }
    if (result.success) {
      setData((prev) =>
        prev.map((log) => (log.id === editingLog.id ? result.data : log))
      );
      setEditModalOpen(false);
      setEditingLog(null);
      message.success('編輯成功');
    } else {
      message.error(result.error || '編輯失敗');
    }
  };

  // 刪除日誌
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '確定要刪除此日誌嗎？',
      onOk: async () => {
        const res = await fetch(`/api/worklogs?id=${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
          setData((prev) => prev.filter((log) => log.id !== id));
          message.success('刪除成功');
        } else {
          message.error(result.error || '刪除失敗');
        }
      },
    });
  };
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
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  // 查詢條件狀態
  const [searchContent, setSearchContent] = useState('');
  const [searchDateRange, setSearchDateRange] = useState<any>(null);
  const [searchTask, setSearchTask] = useState('');
  const [searchCollapsed, setSearchCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sorter, setSorter] = useState<{ field?: string; order?: string }>({});

  // 查詢日誌
  const fetchLogs = async (paramsOverride: any = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const page = paramsOverride.current || pagination.current;
      const pageSize = paramsOverride.pageSize || pagination.pageSize;
      params.append('page', String(page));
      params.append('pageSize', String(pageSize));
      if (userId) params.append('userId', String(userId));
      if (searchContent) params.append('content', searchContent);
      if (searchTask) params.append('task', searchTask);
      if (
        searchDateRange &&
        searchDateRange.length === 2 &&
        searchDateRange[0] &&
        searchDateRange[1]
      ) {
        params.append('startDate', searchDateRange[0].format('YYYY-MM-DD'));
        params.append('endDate', searchDateRange[1].format('YYYY-MM-DD'));
      }
      if (sorter.field && sorter.order) {
        params.append('sortField', sorter.field);
        params.append('sortOrder', sorter.order === 'ascend' ? 'asc' : 'desc');
      }
      const res = await fetch(`/api/worklogs?${params.toString()}`);
      const json = await res.json();
      let logs = json.data || [];
      logs = logs.map((log: any) => ({
        ...log,
        userName:
          log.userName ||
          users.find((u) => u.id === log.userId)?.name ||
          log.userId ||
          '',
      }));
      setData(logs);
      setPagination((prev) => ({ ...prev, total: json.total || logs.length }));
    } catch (e) {
      message.error('取得日誌失敗');
    } finally {
      setLoading(false);
    }
  };

  // 查詢條件清除
  const handleClearSearch = () => {
    setSearchContent('');
    setSearchDateRange(null);
    setSearchTask('');
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // 查詢條件變動時查詢
  // 頁面初始不自動查詢，僅在使用者點查詢時才查詢
  // useEffect(() => {
  //   fetchLogs({ current: 1 });
  //   // eslint-disable-next-line
  // }, [userId, users, searchContent, searchDateRange, searchTask, sorter]);

  // 取得所有使用者
  useEffect(() => {
    fetch('/api/team')
      .then((res) => res.json())
      .then((res) => {
        if (res.success)
          setUsers(res.data.map((u: any) => ({ id: u.id, name: u.name })));
      });
  }, []);

  // Excel 日期轉字串
  // const excelDateToString = (excelDate: number | string) => {
  //   if (typeof excelDate === 'number') {
  //     const date = new Date((excelDate - 25569) * 86400 * 1000);
  //     return date.toISOString().slice(0, 10);
  //   }
  //   if (typeof excelDate === 'string' && excelDate.length >= 8) {
  //     // yyyy-mm-dd or yyyy/mm/dd
  //     return excelDate.replace(/\//g, '-');
  //   }
  //   return excelDate;
  // };

  const excelDateToString = (excelDate: number | string) => {
    if (typeof excelDate === 'number') {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString().slice(0, 10);
    }
    if (typeof excelDate === 'string') {
      const s = excelDate.trim();
      // 支援 20250102 → 2025-01-02
      if (/^\d{8}$/.test(s)) {
        return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
      }
      // yyyy-mm-dd, yyyy/mm/dd, yyyy.mm.dd
      if (/^\d{4}[-/.]\d{2}[-/.]\d{2}$/.test(s)) {
        return s.replace(/[/.]/g, '-');
      }
      // fallback: dayjs parse
      const d = dayjs(s);
      if (d.isValid()) return d.format('YYYY-MM-DD');
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
  const json = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 }) as any[][];
      let lastDate = '';
      // 檢查第一行是否為標題 json.slice(1) 用於跳過第一行標題 map(row => row) 用於將每一行轉換為物件
      const rows = [];
  for (const row of (json.slice(1) as any[][])) {
        let dateVal = row[0];
        let parsedDate = '';
        if (dateVal === undefined || dateVal === null || dateVal === '') {
          parsedDate = lastDate;
        } else {
          parsedDate = excelDateToString(dateVal);
          // 檢查是否為有效日期
          if (parsedDate && dayjs(parsedDate).isValid()) {
            lastDate = parsedDate;
          } else {
            // 無效日期，略過這一行
            continue;
          }
        }
        // 檢查日期是否有效
        if (!parsedDate || !dayjs(parsedDate).isValid()) continue;
        // 跳過六日
        const dayOfWeek = dayjs(parsedDate).day();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        rows.push({
          userId,
          userName: users.find((u) => u.id === userId)?.name || '',
          date: parsedDate,
          task: row[1] != null ? String(row[1]) : '',
          content: row[2] != null ? String(row[2]) : '',
          hours:
            row[3] !== undefined && row[3] !== null && row[3] !== ''
              ? Number(row[3])
              : 0,
        });
      }

      // 寫入後端（逐筆確認結果，統計成功/失敗）
      let successCount = 0;
      const failedIdx: number[] = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const res = await fetch('/api/worklogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(row),
          });
          const json = await res.json();
          if (json && json.success) successCount++;
          else failedIdx.push(i);
        } catch (e) {
          failedIdx.push(i);
        }
      }
      // 重新取得資料
      try {
        const res = await fetch(`/api/worklogs?userId=${userId}`);
        const j = await res.json();
        setData(j.data || []);
      } catch {}
      setImporting(false);
      if (failedIdx.length > 0) {
        message.warning(`匯入完成：成功 ${successCount} 筆，失敗 ${failedIdx.length} 筆`);
      } else {
        message.success('匯入成功，已寫入資料庫');
      }
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
      body: JSON.stringify({
        ...values,
        userId,
        hours: parseFloat(values.hours),
      }),
    });
    const result = await res.json();
    if (result.success) {
      setData((prev) => [result.data, ...prev]);
      form.resetFields();
      message.success('新增成功');
    }
  };

  // 狀態：多筆日誌填寫  陣列包裝多筆日誌資料 [{}] 代表多筆日誌的資料結構
  // 每一筆日誌包含日期、工作事項、作業內容、工時
  const [multiLogs, setMultiLogs] = useState([
    { date: '', task: '', content: '', hours: '' },
  ]);
  // 欄位錯誤提示  使用<{ [k: number]: { [key: string]: string } }>來表示每一行的錯誤訊息
  // k: number 用於表示行索引，key: string 用於表示欄位名稱，value: string 用於表示錯誤訊息
  // 實際上的JS 是物件的形式，類似於 { 0: { date: '錯誤訊息' }, 1: { task: '錯誤訊息' } }
  // {K: number} 用於表示索引，{[key: string]: string} 用於表示欄位錯誤訊息
  // 這樣可以讓我們在物件中使用動態的鍵名，實際上存取時，會使用 rowErrors[idx][key] 來存取每一行的錯誤訊息
  const [rowErrors, setRowErrors] = useState<{
    [k: number]: { [key: string]: string };
  }>({});

  // 新增一行
  const addLogRow = () =>
    setMultiLogs((prev) => [
      ...prev,
      { date: '', task: '', content: '', hours: '' },
    ]);
  // 刪除一行
  const removeLogRow = (idx: number) =>
    setMultiLogs((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)
    );
  // 修改欄位
  const updateLogRow = (idx: number, key: string, value: any) => {
    setMultiLogs((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
    );
    setRowErrors((prev) => {
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
    setMultiLogs((prev) =>
      prev.map((row, i) => (i === idx ? { ...prev[idx - 1] } : row))
    );
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
    // 驗證 多筆日誌資料
    let hasError = false;
    // 檢查每一行的欄位是否正確   [k : number] 用於表示索引 : { [key: string]: string } 用於表示欄位錯誤訊息
    // 為甚麼要用[] 包裹 key: string 因為這樣可以讓 TypeScript 知道這是一個物件的索引簽名
    // 這樣可以讓我們在物件中使用動態的鍵名
    // 實際上存取時，會使用 multiLogs[idx][key] 來存取每一行的欄位值 類似於陣列的索引 像是 multiLogs[0].date
    const errors: { [k: number]: { [key: string]: string } } = {};
    multiLogs.forEach((row, idx) => {
      const err: any = {};
      if (!row.date) err.date = '請選擇日期';
      if (!row.task) err.task = '請輸入工作事項';
      if (!row.content) err.content = '請輸入作業內容';
      if (!row.hours || isNaN(Number(row.hours)) || Number(row.hours) <= 0)
        err.hours = '請輸入正確工時';
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
        body: JSON.stringify({
          ...row,
          userId,
          hours:
            row.hours !== undefined && row.hours !== null && row.hours !== ''
              ? Number(row.hours)
              : 0,
        }),
      });
      const result = await res.json();
      if (result.success) success++;
      else failedRows.push(i + 1);
    }
    // 重新查詢
    // fetch API寫法 : fetch(`/api/worklogs?userId=${userId}`)
    // 這裡的 userId 是從狀態中取得的
    // 這樣可以確保查詢到正確的使用者日誌
    // .then((res) => res.json()) 表示將回應轉換為 JSON 格式 res是 fetch 的回應物件
    fetch(`/api/worklogs?userId=${userId}`)
      .then((res) => res.json())
      .then((res) => {
        let logs = res.data || [];
        logs = logs.map((log: any) => ({
          ...log,
          userName:
            log.userName ||
            users.find((u) => u.id === log.userId)?.name ||
            log.userId ||
            '',
        }));
        setData(logs);
      });
    // 只清空成功的行
    setMultiLogs((prev) =>
      prev.filter((_, i) => failedRows.includes(i + 1)).length
        ? prev.filter((_, i) => failedRows.includes(i + 1))
        : [{ date: '', task: '', content: '', hours: '' }]
    );
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
        hours: '',
      });
      if (weekRows.length === 5) break;
    }
    setMultiLogs(weekRows);
  };

  // 本日快速填寫
  const fillToday = () => {
    const today = new Date();
    setMultiLogs([
      {
        date: today.toISOString().slice(0, 10),
        task: '',
        content: '',
        hours: '',
      },
    ]);
  };

  return (
    <div
      style={{
        maxWidth: 1250,
        margin: '0 auto',
        padding: 36,
        background: 'linear-gradient(135deg, #f8fafc 70%, #e3e9f7 100%)',
        borderRadius: 18,
        boxShadow: '0 4px 32px #0002',
        fontFamily: `'Noto Sans TC', 'Segoe UI', 'Microsoft JhengHei', Arial, sans-serif`,
        letterSpacing: 0.5,
      }}
    >
      {/* 多筆日誌填寫區塊 */}
      {/* <div
        style={{
          background: '#f4f6fa',
          borderRadius: 12,
          padding: 18,
          marginBottom: 32,
          boxShadow: '0 2px 8px #0001',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
          多筆日誌填寫
        </div>
        {multiLogs.map((row, idx) => (
          <Space key={idx} style={{ marginBottom: 8, flexWrap: 'wrap' }}>
            <DatePicker
              style={{ width: 120 }}
              placeholder="日期"
              value={row.date ? dayjs(row.date) : undefined}
              onChange={(d) =>
                updateLogRow(idx, 'date', d ? d.format('YYYY-MM-DD') : '')
              }
              inputReadOnly
            />
            <Input
              style={{ width: 120 }}
              placeholder="工作事項"
              value={row.task}
              onChange={(e) => updateLogRow(idx, 'task', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, idx, 'task')}
            />
            <Input
              style={{ width: 220 }}
              placeholder="作業內容"
              value={row.content}
              onChange={(e) => updateLogRow(idx, 'content', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, idx, 'content')}
            />
            <Input
              type="number"
              min={0.5}
              step={0.5}
              style={{ width: 80 }}
              placeholder="工時"
              value={row.hours}
              onChange={(e) => updateLogRow(idx, 'hours', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, idx, 'hours')}
            />
            <Button
              onClick={() => copyPrevRow(idx)}
              icon={<PlusOutlined />}
              size="small"
              style={{ marginLeft: 2 }}
            >
              複製
            </Button>
            <Button
              onClick={() => removeLogRow(idx)}
              danger
              size="small"
              style={{ marginLeft: 2 }}
              disabled={multiLogs.length === 1}
            >
              刪除
            </Button>
            {rowErrors[idx] && (
              <span style={{ color: 'red', fontSize: 13, marginLeft: 4 }}>
                {Object.values(rowErrors[idx]).join('、')}
              </span>
            )}
          </Space>
        ))}
        <div style={{ marginTop: 8 }}>
          <Button
            onClick={addLogRow}
            icon={<PlusOutlined />}
            style={{ marginRight: 8 }}
          >
            新增一行
          </Button>
          <Button onClick={fillToday} style={{ marginRight: 8 }}>
            本日快速填寫
          </Button>
          <Button onClick={fillWeek} style={{ marginRight: 8 }}>
            本週快速填寫
          </Button>
          <Button
            type="primary"
            onClick={handleMultiAdd}
            style={{ fontWeight: 600, borderRadius: 8 }}
          >
            批次送出
          </Button>
        </div>
      </div> */}
      {/* 查詢條件區塊（可收合） */}
      <Collapse
        activeKey={searchCollapsed ? [] : ['1']}
        onChange={() => setSearchCollapsed((prev) => !prev)}
        style={{
          marginBottom: 28,
          background: 'transparent',
          borderRadius: 12,
          fontFamily: `'Noto Sans TC', 'Segoe UI', 'Microsoft JhengHei', Arial, sans-serif`,
        }}
        expandIconPosition="end"
      >
        <Collapse.Panel
          header={
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>
              查詢條件
            </span>
          }
          key="1"
          style={{
            background: '#f4f6fa',
            borderRadius: 12,
            border: 'none',
            margin: 0,
            fontFamily: `'Noto Sans TC', 'Segoe UI', 'Microsoft JhengHei', Arial, sans-serif`,
          }}
        >
          <Space wrap size={[18, 18]} align="center">
            {/* 新增日誌表單移到這裡 */}
            {/* <Form
              form={form}
              onFinish={handleAdd}
              layout="inline"
              style={{
                marginTop: 24,
                background: '#f8fafc',
                borderRadius: 10,
                padding: 16,
                boxShadow: '0 1px 4px #0001',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Form.Item
                name="date"
                rules={[{ required: true, message: '請選擇日期' }]}
                style={{ marginBottom: 0 }}
              >
                <DatePicker
                  style={{ width: 120 }}
                  placeholder="日期"
                  inputReadOnly
                />
              </Form.Item>
              <Form.Item
                name="task"
                rules={[{ required: true, message: '請輸入工作事項' }]}
                style={{ marginBottom: 0 }}
              >
                <Input style={{ width: 120 }} placeholder="工作事項" />
              </Form.Item>
              <Form.Item
                name="content"
                rules={[{ required: true, message: '請輸入作業內容' }]}
                style={{ marginBottom: 0 }}
              >
                <Input style={{ width: 220 }} placeholder="作業內容" />
              </Form.Item>
              <Form.Item
                name="hours"
                rules={[{ required: true, message: '請輸入工時' }]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  type="number"
                  min={0.5}
                  step={0.5}
                  style={{ width: 80 }}
                  placeholder="工時"
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ fontWeight: 600, fontSize: 16, borderRadius: 8 }}
                >
                  新增日誌
                </Button>
              </Form.Item>
            </Form> */}
            <Select
              style={{ width: 180, fontSize: 16, fontFamily: 'inherit' }}
              placeholder="選擇使用者"
              value={userId}
              onChange={setUserId}
              options={users.map((u) => ({ value: u.id, label: u.name }))}
              allowClear
            />
            <DatePicker.RangePicker
              style={{ width: 240, fontSize: 16, fontFamily: 'inherit' }}
              allowClear
              value={searchDateRange}
              onChange={setSearchDateRange}
              placeholder={['開始日期', '結束日期']}
              inputReadOnly
            />
            <Input
              style={{ width: 200, fontSize: 16, fontFamily: 'inherit' }}
              allowClear
              value={searchTask}
              onChange={(e) => setSearchTask(e.target.value)}
              placeholder="工作事項關鍵字"
            />
            <Input
              style={{ width: 200, fontSize: 16, fontFamily: 'inherit' }}
              allowClear
              value={searchContent}
              onChange={(e) => setSearchContent(e.target.value)}
              placeholder="作業內容關鍵字"
            />
            <Button
              type="primary"
              onClick={() => fetchLogs({ current: 1 })}
              style={{
                fontWeight: 600,
                fontSize: 16,
                height: 40,
                borderRadius: 8,
                letterSpacing: 1,
              }}
            >
              查詢
            </Button>
            <Button
              onClick={handleClearSearch}
              style={{
                fontWeight: 500,
                fontSize: 16,
                height: 40,
                borderRadius: 8,
                marginLeft: 2,
              }}
            >
              清除條件
            </Button>

            {/* 多筆日誌填寫區塊 */}
            <div
              style={{
                background: '#f4f6fa',
                borderRadius: 12,
                padding: 18,
                marginBottom: 32,
                boxShadow: '0 2px 8px #0001',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                多筆日誌填寫
              </div>
              {multiLogs.map((row, idx) => (
                <Space key={idx} style={{ marginBottom: 8, flexWrap: 'wrap' }}>
                  <DatePicker
                    style={{ width: 120 }}
                    placeholder="日期"
                    value={row.date ? dayjs(row.date) : undefined}
                    onChange={(d) =>
                      updateLogRow(idx, 'date', d ? d.format('YYYY-MM-DD') : '')
                    }
                    inputReadOnly
                  />
                  <Input
                    style={{ width: 120 }}
                    placeholder="工作事項"
                    value={row.task}
                    onChange={(e) => updateLogRow(idx, 'task', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, idx, 'task')}
                  />
                  <Input
                    style={{ width: 220 }}
                    placeholder="作業內容"
                    value={row.content}
                    onChange={(e) =>
                      updateLogRow(idx, 'content', e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, idx, 'content')}
                  />
                  <Input
                    type="number"
                    min={0.5}
                    step={0.5}
                    style={{ width: 80 }}
                    placeholder="工時"
                    value={row.hours}
                    onChange={(e) => updateLogRow(idx, 'hours', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, idx, 'hours')}
                  />
                  <Button
                    onClick={() => copyPrevRow(idx)}
                    icon={<PlusOutlined />}
                    size="small"
                    style={{ marginLeft: 2 }}
                  >
                    複製
                  </Button>
                  <Button
                    onClick={() => removeLogRow(idx)}
                    danger
                    size="small"
                    style={{ marginLeft: 2 }}
                    disabled={multiLogs.length === 1}
                  >
                    刪除
                  </Button>
                  {rowErrors[idx] && (
                    <span style={{ color: 'red', fontSize: 13, marginLeft: 4 }}>
                      {Object.values(rowErrors[idx]).join('、')}
                    </span>
                  )}
                </Space>
              ))}
              <div style={{ marginTop: 8 }}>
                <Button
                  onClick={addLogRow}
                  icon={<PlusOutlined />}
                  style={{ marginRight: 8 }}
                >
                  新增一行
                </Button>
                <Button onClick={fillToday} style={{ marginRight: 8 }}>
                  本日快速填寫
                </Button>
                <Button onClick={fillWeek} style={{ marginRight: 8 }}>
                  本週快速填寫
                </Button>
                <Button
                  type="primary"
                  onClick={handleMultiAdd}
                  style={{ fontWeight: 600, borderRadius: 8 }}
                >
                  批次送出
                </Button>
              </div>
            </div>
            <Upload
              beforeUpload={handleImport}
              showUploadList={false}
              accept=".xlsx,.xls"
              disabled={importing}
            >
              <Button
                icon={<UploadOutlined />}
                loading={importing}
                style={{
                  fontWeight: 500,
                  fontSize: 16,
                  height: 40,
                  borderRadius: 8,
                }}
              >
                匯入 Excel
              </Button>
            </Upload>
            {importing && (
              <span
                style={{
                  color: '#1677ff',
                  fontWeight: 600,
                  fontSize: 15,
                  marginLeft: 8,
                }}
              >
                匯入中，請稍候...
              </span>
            )}
          </Space>
        </Collapse.Panel>
      </Collapse>

      {/* 查詢結果表格（帶 loading、分頁、排序） */}
      <Spin spinning={loading} tip="查詢中...">
        <div
          style={{
            background: 'rgba(255,255,255,0.98)',
            borderRadius: 16,
            boxShadow: '0 4px 32px #0001',
            padding: 28,
            marginTop: 12,
            fontFamily: `'Noto Sans TC', 'Segoe UI', 'Microsoft JhengHei', Arial, sans-serif`,
            fontSize: 17,
            color: '#1a1a1a',
            border: '1.5px solid #e3e9f7',
          }}
        >
          <Table
            columns={columns(handleEdit, handleDelete, loginUserId).map(
              (col) => ({
                ...col,
                onCell: () => ({
                  style: {
                    fontFamily: `'Noto Sans TC', 'Segoe UI', 'Microsoft JhengHei', Arial, sans-serif`,
                    fontSize: 17,
                    color: '#1a1a1a',
                    padding: '12px 10px',
                    background: 'transparent',
                    borderBottom: '1.5px solid #e3e9f7',
                  },
                }),
                onHeaderCell: () => ({
                  style: {
                    fontFamily: `'Noto Sans TC', 'Segoe UI', 'Microsoft JhengHei', Arial, sans-serif`,
                    fontWeight: 800,
                    fontSize: 18,
                    background:
                      'linear-gradient(90deg, #f4f6fa 80%, #e3e9f7 100%)',
                    color: '#1a237e',
                    padding: '14px 10px',
                    borderBottom: '2.5px solid #bfcbe6',
                    letterSpacing: 1,
                  },
                }),
              })
            )}
            dataSource={data}
            rowKey={(r) =>
              r.id != null ? r.id : `row-${r.date}-${r.task}-${r.content}`
            }
            bordered
            size="middle"
            style={{
              background: 'transparent',
              borderRadius: 8,
              boxShadow: 'none',
            }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 筆`,
              onChange: (page, pageSize) => {
                setPagination((prev) => ({ ...prev, current: page, pageSize }));
                fetchLogs({ current: page, pageSize });
              },
            }}
            loading={false}
            onChange={(pagination, filters, sorterObj: any) => {
              setPagination((prev) => ({
                ...prev,
                current: pagination.current || 1,
                pageSize: pagination.pageSize || 10,
              }));
              if (sorterObj && sorterObj.field) {
                setSorter({ field: sorterObj.field, order: sorterObj.order });
              } else {
                setSorter({});
              }
            }}
          />

          {/* 編輯日誌 Modal */}
          <Modal
            open={editModalOpen}
            title="編輯日誌"
            onCancel={() => setEditModalOpen(false)}
            onOk={handleEditSave}
            okText="儲存"
            cancelText="取消"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <DatePicker
                style={{ width: 160 }}
                value={editForm.date ? dayjs(editForm.date) : undefined}
                onChange={(d) =>
                  setEditForm((f) => ({
                    ...f,
                    date: d ? d.format('YYYY-MM-DD') : '',
                  }))
                }
              />
              <Input
                style={{ width: 160 }}
                placeholder="工作事項"
                value={editForm.task}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, task: e.target.value }))
                }
              />
              <Input
                style={{ width: 260 }}
                placeholder="作業內容"
                value={editForm.content}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, content: e.target.value }))
                }
              />
              <Input
                type="number"
                min={0.5}
                step={0.5}
                style={{ width: 100 }}
                placeholder="工時"
                value={editForm.hours}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, hours: Number(e.target.value || 0) }))
                }
              />
            </div>
          </Modal>
        </div>
      </Spin>
    </div>
  );
}
