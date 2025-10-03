import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import sql from 'mssql';

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/teamMemberId=([^;]+)/);
    if (!match) {
      return NextResponse.json(
        { success: false, error: '未登入', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }
    const teamMemberId = Number(match[1]);
    if (Number.isNaN(teamMemberId)) {
      return NextResponse.json(
        { success: false, error: '使用者識別錯誤', code: 'BAD_SESSION' },
        { status: 400 }
      );
    }
    const pool = await getConnection();
    const tm = await pool
      .request()
      .input('id', sql.Int, teamMemberId)
      .query(
        `SELECT TOP 1 * FROM [ProjectTracking].[dbo].[TeamMembers] WHERE id=@id`
      );
    if (!tm.recordset.length) {
      return NextResponse.json(
        { success: false, error: '使用者不存在', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }
    const row = tm.recordset[0];
    const employeeId = row.employeeId; // 可能為 undefined 需檢查
    if (!employeeId) {
      console.warn('/api/auth/me warn: employeeId 缺失於 TeamMembers', { row });
    }

    // 取得基本資料（從 JCYDB 反查更完整欄位） - 若 employeeId 缺失則跳過查詢
    let info: any = {};
    if (employeeId) {
      try {
        const emp = await pool
          .request()
          .input('emp', sql.NVarChar, String(employeeId))
          .query(
            `SELECT TOP 1 [部門名稱] as departmentName,[姓名] as name,[員工信箱] as email,[職位名稱] as position FROM [JCYDB].[dbo].[人員對照檔] WHERE [工號]=@emp`
          );
        info = emp.recordset[0] || {};
      } catch (empErr) {
        console.error('/api/auth/me emp 查詢失敗', empErr);
      }
    }

    let hasPasskey = false;
    try {
      const cred = await pool
        .request()
        .input('uid', sql.Int, teamMemberId)
        .query(
          `SELECT COUNT(1) as cnt FROM [ProjectTracking].[dbo].[WebAuthnCredentials] WHERE userId=@uid AND isActive=1`
        );
      hasPasskey = cred.recordset[0]?.cnt > 0;
    } catch (credErr) {
      console.error('/api/auth/me credential 查詢失敗', credErr);
    }

    const role =
      (info.position &&
        ['經理', '副理', '總經理', '董事長', '課長'].some((p) =>
          info.position.includes(p)
        )) ||
      (row.departmentCode && row.departmentCode.startsWith('IT'))
        ? 'admin'
        : 'user';
    return NextResponse.json({
      success: true,
      data: {
        teamMemberId,
        employeeId: employeeId || row.employeeId,
        name: info.name || row.name,
        department: info.departmentName || row.department,
        email: info.email || row.email,
        position: info.position || row.position,
        role,
        hasPasskey,
      },
    });
  } catch (e) {
    console.error('/api/auth/me error', e);
    return NextResponse.json(
      { success: false, error: '取得使用者失敗', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
