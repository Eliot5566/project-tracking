// import { NextResponse } from 'next/server';
// import { query } from '@/lib/db';
// import jwt from 'jsonwebtoken';

// // 取得登入者 userId（teamMemberId）
// function getUserIdFromRequest(request: Request): number | null {
//   try {
//     const cookie = request.headers.get('cookie') || '';
//     const match = cookie.match(/token=([^;]+)/);
//     if (!match) return null;
//     const token = match[1];
//     const SECRET = process.env.JWT_SECRET || 'your-secret-key';
//     const payload = jwt.verify(token, SECRET) as any;
//     // 你登入時回傳的 user.teamMemberId
//     return payload.teamMemberId || payload.userId || null;
//   } catch {
//     return null;
//   }
// }

// // 取得日誌
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get('userId');
//   const date = searchParams.get('date');
//   const startDate = searchParams.get('startDate');
//   const endDate = searchParams.get('endDate');
//   const task = searchParams.get('task');
//   const content = searchParams.get('content');
//   const minHours = searchParams.get('minHours');
//   const maxHours = searchParams.get('maxHours');
//   let sql = 'SELECT * FROM WorkLogs WHERE 1=1';
//   const params: any[] = [];
//   let paramIdx = 0;
//   if (userId) {
//     sql += ` AND userId = @param${paramIdx}`;
//     params.push(userId);
//     paramIdx++;
//   }
//   if (date) {
//     sql += ` AND date = @param${paramIdx}`;
//     params.push(date);
//     paramIdx++;
//   }
//   if (startDate && endDate) {
//     sql += ` AND date BETWEEN @param${paramIdx} AND @param${paramIdx + 1}`;
//     params.push(startDate, endDate);
//     paramIdx += 2;
//   } else if (startDate) {
//     sql += ` AND date >= @param${paramIdx}`;
//     params.push(startDate);
//     paramIdx++;
//   } else if (endDate) {
//     sql += ` AND date <= @param${paramIdx}`;
//     params.push(endDate);
//     paramIdx++;
//   }
//   if (task) {
//     sql += ` AND task LIKE @param${paramIdx}`;
//     params.push(`%${task}%`);
//     paramIdx++;
//   }
//   if (content) {
//     sql += ` AND content LIKE @param${paramIdx}`;
//     params.push(`%${content}%`);
//     paramIdx++;
//   }
//   if (minHours) {
//     sql += ` AND hours >= @param${paramIdx}`;
//     params.push(minHours);
//     paramIdx++;
//   }
//   if (maxHours) {
//     sql += ` AND hours <= @param${paramIdx}`;
//     params.push(maxHours);
//     paramIdx++;
//   }
//   sql += ' ORDER BY date DESC';
//   const logs = await query(sql, params);
//   return NextResponse.json({ success: true, data: logs });
// }

// // 新增日誌
// export async function POST(request: Request) {
//   const loginUserId = getUserIdFromRequest(request);
//   const { userId, date, task, content, hours } = await request.json();
//   if (!loginUserId || Number(userId) !== Number(loginUserId)) {
//     return NextResponse.json(
//       { success: false, error: '未授權' },
//       { status: 403 }
//     );
//   }
//   const result = await query(
//     `INSERT INTO WorkLogs (userId, date, task, content, hours) OUTPUT INSERTED.* VALUES (@param0, @param1, @param2, @param3, @param4)`,
//     [userId, date, task, content, parseFloat(hours)]
//   );
//   return NextResponse.json({ success: true, data: result[0] });
// }

// // 編輯日誌
// export async function PUT(request: Request) {
//   const loginUserId = getUserIdFromRequest(request);
//   const { id, userId, date, task, content, hours } = await request.json();
//   if (!id) {
//     return NextResponse.json(
//       { success: false, error: '缺少日誌 ID' },
//       { status: 400 }
//     );
//   }
//   // 查詢該日誌的 userId
//   const logs = await query('SELECT * FROM WorkLogs WHERE id=@param0', [id]);
//   if (!logs.length) {
//     return NextResponse.json(
//       { success: false, error: '日誌不存在' },
//       { status: 404 }
//     );
//   }
//   if (!loginUserId || Number(logs[0].userId) !== Number(loginUserId)) {
//     return NextResponse.json(
//       { success: false, error: '未授權' },
//       { status: 403 }
//     );
//   }
//   const result = await query(
//     `UPDATE WorkLogs SET userId=@param0, date=@param1, task=@param2, content=@param3, hours=@param4 WHERE id=@param5; SELECT * FROM WorkLogs WHERE id=@param5`,
//     [userId, date, task, content, parseFloat(hours), id]
//   );
//   const data = Array.isArray(result)
//     ? result[0]
//     : result && result.recordset
//     ? result.recordset[0]
//     : undefined;
//   return NextResponse.json({ success: true, data });
// }

