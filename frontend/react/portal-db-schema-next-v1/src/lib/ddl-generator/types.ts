import { Schema, Table, Column, Index, ForeignKey } from '../schema-parser';

export enum DatabaseType {
  POSTGRESQL = 'PostgreSQL',
  MARIADB = 'MariaDB',
  MYSQL = 'MySQL',
  ORACLE = 'Oracle',
  FLYWAY = 'Flyway',
}

export interface DDLGenerator {
  /**
   * Generate the complete DDL for the entire schema
   */
  generateDDL(schema: Schema): string;
  
  /**
   * Generate DDL for a single table
   */
  generateTableDDL(table: Table): string;
  
  /**
   * Map generic column type to database-specific type
   */
  mapColumnType(column: Column): string;
  
  /**
   * Generate column definition
   */
  generateColumnDefinition(column: Column): string;
  
  /**
   * Generate index DDL
   */
  generateIndexDDL(table: Table, index: Index): string;
  
  /**
   * Generate foreign key constraint
   */
  generateForeignKeyDDL(table: Table, foreignKey: ForeignKey): string;
}
