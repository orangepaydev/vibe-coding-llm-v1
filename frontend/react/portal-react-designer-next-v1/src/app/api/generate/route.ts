import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface ComponentInstance {
  id: string;
  type: string;
  label: string;
  properties: Record<string, any>;
}

interface PanelNode {
  id: string;
  name: string;
  layoutType: 'flex' | 'grid' | '';
  flexDirection: 'flex-row' | 'flex-col' | '';
  justifyContent: string;
  alignItems: string;
  gridCols: string;
  colSpan: string;
  colStart: string;
  rowSpan: string;
  rowStart: string;
  backgroundColor: string;
  children: PanelNode[];
  components: ComponentInstance[];
}

interface GenerateRequest {
  panels: PanelNode[];
  fileName: string;
}

function generateComponentCode(component: ComponentInstance): string {
  switch (component.type) {
    case 'button':
      return `<Button>{${JSON.stringify(component.label)}}</Button>`;
    
    case 'textbox':
      return `<div className="space-y-2">
  <Label htmlFor="${component.id}">{${JSON.stringify(component.label)}}</Label>
  <Input id="${component.id}" type="${component.properties.inputType || 'text'}" placeholder="Enter text" />
</div>`;
    
    case 'label':
      return `<Label>{${JSON.stringify(component.label)}}</Label>`;
    
    case 'textarea':
      return `<div className="space-y-2">
  <Label htmlFor="${component.id}">{${JSON.stringify(component.label)}}</Label>
  <Textarea id="${component.id}" placeholder="Enter text" rows={${component.properties.rows || 3}} />
</div>`;
    
    case 'select':
      const selectOptions = component.properties.options || ['Option 1', 'Option 2', 'Option 3'];
      return `<div className="space-y-2">
  <Label htmlFor="${component.id}">{${JSON.stringify(component.label)}}</Label>
  <Select>
    <SelectTrigger id="${component.id}">
      <SelectValue placeholder="Select an option" />
    </SelectTrigger>
    <SelectContent>
      ${selectOptions.map((opt: string) => `<SelectItem value="${opt.toLowerCase().replace(/\s+/g, '-')}">${opt}</SelectItem>`).join('\n      ')}
    </SelectContent>
  </Select>
</div>`;
    
    case 'radio':
      const radioOptions = component.properties.options || ['Option 1', 'Option 2', 'Option 3'];
      return `<div className="space-y-2">
  <Label>{${JSON.stringify(component.label)}}</Label>
  <RadioGroup defaultValue="option-1">
    ${radioOptions.map((opt: string, idx: number) => `<div className="flex items-center space-x-2">
      <RadioGroupItem value="option-${idx + 1}" id="option-${idx + 1}" />
      <Label htmlFor="option-${idx + 1}">${opt}</Label>
    </div>`).join('\n    ')}
  </RadioGroup>
</div>`;
    
    case 'checkbox':
      const checkboxOptions = component.properties.options || ['Option 1', 'Option 2', 'Option 3'];
      return `<div className="space-y-2">
  <Label>{${JSON.stringify(component.label)}}</Label>
  ${checkboxOptions.map((opt: string, idx: number) => `<div className="flex items-center space-x-2">
    <Checkbox id="checkbox-${idx + 1}" />
    <Label htmlFor="checkbox-${idx + 1}">${opt}</Label>
  </div>`).join('\n  ')}
</div>`;
    
    case 'calendar':
    case 'date':
      return `<div className="space-y-2">
  <Label htmlFor="${component.id}">{${JSON.stringify(component.label)}}</Label>
  <Input id="${component.id}" type="date" />
</div>`;
    
    case 'time':
      return `<div className="space-y-2">
  <Label htmlFor="${component.id}">{${JSON.stringify(component.label)}}</Label>
  <Input id="${component.id}" type="time" />
</div>`;
    
    case 'datetime':
      return `<div className="space-y-2">
  <Label htmlFor="${component.id}">{${JSON.stringify(component.label)}}</Label>
  <Input id="${component.id}" type="datetime-local" />
</div>`;
    
    case 'table':
      const columns = component.properties.columns || ['Column 1', 'Column 2', 'Column 3'];
      return `<div className="space-y-2">
  <Label>{${JSON.stringify(component.label)}}</Label>
  <Table>
    <TableHeader>
      <TableRow>
        ${columns.map((col: string) => `<TableHead>${col}</TableHead>`).join('\n        ')}
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        ${columns.map((_: string, idx: number) => `<TableCell>Data ${idx + 1}</TableCell>`).join('\n        ')}
      </TableRow>
    </TableBody>
  </Table>
</div>`;
    
    default:
      return '';
  }
}

