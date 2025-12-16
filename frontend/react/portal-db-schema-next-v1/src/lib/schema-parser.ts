export interface Column {
  name: string;
  type: string;
  length?: string;
  mandatory?: boolean;
  identity?: string;
  comment?: string;
  defo?: string;
}

export interface Index {
  name: string;
  unique: string;
  columns: string[];
}

export interface ForeignKey {
  name: string;
  toSchema: string;
  toTable: string;
  columns: { name: string; pk: string }[];
  options?: string;
}

export interface Table {
  name: string;
  schema: string;
  comment?: string;
  rowCount?: number;
  columns: Column[];
  indexes: Index[];
  foreignKeys: ForeignKey[];
}

export interface EntityLayout {
  schema: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

export interface Group {
  name: string;
  color: string;
  entities: string[];
}

export interface Layout {
  name: string;
  id: string;
  showRelation: string;
  entities: EntityLayout[];
  groups: Group[];
}

export interface Schema {
  projectName: string;
  database: string;
  schemaName: string;
  tables: Table[];
  layouts: Layout[];
}

export function parseSchemaXML(xmlContent: string): Schema {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

  // Get project info
  const projectNode = xmlDoc.querySelector("project");
  const projectName = projectNode?.getAttribute("name") || "";
  const database = projectNode?.getAttribute("database") || "";

  // Get schema info
  const schemaNode = xmlDoc.querySelector("schema");
  const schemaName = schemaNode?.getAttribute("name") || "";

  // Parse tables
  const tables: Table[] = [];
  const tableNodes = xmlDoc.querySelectorAll("schema > table");
  
  tableNodes.forEach((tableNode) => {
    const table: Table = {
      name: tableNode.getAttribute("name") || "",
      schema: schemaName,
      comment: tableNode.querySelector("comment")?.textContent || undefined,
      rowCount: parseInt(tableNode.getAttribute("row_count") || "0"),
      columns: [],
      indexes: [],
      foreignKeys: [],
    };

    // Parse columns
    const columnNodes = tableNode.querySelectorAll(":scope > column");
    columnNodes.forEach((colNode) => {
      const column: Column = {
        name: colNode.getAttribute("name") || "",
        type: colNode.getAttribute("type") || "",
        length: colNode.getAttribute("length") || undefined,
        mandatory: colNode.getAttribute("mandatory") === "y",
        identity: colNode.querySelector("identity")?.textContent || undefined,
        comment: colNode.querySelector("comment")?.textContent || undefined,
        defo: colNode.querySelector("defo")?.textContent || undefined,
      };
      table.columns.push(column);
    });

    // Parse indexes
    const indexNodes = tableNode.querySelectorAll(":scope > index");
    indexNodes.forEach((idxNode) => {
      const index: Index = {
        name: idxNode.getAttribute("name") || "",
        unique: idxNode.getAttribute("unique") || "",
        columns: [],
      };
      const idxColumnNodes = idxNode.querySelectorAll("column");
      idxColumnNodes.forEach((colNode) => {
        index.columns.push(colNode.getAttribute("name") || "");
      });
      table.indexes.push(index);
    });

    // Parse foreign keys
    const fkNodes = tableNode.querySelectorAll(":scope > fk");
    fkNodes.forEach((fkNode) => {
      const fk: ForeignKey = {
        name: fkNode.getAttribute("name") || "",
        toSchema: fkNode.getAttribute("to_schema") || "",
        toTable: fkNode.getAttribute("to_table") || "",
        columns: [],
        options: fkNode.getAttribute("options") || undefined,
      };
      const fkColumnNodes = fkNode.querySelectorAll("fk_column");
      fkColumnNodes.forEach((colNode) => {
        fk.columns.push({
          name: colNode.getAttribute("name") || "",
          pk: colNode.getAttribute("pk") || "",
        });
      });
      table.foreignKeys.push(fk);
    });

    tables.push(table);
  });

  // Parse layouts
  const layouts: Layout[] = [];
  const layoutNodes = xmlDoc.querySelectorAll("layout");
  
  layoutNodes.forEach((layoutNode) => {
    const layout: Layout = {
      name: layoutNode.getAttribute("name") || "",
      id: layoutNode.getAttribute("id") || "",
      showRelation: layoutNode.getAttribute("show_relation") || "",
      entities: [],
      groups: [],
    };

    // Parse entity positions
    const entityNodes = layoutNode.querySelectorAll(":scope > entity");
    entityNodes.forEach((entityNode) => {
      const entity: EntityLayout = {
        schema: entityNode.getAttribute("schema") || "",
        name: entityNode.getAttribute("name") || "",
        color: entityNode.getAttribute("color") || "FFFFFF",
        x: parseInt(entityNode.getAttribute("x") || "0"),
        y: parseInt(entityNode.getAttribute("y") || "0"),
      };
      layout.entities.push(entity);
    });

    // Parse groups
    const groupNodes = layoutNode.querySelectorAll(":scope > group");
    groupNodes.forEach((groupNode) => {
      const group: Group = {
        name: groupNode.getAttribute("name") || "",
        color: groupNode.getAttribute("color") || "EEEEEE",
        entities: [],
      };
      const groupEntityNodes = groupNode.querySelectorAll("entity");
      groupEntityNodes.forEach((entityNode) => {
        group.entities.push(entityNode.getAttribute("name") || "");
      });
      layout.groups.push(group);
    });

    layouts.push(layout);
  });

  return {
    projectName,
    database,
    schemaName,
    tables,
    layouts,
  };
}
