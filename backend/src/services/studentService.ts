import { SessionStatus, SlotStatus } from "@prisma/client";
import prisma from "../prismaClient";
import  {DateTime} from "luxon";

interface Individual{
    i_tutor_id : string;
    subjects: string[];
    titles: string[];
    hourly_rate: number;
    rating: number;
    description: string;
    heading?: string;
    User?: {
        name: string;
        photo_url: string | null;
    } | null;
}

// export const addStudent = async (data: any) => {

//     const user_id = data.user_id;
//     const points = Number(data.points);
//     const student = await prisma.student.create({
//         data: {
//             user_id,
//             points
//         }
//     });
//     return student;
// };

export const addStudent = async (data: any) => {
    const user_id = data.user_id;
    const points = Number(data.points);
    
    const existingStudent = await prisma.student.findFirst({
        where: { user_id }
    });

    let student;
    if (existingStudent) {
        student = await prisma.student.update({
            where: { student_id: existingStudent.student_id },
            data: { points :existingStudent.points }
        });
    } else {
        student = await prisma.student.create({
            data: {
                user_id,
                points
            }
        });
    }
    return student;
};

export const getAllIndividualTutors = async (subjects:string,titles:string,min_hourly_rate:number,max_hourly_rate:number, rating:number,sort:string,page:number=1,limit:number=10) => {
    const tutors = await prisma.individual_Tutor.findMany({
        where: {
            ...(subjects &&  { subjects: { hasSome: subjects.split(',').map(subject => subject.trim()) } }),
            ...(titles && { titles: { hasSome: titles.split(',').map(title => title.trim()) } }),
            ...(min_hourly_rate && { hourly_rate: { gte: min_hourly_rate } }),
            ...(max_hourly_rate && { hourly_rate: { lte: max_hourly_rate } }),
            ...(rating && { rating: { gte: rating } }),
        },
        include: {
            User: {
                select: {
                    name: true,
                    photo_url: true
                }
            }
        },
        orderBy: (() => {
        switch (sort) {
        case 'price_asc': return { hourly_rate: 'asc' as const };
        case 'price_desc': return { hourly_rate: 'desc' as const };
        case 'rating_desc': return { rating: 'desc' as const };
        case 'rating_asc': return { rating: 'asc' as const };
        case 'all': return { i_tutor_id: 'asc' as const }; // original order
        default: return { rating: 'desc' as const }; // DEFAULT = highest rated
      }
    })(),
        skip: (page - 1) * limit,
        take: limit
    });
    return tutors;
}


export const getIndividualTutorById = async (i_tutor_id: string) => {
    const tutor = await prisma.individual_Tutor.findUnique({
        where: { i_tutor_id },
        include: {
            User: {
                select: {
                    name: true,
                    photo_url: true,
                    email: true,
                }
            }
        }
    });
    return tutor;
}


export const getSlotsOfIndividualTutorById = async (i_tutor_id: string) => {
    const now = new Date();
    const slots = await prisma.free_Time_Slots.findMany({
        where: { 
            i_tutor_id, 
            status: 'free',
            OR: [
                { date: { gt: now } },
                { 
                    date: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
                    start_time: { gt: now }
                }
            ]
        },
    });
    return slots;
}


export const getAllSessionByStudentId = async (student_id: string) => {

    console.log(student_id);
    
    const sessions = await prisma.sessions.findMany({
        where: { student_id },
        select: {
            session_id: true,
            start_time: true,
            end_time: true,
            status: true,
            materials: true,
            slots: true,
            meeting_urls: true,
            date: true,
            created_at: true,
            title: true,
            Individual_Tutor: {
                select : {
                    User: {
                        select: {
                            name: true,
                        }
                    }
                }
            }
        }
    });
    return sessions;
}

// Get Student ID by User ID
export const getStudentIDByUserID = async (user_id: string) => {
    const student = await prisma.student.findFirst({
        where: { user_id },
        select: {
            student_id: true
        }
    });
    return student?.student_id || null;
};

// Create a Session 
export const createASession = async (
    student_id: string,
    i_tutor_id: string,
    slots: Date[],
    status: SessionStatus,
    price: number,
    date: Date,
) => {

    const time = DateTime.now().setZone("Asia/Colombo").toJSDate();
    const session = await prisma.sessions.create({
        data: {
            student_id,
            i_tutor_id,
            slots,
            status,
            price,
            date,
            created_at: time,
        }
    });
    return session;
};

export const updateSlotStatus = async (slot_id: string, status: SlotStatus) => {
    const updatedSlot = await prisma.free_Time_Slots.update({
        where: { slot_id },
        data: { status }
    });
    return updatedSlot;
};


export const findTimeSlots = async (i_tutor_id: string, sessionDate: Date, slotsAsDate: Date[]) => {
    const timeSlots = await prisma.free_Time_Slots.findMany({
      where: {
        i_tutor_id: i_tutor_id,
        date: sessionDate,
        start_time: {
          in: slotsAsDate
        },
        status: 'free' // Only update free slots
      }
    });

    return timeSlots;
};


export const updateAccessTimeinFreeSlots = async (slot_id: string, last_access_time: Date) => {
    const updatedSlot = await prisma.free_Time_Slots.update({
        where: { slot_id },
        data: { 
            last_access_time
        }
    });
    return updatedSlot;
};
