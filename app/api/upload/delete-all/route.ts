// app/api/delete-multiple/route.ts
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const { public_ids } = await req.json();

    if (!Array.isArray(public_ids)) {
      return NextResponse.json({ error: 'public_ids must be an array' }, { status: 400 });
    }

    const deleteResults = await Promise.all(
      public_ids.map(id => cloudinary.uploader.destroy(id))
    );

    return NextResponse.json({ success: true, results: deleteResults });
  } catch (error) {
    console.error('Batch delete error:', error);
    return NextResponse.json({ error: 'Batch delete failed' }, { status: 500 });
  }
}
