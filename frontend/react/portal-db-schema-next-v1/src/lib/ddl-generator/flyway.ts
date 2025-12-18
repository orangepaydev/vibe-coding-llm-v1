import { Schema, Table, Column, Index, ForeignKey } from '../schema-parser';
import { DDLGenerator, DatabaseType } from './types';
import { DDLGeneratorFactory } from './index';

export interface FlywayMigrationOptions {
  /**
   * Base database type for the migration (PostgreSQL, MySQL, etc.)
   */
  databaseType: DatabaseType;
  
  /**
   * Version number for the migration (e.g., "1", "1.0", "001")
   */
  version: string;
  
  /**
   * Description for the migration (will be used in filename and header)
   */
  description?: string;
  
  /**
   * Whether to include undo migration (for Flyway Teams/Enterprise)
   */
  includeUndo?: boolean;
}

export interface FlywayMigrationResult {
  /**
   * Suggested filename for the migration (e.g., V1__initial_schema.sql)
   */
  filename: string;
  
  /**
   * The migration SQL content
   */
  content: string;
  
  /**
   * Undo migration filename (if includeUndo is true)
   */
  undoFilename?: string;
  
  /**
   * Undo migration content (if includeUndo is true)
   */
  undoContent?: string;
}

/**
 * Flyway migration generator
 * Wraps existing DDL generators to create Flyway-compatible migration files
 */
export class FlywayGenerator implements DDLGenerator {
  private baseGenerator: DDLGenerator;
  private options: FlywayMigrationOptions;

  constructor(options: FlywayMigrationOptions) {
    this.options = options;
    this.baseGenerator = DDLGeneratorFactory.getGenerator(options.databaseType);
  }

  /**
   * Generate a complete Flyway migration file
   */
  generateFlywayMigration(schema: Schema): FlywayMigrationResult {
    const description = this.options.description || 'initial_schema';
    const version = this.options.version;
    
    // Generate filename following Flyway naming convention
    // V{version}__{description}.sql
    const filename = `V${version}__${this.sanitizeDescription(description)}.sql`;
    
    // Generate migration content with Flyway header
    const content = this.generateMigrationContent(schema);
    
    const result: FlywayMigrationResult = {
      filename,
      content,
    };
    
    // Generate undo migration if requested
    if (this.options.includeUndo) {
      result.undoFilename = `U${version}__${this.sanitizeDescription(description)}.sql`;
      result.undoContent = this.generateUndoContent(schema);
    }
    
    return result;
  }

  /**
   * Generate the migration content with Flyway header
   */
  private generateMigrationContent(schema: Schema): string {
    const lines: string[] = [];
    
    // Flyway migration header
    lines.push('-- ============================================================================');
    lines.push(`-- Flyway Migration: V${this.options.version}`);
    if (this.options.description) {
      lines.push(`-- Description: ${this.options.description}`);
    }
    lines.push(`-- Database: ${this.options.databaseType}`);
    lines.push(`-- Schema: ${schema.schemaName}`);
    lines.push(`-- Project: ${schema.projectName}`);
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push('-- ============================================================================');
    lines.push('');
    
    // Add migration metadata comments
    lines.push('-- Migration Type: Schema Creation');
    lines.push(`-- Tables: ${schema.tables.length}`);
    lines.push('');
    
    // Generate DDL using base generator
    const ddl = this.baseGenerator.generateDDL(schema);
    lines.push(ddl);
    
    // Add migration footer
    lines.push('');
    lines.push('-- ============================================================================');
    lines.push('-- End of migration');
    lines.push('-- ============================================================================');
    
    return lines.join('\n');
  }

  /**
   * Generate undo migration content
   */
  private generateUndoContent(schema: Schema): string {
    const lines: string[] = [];
    
    // Flyway undo migration header
    lines.push('-- ============================================================================');
    lines.push(`-- Flyway Undo Migration: U${this.options.version}`);
    if (this.options.description) {
      lines.push(`-- Description: Undo ${this.options.description}`);
    }
    lines.push(`-- Database: ${this.options.databaseType}`);
    lines.push(`-- Schema: ${schema.schemaName}`);
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push('-- ============================================================================');
    lines.push('');
    
    lines.push('-- Drop foreign keys first');
    schema.tables.forEach(table => {
      table.foreignKeys.forEach(fk => {
        lines.push(`ALTER TABLE ${this.escapeIdentifier(table.name)} DROP CONSTRAINT ${this.escapeIdentifier(fk.name)};`);
      });
    });
    
    if (schema.tables.some(t => t.foreignKeys.length > 0)) {
      lines.push('');
    }
    
    lines.push('-- Drop tables in reverse order');
    // Reverse order to handle dependencies
    [...schema.tables].reverse().forEach(table => {
      lines.push(`DROP TABLE IF EXISTS ${this.escapeIdentifier(table.name)} CASCADE;`);
    });
    
    lines.push('');
    lines.push('-- ============================================================================');
    lines.push('-- End of undo migration');
    lines.push('-- ============================================================================');
    
    return lines.join('\n');
  }

  /**
   * Sanitize description for use in filename
   */
  private sanitizeDescription(description: string): string {
    return description
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  /**
   * Escape identifier for the specific database
   */
  private escapeIdentifier(identifier: string): string {
    switch (this.options.databaseType) {
      case DatabaseType.POSTGRESQL:
        return `"${identifier}"`;
      case DatabaseType.MYSQL:
      case DatabaseType.MARIADB:
        return `\`${identifier}\``;
      case DatabaseType.ORACLE:
        return `"${identifier.toUpperCase()}"`;
      default:
        return identifier;
    }
  }

  // Implement DDLGenerator interface methods (delegate to base generator)
  
  generateDDL(schema: Schema): string {
    return this.generateMigrationContent(schema);
  }

  generateTableDDL(table: Table): string {
    return this.baseGenerator.generateTableDDL(table);
  }

  mapColumnType(column: Column): string {
    return this.baseGenerator.mapColumnType(column);
  }

  generateColumnDefinition(column: Column): string {
    return this.baseGenerator.generateColumnDefinition(column);
  }

  generateIndexDDL(table: Table, index: Index): string {
    return this.baseGenerator.generateIndexDDL(table, index);
  }

  generateForeignKeyDDL(table: Table, foreignKey: ForeignKey): string {
    return this.baseGenerator.generateForeignKeyDDL(table, foreignKey);
  }
}
