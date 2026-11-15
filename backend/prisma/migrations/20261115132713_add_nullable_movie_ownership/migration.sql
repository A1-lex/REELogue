/*
  Warnings:

  - A unique constraint covering the columns `[userId,clientRequestId]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Movie_clientRequestId_key";

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "userId" INTEGER;

-- CreateIndex
CREATE INDEX "Movie_userId_createdAt_idx" ON "Movie"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Movie_userId_status_idx" ON "Movie"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_userId_clientRequestId_key" ON "Movie"("userId", "clientRequestId");

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
