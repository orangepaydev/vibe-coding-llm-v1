import { SqlInterface, TxnState, DBType } from "./types"
import mariadb from "mariadb";

export class MariadbConnection implements SqlInterface {
    connection: mariadb.PoolConnection
    txnState: TxnState
    connectionSequence: number
    dbType: DBType = DBType.Mariadb
    
    constructor(connection: mariadb.PoolConnection, connectionSequence: number) {
        this.connection = connection
        this.txnState = TxnState.NO_TXN
        this.connectionSequence = connectionSequence
    }

    async close(): Promise<void> {
        console.log("Connection - releasing", this.connectionSequence)
        try {
            if (this.txnState == TxnState.BEGIN) {
                await this.connection.rollback()
            }
    
        } finally {
            console.log("Connection - released", this.connectionSequence)
            await this.connection.release() // need to await as mariadb does return Promise<void>
        }
    }

    async beginTransaction(): Promise<void> {
        await this.connection.beginTransaction()
        this.txnState = TxnState.BEGIN
    }

    async commit(): Promise<void> {
        if (this.txnState != TxnState.BEGIN) {
            // no transaction, do not need to proceed
            return
        }

        await this.connection.commit()
        this.txnState = TxnState.END
    }

    async rollback(): Promise<void> {
        if (this.txnState != TxnState.BEGIN) {
            // no transaction, do not need to proceed
            return
        }

        await this.connection.rollback()
        this.txnState = TxnState.END
    }

    async query<T = any>(sql: string, values?: any): Promise<T[]> {
        const result = await this.connection.query<T[]>(sql, values)

        if (Array.isArray(result)) {
          return result.length === 0 ? [] : result.map((row: any) => row as T)
        }
    
        // If it is an INSERT/UPDATE/DELETE statement, result will be a ResultSetHeader
        const resultSet = result as { affectedRows: number; insertId: number; warningStatus: number; }
        if (resultSet.affectedRows > 0) {
          // console.log(`Query affected ${resultSet.affectedRows} rows`)
          return [resultSet] as T[]
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
        const result = await this.querySingle("SELECT LAST_INSERT_ID() as LAST_INSERT_ID")
        return typeof result.LAST_INSERT_ID === "number" ? result.LAST_INSERT_ID : Number(result.LAST_INSERT_ID)
    }
}