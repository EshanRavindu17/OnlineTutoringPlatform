import { SessionStatus, SlotStatus } from "@prisma/client";
import prisma from "../prismaClient";
import  {DateTime} from "luxon";
import { createZoomMeeting } from "./zoom.service";
import { refundPayment } from "./paymentService";
import { time } from "console";
import { title } from "process";
import Stripe from "stripe";
import { sendCancellationEmailController } from "../controllers/studentController";
import { sendSessionCancellationEmail } from "./email.service";


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

// export const addStudent = async (data: any) => {
//     const user_id = data.user_id;
//     const points = Number(data.points);
    
//     const existingStudent = await prisma.student.findFirst({
//         where: { user_id }
//     });

//     let student;
//     if (existingStudent) {
//         student = await prisma.student.update({
//             where: { student_id: existingStudent.student_id },
//             data: { points :existingStudent.points }
//         });
//     } else {
//         student = await prisma.student.create({
//             data: {
//                 user_id,
//                 points
//             }
//         });
//     }
//     return student;
// };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2025-08-27.basil' });

export const addStudent = async (data: any) => {
  const user_id = data.user_id;
  const points = Number(data.points);

  // Fetch user details (name + email)
  const user = await prisma.user.findUnique({
    where: { id:user_id },
    select: { name: true, email: true }
  });

  if (!user) {
    throw new Error("User not found for student creation");
  }

  // Check if student already exists
  const existingStudent = await prisma.student.findFirst({
    where: { user_id }
  });

  let student;

  if (existingStudent) {
    // If student exists but has no Stripe customer_id → create one
    if (!existingStudent.customer_id) {
      const stripeCustomer = await stripe.customers.create({
        name: user.name || "",
        email: user.email || "",
        metadata: { user_id }
      });

      student = await prisma.student.update({
        where: { student_id: existingStudent.student_id },
        data: {
          points: existingStudent.points,
          customer_id: stripeCustomer.id
        }
      });
    } else {
      // Already has customer_id → just update points
      student = await prisma.student.update({
        where: { student_id: existingStudent.student_id },
        data: { points: existingStudent.points }
      });
    }
  } else {
    // New student → create Stripe customer first
    const stripeCustomer = await stripe.customers.create({
      name: user.name || "",
      email: user.email || "",
      metadata: { user_id }
    });

    student = await prisma.student.create({
      data: {
        user_id,
        points,
        customer_id: stripeCustomer.id
      }
    });
  }

  return student;
};


