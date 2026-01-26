// For arg ['code1', 'code2', 'code3'], fn returns "(?, ?, ?)"
export const dbQueryParams = (array: string[]): string => {
  return array.length ? `(${array.map(() => "?").join(", ")})` : `('')`
}

// For arg [['code11', 'code12', 'code13'], ['code21', 'code22', 'code23'], ...], fn returns "(?, ?, ?),\n(?, ?, ?),\n ... (?, ?, ?)"
export const dbMultipleInsertParams = (array: any[][]): string => {
  if (!array.length) throw new Error("Invalid parameters")
  
  const rowCount= array.length
  const columnCount = array[0].length
  
  return Array(rowCount)
    .fill(`(${Array(columnCount).fill("?").join(", ")})`)
    .join(",\n")
}