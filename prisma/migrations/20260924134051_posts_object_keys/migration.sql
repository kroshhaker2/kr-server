/*
  Warnings:

  - You are about to drop the column `filename` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `preview` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Post` table. All the data in the column will be lost.
  - Added the required column `mimeType` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalFilename` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalKey` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `rating` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `type` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Rating" AS ENUM ('SAFE', 'QUESTIONABLE', 'EXPLICIT');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DELETED');

-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('GENERAL', 'META', 'AUTHOR', 'CHARACTER', 'SPECIES', 'SERIES', 'SOURCE', 'LOCATION', 'EVENT', 'COPYRIGHT');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "filename",
DROP COLUMN "preview",
DROP COLUMN "type",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "favorites" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "originalFilename" TEXT NOT NULL,
ADD COLUMN     "originalKey" TEXT NOT NULL,
ADD COLUMN     "previewKey" TEXT,
ADD COLUMN     "size" BIGINT NOT NULL,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "title" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "rating",
ADD COLUMN     "rating" "Rating" NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "type" "TagType" NOT NULL;
