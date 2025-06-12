// 任務依賴關係 API 路由
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface TaskDependency {
  id: number;
  taskId: number;
  dependsOnTaskId: number;
  type: string; // 'start-to-start', 'start-to-finish', 'finish-to-start', 'finish-to-finish'
  createdAt: string;
}

// 獲取任務依賴關係（單一或全部）
export async function GET(req: Request) {
  const { pathname, searchParams } = new URL(req.url);
  // /api/tasks/dependencies/all
  if (pathname.endsWith('/all')) {
    try {
      const all = await query<any[]>(
        `SELECT td.*, t1.title AS taskTitle, t2.title AS dependsOnTaskTitle
         FROM TaskDependencies td
         JOIN Tasks t1 ON td.taskId = t1.id
         JOIN Tasks t2 ON td.dependsOnTaskId = t2.id`
      );
      return NextResponse.json({ success: true, data: all });
    } catch (error) {
      console.error('獲取所有依賴關係錯誤:', error);
      return NextResponse.json({ success: false, error: '獲取所有依賴關係失敗' }, { status: 500 });
    }
  }

  try {
    const taskId = searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({
        success: false,
        error: '缺少任務ID參數'
      }, { status: 400 });
    }

    // 查詢此任務的所有依賴
    const dependencies = await query<TaskDependency[]>(
      `SELECT td.*, t.title AS dependsOnTaskTitle
       FROM TaskDependencies td
       JOIN Tasks t ON td.dependsOnTaskId = t.id
       WHERE td.taskId = @param0`,
      [taskId]
    );

    // 查詢哪些任務依賴於此任務
    const dependents = await query<TaskDependency[]>(
      `SELECT td.*, t.title AS dependentTaskTitle
       FROM TaskDependencies td
       JOIN Tasks t ON td.taskId = t.id
       WHERE td.dependsOnTaskId = @param0`,
      [taskId]
    );

    return NextResponse.json({
      success: true,
      data: {
        dependencies,
        dependents
      }
    });
  } catch (error) {
    console.error('獲取任務依賴關係錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '獲取任務依賴關係失敗'
    }, { status: 500 });
  }
}

// 新增任務依賴關係
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { taskId, dependsOnTaskId, type } = body;
    

    if (!taskId || !dependsOnTaskId || !type) {
      return NextResponse.json({
        success: false,
        error: '缺少必要參數'
      }, { status: 400 });
    }

    // 檢查是否已存在該依賴關係
    const existingDependency = await query<TaskDependency[]>(
      `SELECT * FROM TaskDependencies
       WHERE taskId = @param0 AND dependsOnTaskId = @param1`,
      [taskId, dependsOnTaskId]
    );

    if (existingDependency.length > 0) {

      return NextResponse.json({
        success: false,
        error: '該依賴關係已存在'
      }, { status: 400 });
    }

    // 檢查是否會造成循環依賴
    const wouldCreateCycle = await checkForCyclicDependency(taskId, dependsOnTaskId);
    
    if (wouldCreateCycle) {
      return NextResponse.json({
        success: false,
        error: '不允許的循環依賴關係'
      }, { status: 400 });
    }

    await query(
      `INSERT INTO TaskDependencies (taskId, dependsOnTaskId, type, createdAt)
       VALUES (@param0, @param1, @param2, GETDATE())`,
      [taskId, dependsOnTaskId, type]
    );

    return NextResponse.json({
      success: true,
      message: '任務依賴關係創建成功'
    });
  } catch (error) {
    console.error('創建任務依賴關係錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '創建任務依賴關係失敗'
    }, { status: 500 });
  }
}

// 刪除任務依賴關係
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少依賴關係ID'
      }, { status: 400 });
    }

    await query(
      `DELETE FROM TaskDependencies WHERE id = @param0`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: '任務依賴關係刪除成功'
    });
  } catch (error) {
    console.error('刪除任務依賴關係錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '刪除任務依賴關係失敗'
    }, { status: 500 });
  }
}

// 檢查添加新依賴是否會造成循環依賴
async function checkForCyclicDependency(taskId: string | number, dependsOnTaskId: string | number): Promise<boolean> {
  // 使用深度優先搜索 (DFS) 檢查循環依賴
  // 如果當前任務 ID 等於依賴的任務 ID，則表示存在循環 DFS具體實現如下：
  // 如果已經訪問過當前任務 ID，則表示沒有循環

  // 使用 Set 來記錄已訪問的任務 ID 
  // visited用於避免重複訪問 
  const visited = new Set<string | number>();
  
  async function dfs(currentTaskId: string | number): Promise<boolean> {
    if (currentTaskId === taskId) {
      return true; // 找到循環
    }
    
    if (visited.has(currentTaskId)) {
      return false; // 已訪問但無循環
    }
    
    visited.add(currentTaskId);
    
    // 查詢當前任務依賴的所有任務
    const dependencies = await query<TaskDependency[]>(
      `SELECT dependsOnTaskId FROM TaskDependencies WHERE taskId = @param0`,
      [currentTaskId]
    );
    
    for (const dep of dependencies) {
      if (await dfs(dep.dependsOnTaskId)) {
        return true; // 存在循環
      }
    }
    
    return false;
  }
  
  return await dfs(dependsOnTaskId);
}
