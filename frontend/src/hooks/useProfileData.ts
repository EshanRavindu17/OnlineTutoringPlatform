import { useState, useEffect } from 'react';
import { Subject, Title, tutorService } from '../api/TutorService';
import { STANDARD_QUALIFICATIONS } from '../constants/qualifications';

interface LocalTutorProfile {
  name: string;
  photo_url: string | null | undefined;
  email: string;
  phone: string;
  bio: string;
  city: string;
  rating: number;
  totalReviews: number;
  qualifications: string[];
  subjects: string[];
  titles: string[];
  hourlyRate: number;
  availability: any[];
}

interface EditModeState {
  personal: boolean;
  qualifications: boolean;
  subjects: boolean;
  pricing: boolean;
}

export const useProfileData = (currentUserUid?: string) => {
  const [tutorProfile, setTutorProfile] = useState<LocalTutorProfile>({
    name: 'Dr. Sarah Martinez',
    photo_url: null,
    email: 'sarah.martinez@email.com',
    phone: '+94 77 123 4567',
    bio: 'Experienced mathematics and physics tutor with over 8 years of teaching experience. I hold a PhD in Applied Mathematics and have helped over 200 students improve their grades and understanding of complex mathematical concepts.',
    city: 'Colombo',
    rating: 4.9,
    totalReviews: 127,
    qualifications: ['PhD in Applied Mathematics', 'MSc in Physics', 'BSc in Mathematics'],
    subjects: [],
    titles: [],
    hourlyRate: 2500,
    availability: []
  });

  const [editMode, setEditMode] = useState<EditModeState>({
    personal: false,
    qualifications: false,
    subjects: false,
    pricing: false,
  });

  const [loading, setLoading] = useState(true);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [availableTitles, setAvailableTitles] = useState<Title[]>([]);
  
  // Filter states
  const [subjectFilter, setSubjectFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customQualification, setCustomQualification] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUserUid) return;
      
      setLoading(true);
      try {
        // Fetch tutor profile
        const profileResponse = await tutorService.getTutorProfile(currentUserUid);
        if (profileResponse) {
          setTutorProfile(prev => ({
            ...prev,
            name: profileResponse.User.name,
            photo_url: profileResponse.User.photo_url,
            subjects: profileResponse.subjects || [],
            titles: profileResponse.titles || [],
            qualifications: profileResponse.qualifications || prev.qualifications,
            hourlyRate: profileResponse.hourly_rate,
            rating: profileResponse.rating,
            bio: profileResponse.description || prev.bio,
            phone: profileResponse.phone_number || prev.phone,
          }));
        }

        // Fetch available subjects
        const subjectsResponse = await tutorService.getAllSubjects();
        setAvailableSubjects(subjectsResponse);

        // For titles, we'll fetch them when subjects are selected
        // This is based on the service structure
        
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUserUid]);

  const toggleEditMode = (section: keyof EditModeState) => {
    setEditMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProfileChange = (field: keyof LocalTutorProfile, value: any) => {
    setTutorProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Qualification handlers
  const handleQualificationChange = (qualification: string) => {
    const isSelected = tutorProfile.qualifications.includes(qualification);
    
    if (isSelected) {
      setTutorProfile(prev => ({
        ...prev,
        qualifications: prev.qualifications.filter(q => q !== qualification)
      }));
    } else {
      setTutorProfile(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, qualification]
      }));
    }
  };

  const handleAddCustomQualification = () => {
    if (customQualification.trim() && !tutorProfile.qualifications.includes(customQualification.trim())) {
      setTutorProfile(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, customQualification.trim()]
      }));
      setCustomQualification('');
    }
  };

  const handleRemoveQualification = (qualification: string) => {
    setTutorProfile(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q !== qualification)
    }));
  };

  const getFilteredQualifications = () => {
    return STANDARD_QUALIFICATIONS.filter(qualification =>
      qualification.toLowerCase().includes(qualificationFilter.toLowerCase())
    );
  };

  return {
    tutorProfile,
    setTutorProfile,
    editMode,
    loading,
    availableSubjects,
    availableTitles,
    subjectFilter,
    setSubjectFilter,
    titleFilter,
    setTitleFilter,
    qualificationFilter,
    setQualificationFilter,
    customSubject,
    setCustomSubject,
    customTitle,
    setCustomTitle,
    customQualification,
    setCustomQualification,
    toggleEditMode,
    handleProfileChange,
    handleQualificationChange,
    handleAddCustomQualification,
    handleRemoveQualification,
    getFilteredQualifications
  };
};