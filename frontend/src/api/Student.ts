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

export interface Session {
  session_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  status: 'scheduled' | 'ongoing' | 'canceled' | 'completed';
  meeting_urls: string[] | null;
  materials: string[];
  material_links: string[];
  slots: string[]; // Array of slot times like "1970-01-01T15:00:00.000Z"
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
