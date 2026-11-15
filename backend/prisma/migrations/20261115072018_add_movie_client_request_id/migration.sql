/*
  Warnings:

  - A unique constraint covering the columns `[clientRequestId]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "clientRequestId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "Movie_clientRequestId_key" ON "Movie"("clientRequestId");
