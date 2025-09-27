import prisma from "../prismaClient";


export const getAllSubjects = async () => {
  const subjects = await prisma.subjects.findMany();
  return subjects;
};

export const getAllTitlesBySubject = async (sub_id:string) => {
  const titles = await prisma.titles.findMany({
    where: {
      sub_id: sub_id
    }
  });
  return titles;
};

export const getAllTitles = async () => {
const titles = await prisma.titles.findMany({
    select: {
        name: true,
        Subjects: {
            select: {
                name: true
            }
        }
    }
});
  return titles;
};

export const createSubject = async (name: string) => {
  // Check if subject already exists
  const existingSubject = await prisma.subjects.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive' // Case-insensitive search
      }
    }
  });

  if (existingSubject) {
    throw new Error('Subject already exists');
  }

  const subject = await prisma.subjects.create({
    data: {
      name: name
    }
  });
  return subject;
};

export const createTitle = async (name: string, sub_id: string) => {
  // Check if title already exists for this subject
  const existingTitle = await prisma.titles.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive' // Case-insensitive search
      },
      sub_id: sub_id
    }
  });

  if (existingTitle) {
    throw new Error('Title already exists for this subject');
  }

  // Verify subject exists
  const subject = await prisma.subjects.findUnique({
    where: {
      sub_id: sub_id
    }
  });

  if (!subject) {
    throw new Error('Subject not found');
  }

  const title = await prisma.titles.create({
    data: {
      name: name,
      sub_id: sub_id
    }
  });
  return title;
};

// Dashboard service functions

