import axios from 'axios';
import { auth } from '../firebase';
import { useSecureAuth } from '../hooks/useSecureAuth';

interface StudentProfile {
    firebase_uid: string;
    name: string;
    email: string;
    dob?: string;
    bio?: string;
    photo_url?: string; // Added photo_url to match backend response
    profileImage?: File | string | null; // Can be a File object or a URL string
    role: 'student' | 'Individual' | 'Mass' | 'Admin';
}

interface IndividualTutor {
  i_tutor_id: string;
  subjects: string[];
  titles: string[];
  hourly_rate: number;
  rating: number;
  description: string;
  qualifications: string[];
  location:string;
  phone_number:string;
  heading?: string;
  User?: {
    name: string;
    photo_url: string | null;
    email: string | null;
  } | null;
  uniqueStudentsCount: number;
  completedSessionsCount: number;

}

export interface IndividualTutorDashboard {
  i_tutor_id: string;
  subjects: string[];
  titles: string[];
  hourly_rate: number;
  rating: number;
  description: string;
  qualifications: string[];
  location:string;
  phone_number:string;
  heading?: string;
  User?: {
    name: string;
    photo_url: string | null;
    email: string | null;
  } | null;
  sessionCount: number;
  totalPaid: number;
}

interface FreeTimeSlot {
  slot_id: string;
  i_tutor_id: string;
  date: string;
  status: string;
  start_time: string;
  end_time: string;
  last_access_time: string | null;
}

interface Transaction {
    i_payment_id: string;
    student_id : string;
    session_id : string;
    amount: number;
    payment_date_time : Date;
    status : string;
    method : string;
    payment_intent_id : string;
    Sessions:{
        title: string;
        slots: string[];
        Individual_Tutor:{
            User:{
                name:string;
                photo_url:string|null;
            }
        }
    }
}

interface IndividualPaymentHistoryData{
    transactions: Transaction[];
    totalAmount: number;
    successfulPaymentsCount:number,
    completedSessionCount : number
    ScheduledSessionCount: number,
    canceledSessionCount: number
}

interface MassPaymentTransaction {
    m_payment_id: string;
    student_id: string;
    class_id: string;
    amount: number;
    payment_time: Date;
    status: string;
    method: string;
    paidMonth: string;
    payment_intent_id: string;
    Class?: {
        subject: string;
        Mass_Tutor?: {
            User?: {
                name: string;
                photo_url: string | null;
            };
            heading?: string;
        };
    };
}

interface MassPaymentHistoryData {
    transactions: MassPaymentTransaction[];
    totalAmount: number;
    successfulPaymentsCount: number;
    totalClasses: number;
    totalMonthsPaid: number;
}

export interface Session {
  session_id: string;
  date: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  status: 'scheduled' | 'ongoing' | 'canceled' | 'completed';
  meeting_urls: string[] | null;
  materials: string[];
  material_links: string[];
  slots: string[]; // Array of slot times like "1970-01-01T15:00:00.000Z"
  created_at: string; // When the session was created (from backend)
  rating?: number;
  feedback?: string;
  reason?: string;
  cancelledBy?: string;
  refunded?: boolean;
  Individual_Tutor: {
    User: {
      name: string;
    };
    Course?: {
      course_name: string;
    };
  };
}

export interface EnrolledClass {
  class_id: string;
  class_name: string;
  description: string;
  subject: string;
  price: number;
  duration: string; // e.g., "2 hours"
  schedule: string; // e.g., "Every Sunday at 6:00 PM"
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'upcoming' | 'cancelled';
  students_enrolled: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  enrollment_date: string;
  meeting_link?: string;
  next_session?: string;
  tutor: {
    id: string;
    name: string;
    photo_url: string | null;
    rating: number;
  };
}


interface SessionData{
    student_id: string;
    i_tutor_id: string;
    slots: string[];// Array of slot times like "1970-01-01T15:00:00.000Z"
    status: string;
    price: number;
    date: string; // Date of the session
}

interface Student{
    user_id:string;
    points:number;
}

const baseUrl = 'http://localhost:5000/api';
const baseUrl2 = 'http://localhost:5000/student';