// // 刪除日誌
// export async function DELETE(request: Request) {
//   const loginUserId = getUserIdFromRequest(request);
//   const { searchParams } = new URL(request.url);
//   const id = searchParams.get('id');
//   if (!id) {
//     return NextResponse.json(
//       { success: false, error: '缺少日誌 ID' },
//       { status: 400 }
//     );
//   }
//   // 查詢該日誌
//   const logs = await query('SELECT * FROM WorkLogs WHERE id=@param0', [id]);
//   if (!logs.length) {
//     return NextResponse.json(
//       { success: false, error: '日誌不存在' },
//       { status: 404 }
//     );
//   }
//   if (!loginUserId || Number(logs[0].userId) !== Number(loginUserId)) {
//     return NextResponse.json(
//       { success: false, error: '未授權' },
//       { status: 403 }
//     );
//   }
//   await query('DELETE FROM WorkLogs WHERE id=@param0', [id]);
//   return NextResponse.json({ success: true, data: logs[0] });
// }
// import { NextResponse } from 'next/server';
// import { query } from '@/lib/db';

// // 取得日誌
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get('userId');
//   const date = searchParams.get('date');
//   const startDate = searchParams.get('startDate');
//   const endDate = searchParams.get('endDate');
//   const task = searchParams.get('task');
//   const content = searchParams.get('content');
//   const minHours = searchParams.get('minHours');
//   const maxHours = searchParams.get('maxHours');
//   // 分頁參數
//   const page = parseInt(searchParams.get('page') || '1', 10);
//   const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
//   let sql = 'SELECT * FROM WorkLogs WHERE 1=1';
//   const params: any[] = [];
//   let paramIdx = 0;
//   if (userId) {
//     sql += ` AND userId = @param${paramIdx}`;
//     params.push(userId);
//     paramIdx++;
//   }
//   if (date) {
//     sql += ` AND date = @param${paramIdx}`;
//     params.push(date);
//     paramIdx++;
//   }
//   if (startDate && endDate) {
//     sql += ` AND date BETWEEN @param${paramIdx} AND @param${paramIdx + 1}`;
//     params.push(startDate, endDate);
//     paramIdx += 2;
//   } else if (startDate) {
//     sql += ` AND date >= @param${paramIdx}`;
//     params.push(startDate);
//     paramIdx++;
//   } else if (endDate) {
//     sql += ` AND date <= @param${paramIdx}`;
//     params.push(endDate);
//     paramIdx++;
//   }
//   if (task) {
//     sql += ` AND task LIKE @param${paramIdx}`;
//     params.push(`%${task}%`);
//     paramIdx++;
//   }
//   if (content) {
//     sql += ` AND content LIKE @param${paramIdx}`;
//     params.push(`%${content}%`);
//     paramIdx++;
//   }
//   if (minHours) {
//     sql += ` AND hours >= @param${paramIdx}`;
//     params.push(minHours);
//     paramIdx++;
//   }
//   if (maxHours) {
//     sql += ` AND hours <= @param${paramIdx}`;
//     params.push(maxHours);
//     paramIdx++;
//   }
//   sql += ' ORDER BY date DESC';
//   // 分頁查詢
//   const pagedSql = `${sql} OFFSET ${(page - 1) * pageSize} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
//   const logs = await query(pagedSql, params);
//   // 查詢總數（需移除 ORDER BY，避免 GROUP BY 錯誤）
//   const countSql = sql.replace(/ORDER BY[\s\S]*/i, '').replace('SELECT *', 'SELECT COUNT(*) as total');
//   const countResult = await query(countSql, params);
//   const total = countResult[0]?.total || 0;
//   return NextResponse.json({ success: true, data: logs, total });
// }

