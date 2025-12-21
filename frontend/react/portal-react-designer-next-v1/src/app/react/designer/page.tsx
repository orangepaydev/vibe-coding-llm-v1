'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DesignerPage() {
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

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
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">UI Design Panel</h1>
          <p className="text-gray-600 mb-4">
            Your main design canvas where you compose and arrange UI components. This panel occupies 70% of the screen when both side panels are open.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold mb-2">Workspace Area</h3>
              <p className="text-sm text-gray-600">Main content goes here</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold mb-2">Design Tools</h3>
              <p className="text-sm text-gray-600">Additional tools and features</p>
            </div>
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
            <h2 className="text-lg font-semibold mb-4">UI Property Panel</h2>
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
