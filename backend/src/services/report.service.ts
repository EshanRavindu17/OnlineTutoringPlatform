import { TutorType } from "@prisma/client";
import prisma from "../prismaClient";

export const createReport = async (
    /* report data fields */
    student_id: string,
    tutor_id: string,
    reason: string,
    description: string,
    tutor_type: string
) => {

  console.log("Creating report with data:", { student_id, tutor_id, reason, description, tutor_type });
  try {
    const report = await prisma.reports.create({
      data: { 
        student_id, 
        tutor_id, 
        reason, 
        description,
        submitted_date: new Date(),
        tutor_type: tutor_type as TutorType
      },
    });
    return report;
  } catch (error) {
    console.error("Error creating report:", error);
    throw new Error("Could not create report");
  }
};


export const getReportsByStudentId = async (student_id: string) => {
  const reports = await prisma.reports.findMany({
    where: { student_id },
    orderBy: [
        { submitted_date: 'desc' },
        { id: 'asc' },
        {  resolve_date: 'desc' }
    ]
  });
//   return reports;

  const enrichedReports = await Promise.all(
    reports.map(async (report) => {
      // check if tutor exists in IndividualTutor
      const individualTutor = await prisma.individual_Tutor.findUnique({
        where: { i_tutor_id: report.tutor_id },
        include: { User: { select: { name: true } } },
      });

      if (individualTutor) {
        return {
          ...report,
          tutorName: individualTutor.User.name,
        };
      }

      // otherwise check in MassTutor
      const massTutor = await prisma.mass_Tutor.findUnique({
        where: { m_tutor_id: report.tutor_id },
        include: { User: { select: { name: true } } },
      });

      return {
        ...report,
        tutorName: massTutor ? massTutor.User.name : "Unknown Tutor",
      };
    })
  );

  return enrichedReports;
};
