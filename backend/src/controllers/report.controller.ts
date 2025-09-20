import { Request, Response } from 'express';
import { createReport, getReportsByStudentId } from '../services/report.service';



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