// // 新增日誌
// export async function POST(request: Request) {
//   const { userId, date, task, content, hours } = await request.json();
//   const result = await query(
//     `INSERT INTO WorkLogs (userId, date, task, content, hours) OUTPUT INSERTED.* VALUES (@param0, @param1, @param2, @param3, @param4)`,
//     [userId, date, task, content, hours]
//   );
//   return NextResponse.json({ success: true, data: result[0] });
// }

// // 可擴充 PUT/DELETE/批次匯入

// import { NextResponse } from 'next/server';
// import { query } from '@/lib/db';

// // 取得登入者 userId（teamMemberId），直接從 cookie 取
// function getUserIdFromRequest(request: Request): number | null {
//   try {
//     const cookie = request.headers.get('cookie') || '';
//     // 支援 userId 或 teamMemberId
//     const match = cookie.match(/(?:userId|teamMemberId)=([^;]+)/);
//     if (!match) return null;
//     return Number(match[1]);
//   } catch {
//     return null;
//   }
// }

// // 取得日誌
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get('userId');
//   const date = searchParams.get('date');
//   const startDate = searchParams.get('startDate');
//   const endDate = searchParams.get('endDate');
//   const task = searchParams.get('task');
//   const content = searchParams.get('content');
//   const minHours = searchParams.get('minHours');
//   const maxHours = searchParams.get('maxHours');
//   let sql = 'SELECT * FROM WorkLogs WHERE 1=1';
//   const params: any[] = [];
//   let paramIdx = 0;
//   if (userId) {
//     sql += ` AND userId = @param${paramIdx}`;
//     params.push(userId);
//     paramIdx++;
//   }
//   if (date) {
//     sql += ` AND date = @param${paramIdx}`;
//     params.push(date);
//     paramIdx++;
//   }
//   if (startDate && endDate) {
//     sql += ` AND date BETWEEN @param${paramIdx} AND @param${paramIdx + 1}`;
//     params.push(startDate, endDate);
//     paramIdx += 2;
//   } else if (startDate) {
//     sql += ` AND date >= @param${paramIdx}`;
//     params.push(startDate);
//     paramIdx++;
//   } else if (endDate) {
//     sql += ` AND date <= @param${paramIdx}`;
//     params.push(endDate);
//     paramIdx++;
//   }
//   if (task) {
//     sql += ` AND task LIKE @param${paramIdx}`;
//     params.push(`%${task}%`);
//     paramIdx++;
//   }
//   if (content) {
//     sql += ` AND content LIKE @param${paramIdx}`;
//     params.push(`%${content}%`);
//     paramIdx++;
//   }
//   if (minHours) {
//     sql += ` AND hours >= @param${paramIdx}`;
//     params.push(minHours);
//     paramIdx++;
//   }
//   if (maxHours) {
//     sql += ` AND hours <= @param${paramIdx}`;
//     params.push(maxHours);
//     paramIdx++;
//   }
//   sql += ' ORDER BY date DESC';
//   const logs = await query(sql, params);
//   return NextResponse.json({ success: true, data: logs });
// }

// // 新增日誌
// export async function POST(request: Request) {
//   const loginUserId = getUserIdFromRequest(request);
//   const { date, task, content, hours } = await request.json();
//   if (!loginUserId) {
//     return NextResponse.json(
//       { success: false, error: '未授權' },
//       { status: 403 }
//     );
//   }
//   const result = await query(
//     `INSERT INTO WorkLogs (userId, date, task, content, hours) OUTPUT INSERTED.* VALUES (@param0, @param1, @param2, @param3, @param4)`,
//     [loginUserId, date, task, content, parseFloat(hours)]
//   );
//   return NextResponse.json({ success: true, data: result[0] });
// }

// // 編輯日誌
// export async function PUT(request: Request) {
//   const loginUserId = getUserIdFromRequest(request);
//   const { id, date, task, content, hours } = await request.json();
//   if (!id) {
//     return NextResponse.json(
//       { success: false, error: '缺少日誌 ID' },
//       { status: 400 }
//     );
//   }
//   // 查詢該日誌的 userId
//   const logs = await query('SELECT * FROM WorkLogs WHERE id=@param0', [id]);
//   if (!logs.length) {
//     return NextResponse.json(
//       { success: false, error: '日誌不存在' },
//       { status: 404 }
//     );
//   }
//   if (!loginUserId || Number(logs[0].userId) !== Number(loginUserId)) {
//     return NextResponse.json(
//       { success: false, error: '未授權' },
//       { status: 403 }
//     );
//   }
//   const result = await query(
//     `UPDATE WorkLogs SET date=@param0, task=@param1, content=@param2, hours=@param3 WHERE id=@param4; SELECT * FROM WorkLogs WHERE id=@param4`,
//     [date, task, content, parseFloat(hours), id]
//   );
//   const data = Array.isArray(result)
//     ? result[0]
//     : result && result.recordset
//     ? result.recordset[0]
//     : undefined;
//   return NextResponse.json({ success: true, data });
// }

