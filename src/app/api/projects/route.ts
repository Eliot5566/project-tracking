import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  managerId: number;
  managerName: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  averageProgress?: number;
}

// 獲取所有專案
export async function GET(request: Request) {
  try {
    // 解析 URL 中的查詢參數 searchParams
    // 例如: /api/projects?status=active&managerId=1,2
    const { searchParams } = new URL(request.url);

    // 從查詢參數中獲取 status, managerId, projectId
    const status = searchParams.get('status');
    const managerId = searchParams.get('managerId');
    const projectId = searchParams.get('projectId');

    // 構建 SQL 查詢語句
    // 使用 LEFT JOIN 來獲取專案、經理和任務的相關資訊
    // 使用 COUNT 和 SUM 來計算任務數量和平均進度
    let sqlQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.startDate,
        p.endDate,
        p.managerId,
        tm.name as managerName,
        p.createdAt,
        p.updatedAt,
        COUNT(t.id) as taskCount,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(t.id) * 100
        END as averageProgress
      FROM Projects p
      LEFT JOIN TeamMembers tm ON p.managerId = tm.id
      LEFT JOIN Tasks t ON p.id = t.projectId
    `;

    // 構建查詢條件
    // 根據 status, managerId, projectId 來過濾專案
    const params: (string | number | null)[] = []; // 用於存儲查詢參數
    const conditions: string[] = []; // 用於存儲 SQL 條件語句
    let paramIdx = 0; // 用於生成參數名稱的索引

    // 如果有 status, managerId, projectId，則添加到條件中
    if (status) {
      // 將 status 添加到條件中
      // 使用 @param0, @param1 等格式來避免 SQL 注入 例如: @param0 = 'active'
      conditions.push(`p.status = @param${paramIdx}`); // 使用 @param0 來表示第一個參數 呈現 p.status = @param0
      // 將 status 添加到 params 中
      // params = ['active'] 例如: 如果 status = 'active'
      // params.push(status); 這樣就可以在查詢時使用 @param0
      params.push(status);
      paramIdx++;
    }
    // 如果有 managerId，則添加到條件中
    // managerId 可以是多個 ID 以逗號分隔，例如: '1,2,3'
    // 需要將其拆分成數組並生成相應的 SQL 條件
    if (managerId) {
      // 將 managerId 拆分成數組，並去除空白
      // 例如: '1,2,3' 會被拆分成 ['1', '2', '3']
      const ids = managerId
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      if (ids.length > 0) {
        conditions.push(
          `p.managerId IN (${ids
            .map((_, i) => `@param${paramIdx + i}`)
            .join(',')})`
        );
        params.push(...ids.map(Number));
        paramIdx += ids.length;
      }
    }
    // 如果專案 ID 存在，則添加到條件中
    if (projectId) {
      // 將 projectId 拆分成數組，並去除空白
      const ids = projectId
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      if (ids.length > 0) {
        // 使用 IN 條件來查詢多個專案 ID
        conditions.push(
          `p.id IN (${ids.map((_, i) => `@param${paramIdx + i}`).join(',')})`
        );
        params.push(...ids.map(Number));
        paramIdx += ids.length;
      }
    }
    // 如果有其他條件，可以在這裡添加
    if (conditions.length > 0) {
      // 如果有條件，則在 SQL 查詢中添加 WHERE 子句
      // 使用 AND 來連接多個條件
      sqlQuery += ' WHERE ' + conditions.join(' AND ');
    }

    sqlQuery +=
      ' GROUP BY p.id, p.name, p.description, p.status, p.startDate, p.endDate, p.managerId, tm.name, p.createdAt, p.updatedAt';
    sqlQuery += ' ORDER BY p.createdAt DESC';

    // 執行 SQL 查詢   await query 是一個自定義的數據庫查詢函數  <Project[]> 是 TypeScript 的泛型，用於指定返回的數據類型
    // query 函數會執行 SQL 查詢並返回結果
    const projects = await query<Project[]>(sqlQuery, params);

    // 返回查詢結果
    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('查詢錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: '獲取專案列表失敗',
      },
      { status: 500 }
    );
  }
}

// 創建新專案
export async function POST(request: Request) {
  try {
    // 從請求中獲取 JSON 主體  request.json() 會解析請求的 JSON 主體
    // 這裡假設請求的主體包含專案的詳細資訊
    const body = await request.json();
    // 從請求主體中提取專案的各個屬性
    const { name, description, status, startDate, endDate, managerId } = body;

    const sqlQuery = `
      INSERT INTO Projects (
        name, description, status, startDate, endDate, managerId,
        createdAt, updatedAt
      )
      VALUES (
        @param0, @param1, @param2, @param3, @param4, @param5,
        GETDATE(), GETDATE()
      );
      
      SELECT SCOPE_IDENTITY() as id;
    `;

    // 執行插入操作，並返回新插入專案的 ID
    // SCOPE_IDENTITY() 用於獲取剛插入的行的 ID
    // query 函數會執行 SQL 查詢並返回結果 await query<{ id: number }[]>(sqlQuery, [
    const result = await query<{ id: number }[]>(sqlQuery, [
      name,
      description,
      status,
      startDate,
      endDate,
      managerId,
    ]);

    // 如果沒有返回結果，則表示插入失敗  定義一個新的專案對象
    const newProject = await query<Project[]>(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.startDate,
        p.endDate,
        p.managerId,
        tm.name as managerName,
        p.createdAt,
        p.updatedAt,
        COUNT(t.id) as taskCount,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(t.id) * 100
        END as averageProgress
       FROM Projects p
       LEFT JOIN TeamMembers tm ON p.managerId = tm.id
       LEFT JOIN Tasks t ON p.id = t.projectId
       WHERE p.id = @param0
       GROUP BY p.id, p.name, p.description, p.status, p.startDate, p.endDate, p.managerId, tm.name, p.createdAt, p.updatedAt`,
      [result[0].id] // 將新插入的專案 ID 作為參數傳入 避免 SQL 注入
    );

    return NextResponse.json({
      success: true,
      data: newProject[0],
    });
  } catch (error) {
    console.error('創建錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: '創建專案失敗',
      },
      { status: 500 }
    );
  }
}

