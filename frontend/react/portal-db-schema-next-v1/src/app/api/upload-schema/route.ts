import { NextRequest, NextResponse } from 'next/server';
import { writeFile, access } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.dbs')) {
      return NextResponse.json({ error: 'Only .dbs files are allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const schemaDir = join(process.cwd(), 'schema');
    let filename = file.name;
    let filepath = join(schemaDir, filename);

    // Check if file already exists
    try {
      await access(filepath);
      // File exists, append timestamp
      const nameWithoutExt = filename.slice(0, -4); // Remove .dbs
      const timestamp = Date.now();
      filename = `${nameWithoutExt}_${timestamp}.dbs`;
      filepath = join(schemaDir, filename);
    } catch {
      // File doesn't exist, use original filename
    }

    // Write the file
    await writeFile(filepath, buffer);

    return NextResponse.json({ 
      success: true, 
      filename,
      message: 'File uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
