"use client";

import React from "react";
import { Table } from "@/lib/schema-parser";

interface RelationshipLinesProps {
  tables: Table[];
  tablePositions: Map<string, { x: number; y: number }>;
  tableColors: Map<string, string>;
  selectedTable: string | null;
}

interface Point {
  x: number;
  y: number;
}

// Estimate table dimensions
const TABLE_WIDTH = 250;
const TABLE_HEADER_HEIGHT = 40;
const COLUMN_HEIGHT = 28;

export function RelationshipLines({ tables, tablePositions, tableColors, selectedTable }: RelationshipLinesProps) {
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
    
    // Use the horizontal center for both source and target tables
    return {
      x: position.x + TABLE_WIDTH / 2,
      y: position.y + tableHeight / 2,
    };
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
    color: string;
  }> = [];

  tables.forEach((table) => {
    const tableColor = tableColors.get(table.name) || "6B7280";
    table.foreignKeys.forEach((fk) => {
      relationships.push({
        from: table.name,
        to: fk.toTable,
        fkName: fk.name,
        color: tableColor,
      });
    });
  });

  // Get unique colors for creating markers
  const uniqueColors = Array.from(new Set(relationships.map(rel => rel.color)));

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
        {uniqueColors.map(color => {
          const hexColor = color.startsWith('#') ? color : `#${color}`;
          return (
            <React.Fragment key={color}>
              {/* Arrow marker for the end of the line */}
              <marker
                id={`arrowhead-${color}`}
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill={hexColor} />
              </marker>
              {/* Circle marker for the start of the line */}
              <marker
                id={`circle-${color}`}
                markerWidth="8"
                markerHeight="8"
                refX="4"
                refY="4"
              >
                <circle cx="4" cy="4" r="3" fill="white" stroke={hexColor} strokeWidth="1.5" />
              </marker>
            </React.Fragment>
          );
        })}
      </defs>

      {relationships.map((rel, index) => {
        const start = getConnectionPoint(rel.from, true);
        const end = getConnectionPoint(rel.to, false);

        if (!start || !end) return null;

        const path = createElbowPath(start, end);
        const hexColor = rel.color.startsWith('#') ? rel.color : `#${rel.color}`;
        const isSelectedRelation = selectedTable && (rel.from === selectedTable || rel.to === selectedTable);

        return (
          <g key={`${rel.from}-${rel.to}-${index}`}>
            <path
              d={path}
              stroke={hexColor}
              strokeWidth="6"
              fill="none"
              strokeDasharray={isSelectedRelation ? "10 5" : "none"}
              markerEnd={`url(#arrowhead-${rel.color})`}
              markerStart={`url(#circle-${rel.color})`}
            />
          </g>
        );
      })}
    </svg>
  );
}
