import React, { useState } from 'react';
import Navbar  from '../components/Navbar';
const EditableTutorProfile = () => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [editMode, setEditMode] = useState({
    basic: false,
    about: false,
    subjects: false,
    qualifications: false,
    contact: false,
    availability: false,
    pricing: false
  });

  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
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
  const [aboutMe, setAboutMe] = useState({
    intro: "Welcome! I'm Dr. Sarah Martinez, a dedicated mathematics and physics tutor with over 8 years of teaching experience. I hold a Ph.D. in Applied Mathematics from MIT and have worked with students from middle school to university level.",
    philosophy: "My teaching philosophy centers on understanding each student's unique learning style and adapting my approach accordingly. I believe that with the right guidance and practice, any student can master mathematics and physics concepts.",
    personal: "When I'm not teaching, I enjoy hiking, reading science fiction novels, and working on mathematical puzzles. I'm fluent in English, Spanish, and French."
  });

  // Subjects State
  const [subjects, setSubjects] = useState([
    'Algebra', 'Geometry', 'Calculus', 'Statistics', 
    'Physics', 'SAT/ACT Math', 'AP Calculus', 'AP Physics'
  ]);
  const [newSubject, setNewSubject] = useState('');

  // Qualifications State
  const [qualifications, setQualifications] = useState([
    {
      degree: 'Ph.D. in Applied Mathematics',
      institution: 'Massachusetts Institute of Technology (MIT)',
      year: '2015'
    },
    {
      degree: 'M.S. in Mathematics Education',
      institution: 'Stanford University',
      year: '2012'
    },
    {
      degree: 'B.S. in Mathematics',
      institution: 'University of California, Berkeley',
      year: '2010'
    },
    {
      degree: 'Certified Tutor',
      institution: 'National Tutoring Association',
      year: '2016'
    }
  ]);

  // Contact Info State
  const [contactInfo, setContactInfo] = useState({
    email: 'sarah.martinez@email.com',
    phone: '+1 (555) 123-4567',
    location: 'Online & In-Person (Bay Area)',
    responseTime: 'Responds within 2 hours'
  });

  // Pricing State
  const [pricing, setPricing] = useState({
    hourlyRate: 65
  });

  // Availability State
  const [timeSlots, setTimeSlots] = useState([
    { day: 'Mon', time: '3-5 PM', available: true },
    { day: 'Tue', time: '10-12 PM', available: false },
    { day: 'Wed', time: '2-4 PM', available: true },
    { day: 'Thu', time: '1-3 PM', available: true },
    { day: 'Fri', time: '4-6 PM', available: false },
    { day: 'Sat', time: '10-12 PM', available: true },
    { day: 'Sun', time: '2-4 PM', available: true },
  ]);

  const reviews = [
    {
      name: 'Emily R.',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Dr. Martinez helped me improve my calculus grade from a C to an A! Her explanations are clear and she\'s incredibly patient. Highly recommend!'
    },
    {
      name: 'Michael T.',
      rating: 5,
      date: '1 month ago',
      comment: 'Amazing tutor! She made physics concepts that seemed impossible actually make sense. My test scores have improved dramatically.'
    },
    {
      name: 'Jessica L.',
      rating: 5,
      date: '2 months ago',
      comment: 'Dr. Martinez is fantastic! She helped me prepare for the SAT math section and I scored a 780. Her teaching methods are excellent.'
    }
  ];

  const toggleEditMode = (section) => {
    setEditMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleBasicInfoChange = (field, value) => {
    setBasicInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAboutMeChange = (field, value) => {
    setAboutMe(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSubject = () => {
    if (newSubject.trim()) {
      setSubjects(prev => [...prev, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const removeSubject = (index) => {
    setSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const addQualification = () => {
    setQualifications(prev => [...prev, {
      degree: '',
      institution: '',
      year: ''
    }]);
  };

  const updateQualification = (index, field, value) => {
    setQualifications(prev => prev.map((qual, i) => 
      i === index ? { ...qual, [field]: value } : qual
    ));
  };

  const removeQualification = (index) => {
    setQualifications(prev => prev.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index, field, value) => {
    setTimeSlots(prev => prev.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  const addTimeSlot = () => {
    setTimeSlots(prev => [...prev, {
      day: '',
      time: '',
      available: true
    }]);
  };

  const removeTimeSlot = (index) => {
    setTimeSlots(prev => prev.filter((_, i) => i !== index));
  };

  const handleBooking = (type) => {
    if (type === 'session') {
      alert('Redirecting to booking calendar...');
    } else {
      alert('Setting up your free trial lesson...');
    }
  };

  const handleTimeSlotClick = (slot) => {
    if (slot.available) {
      setSelectedTimeSlot(slot);
      alert(`Selected time slot: ${slot.day} ${slot.time}`);
    }
  };

  const EditButton = ({ section, className = "" }) => (
    <button
      onClick={() => toggleEditMode(section)}
      className={`text-blue-600 hover:text-blue-800 transition duration-200 ${className}`}
    >
      {editMode[section] ? '✅ Save' : '✏️ Edit'}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-6xl mx-auto p-5">
        {/* Header Section */}
        <div className="bg-blue-600 text-white p-10 rounded-2xl mb-8">
          <div className="flex justify-end mb-4">
            <EditButton section="basic" className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center md:text-left">
              <img 
                src="/api/placeholder/200/200" 
                alt={basicInfo.name}
                className="w-48 h-48 rounded-full border-4 border-white border-opacity-30 mx-auto md:mx-0 object-cover"
              />
            </div>
            <div className="md:col-span-2 text-center md:text-left">
              {editMode.basic ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={basicInfo.name}
                    onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                    className="w-full text-4xl font-bold bg-transparent border-b-2 border-white border-opacity-50 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-opacity-100"
                    placeholder="Your Name"
                  />
                  <input
                    type="text"
                    value={basicInfo.title}
                    onChange={(e) => handleBasicInfoChange('title', e.target.value)}
                    className="w-full text-xl bg-transparent border-b-2 border-white border-opacity-50 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-opacity-100"
                    placeholder="Your Title"
                  />
                  <textarea
                    value={basicInfo.description}
                    onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                    className="w-full bg-transparent border-2 border-white border-opacity-50 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-opacity-100 p-3 rounded"
                    rows="3"
                    placeholder="Brief description about yourself"
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <input
                        type="number"
                        value={basicInfo.studentsTaught}
                        onChange={(e) => handleBasicInfoChange('studentsTaught', parseInt(e.target.value))}
                        className="w-full text-center text-3xl font-bold bg-transparent border-b-2 border-white border-opacity-50 text-white focus:outline-none focus:border-opacity-100"
                      />
                      <span className="text-sm opacity-90">Students Taught</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={basicInfo.successRate}
                        onChange={(e) => handleBasicInfoChange('successRate', parseInt(e.target.value))}
                        className="w-full text-center text-3xl font-bold bg-transparent border-b-2 border-white border-opacity-50 text-white focus:outline-none focus:border-opacity-100"
                      />
                      <span className="text-sm opacity-90">Success Rate %</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={basicInfo.experience}
                        onChange={(e) => handleBasicInfoChange('experience', parseInt(e.target.value))}
                        className="w-full text-center text-3xl font-bold bg-transparent border-b-2 border-white border-opacity-50 text-white focus:outline-none focus:border-opacity-100"
                      />
                      <span className="text-sm opacity-90">Years Experience</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-bold mb-2">{basicInfo.name}</h1>
                  <h2 className="text-xl opacity-90 mb-4">{basicInfo.title}</h2>
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    <span className="text-yellow-300 text-2xl">★★★★★</span>
                    <span className="text-lg">{basicInfo.rating}/5 ({basicInfo.totalReviews} reviews)</span>
                  </div>
                  <p className="text-lg opacity-90 mb-6">{basicInfo.description}</p>
                  
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <span className="text-3xl font-bold block">{basicInfo.studentsTaught}+</span>
                      <span className="text-sm opacity-90">Students Taught</span>
                    </div>
                    <div>
                      <span className="text-3xl font-bold block">{basicInfo.successRate}%</span>
                      <span className="text-sm opacity-90">Success Rate</span>
                    </div>
                    <div>
                      <span className="text-3xl font-bold block">{basicInfo.experience}</span>
                      <span className="text-sm opacity-90">Years Experience</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* About Me */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-blue-600 pb-2 border-b-2 border-gray-100">
                  About Me
                </h3>
                <EditButton section="about" />
              </div>
              {editMode.about ? (
                <div className="space-y-4">
                  <textarea
                    value={aboutMe.intro}
                    onChange={(e) => handleAboutMeChange('intro', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Introduction paragraph"
                  />
                  <textarea
                    value={aboutMe.philosophy}
                    onChange={(e) => handleAboutMeChange('philosophy', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Teaching philosophy"
                  />
                  <textarea
                    value={aboutMe.personal}
                    onChange={(e) => handleAboutMeChange('personal', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Personal interests"
                  />
                </div>
              ) : (
                <div className="space-y-4 text-gray-700">
                  <p>{aboutMe.intro}</p>
                  <p>{aboutMe.philosophy}</p>
                  <p>{aboutMe.personal}</p>
                </div>
              )}
            </div>

            {/* Subjects */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-blue-600 pb-2 border-b-2 border-gray-100">
                  Subjects I Teach
                </h3>
                <EditButton section="subjects" />
              </div>
              {editMode.subjects ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Add new subject"
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addSubject}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject, index) => (
                      <span 
                        key={index}
                        className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                      >
                        {subject}
                        <button
                          onClick={() => removeSubject(index)}
                          className="text-white hover:text-red-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {subjects.map((subject, index) => (
                    <span 
                      key={index}
                      className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Education & Qualifications */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-blue-600 pb-2 border-b-2 border-gray-100">
                  Education & Qualifications
                </h3>
                <EditButton section="qualifications" />
              </div>
              {editMode.qualifications ? (
                <div className="space-y-4">
                  <button
                    onClick={addQualification}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Qualification
                  </button>
                  {qualifications.map((qual, index) => (
                    <div key={index} className="border border-gray-200 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <input
                          type="text"
                          value={qual.degree}
                          onChange={(e) => updateQualification(index, 'degree', e.target.value)}
                          placeholder="Degree"
                          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={qual.institution}
                          onChange={(e) => updateQualification(index, 'institution', e.target.value)}
                          placeholder="Institution"
                          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={qual.year}
                          onChange={(e) => updateQualification(index, 'year', e.target.value)}
                          placeholder="Year"
                          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => removeQualification(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {qualifications.map((qual, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-4">
                      <h4 className="font-semibold text-gray-800">{qual.degree}</h4>
                      <p className="text-gray-600 text-sm">{qual.institution} • {qual.year}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-2xl font-semibold text-blue-600 mb-4 pb-2 border-b-2 border-gray-100">
                Recent Reviews
              </h3>
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="border border-gray-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-800">{review.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                        <span className="text-gray-500 text-sm">{review.date}</span>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm text-center sticky top-5">
              <div className="flex justify-between items-center mb-4">
                <div></div>
                <EditButton section="pricing" />
              </div>
              
              {editMode.pricing ? (
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">$</span>
                    <input
                      type="number"
                      value={pricing.hourlyRate}
                      onChange={(e) => setPricing({...pricing, hourlyRate: parseInt(e.target.value)})}
                      className="text-4xl font-bold text-blue-600 w-20 text-center border-b-2 border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="text-gray-600 mt-1">per hour</div>
                </div>
              ) : (
                <>
                  <div className="text-4xl font-bold text-blue-600 mb-1">${pricing.hourlyRate}</div>
                  <div className="text-gray-600 mb-6">per hour</div>
                </>
              )}
              
              <div className="space-y-3 mb-6">
                <button 
                  onClick={() => handleBooking('session')}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-full font-semibold hover:bg-blue-700 transition duration-200"
                >
                  Book a Session
                </button>
                <button 
                  onClick={() => handleBooking('trial')}
                  className="w-full border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition duration-200"
                >
                  Free Trial Lesson
                </button>
              </div>

              {/* Contact Info */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">Contact Info</h4>
                  <EditButton section="contact" />
                </div>
                
                {editMode.contact ? (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Email"
                    />
                    <input
                      type="text"
                      value={contactInfo.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Phone"
                    />
                    <input
                      type="text"
                      value={contactInfo.location}
                      onChange={(e) => handleContactChange('location', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Location"
                    />
                    <input
                      type="text"
                      value={contactInfo.responseTime}
                      onChange={(e) => handleContactChange('responseTime', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Response Time"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span>📧</span>
                      <span>{contactInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span>📱</span>
                      <span>{contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span>🌍</span>
                      <span>{contactInfo.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span>💬</span>
                      <span>{contactInfo.responseTime}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">This Week's Availability</h4>
                  <EditButton section="availability" />
                </div>
                
                {editMode.availability ? (
                  <div className="space-y-3">
                    <button
                      onClick={addTimeSlot}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Add Time Slot
                    </button>
                    {timeSlots.map((slot, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 items-center">
                        <input
                          type="text"
                          value={slot.day}
                          onChange={(e) => updateTimeSlot(index, 'day', e.target.value)}
                          className="p-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Day"
                        />
                        <input
                          type="text"
                          value={slot.time}
                          onChange={(e) => updateTimeSlot(index, 'time', e.target.value)}
                          className="p-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Time"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={slot.available}
                            onChange={(e) => updateTimeSlot(index, 'available', e.target.checked)}
                            className="text-blue-600"
                          />
                          <button
                            onClick={() => removeTimeSlot(index)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-2">
                      {timeSlots.map((slot, index) => (
                        <div 
                          key={index}
                          onClick={() => handleTimeSlotClick(slot)}
                          className={`p-2 rounded text-sm text-center cursor-pointer transition duration-200 ${
                            slot.available 
                              ? 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {slot.day} {slot.time}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      Blue slots are available for booking
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default EditableTutorProfile;
