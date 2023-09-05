import { Db } from "./Db";

export type User = {
  id: number;
  supabaseAuthId: string;
};

export type UserAddData = Omit<User, "id">;

export class UserRepository {
  private db: Db;
  constructor(db: Db) {
    this.db = db;
  }

  async insertIfNew({ supabaseAuthId }: UserAddData): Promise<number> {
    const queryText = `
        INSERT INTO Users (supabase_auth_id)
        VALUES ($1)
        ON CONFLICT DO UPDATE SET supabase_auth_id = EXCLUDED.supabase_auth_id
        RETURNING id
      `;
    return this.db.int(queryText, [supabaseAuthId]);
  }
}
