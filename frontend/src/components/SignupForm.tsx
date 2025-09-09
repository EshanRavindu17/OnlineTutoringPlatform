import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase.tsx';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, BookOpen, ChevronRight, Users, Star, Shield, Phone, MapPin, GraduationCap, DollarSign, FileText, Calendar, Upload, X } from 'lucide-react';
import axios from 'axios';
import { addStudent } from '../api/Student.ts';
import { sendVerificationEmail } from '../utils/emailVerification';

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

  const validateForm = () => {
    return currentStep === 1 ? validateStep1() : validateStep2();
  };

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

      // Create user in database
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
          subjects: formData.subjects,
          description: formData.description,
          heading: formData.heading
        } : {}),
        // Individual tutor specific fields
        ...(role === 'Individual' ? {
          titles: formData.titles,
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
      if (role === 'Individual' || role === 'Mass') {
        console.log('CV file:', formData.cv_file?.name);
        console.log('Certificate files:', formData.certificate_files.map(f => f.name));
      }

      const response = await axios.post('http://localhost:5000/api/add-user', userData); 
      
      const user_id = response.data.user.id;

      if (response.data.created === true) {
        if (role === 'student') {
          const student = await addStudent({
            user_id: user_id,
            points: 0
          });
          console.log("New student added:", student);
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
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BookOpen size={18} className="text-gray-400" />
                          </div>
                          <input
                            id="subjects"
                            name="subjects"
                            type="text"
                            required
                            value={formData.subjectsInput}
                            onChange={(e) => handleArrayInputChange('subjects', e.target.value)}
                            disabled={loading}
                            className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                            placeholder="Mathematics, Physics, Chemistry"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Separate multiple subjects with commas</p>
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
                              disabled={loading}
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
                                disabled={loading}
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
                              disabled={loading || formData.certificate_files.length >= 3}
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
                                    disabled={loading}
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
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <GraduationCap size={18} className="text-gray-400" />
                            </div>
                            <input
                              id="titles"
                              name="titles"
                              type="text"
                              required
                              value={formData.titlesInput}
                              onChange={(e) => handleArrayInputChange('titles', e.target.value)}
                              disabled={loading}
                              className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                              placeholder="Calculus, Algebra, SAT Math"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Separate multiple titles with commas</p>
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
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FileText size={18} className="text-gray-400" />
                            </div>
                            <input
                              id="qualifications"
                              name="qualifications"
                              type="text"
                              required
                              value={formData.qualificationsInput}
                              onChange={(e) => handleArrayInputChange('qualifications', e.target.value)}
                              disabled={loading}
                              className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                              placeholder="BSc Mathematics, A/L Mathematics (A), Teaching Diploma"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Separate multiple qualifications with commas</p>
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
                    disabled={loading}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center">
                      {loading ? 'Creating account...' : 'Create account'}
                      {!loading && <ChevronRight size={16} className="ml-2" />}
                    </span>
                  </button>
                )}

                {/* For tutors - show step-based buttons */}
                {(role === 'Individual' || role === 'Mass') && (
                  <>
                    {currentStep === 1 && (
                      <button
                        type="submit"
                        disabled={loading}
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
                          disabled={loading}
                          className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="flex items-center">
                            {loading ? 'Creating account...' : 'Create Tutor Account'}
                            {!loading && <ChevronRight size={16} className="ml-2" />}
                          </span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          disabled={loading}
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
