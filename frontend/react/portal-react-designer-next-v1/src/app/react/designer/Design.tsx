import React, { useState } from 'react';

interface ComponentInstance {
  id: string;
  type: string;
  label: string;
  width: string;
  height: string;
  flexGrow: string;
  padding: string;
  margin: string;
  border: string;
  properties: Record<string, any>;
}

interface PanelNode {
  id: string;
  name: string;
  layoutType: 'flex' | 'grid' | '';
  flexDirection: 'flex-row' | 'flex-col' | '';
  flexWrap: 'flex-wrap' | 'flex-wrap-reverse' | 'flex-nowrap' | '';
  justifyContent: 'justify-start' | 'justify-center' | 'justify-end' | 'justify-between' | 'justify-around' | '';
  alignItems: 'items-start' | 'items-center' | 'items-end' | 'items-stretch' | '';
  gridCols: 'grid-cols-1' | 'grid-cols-2' | 'grid-cols-3' | 'grid-cols-4' | 'grid-cols-5' | 'grid-cols-6' | 'grid-cols-12' | '';
  colSpan: 'col-span-1' | 'col-span-2' | 'col-span-3' | 'col-span-4' | 'col-span-5' | 'col-span-6' | 'col-span-full' | '';
  colStart: 'col-start-1' | 'col-start-2' | 'col-start-3' | 'col-start-4' | 'col-start-5' | 'col-start-6' | 'col-start-auto' | '';
  rowSpan: 'row-span-1' | 'row-span-2' | 'row-span-3' | 'row-span-4' | 'row-span-5' | 'row-span-6' | 'row-span-full' | '';
  rowStart: 'row-start-1' | 'row-start-2' | 'row-start-3' | 'row-start-4' | 'row-start-5' | 'row-start-6' | 'row-start-auto' | '';
  backgroundColor: string;
  children: PanelNode[];
  components: ComponentInstance[];
}

interface DesignPanelProps {
  panel: PanelNode;
  selectedPanelId: string | null;
  selectedComponentId: string | null;
  onSelectPanel: (panelId: string) => void;
  onSelectComponent: (componentId: string) => void;
  onDropComponent: (panelId: string, componentType: string) => void;
  onReorderComponents: (panelId: string, dragIndex: number, dropIndex: number) => void;
  onReorderPanels: (parentId: string | null, dragIndex: number, dropIndex: number) => void;
  parentId?: string | null;
  indexInParent?: number;
}

