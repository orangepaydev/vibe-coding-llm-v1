"use client";

import React, { useRef, useEffect } from "react";
import { Table, Column } from "@/lib/schema-parser";

interface TableNodeProps {
  table: Table;
  x: number;
  y: number;
  color: string;
  onDragStart: (tableName: string, x: number, y: number) => void;
  onDragMove: (tableName: string, x: number, y: number) => void;
  onDragEnd: (tableName: string, x: number, y: number) => void;
}

export function TableNode({
  table,
  x,
  y,
  color,
  onDragStart,
  onDragMove,
  onDragEnd,
}: TableNodeProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x, y });
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
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
        zIndex: isDragging ? 1000 : 1,
      }}
    >
      <div
        className="rounded-lg shadow-lg border-2 border-gray-400 overflow-hidden min-w-[200px] max-w-[300px]"
        style={{ backgroundColor: `#${color}` }}
      >
        {/* Table Header */}
        <div
          className="px-3 py-2 bg-gray-800 text-white font-bold text-sm cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          {table.name}
        </div>

        {/* Columns */}
        <div className="bg-white max-h-[400px] overflow-y-auto">
          {table.columns.map((column, index) => (
            <div
              key={index}
              className="px-3 py-1 text-xs border-b border-gray-200 last:border-b-0 flex items-center gap-1"
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
            </div>
          ))}
        </div>

        {/* Footer with stats */}
        {table.comment && (
          <div className="px-3 py-1 bg-gray-100 text-xs text-gray-600 italic border-t">
            {table.comment}
          </div>
        )}
      </div>
    </div>
  );
}
