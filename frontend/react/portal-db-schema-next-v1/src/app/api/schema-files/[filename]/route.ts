import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const schemaDir = join(process.cwd(), 'schema');
    const filePath = join(schemaDir, filename);
    
    // Read the file content
    const content = await readFile(filePath, 'utf-8');
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error reading schema file:', error);
    return NextResponse.json(
      { error: 'Failed to read schema file' },
      { status: 404 }
    );
  }
}
