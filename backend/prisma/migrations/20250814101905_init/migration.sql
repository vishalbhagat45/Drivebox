-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "parentFolderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."File" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "folderId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Permission" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Folder" ADD CONSTRAINT "Folder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "public"."File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INT REFERENCES folders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    folder_id INT REFERENCES folders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    firebase_path TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add sharing columns to files table
ALTER TABLE files
ADD COLUMN shareable_link TEXT,
ADD COLUMN role VARCHAR(20) DEFAULT 'owner'; -- owner | editor | viewer

CREATE TABLE file_permissions (
    id SERIAL PRIMARY KEY,
    file_id INT REFERENCES files(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- viewer | editor | owner
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- FILES ----------
-- 1) tsvector column (generated)
ALTER TABLE files
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(name, '')), 'A')
) STORED;

-- 2) GIN index for FTS
CREATE INDEX IF NOT EXISTS files_search_vector_gin
ON files USING GIN (search_vector);

-- 3) helpful btree indexes
CREATE INDEX IF NOT EXISTS files_user_folder_idx
ON files (user_id, folder_id);

CREATE INDEX IF NOT EXISTS files_deleted_idx
ON files (user_id, is_deleted);

CREATE INDEX IF NOT EXISTS files_created_idx
ON files (user_id, created_at DESC);

-- ---------- FOLDERS ----------
ALTER TABLE folders
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(name, '')), 'A')
) STORED;

CREATE INDEX IF NOT EXISTS folders_search_vector_gin
ON folders USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS folders_user_parent_idx
ON folders (user_id, parent_id);

CREATE INDEX IF NOT EXISTS folders_deleted_idx
ON folders (user_id, is_deleted);

CREATE INDEX IF NOT EXISTS folders_created_idx
ON folders (user_id, created_at DESC);

-- For full-text search
CREATE INDEX IF NOT EXISTS files_name_tsv_idx 
ON files USING gin(to_tsvector('english', name));

-- For prefix search (autocomplete)
CREATE INDEX IF NOT EXISTS files_name_prefix_idx 
ON files (name text_pattern_ops);

-- For recent files
CREATE INDEX IF NOT EXISTS files_created_at_idx 
ON files (created_at DESC);

