'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Split, Trash2, Type, AlignLeft, FileText, List, Circle, CheckSquare, Calendar, Clock, CalendarClock, Table } from 'lucide-react';
import { DesignPanel, type PanelNode, type ComponentInstance } from './Design';

export default function DesignerPage() {
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [panels, setPanels] = useState<PanelNode[]>([]);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const generateId = () => `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const createNewPanel = (name: string): PanelNode => ({
    id: generateId(),
    name,
    layoutType: 'flex',
    flexDirection: 'flex-row',
    justifyContent: 'justify-start',
    alignItems: 'items-start',
    gridCols: '',
    colSpan: '',
    colStart: '',
    rowSpan: '',
    rowStart: '',
    backgroundColor: 'bg-white',
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
      properties: {},
    };

    setPanels(
      findAndUpdatePanel(panels, panelId, (panel) => ({
        ...panel,
        components: [...(panel.components || []), newComponent],
      }))
    );
  };

  const uiComponents = [
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
            <button
              onClick={addRootPanel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Panel
            </button>
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
              panels.map((panel) => (
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
