import { Schema, Table, Column, Index, ForeignKey } from '../schema-parser';
import { DDLGenerator } from './types';

export class MySQLGenerator implements DDLGenerator {
  generateDDL(schema: Schema): string {
    const ddl: string[] = [];
    
    // Add header comment
    ddl.push(`-- MySQL DDL for schema: ${schema.schemaName}`);
    ddl.push(`-- Generated from project: ${schema.projectName}`);
    ddl.push(`-- Generated on: ${new Date().toISOString()}`);
    ddl.push('');
    
    // Create database if needed
    if (schema.schemaName) {
      ddl.push(`CREATE DATABASE IF NOT EXISTS \`${schema.schemaName}\`;`);
      ddl.push(`USE \`${schema.schemaName}\`;`);
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
      columnDefs.push(`  PRIMARY KEY (${pkColumns})`);
    }
    
    // Unique constraints
    const uniqueIndexes = table.indexes.filter(idx => idx.unique === 'UNIQUE');
    uniqueIndexes.forEach(idx => {
      const uniqueColumns = idx.columns.map(col => this.escapeIdentifier(col)).join(', ');
      columnDefs.push(`  UNIQUE KEY ${this.escapeIdentifier(idx.name)} (${uniqueColumns})`);
    });
    
    lines.push(columnDefs.join(',\n'));
    lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
    
    // Table comment
    if (table.comment) {
      lines[lines.length - 1] = lines[lines.length - 1].replace(';', ` COMMENT='${this.escapeString(table.comment)}';`);
    }
    
    return lines.join('\n');
  }
  
  mapColumnType(column: Column): string {
    const type = column.type.toUpperCase();
    const length = column.length;
    
    // MySQL type mapping (mostly direct as schema is MySQL-based)
    switch (type) {
      case 'INT':
      case 'INTEGER':
        return length ? `INT(${length})` : 'INT';
      case 'BIGINT':
        return length ? `BIGINT(${length})` : 'BIGINT';
      case 'SMALLINT':
        return length ? `SMALLINT(${length})` : 'SMALLINT';
      case 'TINYINT':
        return length ? `TINYINT(${length})` : 'TINYINT';
      case 'VARCHAR':
        return length ? `VARCHAR(${length})` : 'VARCHAR(255)';
      case 'CHAR':
        return length ? `CHAR(${length})` : 'CHAR(1)';
      case 'TEXT':
        return 'TEXT';
      case 'MEDIUMTEXT':
        return 'MEDIUMTEXT';
      case 'LONGTEXT':
        return 'LONGTEXT';
      case 'DATETIME':
        return 'DATETIME';
      case 'TIMESTAMP':
        return 'TIMESTAMP';
      case 'DATE':
        return 'DATE';
      case 'TIME':
        return 'TIME';
      case 'DECIMAL':
      case 'NUMERIC':
        return length ? `DECIMAL(${length})` : 'DECIMAL(10,0)';
      case 'FLOAT':
        return 'FLOAT';
      case 'DOUBLE':
        return 'DOUBLE';
      case 'BOOLEAN':
      case 'BOOL':
        return 'TINYINT(1)';
      case 'BLOB':
        return 'BLOB';
      case 'MEDIUMBLOB':
        return 'MEDIUMBLOB';
      case 'LONGBLOB':
        return 'LONGBLOB';
      case 'JSON':
        return 'JSON';
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
    } else {
      parts.push('NULL');
    }
    
    if (column.identity && column.identity.includes('AUTO_INCREMENT')) {
      parts.push('AUTO_INCREMENT');
    }
    
    if (column.defaultValue) {
      // Handle special default values
      let defaultVal = column.defaultValue;
      if (defaultVal.toLowerCase().includes('current_timestamp')) {
        parts.push('DEFAULT CURRENT_TIMESTAMP');
      } else if (defaultVal.toLowerCase() === 'now()') {
        parts.push('DEFAULT CURRENT_TIMESTAMP');
      } else if (!isNaN(Number(defaultVal))) {
        parts.push(`DEFAULT ${defaultVal}`);
      } else {
        parts.push(`DEFAULT '${this.escapeString(defaultVal)}'`);
      }
    }
    
    if (column.comment) {
      parts.push(`COMMENT '${this.escapeString(column.comment)}'`);
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
    return `\`${identifier.replace(/`/g, '``')}\``;
  }
  
  private escapeString(str: string): string {
    return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
  }
}
