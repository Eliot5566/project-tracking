import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import sql from 'mssql';

// 產生隨機 challenge（給第二階段 WebAuthn 使用）
function randomChallenge(len = 32) {
  const buf = Buffer.alloc(len);
  for (let i = 0; i < len; i++) buf[i] = Math.floor(Math.random() * 256);
  return buf.toString('base64url');
}

if (typeof window !== 'undefined') {
  throw new Error(
    '`auth/login/route.ts` should only be used on the server side.'
  );
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
    const result = await pool
      .request()
      .input('employeeId', sql.NVarChar, employeeId)
      .input('password', sql.NVarChar, password).query(`
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
    const teamMemberResult = await pool
      .request()
      .input('employeeId', sql.NVarChar, employeeId).query(`
        SELECT TOP 1 id FROM [ProjectTracking].[dbo].[TeamMembers] WHERE employeeId = @employeeId
      `);

    const teamMemberId =
      teamMemberResult.recordset.length > 0
        ? teamMemberResult.recordset[0].id
        : null;

    // 更新登入資訊
    await pool.request().input('employeeId', sql.NVarChar, employeeId).query(`
        UPDATE [JCYDB].[dbo].[人員對照檔]
        SET 
          [登入次數] = [登入次數] + 1,
          [最後登入時間] = GETDATE()
        WHERE [工號] = @employeeId
      `);

    // 檢查是否已有已註冊的 WebAuthn 憑證
    let hasPasskey = false;
    if (teamMemberId) {
      const passkeyResult = await pool
        .request()
        .input('tmid', sql.Int, teamMemberId)
        .query(
          `SELECT TOP 1 id FROM [ProjectTracking].[dbo].[WebAuthnCredentials] WHERE userId = @tmid AND isActive = 1`
        );
      hasPasskey = passkeyResult.recordset.length > 0;
    }

    const baseUser = {
      employeeId: user.employeeId,
      name: user.name,
      department: user.departmentName,
      position: user.position,
      role:
        ['經理', '副理', '總經理', '董事長', '課長'].some((pos) =>
          user.position.includes(pos)
        ) || user.departmentCode.startsWith('IT')
          ? 'admin'
          : 'user',
      email: user.email,
      teamMemberId,
    };

    // 若已有 Passkey，啟動二階段驗證，不直接給最終 session cookie
    if (hasPasskey && teamMemberId) {
      const challenge = randomChallenge();
      const res = NextResponse.json({
        success: true,
        data: {
          requiresWebAuthn: true,
          user: baseUser,
        },
      });
      const isProd = process.env.NODE_ENV === 'production';
      // dev 環境不強制 secure，避免 http 下 cookie 無法寫入導致後續找不到 pendingUserId
      res.cookies.set('pendingUserId', String(teamMemberId), {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
        maxAge: 300, // 5 分鐘
      });
      res.cookies.set('pendingStep', 'webauthn', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
        maxAge: 300,
      });
      return res;
    }

    // 沒有 Passkey → 直接建立最終登入 cookie
    if (teamMemberId) {
      const res = NextResponse.json({
        success: true,
        data: {
          user: baseUser,
          requiresWebAuthn: false,
        },
      });
      const isProd = process.env.NODE_ENV === 'production';
      res.cookies.set('teamMemberId', String(teamMemberId), {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
        maxAge: 60 * 60 * 8, // 8 小時
      });
      return res;
    }

    // 找不到 teamMemberId 時仍回傳成功（但無法寫日誌）
    return NextResponse.json({
      success: true,
      data: {
        user: baseUser,
        requiresWebAuthn: false,
      },
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    return NextResponse.json(
      { success: false, error: '登入失敗' },
      { status: 500 }
    );
  }
}
