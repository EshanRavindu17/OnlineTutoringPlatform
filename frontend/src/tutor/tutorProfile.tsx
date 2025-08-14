import { useState } from 'react';
import Navbar from '../components/Navbar';

interface EditMode {
  basic: boolean;
  about: boolean;
  subjects: boolean;
  qualifications: boolean;
  contact: boolean;
  availability: boolean;
  pricing: boolean;
}

interface BasicInfo {
  name: string;
  title: string;
  rating: number;
  totalReviews: number;
  description: string;
  studentsTaught: number;
  successRate: number;
  experience: number;
}

interface AboutMe {
  intro: string;
  philosophy: string;
  personal: string;
}

interface Subject {
  id: number;
  name: string;
  level: string;
  price: number;
  description: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  timezone: string;
  languages: string[];
  responseTime: string;
}

const EditableTutorProfile = () => {
  const [editMode, setEditMode] = useState<EditMode>({
    basic: false,
    about: false,
    subjects: false,
    qualifications: false,
    contact: false,
    availability: false,
    pricing: false
  });

  // Basic Info State
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: 'Dr. Sarah Martinez',
    title: 'Mathematics & Physics Tutor',
    rating: 4.9,
    totalReviews: 127,
    description: 'Passionate educator with 8+ years of experience helping students excel in mathematics and physics. Specializing in making complex concepts accessible and engaging.',
    studentsTaught: 500,
    successRate: 95,
    experience: 8
  });

  // About Me State
  const [aboutMe, setAboutMe] = useState<AboutMe>({
    intro: "Welcome! I'm Dr. Sarah Martinez, a dedicated mathematics and physics tutor with over 8 years of teaching experience. I hold a Ph.D. in Applied Mathematics from MIT and have worked with students from middle school to university level.",
    philosophy: "My teaching philosophy centers on understanding each student's unique learning style and adapting my approach accordingly. I believe that with the right guidance and practice, any student can master mathematics and physics concepts.",
    personal: "When I'm not teaching, I enjoy hiking, reading science fiction novels, and working on mathematical puzzles. I'm fluent in English, Spanish, and French."
  });

  // Subjects State
  const subjects: Subject[] = [
    { id: 1, name: 'Algebra', level: 'High School', price: 50, description: 'From basic algebra to advanced polynomial equations' },
    { id: 2, name: 'Calculus', level: 'College', price: 65, description: 'Differential and integral calculus, limits, and series' },
    { id: 3, name: 'Physics', level: 'All Levels', price: 60, description: 'Mechanics, thermodynamics, electromagnetism, and quantum physics' },
    { id: 4, name: 'SAT Math', level: 'High School', price: 55, description: 'Comprehensive SAT math preparation and test strategies' }
  ];

  // Contact Info State
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'sarah.martinez@tutorly.com',
    phone: '+1 (555) 123-4567',
    location: 'Boston, MA',
    timezone: 'EST (UTC-5)',
    languages: ['English', 'Spanish', 'French'],
    responseTime: 'Within 2 hours'
  });

  const toggleEditMode = (section: keyof EditMode): void => {
    setEditMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleBasicInfoChange = (field: keyof BasicInfo, value: any): void => {
    setBasicInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAboutMeChange = (field: keyof AboutMe, value: string): void => {
    setAboutMe(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (field: keyof ContactInfo, value: any): void => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-lg ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white">
            <div className="flex items-center space-x-6">
              <img
                src="/api/placeholder/120/120"
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                {editMode.basic ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={basicInfo.name}
                      onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                      className="w-full px-3 py-2 text-gray-900 rounded-md"
                      placeholder="Full Name"
                    />
                    <input
                      type="text"
                      value={basicInfo.title}
                      onChange={(e) => handleBasicInfoChange('title', e.target.value)}
                      className="w-full px-3 py-2 text-gray-900 rounded-md"
                      placeholder="Professional Title"
                    />
                    <textarea
                      value={basicInfo.description}
                      onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                      className="w-full px-3 py-2 text-gray-900 rounded-md"
                      rows={3}
                      placeholder="Brief Description"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold mb-2">{basicInfo.name}</h1>
                    <p className="text-xl text-blue-100 mb-4">{basicInfo.title}</p>
                    <p className="text-blue-50 mb-4">{basicInfo.description}</p>
                  </>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {renderStars(basicInfo.rating)}
                    <span className="ml-2 text-lg font-semibold">{basicInfo.rating}</span>
                    <span className="ml-1 text-blue-100">({basicInfo.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => toggleEditMode('basic')}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all"
              >
                {editMode.basic ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="px-8 py-6 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{basicInfo.studentsTaught}</div>
                <div className="text-gray-600">Students Taught</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{basicInfo.successRate}%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{basicInfo.experience}</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Me Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">About Me</h2>
                <button
                  onClick={() => toggleEditMode('about')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  {editMode.about ? 'Save' : 'Edit'}
                </button>
              </div>
              
              {editMode.about ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Introduction</label>
                    <textarea
                      value={aboutMe.intro}
                      onChange={(e) => handleAboutMeChange('intro', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Philosophy</label>
                    <textarea
                      value={aboutMe.philosophy}
                      onChange={(e) => handleAboutMeChange('philosophy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Personal Interests</label>
                    <textarea
                      value={aboutMe.personal}
                      onChange={(e) => handleAboutMeChange('personal', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Introduction</h3>
                    <p className="text-gray-700 leading-relaxed">{aboutMe.intro}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Teaching Philosophy</h3>
                    <p className="text-gray-700 leading-relaxed">{aboutMe.philosophy}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Interests</h3>
                    <p className="text-gray-700 leading-relaxed">{aboutMe.personal}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Subjects Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Subjects I Teach</h2>
                <button
                  onClick={() => toggleEditMode('subjects')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  {editMode.subjects ? 'Save' : 'Edit'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map(subject => (
                  <div key={subject.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                      <span className="text-lg font-bold text-blue-600">${subject.price}/hr</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{subject.level}</p>
                    <p className="text-gray-700 text-sm">{subject.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Contact Info</h3>
                <button
                  onClick={() => toggleEditMode('contact')}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-sm"
                >
                  {editMode.contact ? 'Save' : 'Edit'}
                </button>
              </div>
              
              {editMode.contact ? (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    value={contactInfo.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone"
                  />
                  <input
                    type="text"
                    value={contactInfo.location}
                    onChange={(e) => handleContactChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Location"
                  />
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Email:</span>
                    <span className="ml-2 text-gray-700">{contactInfo.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Phone:</span>
                    <span className="ml-2 text-gray-700">{contactInfo.phone}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Location:</span>
                    <span className="ml-2 text-gray-700">{contactInfo.location}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Timezone:</span>
                    <span className="ml-2 text-gray-700">{contactInfo.timezone}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Languages:</span>
                    <span className="ml-2 text-gray-700">{contactInfo.languages.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Response Time:</span>
                    <span className="ml-2 text-gray-700">{contactInfo.responseTime}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all">
                  Schedule a Session
                </button>
                <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all">
                  Send Message
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all">
                  View Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditableTutorProfile;