export const DesignPanel: React.FC<DesignPanelProps> = ({ 
  panel, 
  selectedPanelId,
  selectedComponentId,
  onSelectPanel,
  onSelectComponent,
  onDropComponent,
  onReorderComponents,
  onReorderPanels,
  parentId = null,
  indexInParent = 0
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedComponentIndex, setDraggedComponentIndex] = useState<number | null>(null);
  const [isPanelDragOver, setIsPanelDragOver] = useState(false);
  const isSelected = selectedPanelId === panel.id;
  const hasChildren = panel.children.length > 0;
  const hasComponents = panel.components && panel.components.length > 0;

  const layoutClasses = panel.layoutType === 'grid' 
    ? `grid ${panel.gridCols}`
    : `flex ${panel.flexDirection} ${panel.flexWrap}`;

  const panelClasses = `
    ${layoutClasses} ${panel.justifyContent} ${panel.alignItems}
    ${panel.colSpan} ${panel.colStart} ${panel.rowSpan} ${panel.rowStart}
    ${panel.backgroundColor}
    ${hasChildren ? 'p-2 gap-2' : 'p-4'}
    ${hasChildren ? 'min-h-[200px]' : 'min-h-[100px]'}
    border-2 rounded-lg transition-all cursor-move
    ${isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-300 hover:border-gray-400'}
    ${isPanelDragOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
  `.trim();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const componentType = e.dataTransfer.getData('componentType');
    if (componentType) {
      onDropComponent(panel.id, componentType);
    }
  };

  const handleComponentDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedComponentIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('componentIndex', index.toString());
  };

  const handleComponentDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedComponentIndex !== null && draggedComponentIndex !== index) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleComponentDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dragIndexStr = e.dataTransfer.getData('componentIndex');
    if (dragIndexStr && draggedComponentIndex !== null) {
      const dragIndex = parseInt(dragIndexStr);
      if (dragIndex !== dropIndex) {
        onReorderComponents(panel.id, dragIndex, dropIndex);
      }
    }
    setDraggedComponentIndex(null);
  };

  const handlePanelDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('panelIndex', indexInParent.toString());
    e.dataTransfer.setData('parentId', parentId || 'root');
  };

  const handlePanelDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dragParentId = e.dataTransfer.types.includes('parentid') ? 'exists' : null;
    if (dragParentId) {
      e.dataTransfer.dropEffect = 'move';
      setIsPanelDragOver(true);
    }
  };

  const handlePanelDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPanelDragOver(false);
  };

  const handlePanelDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPanelDragOver(false);
    
    const dragIndexStr = e.dataTransfer.getData('panelIndex');
    const dragParentId = e.dataTransfer.getData('parentId');
    
    if (dragIndexStr && dragParentId) {
      const dragIndex = parseInt(dragIndexStr);
      const currentParentId = parentId || 'root';
      
      // Only reorder if panels are siblings (same parent)
      if (dragParentId === currentParentId && dragIndex !== indexInParent) {
        onReorderPanels(parentId, dragIndex, indexInParent);
      }
    }
  };

  const renderComponent = (component: ComponentInstance, index: number) => {
    const isSelected = selectedComponentId === component.id;
    const isDragging = draggedComponentIndex === index;
    const handleComponentClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectComponent(component.id);
    };

    const wrapperClasses = `transition-all cursor-move rounded ${component.width} ${component.height} ${component.flexGrow} ${component.padding} ${component.margin} ${component.border} ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'} ${isDragging ? 'opacity-50' : ''}`;

    switch (component.type) {
      case 'button':
        return (
          <div 
            key={component.id} 
            className={`p-2 ${wrapperClasses}`} 
            onClick={handleComponentClick}
            draggable
            onDragStart={(e) => handleComponentDragStart(e, index)}
            onDragOver={(e) => handleComponentDragOver(e, index)}
            onDrop={(e) => handleComponentDrop(e, index)}
          >
            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
              {component.label}
            </button>
          </div>
        );
      case 'textbox':
        return (
          <div 
            key={component.id} 
            className={`flex flex-col gap-1 p-2 ${wrapperClasses}`} 
            onClick={handleComponentClick}
            draggable
            onDragStart={(e) => handleComponentDragStart(e, index)}
            onDragOver={(e) => handleComponentDragOver(e, index)}
            onDrop={(e) => handleComponentDrop(e, index)}
          >
            <label className="text-xs font-medium text-gray-700">{component.label}</label>
            <input 
              type={component.properties.inputType || 'text'} 
              placeholder="Enter text" 
              className="px-2 py-1 border border-gray-300 rounded text-sm" 
            />
          </div>
        );
      case 'label':
        return (
          <div 
            key={component.id} 
            className={`p-2 ${wrapperClasses}`} 
            onClick={handleComponentClick}
            draggable
            onDragStart={(e) => handleComponentDragStart(e, index)}
            onDragOver={(e) => handleComponentDragOver(e, index)}
            onDrop={(e) => handleComponentDrop(e, index)}
          >
            <label className="text-sm font-medium text-gray-700">{component.label}</label>
          </div>
        );
      case 'textarea':
        return (
          <div 
            key={component.id} 
            className={`flex flex-col gap-1 p-2 ${wrapperClasses}`} 
            onClick={handleComponentClick}
            draggable
            onDragStart={(e) => handleComponentDragStart(e, index)}
            onDragOver={(e) => handleComponentDragOver(e, index)}
            onDrop={(e) => handleComponentDrop(e, index)}
          >
            <label className="text-xs font-medium text-gray-700">{component.label}</label>
            <textarea 
              placeholder="Enter text" 
              rows={component.properties.rows || 3} 
              cols={component.properties.cols || 50}
              className="px-2 py-1 border border-gray-300 rounded text-sm resize-none" 
            />
          </div>
        );
      case 'select':
        return (
          <div 
            key={component.id} 
            className={`flex flex-col gap-1 p-2 ${wrapperClasses}`} 
            onClick={handleComponentClick}
            draggable
            onDragStart={(e) => handleComponentDragStart(e, index)}
            onDragOver={(e) => handleComponentDragOver(e, index)}
            onDrop={(e) => handleComponentDrop(e, index)}
          >
            <label className="text-xs font-medium text-gray-700">{component.label}</label>
            <select className="px-2 py-1 border border-gray-300 rounded text-sm">
              {(component.properties.options || ['Option 1', 'Option 2', 'Option 3']).map((opt: string, idx: number) => (
                <option key={idx}>{opt}</option>
              ))}
            </select>
          </div>
        );
      case 'radio':
        return (
          <div 
            key={component.id} 
            className={`flex flex-col gap-1 p-2 ${wrapperClasses}`} 
            onClick={handleComponentClick}
            draggable
            onDragStart={(e) => handleComponentDragStart(e, index)}
            onDragOver={(e) => handleComponentDragOver(e, index)}
            onDrop={(e) => handleComponentDrop(e, index)}
          >
            <label className="text-xs font-medium text-gray-700 mb-1">{component.label}</label>
            {(component.properties.options || ['Option 1', 'Option 2', 'Option 3']).map((opt: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="radio" name={component.id} className="w-4 h-4" />
                <label className="text-sm text-gray-700">{opt}</label>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div 
            key={component.id} 
            className={`flex flex-col gap-1 p-2 ${wrapperClasses}`} 
            onClick={handleComponentClick}
            draggable
            onDragStart={(e) => handleComponentDragStart(e, index)}
            onDragOver={(e) => handleComponentDragOver(e, index)}
            onDrop={(e) => handleComponentDrop(e, index)}
          >
            <label className="text-xs font-medium text-gray-700 mb-1">{component.label}</label>
            {(component.properties.options || ['Option 1', 'Option 2', 'Option 3']).map((opt: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 border-gray-300 rounded" />
                <label className="text-sm text-gray-700">{opt}</label>
              </div>
            ))}
          </div>
        );
      case 'calendar':
        return (
          <div 
            key={component.id} 
            className={`flex flex-col gap-1 p-2 ${wrapperClasses}`} 
            onClick={handleComponentClick}
            draggable
            onDragStart={(e) => handleComponentDragStart(e, index)}
            onDragOver={(e) => handleComponentDragOver(e, index)}
            onDrop={(e) => handleComponentDrop(e, index)}
          >
            <label className="text-xs font-medium text-gray-700">{component.label}</label>
            <input type="date" className="px-2 py-1 border border-gray-300 rounded text-sm" />
          </div>
        );
      case 'date':
        return (
          <div 
            key={component.id} 
            className={`flex flex-col gap-1 p-2 ${wrapperClasses}`} 
            onClick={handleComponentClick}
            draggable
            onDragStart={(e) => handleComponentDragStart(e, index)}
            onDragOver={(e) => handleComponentDragOver(e, index)}
            onDrop={(e) => handleComponentDrop(e, index)}
          >
            <label className="text-xs font-medium text-gray-700">{component.label}</label>
            <input type="date" className="px-2 py-1 border border-gray-300 rounded text-sm" />
          </div>
        );
      case 'time':
        return (
          <div 
            key={component.id} 
            className={`flex flex-col gap-1 p-2 ${wrapperClasses}`} 
            onClick={handleComponentClick}
            draggable
            onDragStart={(e) => handleComponentDragStart(e, index)}
            onDragOver={(e) => handleComponentDragOver(e, index)}
            onDrop={(e) => handleComponentDrop(e, index)}
          >
            <label className="text-xs font-medium text-gray-700">{component.label}</label>
            <input type="time" className="px-2 py-1 border border-gray-300 rounded text-sm" />
          </div>
        );
      case 'datetime':
        return (
          <div 
            key={component.id} 
            className={`flex flex-col gap-1 p-2 ${wrapperClasses}`} 
            onClick={handleComponentClick}
            draggable
            onDragStart={(e) => handleComponentDragStart(e, index)}
            onDragOver={(e) => handleComponentDragOver(e, index)}
            onDrop={(e) => handleComponentDrop(e, index)}
          >
            <label className="text-xs font-medium text-gray-700">{component.label}</label>
            <input type="datetime-local" className="px-2 py-1 border border-gray-300 rounded text-sm" />
          </div>
        );
      case 'table':
        return (
          <div 
            key={component.id} 
            className={`p-2 ${wrapperClasses}`} 
            onClick={handleComponentClick}
            draggable
            onDragStart={(e) => handleComponentDragStart(e, index)}
            onDragOver={(e) => handleComponentDragOver(e, index)}
            onDrop={(e) => handleComponentDrop(e, index)}
          >
            <label className="text-xs font-medium text-gray-700 mb-2 block">{component.label}</label>
            <table className="w-full border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-50">
                  {(component.properties.columns || ['Column 1', 'Column 2', 'Column 3']).map((col: string, idx: number) => (
                    <th key={idx} className="border border-gray-300 px-2 py-1">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {(component.properties.columns || ['Column 1', 'Column 2', 'Column 3']).map((col: string, idx: number) => (
                    <td key={idx} className="border border-gray-300 px-2 py-1">Data {idx + 1}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={panelClasses}
      onClick={(e) => {
        e.stopPropagation();
        onSelectPanel(panel.id);
      }}
      draggable={parentId !== undefined}
      onDragStart={handlePanelDragStart}
      onDragOver={handlePanelDragOver}
      onDragLeave={handlePanelDragLeave}
      onDrop={handlePanelDrop}
    >
      {hasChildren ? (
        panel.children.map((child, index) => (
          <div 
            key={child.id} 
            className={panel.flexDirection === 'flex-col' ? 'w-full flex-1' : 'flex-1 min-w-0'}
          >
            <DesignPanel 
              panel={child} 
              selectedPanelId={selectedPanelId}
              selectedComponentId={selectedComponentId}
              onSelectPanel={onSelectPanel}
              onSelectComponent={onSelectComponent}
              onDropComponent={onDropComponent}
              onReorderComponents={onReorderComponents}
              onReorderPanels={onReorderPanels}
              parentId={panel.id}
              indexInParent={index}
            />
          </div>
        ))
      ) : (
        <div className="flex flex-col w-full h-full">
          <div className="flex items-center justify-center p-2 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-600">{panel.name}</div>
          </div>
          <div 
            className={`flex-1 border-2 border-dashed rounded m-2 flex flex-col items-center justify-center min-h-[60px] transition-colors ${
              isDragOver ? 'bg-blue-100 border-blue-400' : 'bg-gray-100 border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {hasComponents ? (
              /* Designer Panel render component */
              <div className="w-full h-full p-2 space-y-2 overflow-auto mt-4 mb-4">
                {panel.components.map((component, index) => renderComponent(component, index))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 mt-4 mb-4">Drop UI Components Here</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export type { PanelNode, ComponentInstance };
