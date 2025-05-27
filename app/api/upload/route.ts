import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { base64Data, fileName } = data;

    if (!base64Data || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Remove the data URL prefix if present
    const base64Content = base64Data.replace(/^data:image\/(png|jpg|jpeg|gif|svg\+xml);base64,/, '');
    const buffer = Buffer.from(base64Content, 'base64');

    const uploadsDir = join(process.cwd(), 'public/uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filePath = `/uploads/${fileName}`;
    const fullPath = join(process.cwd(), 'public', filePath);

    await writeFile(fullPath, buffer);

    return NextResponse.json({ success: true, filePath });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return NextResponse.json(
      { error: 'Failed to save file' },
      { status: 500 }
    );
  }
}
