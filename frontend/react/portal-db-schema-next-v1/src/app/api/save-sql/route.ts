import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { filename, content } = await request.json();

    if (!filename || !content) {
      return NextResponse.json(
        { error: 'Filename and content are required' },
        { status: 400 }
      );
    }

    // Validate filename (only allow .sql files)
    if (!filename.endsWith('.sql')) {
      return NextResponse.json(
        { error: 'Only .sql files are allowed' },
        { status: 400 }
      );
    }

    // Write to schema folder
    const schemaDir = join(process.cwd(), 'schema');
    const filePath = join(schemaDir, filename);

    await writeFile(filePath, content, 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Schema saved successfully to ${filename}`,
      path: filePath,
    });
  } catch (error) {
    console.error('Error saving SQL file:', error);
    return NextResponse.json(
      { error: 'Failed to save SQL file', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
