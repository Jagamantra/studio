import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { filePath } = data;

    if (!filePath || !filePath.startsWith('/uploads/')) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    const fullPath = join(process.cwd(), 'public', filePath);
    
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
