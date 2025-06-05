import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'papaparse';
import * as XLSX from 'xlsx';
import { getConnectionPool } from '@/app/lib/db';
import sql from 'mssql';

export const runtime = 'nodejs';

/**
 * 將各種可能的日期輸入（文字 / Excel serial / Date 物件）
 * 轉成 SQL Server 可接受的 `YYYY-MM-DD` 字串；無法解析時回傳 null。
 */
function normalizeDateToSQL(v: any): string | null {
  if (v === undefined || v === null || v === '') return null;

  // ── Excel 日期序列 ──
  if (typeof v === 'number') {
    // Excel 從 1900‑01‑01 = 1；減 25567 就是 1970‑01‑01 00:00:00
    const date = new Date((v - 25567) * 86400000);
    return date.toISOString().slice(0, 10);
  }

  const s = String(v).trim();
  // 支援 2025/6/1、2025-06-01、2025-6-1…
  const m = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (m) {
    const [, y, mo, d] = m;
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // 其他格式嘗試用 Date.parse
  const parsed = Date.parse(s);
  return isNaN(parsed) ? null : new Date(parsed).toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ success: false, message: '未上傳檔案' });

  // 讀檔
  const arrayBuffer = await file.arrayBuffer();
  let rows: any[] = [];

  if (file.name.endsWith('.csv')) {
    const text = new TextDecoder().decode(arrayBuffer);
    const parsed = parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim(),
    });
    rows = parsed.data as any[];
  } else if (file.name.endsWith('.xlsx')) {
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' });
  } else {
    return NextResponse.json({ success: false, message: '檔案格式不支援' });
  }

  try {
    const pool = await getConnectionPool();

    for (const row of rows) {
      if (!row.projectName || !row.taskTitle) continue; // 最少要有專案名跟任務名

      /* ────────────────────────────────────────────────
       * (1) Projects
       * ────────────────────────────────────────────────*/
      const pStart = normalizeDateToSQL(row.projectStartDate ?? row.startDate);
      const pEnd   = normalizeDateToSQL(row.projectEndDate   ?? row.dueDate);

      let projectId: number;
      const existed = await pool.request()
        .input('name', row.projectName)
        .query(`SELECT id FROM [ProjectTracking].[dbo].[Projects] WHERE name = @name`);

      if (existed.recordset.length) {
        projectId = existed.recordset[0].id;
      } else {
        const inserted = await pool.request()
          .input('name', row.projectName)
          .input('description', row.projectDescription || '')
          .input('status', row.projectStatus || 'active')
          .input('startDate', sql.Date, pStart)
          .input('endDate',   sql.Date, pEnd)
          .query(`INSERT INTO [ProjectTracking].[dbo].[Projects]
                  (name, description, status, startDate, endDate)
                  OUTPUT INSERTED.id
                  VALUES (@name, @description, @status, @startDate, @endDate)`);
        projectId = inserted.recordset[0].id;
      }

      /* ────────────────────────────────────────────────
       * (2) TeamMembers — 取得 / 建立負責人
       * ────────────────────────────────────────────────*/
      let assignedTo: number | null = null;
      if (row.assignedToName) {
        const user = await pool.request()
          .input('name', row.assignedToName)
          .query(`SELECT id FROM [ProjectTracking].[dbo].[TeamMembers] WHERE name = @name`);

        if (user.recordset.length) {
          assignedTo = user.recordset[0].id;
        } else {
          const newUser = await pool.request()
            .input('name', row.assignedToName)
            .input('role', row.assignedToRole || '成員')
            .input('department', row.assignedToDepartment || '')
            .input('status', row.assignedToStatus || 'active')
            .input('email', row.assignedToEmail || null)
            .query(`INSERT INTO [ProjectTracking].[dbo].[TeamMembers]
                    (name, role, department, status, email)
                    OUTPUT INSERTED.id
                    VALUES (@name, @role, @department, @status, @email)`);
          assignedTo = newUser.recordset[0].id;
        }
      }

      /* ────────────────────────────────────────────────
       * (3) Tasks
       * ────────────────────────────────────────────────*/
      const tStart = normalizeDateToSQL(row.startDate);
      const tDue   = normalizeDateToSQL(row.dueDate);

      await pool.request()
        .input('projectId', projectId)
        .input('title', row.taskTitle)
        .input('description', row.description || '')
        .input('status', row.status || 'pending')
        .input('priority', row.priority || 'medium')
        .input('assignedTo', assignedTo)
        .input('startDate', sql.Date, tStart)
        .input('dueDate',   sql.Date, tDue)
        .input('progress', row.progress ? Number(row.progress) : 0)
        .query(`INSERT INTO [ProjectTracking].[dbo].[Tasks]
                (projectId, title, description, status, priority, assignedTo, startDate, dueDate, progress)
                VALUES (@projectId, @title, @description, @status, @priority, @assignedTo, @startDate, @dueDate, @progress)`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Import error', err);
    return NextResponse.json({ success: false, message: '匯入失敗: ' + err.message });
  }
}
