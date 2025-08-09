/*
  Warnings:

  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - A unique constraint covering the columns `[firebase_uid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firebase_uid` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firebase_uid" VARCHAR(128) NOT NULL,
ADD COLUMN     "photo_url" VARCHAR(255),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebase_uid_key" ON "public"."User"("firebase_uid");
