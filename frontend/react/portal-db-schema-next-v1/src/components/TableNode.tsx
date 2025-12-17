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
  relationshipLabel?: string;
  onDragStart: (tableName: string, x: number, y: number) => void;
  onDragMove: (tableName: string, x: number, y: number) => void;
  onDragEnd: (tableName: string, x: number, y: number) => void;
  onClick: (tableName: string) => void;
  onMoveColumnUp: (tableName: string, columnIndex: number) => void;
  onMoveColumnDown: (tableName: string, columnIndex: number) => void;
  onRemoveColumn: (tableName: string, columnIndex: number) => void;
  onAddColumn: (tableName: string, name: string, type: string, length?: string, isPrimary?: boolean, isUnique?: boolean, isNotNull?: boolean, defaultValue?: string, comment?: string) => void;
  onEditColumn: (tableName: string, columnIndex: number, name: string, type: string, length?: string, isPrimary?: boolean, isUnique?: boolean, isNotNull?: boolean, defaultValue?: string, comment?: string) => void;
  onDeleteTable: (tableName: string) => void;
  onEditTable: (oldTableName: string, newTableName: string, color?: string, comment?: string) => void;
  onAddForeignKey: (tableName: string, fkName: string, toTable: string, columns: Array<{name: string, pk: string}>) => void;
  onEditForeignKey: (tableName: string, fkIndex: number, fkName: string, toTable: string, columns: Array<{name: string, pk: string}>) => void;
  onRemoveForeignKey: (tableName: string, fkIndex: number) => void;
  onAddIndex: (tableName: string, indexName: string, unique: string, columns: string[]) => void;
  onEditIndex: (tableName: string, indexIndex: number, indexName: string, unique: string, columns: string[]) => void;
  onRemoveIndex: (tableName: string, indexIndex: number) => void;
  allTables: Table[];
}

