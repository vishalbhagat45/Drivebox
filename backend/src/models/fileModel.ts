import pool from "../config/db";

export const createFile = async (name: string, folderId: number | null, userId: string, firebasePath: string) => {
  const result = await pool.query(
    `INSERT INTO files (name, folder_id, user_id, firebase_path) 
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, folderId, userId, firebasePath]
  );
  return result.rows[0];
};

export const listFiles = async (folderId: number | null, userId: string, includeTrash: boolean = false) => {
  const result = await pool.query(
    `SELECT * FROM files 
     WHERE user_id=$1
     AND (folder_id = $2 OR ($2 IS NULL AND folder_id IS NULL))
     AND ($3 OR is_deleted=false)`,
    [userId, folderId, includeTrash]
  );
  return result.rows;
};

export const renameFile = async (id: number, userId: string, newName: string) => {
  const result = await pool.query(
    `UPDATE files SET name=$1, updated_at=NOW() 
     WHERE id=$2 AND user_id=$3 RETURNING *`,
    [newName, id, userId]
  );
  return result.rows[0];
};

export const softDeleteFile = async (id: number, userId: string) => {
  await pool.query(`UPDATE files SET is_deleted=true WHERE id=$1 AND user_id=$2`, [id, userId]);
};

export const restoreFile = async (id: number, userId: string) => {
  await pool.query(`UPDATE files SET is_deleted=false WHERE id=$1 AND user_id=$2`, [id, userId]);
};

export const permanentDeleteFile = async (id: number, userId: string) => {
  await pool.query(`DELETE FROM files WHERE id=$1 AND user_id=$2`, [id, userId]);
};

export async function listFilesPaged(
  folderId: number | null,
  userId: string,
  includeTrash: boolean,
  limit = 20,
  offset = 0
) {
  const params: any[] = [userId, includeTrash];
  let where = `user_id=$1 AND (is_deleted=$2 OR $2=true)`;

  if (folderId === null) {
    where += ` AND folder_id IS NULL`;
  } else {
    params.push(folderId);
    where += ` AND folder_id=$3`;
  }

  const sql = `
    SELECT *
    FROM files
    WHERE ${where}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset};
  `;

  const result = await pool.query(sql, params);
  return result.rows;
}

