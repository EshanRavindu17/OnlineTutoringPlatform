import prisma from "../prismaClient";


export const rateAndReviewIndividualTutor = async (student_id: string, session_id: string, rating: number, review: string) => {
  // Step 1: Check if session exists and belongs to the student
  const session = await prisma.sessions.findUnique({
    where: { session_id , status: 'completed' },
    include: {
      Student: { select: { student_id: true } }
    }
  });

  console.log("Session found:", session);

  if (!session || session.Student.student_id !== student_id) {
    throw new Error('Session not found or does not belong to the student');
  }

  // Step 2: Check if review already exists for this student & session
  const existingReview = await prisma.rating_N_Review_Session.findFirst({
    where: { student_id, session_id }
  });

    console.log("Existing review:", existingReview);

  let reviewResult;

  if (existingReview) {
    // Step 3a: Update existing review
    reviewResult = await prisma.rating_N_Review_Session.update({
      where: { r_id: existingReview.r_id }, // update by primary key
      data: { rating, review }
    });

    console.log("Review updated:", reviewResult);
  } else {
    // Step 3b: Create a new review
    reviewResult = await prisma.rating_N_Review_Session.create({
      data: { student_id, session_id, rating, review }
    });

    console.log("Review created:", reviewResult);
  }

  // update the rating of the tutor in the IndividualTutor table
    const tutorId = session.i_tutor_id;
    console.log("Tutor ID:", tutorId);
    const tutorSessions = await prisma.sessions.findMany({
        where: { i_tutor_id: tutorId },
        include: {
            Rating_N_Review_Session: true
        }
    });
    console.log("Tutor sessions with reviews:", tutorSessions);

   // Calculate the average rating for the tutor
   const totalRatings = tutorSessions.reduce((acc, session) => {
       const sessionRatings = session.Rating_N_Review_Session || [];
       const sessionTotal = sessionRatings.reduce((sessionAcc, review) => {
           return sessionAcc + (review.rating ? Number(review.rating) : 0);
       }, 0);
       return acc + sessionTotal;
   }, 0);
   console.log("Total ratings:", totalRatings);
   const totalReviews = tutorSessions.reduce((acc, session) => {
       return acc + (session.Rating_N_Review_Session?.length || 0);
   }, 0);
    console.log("Total reviews:", totalReviews);
   const averageRating = totalReviews > 0 ? totalRatings / totalReviews : 0;
    console.log("Average rating:", averageRating);
   // Update the tutor's average rating
   await prisma.individual_Tutor.update({
       where: { i_tutor_id: tutorId },
       data: { rating: averageRating }
   });

   return reviewResult;
};


export const getReviewsByIndividualTutorId = async (i_tutor_id: string) => {
    // Fetch all reviews for sessions conducted by the specified individual tutor



    const sessions = await prisma.sessions.findMany({
        where: { i_tutor_id },
        include: {
            Rating_N_Review_Session: {
                include:{
                    Student: {
                        select: {
                            User :{
                                select: {
                                    name: true,
                                    email: true,
                                    photo_url: true,
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    return sessions.flatMap(session => session.Rating_N_Review_Session);

    // const reviews = await prisma.rating_N_Review_Session.findMany({
    //     where: { session: { i_tutor_id } },
    //     include: {
    //         Student: {
    //             select: { name: true, email: true }
    //         },
    //         session: {
    //             select: { date: true }
    //     }
    //     }
    // });
    // return reviews;
}

