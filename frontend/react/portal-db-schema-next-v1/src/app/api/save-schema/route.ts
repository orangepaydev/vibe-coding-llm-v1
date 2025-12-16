import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { filename, content } = await request.json();

    if (!filename || !content) {
      return NextResponse.json(
        { error: 'Missing filename or content' },
        { status: 400 }
      );
    }

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Save to schema directory
    const filePath = join(process.cwd(), 'schema', filename);
    console.log("saving to ", filePath);
    await writeFile(filePath, content, 'utf-8');

    return NextResponse.json({ 
      success: true,
      message: 'Schema saved successfully',
      path: filename
    });
  } catch (error) {
    console.error('Error saving schema:', error);
    return NextResponse.json(
      { error: 'Failed to save schema' },
      { status: 500 }
    );
  }
}
