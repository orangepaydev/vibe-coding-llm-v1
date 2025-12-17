import { Schema, Table, Column, Index, ForeignKey } from '../schema-parser';
import { DDLGenerator } from './types';

export class OracleGenerator implements DDLGenerator {
  generateDDL(schema: Schema): string {
    const ddl: string[] = [];
    
    // Add header comment
    ddl.push(`-- Oracle DDL for schema: ${schema.schemaName}`);
    ddl.push(`-- Generated from project: ${schema.projectName}`);
    ddl.push(`-- Generated on: ${new Date().toISOString()}`);
    ddl.push('');
    
    // Note: Oracle doesn't have CREATE SCHEMA like PostgreSQL
    // Schemas in Oracle are user accounts
    ddl.push(`-- Note: In Oracle, schemas are equivalent to users.`);
    ddl.push(`-- Create user if needed: CREATE USER ${schema.schemaName} IDENTIFIED BY password;`);
    ddl.push(`-- Grant necessary privileges: GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE TO ${schema.schemaName};`);
    ddl.push('');
    
    // Generate sequences for auto-increment columns
    schema.tables.forEach(table => {
      table.columns.forEach(col => {
        if (col.identity) {
          const seqName = `${table.name}_${col.name}_seq`;
          ddl.push(`CREATE SEQUENCE ${this.escapeIdentifier(seqName)}`);
          ddl.push(`  START WITH 1`);
          ddl.push(`  INCREMENT BY 1`);
          ddl.push(`  NOCACHE`);
          ddl.push(`  NOCYCLE;`);
          ddl.push('');
        }
      });
    });
    
    // Generate table DDLs
    schema.tables.forEach(table => {
      ddl.push(this.generateTableDDL(table));
      ddl.push('');
    });
    
    // Generate triggers for auto-increment columns
    schema.tables.forEach(table => {
      table.columns.forEach(col => {
        if (col.identity) {
          const seqName = `${table.name}_${col.name}_seq`;
          const triggerName = `${table.name}_${col.name}_trg`;
          ddl.push(`CREATE OR REPLACE TRIGGER ${this.escapeIdentifier(triggerName)}`);
          ddl.push(`  BEFORE INSERT ON ${this.escapeIdentifier(table.name)}`);
          ddl.push(`  FOR EACH ROW`);
          ddl.push(`BEGIN`);
          ddl.push(`  IF :NEW.${this.escapeIdentifier(col.name)} IS NULL THEN`);
          ddl.push(`    SELECT ${this.escapeIdentifier(seqName)}.NEXTVAL INTO :NEW.${this.escapeIdentifier(col.name)} FROM DUAL;`);
          ddl.push(`  END IF;`);
          ddl.push(`END;`);
          ddl.push(`/`);
          ddl.push('');
        }
      });
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
    
    // Table and column comments
    ddl.push('-- Table and Column Comments');
    schema.tables.forEach(table => {
      if (table.comment) {
        ddl.push(`COMMENT ON TABLE ${this.escapeIdentifier(table.name)} IS '${this.escapeString(table.comment)}';`);
      }
      table.columns.forEach(col => {
        if (col.comment) {
          ddl.push(`COMMENT ON COLUMN ${this.escapeIdentifier(table.name)}.${this.escapeIdentifier(col.name)} IS '${this.escapeString(col.comment)}';`);
        }
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
    
    return lines.join('\n');
  }
  
  mapColumnType(column: Column): string {
    const type = column.type.toUpperCase();
    const length = column.length;
    
    // Map MySQL/generic types to Oracle types
    switch (type) {
      case 'INT':
      case 'INTEGER':
        return 'NUMBER(10)';
      case 'BIGINT':
        return 'NUMBER(19)';
      case 'SMALLINT':
        return 'NUMBER(5)';
      case 'TINYINT':
        return 'NUMBER(3)';
      case 'VARCHAR':
        return length ? `VARCHAR2(${length})` : 'VARCHAR2(255)';
      case 'CHAR':
        return length ? `CHAR(${length})` : 'CHAR(1)';
      case 'TEXT':
      case 'MEDIUMTEXT':
      case 'LONGTEXT':
        return 'CLOB';
      case 'DATETIME':
      case 'TIMESTAMP':
        return 'TIMESTAMP';
      case 'DATE':
        return 'DATE';
      case 'TIME':
        // Oracle doesn't have a TIME type, use TIMESTAMP or INTERVAL
        return 'TIMESTAMP';
      case 'DECIMAL':
      case 'NUMERIC':
        return length ? `NUMBER(${length})` : 'NUMBER(10,0)';
      case 'FLOAT':
        return 'FLOAT';
      case 'DOUBLE':
        return 'BINARY_DOUBLE';
      case 'BOOLEAN':
      case 'BOOL':
        // Oracle doesn't have native BOOLEAN for table columns
        return 'NUMBER(1)';
      case 'BLOB':
      case 'MEDIUMBLOB':
      case 'LONGBLOB':
        return 'BLOB';
      case 'JSON':
        // Oracle 12c+ has native JSON support
        return 'CLOB CHECK (${column.name} IS JSON)';
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
    
    if (column.defaultValue && !column.identity) {
      // Handle special default values
      let defaultVal = column.defaultValue;
      if (defaultVal.toLowerCase().includes('current_timestamp')) {
        parts.push('DEFAULT CURRENT_TIMESTAMP');
      } else if (defaultVal.toLowerCase() === 'now()') {
        parts.push('DEFAULT CURRENT_TIMESTAMP');
      } else if (defaultVal.toLowerCase() === 'sysdate') {
        parts.push('DEFAULT SYSDATE');
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
      // Convert MySQL ON DELETE/UPDATE syntax to Oracle
      let options = foreignKey.options.toUpperCase();
      // Oracle supports ON DELETE CASCADE, ON DELETE SET NULL, but not ON UPDATE
      options = options.replace(/ON UPDATE [A-Z\s]+/g, '').trim();
      if (options) {
        ddl += ` ${options}`;
      }
    }
    
    ddl += ';';
    
    return ddl;
  }
  
  private escapeIdentifier(identifier: string): string {
    // Oracle identifiers can be quoted with double quotes
    // Uppercase unquoted identifiers
    return `"${identifier.replace(/"/g, '""')}"`;
  }
  
  private escapeString(str: string): string {
    return str.replace(/'/g, "''");
  }
}