export const addStudent = async (studentData: Student): Promise<Student> => {
    console.log('Adding new student...', studentData);

    try {
        const response = await axios.post<Student>(
            `${baseUrl2}/addStudent`,
            studentData
        );
        console.log('✅ Student added successfully:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Error adding student:', error);
        throw error;
    }
};

export const updateStudentProfile = async (
    profileData: Partial<StudentProfile>
): Promise<StudentProfile> => {
    console.log('Updating student profile...student', profileData);

    const formData = new FormData();
    
    if (profileData.firebase_uid) {
        formData.append('firebase_uid', profileData.firebase_uid);
    }
    if (profileData.name) {
        formData.append('name', profileData.name);
    }
    if (profileData.email) {
        formData.append('email', profileData.email);
    }
    if (profileData.dob) {
        formData.append('dob', profileData.dob);
    }
    if (profileData.bio) {
        formData.append('bio', profileData.bio);
    }
    if (profileData.role) {
        formData.append('role', profileData.role);
    }
    // Only append profileImage if it's a File object (for upload)
    if (profileData.profileImage && profileData.profileImage instanceof File) {
        formData.append('profileImage', profileData.profileImage);
    }


    console.log('profile image', profileData.profileImage);

    console.log('Form data prepared:');
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }

    try {
        console.log('🔑 Getting Firebase ID token...');
        
        // Get the current user and their ID token with smart refresh logic
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Authentication required: Please log in to update your profile');
        }
        
        // Smart token management - only refresh if needed
        let idToken;
        try {
            // Try cached token first
            idToken = await currentUser.getIdToken(false);
            
            // Check if token is about to expire (within 5 minutes)
            const payload = JSON.parse(atob(idToken.split('.')[1]));
            const currentTime = Date.now() / 1000;
            
            if (payload.exp <= (currentTime + 300)) {
                console.log('🔄 Token expiring soon, refreshing...');
                idToken = await currentUser.getIdToken(true);
            } else {
                console.log('✅ Using valid cached token');
            }
        } catch {
            // If token parsing fails, get fresh token
            console.log('🔄 Getting fresh token...');
            idToken = await currentUser.getIdToken(true);
        }
        
        if (!idToken) {
            throw new Error('Authentication failed: Unable to retrieve valid token');
        }
        
        console.log('📤 Making authenticated API call...');
        const response = await axios.post<StudentProfile>(
            `${baseUrl}/update-profile/${profileData.firebase_uid}`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            }
        );
        console.log('✅ Profile updated successfully:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to update student profile:', error);
        
        // Enhanced error handling for authentication issues
        if (error.response?.status === 401) {
            throw new Error('Authentication expired: Please log in again');
        } else if (error.response?.status === 403) {
            throw new Error('Access denied: Insufficient permissions');
        } else if (error.response?.data?.error) {
            throw new Error(`Update failed: ${error.response.data.error}`);
        } else if (error.code === 'auth/id-token-expired') {
            throw new Error('Session expired: Please log in again');
        } else {
            throw new Error(`Profile update failed: ${error.message || 'Unknown error occurred'}`);
        }
    }
};


