import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface TodoRow {
  id: number;
  userId: number;
  userName?: string;
  title: string;
  content: string;
  dueDate: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

async function ensureTodoTable() {
  await query(`
    IF OBJECT_ID(N'dbo.UserTodos', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.UserTodos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        title NVARCHAR(200) NOT NULL,
        content NVARCHAR(MAX) NULL,
        dueDate DATE NULL,
        status NVARCHAR(20) NOT NULL CONSTRAINT DF_UserTodos_Status DEFAULT 'pending',
        priority NVARCHAR(20) NOT NULL CONSTRAINT DF_UserTodos_Priority DEFAULT 'medium',
        createdAt DATETIME NOT NULL CONSTRAINT DF_UserTodos_CreatedAt DEFAULT GETDATE(),
        updatedAt DATETIME NOT NULL CONSTRAINT DF_UserTodos_UpdatedAt DEFAULT GETDATE()
      );

      CREATE INDEX IX_UserTodos_UserId ON dbo.UserTodos(userId);
      CREATE INDEX IX_UserTodos_DueDate ON dbo.UserTodos(dueDate);
      CREATE INDEX IX_UserTodos_Status ON dbo.UserTodos(status);
    END
  `);
}

export async function GET(request: Request) {
  try {
    await ensureTodoTable();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userIds = searchParams.get('userIds');
    const keyword = searchParams.get('keyword');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let sql = `
      SELECT t.*, tm.name AS userName
      FROM UserTodos t
      LEFT JOIN TeamMembers tm ON tm.id = t.userId
    `;

    const conditions: string[] = [];
    const params: (string | number | null)[] = [];
    let idx = 0;

    if (userId) {
      conditions.push(`t.userId = @param${idx}`);
      params.push(Number(userId));
      idx++;
    }

    if (userIds) {
      const ids = userIds.split(',').map((s) => s.trim()).filter(Boolean).map(Number);
      if (ids.length > 0) {
        conditions.push(`t.userId IN (${ids.map((_, i) => `@param${idx + i}`).join(',')})`);
        params.push(...ids);
        idx += ids.length;
      }
    }

    if (keyword) {
      conditions.push(`(t.title LIKE @param${idx} OR t.content LIKE @param${idx})`);
      params.push(`%${keyword}%`);
      idx++;
    }

    if (status) {
      conditions.push(`t.status = @param${idx}`);
      params.push(status);
      idx++;
    }

    if (priority) {
      conditions.push(`t.priority = @param${idx}`);
      params.push(priority);
      idx++;
    }

    if (startDate && endDate) {
      conditions.push(`CAST(t.dueDate AS date) BETWEEN @param${idx} AND @param${idx + 1}`);
      params.push(startDate, endDate);
      idx += 2;
    } else if (startDate) {
      conditions.push(`CAST(t.dueDate AS date) >= @param${idx}`);
      params.push(startDate);
      idx++;
    } else if (endDate) {
      conditions.push(`CAST(t.dueDate AS date) <= @param${idx}`);
      params.push(endDate);
      idx++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY t.createdAt DESC';

    const rows = await query<TodoRow[]>(sql, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('查詢代辦失敗:', error);
    return NextResponse.json({ success: false, error: '查詢代辦失敗' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTodoTable();

    const body = await request.json();
    const { userId, title, content, dueDate, status = 'pending', priority = 'medium' } = body || {};

    if (!userId || !title) {
      return NextResponse.json({ success: false, error: '缺少必要參數' }, { status: 400 });
    }

    const rows = await query<TodoRow[]>(
      `
      INSERT INTO UserTodos (userId, title, content, dueDate, status, priority, createdAt, updatedAt)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5, GETDATE(), GETDATE());

      SELECT TOP 1 t.*, tm.name AS userName
      FROM UserTodos t
      LEFT JOIN TeamMembers tm ON tm.id = t.userId
      WHERE t.id = SCOPE_IDENTITY();
      `,
      [Number(userId), title, content || '', dueDate || null, status, priority]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('新增代辦失敗:', error);
    return NextResponse.json({ success: false, error: '新增代辦失敗' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureTodoTable();

    const body = await request.json();
    const { id, userId, title, content, dueDate, status, priority } = body || {};

    if (!id || !userId || !title) {
      return NextResponse.json({ success: false, error: '缺少必要參數' }, { status: 400 });
    }

    const owner = await query<{ userId: number }[]>('SELECT userId FROM UserTodos WHERE id = @param0', [Number(id)]);
    if (!owner.length) {
      return NextResponse.json({ success: false, error: '找不到該代辦事項' }, { status: 404 });
    }

    if (Number(owner[0].userId) !== Number(userId)) {
      return NextResponse.json({ success: false, error: '不可修改其他使用者代辦事項' }, { status: 403 });
    }

    const rows = await query<TodoRow[]>(
      `
      UPDATE UserTodos
      SET title = @param0,
          content = @param1,
          dueDate = @param2,
          status = @param3,
          priority = @param4,
          updatedAt = GETDATE()
      WHERE id = @param5;

      SELECT t.*, tm.name AS userName
      FROM UserTodos t
      LEFT JOIN TeamMembers tm ON tm.id = t.userId
      WHERE t.id = @param5;
      `,
      [title, content || '', dueDate || null, status || 'pending', priority || 'medium', Number(id)]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('更新代辦失敗:', error);
    return NextResponse.json({ success: false, error: '更新代辦失敗' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureTodoTable();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ success: false, error: '缺少必要參數' }, { status: 400 });
    }

    const owner = await query<{ userId: number }[]>('SELECT userId FROM UserTodos WHERE id = @param0', [Number(id)]);
    if (!owner.length) {
      return NextResponse.json({ success: false, error: '找不到該代辦事項' }, { status: 404 });
    }

    if (Number(owner[0].userId) !== Number(userId)) {
      return NextResponse.json({ success: false, error: '不可刪除其他使用者代辦事項' }, { status: 403 });
    }

    await query('DELETE FROM UserTodos WHERE id = @param0', [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('刪除代辦失敗:', error);
    return NextResponse.json({ success: false, error: '刪除代辦失敗' }, { status: 500 });
  }
}
