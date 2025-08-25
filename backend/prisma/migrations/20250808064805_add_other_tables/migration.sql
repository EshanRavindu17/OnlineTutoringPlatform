/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."SessionStatus" AS ENUM ('scheduled', 'ongoing', 'canceled');

-- CreateEnum
CREATE TYPE "public"."SlotStatus" AS ENUM ('free', 'booked');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('success', 'fail');

-- CreateEnum
CREATE TYPE "public"."TutorType" AS ENUM ('mass', 'individual');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "createdAt",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- CreateTable
CREATE TABLE "public"."Admin" (
    "admin_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR,
    "firebase_uid" TEXT,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "public"."Candidates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR,
    "email" VARCHAR,
    "role" "public"."UserRole",
    "bio" TEXT,
    "dob" DATE,
    "phone_number" INTEGER,

    CONSTRAINT "Candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Free_Time_Slots" (
    "slot_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "i_tutor_id" UUID,
    "date" DATE,
    "time" TIME(6),
    "status" "public"."SlotStatus",

    CONSTRAINT "Free_Time_Slots_pkey" PRIMARY KEY ("slot_id")
);

-- CreateTable
CREATE TABLE "public"."Individual_Payments" (
    "i_payment_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID,
    "session_id" UUID,
    "amount" DECIMAL(10,2),
    "payment_date_time" TIMESTAMP(6),
    "status" "public"."Status",
    "method" VARCHAR,

    CONSTRAINT "Individual_Payments_pkey" PRIMARY KEY ("i_payment_id")
);

-- CreateTable
CREATE TABLE "public"."Individual_Tutor" (
    "i_tutor_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subjects" VARCHAR[],
    "titles" VARCHAR[],
    "hourly_rate" DECIMAL(10,2),
    "raiting" DECIMAL(3,1),
    "user_id" UUID,
    "description" TEXT,

    CONSTRAINT "Individual_Tutor_pkey" PRIMARY KEY ("i_tutor_id")
);

-- CreateTable
CREATE TABLE "public"."Mass_Tutor" (
    "m_tutor_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subjects" VARCHAR[],
    "raiting" DECIMAL(3,1),
    "prices" DECIMAL(10,2),
    "description" TEXT,
    "user_id" UUID NOT NULL,

    CONSTRAINT "Mass_Tutor_pkey" PRIMARY KEY ("m_tutor_id")
);

-- CreateTable
CREATE TABLE "public"."Notifications" (
    "notify_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "message" TEXT,
    "type" "public"."UserRole",
    "date_time_sent" TIMESTAMP(6),
    "status" "public"."Status",

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("notify_id")
);

-- CreateTable
CREATE TABLE "public"."Rating_N_Review_Session" (
    "r_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID,
    "session_id" UUID,
    "raiting" DECIMAL(3,1),
    "review" TEXT,

    CONSTRAINT "Rating_N_Review_Session_pkey" PRIMARY KEY ("r_id")
);

-- CreateTable
CREATE TABLE "public"."Reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID,
    "tutor_id" UUID,
    "tutor_type" "public"."TutorType",
    "description" TEXT,

    CONSTRAINT "Reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sessions" (
    "session_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID,
    "slot_id" UUID,
    "start_time" TIME(6),
    "end_time" TIME(6),
    "status" "public"."SessionStatus",
    "materials" VARCHAR[],

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "student_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "points" INTEGER DEFAULT 0,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "public"."Subjects" (
    "sub_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR,

    CONSTRAINT "Subjects_pkey" PRIMARY KEY ("sub_id")
);

-- CreateTable
CREATE TABLE "public"."Titles" (
    "title_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sub_id" UUID NOT NULL,
    "name" VARCHAR,

    CONSTRAINT "Titles_pkey" PRIMARY KEY ("title_id")
);

-- AddForeignKey
ALTER TABLE "public"."Free_Time_Slots" ADD CONSTRAINT "i_tutor_id_slot_fk" FOREIGN KEY ("i_tutor_id") REFERENCES "public"."Individual_Tutor"("i_tutor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Individual_Payments" ADD CONSTRAINT "student_id_i_pay_fk" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("student_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Individual_Tutor" ADD CONSTRAINT "i_tutor_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mass_Tutor" ADD CONSTRAINT "m_tutor_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notifications" ADD CONSTRAINT "user_id_notification_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating_N_Review_Session" ADD CONSTRAINT "session_raiting_review" FOREIGN KEY ("session_id") REFERENCES "public"."Sessions"("session_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating_N_Review_Session" ADD CONSTRAINT "student_rating_review" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("student_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reports" ADD CONSTRAINT "student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("student_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sessions" ADD CONSTRAINT "slot_id" FOREIGN KEY ("slot_id") REFERENCES "public"."Free_Time_Slots"("slot_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sessions" ADD CONSTRAINT "student_session_fk" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("student_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "student_user_Id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Titles" ADD CONSTRAINT "title_sub_id_fk" FOREIGN KEY ("sub_id") REFERENCES "public"."Subjects"("sub_id") ON DELETE CASCADE ON UPDATE CASCADE;
