import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { filePaths } = data;

    if (!Array.isArray(filePaths)) {
      return NextResponse.json(
        { error: 'filePaths must be an array' },
        { status: 400 }
      );
    }

    const deletePromises = filePaths
      .filter(path => path && path.startsWith('/uploads/'))
      .map(async (path) => {
        const fullPath = join(process.cwd(), 'public', path);
        if (existsSync(fullPath)) {
          await unlink(fullPath);
        }
      });

    await Promise.all(deletePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting files:', error);
    return NextResponse.json(
      { error: 'Failed to delete files' },
      { status: 500 }
    );
  }
}