export const getAllIndividualTutors = async (name: string,subjects:string,titles:string,min_hourly_rate:number,max_hourly_rate:number, rating:number,sort:string,page:number=1,limit:number=10) => {
    const tutors = await prisma.individual_Tutor.findMany({
        where: {
            // Now filter by subject and title names instead of IDs
            ...(subjects &&  { subjects: { hasSome: subjects.split(',').map(subject => subject.trim()) } }),
            ...(titles && { titles: { hasSome: titles.split(',').map(title => title.trim()) } }),
            ...(min_hourly_rate && { hourly_rate: { gte: min_hourly_rate } }),
            ...(max_hourly_rate && { hourly_rate: { lte: max_hourly_rate } }),
            ...(rating && { rating: { gte: rating } }),
            ...(name && { User: { name: { contains: name, mode: 'insensitive' } } }),
            status: 'active'
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

    const uniqueStudents = await prisma.sessions.findMany({
        where: { i_tutor_id },
        distinct: ['student_id'],
        select: { student_id: true }
    });

    const completedSessionsCount = await prisma.sessions.count({
        where: {
            i_tutor_id,
            status: 'completed'
        }
    });

    if (tutor) {
    tutor["uniqueStudentsCount"] = uniqueStudents.length;
    tutor["completedSessionsCount"] = completedSessionsCount;
  }

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
    subject: string,
    price: number,
    date: Date,
) => {

    const { host_url, join_url } = await createZoomMeeting(
        "Tutoring Session-" + student_id + "-" + i_tutor_id,
        date.toISOString(),
        slots.length * 60 // assuming each slot is 60 minutes
    );

    const time = DateTime.now().setZone("Asia/Colombo").toJSDate();
    const session = await prisma.sessions.create({
        data: {
            student_id,
            i_tutor_id,
            slots,
            status,
            subject,
            price,
            date,
            created_at: time,
            meeting_urls: [ host_url, join_url ]
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

export const cancelSession = async (session_id: string) => {
    
    //find session by session_id
    const session = await prisma.sessions.findUnique({
        where: { session_id }
    });
    if (!session) {
        throw new Error("Session not found");
    }
    if (session.status === 'canceled') {
        throw new Error("Session is already canceled");
    }

    const i_tutor_id = session.i_tutor_id;
    const slotsAsDate = session.slots.map(slot => new Date(slot));
    const sessionDate = new Date(session.date);

    // Find all booked slots for this session
    const timeSlots = await prisma.free_Time_Slots.findMany({
      where: {
        i_tutor_id: i_tutor_id,
        date: sessionDate,
        start_time: {
          in: slotsAsDate
        },
        status: 'booked' // Only update booked slots
      }
    });

    if (!timeSlots || timeSlots.length === 0) {
        throw new Error("No booked slots found for this session");
    }

    // Retrieve payment intent ID from the payment record
    const payment = await prisma.individual_Payments.findFirst({
        where: { session_id }
    });

    const paymentIntentId = payment?.payment_intent_id;

    const amount = session.price;
    console.log("Refund amount:", amount);
    const ammountInCents = Math.round(amount/ 300);

    if (!paymentIntentId) {
        throw new Error("Payment intent ID not found for this session");
    }

    // Process the refund
    const response = await refundPayment(paymentIntentId, ammountInCents);
    console.log("Refund response from Stripe:", response);
    
    // Update all found slots to 'free' status
    const updatePromises = timeSlots.map(slot => 
      updateSlotStatus(slot.slot_id, 'free' as any)
    );

    await Promise.all(updatePromises);

    // const amount = session.price;
    // console.log("Refund amount:", amount);

    // const ammountInCents = Math.round(amount/ 300); // convert to cents (LKR)
    // const payment = await prisma.individual_Payments.findFirst({
    //     where: { session_id }
    // });

    // const paymentIntentId = payment?.payment_intent_id;
    console.log("Payment Intent ID:", paymentIntentId);

    // const response = await refundPayment(paymentIntentId, ammountInCents);
    // console.log("Refund response from Stripe:", response);

    // Finally, update the session status to 'canceled'
    const updatedSession = await prisma.sessions.update({
        where: { session_id },
        data: { status: 'canceled' }
    });

    // Also update the payment record status to 'refund'
    const updatedPayment = await prisma.individual_Payments.updateMany({
        where: { session_id },
        data: { status: 'refund' }
    });

    console.log("Updated payment record:", updatedPayment);

    const student = await prisma.student.findUnique({
        where: { student_id: session.student_id },
        select: { User: { select: { name: true, email: true } } }
    });
    console.log("Student details:", student);

    const tutor = await prisma.individual_Tutor.findUnique({
        where: { i_tutor_id: session.i_tutor_id },
        select: { User: { select: { name: true, email: true } } }
    });
    console.log("Tutor details:", tutor);

    const session_date = session.date.toDateString();
    const session_time = session.date.toTimeString();
    
    const reason = "Session canceled by student before 1 hours";

    // for student
    const cancelSession_student = await sendSessionCancellationEmail(
        student?.User?.email,
        'student',
        student?.User?.name || "",
        tutor?.User?.name || "",
        session_date,
        session_time,
        reason,
        amount

    );

    console.log("Cancellation email sent to student:", cancelSession_student);

    const cancelSession_tutor = await sendSessionCancellationEmail(
        tutor?.User?.email,
        'tutor',
        student?.User?.name || "",
        tutor?.User?.name || "",
        session_date,
        session_time,
        reason,
        amount

    );

    console.log("Cancellation email sent to tutor:", cancelSession_tutor);

    

    return updatedSession;
};


// get individual tutors by student_id for dashbotd showcase 

export const getTutorsByStudentId = async (student_id: string) => {
    
    const paidsessions = await prisma.individual_Payments.findMany({
        where: { student_id },
    });

    const totalAmmount = paidsessions
        .filter(payment => payment.status !== 'refund')
        .reduce((sum, payment) => sum + payment.amount.toNumber(), 0);

    console.log("Total amount paid by student:", totalAmmount);

    console.log("Paid sessions:", paidsessions);

    const sessionIds = paidsessions.map(payment => payment.session_id);

    const sessions = await prisma.sessions.findMany({
        where: { 
            session_id: { in: sessionIds }
        },
        select: {
            session_id: true,
            i_tutor_id: true
        }
    });

    const tutorIds = sessions.map(session => session.i_tutor_id);

    console.log("Tutor IDs:", tutorIds);

    const uniqueTutorIds = [...new Set(tutorIds)];

    console.log("Unique Tutor IDs:", uniqueTutorIds);

    const tutors = await prisma.individual_Tutor.findMany({
        where: { i_tutor_id: { in: uniqueTutorIds } },
        include: {
            User: {
                select: {
                    name: true,
                    photo_url: true
                }
            }
        }
    });

    const sessionCountByTutor: { [key: string]: number } = {};
    sessions.forEach(session => {
        sessionCountByTutor[session.i_tutor_id] = (sessionCountByTutor[session.i_tutor_id] || 0) + 1;
    });

    const tutorsWithSessionCount = tutors.map(tutor => ({
        ...tutor,
        sessionCount: sessionCountByTutor[tutor.i_tutor_id] || 0
    }));

    console.log("Tutors with session count:", tutorsWithSessionCount);

    const totalPaiedForTutor = tutorsWithSessionCount.map(tutor => {
        const tutorSessions = sessions.filter(session => session.i_tutor_id === tutor.i_tutor_id);
        const tutorSessionIds = tutorSessions.map(session => session.session_id);
        const totalPaid = paidsessions
            .filter(payment => tutorSessionIds.includes(payment.session_id) && payment.status !== 'refund')
            .reduce((sum, payment) => sum + payment.amount.toNumber(), 0);
        return {
            ...tutor,
            totalPaid
        };
    });

    console.log("Tutors with total paid:", totalPaiedForTutor);

    return totalPaiedForTutor;
    

    // return tutors;

    // const sessions = await prisma.sessions.findMany({
    //     where: { student_id },
    // });

    // const tutorIds = sessions.map(session => session.i_tutor_id);
    // const uniqueTutorIds = Array.from(new Set(tutorIds));

    // const tutors = await prisma.individual_Tutors.findMany({
    //     where: { id: { in: uniqueTutorIds } },
    //     include: {
    //         User: true,
    //         Course: true
    //     }
    // });

    // return tutors;
};  


// get payment summary for student dashboard

export const getPaymentSummaryByStudentId = async (student_id: string, page: number, limit: number) => {
    const paidsessionsfull = await prisma.individual_Payments.findMany({
        where: { student_id },
        include: {
            Sessions: {
                select: {
                    title: true,
                    slots: true,
                    Individual_Tutor: {
                        select: {
                            User: {
                                select: {
                                    name: true,
                                    photo_url: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: { payment_date_time: 'desc' },
        skip: (page - 1) * limit,
        take: limit
    });


    // const sessionIds = paidsessionsfull.map(payment => payment.session_id);

    // const tutors = await prisma.sessions.findMany({
    //     where: { session_id: { in: sessionIds } },
    //     distinct: ['i_tutor_id'],
    //     select: {
    //         Individual_Tutor: {
    //             select:{
    //                 User: {
    //                     select: {
    //                         name: true,
    //                         photo_url: true
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // });

        //     const paidsessionsfull = await prisma.$queryRaw`
        // SELECT 
        //     ip.i_payment_id AS i_payment_id,
        //     ip.payment_date_time,
        //     ip.student_id,
        //     ip.amount,
        //     ip.status,
        //     ip.payment_intent_id,
        //     s.session_id AS session_id,
        //     u.name,
        //     u.photo_url
        // FROM "Individual_Payments" ip
        // JOIN "Sessions" s 
        //     ON ip.session_id = s.id
        // JOIN "Individual_Tutor" it 
        //     ON s.tutor_id = it.id
        // JOIN "Users" u 
        //     ON it.user_id = u.id
        // WHERE ip.student_id = ${student_id}
        // ORDER BY ip.payment_date_time DESC
        // LIMIT ${limit} OFFSET ${(page - 1) * limit};
        // `;


    const paidsessions = await prisma.individual_Payments.findMany({
        where: { student_id },
        orderBy: { payment_date_time: 'desc' },
    });

    const totalAmount = paidsessions.reduce((sum, payment) => sum + payment.amount.toNumber(), 0);

    const successfulPayments = paidsessions.filter(payment => payment.status === 'success');

    const completedSessionCount = await prisma.sessions.count({
        where: {
            student_id,
            status: 'completed'
        }
    });
    const ScheduledSessionCount = await prisma.sessions.count({
        where: {
            student_id,
            status: 'scheduled'
        }
    });
    const canceledSessionCount = await prisma.sessions.count({
        where: {
            student_id,
            status: 'canceled'
        }
    });

    return {
        transactions: paidsessionsfull,
        totalAmount,
        successfulPaymentsCount: successfulPayments.length,
        completedSessionCount,
        ScheduledSessionCount,
        canceledSessionCount
    };
};


export const getTutorNameAndTypeById = async (tutor_id: string) => {
        // Try Individual Tutor first
        const individualTutor = await prisma.individual_Tutor.findUnique({
            where: { i_tutor_id: tutor_id },
            include: {
            User: { select: { name: true } }
            }
        });

        if (individualTutor) {
            return {
            name: individualTutor.User.name,
            type: "individual"
            };
        }

        // Try Mass Tutor if not found in Individual
        const massTutor = await prisma.mass_Tutor.findUnique({
            where: { m_tutor_id: tutor_id },
            include: {
            User: { select: { name: true } }
            }
        });

        if (massTutor) {
            return {
            name: massTutor.User.name,
            type: "mass"
            };
        }

        // If not found in either
        return {
            name: "Unknown Tutor",
            type: "unknown"
        };
};


  




// Mass Class Service in studentService file


// export const getAllMassClasses = async (
//   subjects: string[],
//   min_month_rate: number,
//   max_month_rate: number,
//   rating: number,
//   sort: string,
//   page: number = 1,
//   limit: number = 10
// ) => {

//   console.log("Fetching all mass classes with filters:", {
//     subjects,
//     min_month_rate,
//     max_month_rate,
//     rating,
//     sort,
//     page,
//     limit
//   });

//   const classes = await prisma.class.findMany({
//     where: {
//       ...(subjects && subjects.length > 0 && { subject: { in: subjects } }),
//       ...(rating ? { Mass_Tutor: { rating: { gte: rating } } } : {}),
//       ...(min_month_rate || max_month_rate
//         ? {
//             Mass_Tutor: {
//               prices: {
//                 ...(min_month_rate ? { gte: min_month_rate } : {}),
//                 ...(max_month_rate ? { lte: max_month_rate } : {}),
//               },
//             },
//           }
//         : {}),
//     },
//     include: {
//       Mass_Tutor: {
//         select: {
//           rating: true,
//           prices: true, // ✅ monthly_rate from tutor table
//           User: {
//             select: {
//               name: true,
//               photo_url: true,
//             },
//           },
//         },
//       },
//       _count: {
//         select: { Enrolment: true }, // ✅ enrollment count
//       },
//     },
//     orderBy:
//       sort === "popular"
//         ? { Enrolment: { _count: "desc" } } // most enrolled
//         : sort === "high-rated"
//         ? { Mass_Tutor: { rating: "desc" } }
//         : sort === "low-priced"
//         ? { Mass_Tutor: { prices: "asc" } }
//         : sort === "high-priced"
//         ? { Mass_Tutor: { prices: "desc" } }
//         : { Mass_Tutor: { rating: "desc" } },
//     skip: (page - 1) * limit,
//     take: limit,
//   });

//   return classes.map((cls) => ({
//     ...cls,
//     enrollmentCount: cls._count.Enrolment, // flatten count
//     tutorName: cls.Mass_Tutor.User.name,
//     tutorPhoto: cls.Mass_Tutor.User.photo_url,
//     tutorRating: cls.Mass_Tutor.rating,
//     monthlyRate: cls.Mass_Tutor.prices,
//   }));
// };


// export const getAllMassClasses = async (
//   subjects?: string[],
//   minMonthRate?: number,
//   maxMonthRate?: number,
//   rating?: number,
//   sort: string = "high-rated",
//   page: number = 1,
//   limit: number = 10
// ) => {
//   const where: any = {};

//   if (subjects && subjects.length > 0 && subjects[0] !== "") {
//     where.subject = { in: subjects };
//   }

//   if (rating || minMonthRate || maxMonthRate) {
//     where.Mass_Tutor = {
//       is: {
//         ...(rating ? { rating: { gte: rating } } : {}),
//         ...(minMonthRate || maxMonthRate
//           ? {
//               prices: {
//                 ...(minMonthRate ? { gte: minMonthRate } : {}),
//                 ...(maxMonthRate ? { lte: maxMonthRate } : {}),
//               },
//             }
//           : {}),
//       },
//     };
//   }

//   const classes = await prisma.class.findMany({
//     where,
//     include: {
//       Mass_Tutor: {
//         select: {
//           rating: true,
//           prices: true,
//           User: { select: { name: true, photo_url: true } },
//         },
//       },
//       _count: { select: { Enrolment: true } },
//     },
//     orderBy:
//       sort === "popular"
//         ? { Enrolment: { _count: "desc" } }
//         : sort === "high-rated"
//         ? { Mass_Tutor: { rating: "desc" } }
//         : sort === "low-priced"
//         ? { Mass_Tutor: { prices: "asc" } }
//         : sort === "high-priced"
//         ? { Mass_Tutor: { prices: "desc" } }
//         : undefined,
//     skip: (page - 1) * limit,
//     take: limit,
//   });

//   return classes.map((cls) => ({
//     ...cls,
//     enrollmentCount: cls._count.Enrolment,
//     tutorName: cls.Mass_Tutor.User.name,
//     tutorPhoto: cls.Mass_Tutor.User.photo_url,
//     tutorRating: cls.Mass_Tutor.rating,
//     monthlyRate: cls.Mass_Tutor.prices,
//   }));
// };


// export const getAllMassClasses = async (
//   subjects?: string[],
//   minMonthRate?: number,
//   maxMonthRate?: number,
//   rating?: number,
//   tutorName?: string,
//   classTitle?: string,
//   sort: string = "high-rated",
//   page: number = 1,
//   limit: number = 10
// ) => {
//   const where: any = {};

//   // Subject filter
//   if (subjects && subjects.length > 0 && subjects[0] !== "") {
//     where.subject = { in: subjects };
//   }

//   // Class title filter (case-insensitive)
//   if (classTitle && classTitle.trim() !== "") {
//     where.title = { contains: classTitle.trim(), mode: "insensitive" };
//   }

//   // Mass_Tutor filters
//   if (rating || minMonthRate || maxMonthRate || tutorName) {
//     where.Mass_Tutor = {
//       is: {
//         ...(rating ? { rating: { gte: rating } } : {}),
//         ...(minMonthRate || maxMonthRate
//           ? {
//               prices: {
//                 ...(minMonthRate ? { gte: minMonthRate } : {}),
//                 ...(maxMonthRate ? { lte: maxMonthRate } : {}),
//               },
//             }
//           : {}),
//         ...(tutorName
//           ? { User: { name: { contains: tutorName.trim(), mode: "insensitive" } } }
//           : {}),
//       },
//     };
//   }

//   // Fetch classes
//   const classes = await prisma.class.findMany({
//     where,
//     include: {
//       Mass_Tutor: {
//         select: {
//           rating: true,
//           prices: true,
//           User: { select: { name: true, photo_url: true } },
//         },
//       },
//       _count: { select: { Enrolment: true } },
//     },
//     orderBy:
//       sort === "popular"
//         ? { Enrolment: { _count: "desc" } }
//         : sort === "high-rated"
//         ? { Mass_Tutor: { rating: "desc" } }
//         : sort === "low-priced"
//         ? { Mass_Tutor: { prices: "asc" } }
//         : sort === "high-priced"
//         ? { Mass_Tutor: { prices: "desc" } }
//         : undefined,
//     skip: (page - 1) * limit,
//     take: limit,
//   });

//   // Flatten for frontend
//   return classes.map((cls) => ({
//     ...cls,
//     enrollmentCount: cls._count.Enrolment,
//     tutorName: cls.Mass_Tutor.User.name,
//     tutorPhoto: cls.Mass_Tutor.User.photo_url,
//     tutorRating: cls.Mass_Tutor.rating,
//     monthlyRate: cls.Mass_Tutor.prices,
//   }));
// };




// export const getAllMassClasses = async (
//   subjects?: string[],
//   minMonthRate?: number,
//   maxMonthRate?: number,
//   rating?: number,
//   searchTerm?: string, // 🔹 single search term
//   sort: string = "high-rated",
//   page: number = 1,
//   limit: number = 10
// ) => {
//   const where: any = {};

//   // Subject filter
//   if (subjects && subjects.length > 0 && subjects[0] !== "") {
//     where.subject = { in: subjects };
//   }

//   // Mass_Tutor filters
//   if (rating || minMonthRate || maxMonthRate || searchTerm) {
//     where.Mass_Tutor = {
//       is: {
//         status: "active", // 🔹 Only active tutors
//         ...(rating ? { rating: { gte: rating } } : {}),
//         ...(minMonthRate || maxMonthRate
//           ? {
//               prices: {
//                 ...(minMonthRate ? { gte: minMonthRate } : {}),
//                 ...(maxMonthRate ? { lte: maxMonthRate } : {}),
//               },
//             }
//           : {}),
//       },
//     };
//   }

//   // 🔹 Search across class title OR tutor name
//   if (searchTerm && searchTerm.trim() !== "") {
//     where.OR = [
//       { title: { contains: searchTerm.trim(), mode: "insensitive" } },
//       {
//         Mass_Tutor: {
//           is: {
//             status: "active", // 🔹 Only active tutors
//             User: {
//               name: { contains: searchTerm.trim(), mode: "insensitive" },
//             },
//           },
//         },
//       },
//     ];
//   }

//   // Fetch classes
//   const classes = await prisma.class.findMany({
//     where,
//     include: {
//       Mass_Tutor: { 
//         select: {
//           rating: true,
//           prices: true,
//           User: { select: { name: true, photo_url: true } },
//         },
//       },
//       _count: { select: { Enrolment: true } },
//     },
//     orderBy:
//       sort === "popular"
//         ? { Enrolment: { _count: "desc" } }
//         : sort === "high-rated"
//         ? { Mass_Tutor: { rating: "desc" } }
//         : sort === "low-priced"
//         ? { Mass_Tutor: { prices: "asc" } }
//         : sort === "high-priced"
//         ? { Mass_Tutor: { prices: "desc" } }
//         : undefined,
//     skip: (page - 1) * limit,
//     take: limit,
//   });

//   console.log("Fetched classes:", classes);

//   // Flatten for frontend
//   return classes.map((cls) => ({
//     ...cls,
//     enrollmentCount: cls._count.Enrolment,
//     tutorName: cls.Mass_Tutor.User.name,
//     tutorPhoto: cls.Mass_Tutor.User.photo_url,
//     tutorRating: cls.Mass_Tutor.rating,
//     monthlyRate: cls.Mass_Tutor.prices,
//   }));
// };


export const getAllMassClasses = async (
  subjects?: string[],
  minMonthRate?: number,
  maxMonthRate?: number,
  rating?: number,
  searchTerm?: string, // 🔹 single search term
  sort: string = "high-rated",
  page: number = 1,
  limit: number = 10
) => {
  const where: any = {};

  // Subject filter
  if (subjects && subjects.length > 0 && subjects[0] !== "") {
    where.subject = { in: subjects };
  }

  // Mass_Tutor filters (rating, price, and status)
  where.Mass_Tutor = {
    is: {
      status: "active", // 🔹 Only active tutors
      ...(rating ? { rating: { gte: rating } } : {}),
      ...(minMonthRate || maxMonthRate
        ? {
            prices: {
              ...(minMonthRate ? { gte: minMonthRate } : {}),
              ...(maxMonthRate ? { lte: maxMonthRate } : {}),
            },
          }
        : {}),
    },
  };

  // 🔹 Search across class title OR tutor name
  if (searchTerm && searchTerm.trim() !== "") {
    where.OR = [
      { title: { contains: searchTerm.trim(), mode: "insensitive" } },
      {
        Mass_Tutor: {
          is: {
            status: "active", // ensure search still respects active tutors
            User: {
              name: { contains: searchTerm.trim(), mode: "insensitive" },
            },
          },
        },
      },
    ];
  }

  // Fetch classes
  const classes = await prisma.class.findMany({
    where,
    include: {
      Mass_Tutor: {
        select: {
          status: true,
          rating: true,
          prices: true,
          User: { select: { name: true, photo_url: true } },
        },
      },
      _count: { select: { Enrolment: true } },
    },
    orderBy:
      sort === "popular"
        ? { Enrolment: { _count: "desc" } }
        : sort === "high-rated"
        ? { Mass_Tutor: { rating: "desc" } }
        : sort === "low-priced"
        ? { Mass_Tutor: { prices: "asc" } }
        : sort === "high-priced"
        ? { Mass_Tutor: { prices: "desc" } }
        : undefined,
    skip: (page - 1) * limit,
    take: limit,
  });

  console.log("Fetched classes:", classes);

  // Flatten for frontend
  return classes.map((cls) => ({
    ...cls,
    enrollmentCount: cls._count.Enrolment,
    tutorName: cls.Mass_Tutor.User.name,
    tutorPhoto: cls.Mass_Tutor.User.photo_url,
    tutorRating: cls.Mass_Tutor.rating,
    monthlyRate: cls.Mass_Tutor.prices,
  }));
};



export const getMassTutorById = async (m_tutor_id: string) => {
    const tutor = await prisma.mass_Tutor.findUnique({
        where: { m_tutor_id },
        include: {
            User: { select: { name: true, photo_url: true } },
            Class : {
                select: {
                    class_id: true,
                    title: true,
                    subject: true,
                    time: true,
                    day: true,
                    description: true,
                    Rating_N_Review_Class:{
                        select: {
                            rating: true,
                            review: true,
                            Student:{
                                select: {
                                    User:{
                                        select:{
                                            name:true,
                                            photo_url:true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    _count:{
                        select:{ Enrolment:true }
                    }
                },
            },
            
        },

    });

    if (!tutor) throw new Error("Tutor not found");

    // return {
    //     id: tutor.m_tutor_id,
    //     name: tutor.User.name,
    //     photo: tutor.User.photo_url,
    //     rating: tutor.rating,
    //     prices: tutor.prices,
    // };
    return tutor;
};



export const getClassByClassIdAndStudentId = async (class_id: string,student_id:string) => {
    const classInfo = await prisma.class.findUnique({
        where: { class_id },
        select: {
            title: true,
            description: true,
            subject: true,
            day: true,
            time: true,
            Mass_Tutor:{
                include:{
                    User:{
                        select:{
                            name:true,
                            photo_url:true
                        }
                    }
            }
            },
            _count:{
                select:{ Enrolment:true }
            }
        }
    })

    const enrollmentStatus = await prisma.enrolment.findMany({
        where: { class_id, student_id },
        select: {
            status: true,
        }
    });


    return {
        ...classInfo, 
        enrollmentStatus: enrollmentStatus.length > 0 ? enrollmentStatus[0] : null
    };

};


export const getClassSlotsByClassID = async (class_id: string, month: number) => {
    const slots = await prisma.classSlot.findMany({
        where: {
            class_id,
            dateTime: {
                gte: new Date(new Date().getFullYear(), month - 1, 1),
                lt: new Date(new Date().getFullYear(), month, 1),
            },
        },
        orderBy: { dateTime: 'asc' },
    });

    return slots;
};

export const getClassByStudentId = async (student_id: string) => {
    const classes = await prisma.class.findMany({
        where: { Enrolment: { some: { student_id } } },
        include: {
            Mass_Tutor: {
                include: {
                    User: { select: { name: true, photo_url: true } },
                },
            },
            _count: { select: { Enrolment: true } },
            ClassSlot:{
                where:{
                    dateTime: {gte: new Date()}
                },
                orderBy:{
                    dateTime:'asc'
                },
                take:1
            },
            Enrolment:{
                where:{student_id},
                select:{status:true}
            }
        },
    });


    return classes;

    // return classes.map((cls) => ({
    //     ...cls,
    //     enrollmentCount: cls._count.Enrolment,
    //     tutorName: cls.Mass_Tutor.User.name,
    //     tutorPhoto: cls.Mass_Tutor.User.photo_url,
    // }));
};


export const getMassTutorsByStudentId = async (student_id: string) => {
    
    const enrolments = await prisma.enrolment.findMany({
        where: { student_id },
    });
    const classIds = enrolments.map(enrol => enrol.class_id);

    const classes = await prisma.class.findMany({
        where: { class_id: { in: classIds } },
        select: {
            m_tutor_id: true
        }
    });

   const massTutorIds = classes.map(cls => cls.m_tutor_id);
   const massTutors = await prisma.mass_Tutor.findMany({
       where: { m_tutor_id: { in: massTutorIds } },
       include: {
           User: {
               select: {
                   name: true,
                   photo_url: true
               }
           }
       }
   });

   return massTutors;
};

// For create a payment record after successful payment
export const createMassPayment = async (
    student_id: string,
    class_id: string,
    paid_amount: number,
) => {
    // Create a payment intent for the mass payment
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const currentMonth = new Date().getMonth();
    
    const payment = await prisma.mass_Payments.create({
        data: {
            student_id,
            class_id,
            amount: paid_amount,
            paidMonth: monthNames[currentMonth],
            status: 'success',
        }
    });

    return payment;
};

// For create a enrolment record after successful payment
// export const createEnrolment = async (
//     student_id: string,
//     class_id: string,
//     subscription_id: string
// ) => {
//     const enrolment = await prisma.enrolment.create({
//         data: {
//             student_id,
//             class_id,
//             subscription_id,
//         }
//     });

//     return enrolment;
// };


export const createEnrolment = async (
  student_id: string,
  class_id: string
) => {
  // Check if enrolment already exists
  const existingEnrolment = await prisma.enrolment.findFirst({
    where: {
      student_id,
      class_id,
    },
  });

  if (existingEnrolment) {
    // Update the existing record: set status to 'valid' and update subscription_id
    const updatedEnrolment = await prisma.enrolment.update({
      where: { enrol_id: existingEnrolment.enrol_id },
      data: {
        status: 'valid', // assuming you have a 'status' field
      },
    });
    return updatedEnrolment;
  } else {
    // Create a new enrolment record
    const enrolment = await prisma.enrolment.create({
      data: {
        student_id,
        class_id,
        status: 'valid', // set initial status to valid
      },
    });
    return enrolment;
  }
};


// for reating Mass Tutors Classes

export const rateMassTurorClass= async(student_id:string,class_id:string,review:string,rating:number)=>{
   
    // const rate=prisma.rating_N_Review_Class.create({
    //     data:{
    //         student_id,
    //         class_id,
    //         review,
    //         rating
    //     }
    // })

    // After creating the rating, recalculate the tutor's average rating
        // Check if rating already exists for this student and class
        const existingRating = await prisma.rating_N_Review_Class.findFirst({
            where: {
                student_id,
                class_id
            }
        });

        let orate;
        if (existingRating) {
            // Update existing rating
            orate = await prisma.rating_N_Review_Class.update({
                where: { r_id: existingRating.r_id },
                data: {
                    review,
                    rating
                }
            });
        } else {
            // Create new rating
            orate = await prisma.rating_N_Review_Class.create({
                data: {
                    student_id,
                    class_id,
                    review,
                    rating
                }
            });
        }

        const classInfo = await prisma.class.findUnique({
            where: { class_id },
            select: { m_tutor_id: true }
        });

        if (classInfo) {
            // Get all ratings for all classes taught by this tutor
            const allRatings = await prisma.rating_N_Review_Class.findMany({
                where: {
                    Class: {
                        m_tutor_id: classInfo.m_tutor_id
                    }
                },
                select: { rating: true }
            });

            // Calculate average rating
            if (allRatings.length > 0) {
                const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
                const averageRating = totalRating / allRatings.length;

                // Update the tutor's rating
                await prisma.mass_Tutor.update({
                    where: { m_tutor_id: classInfo.m_tutor_id },
                    data: { rating: averageRating }
                });
            }
        }

        return orate;



}


// for getting reviewa for classID

export const getReviewsByClassId=async(class_id:string)=>{
    const reviews=await prisma.rating_N_Review_Class.findMany({
        where:{class_id},
        include:{
            Student:{
                  select:{
                     User:{
                        select:{
                            name:true,
                            photo_url:true,
                        }
                     }
                  }
            }
        }
    });

    return reviews;
}


export const getMassPaymentsByStudentId=async(student_id:string,page:number,limit:number)=>{
   const payments=await prisma.mass_Payments.findMany({
       where:{student_id},
       include:{
         Class :{
           select:{
             title: true,
             Mass_Tutor:{
                select:{
                    User:{
                        select:{
                            name:true,
                            photo_url:true,
                        }
                    }
                }
         }
           }
         },
       },
       orderBy:{payment_time:'desc'},
       skip:(page-1)*limit,
       take:limit
   })

   return payments;
}


