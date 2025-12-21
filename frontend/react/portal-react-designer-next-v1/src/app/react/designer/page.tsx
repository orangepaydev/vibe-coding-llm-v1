'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Split, Trash2 } from 'lucide-react';

interface PanelNode {
  id: string;
  name: string;
  flexDirection: 'flex-row' | 'flex-col' | '';
  justifyContent: 'justify-start' | 'justify-center' | 'justify-end' | 'justify-between' | 'justify-around' | '';
  alignItems: 'items-start' | 'items-center' | 'items-end' | 'items-stretch' | '';
  backgroundColor: string;
  children: PanelNode[];
}

export default function DesignerPage() {
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [panels, setPanels] = useState<PanelNode[]>([]);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);

  const generateId = () => `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const createNewPanel = (name: string): PanelNode => ({
    id: generateId(),
    name,
    flexDirection: 'flex-row',
    justifyContent: 'justify-start',
    alignItems: 'items-start',
    backgroundColor: 'bg-white',
    children: [],
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

  const DesignPanel = ({ panel }: { panel: PanelNode }) => {
    const isSelected = selectedPanelId === panel.id;
    const hasChildren = panel.children.length > 0;

    const panelClasses = `
      flex ${panel.flexDirection} ${panel.justifyContent} ${panel.alignItems}
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
          setSelectedPanelId(panel.id);
        }}
      >
        {hasChildren ? (
          panel.children.map((child) => (
            <div 
              key={child.id} 
              className={panel.flexDirection === 'flex-col' ? 'w-full flex-1' : 'flex-1 min-w-0'}
            >
              <DesignPanel panel={child} />
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-sm font-medium text-gray-600">{panel.name}</div>
          </div>
        )}
      </div>
    );
  };

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
            <h2 className="text-lg font-semibold mb-4">UI Component Panel</h2>
            <div className="text-sm text-gray-500">Components will appear here</div>
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
                <DesignPanel key={panel.id} panel={panel} />
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
            
            {selectedPanel ? (
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
