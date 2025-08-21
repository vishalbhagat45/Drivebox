import pool from "../config/db";

export const createFolder = async (name: string, parentId: number | null, userId: string) => {
  const result = await pool.query(
    `INSERT INTO folders (name, parent_id, user_id) 
     VALUES ($1,$2,$3) RETURNING *`,
    [name, parentId, userId]
  );
  return result.rows[0];
};

export const listFolders = async (parentId: number | null, userId: string, includeTrash: boolean = false) => {
  const result = await pool.query(
    `SELECT * FROM folders 
     WHERE user_id=$1
     AND (parent_id = $2 OR ($2 IS NULL AND parent_id IS NULL))
     AND ($3 OR is_deleted=false)`,
    [userId, parentId, includeTrash]
  );
  return result.rows;
};

export const renameFolder = async (id: number, userId: string, newName: string) => {
  const result = await pool.query(
    `UPDATE folders SET name=$1, updated_at=NOW() 
     WHERE id=$2 AND user_id=$3 RETURNING *`,
    [newName, id, userId]
  );
  return result.rows[0];
};

export const softDeleteFolder = async (id: number, userId: string) => {
  await pool.query(`UPDATE folders SET is_deleted=true WHERE id=$1 AND user_id=$2`, [id, userId]);
};

export const restoreFolder = async (id: number, userId: string) => {
  await pool.query(`UPDATE folders SET is_deleted=false WHERE id=$1 AND user_id=$2`, [id, userId]);
};

export const permanentDeleteFolder = async (id: number, userId: string) => {
  await pool.query(`DELETE FROM folders WHERE id=$1 AND user_id=$2`, [id, userId]);
};

export async function listFoldersPaged(
  parentId: number | null,
  userId: string,
  includeTrash: boolean,
  limit = 20,
  offset = 0
) {
  const params: any[] = [userId, includeTrash];
  let where = `user_id=$1 AND (is_deleted=$2 OR $2=true)`;

  if (parentId === null) {
    where += ` AND parent_id IS NULL`;
  } else {
    params.push(parentId);
    where += ` AND parent_id=$3`;
  }

  const sql = `
    SELECT *
    FROM folders
    WHERE ${where}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset};
  `;

  const result = await pool.query(sql, params);
  return result.rows;
}