import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const documents = await query(
      `SELECT d.*, 
       (SELECT COUNT(*) FROM Documents WHERE parentDocumentId = d.id OR id = d.parentDocumentId) as versionCount 
       FROM Documents d 
       WHERE isLatestVersion = 1 
       ORDER BY updatedAt DESC`,
      []
    );

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
