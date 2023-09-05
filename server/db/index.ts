import pg from "pg";
import { ProductRepository } from "./products";
import { Db } from "./Db";
import { UserRepository } from "./users";
import { EatenRepository } from "./eaten";

type Pg = pg.Pool | pg.PoolClient | pg.Client;

export class Repository {
  private pg: Pg;
  users: UserRepository;
  products: ProductRepository;
  eaten: EatenRepository;

  constructor(pg: Pg) {
    this.pg = pg;
    const db = new Db(pg);
    this.users = new UserRepository(db);
    this.products = new ProductRepository(db);
    this.eaten = new EatenRepository(db);
  }

  async inTransaction<T>(action: (db: Repository) => Promise<T>): Promise<T> {
    if (!(this.pg instanceof pg.Pool)) {
      throw new Error("Nested transactions not supported");
    }
    const pgClient = await this.pg.connect();
    try {
      await pgClient.query("BEGIN");
      const dbClient = new Repository(pgClient);
      const result = await action(dbClient);
      await pgClient.query("COMMIT");
      return result;
    } catch (e) {
      await pgClient.query("ROLLBACK");
      throw e;
    } finally {
      pgClient.release();
    }
  }
}

const repository = new Repository(
  new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
);
console.log("New repository created");

export default repository;
