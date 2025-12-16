"use client";

import React from "react";
import { Table } from "@/lib/schema-parser";

interface RelationshipLinesProps {
  tables: Table[];
  tablePositions: Map<string, { x: number; y: number }>;
}

interface Point {
  x: number;
  y: number;
}

// Estimate table dimensions
const TABLE_WIDTH = 250;
const TABLE_HEADER_HEIGHT = 40;
const COLUMN_HEIGHT = 28;

export function RelationshipLines({ tables, tablePositions }: RelationshipLinesProps) {
  // Calculate the height of a table based on its columns
  const getTableHeight = (table: Table): number => {
    const columnsHeight = table.columns.length * COLUMN_HEIGHT;
    const commentHeight = table.comment ? 32 : 0;
    return TABLE_HEADER_HEIGHT + columnsHeight + commentHeight;
  };

  // Get connection point on the edge of a table
  const getConnectionPoint = (
    tableName: string,
    isSource: boolean
  ): Point | null => {
    const position = tablePositions.get(tableName);
    if (!position) return null;

    const table = tables.find((t) => t.name === tableName);
    if (!table) return null;

    const tableHeight = getTableHeight(table);
    
    // Use the center-right for source tables and center-left for target tables
    if (isSource) {
      return {
        x: position.x + TABLE_WIDTH,
        y: position.y + tableHeight / 2,
      };
    } else {
      return {
        x: position.x,
        y: position.y + tableHeight / 2,
      };
    }
  };

  // Create elbow connector path (right-angle connector)
  const createElbowPath = (start: Point, end: Point): string => {
    // Calculate midpoint for the elbow
    const midX = (start.x + end.x) / 2;

    // Create path with right angles
    // Start -> horizontal to midpoint -> vertical to end.y -> horizontal to end
    return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
  };

  // Collect all relationships
  const relationships: Array<{
    from: string;
    to: string;
    fkName: string;
  }> = [];

  tables.forEach((table) => {
    table.foreignKeys.forEach((fk) => {
      relationships.push({
        from: table.name,
        to: fk.toTable,
        fkName: fk.name,
      });
    });
  });

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    >
      <defs>
        {/* Arrow marker for the end of the line */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#6B7280" />
        </marker>
        {/* Circle marker for the start of the line */}
        <marker
          id="circle"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="4"
        >
          <circle cx="4" cy="4" r="3" fill="white" stroke="#6B7280" strokeWidth="1.5" />
        </marker>
      </defs>

      {relationships.map((rel, index) => {
        const start = getConnectionPoint(rel.from, true);
        const end = getConnectionPoint(rel.to, false);

        if (!start || !end) return null;

        const path = createElbowPath(start, end);

        return (
          <g key={`${rel.from}-${rel.to}-${index}`}>
            <path
              d={path}
              stroke="#6B7280"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
              markerStart="url(#circle)"
            />
          </g>
        );
      })}
    </svg>
  );
}
