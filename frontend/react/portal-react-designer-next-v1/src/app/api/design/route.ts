import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { panels, fileName, action } = body;
    
    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }
    
    // Remove extension if provided and add .json
    const cleanFileName = fileName.replace(/\.(json|tsx?)$/, '') + '.json';
    
    // Determine output directory
    const outputDir = join(process.cwd(), 'design');
    
    if (action === 'save') {
      if (!panels) {
        return NextResponse.json(
          { error: 'Panels data is required for save operation' },
          { status: 400 }
        );
      }
      
      // Create directory if it doesn't exist
      try {
        await mkdir(outputDir, { recursive: true });
      } catch (mkdirError) {
        console.error('Failed to create output directory:', mkdirError);
        return NextResponse.json(
          { error: 'Failed to create output directory', details: mkdirError instanceof Error ? mkdirError.message : 'Unknown error' },
          { status: 500 }
        );
      }
      
      // Write design file
      const filePath = join(outputDir, cleanFileName);
      const designData = {
        version: '1.0',
        fileName: cleanFileName,
        savedAt: new Date().toISOString(),
        panels: panels
      };
      
      await writeFile(filePath, JSON.stringify(designData, null, 2), 'utf-8');
      
      return NextResponse.json({
        success: true,
        message: 'Design saved successfully',
        filePath: filePath,
        fileName: cleanFileName
      });
      
    } else if (action === 'load') {
      // Read design file
      const filePath = join(outputDir, cleanFileName);
      
      try {
        const fileContent = await readFile(filePath, 'utf-8');
        const designData = JSON.parse(fileContent);
        
        return NextResponse.json({
          success: true,
          message: 'Design loaded successfully',
          data: designData
        });
      } catch (readError) {
        console.error('Failed to read design file:', readError);
        return NextResponse.json(
          { error: 'Failed to load design file. File may not exist.', details: readError instanceof Error ? readError.message : 'Unknown error' },
          { status: 404 }
        );
      }
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "save" or "load"' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error processing design request:', error);
    return NextResponse.json(
      { error: 'Failed to process design request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
