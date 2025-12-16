import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const schemaDir = join(process.cwd(), 'schema');
    const files = await readdir(schemaDir);
    
    // Filter only .dbs files
    const dbsFiles = files.filter(file => file.endsWith('.dbs'));
    
    return NextResponse.json(dbsFiles);
  } catch (error) {
    console.error('Error reading schema directory:', error);
    return NextResponse.json([]);
  }
}
