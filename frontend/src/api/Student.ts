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

const baseUrl = 'http://localhost:5000/api';

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