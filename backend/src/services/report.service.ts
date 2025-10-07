import { TutorType, Prisma } from "@prisma/client";
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

/**
 * Get all reports for admin with student, tutor, and resolver names
 */
export const getAllReportsForAdmin = async () => {
  try {
    // Query all reports
    const rawReports = await prisma.reports.findMany({
      orderBy: [
        { status: 'asc' }, // under_review first
        { submitted_date: 'desc' },
      ],
    }) as any[];

    // Collect all unique IDs
    const studentIds = [...new Set(rawReports.map(r => r.student_id).filter(Boolean))];
    const tutorIds = [...new Set(rawReports.map(r => r.tutor_id).filter(Boolean))];
    const adminIds = [...new Set(rawReports.map((r: any) => r.resolved_by).filter(Boolean))];

    // Batch fetch related data
    const [students, individualTutors, massTutors, admins] = await Promise.all([
      prisma.student.findMany({
        where: { student_id: { in: studentIds as string[] } },
        select: { student_id: true, User: { select: { name: true } } }
      }),
      prisma.individual_Tutor.findMany({
        where: { i_tutor_id: { in: tutorIds as string[] } },
        select: { i_tutor_id: true, User: { select: { name: true } } }
      }),
      prisma.mass_Tutor.findMany({
        where: { m_tutor_id: { in: tutorIds as string[] } },
        select: { m_tutor_id: true, User: { select: { name: true } } }
      }),
      prisma.admin.findMany({
        where: { admin_id: { in: adminIds as string[] } },
        select: { admin_id: true, name: true }
      }),
    ]);

    // Create lookup maps
    const studentMap = new Map(students.map(s => [s.student_id, s.User.name]));
    const individualTutorMap = new Map(individualTutors.map(t => [t.i_tutor_id, t.User.name]));
    const massTutorMap = new Map(massTutors.map(t => [t.m_tutor_id, t.User.name]));
    const adminMap = new Map(admins.map(a => [a.admin_id, a.name]));

    // Map to clean output with names instead of IDs
    const enrichedReports = rawReports.map((report: any) => {
      let tutorName = 'Unknown Tutor';
      
      if (report.tutor_id) {
        if (report.tutor_type === 'individual') {
          tutorName = individualTutorMap.get(report.tutor_id) || 'Unknown Individual Tutor';
        } else if (report.tutor_type === 'mass') {
          tutorName = massTutorMap.get(report.tutor_id) || 'Unknown Mass Tutor';
        }
      }

      return {
        id: report.id,
        student_name: report.student_id ? studentMap.get(report.student_id) || 'Unknown Student' : 'Unknown Student',
        tutor_name: tutorName,
        tutor_type: report.tutor_type,
        reason: report.reason,
        description: report.description,
        submitted_date: report.submitted_date,
        status: report.status,
        resolve_date: report.resolve_date,
        response: report.response,
        resolved_by_name: report.resolved_by ? adminMap.get(report.resolved_by) || null : null,
      };
    });

    return enrichedReports;
  } catch (error) {
    console.error('Error fetching reports for admin:', error);
    throw new Error('Could not fetch reports');
  }
};

/**
 * Toggle report status (solve <-> under_review) and update resolved_by
 */
export const updateReportStatus = async (reportId: string, adminId: string) => {
  try {
    // Get current report
    const report = await prisma.reports.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    // Toggle status (solve = resolved, under_review = pending)
    const newStatus = report.status === 'solve' ? 'under_review' : 'solve';
    const updateData: any = {
      status: newStatus,
    };

    // If marking as solved, set resolve_date and resolved_by
    if (newStatus === 'solve') {
      updateData.resolve_date = new Date();
      updateData.resolved_by = adminId;
    } else {
      // If marking as under_review, clear resolve_date and resolved_by
      updateData.resolve_date = null;
      updateData.resolved_by = null;
    }

    const updatedReport = await prisma.reports.update({
      where: { id: reportId },
      data: updateData,
    });

    return updatedReport;
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
};