export const getTutorProfile = async (firebaseUid: string) => {
  // First get user from Firebase UID
  const user = await prisma.user.findUnique({
    where: {
      firebase_uid: firebaseUid
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get tutor profile
  const tutorProfile = await prisma.individual_Tutor.findFirst({
    where: {
      user_id: user.id
    },
    include: {
      User: {
        select: {
          name: true,
          email: true,
          photo_url: true,
          dob: true,
          created_at: true
        }
      }
    }
  });

  if (!tutorProfile) {
    throw new Error('Tutor profile not found');
  }

  return tutorProfile;
};

export const getTutorStatistics = async (tutorId: string) => {
  // Get total sessions count
  const totalSessionsCount = await prisma.sessions.count({
    where: {
      i_tutor_id: tutorId
    }
  });

  const totalEarningsSum = await prisma.sessions.aggregate({
    where: {
      i_tutor_id: tutorId,
      status: 'completed'
    },
    _sum: {
      price: true
    }
  });

  // Get session counts by status
  const sessionCounts = await prisma.sessions.groupBy({
    by: ['status'],
    where: {
      i_tutor_id: tutorId
    },
    _count: {
      session_id: true
    }
  });

  // Get monthly earnings (current month)
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  const monthlyEarnings = await prisma.sessions.aggregate({
    where: {
      i_tutor_id: tutorId,
      status: 'completed',
      created_at: {
        gte: startOfMonth
      }
    },
    _sum: {
      price: true
    }
  });

  // Get weekly earnings (last 7 days)
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const weeklyEarnings = await prisma.sessions.aggregate({
    where: {
      i_tutor_id: tutorId,
      status: 'completed',
      created_at: {
        gte: startOfWeek
      }
    },
    _sum: {
      price: true
    }
  });

  // Get reviews count and average rating
  const reviewsStats = await prisma.rating_N_Review_Session.aggregate({
    where: {
      Sessions: {
        i_tutor_id: tutorId
      }
    },
    _count: {
      r_id: true
    },
    _avg: {
      rating: true
    }
  });

  const completedSessions = sessionCounts.find(s => s.status === 'completed')?._count.session_id || 0;
  const scheduledSessions = sessionCounts.find(s => s.status === 'scheduled')?._count.session_id || 0;
  const canceledSessions = sessionCounts.find(s => s.status === 'canceled')?._count.session_id || 0;

  return {
    totalSessions: totalSessionsCount,
    completedSessions,
    upcomingSessions: scheduledSessions,
    cancelledSessions: canceledSessions,
    totalEarnings: totalEarningsSum._sum.price || 0,
    monthlyEarnings: monthlyEarnings._sum.price || 0,
    weeklyEarnings: weeklyEarnings._sum.price || 0,
    averageRating: Number(reviewsStats._avg.rating) || 0,
    totalReviews: reviewsStats._count.r_id || 0
  };
};

// Update user profile photo
export const updateUserPhoto = async (firebaseUid: string, photoUrl: string) => {
  // First verify user exists
  const user = await prisma.user.findUnique({
    where: {
      firebase_uid: firebaseUid
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Update the photo URL
  const updatedUser = await prisma.user.update({
    where: {
      firebase_uid: firebaseUid
    },
    data: {
      photo_url: photoUrl
    },
    select: {
      id: true,
      name: true,
      email: true,
      photo_url: true,
      firebase_uid: true
    }
  });

  return updatedUser;
};

// Update user profile photo with file upload
export const uploadAndUpdateUserPhoto = async (firebaseUid: string, file: any) => {
  // First verify user exists
  const user = await prisma.user.findUnique({
    where: {
      firebase_uid: firebaseUid
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // The file should already be uploaded to Cloudinary by multer middleware
  // file.path contains the Cloudinary URL
  const photoUrl = file.path;

  // Update the photo URL in database
  const updatedUser = await prisma.user.update({
    where: {
      firebase_uid: firebaseUid
    },
    data: {
      photo_url: photoUrl
    },
    select: {
      id: true,
      name: true,
      email: true,
      photo_url: true,
      firebase_uid: true
    }
  });

  return updatedUser;
};

// Update tutor qualifications
export const updateTutorQualifications = async (firebaseUid: string, qualifications: string[]) => {
  // First get user from Firebase UID
  const user = await prisma.user.findUnique({
    where: {
      firebase_uid: firebaseUid
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get and update tutor profile
  const tutorProfile = await prisma.individual_Tutor.findFirst({
    where: {
      user_id: user.id
    }
  });

  if (!tutorProfile) {
    throw new Error('Tutor profile not found');
  }

  // Update qualifications
  const updatedTutor = await prisma.individual_Tutor.update({
    where: {
      i_tutor_id: tutorProfile.i_tutor_id
    },
    data: {
      qualifications: qualifications
    },
    include: {
      User: {
        select: {
          name: true,
          email: true,
          photo_url: true,
          dob: true,
          created_at: true
        }
      }
    }
  });

  return updatedTutor;
};

// Update tutor hourly rate
export const updateTutorHourlyRate = async (firebaseUid: string, hourlyRate: number) => {
  // Validate hourly rate
  if (hourlyRate < 0 || hourlyRate > 300) {
    throw new Error('Hourly rate must be between $0 and $300');
  }

  // First get user from Firebase UID
  const user = await prisma.user.findUnique({
    where: {
      firebase_uid: firebaseUid
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get and update tutor profile
  const tutorProfile = await prisma.individual_Tutor.findFirst({
    where: {
      user_id: user.id
    }
  });

  if (!tutorProfile) {
    throw new Error('Tutor profile not found');
  }

  // Update hourly rate
  const updatedTutor = await prisma.individual_Tutor.update({
    where: {
      i_tutor_id: tutorProfile.i_tutor_id
    },
    data: {
      hourly_rate: hourlyRate
    },
    include: {
      User: {
        select: {
          name: true,
          email: true,
          photo_url: true,
          dob: true,
          created_at: true
        }
      }
    }
  });

  return updatedTutor;
};

// Update tutor subjects and titles
export const updateTutorSubjectsAndTitles = async (firebaseUid: string, subjects: string[], titles: string[]) => {
  // Validate inputs
  if (!Array.isArray(subjects)) {
    throw new Error('Subjects must be an array');
  }
  
  if (!Array.isArray(titles)) {
    throw new Error('Titles must be an array');
  }

  // First get user from Firebase UID
  const user = await prisma.user.findUnique({
    where: {
      firebase_uid: firebaseUid
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get and update tutor profile
  const tutorProfile = await prisma.individual_Tutor.findFirst({
    where: {
      user_id: user.id
    }
  });

  if (!tutorProfile) {
    throw new Error('Tutor profile not found');
  }

  // Validate that all subject IDs exist
  if (subjects.length > 0) {
    const existingSubjects = await prisma.subjects.findMany({
      where: {
        sub_id: {
          in: subjects
        }
      }
    });

    if (existingSubjects.length !== subjects.length) {
      throw new Error('One or more subject IDs are invalid');
    }
  }

  // Validate that all title IDs exist
  if (titles.length > 0) {
    const existingTitles = await prisma.titles.findMany({
      where: {
        title_id: {
          in: titles
        }
      }
    });

    if (existingTitles.length !== titles.length) {
      throw new Error('One or more title IDs are invalid');
    }
  }

  // Update subjects and titles
  const updatedTutor = await prisma.individual_Tutor.update({
    where: {
      i_tutor_id: tutorProfile.i_tutor_id
    },
    data: {
      subjects: subjects,
      titles: titles
    },
    include: {
      User: {
        select: {
          name: true,
          email: true,
          photo_url: true,
          dob: true,
          created_at: true
        }
      }
    }
  });

  return updatedTutor;
};

// Update tutor personal information
export const updateTutorPersonalInfo = async (firebaseUid: string, personalData: {
  name: string;
  description: string;
  phone_number: string;
  heading?: string | null;
}) => {
  // Find the tutor profile
  const tutorProfile = await prisma.individual_Tutor.findFirst({
    where: {
      User: {
        firebase_uid: firebaseUid
      }
    }
  });

  if (!tutorProfile) {
    throw new Error('Tutor profile not found');
  }

  // Update both user and tutor tables
  const [updatedUser, updatedTutor] = await prisma.$transaction([
    // Update user name
    prisma.user.update({
      where: {
        firebase_uid: firebaseUid
      },
      data: {
        name: personalData.name
      }
    }),
    // Update tutor profile
    prisma.individual_Tutor.update({
      where: {
        i_tutor_id: tutorProfile.i_tutor_id
      },
      data: {
        description: personalData.description,
        phone_number: personalData.phone_number,
        heading: personalData.heading
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
            photo_url: true,
            dob: true,
            created_at: true
          }
        }
      }
    })
  ]);

  return updatedTutor;
};
