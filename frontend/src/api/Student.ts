import axios from 'axios';

interface StudentProfile {
    firebase_uid: string;
    name: string;
    email: string;
    dob?: string;
    bio?: string;
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
        console.log('before API call');
        const response = await axios.post<StudentProfile>(
            `${baseUrl}/update-profile/${profileData.firebase_uid}`,
            formData
        );
        console.log('after API call', response.data);
        return response.data;
    } catch (error) {
        throw new Error('Failed to update student profile');
    }
};