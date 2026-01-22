'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Split, Trash2, Type, AlignLeft, FileText, List, Circle, CheckSquare, Calendar, Clock, CalendarClock, Table, SquareMousePointer, Save, Download } from 'lucide-react';
import { DesignPanel, type PanelNode, type ComponentInstance } from './Design';

export default function DesignerPage() {
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [panels, setPanels] = useState<PanelNode[]>([]);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [componentUrl, setComponentUrl] = useState<string>('');

  const generateId = () => `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const createNewPanel = (name: string): PanelNode => ({
    id: generateId(),
    name,
    layoutType: 'flex',
    flexDirection: 'flex-row',
    flexWrap: '',
    justifyContent: 'justify-start',
    alignItems: 'items-start',
    gridCols: '',
    colSpan: '',
    colStart: '',
    rowSpan: '',
    rowStart: '',
    backgroundColor: 'bg-white',
    padding: '',
    margin: '',
    border: '',
    children: [],
    components: [],
  });

  const addRootPanel = () => {
    const name = prompt('Enter panel name:');
    if (name) {
      const newPanel = createNewPanel(name);
      setPanels([...panels, newPanel]);
    }
  };

  const handleSave = async () => {
    if (!componentUrl.trim()) {
      alert('Please enter a file name');
      return;
    }

    if (panels.length === 0) {
      alert('Please add at least one panel before saving');
      return;
    }

    try {
      const response = await fetch('/api/design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          panels: panels,
          fileName: componentUrl.trim(),
          action: 'save',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Design saved successfully!\n\nFile: ${data.filePath}`);
      } else {
        alert(`Error: ${data.error}\n${data.details || ''}`);
      }
    } catch (error) {
      console.error('Failed to save design:', error);
      alert('Failed to save design. Check console for details.');
    }
  };

  const handleLoad = async () => {
    if (!componentUrl.trim()) {
      alert('Please enter a file name to load');
      return;
    }

    try {
      const response = await fetch('/api/design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: componentUrl.trim(),
          action: 'load',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPanels(data.data.panels);
        setSelectedPanelId(null);
        setSelectedComponentId(null);
        alert(`Design loaded successfully!\n\nFile: ${data.data.fileName}`);
      } else {
        alert(`Error: ${data.error}\n${data.details || ''}`);
      }
    } catch (error) {
      console.error('Failed to load design:', error);
      alert('Failed to load design. Check console for details.');
    }
  };

  const handleGenerate = async () => {
    if (!componentUrl.trim()) {
      alert('Please enter a file name for the component');
      return;
    }

    if (panels.length === 0) {
      alert('Please add at least one panel before generating');
      return;
    }

    try {
      // First save the design (silently)
      const saveResponse = await fetch('/api/design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          panels: panels,
          fileName: componentUrl.trim(),
          action: 'save',
        }),
      });
      
      if (!saveResponse.ok) {
        console.warn('Design save failed, but continuing with generation');
      }
      
      // Then generate the component
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          panels: panels,
          fileName: componentUrl.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Component generated and design saved successfully!\n\nComponent File: ${data.filePath}\nComponent: ${data.componentName}`);
      } else {
        alert(`Error: ${data.error}\n${data.details || ''}`);
      }
    } catch (error) {
      console.error('Failed to generate component:', error);
      alert('Failed to generate component. Check console for details.');
    }
  };

  const findAndUpdatePanel = (
    nodes: PanelNode[],
    panelId: string,
    updater: (panel: PanelNode) => PanelNode
  ): PanelNode[] => {
    return nodes.map((node) => {
      if (node.id === panelId) {
        return updater(node);
      }
      if (node.children.length > 0) {
        return {
          ...node,
          children: findAndUpdatePanel(node.children, panelId, updater),
        };
      }
      return node;
    });
  };

  const findAndDeletePanel = (nodes: PanelNode[], panelId: string): PanelNode[] => {
    return nodes
      .filter((node) => node.id !== panelId)
      .map((node) => ({
        ...node,
        children: findAndDeletePanel(node.children, panelId),
      }));
  };

  const addChildPanel = (parentId: string) => {
    const name = prompt('Enter panel name:');
    if (name) {
      const newPanel = createNewPanel(name);
      setPanels(
        findAndUpdatePanel(panels, parentId, (panel) => ({
          ...panel,
          children: [...panel.children, newPanel],
        }))
      );
    }
  };

  const splitPanel = (panelId: string, direction: 'horizontal' | 'vertical') => {
    const name1 = prompt('Enter name for first panel:');
    if (!name1) return;
    const name2 = prompt('Enter name for second panel:');
    if (!name2) return;

    const newPanel1 = createNewPanel(name1);
    const newPanel2 = createNewPanel(name2);

    setPanels(
      findAndUpdatePanel(panels, panelId, (panel) => ({
        ...panel,
        flexDirection: direction === 'horizontal' ? 'flex-row' : 'flex-col',
        children: [newPanel1, newPanel2],
      }))
    );
  };

  const deletePanel = (panelId: string) => {
    if (confirm('Are you sure you want to delete this panel?')) {
      setPanels(findAndDeletePanel(panels, panelId));
      if (selectedPanelId === panelId) {
        setSelectedPanelId(null);
      }
    }
  };

  const updatePanelProperty = (panelId: string, property: keyof PanelNode, value: any) => {
    setPanels(
      findAndUpdatePanel(panels, panelId, (panel) => ({
        ...panel,
        [property]: value,
      }))
    );
  };

  const findPanelById = (nodes: PanelNode[], panelId: string): PanelNode | null => {
    for (const node of nodes) {
      if (node.id === panelId) return node;
      if (node.children.length > 0) {
        const found = findPanelById(node.children, panelId);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedPanel = selectedPanelId ? findPanelById(panels, selectedPanelId) : null;

  const findComponentById = (nodes: PanelNode[], componentId: string): ComponentInstance | null => {
    for (const node of nodes) {
      if (node.components) {
        const component = node.components.find(c => c.id === componentId);
        if (component) return component;
      }
      if (node.children.length > 0) {
        const found = findComponentById(node.children, componentId);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedComponent = selectedComponentId ? findComponentById(panels, selectedComponentId) : null;

  const handleSelectComponent = (componentId: string) => {
    setSelectedComponentId(componentId);
    setSelectedPanelId(null);
  };

  const handleDropComponent = (panelId: string, componentType: string) => {
    const newComponent: ComponentInstance = {
      id: generateId(),
      type: componentType,
      label: componentType.charAt(0).toUpperCase() + componentType.slice(1),
      width: '',
      height: '',
      flexGrow: '',
      padding: '',
      margin: '',
      border: '',
      properties: {
        // TextArea specific
        ...(componentType === 'textarea' && { rows: 3, cols: 50 }),
        // Textbox specific
        ...(componentType === 'textbox' && { inputType: 'text' }),
        // Select, Radio, Checkbox specific
        ...(['select', 'radio', 'checkbox'].includes(componentType) && { 
          options: ['Option 1', 'Option 2', 'Option 3'] 
        }),
        // Table specific
        ...(componentType === 'table' && { 
          columns: ['Column 1', 'Column 2', 'Column 3'] 
        }),
      },
    };

    setPanels(
      findAndUpdatePanel(panels, panelId, (panel) => ({
        ...panel,
        components: [...(panel.components || []), newComponent],
      }))
    );
  };

  const handleReorderComponents = (panelId: string, dragIndex: number, dropIndex: number) => {
    setPanels(
      findAndUpdatePanel(panels, panelId, (panel) => {
        const newComponents = [...panel.components];
        const [draggedComponent] = newComponents.splice(dragIndex, 1);
        newComponents.splice(dropIndex, 0, draggedComponent);
        return {
          ...panel,
          components: newComponents,
        };
      })
    );
  };

  const handleReorderPanels = (parentId: string | null, dragIndex: number, dropIndex: number) => {
    if (parentId === null || parentId === 'root') {
      // Reordering root level panels
      const newPanels = [...panels];
      const [draggedPanel] = newPanels.splice(dragIndex, 1);
      newPanels.splice(dropIndex, 0, draggedPanel);
      setPanels(newPanels);
    } else {
      // Reordering child panels within a parent
      setPanels(
        findAndUpdatePanel(panels, parentId, (panel) => {
          const newChildren = [...panel.children];
          const [draggedPanel] = newChildren.splice(dragIndex, 1);
          newChildren.splice(dropIndex, 0, draggedPanel);
          return {
            ...panel,
            children: newChildren,
          };
        })
      );
    }
  };

  const updateComponentProperty = (componentId: string, property: string, value: any) => {
    const updateComponent = (nodes: PanelNode[]): PanelNode[] => {
      return nodes.map(node => ({
        ...node,
        components: node.components?.map(c => 
          c.id === componentId ? { ...c, properties: { ...c.properties, [property]: value } } : c
        ),
        children: updateComponent(node.children)
      }));
    };
    setPanels(updateComponent(panels));
  };

  const updateComponentStyle = (componentId: string, styleProperty: 'width' | 'height' | 'flexGrow', value: string) => {
    const updateComponent = (nodes: PanelNode[]): PanelNode[] => {
      return nodes.map(node => ({
        ...node,
        components: node.components?.map(c => 
          c.id === componentId ? { ...c, [styleProperty]: value } : c
        ),
        children: updateComponent(node.children)
      }));
    };
    setPanels(updateComponent(panels));
  };

  const findParentPanelOfComponent = (nodes: PanelNode[], componentId: string): PanelNode | null => {
    for (const node of nodes) {
      if (node.components?.some(c => c.id === componentId)) {
        return node;
      }
      if (node.children.length > 0) {
        const found = findParentPanelOfComponent(node.children, componentId);
        if (found) return found;
      }
    }
    return null;
  };

  const parentPanel = selectedComponentId ? findParentPanelOfComponent(panels, selectedComponentId) : null;

  const uiComponents = [
    { type: 'button', label: 'Button', icon: SquareMousePointer },
    { type: 'textbox', label: 'Textbox', icon: Type },
    { type: 'label', label: 'Label', icon: AlignLeft },
    { type: 'textarea', label: 'TextArea', icon: FileText },
    { type: 'select', label: 'Select Dropdown', icon: List },
    { type: 'radio', label: 'Radio Button', icon: Circle },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { type: 'calendar', label: 'Calendar', icon: Calendar },
    { type: 'date', label: 'Date Selector', icon: Calendar },
    { type: 'time', label: 'Time Selector', icon: Clock },
    { type: 'datetime', label: 'Date Time Selector', icon: CalendarClock },
    { type: 'table', label: 'Table', icon: Table },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* UI Component Panel */}
      <div
        className={`relative transition-all duration-300 ease-in-out bg-white border-r border-gray-200 ${
          isLeftPanelCollapsed ? 'w-0' : 'w-[15%]'
        }`}
      >
        <div className={`h-full overflow-auto ${isLeftPanelCollapsed ? 'hidden' : 'block'}`}>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">UI Components</h2>
            <div className="space-y-2">
              {uiComponents.map((component) => {
                const Icon = component.icon;
                return (
                  <div
                    key={component.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('componentType', component.type);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    className="flex items-center gap-2 p-3 bg-white border border-gray-300 rounded-lg cursor-move hover:border-blue-400 hover:shadow-sm transition-all"
                  >
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{component.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Left Panel Toggle Button */}
        <button
          onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors z-10"
          aria-label={isLeftPanelCollapsed ? 'Expand left panel' : 'Collapse left panel'}
        >
          {isLeftPanelCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* UI Design Panel */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out bg-gray-50 overflow-auto ${
          isLeftPanelCollapsed && isRightPanelCollapsed
            ? 'w-full'
            : isLeftPanelCollapsed || isRightPanelCollapsed
            ? 'w-[85%]'
            : 'w-[70%]'
        }`}
      >
        <div className="p-6 h-full">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">UI Design Canvas</h1>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={componentUrl}
                onChange={(e) => setComponentUrl(e.target.value)}
                placeholder="Enter file name (e.g., my-form.tsx)"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Save className="w-5 h-5" />
                Save
              </button>
              <button
                onClick={handleLoad}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Load
              </button>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Generate
              </button>
              <button
                onClick={addRootPanel}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Panel
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            {panels.length === 0 ? (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">No panels yet</p>
                  <button
                    onClick={addRootPanel}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Create Your First Panel
                  </button>
                </div>
              </div>
            ) : (
              panels.map((panel, index) => (
                <DesignPanel 
                  key={panel.id} 
                  panel={panel} 
                  selectedPanelId={selectedPanelId}
                  selectedComponentId={selectedComponentId}
                  onSelectPanel={(panelId) => {
                    setSelectedPanelId(panelId);
                    setSelectedComponentId(null);
                  }}
                  onSelectComponent={handleSelectComponent}
                  onDropComponent={handleDropComponent}
                  onReorderComponents={handleReorderComponents}
                  onReorderPanels={handleReorderPanels}
                  parentId={null}
                  indexInParent={index}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* UI Property Panel */}
      <div
        className={`relative transition-all duration-300 ease-in-out bg-white border-l border-gray-200 ${
          isRightPanelCollapsed ? 'w-0' : 'w-[15%]'
        }`}
      >
        <div className={`h-full overflow-auto ${isRightPanelCollapsed ? 'hidden' : 'block'}`}>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Properties</h2>
            
            {selectedComponent ? (
              <div className="space-y-4">
                <div className="text-sm font-medium text-blue-600 mb-2">Component Selected</div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Component Type
                  </label>
                  <input
                    type="text"
                    value={selectedComponent.type}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={selectedComponent.label}
                    onChange={(e) => {
                      // Update component label
                      const updateComponentLabel = (nodes: PanelNode[]): PanelNode[] => {
                        return nodes.map(node => ({
                          ...node,
                          components: node.components?.map(c => 
                            c.id === selectedComponentId ? { ...c, label: e.target.value } : c
                          ),
                          children: updateComponentLabel(node.children)
                        }));
                      };
                      setPanels(updateComponentLabel(panels));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                {/* Flex Grow */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flex Grow
                  </label>
                  <select
                    value={selectedComponent.flexGrow || ''}
                    onChange={(e) => updateComponentStyle(selectedComponentId!, 'flexGrow', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">None</option>
                    <option value="flex-grow-0">flex-grow-0</option>
                    <option value="flex-grow">flex-grow</option>
                    <option value="flex-1">flex-1</option>
                  </select>
                </div>

                {/* Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width
                  </label>
                  <select
                    value={selectedComponent.width || ''}
                    onChange={(e) => updateComponentStyle(selectedComponentId!, 'width', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Auto</option>
                    <optgroup label="Percentage">
                      <option value="w-1/12">w-1/12 (8.33%)</option>
                      <option value="w-1/6">w-1/6 (16.67%)</option>
                      <option value="w-1/4">w-1/4 (25%)</option>
                      <option value="w-1/3">w-1/3 (33.33%)</option>
                      <option value="w-5/12">w-5/12 (41.67%)</option>
                      <option value="w-1/2">w-1/2 (50%)</option>
                      <option value="w-7/12">w-7/12 (58.33%)</option>
                      <option value="w-2/3">w-2/3 (66.67%)</option>
                      <option value="w-3/4">w-3/4 (75%)</option>
                      <option value="w-5/6">w-5/6 (83.33%)</option>
                      <option value="w-11/12">w-11/12 (91.67%)</option>
                      <option value="w-full">w-full (100%)</option>
                    </optgroup>
                    <optgroup label="Fixed">
                      <option value="w-32">w-32 (8rem)</option>
                      <option value="w-40">w-40 (10rem)</option>
                      <option value="w-48">w-48 (12rem)</option>
                      <option value="w-56">w-56 (14rem)</option>
                      <option value="w-64">w-64 (16rem)</option>
                      <option value="w-72">w-72 (18rem)</option>
                      <option value="w-80">w-80 (20rem)</option>
                      <option value="w-96">w-96 (24rem)</option>
                    </optgroup>
                  </select>
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height
                  </label>
                  <select
                    value={selectedComponent.height || ''}
                    onChange={(e) => updateComponentStyle(selectedComponentId!, 'height', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Auto</option>
                    <optgroup label="Percentage">
                      <option value="h-1/12">h-1/12 (8.33%)</option>
                      <option value="h-1/6">h-1/6 (16.67%)</option>
                      <option value="h-1/4">h-1/4 (25%)</option>
                      <option value="h-1/3">h-1/3 (33.33%)</option>
                      <option value="h-5/12">h-5/12 (41.67%)</option>
                      <option value="h-1/2">h-1/2 (50%)</option>
                      <option value="h-7/12">h-7/12 (58.33%)</option>
                      <option value="h-2/3">h-2/3 (66.67%)</option>
                      <option value="h-3/4">h-3/4 (75%)</option>
                      <option value="h-5/6">h-5/6 (83.33%)</option>
                      <option value="h-11/12">h-11/12 (91.67%)</option>
                      <option value="h-full">h-full (100%)</option>
                    </optgroup>
                    <optgroup label="Fixed">
                      <option value="h-32">h-32 (8rem)</option>
                      <option value="h-40">h-40 (10rem)</option>
                      <option value="h-48">h-48 (12rem)</option>
                      <option value="h-56">h-56 (14rem)</option>
                      <option value="h-64">h-64 (16rem)</option>
                      <option value="h-72">h-72 (18rem)</option>
                      <option value="h-80">h-80 (20rem)</option>
                      <option value="h-96">h-96 (24rem)</option>
                    </optgroup>
                  </select>
                </div>

                {/* Padding */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Padding
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const currentClasses = selectedComponent.padding || '';
                        const newClasses = currentClasses ? `${currentClasses} ${e.target.value}` : e.target.value;
                        updateComponentStyle(selectedComponentId!, 'padding', newClasses);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                  >
                    <option value="">Select to add...</option>
                    <optgroup label="All Sides">
                      <option value="p-0">p-0 (0)</option>
                      <option value="p-1">p-1 (0.25rem)</option>
                      <option value="p-2">p-2 (0.5rem)</option>
                      <option value="p-3">p-3 (0.75rem)</option>
                      <option value="p-4">p-4 (1rem)</option>
                      <option value="p-5">p-5 (1.25rem)</option>
                      <option value="p-6">p-6 (1.5rem)</option>
                      <option value="p-8">p-8 (2rem)</option>
                      <option value="p-10">p-10 (2.5rem)</option>
                      <option value="p-12">p-12 (3rem)</option>
                    </optgroup>
                    <optgroup label="Horizontal (Left & Right)">
                      <option value="px-1">px-1 (0.25rem)</option>
                      <option value="px-2">px-2 (0.5rem)</option>
                      <option value="px-3">px-3 (0.75rem)</option>
                      <option value="px-4">px-4 (1rem)</option>
                      <option value="px-6">px-6 (1.5rem)</option>
                      <option value="px-8">px-8 (2rem)</option>
                    </optgroup>
                    <optgroup label="Vertical (Top & Bottom)">
                      <option value="py-1">py-1 (0.25rem)</option>
                      <option value="py-2">py-2 (0.5rem)</option>
                      <option value="py-3">py-3 (0.75rem)</option>
                      <option value="py-4">py-4 (1rem)</option>
                      <option value="py-6">py-6 (1.5rem)</option>
                      <option value="py-8">py-8 (2rem)</option>
                    </optgroup>
                    <optgroup label="Top">
                      <option value="pt-1">pt-1 (0.25rem)</option>
                      <option value="pt-2">pt-2 (0.5rem)</option>
                      <option value="pt-3">pt-3 (0.75rem)</option>
                      <option value="pt-4">pt-4 (1rem)</option>
                      <option value="pt-6">pt-6 (1.5rem)</option>
                      <option value="pt-8">pt-8 (2rem)</option>
                    </optgroup>
                    <optgroup label="Right">
                      <option value="pr-1">pr-1 (0.25rem)</option>
                      <option value="pr-2">pr-2 (0.5rem)</option>
                      <option value="pr-3">pr-3 (0.75rem)</option>
                      <option value="pr-4">pr-4 (1rem)</option>
                      <option value="pr-6">pr-6 (1.5rem)</option>
                      <option value="pr-8">pr-8 (2rem)</option>
                    </optgroup>
                    <optgroup label="Bottom">
                      <option value="pb-1">pb-1 (0.25rem)</option>
                      <option value="pb-2">pb-2 (0.5rem)</option>
                      <option value="pb-3">pb-3 (0.75rem)</option>
                      <option value="pb-4">pb-4 (1rem)</option>
                      <option value="pb-6">pb-6 (1.5rem)</option>
                      <option value="pb-8">pb-8 (2rem)</option>
                    </optgroup>
                    <optgroup label="Left">
                      <option value="pl-1">pl-1 (0.25rem)</option>
                      <option value="pl-2">pl-2 (0.5rem)</option>
                      <option value="pl-3">pl-3 (0.75rem)</option>
                      <option value="pl-4">pl-4 (1rem)</option>
                      <option value="pl-6">pl-6 (1.5rem)</option>
                      <option value="pl-8">pl-8 (2rem)</option>
                    </optgroup>
                  </select>
                  <input
                    type="text"
                    value={selectedComponent.padding || ''}
                    onChange={(e) => updateComponentStyle(selectedComponentId!, 'padding', e.target.value)}
                    placeholder="e.g., p-4 pt-6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                  />
                </div>

                {/* Margin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Margin
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const currentClasses = selectedComponent.margin || '';
                        const newClasses = currentClasses ? `${currentClasses} ${e.target.value}` : e.target.value;
                        updateComponentStyle(selectedComponentId!, 'margin', newClasses);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                  >
                    <option value="">Select to add...</option>
                    <optgroup label="All Sides">
                      <option value="m-0">m-0 (0)</option>
                      <option value="m-1">m-1 (0.25rem)</option>
                      <option value="m-2">m-2 (0.5rem)</option>
                      <option value="m-3">m-3 (0.75rem)</option>
                      <option value="m-4">m-4 (1rem)</option>
                      <option value="m-5">m-5 (1.25rem)</option>
                      <option value="m-6">m-6 (1.5rem)</option>
                      <option value="m-8">m-8 (2rem)</option>
                      <option value="m-10">m-10 (2.5rem)</option>
                      <option value="m-12">m-12 (3rem)</option>
                      <option value="m-auto">m-auto</option>
                    </optgroup>
                    <optgroup label="Horizontal (Left & Right)">
                      <option value="mx-1">mx-1 (0.25rem)</option>
                      <option value="mx-2">mx-2 (0.5rem)</option>
                      <option value="mx-3">mx-3 (0.75rem)</option>
                      <option value="mx-4">mx-4 (1rem)</option>
                      <option value="mx-6">mx-6 (1.5rem)</option>
                      <option value="mx-8">mx-8 (2rem)</option>
                      <option value="mx-auto">mx-auto</option>
                    </optgroup>
                    <optgroup label="Vertical (Top & Bottom)">
                      <option value="my-1">my-1 (0.25rem)</option>
                      <option value="my-2">my-2 (0.5rem)</option>
                      <option value="my-3">my-3 (0.75rem)</option>
                      <option value="my-4">my-4 (1rem)</option>
                      <option value="my-6">my-6 (1.5rem)</option>
                      <option value="my-8">my-8 (2rem)</option>
                      <option value="my-auto">my-auto</option>
                    </optgroup>
                    <optgroup label="Top">
                      <option value="mt-1">mt-1 (0.25rem)</option>
                      <option value="mt-2">mt-2 (0.5rem)</option>
                      <option value="mt-3">mt-3 (0.75rem)</option>
                      <option value="mt-4">mt-4 (1rem)</option>
                      <option value="mt-6">mt-6 (1.5rem)</option>
                      <option value="mt-8">mt-8 (2rem)</option>
                      <option value="mt-auto">mt-auto</option>
                    </optgroup>
                    <optgroup label="Right">
                      <option value="mr-1">mr-1 (0.25rem)</option>
                      <option value="mr-2">mr-2 (0.5rem)</option>
                      <option value="mr-3">mr-3 (0.75rem)</option>
                      <option value="mr-4">mr-4 (1rem)</option>
                      <option value="mr-6">mr-6 (1.5rem)</option>
                      <option value="mr-8">mr-8 (2rem)</option>
                      <option value="mr-auto">mr-auto</option>
                    </optgroup>
                    <optgroup label="Bottom">
                      <option value="mb-1">mb-1 (0.25rem)</option>
                      <option value="mb-2">mb-2 (0.5rem)</option>
                      <option value="mb-3">mb-3 (0.75rem)</option>
                      <option value="mb-4">mb-4 (1rem)</option>
                      <option value="mb-6">mb-6 (1.5rem)</option>
                      <option value="mb-8">mb-8 (2rem)</option>
                      <option value="mb-auto">mb-auto</option>
                    </optgroup>
                    <optgroup label="Left">
                      <option value="ml-1">ml-1 (0.25rem)</option>
                      <option value="ml-2">ml-2 (0.5rem)</option>
                      <option value="ml-3">ml-3 (0.75rem)</option>
                      <option value="ml-4">ml-4 (1rem)</option>
                      <option value="ml-6">ml-6 (1.5rem)</option>
                      <option value="ml-8">ml-8 (2rem)</option>
                      <option value="ml-auto">ml-auto</option>
                    </optgroup>
                  </select>
                  <input
                    type="text"
                    value={selectedComponent.margin || ''}
                    onChange={(e) => updateComponentStyle(selectedComponentId!, 'margin', e.target.value)}
                    placeholder="e.g., m-4 mt-6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                  />
                </div>

                {/* Border */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Border
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const currentClasses = selectedComponent.border || '';
                        const newClasses = currentClasses ? `${currentClasses} ${e.target.value}` : e.target.value;
                        updateComponentStyle(selectedComponentId!, 'border', newClasses);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                  >
                    <option value="">Select to add...</option>
                    <optgroup label="All Sides">
                      <option value="border">border (1px)</option>
                      <option value="border-0">border-0 (0)</option>
                      <option value="border-2">border-2 (2px)</option>
                      <option value="border-4">border-4 (4px)</option>
                      <option value="border-8">border-8 (8px)</option>
                    </optgroup>
                    <optgroup label="Top">
                      <option value="border-t">border-t (1px)</option>
                      <option value="border-t-0">border-t-0 (0)</option>
                      <option value="border-t-2">border-t-2 (2px)</option>
                      <option value="border-t-4">border-t-4 (4px)</option>
                      <option value="border-t-8">border-t-8 (8px)</option>
                    </optgroup>
                    <optgroup label="Right">
                      <option value="border-r">border-r (1px)</option>
                      <option value="border-r-0">border-r-0 (0)</option>
                      <option value="border-r-2">border-r-2 (2px)</option>
                      <option value="border-r-4">border-r-4 (4px)</option>
                      <option value="border-r-8">border-r-8 (8px)</option>
                    </optgroup>
                    <optgroup label="Bottom">
                      <option value="border-b">border-b (1px)</option>
                      <option value="border-b-0">border-b-0 (0)</option>
                      <option value="border-b-2">border-b-2 (2px)</option>
                      <option value="border-b-4">border-b-4 (4px)</option>
                      <option value="border-b-8">border-b-8 (8px)</option>
                    </optgroup>
                    <optgroup label="Left">
                      <option value="border-l">border-l (1px)</option>
                      <option value="border-l-0">border-l-0 (0)</option>
                      <option value="border-l-2">border-l-2 (2px)</option>
                      <option value="border-l-4">border-l-4 (4px)</option>
                      <option value="border-l-8">border-l-8 (8px)</option>
                    </optgroup>
                    <optgroup label="Border Color">
                      <option value="border-gray-300">border-gray-300</option>
                      <option value="border-gray-500">border-gray-500</option>
                      <option value="border-blue-500">border-blue-500</option>
                      <option value="border-red-500">border-red-500</option>
                      <option value="border-green-500">border-green-500</option>
                      <option value="border-black">border-black</option>
                    </optgroup>
                    <optgroup label="Border Radius">
                      <option value="rounded">rounded</option>
                      <option value="rounded-sm">rounded-sm</option>
                      <option value="rounded-md">rounded-md</option>
                      <option value="rounded-lg">rounded-lg</option>
                      <option value="rounded-xl">rounded-xl</option>
                      <option value="rounded-full">rounded-full</option>
                    </optgroup>
                  </select>
                  <input
                    type="text"
                    value={selectedComponent.border || ''}
                    onChange={(e) => updateComponentStyle(selectedComponentId!, 'border', e.target.value)}
                    placeholder="e.g., border border-gray-300 rounded"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                  />
                </div>

                {/* TextArea specific properties */}
                {selectedComponent.type === 'textarea' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rows
                      </label>
                      <input
                        type="number"
                        value={selectedComponent.properties.rows || 3}
                        onChange={(e) => updateComponentProperty(selectedComponentId!, 'rows', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Columns
                      </label>
                      <input
                        type="number"
                        value={selectedComponent.properties.cols || 50}
                        onChange={(e) => updateComponentProperty(selectedComponentId!, 'cols', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        min="1"
                      />
                    </div>
                  </>
                )}

                {/* Textbox specific properties */}
                {selectedComponent.type === 'textbox' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Input Type
                    </label>
                    <select
                      value={selectedComponent.properties.inputType || 'text'}
                      onChange={(e) => updateComponentProperty(selectedComponentId!, 'inputType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="password">Password</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="tel">Telephone</option>
                      <option value="url">URL</option>
                      <option value="date">Date</option>
                      <option value="file">File</option>
                      <option value="color">Color</option>
                    </select>
                  </div>
                )}

                {/* Select, Radio, Checkbox options */}
                {['select', 'radio', 'checkbox'].includes(selectedComponent.type) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Options (one per line)
                    </label>
                    <textarea
                      value={(selectedComponent.properties.options || []).join('\n')}
                      onChange={(e) => {
                        const options = e.target.value.split('\n').filter(opt => opt.trim());
                        updateComponentProperty(selectedComponentId!, 'options', options);
                      }}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                      placeholder="Option 1\nOption 2\nOption 3"
                    />
                  </div>
                )}

                {/* Table columns */}
                {selectedComponent.type === 'table' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Column Names (one per line)
                    </label>
                    <textarea
                      value={(selectedComponent.properties.columns || []).join('\n')}
                      onChange={(e) => {
                        const columns = e.target.value.split('\n').filter(col => col.trim());
                        updateComponentProperty(selectedComponentId!, 'columns', columns);
                      }}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                      placeholder="Column 1\nColumn 2\nColumn 3"
                    />
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div><strong>ID:</strong> {selectedComponent.id}</div>
                  </div>
                </div>
              </div>
            ) : selectedPanel ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Panel Name
                  </label>
                  <input
                    type="text"
                    value={selectedPanel.name}
                    onChange={(e) =>
                      updatePanelProperty(selectedPanel.id, 'name', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Panel Actions
                  </label>
                  <button
                    onClick={() => addChildPanel(selectedPanel.id)}
                    className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Panel
              </button>
              <button
                onClick={() => splitPanel(selectedPanel.id, 'horizontal')}
                    className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <Split className="w-4 h-4" />
                    Split Horizontal
                  </button>
                  <button
                    onClick={() => splitPanel(selectedPanel.id, 'vertical')}
                    className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <Split className="w-4 h-4" />
                    Split Vertical
                  </button>
                  <button
                    onClick={() => deletePanel(selectedPanel.id)}
                    className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Panel
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Layout Type
                  </label>
                  <select
                    value={selectedPanel.layoutType}
                    onChange={(e) =>
                      updatePanelProperty(selectedPanel.id, 'layoutType', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">None</option>
                    <option value="flex">Flexbox</option>
                    <option value="grid">Grid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flex Direction
                  </label>
                  <select
                    value={selectedPanel.flexDirection}
                    onChange={(e) =>
                      updatePanelProperty(selectedPanel.id, 'flexDirection', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">None</option>
                    <option value="flex-row">flex-row</option>
                    <option value="flex-col">flex-col</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flex Wrap
                  </label>
                  <select
                    value={selectedPanel.flexWrap}
                    onChange={(e) =>
                      updatePanelProperty(selectedPanel.id, 'flexWrap', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">None</option>
                    <option value="flex-nowrap">flex-nowrap</option>
                    <option value="flex-wrap">flex-wrap</option>
                    <option value="flex-wrap-reverse">flex-wrap-reverse</option>
                  </select>
                </div>

                {selectedPanel.layoutType === 'grid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grid Columns
                    </label>
                    <select
                      value={selectedPanel.gridCols}
                      onChange={(e) =>
                        updatePanelProperty(selectedPanel.id, 'gridCols', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">None</option>
                      <option value="grid-cols-1">1 Column</option>
                      <option value="grid-cols-2">2 Columns</option>
                      <option value="grid-cols-3">3 Columns</option>
                      <option value="grid-cols-4">4 Columns</option>
                      <option value="grid-cols-5">5 Columns</option>
                      <option value="grid-cols-6">6 Columns</option>
                      <option value="grid-cols-12">12 Columns</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Justify Content
                  </label>
                  <select
                    value={selectedPanel.justifyContent}
                    onChange={(e) =>
                      updatePanelProperty(selectedPanel.id, 'justifyContent', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">None</option>
                    <option value="justify-start">justify-start</option>
                    <option value="justify-center">justify-center</option>
                    <option value="justify-end">justify-end</option>
                    <option value="justify-between">justify-between</option>
                    <option value="justify-around">justify-around</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Align Items
                  </label>
                  <select
                    value={selectedPanel.alignItems}
                    onChange={(e) =>
                      updatePanelProperty(selectedPanel.id, 'alignItems', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">None</option>
                    <option value="items-start">items-start</option>
                    <option value="items-center">items-center</option>
                    <option value="items-end">items-end</option>
                    <option value="items-stretch">items-stretch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Column Span
                  </label>
                  <select
                    value={selectedPanel.colSpan}
                    onChange={(e) =>
                      updatePanelProperty(selectedPanel.id, 'colSpan', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">None</option>
                    <option value="col-span-1">col-span-1</option>
                    <option value="col-span-2">col-span-2</option>
                    <option value="col-span-3">col-span-3</option>
                    <option value="col-span-4">col-span-4</option>
                    <option value="col-span-5">col-span-5</option>
                    <option value="col-span-6">col-span-6</option>
                    <option value="col-span-full">col-span-full</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Column Start
                  </label>
                  <select
                    value={selectedPanel.colStart}
                    onChange={(e) =>
                      updatePanelProperty(selectedPanel.id, 'colStart', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">None</option>
                    <option value="col-start-auto">col-start-auto</option>
                    <option value="col-start-1">col-start-1</option>
                    <option value="col-start-2">col-start-2</option>
                    <option value="col-start-3">col-start-3</option>
                    <option value="col-start-4">col-start-4</option>
                    <option value="col-start-5">col-start-5</option>
                    <option value="col-start-6">col-start-6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Row Span
                  </label>
                  <select
                    value={selectedPanel.rowSpan}
                    onChange={(e) =>
                      updatePanelProperty(selectedPanel.id, 'rowSpan', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">None</option>
                    <option value="row-span-1">row-span-1</option>
                    <option value="row-span-2">row-span-2</option>
                    <option value="row-span-3">row-span-3</option>
                    <option value="row-span-4">row-span-4</option>
                    <option value="row-span-5">row-span-5</option>
                    <option value="row-span-6">row-span-6</option>
                    <option value="row-span-full">row-span-full</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Row Start
                  </label>
                  <select
                    value={selectedPanel.rowStart}
                    onChange={(e) =>
                      updatePanelProperty(selectedPanel.id, 'rowStart', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">None</option>
                    <option value="row-start-auto">row-start-auto</option>
                    <option value="row-start-1">row-start-1</option>
                    <option value="row-start-2">row-start-2</option>
                    <option value="row-start-3">row-start-3</option>
                    <option value="row-start-4">row-start-4</option>
                    <option value="row-start-5">row-start-5</option>
                    <option value="row-start-6">row-start-6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <select
                    value={selectedPanel.backgroundColor}
                    onChange={(e) =>
                      updatePanelProperty(selectedPanel.id, 'backgroundColor', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="bg-white">bg-white</option>
                    <option value="bg-gray-50">bg-gray-50</option>
                    <option value="bg-gray-100">bg-gray-100</option>
                    <option value="bg-gray-200">bg-gray-200</option>
                    <option value="bg-blue-50">bg-blue-50</option>
                    <option value="bg-blue-100">bg-blue-100</option>
                    <option value="bg-green-50">bg-green-50</option>
                    <option value="bg-green-100">bg-green-100</option>
                    <option value="bg-yellow-50">bg-yellow-50</option>
                    <option value="bg-yellow-100">bg-yellow-100</option>
                    <option value="bg-red-50">bg-red-50</option>
                    <option value="bg-red-100">bg-red-100</option>
                    <option value="bg-purple-50">bg-purple-50</option>
                    <option value="bg-purple-100">bg-purple-100</option>
                  </select>
                </div>

                {/* Padding */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Padding
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const currentClasses = selectedPanel.padding || '';
                        const newClasses = currentClasses ? `${currentClasses} ${e.target.value}` : e.target.value;
                        updatePanelProperty(selectedPanel.id, 'padding', newClasses);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                  >
                    <option value="">Select to add...</option>
                    <optgroup label="All Sides">
                      <option value="p-0">p-0 (0)</option>
                      <option value="p-1">p-1 (0.25rem)</option>
                      <option value="p-2">p-2 (0.5rem)</option>
                      <option value="p-3">p-3 (0.75rem)</option>
                      <option value="p-4">p-4 (1rem)</option>
                      <option value="p-5">p-5 (1.25rem)</option>
                      <option value="p-6">p-6 (1.5rem)</option>
                      <option value="p-8">p-8 (2rem)</option>
                      <option value="p-10">p-10 (2.5rem)</option>
                      <option value="p-12">p-12 (3rem)</option>
                    </optgroup>
                    <optgroup label="Horizontal (Left & Right)">
                      <option value="px-1">px-1 (0.25rem)</option>
                      <option value="px-2">px-2 (0.5rem)</option>
                      <option value="px-3">px-3 (0.75rem)</option>
                      <option value="px-4">px-4 (1rem)</option>
                      <option value="px-6">px-6 (1.5rem)</option>
                      <option value="px-8">px-8 (2rem)</option>
                    </optgroup>
                    <optgroup label="Vertical (Top & Bottom)">
                      <option value="py-1">py-1 (0.25rem)</option>
                      <option value="py-2">py-2 (0.5rem)</option>
                      <option value="py-3">py-3 (0.75rem)</option>
                      <option value="py-4">py-4 (1rem)</option>
                      <option value="py-6">py-6 (1.5rem)</option>
                      <option value="py-8">py-8 (2rem)</option>
                    </optgroup>
                    <optgroup label="Top">
                      <option value="pt-1">pt-1 (0.25rem)</option>
                      <option value="pt-2">pt-2 (0.5rem)</option>
                      <option value="pt-3">pt-3 (0.75rem)</option>
                      <option value="pt-4">pt-4 (1rem)</option>
                      <option value="pt-6">pt-6 (1.5rem)</option>
                      <option value="pt-8">pt-8 (2rem)</option>
                    </optgroup>
                    <optgroup label="Right">
                      <option value="pr-1">pr-1 (0.25rem)</option>
                      <option value="pr-2">pr-2 (0.5rem)</option>
                      <option value="pr-3">pr-3 (0.75rem)</option>
                      <option value="pr-4">pr-4 (1rem)</option>
                      <option value="pr-6">pr-6 (1.5rem)</option>
                      <option value="pr-8">pr-8 (2rem)</option>
                    </optgroup>
                    <optgroup label="Bottom">
                      <option value="pb-1">pb-1 (0.25rem)</option>
                      <option value="pb-2">pb-2 (0.5rem)</option>
                      <option value="pb-3">pb-3 (0.75rem)</option>
                      <option value="pb-4">pb-4 (1rem)</option>
                      <option value="pb-6">pb-6 (1.5rem)</option>
                      <option value="pb-8">pb-8 (2rem)</option>
                    </optgroup>
                    <optgroup label="Left">
                      <option value="pl-1">pl-1 (0.25rem)</option>
                      <option value="pl-2">pl-2 (0.5rem)</option>
                      <option value="pl-3">pl-3 (0.75rem)</option>
                      <option value="pl-4">pl-4 (1rem)</option>
                      <option value="pl-6">pl-6 (1.5rem)</option>
                      <option value="pl-8">pl-8 (2rem)</option>
                    </optgroup>
                  </select>
                  <input
                    type="text"
                    value={selectedPanel.padding || ''}
                    onChange={(e) => updatePanelProperty(selectedPanel.id, 'padding', e.target.value)}
                    placeholder="e.g., p-4 pt-6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                  />
                </div>

                {/* Margin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Margin
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const currentClasses = selectedPanel.margin || '';
                        const newClasses = currentClasses ? `${currentClasses} ${e.target.value}` : e.target.value;
                        updatePanelProperty(selectedPanel.id, 'margin', newClasses);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                  >
                    <option value="">Select to add...</option>
                    <optgroup label="All Sides">
                      <option value="m-0">m-0 (0)</option>
                      <option value="m-1">m-1 (0.25rem)</option>
                      <option value="m-2">m-2 (0.5rem)</option>
                      <option value="m-3">m-3 (0.75rem)</option>
                      <option value="m-4">m-4 (1rem)</option>
                      <option value="m-5">m-5 (1.25rem)</option>
                      <option value="m-6">m-6 (1.5rem)</option>
                      <option value="m-8">m-8 (2rem)</option>
                      <option value="m-10">m-10 (2.5rem)</option>
                      <option value="m-12">m-12 (3rem)</option>
                      <option value="m-auto">m-auto</option>
                    </optgroup>
                    <optgroup label="Horizontal (Left & Right)">
                      <option value="mx-1">mx-1 (0.25rem)</option>
                      <option value="mx-2">mx-2 (0.5rem)</option>
                      <option value="mx-3">mx-3 (0.75rem)</option>
                      <option value="mx-4">mx-4 (1rem)</option>
                      <option value="mx-6">mx-6 (1.5rem)</option>
                      <option value="mx-8">mx-8 (2rem)</option>
                      <option value="mx-auto">mx-auto</option>
                    </optgroup>
                    <optgroup label="Vertical (Top & Bottom)">
                      <option value="my-1">my-1 (0.25rem)</option>
                      <option value="my-2">my-2 (0.5rem)</option>
                      <option value="my-3">my-3 (0.75rem)</option>
                      <option value="my-4">my-4 (1rem)</option>
                      <option value="my-6">my-6 (1.5rem)</option>
                      <option value="my-8">my-8 (2rem)</option>
                      <option value="my-auto">my-auto</option>
                    </optgroup>
                    <optgroup label="Top">
                      <option value="mt-1">mt-1 (0.25rem)</option>
                      <option value="mt-2">mt-2 (0.5rem)</option>
                      <option value="mt-3">mt-3 (0.75rem)</option>
                      <option value="mt-4">mt-4 (1rem)</option>
                      <option value="mt-6">mt-6 (1.5rem)</option>
                      <option value="mt-8">mt-8 (2rem)</option>
                      <option value="mt-auto">mt-auto</option>
                    </optgroup>
                    <optgroup label="Right">
                      <option value="mr-1">mr-1 (0.25rem)</option>
                      <option value="mr-2">mr-2 (0.5rem)</option>
                      <option value="mr-3">mr-3 (0.75rem)</option>
                      <option value="mr-4">mr-4 (1rem)</option>
                      <option value="mr-6">mr-6 (1.5rem)</option>
                      <option value="mr-8">mr-8 (2rem)</option>
                      <option value="mr-auto">mr-auto</option>
                    </optgroup>
                    <optgroup label="Bottom">
                      <option value="mb-1">mb-1 (0.25rem)</option>
                      <option value="mb-2">mb-2 (0.5rem)</option>
                      <option value="mb-3">mb-3 (0.75rem)</option>
                      <option value="mb-4">mb-4 (1rem)</option>
                      <option value="mb-6">mb-6 (1.5rem)</option>
                      <option value="mb-8">mb-8 (2rem)</option>
                      <option value="mb-auto">mb-auto</option>
                    </optgroup>
                    <optgroup label="Left">
                      <option value="ml-1">ml-1 (0.25rem)</option>
                      <option value="ml-2">ml-2 (0.5rem)</option>
                      <option value="ml-3">ml-3 (0.75rem)</option>
                      <option value="ml-4">ml-4 (1rem)</option>
                      <option value="ml-6">ml-6 (1.5rem)</option>
                      <option value="ml-8">ml-8 (2rem)</option>
                      <option value="ml-auto">ml-auto</option>
                    </optgroup>
                  </select>
                  <input
                    type="text"
                    value={selectedPanel.margin || ''}
                    onChange={(e) => updatePanelProperty(selectedPanel.id, 'margin', e.target.value)}
                    placeholder="e.g., m-4 mt-6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                  />
                </div>

                {/* Border */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Border
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const currentClasses = selectedPanel.border || '';
                        const newClasses = currentClasses ? `${currentClasses} ${e.target.value}` : e.target.value;
                        updatePanelProperty(selectedPanel.id, 'border', newClasses);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                  >
                    <option value="">Select to add...</option>
                    <optgroup label="All Sides">
                      <option value="border">border (1px)</option>
                      <option value="border-0">border-0 (0)</option>
                      <option value="border-2">border-2 (2px)</option>
                      <option value="border-4">border-4 (4px)</option>
                      <option value="border-8">border-8 (8px)</option>
                    </optgroup>
                    <optgroup label="Top">
                      <option value="border-t">border-t (1px)</option>
                      <option value="border-t-0">border-t-0 (0)</option>
                      <option value="border-t-2">border-t-2 (2px)</option>
                      <option value="border-t-4">border-t-4 (4px)</option>
                      <option value="border-t-8">border-t-8 (8px)</option>
                    </optgroup>
                    <optgroup label="Right">
                      <option value="border-r">border-r (1px)</option>
                      <option value="border-r-0">border-r-0 (0)</option>
                      <option value="border-r-2">border-r-2 (2px)</option>
                      <option value="border-r-4">border-r-4 (4px)</option>
                      <option value="border-r-8">border-r-8 (8px)</option>
                    </optgroup>
                    <optgroup label="Bottom">
                      <option value="border-b">border-b (1px)</option>
                      <option value="border-b-0">border-b-0 (0)</option>
                      <option value="border-b-2">border-b-2 (2px)</option>
                      <option value="border-b-4">border-b-4 (4px)</option>
                      <option value="border-b-8">border-b-8 (8px)</option>
                    </optgroup>
                    <optgroup label="Left">
                      <option value="border-l">border-l (1px)</option>
                      <option value="border-l-0">border-l-0 (0)</option>
                      <option value="border-l-2">border-l-2 (2px)</option>
                      <option value="border-l-4">border-l-4 (4px)</option>
                      <option value="border-l-8">border-l-8 (8px)</option>
                    </optgroup>
                    <optgroup label="Border Color">
                      <option value="border-gray-300">border-gray-300</option>
                      <option value="border-gray-400">border-gray-400</option>
                      <option value="border-gray-500">border-gray-500</option>
                      <option value="border-blue-300">border-blue-300</option>
                      <option value="border-blue-500">border-blue-500</option>
                      <option value="border-red-300">border-red-300</option>
                      <option value="border-red-500">border-red-500</option>
                      <option value="border-green-300">border-green-300</option>
                      <option value="border-green-500">border-green-500</option>
                    </optgroup>
                    <optgroup label="Border Style">
                      <option value="border-solid">border-solid</option>
                      <option value="border-dashed">border-dashed</option>
                      <option value="border-dotted">border-dotted</option>
                      <option value="border-double">border-double</option>
                      <option value="border-none">border-none</option>
                    </optgroup>
                    <optgroup label="Rounded Corners">
                      <option value="rounded">rounded (0.25rem)</option>
                      <option value="rounded-none">rounded-none</option>
                      <option value="rounded-sm">rounded-sm</option>
                      <option value="rounded-md">rounded-md</option>
                      <option value="rounded-lg">rounded-lg</option>
                      <option value="rounded-xl">rounded-xl</option>
                      <option value="rounded-2xl">rounded-2xl</option>
                      <option value="rounded-3xl">rounded-3xl</option>
                      <option value="rounded-full">rounded-full</option>
                    </optgroup>
                  </select>
                  <input
                    type="text"
                    value={selectedPanel.border || ''}
                    onChange={(e) => updatePanelProperty(selectedPanel.id, 'border', e.target.value)}
                    placeholder="e.g., border-2 border-gray-300 rounded-lg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div><strong>ID:</strong> {selectedPanel.id}</div>
                    <div><strong>Children:</strong> {selectedPanel.children.length}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Select a panel to view and edit its properties
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel Toggle Button */}
        <button
          onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors z-10"
          aria-label={isRightPanelCollapsed ? 'Expand right panel' : 'Collapse right panel'}
        >
          {isRightPanelCollapsed ? (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
}
