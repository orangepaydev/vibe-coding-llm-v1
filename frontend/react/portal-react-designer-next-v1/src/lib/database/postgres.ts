import { SqlInterface, TxnState, DBType } from "./types"
import pg from "pg";

export class PostgresConnection implements SqlInterface {
    connection: pg.PoolClient
    txnState: TxnState
    connectionSequence: number
    private lastInsertId: number = 0
    dbType: DBType = DBType.Postgresql
    
    constructor(connection: pg.PoolClient, connectionSequence: number) {
        this.connection = connection
        this.txnState = TxnState.NO_TXN
        this.connectionSequence = connectionSequence
    }

    async close(): Promise<void> {
        console.log("Connection - releasing", this.connectionSequence)
        try {
            if (this.txnState == TxnState.BEGIN) {
                await this.connection.query('ROLLBACK')
            }
    
        } finally {
            console.log("Connection - released", this.connectionSequence)
            this.connection.release() // no need to await as postgres returns void
        }
    }

    async beginTransaction(): Promise<void> {
        await this.connection.query('BEGIN')
        this.txnState = TxnState.BEGIN
    }

    async commit(): Promise<void> {
        if (this.txnState != TxnState.BEGIN) {
            // no transaction, do not need to proceed
            return
        }

        await this.connection.query('COMMIT')
        this.txnState = TxnState.END
    }

    async rollback(): Promise<void> {
        if (this.txnState != TxnState.BEGIN) {
            // no transaction, do not need to proceed
            return
        }

        await this.connection.query('ROLLBACK')
        this.txnState = TxnState.END
    }

    async query<T = any>(sql: string, values?: any): Promise<T[]> {
        let pgValues: any[] = []

        if (values !== undefined && values !== null) {
            pgValues = Array.isArray(values) ? values : [values]
        }

        // Convert ? placeholders to $1, $2, etc. for Postgres
        let paramIndex = 0;
        let pgSql = sql.replace(/\?/g, () => {
            paramIndex++;
            return `$${paramIndex}`;
        });
        
        // Auto-append RETURNING id for INSERTs to support getLastRecordId()
        // Check if it starts with INSERT (ignoring whitespace/case) and doesn't already have RETURNING
        if (/^\s*INSERT\b/i.test(pgSql) && !/RETURNING\b/i.test(pgSql)) {
            pgSql += " RETURNING id"
        }
        
        const result = await this.connection.query(pgSql, pgValues)

        // 1. Handle commands that return rows (SELECT, WITH, INSERT...RETURNING)
        if (result.rows.length > 0) {
            // Capture lastInsertId if this was an INSERT
            if (result.command === 'INSERT') {
                this.lastInsertId = result.rows[0].id
            }
            return result.rows as T[]
        }
        
        // 2. Handle DML Commands that DO NOT RETURN ROWS (UPDATE, DELETE, or INSERT without RETURNING)
        const isDML = ['UPDATE', 'DELETE', 'INSERT'].includes(result.command)
        
        if (isDML && result.rowCount && result.rowCount > 0) {
            console.log(`Query affected ${result.rowCount} rows`)
            // Return object with affectedRows to match other adapters (MariaDB/MySQL)
            return [{ affectedRows: result.rowCount || 0 }] as unknown as T[]
        }
    
        console.warn("Query executed but affected 0 rows")
        return []
    }

    async queryParameterized<T = any>(sql: string, searchTerm: string[], searchValue: string[]): Promise<T[]> {
        if (searchTerm.length > 0) {
            sql = sql + " WHERE " + searchTerm.join(" AND ")
        }
        
        return await this.query<T>(sql, searchValue)
    }

    async queryParameterized_wherePostfixed<T = any>(sql: string, searchTerm: string[], searchValue: string[]): Promise<T[]> {
        if (searchTerm.length > 0) {
            sql = sql + " AND " + searchTerm.join(" AND ")
        }
        
        return await this.query<T>(sql, searchValue)
    }

    async querySingle<T = any>(sql: string, values?: any): Promise<T> {
        const result = await this.query<T>(sql, values)
        if (result.length == 0) {
            throw new Error("query does not return any record")
        }

        return result[0]
    }

    async getLastRecordId(): Promise<number> {
        return this.lastInsertId
    }
}