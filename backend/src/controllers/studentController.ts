import { Request,Response } from "express";
import {
    getAllIndividualTutors
} from "../services/studentService";


export const getAllIndividualTutorsController = async (req: Request, res: Response) => {
    const {
        subjects,
        titles,
        min_hourly_rate,
        max_hourly_rate,
        rating,
        description,
        sort,
    } = req.query;

    const tutors = await getAllIndividualTutors(
        subjects as string,
        titles as string,
        Number(min_hourly_rate),
        Number(max_hourly_rate),
        Number(rating),
        sort as string
    );

    return res.json(tutors);
};
