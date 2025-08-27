import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
    }

    // Security: Only allow access to content files
    if (!path.startsWith('/src/content/') || path.includes('..')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    // Convert to absolute path
    const absolutePath = join(process.cwd(), path.replace(/^\//, ''));
    
    try {
      const content = await readFile(absolutePath, 'utf-8');
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    } catch (fileError) {
      console.error('File not found:', absolutePath, fileError);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


