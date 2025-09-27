import { Request,Response } from "express";
import {
    addStudent,
    cancelSession,
    createASession,
    findTimeSlots,
    getAllIndividualTutors
    ,getAllSessionByStudentId,getClassSlotsByClassID,getIndividualTutorById
    ,getPaymentSummaryByStudentId,getSlotsOfIndividualTutorById,
    getStudentIDByUserID,
    getTutorNameAndTypeById,
    getTutorsByStudentId,
    updateAccessTimeinFreeSlots,
    updateSlotStatus
} from "../services/studentService";
import { createPaymentRecord } from "../services/paymentService";
import { DateTime } from "luxon";
import { createZoomMeeting } from "../services/zoom.service";

export const addStudentController = async (req: Request, res: Response) => {
    const studentData = req.body;
    console.log("Adding new student:", studentData);
    const student = await addStudent(studentData);

    return res.json(student);
};

export const getAllIndividualTutorsController = async (req: Request, res: Response) => {
    const {
        name,
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
        name as string,
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


// To Find time slots for comparing  conflicts 
export const findTimeSlotsController = async (req: Request, res: Response) => {
    const { tutorId, sessionDate, slotsAsDate } = req.body;

    console.log("Finding time slots for tutor_ID:", tutorId);
    console.log("Finding time slots for sessionDate:", sessionDate);
    console.log("Finding time slots for slotsAsDate:", slotsAsDate);

    const timeSlots = await findTimeSlots(tutorId, new Date(sessionDate), slotsAsDate.map((slot: string) => new Date(slot)));

    return res.json(timeSlots);
};

// This function for change the access time in free slots
export const updateAccessTimeinFreeSlotsController = async (req: Request, res: Response) => {
    const { slot_id, last_access_time } = req.body;

    console.log("Updating last access time for slot_ID:", slot_id);
    console.log("Updating last access time to:", last_access_time);

    const lastAccessTime = new Date(last_access_time);


    const updatedSlot = await updateAccessTimeinFreeSlots(slot_id, lastAccessTime);

    if (!updatedSlot) {
        return res.status(404).json({ message: "Slot not found" });
    }

    return res.json(updatedSlot);
};


// helper contoller to test zoom 

export const testZoomController = async (req: Request, res: Response) => {

    const { topic, startTime, duration } = req.body;

    try {
        const meeting = await createZoomMeeting(topic, startTime, duration);
        return res.status(200).json(meeting);
    } catch (error) {
        console.error("Error creating Zoom meeting:", error);
        return res.status(500).json({ error: "Failed to create Zoom meeting" });
    }
}

// for cancelling a session

export const cancelSessionController = async (req: Request, res: Response) => {
    const { session_id } = req.params;
    if(!session_id) {
        return res.status(400).json({ error: "session_id is required" });
    }
    console.log("Cancelling session for session_ID:", session_id);
    try {
        const result = await cancelSession(session_id);
        return res.json({ message: "Session canceled successfully", result });
    } catch (error: any) {
        console.error("Error canceling session:", error);
        return res.status(400).json({ error: error.message });
    }
};

// for getting individual tutors for dashbord

export const getTutorsByStudentIdController = async (req: Request, res: Response) => {
    const { studentId } = req.params;

    console.log("Getting tutors for student_ID:", studentId);
    try {
        const tutors = await getTutorsByStudentId(studentId);
        return res.json(tutors);
    } catch (error) {
        console.error("Error getting tutors:", error);
        return res.status(500).json({ error: "Failed to get tutors" });
    }
};

// get payment history for a student
export const  getPaymentHistoryController = async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    try {
        const paymentHistory = await getPaymentSummaryByStudentId(studentId, page, limit);
        return res.json(paymentHistory);
    } catch (error) {
        console.error("Error getting payment history:", error);
        return res.status(500).json({ error: "Failed to get payment history" });
    }
};


export const getTutorNameAndTypeByIdController = async (req: Request, res: Response) => {
    const { tutorId } = req.params;
    if(!tutorId) {
        return res.status(400).json({ error: "tutorId is required" });
    }
    console.log("Getting tutor name and type for tutor_ID:", tutorId);
    try {
        const tutorInfo = await getTutorNameAndTypeById(tutorId);
        if(!tutorInfo) {
            return res.status(404).json({ error: "Tutor not found" });
        }
        return res.json(tutorInfo);
    } catch (error) {
        console.error("Error getting tutor name and type:", error);
        return res.status(500).json({ error: "Failed to get tutor name and type" });
    }
};




// Mass Class Controller in studentController file

import { getAllMassClasses,
         getMassTutorById,
         getClassByClassIdAndStudentId,
         getClassByStudentId
       } from "../services/studentService";


export const getAllMassClassesController = async (req: Request, res: Response) => {
    const {
        subjects,
        min_monthly_rate,
        max_monthly_rate,
        rating,
        sort,
        searchTerm,
        // classTitle,
        // tutorName,
        page,
        limit
    } = req.query;

    // console.log("Query Parameters:", req.query);

    const subjectsArray = (subjects as string)?.split(",").map(sub => sub.trim());


    try {
        const massClasses = await getAllMassClasses(
            subjectsArray,
            Number(min_monthly_rate),
            Number(max_monthly_rate),
            rating as unknown as number,
            // tutorName as string,
            // classTitle as string,
            searchTerm as string,
            sort as string,
            Number(page),
            Number(limit)
        );
        return res.json(massClasses);
    } catch (error) {
        console.error("Error getting mass classes:", error);
        return res.status(500).json({ error: "Failed to get mass classes" });
    }
};


export const getMassTutorProfileByIdController = async (req: Request, res: Response) => {
    const { tutorId } = req.params;
    if(!tutorId) {
        return res.status(400).json({ error: "tutorId is required" });
    }
    console.log("Getting mass tutor profile for tutor_ID:", tutorId);
    try {
        const tutorProfile = await getMassTutorById(tutorId);
        if(!tutorProfile) {
            return res.status(404).json({ error: "Tutor not found" });
        }
        return res.json(tutorProfile);
    } catch (error) {
        console.error("Error getting mass tutor profile:", error);
        return res.status(500).json({ error: "Failed to get mass tutor profile" });
    }
};



export const  getClassSlotsByClassIdAndStudentIdController = async (req: Request, res: Response) => {
    const { classId, studentId } = req.params;

    console.log("Getting class slots for class_ID:", classId, "and student_ID:", studentId);

    if(!classId || !studentId) {
        return res.status(400).json({ error: "classId and studentId are required" });
    }
    try {
        const classSlots = await getClassByClassIdAndStudentId(classId, studentId);
        return res.json(classSlots);
    } catch (error) {
        console.error("Error getting class slots:", error);
        return res.status(500).json({ error: "Failed to get class slots" });
    }
}

export const getClassSlotsByClassIdController = async (req: Request, res: Response) => {
    const { classId ,month} = req.params;

    console.log("Getting class slots for class_ID:", classId, "and month:", month);
    if(!classId || !month) {
        return res.status(400).json({ error: "classId and month are required" });
    }
    try {
        const classSlots = await getClassSlotsByClassID(classId, Number(month));
        return res.json(classSlots);
    } catch (error) {
        console.error("Error getting class slots:", error);
        return res.status(500).json({ error: "Failed to get class slots" });
    }
};

export const getClassesByStudentIdController = async (req: Request, res: Response) => {
    const { student_id } = req.params;

    console.log("Getting classes for student_ID:", student_id);
    try {
        const classSlots = await getClassByStudentId(student_id);
        return res.json(classSlots);
    } catch (error) {
        console.error("Error getting class slots:", error);
        return res.status(500).json({ error: "Failed to get class slots" });
    }
};