// // 刪除日誌
// export async function DELETE(request: Request) {
//   const loginUserId = getUserIdFromRequest(request);
//   const { searchParams } = new URL(request.url);
//   const id = searchParams.get('id');
//   if (!id) {
//     return NextResponse.json(
//       { success: false, error: '缺少日誌 ID' },
//       { status: 400 }
//     );
//   }
//   // 查詢該日誌
//   const logs = await query('SELECT * FROM WorkLogs WHERE id=@param0', [id]);
//   if (!logs.length) {
//     return NextResponse.json(
//       { success: false, error: '日誌不存在' },
//       { status: 404 }
//     );
//   }
//   if (!loginUserId || Number(logs[0].userId) !== Number(loginUserId)) {
//     return NextResponse.json(
//       { success: false, error: '未授權' },
//       { status: 403 }
//     );
//   }
//   await query('DELETE FROM WorkLogs WHERE id=@param0', [id]);
//   return NextResponse.json({ success: true, data: logs[0] });
// }

//2025 0715

// import { NextResponse } from 'next/server';
// import { query } from '@/lib/db';

// // 取得日誌
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get('userId');
//   const date = searchParams.get('date');
//   const startDate = searchParams.get('startDate');
//   const endDate = searchParams.get('endDate');
//   const task = searchParams.get('task');
//   const content = searchParams.get('content');
//   const minHours = searchParams.get('minHours');
//   const maxHours = searchParams.get('maxHours');
//   // 分頁參數
//   const page = parseInt(searchParams.get('page') || '1', 10);
//   const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
//   let sql = 'SELECT * FROM WorkLogs WHERE 1=1';
//   const params: any[] = [];
//   let paramIdx = 0;
//   if (userId) {
//     sql += ` AND userId = @param${paramIdx}`;
//     params.push(userId);
//     paramIdx++;
//   }
//   if (date) {
//     sql += ` AND date = @param${paramIdx}`;
//     params.push(date);
//     paramIdx++;
//   }
//   if (startDate && endDate) {
//     sql += ` AND date BETWEEN @param${paramIdx} AND @param${paramIdx + 1}`;
//     params.push(startDate, endDate);
//     paramIdx += 2;
//   } else if (startDate) {
//     sql += ` AND date >= @param${paramIdx}`;
//     params.push(startDate);
//     paramIdx++;
//   } else if (endDate) {
//     sql += ` AND date <= @param${paramIdx}`;
//     params.push(endDate);
//     paramIdx++;
//   }
//   if (task) {
//     sql += ` AND task LIKE @param${paramIdx}`;
//     params.push(`%${task}%`);
//     paramIdx++;
//   }
//   if (content) {
//     sql += ` AND content LIKE @param${paramIdx}`;
//     params.push(`%${content}%`);
//     paramIdx++;
//   }
//   if (minHours) {
//     sql += ` AND hours >= @param${paramIdx}`;
//     params.push(minHours);
//     paramIdx++;
//   }
//   if (maxHours) {
//     sql += ` AND hours <= @param${paramIdx}`;
//     params.push(maxHours);
//     paramIdx++;
//   }
//   sql += ' ORDER BY date DESC';
//   // 分頁查詢
//   const pagedSql = `${sql} OFFSET ${(page - 1) * pageSize} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
//   const logs = await query(pagedSql, params);
//   // 查詢總數（需移除 ORDER BY，避免 GROUP BY 錯誤）
//   const countSql = sql.replace(/ORDER BY[\s\S]*/i, '').replace('SELECT *', 'SELECT COUNT(*) as total');
//   const countResult = await query(countSql, params);
//   const total = countResult[0]?.total || 0;
//   return NextResponse.json({ success: true, data: logs, total });
// }

