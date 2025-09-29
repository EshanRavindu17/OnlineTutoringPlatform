import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase.tsx';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, BookOpen, ChevronRight, Users, Star, Shield, Phone, MapPin, GraduationCap, DollarSign, FileText, Calendar, Upload, X, ChevronDown, Plus, Search } from 'lucide-react';
import axios from 'axios';
import { addStudent } from '../api/Student.ts';
import { sendVerificationEmail } from '../utils/emailVerification';
import { uploadAllDocuments } from '../api/Documents';
import { tutorService, Subject, Title } from '../api/TutorService';
import { STANDARD_QUALIFICATIONS } from '../constants/qualifications';

export default function SignupForm({ role = 'student' }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Basic info for all users
    bio: '',
    dob: '',
    phone_number: '',
    // Individual tutor specific fields
    subjects: [] as string[],
    titles: [] as string[],
    hourly_rate: '',
    description: '',
    heading: '',
    location: '',
    qualifications: [] as string[],
    // Mass tutor specific fields
    prices: '',
    // Document uploads for tutors
    cv_file: null as File | null,
    certificate_files: [] as File[],
    // String representations for form inputs
    subjectsInput: '',
    titlesInput: '',
    qualificationsInput: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);

  // State for dropdown data
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [availableTitles, setAvailableTitles] = useState<Title[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTitles, setLoadingTitles] = useState(false);

  // Predefined qualifications list (imported from shared constants)
  const standardQualifications = STANDARD_QUALIFICATIONS;

  // State for custom qualification input
  const [customQualification, setCustomQualification] = useState('');

  // State for custom subject and title inputs
  const [customSubject, setCustomSubject] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [selectedSubjectForCustomTitle, setSelectedSubjectForCustomTitle] = useState('');

  // State for filtering/searching
  const [subjectFilter, setSubjectFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('');

  // Load subjects when component mounts (only for tutors)
  useEffect(() => {
    if (role === 'Individual' || role === 'Mass') {
      loadSubjects();
    }
  }, [role]);

  // Load subjects from API
  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const subjects = await tutorService.getAllSubjects();
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setError('Failed to load subjects. Please refresh the page.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Load titles when subjects change
  const loadTitlesForSubjects = async (selectedSubjectIds: string[]) => {
    if (selectedSubjectIds.length === 0) {
      setAvailableTitles([]);
      return;
    }

    setLoadingTitles(true);
    try {
      // Load titles for all selected subjects
      const allTitles = [];
      for (const subjectId of selectedSubjectIds) {
        const titles = await tutorService.getTitlesBySubject(subjectId);
        allTitles.push(...titles);
      }
      
      // Remove duplicates if any
      const uniqueTitles = allTitles.filter((title, index, self) => 
        index === self.findIndex(t => t.title_id === title.title_id)
      );
      
      setAvailableTitles(uniqueTitles);
      
      // Clear selected titles that are no longer available
      const availableTitleIds = uniqueTitles.map(t => t.title_id);
      const validTitles = formData.titles.filter(titleId => 
        availableTitleIds.includes(titleId)
      );
      
      if (validTitles.length !== formData.titles.length) {
        setFormData(prev => ({
          ...prev,
          titles: validTitles
        }));
      }
    } catch (error) {
      console.error('Failed to load titles:', error);
      setError('Failed to load titles for selected subjects.');
    } finally {
      setLoadingTitles(false);
    }
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Full name is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Basic validation for tutors in step 1
    if (role === 'Individual' || role === 'Mass') {
      if (!formData.bio.trim()) {
        setError('Bio is required for tutors');
        return false;
      }
      
      if (!formData.dob) {
        setError('Date of birth is required for tutors');
        return false;
      }
      
      if (!formData.phone_number.trim()) {
        setError('Phone number is required for tutors');
        return false;
      }
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    // Additional validation for tutors in step 2
    if (role === 'Individual' || role === 'Mass') {
      if (formData.subjects.length === 0) {
        setError('At least one subject is required');
        return false;
      }
      
      if (!formData.description.trim()) {
        setError('Teaching description is required for tutors');
        return false;
      }

      // Document validation for tutors (optional for now - will be required when backend is ready)
      // Uncomment these when backend document upload is implemented:
      if (!formData.cv_file) {
        setError('CV upload is required for tutors');
        return false;
      }
      if (formData.certificate_files.length === 0) {
        setError('At least one certificate is required for tutors');
        return false;
      }
    }

    // Individual tutor specific validation
    if (role === 'Individual') {
      if (formData.titles.length === 0) {
        setError('At least one title/expertise is required');
        return false;
      }
      
      if (!formData.hourly_rate || parseFloat(formData.hourly_rate) <= 0) {
        setError('Please enter a valid hourly rate');
        return false;
      }
      
      if (!formData.location.trim()) {
        setError('Location is required for individual tutors');
        return false;
      }
      
      if (formData.qualifications.length === 0) {
        setError('At least one qualification is required');
        return false;
      }
    }

    // Mass tutor specific validation
    if (role === 'Mass') {
      if (!formData.prices || parseFloat(formData.prices) <= 0) {
        setError('Please enter valid pricing information');
        return false;
      }
    }

    return true;
  };

  // const validateForm = () => {
  //   return currentStep === 1 ? validateStep1() : validateStep2();
  // };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      setError('');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleArrayInputChange = (field: 'subjects' | 'titles' | 'qualifications', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    const inputField = `${field}Input` as 'subjectsInput' | 'titlesInput' | 'qualificationsInput';
    
    setFormData(prev => ({
      ...prev,
      [field]: items,
      [inputField]: value
    }));
    setError('');
  };

  // Handle subject selection from dropdown
  const handleSubjectChange = (subjectId: string) => {
    const isSelected = formData.subjects.includes(subjectId);
    let newSubjects;
    
    if (isSelected) {
      // Remove subject
      newSubjects = formData.subjects.filter(id => id !== subjectId);
    } else {
      // Add subject
      newSubjects = [...formData.subjects, subjectId];
    }
    
    setFormData(prev => ({
      ...prev,
      subjects: newSubjects
    }));
    
    // Load titles for the new subject selection
    loadTitlesForSubjects(newSubjects);
    setError('');
  };

  // Handle title selection from dropdown
  const handleTitleChange = (titleId: string) => {
    const isSelected = formData.titles.includes(titleId);
    let newTitles;
    
    if (isSelected) {
      // Remove title
      newTitles = formData.titles.filter(id => id !== titleId);
    } else {
      // Add title
      newTitles = [...formData.titles, titleId];
    }
    
    setFormData(prev => ({
      ...prev,
      titles: newTitles
    }));
    setError('');
  };

  // Handle qualification selection from dropdown
  const handleQualificationChange = (qualification: string) => {
    const isSelected = formData.qualifications.includes(qualification);
    let newQualifications;
    
    if (isSelected) {
      // Remove qualification
      newQualifications = formData.qualifications.filter(q => q !== qualification);
    } else {
      // Add qualification
      newQualifications = [...formData.qualifications, qualification];
    }
    
    setFormData(prev => ({
      ...prev,
      qualifications: newQualifications,
      qualificationsInput: newQualifications.join(', ')
    }));
    setError('');
  };

  // Handle adding custom qualification
  const handleAddCustomQualification = () => {
    if (customQualification.trim() && !formData.qualifications.includes(customQualification.trim())) {
      const newQualifications = [...formData.qualifications, customQualification.trim()];
      setFormData(prev => ({
        ...prev,
        qualifications: newQualifications,
        qualificationsInput: newQualifications.join(', ')
      }));
      setCustomQualification('');
      setError('');
    }
  };

  // Handle removing qualification
  const handleRemoveQualification = (qualification: string) => {
    const newQualifications = formData.qualifications.filter(q => q !== qualification);
    setFormData(prev => ({
      ...prev,
      qualifications: newQualifications,
      qualificationsInput: newQualifications.join(', ')
    }));
  };

  // Handle adding custom subject
  const handleAddCustomSubject = async () => {
    if (customSubject.trim() && !availableSubjects.some(s => s.name.toLowerCase() === customSubject.trim().toLowerCase())) {
      try {
        const newSubject = await tutorService.createSubject(customSubject.trim());
        setAvailableSubjects(prev => [...prev, newSubject]);
        
        // Automatically select the new subject
        const newSubjects = [...formData.subjects, newSubject.sub_id];
        setFormData(prev => ({
          ...prev,
          subjects: newSubjects
        }));
        
        setCustomSubject('');
        setError('');
        
        // Load titles for the new selection
        loadTitlesForSubjects(newSubjects);
      } catch (error: any) {
        console.error('Failed to create subject:', error);
        setError(error.message || 'Failed to create subject');
      }
    }
  };

  // Handle adding custom title
  const handleAddCustomTitle = async () => {
    if (customTitle.trim() && selectedSubjectForCustomTitle && 
        !availableTitles.some(t => t.name.toLowerCase() === customTitle.trim().toLowerCase() && t.sub_id === selectedSubjectForCustomTitle)) {
      try {
        const newTitle = await tutorService.createTitle(customTitle.trim(), selectedSubjectForCustomTitle);
        setAvailableTitles(prev => [...prev, newTitle]);
        
        // Automatically select the new title
        const newTitles = [...formData.titles, newTitle.title_id];
        setFormData(prev => ({
          ...prev,
          titles: newTitles
        }));
        
        setCustomTitle('');
        setSelectedSubjectForCustomTitle('');
        setError('');
      } catch (error: any) {
        console.error('Failed to create title:', error);
        setError(error.message || 'Failed to create title');
      }
    }
  };

  // Filter functions
  const getFilteredSubjects = () => {
    if (!subjectFilter.trim()) return availableSubjects;
    return availableSubjects.filter(subject => 
      subject.name.toLowerCase().includes(subjectFilter.toLowerCase())
    );
  };

  const getFilteredTitles = () => {
    if (!titleFilter.trim()) return availableTitles;
    return availableTitles.filter(title => 
      title.name.toLowerCase().includes(titleFilter.toLowerCase())
    );
  };

  const getFilteredQualifications = () => {
    if (!qualificationFilter.trim()) return standardQualifications;
    return standardQualifications.filter(qualification => 
      qualification.toLowerCase().includes(qualificationFilter.toLowerCase())
    );
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== 'application/pdf') {
        setError('CV must be a PDF file');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('CV file size must be less than 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        cv_file: file
      }));
      setError('');
    }
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validate each file
      for (const file of files) {
        if (file.type !== 'application/pdf') {
          setError('Certificate files must be PDF format');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError('Each certificate file must be less than 5MB');
          return;
        }
      }
      // Limit to 3 certificates max
      const totalFiles = formData.certificate_files.length + files.length;
      if (totalFiles > 3) {
        setError('You can upload maximum 3 certificate files');
        return;
      }
      setFormData(prev => ({
        ...prev,
        certificate_files: [...prev.certificate_files, ...files]
      }));
      setError('');
    }
  };

  const removeCertificate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certificate_files: prev.certificate_files.filter((_, i) => i !== index)
    }));
  };

  const removeCv = () => {
    setFormData(prev => ({
      ...prev,
      cv_file: null
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // For students or step 2 validation for tutors
    if (role === 'student') {
      if (!validateStep1()) return;
    } else {
      if (currentStep === 1) {
        handleNextStep();
        return;
      }
      if (!validateStep2()) return;
    }

    setLoading(true);
    try {
      // Step 1: Upload documents if user is a tutor
      let cvUrl = '';
      let certificateUrls: string[] = [];

      if (role === 'Individual' || role === 'Mass') {
        if (formData.cv_file || formData.certificate_files.length > 0) {
          setUploadingDocuments(true);
          try {
            const uploadResult = await uploadAllDocuments(
              formData.cv_file,
              formData.certificate_files
            );
            cvUrl = uploadResult.cvUrl || '';
            certificateUrls = uploadResult.certificateUrls || [];
            console.log('✅ Documents uploaded successfully:', { cvUrl, certificateUrls });
          } catch (uploadError: any) {
            console.error('Document upload failed:', uploadError);
            setError(`Document upload failed: ${uploadError.message}`);
            return;
          } finally {
            setUploadingDocuments(false);
          }
        }
      }

      // Step 2: Create Firebase user
      const { user: newUser } = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // Send email verification
      const verificationResult = await sendVerificationEmail(newUser);
      if (!verificationResult.success) {
        console.error('Failed to send verification email:', verificationResult.error);
        // Continue with account creation even if verification email fails
      }
      
      // Sign out the user immediately after verification email is sent
      await signOut(auth);

      // Step 3: Create user in database
      const userData = {
        firebase_uid: newUser.uid,
        email: newUser.email,
        role: role, 
        name: formData.name,
        photo_url: '',
        bio: formData.bio || `New ${role} account`,
        dob: formData.dob || null,
        // Additional tutor fields
        ...(role === 'Individual' || role === 'Mass' ? {
          phone_number: formData.phone_number,
          // Convert subject IDs to names
          subjects: formData.subjects.map(subjectId => {
            const subject = availableSubjects.find(s => s.sub_id === subjectId);
            return subject ? subject.name : subjectId;
          }),
          description: formData.description,
          heading: formData.heading,
          // Document URLs from Cloudinary upload
          ...(cvUrl && { cv_url: cvUrl }),
          ...(certificateUrls.length > 0 && { certificate_urls: certificateUrls })
        } : {}),
        // Individual tutor specific fields
        ...(role === 'Individual' ? {
          // Convert title IDs to names
          titles: formData.titles.map(titleId => {
            const title = availableTitles.find(t => t.title_id === titleId);
            return title ? title.name : titleId;
          }),
          hourly_rate: parseFloat(formData.hourly_rate) || 0,
          location: formData.location,
          qualifications: formData.qualifications
        } : {}),
        // Mass tutor specific fields
        ...(role === 'Mass' ? {
          prices: parseFloat(formData.prices) || 0
        } : {})
      };

      // Log the uploaded files for verification (will be used when backend is implemented)
      // if (role === 'Individual' || role === 'Mass') {
      //   console.log('CV file:', formData.cv_file?.name);
      //   console.log('Certificate files:', formData.certificate_files.map(f => f.name));
      // }

      const response = await axios.post('http://localhost:5000/api/add-user', userData); 
      
      const user_id = response.data.user.id;

      if (response.data.created === true) {
        if (role === 'student') {
          const student = await addStudent({
            user_id: user_id,
            points: 0
          });
          console.log("New student added:", student);
        } else if (role === 'Individual' || role === 'Mass') {
          console.log("New tutor application submitted with documents:", {
            cvUrl,
            certificateUrls,
            role
          });
        }
        
        // Redirect to email verification page for all users
        navigate('/verify-email', { 
          state: { 
            email: formData.email, 
            role: role 
          },
          replace: true 
        });
      } else {
        setError("Failed to create user in database.");
      }    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.detail || 'Failed to create account');
      } else if (error.code) {
        // Handle Firebase errors
        switch (error.code) {
          case 'auth/email-already-in-use':
            setError('An account with this email already exists');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address');
            break;
          default:
            setError('Failed to create account. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = () => {
    switch (role) {
      case 'student':
        return {
          title: 'Join as a Student',
          subtitle: 'Start your learning journey with expert tutors',
          features: [
            { icon: BookOpen, title: 'Personalized Learning', desc: 'Get matched with tutors who understand your learning style' },
            { icon: Users, title: 'Expert Tutors', desc: 'Learn from qualified professionals in your subject area' },
            { icon: Star, title: 'Track Progress', desc: 'Monitor your improvement with detailed analytics' }
          ]
        };
      case 'Individual':
        return {
          title: 'Join as an Individual Tutor',
          subtitle: 'Share your expertise and help students succeed',
          features: [
            { icon: Users, title: 'Flexible Schedule', desc: 'Set your own availability and teaching hours' },
            { icon: Star, title: 'Build Reputation', desc: 'Earn ratings and reviews from satisfied students' },
            { icon: Shield, title: 'Secure Platform', desc: 'Safe payment processing and student verification' }
          ]
        };
      case 'Mass':
        return {
          title: 'Join as a Mass Tutor',
          subtitle: 'Teach multiple students and scale your impact',
          features: [
            { icon: Users, title: 'Group Sessions', desc: 'Conduct classes with multiple students simultaneously' },
            { icon: BookOpen, title: 'Course Creation', desc: 'Create and sell structured course content' },
            { icon: Star, title: 'Higher Earnings', desc: 'Maximize your income with group teaching' }
          ]
        };
      default:
        return {
          title: 'Create Your Account',
          subtitle: 'Join the Tutorly community',
          features: []
        };
    }
  };

  const roleInfo = getRoleInfo();

  // Step indicator component
  const StepIndicator = () => {
    if (role === 'student') return null;
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Basic Info
              </span>
            </div>
            
            {/* Divider */}
            <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            
            {/* Step 2 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Professional Details
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <a href="#" className="flex items-center justify-center mb-6">
              <span className="text-blue-600 font-bold text-2xl">Tutorly</span>
            </a>
            
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {roleInfo.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {roleInfo.subtitle}
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/auth')}
                className="font-medium text-blue-600 hover:text-blue-500"
                disabled={loading}
              >
                Sign in
              </button>
            </p>
          </div>

          <StepIndicator />

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {uploadingDocuments && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-sm text-blue-600">Uploading documents to secure cloud storage...</p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {(role === 'student' || currentStep === 1) && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="text-gray-400" size={18} />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        placeholder="john@gmail.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="pl-10 pr-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        placeholder="Create a strong password"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none disabled:opacity-50"
                        >
                          {showPassword ? (
                            <EyeOff size={18} className="text-gray-400" />
                          ) : (
                            <Eye size={18} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>

                  {/* Additional basic fields for tutors in step 1 */}
                  {(role === 'Individual' || role === 'Mass') && (
                    <>
                      <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Information</h3>
                        <p className="text-sm text-gray-600 mb-4">Tell us about yourself</p>
                        
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                              Bio <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                              <textarea
                                id="bio"
                                name="bio"
                                rows={3}
                                required
                                value={formData.bio}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                                placeholder="Tell us about yourself and your teaching experience..."
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                              Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar size={18} className="text-gray-400" />
                              </div>
                              <input
                                id="dob"
                                name="dob"
                                type="date"
                                required
                                max={new Date().toISOString().split('T')[0]}
                                value={formData.dob}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                              Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone size={18} className="text-gray-400" />
                              </div>
                              <input
                                id="phone_number"
                                name="phone_number"
                                type="tel"
                                required
                                value={formData.phone_number}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                                placeholder="+94 77 123 4567"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Step 2: Professional Information (Only for tutors) */}
              {(role === 'Individual' || role === 'Mass') && currentStep === 2 && (
                <>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Professional Information</h3>
                    <p className="text-sm text-gray-600 mb-4">Tell us about your teaching expertise and experience.</p>
                    
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="subjects" className="block text-sm font-medium text-gray-700">
                          Subjects <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 relative">
                          <div className="border border-gray-300 rounded-md bg-white">
                            {/* Search Filter */}
                            <div className="p-2 border-b border-gray-200">
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Search size={16} className="text-gray-400" />
                                </div>
                                <input
                                  type="text"
                                  value={subjectFilter}
                                  onChange={(e) => setSubjectFilter(e.target.value)}
                                  className="pl-9 block w-full py-1.5 border-0 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                  placeholder="Search subjects..."
                                />
                              </div>
                            </div>
                            
                            {/* Subject List */}
                            <div className="max-h-32 overflow-y-auto">
                              {loadingSubjects ? (
                                <div className="p-3 text-gray-500 text-sm">Loading subjects...</div>
                              ) : getFilteredSubjects().length === 0 ? (
                                <div className="p-3 text-gray-500 text-sm">
                                  {subjectFilter ? `No subjects found for "${subjectFilter}"` : 'No subjects available'}
                                </div>
                              ) : (
                                <div className="p-1">
                                  {getFilteredSubjects().map((subject) => (
                                    <label
                                      key={subject.sub_id}
                                      className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={formData.subjects.includes(subject.sub_id)}
                                        onChange={() => handleSubjectChange(subject.sub_id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      />
                                      <span className="ml-2 text-sm text-gray-700">{subject.name}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          {formData.subjects.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {formData.subjects.map((subjectId) => {
                                const subject = availableSubjects.find(s => s.sub_id === subjectId);
                                return subject ? (
                                  <span
                                    key={subjectId}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {subject.name}
                                    <button
                                      type="button"
                                      onClick={() => handleSubjectChange(subjectId)}
                                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-600"
                                    >
                                      <X size={12} />
                                    </button>
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Search and select the subjects you can teach</p>
                        
                        {/* Add Custom Subject */}
                        <div className="mt-3">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={customSubject}
                                onChange={(e) => setCustomSubject(e.target.value)}
                                disabled={loading}
                                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                                placeholder="Add custom subject (e.g., Data Science, Robotics)"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCustomSubject();
                                  }
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleAddCustomSubject}
                              disabled={loading || !customSubject.trim()}
                              className="px-3 py-2 border border-blue-300 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Can't find your subject? Add it here and it will be available for other tutors too
                          </p>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Teaching Description <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            required
                            value={formData.description}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                            placeholder="Describe your teaching methodology and what makes you unique..."
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="heading" className="block text-sm font-medium text-gray-700">
                          Professional Heading
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Star size={18} className="text-gray-400" />
                          </div>
                          <input
                            id="heading"
                            name="heading"
                            type="text"
                            value={formData.heading}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                            placeholder="Expert Mathematics Tutor | 5+ Years Experience"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Document Upload Section for All Tutors */}
                    <div className="border-t pt-6 mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Documents</h3>
                      <p className="text-sm text-gray-600 mb-4">Upload your CV and certificates for verification (PDF format only, max 5MB each)</p>
                      
                      <div className="space-y-6">
                        {/* CV Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CV/Resume<span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handleCVUpload}
                              disabled={loading || uploadingDocuments}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                            />
                          </div>
                          {formData.cv_file && (
                            <div className="mt-2 flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
                              <div className="flex items-center">
                                <FileText size={16} className="text-green-600 mr-2" />
                                <span className="text-sm text-green-800">{formData.cv_file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={removeCv}
                                disabled={loading || uploadingDocuments}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Certificates Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certificates<span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <input
                              type="file"
                              accept=".pdf"
                              multiple
                              onChange={handleCertificateUpload}
                              disabled={loading || uploadingDocuments || formData.certificate_files.length >= 3}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Upload up to 3 certificate files (educational certificates, teaching certifications, etc.)</p>
                          
                          {/* Certificate Files List */}
                          {formData.certificate_files.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {formData.certificate_files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
                                  <div className="flex items-center">
                                    <FileText size={16} className="text-green-600 mr-2" />
                                    <span className="text-sm text-green-800">{file.name}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeCertificate(index)}
                                    disabled={loading || uploadingDocuments}
                                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Tutor Specific Fields */}
                  {role === 'Individual' && (
                    <div className="border-t pt-6 mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Individual Tutor Details</h3>
                      <p className="text-sm text-gray-600 mb-4">Additional information required for one-on-one tutoring.</p>
                      
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="titles" className="block text-sm font-medium text-gray-700">
                            Expertise/Titles <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1 relative">
                            {formData.subjects.length === 0 ? (
                              <div className="border border-gray-300 rounded-md bg-gray-50 p-3 text-gray-500 text-sm">
                                Please select subjects first to see available titles
                              </div>
                            ) : (
                              <div className="border border-gray-300 rounded-md bg-white">
                                {/* Search Filter */}
                                <div className="p-2 border-b border-gray-200">
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <Search size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                      type="text"
                                      value={titleFilter}
                                      onChange={(e) => setTitleFilter(e.target.value)}
                                      className="pl-9 block w-full py-1.5 border-0 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
                                      placeholder="Search titles..."
                                    />
                                  </div>
                                </div>
                                
                                {/* Title List */}
                                <div className="max-h-32 overflow-y-auto">
                                  {loadingTitles ? (
                                    <div className="p-3 text-gray-500 text-sm">Loading titles...</div>
                                  ) : getFilteredTitles().length === 0 ? (
                                    <div className="p-3 text-gray-500 text-sm">
                                      {titleFilter ? `No titles found for "${titleFilter}"` : 'No titles available for selected subjects'}
                                    </div>
                                  ) : (
                                    <div className="p-1">
                                      {getFilteredTitles().map((title) => (
                                        <label
                                          key={title.title_id}
                                          className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={formData.titles.includes(title.title_id)}
                                            onChange={() => handleTitleChange(title.title_id)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                          />
                                          <span className="ml-2 text-sm text-gray-700">{title.name}</span>
                                        </label>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {formData.titles.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {formData.titles.map((titleId) => {
                                  const title = availableTitles.find(t => t.title_id === titleId);
                                  return title ? (
                                    <span
                                      key={titleId}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                    >
                                      {title.name}
                                      <button
                                        type="button"
                                        onClick={() => handleTitleChange(titleId)}
                                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:text-green-600"
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Search and select your areas of expertise within the chosen subjects</p>
                          
                          {/* Add Custom Title */}
                          {formData.subjects.length > 0 && (
                            <div className="mt-3">
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <select
                                      value={selectedSubjectForCustomTitle}
                                      onChange={(e) => setSelectedSubjectForCustomTitle(e.target.value)}
                                      disabled={loading}
                                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100"
                                    >
                                      <option value="">Select subject for new title</option>
                                      {formData.subjects.map(subjectId => {
                                        const subject = availableSubjects.find(s => s.sub_id === subjectId);
                                        return subject ? (
                                          <option key={subjectId} value={subjectId}>
                                            {subject.name}
                                          </option>
                                        ) : null;
                                      })}
                                    </select>
                                  </div>
                                </div>
                                {selectedSubjectForCustomTitle && (
                                  <div className="flex gap-2">
                                    <div className="flex-1">
                                      <input
                                        type="text"
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        disabled={loading}
                                        className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100"
                                        placeholder="Add custom title (e.g., Machine Learning, Advanced Calculus)"
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCustomTitle();
                                          }
                                        }}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={handleAddCustomTitle}
                                      disabled={loading || !customTitle.trim()}
                                      className="px-3 py-2 border border-green-300 rounded-md bg-green-50 text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                Can't find your area of expertise? Add it here and it will be available for other tutors too
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700">
                            Hourly Rate (LKR) <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <DollarSign size={18} className="text-gray-400" />
                            </div>
                            <input
                              id="hourly_rate"
                              name="hourly_rate"
                              type="number"
                              min="0"
                              step="0.01"
                              required
                              value={formData.hourly_rate}
                              onChange={handleInputChange}
                              disabled={loading}
                              className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                              placeholder="2000"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">You can adjust this later in your tutor dashboard</p>
                        </div>

                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                            Location <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MapPin size={18} className="text-gray-400" />
                            </div>
                            <input
                              id="location"
                              name="location"
                              type="text"
                              required
                              value={formData.location}
                              onChange={handleInputChange}
                              disabled={loading}
                              className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                              placeholder="Colombo, Sri Lanka"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700">
                            Qualifications <span className="text-red-500">*</span>
                          </label>
                          
                          {/* Selected Qualifications Display */}
                          {formData.qualifications.length > 0 && (
                            <div className="mt-2 mb-3">
                              <p className="text-sm text-gray-600 mb-2">Selected Qualifications:</p>
                              <div className="flex flex-wrap gap-2">
                                {formData.qualifications.map((qualification, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                                  >
                                    {qualification}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveQualification(qualification)}
                                      className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:text-purple-600"
                                    >
                                      <X size={12} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Standard Qualifications Dropdown */}
                          <div className="mt-1 relative">
                            <div className="border border-gray-300 rounded-md bg-white">
                              {/* Search Filter */}
                              <div className="p-2 border-b border-gray-200">
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className="text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    value={qualificationFilter}
                                    onChange={(e) => setQualificationFilter(e.target.value)}
                                    className="pl-9 block w-full py-1.5 border-0 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
                                    placeholder="Search qualifications..."
                                  />
                                </div>
                              </div>
                              
                              {/* Qualifications List */}
                              <div className="max-h-48 overflow-y-auto">
                                <div className="p-1">
                                  <div className="p-2 bg-gray-50 border-b border-gray-200">
                                    <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                      {qualificationFilter ? `Results for "${qualificationFilter}"` : 'Standard Qualifications'}
                                    </p>
                                  </div>
                                  {getFilteredQualifications().length === 0 ? (
                                    <div className="p-3 text-gray-500 text-sm">
                                      No qualifications found for "{qualificationFilter}"
                                    </div>
                                  ) : (
                                    getFilteredQualifications().map((qualification, index) => (
                                      <label
                                        key={index}
                                        className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={formData.qualifications.includes(qualification)}
                                          onChange={() => handleQualificationChange(qualification)}
                                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{qualification}</span>
                                      </label>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Add Custom Qualification */}
                          <div className="mt-3">
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={customQualification}
                                  onChange={(e) => setCustomQualification(e.target.value)}
                                  disabled={loading}
                                  className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm disabled:bg-gray-100"
                                  placeholder="Add custom qualification (e.g., MSc Data Science)"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddCustomQualification();
                                    }
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={handleAddCustomQualification}
                                disabled={loading || !customQualification.trim()}
                                className="px-3 py-2 border border-purple-300 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Search and select from standard qualifications or add your own custom qualification
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mass Tutor Specific Fields */}
                  {role === 'Mass' && (
                    <div className="border-t pt-6 mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Group Tutor Details</h3>
                      <p className="text-sm text-gray-600 mb-4">Additional information required for group classes.</p>
                      
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="prices" className="block text-sm font-medium text-gray-700">
                            Group Class Pricing (LKR per month) <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <DollarSign size={18} className="text-gray-400" />
                            </div>
                            <input
                              id="prices"
                              name="prices"
                              type="number"
                              min="0"
                              step="0.01"
                              required
                              value={formData.prices}
                              onChange={handleInputChange}
                              disabled={loading}
                              className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                              placeholder="15000"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">You can adjust this later in your tutor dashboard</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Terms and Conditions - Show only in step 1 for tutors or always for students */}
              {(role === 'student' || currentStep === 1) && (
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      disabled={loading}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={acceptedTerms}
                      onChange={() => setAcceptedTerms(!acceptedTerms)}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="text-gray-700">
                      I agree to the{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* For students - show single submit button */}
                {role === 'student' && (
                  <button
                    type="submit"
                    disabled={loading || uploadingDocuments}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center">
                      {uploadingDocuments ? 'Uploading documents...' : loading ? 'Creating account...' : 'Create account'}
                      {!loading && !uploadingDocuments && <ChevronRight size={16} className="ml-2" />}
                    </span>
                  </button>
                )}

                {/* For tutors - show step-based buttons */}
                {(role === 'Individual' || role === 'Mass') && (
                  <>
                    {currentStep === 1 && (
                      <button
                        type="submit"
                        disabled={loading || uploadingDocuments}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="flex items-center">
                          {loading ? 'Validating...' : 'Next Step'}
                          {!loading && <ChevronRight size={16} className="ml-2" />}
                        </span>
                      </button>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-3">
                        <button
                          type="submit"
                          disabled={loading || uploadingDocuments}
                          className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="flex items-center">
                            {uploadingDocuments ? 'Uploading documents...' : loading ? 'Creating account...' : 'Create Tutor Account'}
                            {!loading && !uploadingDocuments && <ChevronRight size={16} className="ml-2" />}
                          </span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          disabled={loading || uploadingDocuments}
                          className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="flex items-center">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Basic Info
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Right panel - Role-specific info */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-blue-600">
          <div className="flex flex-col h-full justify-center p-12 text-white">
            <button 
              onClick={() => navigate('/selectuser')}
              className="absolute top-8 left-8 flex items-center text-blue-50 hover:text-white"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to role selection
            </button>
            
            <h2 className="text-3xl font-bold mb-6">Welcome to Tutorly!</h2>
            <p className="text-xl mb-8">
              {role === 'student' ? (
                'Join thousands of students who are already part of our learning community.'
              ) : (
                currentStep === 1 ? (
                  'Let\'s start with your basic information'
                ) : (
                  'Now tell us about your teaching expertise'
                )
              )}
            </p>
            
            <div className="space-y-6">
              {roleInfo.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium mb-1">{feature.title}</h3>
                    <p className="text-blue-100">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
