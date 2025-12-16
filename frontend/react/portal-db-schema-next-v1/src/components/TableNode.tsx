"use client";

import React, { useRef, useEffect } from "react";
import { Table, Column } from "@/lib/schema-parser";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TableNodeProps {
  table: Table;
  x: number;
  y: number;
  color: string;
  isActive: boolean;
  isSelected: boolean;
  onDragStart: (tableName: string, x: number, y: number) => void;
  onDragMove: (tableName: string, x: number, y: number) => void;
  onDragEnd: (tableName: string, x: number, y: number) => void;
  onClick: (tableName: string) => void;
  onMoveColumnUp: (tableName: string, columnIndex: number) => void;
  onMoveColumnDown: (tableName: string, columnIndex: number) => void;
  onRemoveColumn: (tableName: string, columnIndex: number) => void;
  onAddColumn: (tableName: string, name: string, type: string, length?: string, isPrimary?: boolean, isUnique?: boolean, isNotNull?: boolean, defaultValue?: string) => void;
  onEditColumn: (tableName: string, columnIndex: number, name: string, type: string, length?: string, isPrimary?: boolean, isUnique?: boolean, isNotNull?: boolean, defaultValue?: string) => void;
  onDeleteTable: (tableName: string) => void;
}

export function TableNode({
  table,
  x,
  y,
  color,
  isActive,
  isSelected,
  onDragStart,
  onDragMove,
  onDragEnd,
  onClick,
  onMoveColumnUp,
  onMoveColumnDown,
  onRemoveColumn,
  onAddColumn,
  onEditColumn,
  onDeleteTable,
}: TableNodeProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x, y });
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingColumnIndex, setEditingColumnIndex] = React.useState<number | null>(null);
  const [newColumnName, setNewColumnName] = React.useState("");
  const [newColumnType, setNewColumnType] = React.useState("VARCHAR");
  const [newColumnLength, setNewColumnLength] = React.useState("");
  const [isPrimaryKey, setIsPrimaryKey] = React.useState(false);
  const [isUnique, setIsUnique] = React.useState(false);
  const [isNotNull, setIsNotNull] = React.useState(false);
  const [defaultValue, setDefaultValue] = React.useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deleteConfirmationName, setDeleteConfirmationName] = React.useState("");

  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    // Bring table to front on click
    onClick(table.name);
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    
    setIsDragging(true);
    onDragStart(table.name, position.x, position.y);
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = nodeRef.current?.parentElement;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;

      setPosition({ x: newX, y: newY });
      onDragMove(table.name, newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDragEnd(table.name, position.x, position.y);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, position, table.name, onDragMove, onDragEnd]);

  const handleOpenAddDialog = () => {
    setEditingColumnIndex(null);
    setNewColumnName("");
    setNewColumnType("VARCHAR");
    setNewColumnLength("");
    setIsPrimaryKey(false);
    setIsUnique(false);
    setIsNotNull(false);
    setDefaultValue("");
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (columnIndex: number) => {
    const column = table.columns[columnIndex];
    setEditingColumnIndex(columnIndex);
    setNewColumnName(column.name);
    setNewColumnType(column.type);
    setNewColumnLength(column.length || "");
    setIsPrimaryKey(pkColumns.has(column.name));
    setIsUnique(false); // TODO: Extract from unique indexes
    setIsNotNull(column.mandatory || false);
    setDefaultValue(column.defaultValue || "");
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!newColumnName.trim()) return;
    
    if (editingColumnIndex !== null) {
      // Edit existing column
      onEditColumn(
        table.name,
        editingColumnIndex,
        newColumnName.trim(),
        newColumnType,
        newColumnLength.trim() || undefined,
        isPrimaryKey,
        isUnique,
        isNotNull,
        defaultValue.trim() || undefined
      );
    } else {
      // Add new column
      onAddColumn(
        table.name,
        newColumnName.trim(),
        newColumnType,
        newColumnLength.trim() || undefined,
        isPrimaryKey,
        isUnique,
        isNotNull,
        defaultValue.trim() || undefined
      );
    }
    
    // Reset form
    setNewColumnName("");
    setNewColumnType("VARCHAR");
    setNewColumnLength("");
    setIsPrimaryKey(false);
    setIsUnique(false);
    setIsNotNull(false);
    setDefaultValue("");
    setEditingColumnIndex(null);
    setIsDialogOpen(false);
  };

  const handleDeleteTable = () => {
    if (deleteConfirmationName === table.name) {
      onDeleteTable(table.name);
      setIsDeleteDialogOpen(false);
      setDeleteConfirmationName("");
    }
  };

  // Get primary key columns
  const pkIndex = table.indexes.find((idx) => idx.unique === "PRIMARY_KEY");
  const pkColumns = new Set(pkIndex?.columns || []);

  // Get foreign key columns
  const fkColumns = new Set(
    table.foreignKeys.flatMap((fk) => fk.columns.map((col) => col.name))
  );

  const getColumnIcon = (column: Column) => {
    if (pkColumns.has(column.name)) {
      return "🔑"; // Primary key
    }
    if (fkColumns.has(column.name)) {
      return "🔗"; // Foreign key
    }
    return "";
  };

  return (
    <div
      ref={nodeRef}
      className="absolute select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 1000 : isActive ? 100 : 1,
      }}
    >
      <div
        className="rounded-lg shadow-lg overflow-hidden min-w-[200px]"
        style={{ 
          backgroundColor: `#${color}`,
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: isSelected ? '#3b82f6' : '#9ca3af'
        }}
      >
        {/* Table Header */}
        <div
          className="px-3 py-2 bg-gray-800 text-white font-bold text-sm cursor-grab active:cursor-grabbing"
          style={{ backgroundColor: isSelected ? '#1e40af' : '#1f2937' }}
          onMouseDown={handleMouseDown}
        >
          {table.name}
          {isSelected && <span className="ml-2 text-xs">(selected)</span>}
        </div>

        {/* Add Column and Delete Table buttons - only show when selected */}
        {isSelected && (
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAddDialog();
              }}
              className="flex-1 px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded"
            >
              + Col
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
              className="flex-1 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold"
            >
              🗑️ Del Table
            </button>
          </div>
        )}

        {/* Columns */}
        <div className="bg-white">
          {table.columns.map((column, index) => (
            <div
              key={index}
              className="px-3 py-1 text-xs border-b border-gray-200 last:border-b-0 flex items-center gap-1 group"
              title={column.comment}
            >
              <span className="text-base leading-none">{getColumnIcon(column)}</span>
              <span className={column.mandatory ? "font-semibold" : ""}>
                {column.name}
              </span>
              <span className="text-gray-500 ml-auto">
                {column.type}
                {column.length ? `(${column.length})` : ""}
              </span>
              
              {/* Column controls - only show when selected */}
              {isSelected && (
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditDialog(index);
                    }}
                    className="px-1 py-0.5 text-[10px] bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded"
                    title="Edit column"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveColumnUp(table.name, index);
                    }}
                    disabled={index === 0}
                    className="px-1 py-0.5 text-[10px] bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveColumnDown(table.name, index);
                    }}
                    disabled={index === table.columns.length - 1}
                    className="px-1 py-0.5 text-[10px] bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveColumn(table.name, index);
                    }}
                    className="px-1 py-0.5 text-[10px] bg-red-100 hover:bg-red-200 text-red-700 rounded"
                    title="Remove column"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add/Edit Column Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>
                {editingColumnIndex !== null ? "Edit Column" : "Add Column"} in {table.name}
              </DialogTitle>
              <DialogDescription>
                {editingColumnIndex !== null 
                  ? "Modify the column details." 
                  : "Enter the details for the new column."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Column Name</label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="column_name"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Type</label>
                <select
                  value={newColumnType}
                  onChange={(e) => setNewColumnType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="VARCHAR">VARCHAR</option>
                  <option value="INT">INT</option>
                  <option value="BIGINT">BIGINT</option>
                  <option value="DECIMAL">DECIMAL</option>
                  <option value="FLOAT">FLOAT</option>
                  <option value="DOUBLE">DOUBLE</option>
                  <option value="DATE">DATE</option>
                  <option value="DATETIME">DATETIME</option>
                  <option value="TIMESTAMP">TIMESTAMP</option>
                  <option value="TEXT">TEXT</option>
                  <option value="BOOLEAN">BOOLEAN</option>
                  <option value="BLOB">BLOB</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Length/Size (optional)</label>
                <input
                  type="text"
                  value={newColumnLength}
                  onChange={(e) => setNewColumnLength(e.target.value)}
                  placeholder="e.g., 255, 10,2"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Column Constraints</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isPrimaryKey}
                      onChange={(e) => setIsPrimaryKey(e.target.checked)}
                      className="rounded"
                    />
                    <span>Primary Key</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isUnique}
                      onChange={(e) => setIsUnique(e.target.checked)}
                      className="rounded"
                    />
                    <span>Unique</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isNotNull}
                      onChange={(e) => setIsNotNull(e.target.checked)}
                      className="rounded"
                    />
                    <span>Not Null</span>
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Value (optional)</label>
                <input
                  type="text"
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder="e.g., 0, '', NOW()"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                  }}
                />
              </div>
            </div>
            
            <DialogFooter>
              <button
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingColumnIndex(null);
                }}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newColumnName.trim()}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {editingColumnIndex !== null ? "Save Changes" : "Add Column"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Table Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Delete Table: {table.name}</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the table
                and remove all foreign key relationships that reference it.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800 font-semibold">
                  ⚠️ Warning: This will also remove all foreign keys referencing this table!
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type <span className="font-bold text-red-600">{table.name}</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationName}
                  onChange={(e) => setDeleteConfirmationName(e.target.value)}
                  placeholder={table.name}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && deleteConfirmationName === table.name) {
                      handleDeleteTable();
                    }
                  }}
                />
              </div>
            </div>
            
            <DialogFooter>
              <button
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeleteConfirmationName("");
                }}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTable}
                disabled={deleteConfirmationName !== table.name}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Delete Table
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