// // 新增日誌
// export async function POST(request: Request) {
//   const { userId, date, task, content, hours } = await request.json();
//   const result = await query(
//     `INSERT INTO WorkLogs (userId, date, task, content, hours) OUTPUT INSERTED.* VALUES (@param0, @param1, @param2, @param3, @param4)`,
//     [userId, date, task, content, hours]
//   );
//   return NextResponse.json({ success: true, data: result[0] });
// }

// // 可擴充 PUT/DELETE/批次匯入
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

function getUserIdFromRequest(request: Request): number | null {
  try {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/(?:userId|teamMemberId)=([^;]+)/);
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
}

function safeDecimal(val: any): number {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function safeDate(val: any): string {
  const d =
    typeof val === 'string'
      ? new Date(val)
      : val instanceof Date
      ? val
      : new Date(val);
  if (isNaN(d.getTime())) throw new Error('Invalid date');
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const p = url.searchParams;
  const filters: any[] = [];
  let sqlText = 'SELECT * FROM WorkLogs WHERE 1=1';

  if (p.get('userId')) {
    sqlText += ` AND userId = @param${filters.length}`;
    filters.push(Number(p.get('userId')));
  }
  if (p.get('startDate')) {
    sqlText += ` AND date >= @param${filters.length}`;
    filters.push(safeDate(p.get('startDate')));
  }
  if (p.get('endDate')) {
    sqlText += ` AND date <= @param${filters.length}`;
    filters.push(safeDate(p.get('endDate')));
  }
  if (p.get('task')) {
    sqlText += ` AND task LIKE @param${filters.length}`;
    filters.push(`%${p.get('task')}%`);
  }
  if (p.get('content')) {
    sqlText += ` AND content LIKE @param${filters.length}`;
    filters.push(`%${p.get('content')}%`);
  }
  sqlText += ' ORDER BY date DESC';

  const data = await query(sqlText, filters);
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: '未授權' },
      { status: 403 }
    );
  }
  const { date, task, content, hours } = await request.json();

  const result = await query(
    `INSERT INTO WorkLogs (userId, date, task, content, hours)
     OUTPUT INSERTED.*
     VALUES (@param0, @param1, @param2, @param3, @param4)`,
    [userId, safeDate(date), task, content, safeDecimal(hours)]
  );
  return NextResponse.json({ success: true, data: result[0] });
}

export async function PUT(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: '未授權' },
      { status: 403 }
    );
  }
  const { id, date, task, content, hours } = await request.json();
  if (!id) {
    return NextResponse.json(
      { success: false, error: '缺少日誌 ID' },
      { status: 400 }
    );
  }

  const existing = await query('SELECT * FROM WorkLogs WHERE id=@param0', [
    Number(id),
  ]);
  if (!existing.length) {
    return NextResponse.json(
      { success: false, error: '日誌不存在' },
      { status: 404 }
    );
  }
  if (existing[0].userId !== userId) {
    return NextResponse.json(
      { success: false, error: '未授權' },
      { status: 403 }
    );
  }

  await query(
    `UPDATE WorkLogs
       SET date    = @param0,
           task    = @param1,
           content = @param2,
           hours   = @param3
     WHERE id      = ${Number(id)}`,
    [safeDate(date), task, content, safeDecimal(hours)]
  );

  const updated = await query('SELECT * FROM WorkLogs WHERE id=@param0', [
    Number(id),
  ]);

  return NextResponse.json({ success: true, data: updated[0] });
}

export async function DELETE(request: Request) {
  const userId = getUserIdFromRequest(request);
  const idParam = new URL(request.url).searchParams.get('id');
  if (!idParam) {
    return NextResponse.json(
      { success: false, error: '缺少日誌 ID' },
      { status: 400 }
    );
  }
  const id = Number(idParam);

  const existing = await query('SELECT * FROM WorkLogs WHERE id=@param0', [id]);
  if (!existing.length) {
    return NextResponse.json(
      { success: false, error: '日誌不存在' },
      { status: 404 }
    );
  }
  if (existing[0].userId !== userId) {
    return NextResponse.json(
      { success: false, error: '未授權' },
      { status: 403 }
    );
  }

  await query('DELETE FROM WorkLogs WHERE id=@param0', [id]);
  return NextResponse.json({ success: true, data: existing[0] });
}
