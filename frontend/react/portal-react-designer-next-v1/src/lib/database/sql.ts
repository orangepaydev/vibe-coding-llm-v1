import mysql2 from "mysql2/promise"
import mariadb from "mariadb";
import pg from "pg";
import { DBType, SqlInterface } from "./types";
import { MariadbConnection } from "./mariadb";
import { MysqlConnection } from "./mysql";
import { PostgresConnection } from "./postgres";

class DBConnection {
    mariadbPool: mariadb.Pool | undefined
    mysqlPool: mysql2.Pool | undefined
    pgPool: pg.Pool | undefined
    dbType: DBType
    connectionSequence: number


    constructor() {
      console.log("Initializing DB Connection for " + process.env.DB_TYPE + "...")
      this.connectionSequence = 0
      
      // Validate required environment variables
      if (!process.env.DB_TYPE) {
        throw new Error("DB_TYPE environment variable is not set")
      }
      
      const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PORT', 'DB_DATABASE', 'DB_PASSWORD']
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
      if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
      }
      
        if (process.env.DB_TYPE === "mariadb") {
            this.dbType = DBType.Mariadb
            const mariadbPoolConfig: mariadb.PoolConfig = {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                port: Number(process.env.DB_PORT),
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                connectionLimit: 3,
                idleTimeout: 30  // idleTimeout in seconds - default is 1800 (30 min)
            }
            
            this.mariadbPool = mariadb.createPool(mariadbPoolConfig)
            mariadbPoolConfig.password = ""
            console.log("DBType", this.dbType, "Mariadb pool config", mariadbPoolConfig)
        } else if (process.env.DB_TYPE === "mysql") {
            this.dbType = DBType.Mysql
            const mysql2PoolConfig: mysql2.PoolOptions = {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                port: Number(process.env.DB_PORT),
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                connectionLimit: 3,
                idleTimeout: 30000  // idleTimeout in milliseconds - default is 60000 (1 min)
            }

            this.mysqlPool = mysql2.createPool(mysql2PoolConfig)
            mysql2PoolConfig.password = ""
            console.log("DBType", this.dbType, "Mysql pool config", mysql2PoolConfig)
          } else if (process.env.DB_TYPE === "postgres") {
            this.dbType = DBType.Postgresql
            console.log("DBType", this.dbType, "Postgres pool config initializing...")
            const postgresPoolConfig: pg.PoolConfig = {
              host: process.env.DB_HOST,
              user: process.env.DB_USER,
              port: Number(process.env.DB_PORT),
              password: process.env.DB_PASSWORD,
              database: process.env.DB_DATABASE,
              max: 3, // connectionLimit
              idleTimeoutMillis: 30000 // idleTimeout in milliseconds - default is 10000 (10 sec)
            }

            this.pgPool = new pg.Pool(postgresPoolConfig)
            postgresPoolConfig.password = ""
            console.log("DBType", this.dbType, "Postgres pool config", postgresPoolConfig)
          } else {
          this.dbType = DBType.Unknown
          throw new Error(`Unknown DB_TYPE: ${process.env.DB_TYPE}. Must be one of: mariadb, mysql, postgres`)
        }
        
        console.log(`✓ Database connection pool initialized successfully for ${process.env.DB_TYPE}`)
     }

    async getConnection(): Promise<SqlInterface> {
      const seq = this.connectionSequence++
      console.log("Connection - getting", seq)
      try {
        switch (this.dbType) {
            case DBType.Unknown:
                throw new Error("DB Type is unknown")
            case DBType.Mariadb:
                return new MariadbConnection(await this.mariadbPool!.getConnection(), seq)
            case DBType.Mysql:
                return new MysqlConnection(await this.mysqlPool!.getConnection(), seq)
            case DBType.Postgresql:
                return new PostgresConnection(await this.pgPool!.connect(), seq)
            default:
                const _exhaustivenessCheck: never = this.dbType
                throw new Error(`DB Type ${_exhaustivenessCheck} is not implemented`)
        }
      } finally {
        console.log("Connection - allocated", seq)
      }
        
    }

    async closePool() {
      console.log("Closing DB Pool...")
      try {
        switch (this.dbType) {
            case DBType.Unknown:
                throw new Error("DB Type is unknown")
            case DBType.Mariadb:
                await this.mariadbPool?.end()
                break
            case DBType.Mysql:
                await this.mysqlPool?.end()
                break
            case DBType.Postgresql:
                await this.pgPool?.end()
                break
            default:
                const _exhaustivenessCheck: never = this.dbType
                throw new Error(`DB Type ${_exhaustivenessCheck} is not implemented`)
        }
      } finally {
        console.log("DB Pool closed")
      } 
    }
}

const dbConnection = new DBConnection()

process.on('SIGINT', async () => {
  console.log("Received SIGINT. Shutting down gracefully...")
  await dbConnection.closePool()
  process.exit(0)
})

export const executeSql = async (callback: (sql: SqlInterface) => Promise<void>): Promise<void> => {
    // create a database connection
    const sql = await dbConnection.getConnection()
    try {
        await callback(sql)
    } finally {
        await sql.close()
    }
    console.log("done")
    return
}