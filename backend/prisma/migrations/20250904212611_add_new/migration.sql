/*
  Warnings:

  - You are about to drop the column `time` on the `Free_Time_Slots` table. All the data in the column will be lost.
  - You are about to drop the column `slot_id` on the `Sessions` table. All the data in the column will be lost.
  - The `start_time` column on the `Sessions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `end_time` column on the `Sessions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('under review', 'solve');

-- AlterEnum
ALTER TYPE "public"."SessionStatus" ADD VALUE 'completed';

-- AlterEnum
ALTER TYPE "public"."Status" ADD VALUE 'refund';

-- DropForeignKey
ALTER TABLE "public"."Sessions" DROP CONSTRAINT "slot_id";

-- AlterTable
ALTER TABLE "public"."Free_Time_Slots" DROP COLUMN "time",
ADD COLUMN     "end_time" TIME(6),
ADD COLUMN     "last_access_time" TIMESTAMP(6),
ADD COLUMN     "start_time" TIME(6);

-- AlterTable
ALTER TABLE "public"."Individual_Payments" ADD COLUMN     "payment_intent_id" TEXT;

-- AlterTable
ALTER TABLE "public"."Individual_Tutor" ADD COLUMN     "location" TEXT,
ADD COLUMN     "phone_number" VARCHAR,
ADD COLUMN     "qualifications" TEXT[];

-- AlterTable
ALTER TABLE "public"."Reports" ADD COLUMN     "reason" TEXT,
ADD COLUMN     "resolve_date" DATE,
ADD COLUMN     "response" TEXT,
ADD COLUMN     "status" "public"."ReportStatus",
ADD COLUMN     "submitted_date" DATE;

-- AlterTable
ALTER TABLE "public"."Sessions" DROP COLUMN "slot_id",
ADD COLUMN     "created_at" TIMESTAMP(6),
ADD COLUMN     "date" DATE,
ADD COLUMN     "i_tutor_id" UUID,
ADD COLUMN     "meeting_urls" TEXT[],
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "slots" TIME[],
ADD COLUMN     "title" TEXT,
DROP COLUMN "start_time",
ADD COLUMN     "start_time" TIMESTAMP(6),
DROP COLUMN "end_time",
ADD COLUMN     "end_time" TIMESTAMP(6);

-- AddForeignKey
ALTER TABLE "public"."Sessions" ADD CONSTRAINT "Sessions_i_tutor_id_fkey" FOREIGN KEY ("i_tutor_id") REFERENCES "public"."Individual_Tutor"("i_tutor_id") ON DELETE CASCADE ON UPDATE NO ACTION;
