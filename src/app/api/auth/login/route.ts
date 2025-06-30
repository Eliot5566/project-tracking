import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import sql from 'mssql';

if (typeof window !== 'undefined') {
  throw new Error('`auth/login/route.ts` should only be used on the server side.');
}

export async function POST(request: Request) {
  try {
    const { employeeId, password } = await request.json();

    if (!employeeId || !password) {
      return NextResponse.json(
        { success: false, error: '請輸入工號和密碼' },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    
    // 從 JCYDB 資料庫查詢使用者
    const result = await pool.request()
      .input('employeeId', sql.NVarChar, employeeId)
      .input('password', sql.NVarChar, password)
      .query(`
        SELECT 
          [部門代碼] as departmentCode,
          [部門名稱] as departmentName,
          [工號] as employeeId,
          [姓名] as name,
          [職位名稱] as position,
          [密碼] as password,
          [國籍] as nationality,
          [員工信箱] as email,
          [主管姓名] as supervisorName,
          [離職日期] as resignationDate,
          [登入次數] as loginCount,
          [最後登入時間] as lastLoginTime
        FROM [JCYDB].[dbo].[人員對照檔]
        WHERE [工號] = @employeeId AND [密碼] = @password
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: '工號或密碼錯誤' },
        { status: 401 }
      );
    }

    const user = result.recordset[0];

    // 檢查是否已離職
    if (user.resignationDate) {
      return NextResponse.json(
        { success: false, error: '該帳號已離職' },
        { status: 403 }
      );
    }

    // 查詢 TeamMembers.id
    const teamMemberResult = await pool.request()
      .input('employeeId', sql.NVarChar, employeeId)
      .query(`
        SELECT TOP 1 id FROM [ProjectTracking].[dbo].[TeamMembers] WHERE employeeId = @employeeId
      `);

    const teamMemberId = teamMemberResult.recordset.length > 0 ? teamMemberResult.recordset[0].id : null;

    // 更新登入資訊
    await pool.request()
      .input('employeeId', sql.NVarChar, employeeId)
      .query(`
        UPDATE [JCYDB].[dbo].[人員對照檔]
        SET 
          [登入次數] = [登入次數] + 1,
          [最後登入時間] = GETDATE()
        WHERE [工號] = @employeeId
      `);

    // 不產生 JWT，直接回傳 user 物件，並加上 teamMemberId
    return NextResponse.json({
      success: true,
      data: {
        user: {
          employeeId: user.employeeId,
          name: user.name,
          department: user.departmentName,
          position: user.position,
          role: ['經理', '副理', '總經理', '董事長', '課長'].some(pos => user.position.includes(pos)) || user.departmentCode.startsWith('IT') ? 'admin' : 'user',
          email: user.email,
          teamMemberId, // 新增這個欄位
        }
      }
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    return NextResponse.json(
      { success: false, error: '登入失敗' },
      { status: 500 }
    );
  }
}