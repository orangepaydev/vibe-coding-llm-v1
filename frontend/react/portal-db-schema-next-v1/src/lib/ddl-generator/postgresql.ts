import { Schema, Table, Column, Index, ForeignKey } from '../schema-parser';
import { DDLGenerator } from './types';

export class PostgreSQLGenerator implements DDLGenerator {
  generateDDL(schema: Schema): string {
    const ddl: string[] = [];
    
    // Add header comment
    ddl.push(`-- PostgreSQL DDL for schema: ${schema.schemaName}`);
    ddl.push(`-- Generated from project: ${schema.projectName}`);
    ddl.push(`-- Generated on: ${new Date().toISOString()}`);
    ddl.push('');
    
    // Create schema if needed
    if (schema.schemaName && schema.schemaName !== 'public') {
      ddl.push(`CREATE SCHEMA IF NOT EXISTS ${this.escapeIdentifier(schema.schemaName)};`);
      ddl.push(`SET search_path TO ${this.escapeIdentifier(schema.schemaName)};`);
      ddl.push('');
    }
    
    // Generate table DDLs
    schema.tables.forEach(table => {
      ddl.push(this.generateTableDDL(table));
      ddl.push('');
    });
    
    // Generate indexes (excluding primary keys and unique constraints already in table)
    schema.tables.forEach(table => {
      table.indexes.forEach(index => {
        if (index.unique !== 'PRIMARY_KEY' && index.unique !== 'UNIQUE') {
          ddl.push(this.generateIndexDDL(table, index));
        }
      });
    });
    
    if (schema.tables.some(t => t.indexes.some(i => i.unique !== 'PRIMARY_KEY' && i.unique !== 'UNIQUE'))) {
      ddl.push('');
    }
    
    // Generate foreign keys
    schema.tables.forEach(table => {
      table.foreignKeys.forEach(fk => {
        ddl.push(this.generateForeignKeyDDL(table, fk));
      });
    });
    
    return ddl.join('\n');
  }
  
  generateTableDDL(table: Table): string {
    const lines: string[] = [];
    const tableName = this.escapeIdentifier(table.name);
    
    lines.push(`CREATE TABLE ${tableName} (`);
    
    // Columns
    const columnDefs = table.columns.map(col => '  ' + this.generateColumnDefinition(col));
    
    // Primary key constraint
    const pkIndex = table.indexes.find(idx => idx.unique === 'PRIMARY_KEY');
    if (pkIndex && pkIndex.columns.length > 0) {
      const pkColumns = pkIndex.columns.map(col => this.escapeIdentifier(col)).join(', ');
      columnDefs.push(`  CONSTRAINT ${this.escapeIdentifier(pkIndex.name)} PRIMARY KEY (${pkColumns})`);
    }
    
    // Unique constraints
    const uniqueIndexes = table.indexes.filter(idx => idx.unique === 'UNIQUE');
    uniqueIndexes.forEach(idx => {
      const uniqueColumns = idx.columns.map(col => this.escapeIdentifier(col)).join(', ');
      columnDefs.push(`  CONSTRAINT ${this.escapeIdentifier(idx.name)} UNIQUE (${uniqueColumns})`);
    });
    
    lines.push(columnDefs.join(',\n'));
    lines.push(');');
    
    // Table comment
    if (table.comment) {
      lines.push('');
      lines.push(`COMMENT ON TABLE ${tableName} IS '${this.escapeString(table.comment)}';`);
    }
    
    // Column comments
    table.columns.forEach(col => {
      if (col.comment) {
        lines.push(`COMMENT ON COLUMN ${tableName}.${this.escapeIdentifier(col.name)} IS '${this.escapeString(col.comment)}';`);
      }
    });
    
    return lines.join('\n');
  }
  
  mapColumnType(column: Column): string {
    const type = column.type.toUpperCase();
    const length = column.length;
    
    // Map MySQL/generic types to PostgreSQL types
    switch (type) {
      case 'INT':
      case 'INTEGER':
        if (column.identity) return 'SERIAL';
        return 'INTEGER';
      case 'BIGINT':
        if (column.identity) return 'BIGSERIAL';
        return 'BIGINT';
      case 'SMALLINT':
        if (column.identity) return 'SMALLSERIAL';
        return 'SMALLINT';
      case 'TINYINT':
        return 'SMALLINT';
      case 'VARCHAR':
        return length ? `VARCHAR(${length})` : 'VARCHAR';
      case 'CHAR':
        return length ? `CHAR(${length})` : 'CHAR(1)';
      case 'TEXT':
      case 'LONGTEXT':
      case 'MEDIUMTEXT':
        return 'TEXT';
      case 'DATETIME':
      case 'TIMESTAMP':
        return 'TIMESTAMP';
      case 'DATE':
        return 'DATE';
      case 'TIME':
        return 'TIME';
      case 'DECIMAL':
      case 'NUMERIC':
        return length ? `DECIMAL(${length})` : 'DECIMAL';
      case 'FLOAT':
        return 'REAL';
      case 'DOUBLE':
        return 'DOUBLE PRECISION';
      case 'BOOLEAN':
      case 'BOOL':
        return 'BOOLEAN';
      case 'BLOB':
      case 'LONGBLOB':
      case 'MEDIUMBLOB':
        return 'BYTEA';
      case 'JSON':
        return 'JSONB';
      default:
        return length ? `${type}(${length})` : type;
    }
  }
  
  generateColumnDefinition(column: Column): string {
    const parts: string[] = [];
    
    parts.push(this.escapeIdentifier(column.name));
    parts.push(this.mapColumnType(column));
    
    if (column.mandatory) {
      parts.push('NOT NULL');
    }
    
    if (column.defaultValue) {
      // Handle special default values
      let defaultVal = column.defaultValue;
      if (defaultVal.toLowerCase().includes('current_timestamp')) {
        parts.push('DEFAULT CURRENT_TIMESTAMP');
      } else if (defaultVal.toLowerCase() === 'now()') {
        parts.push('DEFAULT NOW()');
      } else if (!isNaN(Number(defaultVal))) {
        parts.push(`DEFAULT ${defaultVal}`);
      } else {
        parts.push(`DEFAULT '${this.escapeString(defaultVal)}'`);
      }
    }
    
    return parts.join(' ');
  }
  
  generateIndexDDL(table: Table, index: Index): string {
    const indexName = this.escapeIdentifier(index.name);
    const tableName = this.escapeIdentifier(table.name);
    const columns = index.columns.map(col => this.escapeIdentifier(col)).join(', ');
    
    return `CREATE INDEX ${indexName} ON ${tableName} (${columns});`;
  }
  
  generateForeignKeyDDL(table: Table, foreignKey: ForeignKey): string {
    const tableName = this.escapeIdentifier(table.name);
    const fkName = this.escapeIdentifier(foreignKey.name);
    const columns = foreignKey.columns.map(col => this.escapeIdentifier(col.name)).join(', ');
    const refTable = this.escapeIdentifier(foreignKey.toTable);
    const refColumns = foreignKey.columns.map(col => this.escapeIdentifier(col.pk)).join(', ');
    
    let ddl = `ALTER TABLE ${tableName} ADD CONSTRAINT ${fkName} `;
    ddl += `FOREIGN KEY (${columns}) REFERENCES ${refTable} (${refColumns})`;
    
    if (foreignKey.options) {
      ddl += ` ${foreignKey.options}`;
    }
    
    ddl += ';';
    
    return ddl;
  }
  
  private escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }
  
  private escapeString(str: string): string {
    return str.replace(/'/g, "''");
  }
}
