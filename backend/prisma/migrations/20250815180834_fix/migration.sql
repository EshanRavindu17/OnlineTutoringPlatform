/*
  Warnings:

  - You are about to drop the column `raiting` on the `Individual_Tutor` table. All the data in the column will be lost.
  - You are about to drop the column `raiting` on the `Mass_Tutor` table. All the data in the column will be lost.
  - You are about to drop the column `raiting` on the `Rating_N_Review_Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Individual_Tutor" DROP COLUMN "raiting",
ADD COLUMN     "rating" DECIMAL(3,1);

-- AlterTable
ALTER TABLE "public"."Mass_Tutor" DROP COLUMN "raiting",
ADD COLUMN     "rating" DECIMAL(3,1);

-- AlterTable
ALTER TABLE "public"."Rating_N_Review_Session" DROP COLUMN "raiting",
ADD COLUMN     "rating" DECIMAL(3,1);

-- RenameForeignKey
ALTER TABLE "public"."Rating_N_Review_Session" RENAME CONSTRAINT "session_raiting_review" TO "session_rating_review";