// 更新專案
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, status, startDate, endDate, managerId } =
      body;

    const sqlQuery = `
      UPDATE Projects
      SET 
        name = @param0,
        description = @param1,
        status = @param2,
        startDate = @param3,
        endDate = @param4,
        managerId = @param5,
        updatedAt = GETDATE()
      WHERE id = @param6;
      
      SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.startDate,
        p.endDate,
        p.managerId,
        tm.name as managerName,
        p.createdAt,
        p.updatedAt,
        COUNT(t.id) as taskCount,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(t.id) * 100
        END as averageProgress
      FROM Projects p
      LEFT JOIN TeamMembers tm ON p.managerId = tm.id
      LEFT JOIN Tasks t ON p.id = t.projectId
      WHERE p.id = @param6
      GROUP BY p.id, p.name, p.description, p.status, p.startDate, p.endDate, p.managerId, tm.name, p.createdAt, p.updatedAt;
    `;

    const updatedProject = await query<Project[]>(sqlQuery, [
      name,
      description,
      status,
      startDate,
      endDate,
      managerId,
      id,
    ]);

    if (updatedProject.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '找不到指定的專案',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProject[0],
    });
  } catch (error) {
    console.error('更新錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: '更新專案失敗',
      },
      { status: 500 }
    );
  }
}

// 刪除專案
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少專案 ID',
        },
        { status: 400 }
      );
    }

    // 先獲取要刪除的專案資訊
    const projectToDelete = await query<Project[]>(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.startDate,
        p.endDate,
        p.createdAt,
        p.updatedAt,
        COUNT(t.id) as taskCount,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE CAST(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(t.id) * 100
        END as averageProgress
      FROM Projects p
      LEFT JOIN Tasks t ON p.id = t.projectId
      WHERE p.id = @param0
      GROUP BY p.id, p.name, p.description, p.status, p.startDate, p.endDate, p.createdAt, p.updatedAt`,
      [id]
    );
    // if projectToDelete.length 為 0，表示找不到指定的專案
    // 這裡使用了 TypeScript 的類型斷言，確保 projectToDelete 是一個 Project 類型的數組
    // 類型斷言寫法是 <Project[]>projectToDelete 基本上是將 projectToDelete 斷言為 Project 類型的數組
    // 這樣可以確保在後續操作中，TypeScript 能夠正確識別 projectToDelete 的類型
    // 如果專案不存在，則返回 404 錯誤

    if (projectToDelete.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '找不到指定的專案',
        },
        { status: 404 }
      );
    }

    // 執行刪除操作
    // 使用 DELETE 語句刪除專案
    await query(`DELETE FROM Projects WHERE id = @param0`, [id]);
    // 刪除成功後，返回被刪除的專案資訊
    // 這裡返回的是之前查詢到的專案資訊
    // 這樣可以在前端顯示被刪除的專案資訊，或者進行其他操作
    return NextResponse.json({
      success: true,
      data: projectToDelete[0],
      // 返回被刪除的專案資訊 projectToDelete[0] 是一個 Project 類型的對象 包含了專案的所有屬性 例如 id、name、description 等
    });
  } catch (error) {
    console.error('刪除錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: '刪除專案失敗',
      },
      { status: 500 }
    );
  }
}