export function TableNode({
  table,
  x,
  y,
  color,
  isActive,
  isSelected,
  relationshipLabel,
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
  onEditTable,
  onAddForeignKey,
  onEditForeignKey,
  onRemoveForeignKey,
  onAddIndex,
  onEditIndex,
  onRemoveIndex,
  allTables,
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
  const [comment, setComment] = React.useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deleteConfirmationName, setDeleteConfirmationName] = React.useState("");
  const [isEditTableDialogOpen, setIsEditTableDialogOpen] = React.useState(false);
  const [newTableName, setNewTableName] = React.useState("");
  const [tableColor, setTableColor] = React.useState("");
  const [tableComment, setTableComment] = React.useState("");
  const [editingFKIndex, setEditingFKIndex] = React.useState<number | null>(null);
  const [fkName, setFkName] = React.useState("");
  const [fkToTable, setFkToTable] = React.useState("");
  const [fkColumnMappings, setFkColumnMappings] = React.useState<Array<{name: string, pk: string}>>([{name: "", pk: ""}]);
  const [editingIndexIndex, setEditingIndexIndex] = React.useState<number | null>(null);
  const [indexName, setIndexName] = React.useState("");
  const [indexUnique, setIndexUnique] = React.useState("INDEX");
  const [indexColumns, setIndexColumns] = React.useState<string[]>([]);

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
    setComment("");
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (columnIndex: number) => {
    const column = table.columns[columnIndex];
    setEditingColumnIndex(columnIndex);
    setNewColumnName(column.name);
    setNewColumnType(column.type);
    setNewColumnLength(column.length || "");
    setIsPrimaryKey(pkColumns.has(column.name));
    // Check if column has a unique index
    const hasUniqueIndex = table.indexes.some(
      (idx) => idx.unique === "UNIQUE" && idx.columns.length === 1 && idx.columns[0] === column.name
    );
    setIsUnique(hasUniqueIndex);
    setIsNotNull(column.mandatory || false);
    setDefaultValue(column.defaultValue || "");
    setComment(column.comment || "");
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
        defaultValue.trim() || undefined,
        comment.trim() || undefined
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
        defaultValue.trim() || undefined,
        comment.trim() || undefined
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
    setComment("");
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

  const handleOpenEditTableDialog = () => {
    setNewTableName(table.name);
    setTableColor(color);
    setTableComment(table.comment || "");
    // Reset foreign key editing state
    setEditingFKIndex(null);
    setFkName("");
    setFkToTable("");
    setFkColumnMappings([{name: "", pk: ""}]);
    // Reset index editing state
    setEditingIndexIndex(null);
    setIndexName("");
    setIndexUnique("INDEX");
    setIndexColumns([]);
    setIsEditTableDialogOpen(true);
  };

  const handleOpenFKDialog = (fkIndex?: number) => {
    if (fkIndex !== undefined && fkIndex !== null) {
      // Edit existing FK
      const fk = table.foreignKeys[fkIndex];
      setEditingFKIndex(fkIndex);
      setFkName(fk.name);
      setFkToTable(fk.toTable);
      setFkColumnMappings(fk.columns.length > 0 ? [...fk.columns] : [{name: "", pk: ""}]);
    } else {
      // Add new FK
      setEditingFKIndex(null);
      setFkName(`fk_${table.name}_`);
      setFkToTable("");
      setFkColumnMappings([{name: "", pk: ""}]);
    }
  };

  const handleSubmitFK = () => {
    if (!fkName.trim() || !fkToTable || fkColumnMappings.some(col => !col.name || !col.pk)) {
      return; // Validation failed
    }

    const validColumns = fkColumnMappings.filter(col => col.name && col.pk);
    
    if (editingFKIndex !== null) {
      onEditForeignKey(table.name, editingFKIndex, fkName.trim(), fkToTable, validColumns);
    } else {
      onAddForeignKey(table.name, fkName.trim(), fkToTable, validColumns);
    }

    // Reset form
    setEditingFKIndex(null);
    setFkName("");
    setFkToTable("");
    setFkColumnMappings([{name: "", pk: ""}]);
  };

  const handleOpenIndexDialog = (indexIndex?: number) => {
    if (indexIndex !== undefined && indexIndex !== null) {
      // Edit existing index
      const index = table.indexes[indexIndex];
      setEditingIndexIndex(indexIndex);
      setIndexName(index.name);
      setIndexUnique(index.unique);
      setIndexColumns([...index.columns]);
    } else {
      // Add new index
      setEditingIndexIndex(null);
      setIndexName(`idx_${table.name}_`);
      setIndexUnique("INDEX");
      setIndexColumns([]);
    }
  };

  const handleSubmitIndex = () => {
    if (!indexName.trim() || indexColumns.length === 0) {
      return; // Validation failed
    }

    if (editingIndexIndex !== null) {
      onEditIndex(table.name, editingIndexIndex, indexName.trim(), indexUnique, indexColumns);
    } else {
      onAddIndex(table.name, indexName.trim(), indexUnique, indexColumns);
    }

    // Reset form
    setEditingIndexIndex(null);
    setIndexName("");
    setIndexUnique("INDEX");
    setIndexColumns([]);
  };

  const toggleIndexColumn = (columnName: string) => {
    if (indexColumns.includes(columnName)) {
      setIndexColumns(indexColumns.filter(col => col !== columnName));
    } else {
      setIndexColumns([...indexColumns, columnName]);
    }
  };

  const addFKColumn = () => {
    setFkColumnMappings([...fkColumnMappings, {name: "", pk: ""}]);
  };

  const removeFKColumn = (index: number) => {
    if (fkColumnMappings.length > 1) {
      const newColumns = fkColumnMappings.filter((_, i) => i !== index);
      setFkColumnMappings(newColumns);
    }
  };

  const updateFKColumn = (index: number, field: 'name' | 'pk', value: string) => {
    const newColumns = [...fkColumnMappings];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setFkColumnMappings(newColumns);
  };

  const handleEditTable = () => {
    const hasChanges = 
      (newTableName.trim() && newTableName.trim() !== table.name) ||
      tableColor !== color ||
      tableComment !== (table.comment || "");
    
    if (hasChanges) {
      onEditTable(
        table.name, 
        newTableName.trim() || table.name, 
        tableColor, 
        tableComment
      );
    }
    
    setIsEditTableDialogOpen(false);
    setNewTableName("");
    setTableColor("");
    setTableComment("");
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

  // Determine if color is light or dark for text contrast
  const isLightColor = (hexColor: string): boolean => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  const headerTextColor = isLightColor(color) ? '#000000' : '#FFFFFF';

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
          borderColor: '#9ca3af'
        }}
      >
        {/* Table Header */}
        <div
          className="px-3 py-2 font-bold text-sm cursor-grab active:cursor-grabbing"
          style={{ 
            backgroundColor: `#${color}`,
            color: headerTextColor,
            filter: 'brightness(0.85)'
          }}
          onMouseDown={handleMouseDown}
          title={table.comment || undefined}
        >
          <div className="flex items-center gap-1">
            <span className="truncate">{table.name}{relationshipLabel ? ` ${relationshipLabel}` : ""}</span>
            {table.comment && <span className="text-xs opacity-70 flex-shrink-0" title={table.comment}>💬</span>}
            {isSelected && <span className="ml-2 text-xs flex-shrink-0">(selected)</span>}
          </div>
          {table.comment && (
            <div className="text-xs font-normal opacity-80 mt-1 overflow-hidden text-ellipsis line-clamp-2 break-words">
              {table.comment.length > 30 ? `${table.comment.substring(0, 30)}...` : table.comment}
            </div>
          )}
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditTableDialog();
              }}
              className="flex-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
            >
              ✎ Edit Table
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Comment (optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a description or note for this column"
                  className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                  rows={5}
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

        {/* Edit Table Dialog */}
        <Dialog open={isEditTableDialogOpen} onOpenChange={setIsEditTableDialogOpen}>
          <DialogContent onClick={(e) => e.stopPropagation()} className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Table: {table.name}</DialogTitle>
              <DialogDescription>
                Change the table name and manage foreign key constraints.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Table Name Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Table Name
                </label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Enter table name"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTableName.trim()) {
                      handleEditTable();
                    }
                  }}
                />
              </div>

              {/* Table Color Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Table Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={`#${tableColor}`}
                    onChange={(e) => setTableColor(e.target.value.substring(1))}
                    className="h-10 w-20 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tableColor}
                    onChange={(e) => setTableColor(e.target.value.replace(/[^0-9A-Fa-f]/g, '').substring(0, 6))}
                    placeholder="FFFFFF"
                    maxLength={6}
                    className="flex-1 px-3 py-2 border rounded-md text-sm font-mono uppercase"
                  />
                  <div
                    className="h-10 w-20 border rounded-md"
                    style={{ backgroundColor: `#${tableColor}` }}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Preset colors:</p>
                  <div className="grid grid-cols-12 gap-1">
                    {['90CAF9', 'CE93D8', 'F48FB1', 'FFB74D', '81C784', 'FFF176', 'FFB74D', 'FF8A65', 'A1887F', '90A4AE', 'AB47BC', '26C6DA'].map((presetColor) => (
                      <button
                        key={presetColor}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTableColor(presetColor);
                        }}
                        className="h-8 w-full border rounded cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: `#${presetColor}` }}
                        title={`#${presetColor}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500">Enter hex color code without #</p>
              </div>

              {/* Table Comment Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Table Comment
                </label>
                <textarea
                  value={tableComment}
                  onChange={(e) => setTableComment(e.target.value)}
                  placeholder="Enter table description or comment"
                  className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
                  rows={3}
                />
                <p className="text-xs text-gray-500">Optional description for the table</p>
              </div>

              {/* Foreign Keys Section */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Foreign Key Constraints
                  </label>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenFKDialog();
                    }}
                    className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded"
                  >
                    + Add Foreign Key
                  </button>
                </div>

                {table.foreignKeys.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No foreign keys defined</p>
                ) : (
                  <div className="space-y-2">
                    {table.foreignKeys.map((fk, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <div className="flex-1">
                          <div className="text-xs font-semibold">{fk.name}</div>
                          <div className="text-xs text-gray-600">
                            {fk.columns.map(col => col.name).join(", ")} → {fk.toTable}.{fk.columns.map(col => col.pk).join(", ")}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenFKDialog(index);
                            }}
                            className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded"
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveForeignKey(table.name, index);
                            }}
                            className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Foreign Key Edit Form - shown when editing/adding */}
                {(editingFKIndex !== null || fkName !== "") && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md space-y-3">
                    <div className="text-sm font-medium text-blue-900">
                      {editingFKIndex !== null ? "Edit" : "Add"} Foreign Key
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Constraint Name</label>
                      <input
                        type="text"
                        value={fkName}
                        onChange={(e) => setFkName(e.target.value)}
                        placeholder="fk_table_name"
                        className="w-full px-2 py-1 border rounded text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">References Table</label>
                      <select
                        value={fkToTable}
                        onChange={(e) => setFkToTable(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-xs"
                      >
                        <option value="">Select table...</option>
                        {allTables.filter(t => t.name !== table.name).map(t => (
                          <option key={t.name} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Column Mappings</label>
                      {fkColumnMappings.map((col, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <select
                            value={col.name}
                            onChange={(e) => updateFKColumn(idx, 'name', e.target.value)}
                            className="flex-1 px-2 py-1 border rounded text-xs"
                          >
                            <option value="">Select column...</option>
                            {table.columns.map(c => (
                              <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                          <span className="text-xs">→</span>
                          <select
                            value={col.pk}
                            onChange={(e) => updateFKColumn(idx, 'pk', e.target.value)}
                            className="flex-1 px-2 py-1 border rounded text-xs"
                            disabled={!fkToTable}
                          >
                            <option value="">Select column...</option>
                            {fkToTable && allTables.find(t => t.name === fkToTable)?.columns.map(c => (
                              <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeFKColumn(idx)}
                            disabled={fkColumnMappings.length === 1}
                            className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addFKColumn}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        + Add Column Mapping
                      </button>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setEditingFKIndex(null);
                          setFkName("");
                          setFkToTable("");
                          setFkColumnMappings([{name: "", pk: ""}]);
                        }}
                        className="px-3 py-1 text-xs border rounded hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitFK}
                        disabled={!fkName.trim() || !fkToTable || fkColumnMappings.some(col => !col.name || !col.pk)}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                      >
                        {editingFKIndex !== null ? "Update" : "Add"} FK
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Indexes Section */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Indexes
                  </label>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenIndexDialog();
                    }}
                    className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded"
                  >
                    + Add Index
                  </button>
                </div>

                {table.indexes.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No indexes defined</p>
                ) : (
                  <div className="space-y-2">
                    {table.indexes.map((index, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <div className="flex-1">
                          <div className="text-xs font-semibold flex items-center gap-2">
                            {index.name}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              index.unique === 'PRIMARY_KEY' ? 'bg-blue-100 text-blue-700' :
                              index.unique === 'UNIQUE' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {index.unique === 'PRIMARY_KEY' ? 'PK' : 
                               index.unique === 'UNIQUE' ? 'UNIQUE' : 
                               'INDEX'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Columns: {index.columns.join(", ")}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {index.unique !== 'PRIMARY_KEY' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenIndexDialog(idx);
                                }}
                                className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded"
                              >
                                ✎ Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveIndex(table.name, idx);
                                }}
                                className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
                              >
                                ✕ Remove
                              </button>
                            </>
                          )}
                          {index.unique === 'PRIMARY_KEY' && (
                            <span className="px-2 py-1 text-xs text-gray-400 italic">
                              (Primary Key - edit via columns)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Index Edit Form - shown when editing/adding */}
                {(editingIndexIndex !== null || indexName !== "") && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md space-y-3">
                    <div className="text-sm font-medium text-green-900">
                      {editingIndexIndex !== null ? "Edit" : "Add"} Index
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Index Name</label>
                      <input
                        type="text"
                        value={indexName}
                        onChange={(e) => setIndexName(e.target.value)}
                        placeholder="idx_table_column"
                        className="w-full px-2 py-1 border rounded text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Index Type</label>
                      <select
                        value={indexUnique}
                        onChange={(e) => setIndexUnique(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-xs"
                      >
                        <option value="INDEX">INDEX (Non-unique)</option>
                        <option value="UNIQUE">UNIQUE</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Columns</label>
                      <div className="space-y-1 max-h-40 overflow-y-auto border rounded p-2 bg-white">
                        {table.columns.map((col) => (
                          <label key={col.name} className="flex items-center gap-2 text-xs hover:bg-gray-50 p-1 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={indexColumns.includes(col.name)}
                              onChange={() => toggleIndexColumn(col.name)}
                              className="rounded"
                            />
                            <span>{col.name}</span>
                            <span className="text-gray-500 text-[10px]">({col.type})</span>
                          </label>
                        ))}
                      </div>
                      {indexColumns.length > 0 && (
                        <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                          Selected order: <span className="font-mono">{indexColumns.join(", ")}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setEditingIndexIndex(null);
                          setIndexName("");
                          setIndexUnique("INDEX");
                          setIndexColumns([]);
                        }}
                        className="px-3 py-1 text-xs border rounded hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitIndex}
                        disabled={!indexName.trim() || indexColumns.length === 0}
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                      >
                        {editingIndexIndex !== null ? "Update" : "Add"} Index
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <button
                onClick={() => {
                  // Save table name, color, or comment if changed
                  if (newTableName.trim() !== table.name || tableColor !== color || tableComment !== (table.comment || "")) {
                    onEditTable(table.name, newTableName.trim() || table.name, tableColor, tableComment);
                  }
                  // Close dialog and reset state
                  setIsEditTableDialogOpen(false);
                  setNewTableName("");
                  setTableColor("");
                  setTableComment("");
                  setEditingFKIndex(null);
                  setFkName("");
                  setFkToTable("");
                  setFkColumnMappings([{name: "", pk: ""}]);
                  setEditingIndexIndex(null);
                  setIndexName("");
                  setIndexUnique("INDEX");
                  setIndexColumns([]);
                }}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Ok
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
