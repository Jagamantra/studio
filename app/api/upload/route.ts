// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { base64Data, fileName } = data;

        if (!base64Data || !fileName) {
            return NextResponse.json(
                { error: 'Missing base64Data or fileName' },
                { status: 400 }
            );
        }

        const match = base64Data.match(/^data:(image\/\w+);base64,/);
        if (!match) return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });

        const mimeType = match[1]; // like 'image/png'
        const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');

        const result = await cloudinary.uploader.upload(`data:${mimeType};base64,${base64Content}`, {
            folder: 'uploads',
            public_id: fileName.replace(/\.[^/.]+$/, ''),
            overwrite: true,
        });


        return NextResponse.json({ success: true, url: result.secure_url, public_id: result.public_id });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
