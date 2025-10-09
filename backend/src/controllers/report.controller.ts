import { Request, Response } from 'express';
import { createReport, getReportsByStudentId, getAllReportsForAdmin, updateReportStatus } from '../services/report.service';



export const generateReportController = async (req: Request, res: Response) => {
    const { student_id, tutor_id, reason, description,tutor_type } = req.body;
    try {
        // Call the service to create a report
        const report = await createReport(student_id, tutor_id, reason, description, tutor_type);
        res.status(201).json(report);
    }
    catch (e: any) {
        res.status(e?.status || 500).json({ message: e?.message || 'Report generation failed' });
    }
};

export const getReportsByStudentIdController = async (req: Request, res: Response) => {
    const { studentId } = req.params;
    try {
        const reports = await getReportsByStudentId(studentId);
        res.json(reports);
    }
    catch (e: any) {
        res.status(e?.status || 500).json({ message: e?.message || 'Failed to get reports' });
    }
}

/**
 * Get all reports for admin (with student/tutor/admin names instead of IDs)
 */
export const listAllReportsController = async (req: Request, res: Response) => {
    try {
        const reports = await getAllReportsForAdmin();
        res.json({ reports });
    } catch (e: any) {
        console.error('List reports error:', e);
        res.status(500).json({ message: e?.message || 'Failed to fetch reports' });
    }
};

/**
 * Toggle report status (solve <-> under_review)
 */
export const toggleReportStatusController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.admin) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const updatedReport = await updateReportStatus(id, req.admin.adminId);
        res.json({ report: updatedReport });
    } catch (e: any) {
        console.error('Toggle report status error:', e);
        res.status(500).json({ message: e?.message || 'Failed to update report status' });
    }
};

