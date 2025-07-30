import React, { useState } from 'react';

const TutorProfileForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
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

  const availableSubjects = [
    'Algebra', 'Geometry', 'Calculus', 'Statistics', 'Physics',
    'Chemistry', 'Biology', 'English', 'History', 'Computer Science',
    'SAT/ACT Math', 'AP Calculus', 'AP Physics', 'AP Chemistry'
  ];

  const teachingLevels = [
    'Elementary', 'Middle School', 'High School', 'College', 'Graduate'
  ];

  const teachingMethods = [
    'One-on-One', 'Group Sessions', 'Online Classes', 'In-Person', 'Homework Help'
  ];

  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '' }]
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="e.g., Mathematics & Physics Tutor"
        />
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio/About Me *
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent h-32 resize-none"
          placeholder="Tell students about yourself, your teaching philosophy, and what makes you unique..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Languages Spoken
        </label>
        <div className="flex flex-wrap gap-2">
          {languageOptions.map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => handleArrayToggle('languages', language)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 ${
                formData.languages.includes(language)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {language}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Education & Qualifications</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience *
          </label>
          <input
            type="number"
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="e.g., 5"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hourly Rate (USD) *
          </label>
          <input
            type="number"
            value={formData.hourlyRate}
            onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="e.g., 65"
            min="0"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Education</h3>
          <button
            type="button"
            onClick={addEducation}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Add Education
          </button>
        </div>

        {formData.education.map((edu, index) => (
          <div key={index} className="border border-gray-200 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Degree/Certification
                </label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="e.g., Ph.D. in Applied Mathematics"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution
                </label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="e.g., MIT"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => updateEducation(index, 'year', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="e.g., 2015"
                  />
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {formData.education.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No education added yet. Click "Add Education" to get started.
          </div>
        )}
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableSubjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => handleArrayToggle('subjects', subject)}
              className={`p-3 text-sm font-medium rounded-lg border-2 transition duration-200 ${
                formData.subjects.includes(subject)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Teaching Levels
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {teachingLevels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => handleArrayToggle('teachingLevels', level)}
              className={`p-3 text-sm font-medium rounded-lg border-2 transition duration-200 ${
                formData.teachingLevels.includes(level)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Teaching Methods
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {teachingMethods.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => handleArrayToggle('teachingMethods', method)}
              className={`p-3 text-sm font-medium rounded-lg border-2 transition duration-200 ${
                formData.teachingMethods.includes(method)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Availability & Contact</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location/Area
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="e.g., Bay Area, CA or Remote"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Teaching Preferences</h3>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="online"
            checked={formData.onlineTeaching}
            onChange={(e) => handleInputChange('onlineTeaching', e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="online" className="text-gray-700">
            Online Teaching
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="inperson"
            checked={formData.inPersonTeaching}
            onChange={(e) => handleInputChange('inPersonTeaching', e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="inperson" className="text-gray-700">
            In-Person Teaching
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Typical Response Time (hours)
        </label>
        <select
          value={formData.responseTime}
          onChange={(e) => handleInputChange('responseTime', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        >
          <option value="1">Within 1 hour</option>
          <option value="2">Within 2 hours</option>
          <option value="4">Within 4 hours</option>
          <option value="12">Within 12 hours</option>
          <option value="24">Within 24 hours</option>
        </select>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">Weekly Availability</h4>
        <p className="text-sm text-gray-600 mb-4">
          This can be updated later in your profile settings
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Weekdays:</strong> Flexible scheduling available
          </div>
          <div>
            <strong>Weekends:</strong> Limited availability
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Review Your Profile</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-800">Personal Information</h3>
            <p className="text-gray-600">{formData.firstName} {formData.lastName}</p>
            <p className="text-gray-600">{formData.title}</p>
            <p className="text-gray-600">{formData.email}</p>
            <p className="text-gray-600">{formData.phone}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800">Professional Details</h3>
            <p className="text-gray-600">${formData.hourlyRate}/hour</p>
            <p className="text-gray-600">{formData.experience} years experience</p>
            <p className="text-gray-600">Education: {formData.education.length} entries</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800">Subjects ({formData.subjects.length})</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.subjects.map((subject) => (
              <span key={subject} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {subject}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800">Teaching Preferences</h3>
          <p className="text-gray-600">
            {formData.onlineTeaching && 'Online'} 
            {formData.onlineTeaching && formData.inPersonTeaching && ' & '}
            {formData.inPersonTeaching && 'In-Person'}
          </p>
          <p className="text-gray-600">Response time: Within {formData.responseTime} hours</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800">Bio</h3>
          <p className="text-gray-600">{formData.bio || 'No bio provided'}</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Next Steps</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Your profile will be reviewed by our team</li>
          <li>• You'll receive an email confirmation within 24 hours</li>
          <li>• You can edit your profile anytime from your dashboard</li>
          <li>• Start receiving student inquiries once approved</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your Tutor Profile</h1>
            <p className="text-gray-600">Step {currentStep} of {totalSteps}</p>
          </div>

          {renderStepIndicator()}

          <div className="space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}

            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-200"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition duration-200"
                >
                  Create Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfileForm;