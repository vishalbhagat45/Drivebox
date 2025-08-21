import pool from "../config/db";

export type SearchItem = {
  id: number;
  name: string;
  kind: "file" | "folder";
  folder_id: number | null;      // for files
  parent_id: number | null;      // for folders
  path?: string | null;          // files only (firebase path)
  mimetype?: string | null;      // files only
  created_at: string;            // ISO
};

export type SearchParams = {
  userId: string;
  q: string;
  includeTrash?: boolean;
  limit?: number;
  offset?: number;               // simple pagination
};

export async function searchAll({
  userId,
  q,
  includeTrash = false,
  limit = 20,
  offset = 0,
}: SearchParams): Promise<{ items: SearchItem[]; total: number }> {
  // plainto_tsquery is safe & fast for simple user queries
  const tsquery = q.trim();

  // 1) total count (files + folders)
  const totalResult = await pool.query(
    `
    WITH f AS (
      SELECT id FROM files
      WHERE user_id = $1
        AND ($2::boolean OR is_deleted = false)
        AND (search_vector @@ plainto_tsquery('simple', $3) OR name ILIKE '%' || $3 || '%')
    ),
    d AS (
      SELECT id FROM folders
      WHERE user_id = $1
        AND ($2::boolean OR is_deleted = false)
        AND (search_vector @@ plainto_tsquery('simple', $3) OR name ILIKE '%' || $3 || '%')
    )
    SELECT (SELECT COUNT(*) FROM f) + (SELECT COUNT(*) FROM d) AS total;
    `,
    [userId, includeTrash, tsquery]
  );

  const total = Number(totalResult.rows[0].total || 0);

  // 2) paged results (files UNION folders)
  const results = await pool.query(
    `
    SELECT id, name, 'file'  AS kind, folder_id, NULL::int AS parent_id, firebase_path AS path, format AS mimetype, created_at
    FROM files
    WHERE user_id = $1
      AND ($2::boolean OR is_deleted = false)
      AND (search_vector @@ plainto_tsquery('simple', $3) OR name ILIKE '%' || $3 || '%')

    UNION ALL

    SELECT id, name, 'folder' AS kind, NULL::int AS folder_id, parent_id, NULL::text AS path, NULL::text AS mimetype, created_at
    FROM folders
    WHERE user_id = $1
      AND ($2::boolean OR is_deleted = false)
      AND (search_vector @@ plainto_tsquery('simple', $3) OR name ILIKE '%' || $3 || '%')

    ORDER BY created_at DESC
    LIMIT $4 OFFSET $5;
    `,
    [userId, includeTrash, tsquery, limit, offset]
  );

  return { items: results.rows, total };
}
