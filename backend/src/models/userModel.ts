import pool from "../config/db";

export const createUser = async (email: string, passwordHash: string | null, googleId: string | null) => {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, google_id) 
     VALUES ($1, $2, $3) 
     ON CONFLICT (email) DO UPDATE SET google_id=EXCLUDED.google_id 
     RETURNING *`,
    [email, passwordHash, googleId]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
  return result.rows[0];
};

export const findUserById = async (id: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);
  return result.rows[0];
};
