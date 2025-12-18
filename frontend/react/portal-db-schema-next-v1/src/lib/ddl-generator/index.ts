import { Schema } from '../schema-parser';
import { DDLGenerator, DatabaseType } from './types';
import { PostgreSQLGenerator } from './postgresql';
import { MySQLGenerator } from './mysql';
import { MariaDBGenerator } from './mariadb';
import { OracleGenerator } from './oracle';

/**
 * Factory class to get the appropriate DDL generator for a database type
 */
export class DDLGeneratorFactory {
  private static generators: Map<DatabaseType, DDLGenerator> = new Map<DatabaseType, DDLGenerator>([
    [DatabaseType.POSTGRESQL, new PostgreSQLGenerator() as DDLGenerator],
    [DatabaseType.MYSQL, new MySQLGenerator() as DDLGenerator],
    [DatabaseType.MARIADB, new MariaDBGenerator() as DDLGenerator],
    [DatabaseType.ORACLE, new OracleGenerator() as DDLGenerator],
  ]);

  /**
   * Get a DDL generator for the specified database type
   */
  static getGenerator(databaseType: DatabaseType): DDLGenerator {
    const generator = this.generators.get(databaseType);
    if (!generator) {
      throw new Error(`No DDL generator found for database type: ${databaseType}`);
    }
    return generator;
  }

  /**
   * Generate DDL for a schema using the specified database type
   */
  static generateDDL(schema: Schema, databaseType: DatabaseType): string {
    const generator = this.getGenerator(databaseType);
    return generator.generateDDL(schema);
  }

  /**
   * Get all supported database types
   */
  static getSupportedDatabases(): DatabaseType[] {
    return Array.from(this.generators.keys());
  }
}

// Export everything for convenience
export * from './types';
export { PostgreSQLGenerator } from './postgresql';
export { MySQLGenerator } from './mysql';
export { MariaDBGenerator } from './mariadb';
export { OracleGenerator } from './oracle';
export { FlywayGenerator } from './flyway';
export type { FlywayMigrationOptions, FlywayMigrationResult } from './flyway';
