import React from 'react';

interface PanelNode {
  id: string;
  name: string;
  layoutType: 'flex' | 'grid' | '';
  flexDirection: 'flex-row' | 'flex-col' | '';
  justifyContent: 'justify-start' | 'justify-center' | 'justify-end' | 'justify-between' | 'justify-around' | '';
  alignItems: 'items-start' | 'items-center' | 'items-end' | 'items-stretch' | '';
  gridCols: 'grid-cols-1' | 'grid-cols-2' | 'grid-cols-3' | 'grid-cols-4' | 'grid-cols-5' | 'grid-cols-6' | 'grid-cols-12' | '';
  colSpan: 'col-span-1' | 'col-span-2' | 'col-span-3' | 'col-span-4' | 'col-span-5' | 'col-span-6' | 'col-span-full' | '';
  colStart: 'col-start-1' | 'col-start-2' | 'col-start-3' | 'col-start-4' | 'col-start-5' | 'col-start-6' | 'col-start-auto' | '';
  rowSpan: 'row-span-1' | 'row-span-2' | 'row-span-3' | 'row-span-4' | 'row-span-5' | 'row-span-6' | 'row-span-full' | '';
  rowStart: 'row-start-1' | 'row-start-2' | 'row-start-3' | 'row-start-4' | 'row-start-5' | 'row-start-6' | 'row-start-auto' | '';
  backgroundColor: string;
  children: PanelNode[];
}

interface DesignPanelProps {
  panel: PanelNode;
  selectedPanelId: string | null;
  onSelectPanel: (panelId: string) => void;
}

export const DesignPanel: React.FC<DesignPanelProps> = ({ 
  panel, 
  selectedPanelId, 
  onSelectPanel 
}) => {
  const isSelected = selectedPanelId === panel.id;
  const hasChildren = panel.children.length > 0;

  const layoutClasses = panel.layoutType === 'grid' 
    ? `grid ${panel.gridCols}`
    : `flex ${panel.flexDirection}`;

  const panelClasses = `
    ${layoutClasses} ${panel.justifyContent} ${panel.alignItems}
    ${panel.colSpan} ${panel.colStart} ${panel.rowSpan} ${panel.rowStart}
    ${panel.backgroundColor}
    ${hasChildren ? 'p-2 gap-2' : 'p-4'}
    ${hasChildren ? 'min-h-[200px]' : 'min-h-[100px]'}
    border-2 rounded-lg transition-all cursor-pointer
    ${isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-300 hover:border-gray-400'}
  `.trim();

  return (
    <div
      className={panelClasses}
      onClick={(e) => {
        e.stopPropagation();
        onSelectPanel(panel.id);
      }}
    >
      {hasChildren ? (
        panel.children.map((child) => (
          <div 
            key={child.id} 
            className={panel.flexDirection === 'flex-col' ? 'w-full flex-1' : 'flex-1 min-w-0'}
          >
            <DesignPanel 
              panel={child} 
              selectedPanelId={selectedPanelId} 
              onSelectPanel={onSelectPanel} 
            />
          </div>
        ))
      ) : (
        <div className="flex flex-col w-full h-full">
          <div className="flex items-center justify-center p-2 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-600">{panel.name}</div>
          </div>
          <div className="flex-1 bg-gray-100 border-2 border-dashed border-gray-300 rounded m-2 flex items-center justify-center min-h-[60px]">
            <div className="text-xs text-gray-400">Drop UI Components Here</div>
          </div>
        </div>
      )}
    </div>
  );
};

export type { PanelNode };
