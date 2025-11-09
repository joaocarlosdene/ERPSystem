/*
  Warnings:

  - Made the column `updatedAt` on table `Calendar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tokenHash` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `passwordHash` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Calendar" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "tokenHash" SET NOT NULL;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;
