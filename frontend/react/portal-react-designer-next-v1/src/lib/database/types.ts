export interface SqlInterface {
  query<T = any>(sql: string, values?: any): Promise<T[]>;
  queryParameterized<T = any>(sql: string, searchTerm: string[], searchValue: string[]): Promise<T[]>;
  queryParameterized_wherePostfixed<T = any>(sql: string, searchTerm: string[], searchValue: string[]): Promise<T[]>;
  querySingle<T = any>(sql: string, values?: any): Promise<T>;
  getLastRecordId(): Promise<number>;
  close(): Promise<void>;
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  dbType: DBType;
}

export enum TxnState {
  NO_TXN,
  BEGIN,
  END
}

export enum DBType {
  Mysql,
  Mariadb,
  Postgresql,
  Unknown
}