"use client";

import React, { useRef, useEffect, useState } from "react";
import { Schema, Table, EntityLayout, Group, serializeSchemaToXML } from "@/lib/schema-parser";
import { TableNode } from "./TableNode";
import { RelationshipLines } from "./RelationshipLines";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DDLGeneratorFactory, DatabaseType } from "@/lib/ddl-generator";

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
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [isGenerateSchemaDialogOpen, setIsGenerateSchemaDialogOpen] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);
  const [flywayVersion, setFlywayVersion] = useState("1");
  const [flywayDescription, setFlywayDescription] = useState("initial_schema");
  const [flywayBaseDb, setFlywayBaseDb] = useState<DatabaseType>(DatabaseType.POSTGRESQL);
  const [includeUndo, setIncludeUndo] = useState(false);

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
    setActiveTable((prev) => prev === tableName ? null : tableName);
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

  const handleAddColumn = (
    tableName: string, 
    name: string, 
    type: string, 
    length?: string,
    isPrimary?: boolean,
    isUnique?: boolean,
    isNotNull?: boolean,
    defaultValue?: string,
    comment?: string
  ) => {
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      const tableIndex = newSchema.tables.findIndex((t) => t.name === tableName);
      if (tableIndex === -1) return prevSchema;
      
      const newTable = { ...newSchema.tables[tableIndex] };
      const newColumns = [...newTable.columns];
      
      const newColumn = {
        name,
        type,
        length,
        mandatory: isNotNull || isPrimary || false,
        defaultValue,
        comment,
      };
      
      newColumns.push(newColumn);
      newTable.columns = newColumns;
      
      // Handle primary key
      if (isPrimary) {
        const newIndexes = [...newTable.indexes];
        const pkIndex = newIndexes.findIndex((idx) => idx.unique === "PRIMARY_KEY");
        
        if (pkIndex !== -1) {
          // Add to existing primary key
          newIndexes[pkIndex] = {
            ...newIndexes[pkIndex],
            columns: [...newIndexes[pkIndex].columns, name],
          };
        } else {
          // Create new primary key index
          newIndexes.push({
            name: `pk_${tableName}`,
            unique: "PRIMARY_KEY",
            columns: [name],
          });
        }
        newTable.indexes = newIndexes;
      }
      
      // Handle unique constraint
      if (isUnique) {
        const newIndexes = [...newTable.indexes];
        newIndexes.push({
          name: `uk_${tableName}_${name}`,
          unique: "UNIQUE",
          columns: [name],
        });
        newTable.indexes = newIndexes;
      }
      
      newSchema.tables = [...newSchema.tables];
      newSchema.tables[tableIndex] = newTable;
      
      return newSchema;
    });
  };

  const handleEditColumn = (
    tableName: string,
    columnIndex: number,
    name: string,
    type: string,
    length?: string,
    isPrimary?: boolean,
    isUnique?: boolean,
    isNotNull?: boolean,
    defaultValue?: string,
    comment?: string
  ) => {
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      const tableIndex = newSchema.tables.findIndex((t) => t.name === tableName);
      if (tableIndex === -1) return prevSchema;
      
      const newTable = { ...newSchema.tables[tableIndex] };
      const oldColumnName = newTable.columns[columnIndex].name;
      
      // Update column
      const newColumns = [...newTable.columns];
      newColumns[columnIndex] = {
        name,
        type,
        length,
        mandatory: isNotNull || isPrimary || false,
        defaultValue,
        comment,
      };
      newTable.columns = newColumns;
      
      // Update indexes if column name changed
      let newIndexes = [...newTable.indexes];
      if (oldColumnName !== name) {
        newIndexes = newIndexes.map((idx) => ({
          ...idx,
          columns: idx.columns.map((col) => col === oldColumnName ? name : col),
        }));
      }
      
      // Remove old primary key references for this column
      newIndexes = newIndexes.map((idx) => {
        if (idx.unique === "PRIMARY_KEY") {
          return {
            ...idx,
            columns: idx.columns.filter((col) => col !== name),
          };
        }
        return idx;
      }).filter((idx) => idx.unique !== "PRIMARY_KEY" || idx.columns.length > 0);
      
      // Remove old unique indexes for this column
      newIndexes = newIndexes.filter((idx) => 
        !(idx.unique === "UNIQUE" && idx.columns.length === 1 && idx.columns[0] === oldColumnName)
      );
      
      // Handle primary key
      if (isPrimary) {
        const pkIndex = newIndexes.findIndex((idx) => idx.unique === "PRIMARY_KEY");
        
        if (pkIndex !== -1) {
          // Add to existing primary key
          newIndexes[pkIndex] = {
            ...newIndexes[pkIndex],
            columns: [...newIndexes[pkIndex].columns, name],
          };
        } else {
          // Create new primary key index
          newIndexes.push({
            name: `pk_${tableName}`,
            unique: "PRIMARY_KEY",
            columns: [name],
          });
        }
      }
      
      // Handle unique constraint
      if (isUnique) {
        newIndexes.push({
          name: `uk_${tableName}_${name}`,
          unique: "UNIQUE",
          columns: [name],
        });
      }
      
      newTable.indexes = newIndexes;
      
      // Update foreign keys if column name changed
      if (oldColumnName !== name) {
        const newForeignKeys = newTable.foreignKeys.map((fk) => ({
          ...fk,
          columns: fk.columns.map((col) => 
            col.name === oldColumnName ? { ...col, name } : col
          ),
        }));
        newTable.foreignKeys = newForeignKeys;
      }
      
      newSchema.tables = [...newSchema.tables];
      newSchema.tables[tableIndex] = newTable;
      
      return newSchema;
    });
  };

  const handleDeleteTable = (tableName: string) => {
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      
      // Remove the table
      newSchema.tables = newSchema.tables.filter((t) => t.name !== tableName);
      
      // Remove foreign keys that reference this table
      newSchema.tables = newSchema.tables.map((table) => ({
        ...table,
        foreignKeys: table.foreignKeys.filter((fk) => fk.toTable !== tableName),
      }));
      
      // Remove from layouts
      newSchema.layouts = newSchema.layouts.map((layout) => ({
        ...layout,
        entities: layout.entities.filter((e) => e.name !== tableName),
        groups: layout.groups.map((group) => ({
          ...group,
          entities: group.entities.filter((e) => e !== tableName),
        })),
      }));
      
      return newSchema;
    });
    
    // Clear active table if it was deleted
    if (activeTable === tableName) {
      setActiveTable(null);
    }
  };

  const handleEditTable = (oldTableName: string, newTableName: string, color?: string, comment?: string) => {
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      
      // Update the table name and comment
      const tableIndex = newSchema.tables.findIndex((t) => t.name === oldTableName);
      if (tableIndex !== -1) {
        newSchema.tables[tableIndex] = {
          ...newSchema.tables[tableIndex],
          name: newTableName,
          comment: comment !== undefined ? comment : newSchema.tables[tableIndex].comment,
        };
      }
      
      // Update foreign keys that reference this table
      newSchema.tables = newSchema.tables.map((table) => ({
        ...table,
        foreignKeys: table.foreignKeys.map((fk) => 
          fk.toTable === oldTableName 
            ? { ...fk, toTable: newTableName }
            : fk
        ),
      }));
      
      // Update in layouts (name and color)
      newSchema.layouts = newSchema.layouts.map((layout) => ({
        ...layout,
        entities: layout.entities.map((e) => 
          e.name === oldTableName 
            ? { ...e, name: newTableName, color: color || e.color }
            : e
        ),
        groups: layout.groups.map((group) => ({
          ...group,
          entities: group.entities.map((e) => e === oldTableName ? newTableName : e),
        })),
      }));
      
      return newSchema;
    });
    
    // Update active table if it was renamed
    if (activeTable === oldTableName) {
      setActiveTable(newTableName);
    }
    
    // Update table positions map
    setTablePositions((prev) => {
      const newPositions = new Map(prev);
      const position = newPositions.get(oldTableName);
      if (position) {
        newPositions.delete(oldTableName);
        newPositions.set(newTableName, position);
      }
      return newPositions;
    });
  };

  const handleAddForeignKey = (
    tableName: string,
    fkName: string,
    toTable: string,
    columns: Array<{name: string, pk: string}>
  ) => {
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      const tableIndex = newSchema.tables.findIndex((t) => t.name === tableName);
      if (tableIndex === -1) return prevSchema;
      
      const newTable = { ...newSchema.tables[tableIndex] };
      const newForeignKeys = [...newTable.foreignKeys];
      
      newForeignKeys.push({
        name: fkName,
        toSchema: newSchema.schemaName,
        toTable,
        columns,
      });
      
      newTable.foreignKeys = newForeignKeys;
      newSchema.tables = [...newSchema.tables];
      newSchema.tables[tableIndex] = newTable;
      
      return newSchema;
    });
  };

  const handleEditForeignKey = (
    tableName: string,
    fkIndex: number,
    fkName: string,
    toTable: string,
    columns: Array<{name: string, pk: string}>
  ) => {
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      const tableIndex = newSchema.tables.findIndex((t) => t.name === tableName);
      if (tableIndex === -1) return prevSchema;
      
      const newTable = { ...newSchema.tables[tableIndex] };
      const newForeignKeys = [...newTable.foreignKeys];
      
      if (fkIndex >= 0 && fkIndex < newForeignKeys.length) {
        newForeignKeys[fkIndex] = {
          name: fkName,
          toSchema: newSchema.schemaName,
          toTable,
          columns,
        };
        
        newTable.foreignKeys = newForeignKeys;
        newSchema.tables = [...newSchema.tables];
        newSchema.tables[tableIndex] = newTable;
      }
      
      return newSchema;
    });
  };

  const handleRemoveForeignKey = (tableName: string, fkIndex: number) => {
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      const tableIndex = newSchema.tables.findIndex((t) => t.name === tableName);
      if (tableIndex === -1) return prevSchema;
      
      const newTable = { ...newSchema.tables[tableIndex] };
      const newForeignKeys = [...newTable.foreignKeys];
      
      if (fkIndex >= 0 && fkIndex < newForeignKeys.length) {
        newForeignKeys.splice(fkIndex, 1);
        newTable.foreignKeys = newForeignKeys;
        newSchema.tables = [...newSchema.tables];
        newSchema.tables[tableIndex] = newTable;
      }
      
      return newSchema;
    });
  };

  const handleAddIndex = (
    tableName: string,
    indexName: string,
    unique: string,
    columns: string[]
  ) => {
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      const tableIndex = newSchema.tables.findIndex((t) => t.name === tableName);
      if (tableIndex === -1) return prevSchema;
      
      const newTable = { ...newSchema.tables[tableIndex] };
      const newIndexes = [...newTable.indexes];
      
      newIndexes.push({
        name: indexName,
        unique,
        columns,
      });
      
      newTable.indexes = newIndexes;
      newSchema.tables = [...newSchema.tables];
      newSchema.tables[tableIndex] = newTable;
      
      return newSchema;
    });
  };

  const handleEditIndex = (
    tableName: string,
    indexIndex: number,
    indexName: string,
    unique: string,
    columns: string[]
  ) => {
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      const tableIndex = newSchema.tables.findIndex((t) => t.name === tableName);
      if (tableIndex === -1) return prevSchema;
      
      const newTable = { ...newSchema.tables[tableIndex] };
      const newIndexes = [...newTable.indexes];
      
      if (indexIndex >= 0 && indexIndex < newIndexes.length) {
        newIndexes[indexIndex] = {
          name: indexName,
          unique,
          columns,
        };
        
        newTable.indexes = newIndexes;
        newSchema.tables = [...newSchema.tables];
        newSchema.tables[tableIndex] = newTable;
      }
      
      return newSchema;
    });
  };

  const handleRemoveIndex = (tableName: string, indexIndex: number) => {
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      const tableIndex = newSchema.tables.findIndex((t) => t.name === tableName);
      if (tableIndex === -1) return prevSchema;
      
      const newTable = { ...newSchema.tables[tableIndex] };
      const newIndexes = [...newTable.indexes];
      
      if (indexIndex >= 0 && indexIndex < newIndexes.length) {
        newIndexes.splice(indexIndex, 1);
        newTable.indexes = newIndexes;
        newSchema.tables = [...newSchema.tables];
        newSchema.tables[tableIndex] = newTable;
      }
      
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

  const handleGenerateSchema = async () => {
    if (!selectedDatabase) return;

    setIsGenerating(true);
    setGenerateMessage(null);

    try {
      let ddl: string;
      let sqlFilename: string;
      let undoDdl: string | undefined;
      let undoFilename: string | undefined;

      if (selectedDatabase === DatabaseType.FLYWAY) {
        // Import FlywayGenerator dynamically
        const { FlywayGenerator } = await import('@/lib/ddl-generator');
        
        const flyway = new FlywayGenerator({
          databaseType: flywayBaseDb,
          version: flywayVersion,
          description: flywayDescription,
          includeUndo,
        });

        const migration = flyway.generateFlywayMigration(mutableSchema);
        ddl = migration.content;
        sqlFilename = migration.filename;
        undoDdl = migration.undoContent;
        undoFilename = migration.undoFilename;
      } else {
        // Generate DDL using the appropriate generator
        ddl = DDLGeneratorFactory.generateDDL(mutableSchema, selectedDatabase);

        // Extract filename without extension
        const filenameWithoutExt = filename.replace(/\.dbs$/, '');
        sqlFilename = `${filenameWithoutExt}-${selectedDatabase}.sql`;
      }

      // Save the generated SQL file
      const response = await fetch('/api/save-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: sqlFilename,
          content: ddl,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Save undo migration if present
        if (undoDdl && undoFilename) {
          await fetch('/api/save-sql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename: undoFilename,
              content: undoDdl,
            }),
          });
          setGenerateMessage(`✓ Generated ${sqlFilename} and ${undoFilename} successfully`);
        } else {
          setGenerateMessage(`✓ Generated ${sqlFilename} successfully`);
        }
        
        setTimeout(() => {
          setGenerateMessage(null);
          setIsGenerateSchemaDialogOpen(false);
          setSelectedDatabase(null);
        }, 2000);
      } else {
        setGenerateMessage(`✗ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Generate error:', error);
      setGenerateMessage('✗ Failed to generate schema');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTable = () => {
    if (!newTableName.trim()) return;

    // Calculate center of viewport
    const canvas = canvasRef.current;
    if (!canvas) return;

    const viewportCenterX = (canvas.scrollLeft + canvas.clientWidth / 2 - pan.x) / zoom;
    const viewportCenterY = (canvas.scrollTop + canvas.clientHeight / 2 - pan.y) / zoom;

    const tableName = newTableName.trim();

    // Check if table already exists
    if (mutableSchema.tables.some(t => t.name === tableName)) {
      alert('A table with this name already exists!');
      return;
    }

    // Create new table
    const newTable: Table = {
      name: tableName,
      schema: mutableSchema.schemaName,
      columns: [
        {
          name: 'id',
          type: 'INT',
          mandatory: true,
        }
      ],
      indexes: [
        {
          name: `pk_${tableName}`,
          unique: 'PRIMARY_KEY',
          columns: ['id'],
        }
      ],
      foreignKeys: [],
    };

    // Add table to schema
    setMutableSchema((prevSchema) => {
      const newSchema = { ...prevSchema };
      newSchema.tables = [...newSchema.tables, newTable];

      // Add to layout
      const newLayouts = [...newSchema.layouts];
      const currentLayout = { ...newLayouts[layoutIndex] };
      const newEntities = [...currentLayout.entities];

      newEntities.push({
        name: tableName,
        schema: mutableSchema.schemaName,
        color: 'FFFFFF',
        x: Math.round(viewportCenterX),
        y: Math.round(viewportCenterY),
      });

      currentLayout.entities = newEntities;
      newLayouts[layoutIndex] = currentLayout;
      newSchema.layouts = newLayouts;

      return newSchema;
    });

    // Update table positions
    setTablePositions((prev) => {
      const newPositions = new Map(prev);
      newPositions.set(tableName, { x: Math.round(viewportCenterX), y: Math.round(viewportCenterY) });
      return newPositions;
    });

    // Set as active table
    setActiveTable(tableName);

    // Reset and close dialog
    setNewTableName('');
    setIsAddTableDialogOpen(false);
  };

  // Pan functionality
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2 || (e.button === 0 && e.ctrlKey)) {
      // Right mouse button or Ctrl + left click
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    } else if (e.button === 0 && e.target === e.currentTarget) {
      // Left click on canvas background (not on a table)
      setActiveTable(null);
      // Start panning when clicking on empty canvas area
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
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
        <button
          onClick={() => setIsAddTableDialogOpen(true)}
          className="w-full px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded"
        >
          + Add Table
        </button>
        <button
          onClick={() => setIsGenerateSchemaDialogOpen(true)}
          className="w-full px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded"
        >
          Generate Schema
        </button>
        {saveMessage && (
          <div className={`text-xs text-center py-1 rounded ${saveMessage.startsWith('✓') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
            {saveMessage}
          </div>
        )}
        <div className="text-xs text-gray-400 mt-2 pt-2 border-t">
          Ctrl+Scroll: Zoom<br/>
          Right-Click+Drag: Pan
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-full overflow-auto"
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          cursor: isPanning ? "grabbing" : "grab",
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
          <RelationshipLines 
            tables={mutableSchema.tables} 
            tablePositions={tablePositions}
            tableColors={new Map(layout?.entities.map(e => [e.name, e.color]) || [])}
            selectedTable={activeTable}
          />

          {/* Render tables */}
          {mutableSchema.tables.map((table) => {
            const position = tablePositions.get(table.name);
            if (!position) return null;

            // Calculate relationship label and dimming
            let relationshipLabel = "";
            let isDimmed = false;
            if (activeTable) {
              // Check if this table has a FK to the selected table (selected table is PK)
              const hasFKToSelected = table.foreignKeys.some(fk => fk.toTable === activeTable);
              if (hasFKToSelected) {
                relationshipLabel = "(FK)";
              }
              
              // Check if the selected table has a FK to this table (this table is PK)
              const selectedTableObj = mutableSchema.tables.find(t => t.name === activeTable);
              const selectedHasFKToThis = selectedTableObj?.foreignKeys.some(fk => fk.toTable === table.name);
              if (selectedHasFKToThis) {
                relationshipLabel = "(PK)";
              }
              
              // Dim tables that are not related to the selected table
              isDimmed = table.name !== activeTable && !hasFKToSelected && !selectedHasFKToThis;
            }

            return (
              <TableNode
                key={table.name}
                table={table}
                x={position.x}
                y={position.y}
                color={getTableColor(table.name)}
                isActive={activeTable === table.name}
                isSelected={activeTable === table.name}
                isDimmed={isDimmed}
                relationshipLabel={relationshipLabel}
                zoom={zoom}
                pan={pan}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onClick={handleTableClick}
                onMoveColumnUp={handleMoveColumnUp}
                onMoveColumnDown={handleMoveColumnDown}
                onRemoveColumn={handleRemoveColumn}
                onAddColumn={handleAddColumn}
                onEditColumn={handleEditColumn}
                onDeleteTable={handleDeleteTable}
                onEditTable={handleEditTable}
                onAddForeignKey={handleAddForeignKey}
                onEditForeignKey={handleEditForeignKey}
                onRemoveForeignKey={handleRemoveForeignKey}
                onAddIndex={handleAddIndex}
                onEditIndex={handleEditIndex}
                onRemoveIndex={handleRemoveIndex}
                allTables={mutableSchema.tables}
              />
            );
          })}
        </div>
      </div>
      {/* Add Table Dialog */}
      <Dialog open={isAddTableDialogOpen} onOpenChange={setIsAddTableDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
            <DialogDescription>
              Enter a name for the new table. It will be created with a default ID column.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Table Name</label>
              <input
                type="text"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="table_name"
                className="w-full px-3 py-2 border rounded-md text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTable();
                }}
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter>
            <button
              onClick={() => {
                setIsAddTableDialogOpen(false);
                setNewTableName('');
              }}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTable}
              disabled={!newTableName.trim()}
              className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Table
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Generate Schema Dialog */}
      <Dialog open={isGenerateSchemaDialogOpen} onOpenChange={setIsGenerateSchemaDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Database Schema</DialogTitle>
            <DialogDescription>
              Select a database type to generate DDL script for your schema. The SQL file will be saved in the schema folder.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Database Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  DatabaseType.POSTGRESQL,
                  DatabaseType.MYSQL,
                  DatabaseType.MARIADB,
                  DatabaseType.ORACLE,
                  DatabaseType.FLYWAY,
                ].map((dbType) => (
                  <button
                    key={dbType}
                    onClick={() => setSelectedDatabase(dbType)}
                    className={`px-4 py-3 border rounded-md text-sm font-medium transition-colors ${
                      selectedDatabase === dbType
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-white hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    {dbType}
                  </button>
                ))}
              </div>
            </div>
            
            {selectedDatabase === DatabaseType.FLYWAY && (
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Base Database</label>
                  <select
                    value={flywayBaseDb}
                    onChange={(e) => setFlywayBaseDb(e.target.value as DatabaseType)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value={DatabaseType.POSTGRESQL}>PostgreSQL</option>
                    <option value={DatabaseType.MYSQL}>MySQL</option>
                    <option value={DatabaseType.MARIADB}>MariaDB</option>
                    <option value={DatabaseType.ORACLE}>Oracle</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Version</label>
                    <input
                      type="text"
                      value={flywayVersion}
                      onChange={(e) => setFlywayVersion(e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <input
                      type="text"
                      value={flywayDescription}
                      onChange={(e) => setFlywayDescription(e.target.value)}
                      placeholder="initial_schema"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeUndo"
                    checked={includeUndo}
                    onChange={(e) => setIncludeUndo(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="includeUndo" className="text-sm">
                    Include undo migration (Flyway Teams/Enterprise)
                  </label>
                </div>
              </div>
            )}
            
            {generateMessage && (
              <div className={`text-xs text-center py-2 rounded ${
                generateMessage.startsWith('✓') 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-red-600 bg-red-50'
              }`}>
                {generateMessage}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <button
              onClick={() => {
                setIsGenerateSchemaDialogOpen(false);
                setSelectedDatabase(null);
                setGenerateMessage(null);
              }}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateSchema}
              disabled={!selectedDatabase || isGenerating}
              className="px-4 py-2 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate DDL'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
