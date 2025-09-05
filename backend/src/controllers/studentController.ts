import { Request,Response } from "express";
import {
    createASession,
    getAllIndividualTutors
    ,getAllSessionByStudentId,getIndividualTutorById
    ,getSlotsOfIndividualTutorById,
    getStudentIDByUserID,
    updateSlotStatus
} from "../services/studentService";
import { createPaymentRecord } from "../services/paymentService";


export const getAllIndividualTutorsController = async (req: Request, res: Response) => {
    const {
        subjects,
        titles,
        min_hourly_rate,
        max_hourly_rate,
        rating,
        description,
        sort,
        page,
        limit
    } = req.query;

    const tutors = await getAllIndividualTutors(
        subjects as string,
        titles as string,
        Number(min_hourly_rate),
        Number(max_hourly_rate),
        Number(rating),
        sort as string
        ,Number(page),
        Number(limit)
    );

    console.log('Fetched tutors:', tutors);
    return res.json(tutors);
};


export const getIndividualTutorByIdController = async (req: Request, res: Response) => {
    const { tutorId } = req.params;

    console.log("tutor_ID", tutorId);

    const tutor = await getIndividualTutorById(tutorId);

    if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
    }

    return res.json(tutor);
};


export const getSlotsOfIndividualTutorByIdController = async (req: Request, res: Response) => {
    const { tutorId } = req.params;

    console.log("tutor_ID", tutorId);

    const slots = await getSlotsOfIndividualTutorById(tutorId);

    if (!slots) {
        return res.status(404).json({ message: "Slots not found" });
    }

    return res.json(slots);
};


export const getAllSessionsByStudentIdController = async (req: Request, res: Response) => {
    const { studentId } = req.params;

    console.log("student_ID", studentId);

    const sessions = await getAllSessionByStudentId(studentId);

    if (!sessions) {
        return res.status(404).json({ message: "Sessions not found" });
    }

    return res.json(sessions);
};

export const getStudentIDByUserIDController = async (req: Request, res: Response) => {
    const { userId } = req.params;

    console.log("user_ID", userId);

    const studentId = await getStudentIDByUserID(userId);

    if (!studentId) {
        return res.status(404).json({ message: "Student not found" });
    }

    return res.json({ studentId });
};


export const createASessionController = async (req: Request, res: Response) => {
    const { student_id, i_tutor_id, slots, status, price, date } = req.body;

    console.log("Creating session for student_ID:", student_id);
    console.log("Creating session for i_tutor_id:", i_tutor_id);

    const c_slots = slots.map((slot: string) => new Date(slot));
    const c_date = new Date(date);

    const session = await createASession(
        student_id,
        i_tutor_id,
        c_slots,
        status,
        price,
        c_date
    );

    return res.json(session);
};

export const updateSlotStatusController = async (req: Request, res: Response) => {
    const { slot_id, status } = req.body;

    console.log("Updating slot status for slot_ID:", slot_id);
    console.log("Updating slot status to:", status);

    const updatedSlot = await updateSlotStatus(slot_id, status);

    if (!updatedSlot) {
        return res.status(404).json({ message: "Slot not found" });
    }

    return res.json(updatedSlot);
};

export const createPaymentRecordController = async (req: Request, res: Response) => {
    const paymentData = req.body;

    console.log("Creating payment record:", paymentData);

    // paymentData.payment_data_time = new Date(paymentData.payment_data_time);

    paymentData.payment_date_time = new Date();

    try {
        const paymentRecord = await createPaymentRecord(paymentData);
        return res.json(paymentRecord);
    } catch (error) {
        console.error("Error creating payment record:", error);
        return res.status(500).json({ error: "Failed to create payment record" });
    }
};