export const getIndividualTutorById = async (tutorId: string) => {
    try {
        const response = await axios.get<IndividualTutor>(
            `${baseUrl2}/getIndividualTutorById/${tutorId}`
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to fetch individual tutor:', error);
        throw new Error(`Failed to fetch individual tutor: ${error.message || 'Unknown error occurred'}`);
    }
};

export const getFreeTimeSlotsByTutorId = async (tutorId: string) => {
    try {
        const response = await axios.get<FreeTimeSlot[]>(
            `${baseUrl2}/getSlotsOfIndividualTutorById/${tutorId}`
        );
        console.log('Free time slots fetched:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to fetch free time slots:', error);
        throw new Error(`Failed to fetch free time slots: ${error.message || 'Unknown error occurred'}`);
    }
};


export const getAllSessionsByStudentId = async (studentId: string) => {
    console.log('Fetching all sessions for student ID:', studentId);
    try {
        const response = await axios.get<Session[]>(
            `${baseUrl2}/getAllSessionsByStudentId/${studentId}`
        );
        console.log('All sessions fetched:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to fetch all sessions:', error);
        throw new Error(`Failed to fetch all sessions: ${error.message || 'Unknown error occurred'}`);
    }
};

export const getEnrolledClassesByStudentId = async (studentId: string) => {
    console.log('Fetching enrolled classes for student ID:', studentId);
    try {
        const response = await axios.get<EnrolledClass[]>(
            `${baseUrl2}/getEnrolledClassesByStudentId/${studentId}`
        );
        console.log('Enrolled classes fetched:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to fetch enrolled classes:', error);
        // For now, return mock data if API fails
        return getMockEnrolledClasses();
    }
};

// Mock data for enrolled classes (temporary until backend is ready)
const getMockEnrolledClasses = (): EnrolledClass[] => {
    return [
        {
            class_id: '1',
            class_name: 'Advanced Mathematics Masterclass',
            description: 'Comprehensive calculus and linear algebra preparation for advanced students',
            subject: 'Mathematics',
            price: 12000,
            duration: '2 hours',
            schedule: 'Every Sunday at 6:00 PM',
            start_date: '2025-09-15',
            end_date: '2025-12-15',
            status: 'active',
            students_enrolled: 28,
            level: 'Advanced',
            enrollment_date: '2025-09-07T14:45:00Z',
            meeting_link: 'https://meet.google.com/xyz-abc-123',
            next_session: '2025-09-15T18:00:00Z',
            tutor: {
                id: 'tutor-1',
                name: 'Dr. Sarah Johnson',
                photo_url: 'https://images.unsplash.com/photo-1494790108755-2616c18b3d9d?w=150&h=150&fit=crop&crop=center',
                rating: 4.8
            }
        },
        {
            class_id: '2',
            class_name: 'Python Programming Bootcamp',
            description: 'Complete Python programming course from basics to advanced web development',
            subject: 'Programming',
            price: 15000,
            duration: '3 hours',
            schedule: 'Tuesdays & Thursdays at 7:00 PM',
            start_date: '2025-09-20',
            end_date: '2025-11-30',
            status: 'upcoming',
            students_enrolled: 35,
            level: 'Intermediate',
            enrollment_date: '2025-09-06T11:20:00Z',
            meeting_link: 'https://meet.google.com/def-ghi-456',
            next_session: '2025-09-20T19:00:00Z',
            tutor: {
                id: 'tutor-2',
                name: 'Prof. Michael Chen',
                photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=center',
                rating: 4.9
            }
        },
        {
            class_id: '3',
            class_name: 'Organic Chemistry Deep Dive',
            description: 'Intensive organic chemistry course covering all major reaction mechanisms',
            subject: 'Chemistry',
            price: 10000,
            duration: '2.5 hours',
            schedule: 'Saturdays at 10:00 AM',
            start_date: '2025-08-18',
            end_date: '2025-12-10',
            status: 'active',
            students_enrolled: 22,
            level: 'Advanced',
            enrollment_date: '2025-08-15T16:30:00Z',
            meeting_link: 'https://meet.google.com/jkl-mno-789',
            next_session: '2025-09-14T10:00:00Z',
            tutor: {
                id: 'tutor-3',
                name: 'Dr. Emily Watson',
                photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=center',
                rating: 4.7
            }
        }
    ];
};


export const getStudentIDByUserID = async (userId: string) => {
    try {
        const response = await axios.get<{ studentId: string | null }>(
            `${baseUrl2}/getStudentIDByUserID/${userId}`
        );
        return response.data.studentId;
    } catch (error: any) {
        console.error('❌ Failed to fetch student ID by user ID:', error);
        throw new Error(`Failed to fetch student ID: ${error.message || 'Unknown error occurred'}`);
    }
};


// export const updateSlotStatus = async (slot_id: string, status: string) => {
//     try {
//         const response = await axios.patch<FreeTimeSlot>(
//             `${baseUrl2}/updateSlotStatus`,
//             { slot_id, status }
//         );
//         return response.data;
//     } catch (error: any) {
//         console.error('❌ Failed to update slot status:', error);
//         throw new Error(`Failed to update slot status: ${error.message || 'Unknown error occurred'}`);
//     }
// };


// export const createASession = async (sessionData: SessionData) => {
//     try {
//         const response = await axios.post<Session>(
//             `${baseUrl2}/createASession`,
//             sessionData
//         );
//         return response.data;
//     } catch (error: any) {
//         console.error('❌ Failed to create session:', error);
//         throw new Error(`Failed to create session: ${error.message || 'Unknown error occurred'}`);
//     }
// };


export const findTimeSlots = async (sessionDate: string, tutorId: string, slotsAsDate: string[]) => {
    try {
        const response = await axios.post<FreeTimeSlot[]>(
            `${baseUrl2}/findTimeSlots`,
            {
                sessionDate,
                tutorId,
                slotsAsDate
            }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to fetch time slots:', error);
        throw new Error(`Failed to fetch time slots: ${error.message || 'Unknown error occurred'}`);
    }
};


export const updateAccessTimeinFreeSlots = async (slot_id: string, last_access_time: Date) => {
    try {
        const response = await axios.put<FreeTimeSlot>(
            `${baseUrl2}/updateAccessTimeinFreeSlots`,
            { slot_id, last_access_time }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to update access time in free slots:', error);
        throw new Error(`Failed to update access time: ${error.message || 'Unknown error occurred'}`);
    }
};

// for cancelling a session
export const cancelSession = async (session_id: string) => {
    try {
        const response = await axios.post<Session>(
            `${baseUrl2}/cancelSession/${session_id}`
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to cancel session:', error);
        throw new Error(`Failed to cancel session: ${error.message || 'Unknown error occurred'}`);
    }
};

export const getTutorsByStudentId = async (studentId: string) => {
    console.log('Fetching tutors for student ID:', studentId);
    try {
        const response = await axios.get<IndividualTutorDashboard[]>(
            `${baseUrl2}/getTutorsByStudentId/${studentId}`
        );
        console.log('Tutors fetched:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to fetch tutors:', error);
        throw new Error(`Failed to fetch tutors: ${error.message || 'Unknown error occurred'}`);
    }
};

// for getting payment summary by student id

export const getPaymentSummaryByStudentId = async (studentId: string) => {
    console.log('Fetching payment summary for student ID:', studentId);
    try {
        const response = await axios.get<IndividualPaymentHistoryData>(`${baseUrl2}/getPaymentHistory/${studentId}`);
        console.log('Payment summary fetched:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to fetch payment summary:', error);
        throw new Error(`Failed to fetch payment summary: ${error.message || 'Unknown error occurred'}`);
    }
};

// for getting mass class payment history by student id
export const getMassPaymentHistoryByStudentId = async (studentId: string) => {
    console.log('Fetching mass payment history for student ID:', studentId);
    try {
        const response = await axios.get<MassPaymentHistoryData>(`${baseUrl2}/getMassPaymentHistory/${studentId}`);
        console.log('Mass payment history fetched:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to fetch mass payment history:', error);
        console.log('Using mock data for mass payments');
        // Return mock data for now
        return getMockMassPaymentData();
    }
};

// Mock data for mass class payments (temporary until backend API is ready)
const getMockMassPaymentData = (): MassPaymentHistoryData => {
    return {
        transactions: [
            {
                m_payment_id: 'mp_1',
                student_id: 'student_1',
                class_id: 'class_1',
                amount: 12000,
                payment_time: new Date('2024-01-15'),
                status: 'succeeded',
                method: 'card',
                paidMonth: 'January 2024',
                payment_intent_id: 'pi_mass_1',
                Class: {
                    subject: 'Mathematics',
                    Mass_Tutor: {
                        User: {
                            name: 'Dr. Sarah Johnson',
                            photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                        },
                        heading: 'Advanced Mathematics Masterclass'
                    }
                }
            },
            {
                m_payment_id: 'mp_2',
                student_id: 'student_1',
                class_id: 'class_1',
                amount: 12000,
                payment_time: new Date('2024-02-15'),
                status: 'succeeded',
                method: 'card',
                paidMonth: 'February 2024',
                payment_intent_id: 'pi_mass_2',
                Class: {
                    subject: 'Mathematics',
                    Mass_Tutor: {
                        User: {
                            name: 'Dr. Sarah Johnson',
                            photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                        },
                        heading: 'Advanced Mathematics Masterclass'
                    }
                }
            },
            {
                m_payment_id: 'mp_3',
                student_id: 'student_1',
                class_id: 'class_2',
                amount: 10000,
                payment_time: new Date('2024-03-01'),
                status: 'succeeded',
                method: 'card',
                paidMonth: 'March 2024',
                payment_intent_id: 'pi_mass_3',
                Class: {
                    subject: 'Physics',
                    Mass_Tutor: {
                        User: {
                            name: 'Prof. Michael Chen',
                            photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
                        },
                        heading: 'Physics Fundamentals'
                    }
                }
            }
        ],
        totalAmount: 34000,
        successfulPaymentsCount: 3,
        totalClasses: 2,
        totalMonthsPaid: 3
    };
};


export const createAndReview = async (student_id: string, session_id: string, rating: number, review: string) => {
    try {
        const response = await axios.post(`${baseUrl2}/rate-and-review`, {
            student_id,
            session_id,
            rating,
            review
        });
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to create and review:', error);
        throw new Error(`Failed to create and review: ${error.message || 'Unknown error occurred'}`);
    }
};

export const getReviewsByIndividualTutorId = async (tutorId: string) => {
    try {
        const response = await axios.get(
            `${baseUrl2}/get-reviews/${tutorId}`
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to fetch reviews for tutor:', error);
        throw new Error(`Failed to fetch reviews: ${error.message || 'Unknown error occurred'}`);
    }
}


export const generateReport = async (student_id: string, tutor_id: string, tutor_type: string, description: string, reason: string) => {
    try {
        const response = await axios.post(`${baseUrl2}/report-tutor`, {
            student_id,
            tutor_id,
            tutor_type,
            description,
            reason
        });
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to generate report:', error);
        throw new Error(`Failed to generate report: ${error.message || 'Unknown error occurred'}`);
    }
};

export const getReportsByStudentId = async (studentId: string) => {
    try {
        const response = await axios.get(
            `${baseUrl2}/get-reports/${studentId}`
        );
        return response.data;
    }
    catch (error: any) {
        console.error('❌ Failed to fetch reports for student:', error);
        throw new Error(`Failed to fetch reports: ${error.message || 'Unknown error occurred'}`);
    }
};

// to get tutor name and type by tutor ID

export const getTutorNameAndTypeById = async (tutorId: string) => {
    try {
        const response = await axios.get(
            `${baseUrl2}/getTutorNameAndTypeById/${tutorId}`
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to fetch tutor name and type:', error);
        throw new Error(`Failed to fetch tutor name and type: ${error.message || 'Unknown error occurred'}`);
    }
};




// Mass Tutors 

export interface MassTutorUser {
  name: string;
  photo_url: string;
}

export interface MassTutor {
  rating: string; // you might convert this to number if needed
  prices: string; // you might convert this to number if needed
  User: MassTutorUser;
}

export interface ClassCount {
  Enrolment: number;
}

export interface MassClass {
  class_id: string;
  created_at: string; // or Date if you parse it
  m_tutor_id: string;
  subject: string;
  time: string; // or Date if you parse it
  day: string;
  title: string;
  Mass_Tutor: MassTutor;
  _count: ClassCount;
  enrollmentCount: number;
  tutorName: string;
  tutorPhoto: string;
  tutorRating: string;
  monthlyRate: string;
}

export const getAllMassClasses = async (subjects:string,page: number, limit: number, sort?: string, rating?: number, minMonthRate?: number, maxMonthRate?: number, searchTerm?: string): Promise<MassClass[]> => {
    console.log('Fetching all mass classes with params:', { page, limit, sort, rating, minMonthRate, maxMonthRate, searchTerm });
    try {
        const response = await axios.get<MassClass[]>(`${baseUrl2}/getAllMassClasses`, {
            params: {
                subjects,
                page,
                limit,
                sort,
                rating,
                // tutorName,
                // classTitle,
                minMonthRate,
                maxMonthRate,
                searchTerm
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to fetch all mass classes:', error);
        throw new Error(`Failed to fetch all mass classes: ${error.message || 'Unknown error occurred'}`);
    }
};