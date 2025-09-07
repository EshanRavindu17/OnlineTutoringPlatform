/*
  Warnings:

  - You are about to drop the column `time` on the `Free_Time_Slots` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Free_Time_Slots" DROP COLUMN "time",
ADD COLUMN     "end_time" TIME(6),
ADD COLUMN     "start_time" TIME(6);
