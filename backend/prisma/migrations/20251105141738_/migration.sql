/*
  Warnings:

  - You are about to drop the column `token` on the `RefreshToken` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."RefreshToken_tokenHash_key";

-- DropIndex
DROP INDEX "public"."RefreshToken_token_key";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "token",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