function generatePanelCode(panel: PanelNode, depth: number = 0): string {
  const indent = '  '.repeat(depth + 1);
  const hasChildren = panel.children.length > 0;
  const hasComponents = panel.components && panel.components.length > 0;
  
  const layoutClasses = panel.layoutType === 'grid' 
    ? `grid ${panel.gridCols}` 
    : `flex ${panel.flexDirection}`;
  
  const allClasses = [
    layoutClasses,
    panel.justifyContent,
    panel.alignItems,
    panel.colSpan,
    panel.colStart,
    panel.rowSpan,
    panel.rowStart,
    panel.backgroundColor,
    hasChildren ? 'p-2 gap-2' : 'p-4',
    hasChildren ? 'min-h-[200px]' : 'min-h-[100px]',
    'border-2 border-gray-300 rounded-lg'
  ].filter(Boolean).join(' ');
  
  if (hasChildren) {
    const childrenCode = panel.children.map(child => generatePanelCode(child, depth + 1)).join('\n');
    return `${indent}<div className="${allClasses}">
${childrenCode}
${indent}</div>`;
  } else if (hasComponents) {
    const componentsCode = panel.components.map(comp => 
      generateComponentCode(comp).split('\n').map(line => `${indent}  ${line}`).join('\n')
    ).join('\n\n');
    return `${indent}<div className="${allClasses}">
${indent}  <div className="text-sm font-semibold mb-2">{${JSON.stringify(panel.name)}}</div>
${componentsCode}
${indent}</div>`;
  } else {
    return `${indent}<div className="${allClasses}">
${indent}  <div className="text-sm text-gray-500">{${JSON.stringify(panel.name)}}</div>
${indent}</div>`;
  }
}

function collectUsedComponents(panels: PanelNode[]): Set<string> {
  const usedComponents = new Set<string>();
  
  function traverse(panel: PanelNode) {
    if (panel.components) {
      panel.components.forEach(comp => {
        usedComponents.add(comp.type);
      });
    }
    panel.children.forEach(child => traverse(child));
  }
  
  panels.forEach(panel => traverse(panel));
  return usedComponents;
}

function generateImports(usedComponents: Set<string>): string {
  const imports = ["import { Button } from '@/components/ui/button';"];
  
  if (usedComponents.has('textbox')) {
    imports.push("import { Input } from '@/components/ui/input';");
    imports.push("import { Label } from '@/components/ui/label';");
  }
  if (usedComponents.has('label')) {
    imports.push("import { Label } from '@/components/ui/label';");
  }
  if (usedComponents.has('textarea')) {
    imports.push("import { Textarea } from '@/components/ui/textarea';");
    imports.push("import { Label } from '@/components/ui/label';");
  }
  if (usedComponents.has('select')) {
    imports.push("import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';");
    imports.push("import { Label } from '@/components/ui/label';");
  }
  if (usedComponents.has('radio')) {
    imports.push("import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';");
    imports.push("import { Label } from '@/components/ui/label';");
  }
  if (usedComponents.has('checkbox')) {
    imports.push("import { Checkbox } from '@/components/ui/checkbox';");
    imports.push("import { Label } from '@/components/ui/label';");
  }
  if (usedComponents.has('date') || usedComponents.has('calendar') || usedComponents.has('time') || usedComponents.has('datetime')) {
    imports.push("import { Input } from '@/components/ui/input';");
    imports.push("import { Label } from '@/components/ui/label';");
  }
  if (usedComponents.has('table')) {
    imports.push("import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';");
    imports.push("import { Label } from '@/components/ui/label';");
  }
  
  return [...new Set(imports)].join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { panels, fileName } = body;
    
    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }
    
    // Collect used components
    const usedComponents = collectUsedComponents(panels);
    
    // Generate imports
    const imports = generateImports(usedComponents);
    
    // Generate component code
    const panelsCode = panels.map(panel => generatePanelCode(panel, 0)).join('\n\n');
    
    // Create component name from file name
    const componentName = fileName
      .replace(/\.tsx?$/, '')
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    // Generate full component code
    const fullCode = `'use client';

${imports}

export default function ${componentName}() {
  return (
    <div className="p-6 space-y-4">
${panelsCode}
    </div>
  );
}
`;
    
    // Determine output directory
    const outputDir = join(process.cwd(), 'src', 'components', 'generated');
    
    // Create directory if it doesn't exist (recursive will create all parent directories)
    try {
      await mkdir(outputDir, { recursive: true });
    } catch (mkdirError) {
      console.error('Failed to create output directory:', mkdirError);
      return NextResponse.json(
        { error: 'Failed to create output directory', details: mkdirError instanceof Error ? mkdirError.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
    // Write file
    const filePath = join(outputDir, fileName.endsWith('.tsx') ? fileName : `${fileName}.tsx`);
    await writeFile(filePath, fullCode, 'utf-8');
    
    return NextResponse.json({
      success: true,
      message: 'Component generated successfully',
      filePath: filePath,
      componentName: componentName
    });
    
  } catch (error) {
    console.error('Error generating component:', error);
    return NextResponse.json(
      { error: 'Failed to generate component', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
