import pg from "pg";

pg.types.setTypeParser(1700, function (val: string) {
  //Parse numeric as float
  return parseFloat(val);
});

type Pg = pg.Pool | pg.PoolClient | pg.Client;
export class Db {
  private pg: Pg;

  constructor(pg: Pg) {
    this.pg = pg;
  }

  async many(queryText: string, parameters: any[]) {
    const queryResult = await this.pg.query(queryText, parameters);
    return queryResult.rows;
  }

  async one(queryText: string, parameters: any[]) {
    const queryResult = await this.pg.query(queryText, parameters);
    return queryResult.rows.length ? queryResult.rows[0] : undefined;
  }

  async int(queryText: string, parameters: any[]) {
    const queryResult = await this.pg.query(queryText, parameters);
    return parseInt(queryResult.rows[0][queryResult.fields[0].name]);
  }

  async insert(
    tableName: string,
    columnValues: Record<string, any>,
    returning: string[]
  ) {
    //if (!tableName.match/^$/) //TODO: injection guard
    const columnNames = Object.keys(columnValues);
    const columnClause = columnNames.join(", ");
    const valueClause = [...Array(columnNames.length).keys()]
      .map((k) => `$${k + 1}`)
      .join(", ");
    const returningClause =
      returning && returning.length ? ` RETURNING ${returning.join(", ")}` : ""; //TODO: injection guard
    const values = columnNames.map((columnName) => columnValues[columnName]);
    return this.one(
      `INSERT INTO ${tableName} (${columnClause}) VALUES (${valueClause})${returningClause}`,
      values
    );
  }

  async insertReturningId(
    tableName: string,
    columnValues: Record<string, any>
  ) {
    return this.insert(tableName, columnValues, ["id"]).then(
      (res) => res.id as number
    );
  }
}
