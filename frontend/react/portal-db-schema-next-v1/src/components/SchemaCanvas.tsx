"use client";

import React, { useRef, useEffect, useState } from "react";
import { Schema, Table, EntityLayout, Group, serializeSchemaToXML } from "@/lib/schema-parser";
import { TableNode } from "./TableNode";
import { RelationshipLines } from "./RelationshipLines";

interface SchemaCanvasProps {
  schema: Schema;
  layoutIndex?: number;
  filename?: string;
}

interface TablePosition {
  x: number;
  y: number;
}

export function SchemaCanvas({ schema, layoutIndex = 0, filename = "schema.dbs" }: SchemaCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [tablePositions, setTablePositions] = useState<Map<string, TablePosition>>(new Map());
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [mutableSchema, setMutableSchema] = useState<Schema>(schema);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const layout = mutableSchema.layouts[layoutIndex];
  // Update mutable schema when prop changes
  useEffect(() => {
    setMutableSchema(schema);
  }, [schema]);
  // Initialize table positions from layout
  useEffect(() => {
    if (!layout) return;

    const positions = new Map<string, TablePosition>();
    layout.entities.forEach((entity) => {
      positions.set(entity.name, { x: entity.x, y: entity.y });
    });

    // Calculate required canvas size
    let maxX = 0;
    let maxY = 0;
    layout.entities.forEach((entity) => {
      maxX = Math.max(maxX, entity.x + 300); // Add table width estimate
      maxY = Math.max(maxY, entity.y + 400); // Add table height estimate
    });

    setTablePositions(positions);
    setCanvasSize({ 
      width: Math.max(maxX, window.innerWidth), 
      height: Math.max(maxY, window.innerHeight) 
    });
  }, [layout]);

  const handleDragStart = (tableName: string, x: number, y: number) => {
    // Optional: Add visual feedback
  };

  const handleDragMove = (tableName: string, x: number, y: number) => {
    setTablePositions((prev) => {
      const newPositions = new Map(prev);
      newPositions.set(tableName, { x, y });
      return newPositions;
    });
  };

  const handleDragEnd = (tableName: string, x: number, y: number) => {
    setTablePositions((prev) => {
      const newPositions = new Map(prev);
      newPositions.set(tableName, { x, y });
      return newPositions;
    });
    
    // Update the schema layout entities with new position
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      const newLayouts = [...newSchema.layouts];
      const currentLayout = { ...newLayouts[layoutIndex] };
      const newEntities = [...currentLayout.entities];
      
      const entityIndex = newEntities.findIndex((e) => e.name === tableName);
      if (entityIndex !== -1) {
        newEntities[entityIndex] = {
          ...newEntities[entityIndex],
          x: Math.round(x),
          y: Math.round(y),
        };
      }
      
      currentLayout.entities = newEntities;
      newLayouts[layoutIndex] = currentLayout;
      newSchema.layouts = newLayouts;
      
      return newSchema;
    });
  };

  const handleTableClick = (tableName: string) => {
    setActiveTable(tableName);
  };

  const handleMoveColumnUp = (tableName: string, columnIndex: number) => {
    if (columnIndex === 0) return; // Already at top
    
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      const tableIndex = newSchema.tables.findIndex((t) => t.name === tableName);
      if (tableIndex === -1) return prevSchema;
      
      const newTable = { ...newSchema.tables[tableIndex] };
      const newColumns = [...newTable.columns];
      [newColumns[columnIndex - 1], newColumns[columnIndex]] = 
        [newColumns[columnIndex], newColumns[columnIndex - 1]];
      
      newTable.columns = newColumns;
      newSchema.tables = [...newSchema.tables];
      newSchema.tables[tableIndex] = newTable;
      
      return newSchema;
    });
  };

  const handleMoveColumnDown = (tableName: string, columnIndex: number) => {
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      const tableIndex = newSchema.tables.findIndex((t) => t.name === tableName);
      if (tableIndex === -1) return prevSchema;
      
      const table = newSchema.tables[tableIndex];
      if (columnIndex >= table.columns.length - 1) return prevSchema; // Already at bottom
      
      const newTable = { ...table };
      const newColumns = [...newTable.columns];
      [newColumns[columnIndex], newColumns[columnIndex + 1]] = 
        [newColumns[columnIndex + 1], newColumns[columnIndex]];
      
      newTable.columns = newColumns;
      newSchema.tables = [...newSchema.tables];
      newSchema.tables[tableIndex] = newTable;
      
      return newSchema;
    });
  };

  const handleRemoveColumn = (tableName: string, columnIndex: number) => {
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      const tableIndex = newSchema.tables.findIndex((t) => t.name === tableName);
      if (tableIndex === -1) return prevSchema;
      
      const newTable = { ...newSchema.tables[tableIndex] };
      const newColumns = [...newTable.columns];
      newColumns.splice(columnIndex, 1);
      
      newTable.columns = newColumns;
      newSchema.tables = [...newSchema.tables];
      newSchema.tables[tableIndex] = newTable;
      
      return newSchema;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const xmlContent = serializeSchemaToXML(mutableSchema);
      
      const response = await fetch('/api/save-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          content: xmlContent,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setSaveMessage('✓ Saved successfully');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage(`✗ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage('✗ Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Pan functionality
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      // Middle mouse button or Ctrl + left click
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    } else if (e.button === 0 && e.target === e.currentTarget) {
      // Left click on canvas background (not on a table)
      setActiveTable(null);
    }
  };

  useEffect(() => {
    if (!isPanning) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanning, panStart]);

  // Zoom functionality
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.min(Math.max(0.1, prev * delta), 3));
    }
  };

  // Get color for table
  const getTableColor = (tableName: string): string => {
    const entity = layout?.entities.find((e) => e.name === tableName);
    return entity?.color || "FFFFFF";
  };

  // Get group for table
  const getTableGroup = (tableName: string): Group | undefined => {
    return layout?.groups.find((g) => g.entities.includes(tableName));
  };

  // Draw group backgrounds
  const renderGroups = () => {
    if (!layout) return null;

    return layout.groups.map((group, index) => {
      // Calculate bounding box for group
      const groupEntities = group.entities
        .map((entityName) => {
          const entity = layout.entities.find((e) => e.name === entityName);
          const position = tablePositions.get(entityName);
          return entity && position ? { ...entity, ...position } : null;
        })
        .filter(Boolean);

      if (groupEntities.length === 0) return null;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      groupEntities.forEach((entity) => {
        if (entity) {
          minX = Math.min(minX, entity.x);
          minY = Math.min(minY, entity.y);
          maxX = Math.max(maxX, entity.x + 300); // Estimate table width
          maxY = Math.max(maxY, entity.y + 400); // Estimate table height
        }
      });

      const padding = 20;
      return (
        <div
          key={`group-${index}`}
          className="absolute rounded-lg border-2 border-dashed pointer-events-none"
          style={{
            left: `${minX - padding}px`,
            top: `${minY - padding}px`,
            width: `${maxX - minX + padding * 2}px`,
            height: `${maxY - minY + padding * 2}px`,
            backgroundColor: `#${group.color}`,
            opacity: 0.2,
            borderColor: `#${group.color}`,
            zIndex: 0,
          }}
        >
          <div
            className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold"
            style={{
              backgroundColor: `#${group.color}`,
              opacity: 1,
            }}
          >
            {group.name}
          </div>
        </div>
      );
    });
  };

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No layout available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">
      {/* Controls */}
      <div id="control-panel" className="absolute top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <div className="text-xs font-semibold text-gray-700">
          {mutableSchema.projectName} - {layout.name}
        </div>
        <div className="text-xs text-gray-500">
          Tables: {mutableSchema.tables.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(z * 1.2, 3))}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            +
          </button>
          <span className="text-xs">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.max(z * 0.8, 0.1))}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            -
          </button>
        </div>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="w-full px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
        >
          Reset View
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Schema'}
        </button>
        {saveMessage && (
          <div className={`text-xs text-center py-1 rounded ${saveMessage.startsWith('✓') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
            {saveMessage}
          </div>
        )}
        <div className="text-xs text-gray-400 mt-2 pt-2 border-t">
          Ctrl+Scroll: Zoom<br/>
          Ctrl+Drag: Pan
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-full overflow-auto"
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
        style={{
          cursor: isPanning ? "grabbing" : "default",
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
            position: "relative",
          }}
        >
          {/* Render groups */}
          {renderGroups()}

          {/* Render relationship lines */}
          <RelationshipLines tables={mutableSchema.tables} tablePositions={tablePositions} />

          {/* Render tables */}
          {mutableSchema.tables.map((table) => {
            const position = tablePositions.get(table.name);
            if (!position) return null;

            return (
              <TableNode
                key={table.name}
                table={table}
                x={position.x}
                y={position.y}
                color={getTableColor(table.name)}
                isActive={activeTable === table.name}
                isSelected={activeTable === table.name}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onClick={handleTableClick}
                onMoveColumnUp={handleMoveColumnUp}
                onMoveColumnDown={handleMoveColumnDown}
                onRemoveColumn={handleRemoveColumn}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
