import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // 測試查詢
    const result = await query('SELECT @@VERSION as version');
    return NextResponse.json({ 
      success: true, 
      message: '數據庫連接成功',
      data: result 
    });
  } catch (error) {
    console.error('數據庫連接測試失敗:', error);
    return NextResponse.json({ 
      success: false, 
      message: '數據庫連接失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
} 