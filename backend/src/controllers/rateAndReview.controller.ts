import { Request, Response } from 'express';
import { getReviewsByIndividualTutorId, rateAndReviewIndividualTutor } from '../services/rateAndReview.service';


 export const rateAndReviewIndividualController = async (req: Request, res: Response) => {
    const { student_id, session_id, rating, review } = req.body;
    try {
        const result = await rateAndReviewIndividualTutor(student_id, session_id, rating, review);
        res.status(201).json(result);
    } catch (e: any) {
        res.status(e?.status || 500).json({ message: e?.message || 'Rating and review failed' });
    }
 };

 export const getReviewsByIndividualTutorIdController = async (req: Request, res: Response) => {
    const { tutorId } = req.params;
    try {
        const reviews = await getReviewsByIndividualTutorId(tutorId);
        res.json(reviews);
    }
    catch (e: any) {
        res.status(e?.status || 500).json({ message: e?.message || 'Failed to get reviews' });
    }
    };