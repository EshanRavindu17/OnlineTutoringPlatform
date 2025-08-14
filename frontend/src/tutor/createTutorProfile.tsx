import { useState } from 'react';

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  languages: string[];
  
  // Professional Details
  title: string;
  hourlyRate: string;
  experience: string;
  education: Education[];
  certifications: string[];
  
  // Teaching Information
  subjects: string[];
  teachingLevels: string[];
  teachingMethods: string[];
  availability: Record<string, any>;
  
  // Location & Contact
  location: string;
  onlineTeaching: boolean;
  inPersonTeaching: boolean;
  responseTime: string;
}

const TutorProfileForm = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    languages: [],
    
    // Professional Details
    title: '',
    hourlyRate: '',
    experience: '',
    education: [],
    certifications: [],
    
    // Teaching Information
    subjects: [],
    teachingLevels: [],
    teachingMethods: [],
    availability: {},
    
    // Location & Contact
    location: '',
    onlineTeaching: true,
    inPersonTeaching: false,
    responseTime: '2'
  });

  const totalSteps = 5;

  const availableSubjects: string[] = [
    'Algebra', 'Geometry', 'Calculus', 'Statistics', 'Physics',
    'Chemistry', 'Biology', 'English', 'History', 'Computer Science',
    'SAT/ACT Math', 'AP Calculus', 'AP Physics', 'AP Chemistry'
  ];

  const teachingLevels: string[] = [
    'Elementary', 'Middle School', 'High School', 'College', 'Graduate'
  ];

  const teachingMethods: string[] = [
    'One-on-One', 'Group Sessions', 'Online Classes', 'In-Person', 'Homework Help'
  ];

  const languageOptions: string[] = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'
  ];

  const handleInputChange = (field: keyof FormData, value: any): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: keyof FormData, item: string): void => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      return {
        ...prev,
        [field]: currentArray.includes(item)
          ? currentArray.filter(i => i !== item)
          : [...currentArray, item]
      };
    });
  };

  const addEducation = (): void => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '' }]
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string): void => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number): void => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const nextStep = (): void => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (): void => {
    console.log('Profile Data:', formData);
    alert('Tutor profile created successfully!');
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {step}
            </div>
            {step < totalSteps && (
              <div className={`w-full h-1 mx-4 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>Personal Info</span>
        <span>Education</span>
        <span>Subjects</span>
        <span>Availability</span>
        <span>Review</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your first name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Mathematics Teacher, Physics Tutor"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio *
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell students about yourself, your teaching style, and experience..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Languages Spoken
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {languageOptions.map(language => (
            <label key={language} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.languages.includes(language)}
                onChange={() => handleArrayToggle('languages', language)}
                className="mr-2"
              />
              {language}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Education & Experience</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hourly Rate (USD) *
          </label>
          <input
            type="number"
            value={formData.hourlyRate}
            onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="25"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience *
          </label>
          <input
            type="number"
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="5"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Education
          </label>
          <button
            type="button"
            onClick={addEducation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Education
          </button>
        </div>
        
        {formData.education.map((edu, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Degree"
              />
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Institution"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={edu.year}
                  onChange={(e) => updateEducation(index, 'year', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Year"
                />
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Teaching Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Subjects You Teach *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {availableSubjects.map(subject => (
            <label key={subject} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.subjects.includes(subject)}
                onChange={() => handleArrayToggle('subjects', subject)}
                className="mr-2"
              />
              {subject}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Teaching Levels *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {teachingLevels.map(level => (
            <label key={level} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.teachingLevels.includes(level)}
                onChange={() => handleArrayToggle('teachingLevels', level)}
                className="mr-2"
              />
              {level}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Teaching Methods *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {teachingMethods.map(method => (
            <label key={method} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.teachingMethods.includes(method)}
                onChange={() => handleArrayToggle('teachingMethods', method)}
                className="mr-2"
              />
              {method}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.onlineTeaching}
            onChange={(e) => handleInputChange('onlineTeaching', e.target.checked)}
            className="mr-2"
          />
          Online Teaching
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.inPersonTeaching}
            onChange={(e) => handleInputChange('inPersonTeaching', e.target.checked)}
            className="mr-2"
          />
          In-Person Teaching
        </label>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Availability & Contact</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location (if offering in-person sessions)
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="City, State/Province, Country"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Typical Response Time
        </label>
        <select
          value={formData.responseTime}
          onChange={(e) => handleInputChange('responseTime', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1">Within 1 hour</option>
          <option value="2">Within 2 hours</option>
          <option value="6">Within 6 hours</option>
          <option value="24">Within 24 hours</option>
        </select>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Review Your Profile</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Profile Summary</h3>
        <div className="space-y-2">
          <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
          <p><strong>Title:</strong> {formData.title}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Hourly Rate:</strong> ${formData.hourlyRate}</p>
          <p><strong>Experience:</strong> {formData.experience} years</p>
          <p><strong>Subjects:</strong> {formData.subjects.join(', ')}</p>
          <p><strong>Teaching Levels:</strong> {formData.teachingLevels.join(', ')}</p>
          <p><strong>Languages:</strong> {formData.languages.join(', ')}</p>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Create Your Tutor Profile
          </h1>
          
          {renderStepIndicator()}
          {renderCurrentStep()}
          
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-md font-medium ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Previous
            </button>
            
            {currentStep === totalSteps ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
              >
                Create Profile
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfileForm;
